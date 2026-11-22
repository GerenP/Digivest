import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app=express()
const PORT=process.env.PORT||8787
app.use(cors({origin:process.env.CLIENT_ORIGIN||'http://localhost:5173'}))
app.use(express.json({limit:'1mb'}))
app.use('/api/',rateLimit({windowMs:60_000,limit:120,standardHeaders:true,legacyHeaders:false}))

const BASE=(process.env.IDX_PROVIDER_BASE_URL||'https://stock.arjum.com').replace(/\/$/,'')
const KEY=process.env.IDX_PROVIDER_API_KEY
const configured=Boolean(KEY && !KEY.includes('PASTE_'))

async function provider(path){
 if(!configured) throw new Error('IDX market data provider belum dikonfigurasi. Isi IDX_PROVIDER_API_KEY pada file .env.')
 const response=await fetch(`${BASE}${path}`,{headers:{'X-API-Key':KEY,'Accept':'application/json'},signal:AbortSignal.timeout(12000)})
 const body=await response.json().catch(()=>({}))
 if(!response.ok) throw new Error(body.message||body.error||`Provider error ${response.status}`)
 return body
}
function unwrap(obj){return obj?.data??obj?.results??obj?.items??obj}
function listFrom(obj){const v=unwrap(obj);if(Array.isArray(v))return v;for(const k of ['data','items','results','stocks','screener','rows'])if(Array.isArray(v?.[k]))return v[k];return []}
function normalizeStock(r){
 const price=Number(r.price??r.last_price??r.lastPrice??r.close??r.last??NaN)
 const change=Number(r.change_percent??r.changePercent??r.pct_change??r.change_pct??r.percent_change??NaN)
 return {symbol:r.symbol??r.code??r.ticker??r.secCode??r.stock_code,name:r.name??r.company_name??r.companyName??r.issuer_name??'',price,changePercent:change,volume:Number(r.volume??r.total_volume??NaN),value:Number(r.value??r.turnover??r.trade_value??NaN),raw:r}
}
app.get('/api/health',(req,res)=>res.json({ok:true,providerConfigured:configured,aiConfigured:Boolean(process.env.OPENAI_API_KEY),provider:configured?'IDX provider configured':'not configured',serverTime:new Date().toISOString()}))

app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.get('/api/market/screener',async(req,res)=>{
 try{
  const raw=await provider('/api/screener/latest')
  let items=listFrom(raw).map(normalizeStock).filter(x=>x.symbol)
  const q=String(req.query.q||'').toLowerCase()
  if(q)items=items.filter(x=>`${x.symbol} ${x.name}`.toLowerCase().includes(q))
  const pattern=String(req.query.pattern||'')
  if(pattern && Array.isArray(raw?.data)) {
    // Pattern matching is only applied if the provider returns a matching signal field.
    const hasSignal=items.some(x=>x.raw.pattern||x.raw.signal||x.raw.strategy)
    if(hasSignal)items=items.filter(x=>[x.raw.pattern,x.raw.signal,x.raw.strategy].includes(pattern))
  }
  const sort=String(req.query.sort||'change')
  const field=sort==='price'?'price':sort==='volume'?'volume':sort==='value'?'value':'changePercent'
  items.sort((a,b)=>(Number(b[field])||0)-(Number(a[field])||0))
  res.json({items,updatedAt:raw.updated_at??raw.timestamp??new Date().toISOString(),mode:raw.mode??raw.data_status??'provider',source:'configured IDX provider'})
 }catch(e){res.status(503).json({error:e.message})}
})

