import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import yahooFinance from 'yahoo-finance2'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 8787
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))
app.use('/api/', rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }))

// Daftar emiten utama IDX (LQ45 / Blue Chip) untuk Screener, Movers & Sentiment
const IDX_WATCHLIST = [
  'BBCA', 'BBRI', 'BMRI', 'BBNI', 'BRIS', 'TLKM', 'ASII', 'GOTO', 'AMMN', 'BREN',
  'TPIA', 'BYAN', 'ADRO', 'PTBA', 'ITMG', 'UNTR', 'INDF', 'ICBP', 'KLBF', 'UNVR',
  'CPIN', 'JPFA', 'PGAS', 'AKRA', 'MEDC', 'ANTM', 'INCO', 'MDKA', 'MBMA', 'NCKL',
  'SMGR', 'INTP', 'JSMR', 'EXCL', 'ISAT', 'MTEL', 'TOWR', 'TBIG', 'MAPI', 'ACES',
  'AMRT', 'MIDI', 'SIDO', 'MYOR', 'INKP', 'TKIM', 'CTRA', 'BSDE', 'PWON', 'SMRA'
]

function toJkTicker(ticker) {
  const clean = String(ticker || '').toUpperCase().trim().replace(/\.JK$/, '')
  return `${clean}.JK`
}

function normalizeYahooQuote(q) {
  const symbol = String(q.symbol || '').replace(/\.JK$/, '')
  const price = Number(q.regularMarketPrice ?? NaN)
  const changePercent = Number(q.regularMarketChangePercent ?? NaN)
  const volume = Number(q.regularMarketVolume ?? NaN)
  const value = Number.isFinite(price) && Number.isFinite(volume) ? price * volume : NaN
  return {
    symbol,
    name: q.longName || q.shortName || symbol,
    price,
    changePercent,
    volume,
    value,
    raw: q
  }
}

// Cache sederhana 60 detik agar tidak terkena limit Yahoo Finance
let watchlistCache = { data: [], updatedAt: 0 }
async function getIdxWatchlistQuotes() {
  const now = Date.now()
  if (watchlistCache.data.length > 0 && now - watchlistCache.updatedAt < 60_000) {
    return watchlistCache
  }
  const jkSymbols = IDX_WATCHLIST.map(toJkTicker)
  const quotes = await yahooFinance.quote(jkSymbols)
  const list = (Array.isArray(quotes) ? quotes : [quotes])
    .filter(Boolean)
    .map(normalizeYahooQuote)
    .filter(x => x.symbol && Number.isFinite(x.price))
  watchlistCache = { data: list, updatedAt: now }
  return watchlistCache
}

app.get('/api/health', (req, res) => res.json({
  ok: true,
  providerConfigured: true,
  aiConfigured: Boolean(process.env.OPENAI_API_KEY),
  provider: 'Yahoo Finance IDX (.JK)',
  serverTime: new Date().toISOString()
}))

app.get('/api/market/screener', async (req, res) => {
  try {
    const cache = await getIdxWatchlistQuotes()
    let items = [...cache.data]
    const q = String(req.query.q || '').toLowerCase()
    if (q) items = items.filter(x => `${x.symbol} ${x.name}`.toLowerCase().includes(q))

    const sort = String(req.query.sort || 'change')
    const field = sort === 'price' ? 'price' : sort === 'volume' ? 'volume' : sort === 'value' ? 'value' : 'changePercent'
    items.sort((a, b) => (Number(b[field]) || 0) - (Number(a[field]) || 0))

    res.json({
      items,
      updatedAt: new Date(cache.updatedAt).toISOString(),
      mode: 'live-delayed',
      source: 'Yahoo Finance IDX'
    })
  } catch (e) { res.status(503).json({ error: e.message }) }
})

app.get('/api/market/movers', async (req, res) => {
  try {
    const cache = await getIdxWatchlistQuotes()
    const items = [...cache.data].sort((a, b) => Math.abs(b.changePercent || 0) - Math.abs(a.changePercent || 0))
    res.json({ items, updatedAt: new Date(cache.updatedAt).toISOString() })
  } catch (e) { res.status(503).json({ error: e.message }) }
})

app.get('/api/market/price/:ticker', async (req, res) => {
  try {
    const q = await yahooFinance.quote(toJkTicker(req.params.ticker))
    res.json({ data: normalizeYahooQuote(q), updatedAt: new Date().toISOString() })
  } catch (e) { res.status(503).json({ error: e.message }) }
})

