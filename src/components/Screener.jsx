import { useEffect, useMemo, useState } from 'react'
import { Activity, AlertTriangle, RefreshCw, Search, SlidersHorizontal, Wifi } from 'lucide-react'
import Section from './Section'
import { api } from '../lib/api'
import { PATTERNS, isAboveEma } from '../lib/market'
import { SNAPSHOT } from '../lib/snapshot'
import { compact, dateTime, percent, price } from '../lib/format'

const TABS = ['Teknikal', 'Fundamental', 'Fear & Greed', 'Price']
const MODE = { snapshot: ['CUPLIKAN PENUTUPAN', 'text-yellow-200'], live: ['LIVE', 'text-emerald-300'], delayed: ['DELAYED', 'text-yellow-200'], provider: ['DATA PROVIDER', 'text-emerald-300'] }
const COLS = {
  Teknikal: [['Emiten', 'code'], ['Harga', 'price'], ['Perubahan', 'change'], ['RSI', 'rsi'], ['EMA 20', 'ema'], ['Pola', 'pattern']],
  Fundamental: [['Emiten', 'code'], ['Harga', 'price'], ['PER', 'per'], ['PBV', 'pbv'], ['Yield', 'yld'], ['Sektor', 'sector']],
  'Fear & Greed': [['Emiten', 'code'], ['Harga', 'price'], ['Perubahan', 'change'], ['Arah', 'dir']],
  Price: [['Emiten', 'code'], ['Harga', 'price'], ['Perubahan', 'change'], ['Volume', 'volume'], ['Sektor', 'sector']],
}
const DEFAULT_SORT = { Teknikal: 'change', Fundamental: 'yld', 'Fear & Greed': 'change', Price: 'change' }
const chg = c => (c > 0 ? 'text-emerald-300' : c < 0 ? 'text-rose-300' : 'text-slate-400')
const dash = v => (v === null || v === undefined || v === '' ? '—' : v)
const n1 = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const num1 = (v, s = '') => (v === null || v === undefined ? '—' : `${n1.format(v)}${s}`)

function Cell({ col, row, head }) {
  if (head === 'Arah') return row.change === null ? '—' : <span className={`rounded-md px-2 py-1 ${row.change > 0 ? 'bg-emerald-400/10 text-emerald-300' : row.change < 0 ? 'bg-rose-400/10 text-rose-300' : 'bg-white/5 text-slate-400'}`}>{row.change > 0 ? 'Naik' : row.change < 0 ? 'Turun' : 'Tetap'}</span>
  switch (col) {
    case 'code': return <><b className="text-white">{row.code}</b><span className="mt-0.5 block max-w-[104px] truncate text-[10px] text-slate-500 sm:max-w-[200px]">{row.name}</span></>
    case 'price': return <span className="tabular-nums text-slate-200">{price(row.price, row.ccy)}</span>
    case 'change': return <span className={`font-semibold tabular-nums ${chg(row.change)}`}>{percent(row.change)}</span>
    case 'rsi': return row.rsi === null ? '—' : <span className={`rounded-md px-2 py-1 tabular-nums ${row.rsi < 30 ? 'bg-emerald-400/10 text-emerald-300' : row.rsi > 70 ? 'bg-amber-400/10 text-amber-300' : 'bg-white/5 text-slate-300'}`}>{row.rsi}</span>
    case 'per': return row.per === null ? '—' : row.per <= 0 ? <span className="text-rose-300">Rugi</span> : <span className="tabular-nums">{num1(row.per)}</span>
    case 'pbv': return <span className="tabular-nums">{num1(row.pbv)}</span>
    case 'yld': return <span className="tabular-nums">{num1(row.yld, '%')}</span>
    case 'volume': return <span className="tabular-nums text-slate-400">{compact(row.volume)}</span>
    case 'pattern': return row.pattern ? <span className="whitespace-nowrap rounded-full border border-violet-300/15 bg-violet-300/[.06] px-2.5 py-1 text-[10px] text-violet-200">{row.pattern}</span> : '—'
    default: return <span className="text-slate-400">{dash(row[col])}</span>
  }
}