app.get('/api/market/movers',async(req,res)=>{
 try{const raw=await provider('/api/movers');res.json({items:listFrom(raw).map(normalizeStock),updatedAt:raw.updated_at??raw.timestamp??new Date().toISOString()})}
 catch(e){res.status(503).json({error:e.message})}
})
app.get('/api/market/price/:ticker',async(req,res)=>{
 try{const raw=await provider(`/api/price/${encodeURIComponent(req.params.ticker.toUpperCase())}`);res.json({data:unwrap(raw),updatedAt:raw.updated_at??raw.timestamp??new Date().toISOString()})}
 catch(e){res.status(503).json({error:e.message})}
})
app.get('/api/market/fundamentals/:ticker',async(req,res)=>{
 try{const raw=await provider(`/api/financial-statements/${encodeURIComponent(req.params.ticker.toUpperCase())}`);res.json({data:unwrap(raw),updatedAt:raw.updated_at??raw.timestamp??new Date().toISOString()})}
 catch(e){res.status(503).json({error:e.message})}
})
app.get('/api/market/history/:ticker',async(req,res)=>{
 try{const raw=await provider(`/api/history/${encodeURIComponent(req.params.ticker.toUpperCase())}?interval=${encodeURIComponent(req.query.interval||'1D')}`);res.json({data:unwrap(raw),updatedAt:raw.updated_at??raw.timestamp??new Date().toISOString()})}
 catch(e){res.status(503).json({error:e.message})}
})
app.get('/api/market/sentiment',async(req,res)=>{
 try{
  const raw=await provider('/api/movers')
  const stocks=listFrom(raw).map(normalizeStock).filter(x=>Number.isFinite(x.changePercent))
  const advancing=stocks.filter(x=>x.changePercent>0).length
  const declining=stocks.filter(x=>x.changePercent<0).length
  const unchanged=stocks.length-advancing-declining
  const score=stocks.length?Math.round(100*(advancing+0.5*unchanged)/stocks.length):null
  const label=score===null?'Data belum tersedia':score<20?'Extreme Fear':score<40?'Fear':score<60?'Neutral':score<80?'Greed':'Extreme Greed'
  res.json({score,label,advancing,declining,unchanged,sampleSize:stocks.length,updatedAt:raw.updated_at??raw.timestamp??new Date().toISOString(),method:'market breadth proxy',note:'Bukan CNN Fear & Greed Index.'})
 }catch(e){res.status(503).json({error:e.message})}
})

app.post('/api/agent/chat',async(req,res)=>{
 try{
  if(!process.env.OPENAI_API_KEY) return res.status(503).json({error:'OPENAI_API_KEY belum dikonfigurasi pada backend.'})
  const {agent='Financial Tutor',messages=[]}=req.body||{}
  const safeMessages=messages.filter(m=>['user','assistant'].includes(m.role)&&typeof m.content==='string').slice(-12)
  const system=`Kamu adalah ${agent}, AI edukasi DigiVest. Jawab dalam Bahasa Indonesia yang jelas dan tidak berlebihan. Fokus pada literasi keuangan dan edukasi pasar modal. Jangan mengklaim data real-time kecuali ada data bertimestamp yang diberikan. Jangan memberi instruksi personal untuk membeli/menjual saham, jangan menjanjikan keuntungan, dan jelaskan risiko serta keterbatasan. Jika diminta menganalisis emiten, minta data terbaru atau nyatakan bahwa kamu tidak memiliki feed pasar langsung dalam konteks ini.`
  const base=(process.env.OPENAI_BASE_URL||'https://api.openai.com/v1').replace(/\/$/,'')
  const response=await fetch(`${base}/chat/completions`,{method:'POST',headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4.1-mini',messages:[{role:'system',content:system},...safeMessages],temperature:.4}),signal:AbortSignal.timeout(30000)})
  const data=await response.json().catch(()=>({}))
  if(!response.ok)throw new Error(data.error?.message||`AI provider error ${response.status}`)
  res.json({reply:data.choices?.[0]?.message?.content||'Maaf, belum ada jawaban yang tersedia.'})
 }catch(e){res.status(503).json({error:e.message})}
})

app.use('/api',(req,res)=>res.status(404).json({error:'Endpoint tidak ditemukan'}))
// Produksi: sajikan hasil `npm run build` dari server yang sama (tanpa masalah CORS)
const dist=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist')
if(fs.existsSync(dist)){
 app.use(express.static(dist))
 app.get(/^\/(?!api\/).*/,(req,res)=>res.sendFile(path.join(dist,'index.html')))
}
app.use((err,req,res,next)=>{res.status(err.status||500).json({error:err.type==='entity.parse.failed'?'JSON tidak valid':'Terjadi kesalahan pada server'})})

app.listen(PORT,()=>console.log(`DigiVest API server listening on http://localhost:${PORT}`))
