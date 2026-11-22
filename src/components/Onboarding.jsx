import { useEffect, useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import Modal from './Modal'
import { asset, personas } from '../lib/site'
import { rupiah } from '../lib/format'

const MSG = 'Halo! Aku Digi, pendamping belajar DigiVest. Apa fokus belajarmu? Pilihanmu hanya dipakai untuk mempersonalisasi tampilan demo ini.'

export default function Onboarding({ onClose, onDone }) {
  const [step, setStep] = useState(1)
  const [persona, setPersona] = useState('')
  const [capital, setCapital] = useState(10_000_000)
  const [years, setYears] = useState(10)
  const [typed, setTyped] = useState('')

  useEffect(() => {
    if (step !== 1) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return setTyped(MSG)
    let i = 0
    const t = setInterval(() => {
      i++
      setTyped(MSG.slice(0, i))
      if (i >= MSG.length) clearInterval(t)
    }, 18)
    return () => clearInterval(t)
  }, [step])

  return (
    <Modal onClose={onClose} label="Atur profil belajar DigiVest">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4 pr-14 sm:px-6">
        <img src={asset('logo-mark.png')} alt="" width="520" height="294" className="h-8 w-auto" />
        <div>
          <p className="text-sm font-semibold">DigiVest AI Setup</p>
          <p className="text-[10px] tracking-wider text-slate-500">PERSONALIZE YOUR JOURNEY · {step}/2</p>
        </div>
      </div>
      <div className="p-5 sm:p-7">
        {step === 1 ? (
          <>
            <div className="mb-5 rounded-2xl border border-cyan-300/15 bg-cyan-300/[.06] p-4">
              <p className="mb-2 text-[10px] font-bold tracking-[.18em] text-cyan-300">DIGI · LEARNING COMPANION</p>
              <p className="min-h-[72px] text-sm leading-6 text-slate-200 sm:min-h-[52px]" aria-live="polite">{typed}</p>
            </div>
            <p className="mb-3 text-sm font-semibold">Pilih fokus belajar kamu</p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {personas.map(p => (
                <button key={p.id} onClick={() => setPersona(p.id)} aria-pressed={persona === p.id}
                  className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition ${persona === p.id ? 'border-cyan-300/60 bg-cyan-300/[.09]' : 'border-white/10 bg-white/[.02] hover:border-white/25'}`}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[.06] text-xl text-cyan-300">{p.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{p.title}</span>
                    <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">{p.desc}</span>
                  </span>
                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${persona === p.id ? 'border-cyan-300 bg-cyan-300 text-slate-950' : 'border-slate-600'}`}>{persona === p.id && <Check size={12} />}</span>
                </button>
              ))}
            </div>
            <button disabled={!persona} onClick={() => setStep(2)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 py-3.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
              Lanjut <ArrowRight size={16} />
            </button>
          </>
        ) : (
          <>
            <p className="mb-5 text-sm leading-6 text-slate-300">Atur angka awal untuk simulasi Kalkulator Dividen. Kamu bisa mengubahnya kapan saja.</p>
            <div className="mb-6">
              <div className="mb-2 flex justify-between text-xs"><label htmlFor="ob-cap" className="text-slate-400">Modal awal</label><b className="text-cyan-200">{rupiah(capital)}</b></div>
              <input id="ob-cap" type="range" min="1000000" max="500000000" step="1000000" value={capital} onChange={e => setCapital(Number(e.target.value))} />
            </div>
            <div className="mb-6">
              <div className="mb-2 flex justify-between text-xs"><label htmlFor="ob-yrs" className="text-slate-400">Horizon investasi</label><b className="text-cyan-200">{years} tahun</b></div>
              <input id="ob-yrs" type="range" min="1" max="30" step="1" value={years} onChange={e => setYears(Number(e.target.value))} />
            </div>
            <button onClick={() => onDone({ persona, capital, years })} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 py-3.5 text-sm font-bold text-white transition hover:brightness-110">
              Mulai eksplorasi <ArrowRight size={16} />
            </button>
            <button onClick={() => setStep(1)} className="mt-2 w-full py-2 text-xs text-slate-500 hover:text-white">Kembali</button>
          </>
        )}
        <p className="mt-3 text-center text-[10px] text-slate-600">Simulasi edukatif — bukan nasihat atau rekomendasi investasi.</p>
      </div>
    </Modal>
  )
}
