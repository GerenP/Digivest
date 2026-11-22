import { useEffect, useRef, useState } from 'react'
import { ChartCandlestick, ExternalLink, Info } from 'lucide-react'
import Section from './Section'

const BASE = [['IDX:COMPOSITE', 'IHSG (Composite)'], ['IDX:BBCA', 'BBCA'], ['IDX:BBRI', 'BBRI'], ['IDX:BMRI', 'BMRI'], ['IDX:TLKM', 'TLKM'], ['IDX:ASII', 'ASII'], ['IDX:ANTM', 'ANTM'], ['NASDAQ:NVDA', 'NVDA (US)'], ['NASDAQ:AAPL', 'AAPL (US)']]
const INTERVALS = [['15', '15m'], ['60', '1H'], ['D', '1D'], ['W', '1W'], ['M', '1M']]

export default function TradingTerminal({ symbol, onSymbol }) {
  const [interval, setInterval_] = useState('D')
  const [state, setState] = useState('loading') // loading | ready | error
  const host = useRef(null)
  const options = BASE.some(([v]) => v === symbol) ? BASE : [...BASE, [symbol, symbol.replace(/^.*:/, '')]]

  useEffect(() => {
    const el = host.current
    if (!el) return
    setState('loading')
    el.innerHTML = ''
    const widget = document.createElement('div')
    widget.className = 'tradingview-widget-container__widget'
    widget.style.cssText = 'height:100%;width:100%'
    el.appendChild(widget)
    const s = document.createElement('script')
    s.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    s.async = true
    s.onload = () => setState('ready')
    s.onerror = () => setState('error')
    s.innerHTML = JSON.stringify({
      autosize: true, symbol, interval, timezone: 'Asia/Jakarta', theme: 'dark', style: '1', locale: 'id',
      allow_symbol_change: true, hide_side_toolbar: false, withdateranges: true, calendar: false,
      studies: ['STD;RSI', 'STD;MACD'], backgroundColor: '#101827', gridColor: 'rgba(255,255,255,0.06)', support_host: 'https://www.tradingview.com',
    })
    el.appendChild(s)
    return () => { el.innerHTML = '' }
  }, [symbol, interval])

  return (
    <Section id="terminal" label="Trading terminal" title="Explore the market, one candle at a time." desc="Chart interaktif dari TradingView. Ganti simbol dan interval langsung dari panel ini, atau tekan tombol Chart di Screener.">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#101827]">
        <div className="flex flex-col justify-between gap-3 border-b border-white/[.07] p-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-400/10 text-violet-200"><ChartCandlestick size={20} /></div>
            <div><p className="text-sm font-semibold">TradingView Advanced Chart</p><p className="text-[10px] text-slate-500">Widget pihak ketiga · {symbol}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <select aria-label="Simbol" className="input-dark min-w-0 text-xs sm:w-auto" value={symbol} onChange={e => onSymbol(e.target.value)}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            <select aria-label="Interval" className="input-dark min-w-0 text-xs sm:w-auto" value={interval} onChange={e => setInterval_(e.target.value)}>{INTERVALS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            <a href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(symbol)}`} target="_blank" rel="noreferrer" className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-xl border border-cyan-300/20 px-3 py-2.5 text-xs text-cyan-100 hover:bg-cyan-300/10 sm:col-span-1">Buka di TradingView <ExternalLink size={12} /></a>
          </div>
        </div>
        <div className="relative p-2 sm:p-4">
          <div ref={host} className="tradingview-widget-container h-[440px] w-full sm:h-[560px] lg:h-[640px]" />
          {state !== 'ready' && (
            <div className="pointer-events-none absolute inset-2 grid place-items-center rounded-2xl bg-[#101827]/90 p-6 text-center text-xs text-slate-400 sm:inset-4">
              {state === 'error' ? 'Chart TradingView tidak dapat dimuat. Periksa koneksi internet atau ad-blocker, lalu muat ulang halaman.' : 'Memuat chart TradingView…'}
            </div>
          )}
        </div>
        <div className="flex items-start gap-2 border-t border-white/[.07] px-4 py-4 text-[10px] leading-5 text-slate-500 sm:px-5">
          <Info size={14} className="mt-0.5 shrink-0 text-yellow-200" />
          Widget TradingView publik dapat menampilkan data tertunda sesuai aturan bursa; paket berbayar TradingView tidak otomatis membuat data embed menjadi real-time. Ketersediaan simbol mengikuti dukungan TradingView.
        </div>
      </div>
    </Section>
  )
}