export default function Screener({ market, onChart, request }) {
  const { rows, mode, updatedAt, error, loading, sentiment: s, refresh } = market
  const snap = mode === 'snapshot'
  const [tabState, setTab] = useState('Price')
  // Tab Teknikal/Fundamental hanya muncul bila ada datanya (tidak menampilkan angka karangan)
  const has = useMemo(() => ({ Teknikal: rows.some(r => r.rsi != null || r.ema || r.pattern), Fundamental: rows.some(r => r.per != null || r.pbv != null || r.yld != null) }), [rows])
  const tabs = TABS.filter(t => has[t] !== false)
  const tab = tabs.includes(tabState) ? tabState : 'Price'
  const [pattern, setPattern] = useState('')
  const [search, setSearch] = useState('')
  const [ccy, setCcy] = useState('all')
  const [f, setF] = useState({ ema: false, rsi: false, up: false, yld: false, per: false, pbv: false })
  const [sort, setSort] = useState({ key: 'change', dir: -1 })
  const [detail, setDetail] = useState(null)

  useEffect(() => { if (request?.tab) pick(request.tab) }, [request]) // eslint-disable-line react-hooks/exhaustive-deps
  function pick(t) { const to = tabs.includes(t) ? t : 'Price'; setTab(to); setSort({ key: DEFAULT_SORT[to], dir: -1 }) }
  const toggle = k => setF(p => ({ ...p, [k]: !p[k] }))
  const reset = () => { setPattern(''); setSearch(''); setCcy('all'); setF({ ema: false, rsi: false, up: false, yld: false, per: false, pbv: false }) }

  const counts = useMemo(() => Object.fromEntries(PATTERNS.map(p => [p, rows.filter(r => r.pattern === p).length])), [rows])
  const list = useMemo(() => {
    const q = search.trim().toLowerCase()
    const T = tab === 'Teknikal', F = tab === 'Fundamental'
    const out = rows.filter(r =>
      (!q || `${r.code} ${r.name}`.toLowerCase().includes(q)) &&
      (ccy === 'all' || r.ccy === ccy) &&
      (!(T && pattern) || r.pattern === pattern) &&
      (!(T && f.ema) || isAboveEma(r)) &&
      (!(T && f.rsi) || (r.rsi !== null && r.rsi < 35)) &&
      (!(T && f.up) || (r.change !== null && r.change > 0)) &&
      (!(F && f.yld) || (r.yld !== null && r.yld >= 5)) &&
      (!(F && f.per) || (r.per !== null && r.per > 0 && r.per <= 15)) &&
      (!(F && f.pbv) || (r.pbv !== null && r.pbv <= 1.5)))
    const { key, dir } = sort
    return out.sort((a, b) => {
      const x = key === 'dir' ? a.change : a[key], y = key === 'dir' ? b.change : b[key]
      if (x === null || x === undefined) return y === null || y === undefined ? 0 : 1
      if (y === null || y === undefined) return -1
      return (typeof x === 'string' ? x.localeCompare(y) : x - y) * dir
    })
  }, [rows, tab, pattern, search, ccy, f, sort])

  async function inspect(code) {
    setDetail({ code, loading: true })
    try { setDetail({ code, data: (await api.fundamentals(code)).data }) } catch (e) { setDetail({ code, error: e.message }) }
  }
  const [label, tone] = MODE[mode] || [mode.toUpperCase(), 'text-slate-400']
  const sortBy = key => setSort(p => ({ key, dir: p.key === key ? -p.dir : key === 'code' ? 1 : -1 }))
  const chip = on => `rounded-lg border px-3 py-2 text-xs transition ${on ? 'border-cyan-300/50 bg-cyan-300/[.08] text-cyan-100' : 'border-white/10 text-slate-400 hover:text-white'}`

  const cols = COLS[tab].filter(([, k]) => ['code', 'price', 'change', 'dir'].includes(k) || rows.some(r => r[k] != null && r[k] !== ''))
  return (
    <Section id="market" label="Market intelligence terminal" title="Understand what the market is telling you." desc={`Harga, perubahan, dan market mood dalam satu workspace. ${snap ? `${SNAPSHOT.label} dari sumber publik bertanggal — bukan real-time; untuk angka live gunakan chart TradingView di bawah.` : 'Data bersumber dari provider yang terhubung dan dapat tertunda sesuai lisensinya.'}`}>
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d1421] shadow-aura">
        <div className="flex flex-col justify-between gap-3 border-b border-white/[.07] p-4 sm:flex-row sm:items-center sm:p-5">
          <div><p className="text-[10px] font-bold tracking-[.2em] text-slate-500">DIGIVEST / {snap ? 'CUPLIKAN PASAR' : 'IDX UNIVERSE'}</p><h3 className="mt-1 font-display text-xl font-bold">Market scanner</h3></div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className={`flex items-center gap-1.5 text-[11px] font-semibold ${tone}`}><Wifi size={13} /> {label}</span>
            <span className="text-[10px] text-slate-500">{snap ? SNAPSHOT.label : `Update: ${dateTime(updatedAt)}`}</span>
            {!snap && <button onClick={refresh} className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-slate-400 hover:text-white" aria-label="Segarkan data"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /></button>}
          </div>
        </div>
        {error && <div className="m-4 flex items-start gap-2 rounded-xl border border-amber-300/20 bg-amber-300/[.05] p-3 text-[11px] leading-5 text-amber-100/80 sm:m-5"><AlertTriangle size={14} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
        <div className="flex gap-1 overflow-x-auto border-b border-white/[.07] px-3 pt-3 sm:px-4" role="tablist" aria-label="Kategori screener">
          {tabs.map(t => <button key={t} role="tab" aria-selected={tab === t} onClick={() => pick(t)} className={`whitespace-nowrap rounded-t-lg px-4 py-3 text-xs font-semibold ${tab === t ? 'border-b-2 border-cyan-300 bg-cyan-300/[.06] text-cyan-100' : 'text-slate-500 hover:text-white'}`}>{t}</button>)}
        </div>
        <div className="grid gap-5 p-3 sm:p-5 lg:grid-cols-[250px_1fr]">
          <aside className="min-w-0 rounded-2xl border border-white/[.07] bg-[#0a111d] p-4">
            <p className="flex items-center gap-2 text-xs font-semibold"><SlidersHorizontal size={15} className="text-cyan-200" /> Filter {tab}</p>
            {tab === 'Teknikal' && (<>
              <p className="mb-2 mt-4 text-[10px] font-bold tracking-widest text-slate-500">PRICE PATTERN</p>
              <div className="flex flex-wrap gap-2 lg:flex-col lg:flex-nowrap lg:gap-1.5">
                  <button onClick={() => setPattern('')} className={`${chip(!pattern)} flex items-center justify-between gap-2 lg:w-full`}>Semua pola <span className="text-[10px] opacity-70">{rows.length}</span></button>
                  {PATTERNS.map(p => <button key={p} onClick={() => setPattern(p)} className={`${chip(pattern === p)} flex items-center justify-between gap-2 lg:w-full ${counts[p] ? '' : 'opacity-60'}`}>{p} <span className="text-[10px] opacity-70">{counts[p]}</span></button>)}
                </div>
              <div className="mt-5 space-y-3 border-t border-white/[.07] pt-4">
                {[['ema', 'Di atas EMA 20'], ['rsi', 'RSI di bawah 35'], ['up', 'Naik hari ini']].map(([k, t]) => <label key={k} className="flex cursor-pointer items-center gap-2 text-xs text-slate-400"><input type="checkbox" className="h-4 w-4" checked={f[k]} onChange={() => toggle(k)} />{t}</label>)}
              </div>
            </>)}
            {tab === 'Fundamental' && <div className="mt-5 space-y-3">{[['yld', 'Dividend yield ≥ 5%'], ['per', 'PER ≤ 15 (laba positif)'], ['pbv', 'PBV ≤ 1,5']].map(([k, t]) => <label key={k} className="flex cursor-pointer items-center gap-2 text-xs text-slate-400"><input type="checkbox" className="h-4 w-4" checked={f[k]} onChange={() => toggle(k)} />{t}</label>)}</div>}
            {tab === 'Fear & Greed' && <p className="mt-4 text-[11px] leading-5 text-slate-500">Market Mood dihitung dari market breadth (porsi saham naik vs turun) {snap ? 'pada seluruh saham BEI saat penutupan 12 Nov 2026 (data IDX via Kontan).' : 'pada universe yang tampil.'} Ini proxy sederhana — bukan CNN Fear &amp; Greed Index dan bukan indikator resmi bursa.</p>}
            {tab === 'Price' && <p className="mt-4 text-[11px] leading-5 text-slate-500">Klik judul kolom pada tabel untuk mengurutkan berdasarkan harga atau perubahan.</p>}
            <p className="mb-2 mt-5 border-t border-white/[.07] pt-4 text-[10px] font-bold tracking-widest text-slate-500">PASAR</p>
            <select aria-label="Filter pasar" value={ccy} onChange={e => setCcy(e.target.value)} className="input-dark text-xs"><option value="all">Semua</option><option value="IDR">Indonesia (IDR)</option>{rows.some(r => r.ccy === 'USD') && <option value="USD">Amerika (USD)</option>}</select>
            <button onClick={reset} className="mt-4 w-full rounded-lg border border-white/10 py-2.5 text-xs text-slate-400 hover:bg-white/5">Reset filter</button>
          </aside>
          <div className="min-w-0">
            {tab === 'Fear & Greed' && (
              <div className="mb-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/[.07] bg-[#111c2c] p-4"><p className="text-[10px] tracking-widest text-slate-500">DIGIVEST MARKET MOOD</p><p className="mt-2 font-display text-3xl font-bold text-cyan-100">{s.score ?? '—'}<span className="text-sm text-slate-500"> / 100</span></p><p className="mt-1 text-xs text-slate-400">{s.label}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-rose-400 via-yellow-300 to-emerald-400" style={{ width: `${s.score ?? 0}%` }} /></div></div>
                <div className="rounded-xl border border-white/[.07] bg-[#111c2c] p-4"><p className="text-[10px] tracking-widest text-slate-500">NAIK / TURUN / TETAP</p><p className="mt-2 text-xl font-bold"><span className="text-emerald-300">{s.advancing}</span> <span className="text-slate-600">/</span> <span className="text-rose-300">{s.declining}</span> <span className="text-slate-600">/</span> <span className="text-slate-300">{s.unchanged}</span></p><p className="mt-1 text-[10px] text-slate-500">dari {s.sampleSize} emiten{snap ? ' (seluruh BEI)' : ''}</p></div>
                <div className="rounded-xl border border-white/[.07] bg-[#111c2c] p-4"><p className="text-[10px] tracking-widest text-slate-500">METODE &amp; WAKTU</p><p className="mt-2 text-xs font-semibold">Market breadth proxy</p><p className="mt-1 text-[10px] leading-4 text-slate-500">{snap ? SNAPSHOT.label : dateTime(updatedAt)}</p></div>
              </div>
            )}
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <p className="text-sm font-semibold">Hasil screening <span className="ml-1 text-[11px] font-normal text-slate-500">({list.length} dari {rows.length} emiten)</span></p>
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#080e18] px-3 py-2.5 sm:w-56"><Search size={13} className="shrink-0 text-slate-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari kode / nama emiten..." aria-label="Cari emiten" className="w-full min-w-0 bg-transparent text-xs outline-none placeholder:text-slate-600" /></div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-white/[.06]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#131f31] text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    {cols.map(([h, k], i) => (
                      <th key={h} aria-sort={sort.key === k ? (sort.dir > 0 ? 'ascending' : 'descending') : 'none'} className={`whitespace-nowrap px-2 py-3 font-semibold sm:px-3 ${i === 0 ? 'sticky left-0 z-[1] bg-[#131f31]' : ''}`}>
                        <button onClick={() => sortBy(k)} className="inline-flex items-center gap-1 uppercase tracking-wider hover:text-white">{h}{sort.key === k && <span aria-hidden>{sort.dir > 0 ? '↑' : '↓'}</span>}</button>
                      </th>
                    ))}
                    <th className="px-2 py-3 text-right font-semibold sm:px-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(r => (
                    <tr key={r.code} className="group border-t border-white/[.05] hover:bg-white/[.025]">
                      {cols.map(([h, k], i) => <td key={h} className={`whitespace-nowrap px-2 py-3.5 sm:px-3 ${i === 0 ? 'sticky left-0 z-[1] bg-[#0d1421] group-hover:bg-[#121a29]' : ''}`}><Cell col={k} head={h} row={r} /></td>)}
                      <td className="whitespace-nowrap px-2 py-3.5 text-right sm:px-3">
                        <button onClick={() => onChart(r.tv)} className="rounded-lg border border-cyan-300/20 px-2.5 py-2 text-[11px] text-cyan-200 hover:bg-cyan-300/10">Chart</button>
                        {!snap && <button onClick={() => inspect(r.code)} className="ml-1.5 rounded-lg border border-white/10 px-2.5 py-2 text-[11px] text-slate-300 hover:bg-white/5">Detail</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!list.length && <p className="px-4 py-12 text-center text-xs text-slate-500">{rows.length ? 'Tidak ada emiten yang cocok dengan filter saat ini.' : 'Belum ada data yang tersedia.'}</p>}
            </div>
            {detail && (
              <div className="mt-5 rounded-xl border border-cyan-300/20 bg-cyan-300/[.04] p-4">
                <div className="flex items-center justify-between"><p className="flex items-center gap-2 text-xs font-semibold text-cyan-100"><Activity size={14} /> Fundamental / {detail.code}</p><button onClick={() => setDetail(null)} className="px-2 py-1 text-xs text-slate-500 hover:text-white">Tutup</button></div>
                {detail.loading ? <p className="mt-3 text-xs text-slate-400">Memuat…</p> : detail.error ? <p className="mt-3 text-xs text-amber-200">{detail.error}</p> : <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words text-[10px] leading-5 text-slate-400">{JSON.stringify(detail.data, null, 2)}</pre>}
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-white/[.07] px-4 py-3 text-[10px] leading-5 text-slate-500 sm:px-5">
          {snap
            ? `Harga & perubahan = cuplikan penutupan (${SNAPSHOT.label}) dari sumber publik: ${SNAPSHOT.sources}. Bukan real-time — dapat berbeda dari harga di TradingView saat ini. RSI, EMA, pola, PER, PBV, dan yield tidak ditampilkan karena belum ada sumber datanya. Bukan rekomendasi beli/jual.`
            : 'Harga dan metrik hanya dapat disebut real-time bila provider, paket, dan lisensi memberi hak serta feed real-time. Saat pasar tutup, nilai terakhir adalah transaksi terakhir yang tersedia. Bukan rekomendasi beli/jual.'}
        </div>
      </div>
    </Section>
  )
}
