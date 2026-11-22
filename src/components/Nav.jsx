import { useCallback, useEffect, useRef, useState } from 'react'
import { Bot, Calculator, ChartCandlestick, Info, Instagram, LayoutGrid, Menu, Newspaper, ScanSearch, TrendingDown, X } from 'lucide-react'
import Brand from './Brand'
import { clockWIB, dateTime } from '../lib/format'
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../lib/site'
import { SNAPSHOT } from '../lib/snapshot'

const items = [
  ['Tentang', '#about', Info], ['Konten', '#portfolio', Newspaper], ['Produk', '#products', LayoutGrid], ['AI Agent', '#agent', Bot],
  ['Screener', '#market', ScanSearch], ['Dividen', '#dividend', Calculator], ['Average Down', '#average', TrendingDown], ['Chart', '#terminal', ChartCandlestick],
]
const MODE = { snapshot: `CUPLIKAN ${SNAPSHOT.short}`, live: 'LIVE', delayed: 'DELAYED', provider: 'DATA PROVIDER' }

function Clock() {
  const [t, setT] = useState(() => clockWIB())
  useEffect(() => {
    const id = setInterval(() => setT(clockWIB()), 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="tabular-nums text-slate-300">{t} WIB</span>
}

// Menu samping (drawer) untuk layar < 1024px — ponsel/tablet Android. Layar lebar memakai navbar atas.
function SideDrawer({ onClose, onSetup }) {
  const panel = useRef(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusables = () => [...panel.current.querySelectorAll('a[href], button')]
    panel.current.querySelector('[data-autofocus]')?.focus()
    const onKey = e => {
      if (e.key === 'Escape') return closeRef.current(true)
      if (e.key !== 'Tab') return
      const f = focusables()
      if (!f.length) return
      const first = f[0], last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey) }
  }, [])
  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div className="overlay-in absolute inset-0 bg-[#03050a]/70 backdrop-blur-sm" onClick={() => onClose(true)} />
      <aside id="side-nav" ref={panel} role="dialog" aria-modal="true" aria-label="Menu navigasi" className="drawer-in absolute inset-y-0 left-0 flex w-[84vw] max-w-[320px] flex-col border-r border-white/10 bg-[#0a101b] pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] shadow-[20px_0_80px_rgba(0,0,0,.55)]">
        <div className="flex items-center justify-between border-b border-white/[.07] px-4 py-3">
          <Brand onClick={() => onClose(false)} />
          <button data-autofocus onClick={() => onClose(true)} aria-label="Tutup menu" className="grid h-10 w-10 place-items-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white"><X size={18} /></button>
        </div>
        <nav aria-label="Fitur DigiVest" className="flex-1 overflow-y-auto px-3 py-3">
          <p className="px-3 pb-2 text-[10px] font-bold tracking-[.2em] text-slate-500">FITUR</p>
          {items.map(([t, h, Icon]) => (
            <a key={t} href={h} onClick={() => onClose(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[.04] text-cyan-300"><Icon size={17} /></span>{t}
            </a>
          ))}
        </nav>
        <div className="space-y-3 border-t border-white/[.07] p-4">
          <button onClick={onSetup} className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/[.07] py-3 text-xs font-semibold text-cyan-100 hover:bg-cyan-300/15"><Bot size={15} /> Atur profil belajar</button>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" onClick={() => onClose(false)} className="flex items-center justify-center gap-2 py-1 text-xs text-slate-500 hover:text-white"><Instagram size={14} /> @{INSTAGRAM_HANDLE}</a>
        </div>
      </aside>
    </div>
  )
}

export default function Nav({ onSetup, market }) {
  const [open, setOpen] = useState(false)
  const burger = useRef(null)
  const closeDrawer = useCallback((refocus = true) => {
    setOpen(false)
    if (refocus) requestAnimationFrame(() => burger.current?.focus())
  }, [])
  useEffect(() => {
    const onResize = () => window.innerWidth >= 1024 && setOpen(false)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const { sentiment: s, mode } = market
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[.06] bg-[#080b13]/90 pt-[env(safe-area-inset-top)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center gap-2.5 px-3 py-2 sm:gap-3 sm:px-6 lg:px-8">
          <button ref={burger} onClick={() => setOpen(true)} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 text-slate-200 hover:bg-white/5 lg:hidden" aria-label="Buka menu navigasi" aria-expanded={open} aria-controls="side-nav" aria-haspopup="dialog">
            <Menu size={18} />
          </button>
          <Brand />
          <nav className="hidden items-center gap-4 lg:mx-auto lg:flex xl:gap-7" aria-label="Navigasi utama">
            {items.map(([t, h]) => <a key={t} href={h} className="whitespace-nowrap text-xs font-medium text-slate-400 transition hover:text-white">{t}</a>)}
          </nav>
          <button onClick={onSetup} className="ml-auto inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/[.07] px-3 text-xs font-semibold text-cyan-100 hover:bg-cyan-300/15 sm:px-4 lg:ml-0" aria-label="Atur profil belajar">
            <Bot size={15} /><span className="hidden sm:inline">Atur profil</span>
          </button>
        </div>
        <div className="border-t border-white/[.04] bg-[#06090f]/80">
          <div className="mx-auto flex max-w-7xl items-center gap-x-4 overflow-hidden whitespace-nowrap px-3 py-1.5 text-[10px] text-slate-500 sm:px-6 lg:px-8">
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /><Clock /></span>
            <span className={mode === 'snapshot' ? 'text-yellow-200/90' : 'text-emerald-300'}>● {MODE[mode] || mode.toUpperCase()}</span>
            <span className="truncate" title={market.label || `Update: ${dateTime(market.updatedAt)}`}>
              Market mood: <b className="font-semibold text-cyan-200">{s.score ?? '—'}/100</b> {s.label}
              <span className="hidden sm:inline"> · breadth BEI, bukan CNN Fear &amp; Greed</span>
            </span>
          </div>
        </div>
      </header>
      {open && <SideDrawer onClose={closeDrawer} onSetup={() => { closeDrawer(false); onSetup() }} />}
    </>
  )
}
