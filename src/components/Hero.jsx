import { Activity, ArrowRight, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react'
import { asset } from '../lib/site'

export default function Hero({ goal }) {
  return (
    <section id="top" className="relative overflow-hidden px-4 pb-16 pt-36 sm:px-6 sm:pb-24 sm:pt-44 lg:px-8">
      <div className="grid-pattern absolute inset-0" />
      <div className="absolute -left-40 top-24 h-[420px] w-[420px] rounded-full bg-blue-600/15 blur-[130px]" />
      <div className="absolute -right-36 top-20 h-[460px] w-[460px] rounded-full bg-violet-600/20 blur-[140px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.08fr_.92fr] lg:gap-16">
        <div className="animate-rise">
          <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[.06] px-3 py-2 text-[9px] font-bold tracking-[.14em] text-cyan-100 sm:text-[10px] sm:tracking-[.19em]">
            <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-cyan-300" /> FINANCIAL INTELLIGENCE FOR THE NEXT GENERATION
          </div>
          <h1 className="font-display text-[2.15rem] font-bold leading-[1.06] tracking-[-.04em] sm:text-5xl md:text-6xl lg:text-[3.25rem] xl:text-[4rem]">
            Understand money.<br /><span className="gradient-text">Read the market.</span><br />Move with purpose.
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            DigiVest adalah platform edukasi keuangan dan market intelligence yang membantu generasi digital memahami pasar modal, mengembangkan perspektif, dan mengambil keputusan yang lebih terukur.
          </p>
          {goal && <p className="mt-4 inline-flex max-w-full rounded-lg border border-violet-400/20 bg-violet-400/[.07] px-3 py-2 text-xs text-violet-200">Fokus kamu: {goal}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#about" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 px-5 py-3.5 text-sm font-bold text-[#06101b] transition hover:brightness-110">Discover DigiVest <ArrowRight size={16} /></a>
            <a href="#products" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3.5 text-sm font-semibold text-slate-300 hover:bg-white/5">Explore products <ArrowUpRight size={15} /></a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/10 pt-6 text-[11px] font-medium text-slate-500">
            <span className="flex items-center gap-2"><Activity size={14} className="text-cyan-300" /> Market awareness</span>
            <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-violet-300" /> Risk-first mindset</span>
            <span className="flex items-center gap-2"><Sparkles size={14} className="text-yellow-300" /> AI-powered learning</span>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[400px] sm:max-w-[460px]">
          <div className="absolute inset-8 rounded-full bg-blue-500/25 blur-[90px]" />
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#05060d] p-1.5 shadow-aura sm:rounded-[36px]">
            <img src={asset('logo-full.webp')} alt="Logo DigiVest — Edukasi Keuangan, Pasar Modal, Investasi Digital" width="800" height="800" className="aspect-square w-full rounded-[22px] object-cover sm:rounded-[30px]" />
          </div>
          <div className="relative mt-4 grid grid-cols-3 gap-2">
            {[['01', 'LEARN'], ['02', 'ANALYZE'], ['03', 'ACT']].map(([n, t]) => (
              <div key={n} className="rounded-xl border border-white/[.07] bg-white/[.025] p-3 text-center">
                <p className="gradient-text font-display text-xl font-bold">{n}</p>
                <p className="mt-1 text-[9px] font-bold tracking-[.16em] text-slate-500">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