app.get('/api/market/fundamentals/:ticker', async (req, res) => {
  try {
    const summary = await yahooFinance.quoteSummary(toJkTicker(req.params.ticker), {
      modules: ['summaryDetail', 'defaultKeyStatistics', 'financialData', 'assetProfile']
    })
    res.json({ data: summary, updatedAt: new Date().toISOString() })
  } catch (e) { res.status(503).json({ error: e.message }) }
})

app.get('/api/market/history/:ticker', async (req, res) => {
  try {
    const intervalMap = { '1D': '1d', '1W': '1wk', '1M': '1mo' }
    const interval = intervalMap[String(req.query.interval || '1D').toUpperCase()] || '1d'
    const period1 = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) // 6 bulan terakhir
    const chart = await yahooFinance.chart(toJkTicker(req.params.ticker), { period1, interval })
    res.json({ data: chart?.quotes || [], updatedAt: new Date().toISOString() })
  } catch (e) { res.status(503).json({ error: e.message }) }
})

app.get('/api/market/sentiment', async (req, res) => {
  try {
    const cache = await getIdxWatchlistQuotes()
    const stocks = cache.data.filter(x => Number.isFinite(x.changePercent))
    const advancing = stocks.filter(x => x.changePercent > 0).length
    const declining = stocks.filter(x => x.changePercent < 0).length
    const unchanged = stocks.length - advancing - declining
    const score = stocks.length ? Math.round(100 * (advancing + 0.5 * unchanged) / stocks.length) : null
    const label = score === null ? 'Data belum tersedia' : score < 20 ? 'Extreme Fear' : score < 40 ? 'Fear' : score < 60 ? 'Neutral' : score < 80 ? 'Greed' : 'Extreme Greed'
    res.json({
      score,
      label,
      advancing,
      declining,
      unchanged,
      sampleSize: stocks.length,
      updatedAt: new Date(cache.updatedAt).toISOString(),
      method: 'market breadth proxy (IDX50)',
      note: 'Bukan CNN Fear & Greed Index.'
    })
  } catch (e) { res.status(503).json({ error: e.message }) }
})

app.post('/api/agent/chat', async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return res.status(503).json({ error: 'OPENAI_API_KEY belum dikonfigurasi pada backend.' })

    const { agent = 'Financial Tutor', messages = [] } = req.body || {}
    const safeMessages = messages.filter(m => ['user', 'assistant'].includes(m.role) && typeof m.content === 'string').slice(-12)
    const system = `Kamu adalah ${agent}, AI edukasi DigiVest. Jawab dalam Bahasa Indonesia yang jelas dan tidak berlebihan. Fokus pada literasi keuangan dan edukasi pasar modal. Jangan mengklaim data real-time kecuali ada data bertimestamp yang diberikan. Jangan memberi instruksi personal untuk membeli/menjual saham, jangan menjanjikan keuntungan, dan jelaskan risiko serta keterbatasan. Jika diminta menganalisis emiten, minta data terbaru atau nyatakan bahwa kamu tidak memiliki feed pasar langsung dalam konteks ini.`

    const defaultBase = apiKey.startsWith('AQ.')
      ? 'https://aiplatform.googleapis.com/v1/publishers/google/openapi'
      : 'https://generativelanguage.googleapis.com/v1beta/openai'
    const base = (process.env.OPENAI_BASE_URL || defaultBase).replace(/\/$/, '')

    const response = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gemini-2.5-flash',
        messages: [{ role: 'system', content: system }, ...safeMessages],
        temperature: 0.4
      }),
      signal: AbortSignal.timeout(30000)
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error?.message || `AI provider error ${response.status}`)
    res.json({ reply: data.choices?.[0]?.message?.content || 'Maaf, belum ada jawaban yang tersedia.' })
  } catch (e) { res.status(503).json({ error: e.message }) }
})

app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan' }))

// Produksi: sajikan hasil `npm run build` dari server yang sama (tanpa masalah CORS)
const dist = path.resolve(__dirname, '../dist')
if (fs.existsSync(dist)) {
  app.use(express.static(dist))
  app.get(/^\/(?!api\/).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')))
}

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.type === 'entity.parse.failed' ? 'JSON tidak valid' : 'Terjadi kesalahan pada server' })
})

app.listen(PORT, () => console.log(`DigiVest API server listening on http://localhost:${PORT}`))