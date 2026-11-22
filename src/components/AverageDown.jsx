import { useMemo, useState } from 'react'
import { AlertTriangle, Info, TrendingDown } from 'lucide-react'
import Section from './Section'
import { averageDown, scenarioSteps, scenarios } from '../lib/averagedown'
import { money, number, percent } from '../lib/format'

const digits = v => v.replace(/\D/g, '').slice(0, 12)
// Konvensi angka mengikuti mata uang: IDR → titik = ribuan (diabaikan), koma = desimal; USD → koma = ribuan, titik = desimal.
const cleanDecimal = (v, ccy) => {
  const dec = ccy === 'IDR' ? ',' : '.'
  const s = (ccy === 'IDR' ? v.replace(/\./g, '') : v.replace(/,/g, '')).replace(ccy === 'IDR' ? /[^\d,]/g : /[^\d.]/g, '')
  const i = s.indexOf(dec)
  return (i < 0 ? s : s.slice(0, i + 1) + s.slice(i + 1).split(dec).join('')).slice(0, 14)
}
const toNum = (str, ccy) => Number(ccy === 'IDR' ? str.replace(',', '.') : str) || 0
const swapSep = (str, to) => (to === 'IDR' ? str.replace('.', ',') : str.replace(',', '.'))
const tone = n => (n > 0 ? 'text-emerald-300' : n < 0 ? 'text-rose-300' : 'text-slate-300')

function Field({ id, label, value, onChange, clean, mode = 'numeric', hint }) {
  return (
    <div className="mb-4 min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-xs text-slate-400">{label}</label>
      <input id={id} className="input-dark" type="text" inputMode={mode} autoComplete="off" value={value} onChange={e => onChange(clean(e.target.value))} />
      {hint && <p className="mt-1 text-[11px] leading-4 text-slate-500">{hint}</p>}
    </div>
  )
}
function Seg({ label, value, onChange, options }) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-xs text-slate-400">{label}</p>
      <div className="grid grid-flow-col auto-cols-fr gap-1 rounded-xl border border-white/10 bg-[#0a111e] p-1" role="radiogroup" aria-label={label}>
        {options.map(([v, t]) => (
          <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)} className={`rounded-lg px-2 py-2.5 text-xs font-semibold transition ${value === v ? 'bg-cyan-300/15 text-cyan-100' : 'text-slate-400 hover:text-white'}`}>{t}</button>
        ))}
      </div>
    </div>
  )
}
const Stat = ({ label, children, sub, cls = 'border-white/[.08] bg-[#101827]' }) => (
  <div className={`min-w-0 rounded-2xl border p-4 ${cls}`}>
    <p className="text-[10px] tracking-widest text-slate-500">{label}</p>
    <p className="mt-2 break-words font-display text-lg font-bold sm:text-xl">{children}</p>
    {sub && <p className="mt-1 text-[11px] leading-4 text-slate-500">{sub}</p>}
  </div>
)

export default function AverageDown() {
  const [unit, setUnit] = useState('lot')
  const [ccy, setCcy] = useState('IDR')
  const [mode, setMode] = useState('qty')
  const [held, setHeld] = useState('10')
  const [avg, setAvg] = useState('5000')
  const [price, setPrice] = useState('4000')
  const [add, setAdd] = useState('10')
  const [budget, setBudget] = useState('4000000')
  const [target, setTarget] = useState('4500')
  const [fee, setFee] = useState('0')
  const U = unit === 'lot' ? 'lot' : 'lembar'
  const m = v => money(v, ccy)
  const N = str => toNum(str, ccy)
  const clean = v => cleanDecimal(v, ccy)
  const pickCcy = c => {
    if (c === ccy) return
    setCcy(c); setUnit(c === 'USD' ? 'share' : 'lot')
    for (const set of [setAvg, setPrice, setTarget, setFee]) set(v => swapSep(v, c))
  }

  const input = useMemo(() => ({ unit, mode, held: Number(held) || 0, avg: toNum(avg, ccy), price: toNum(price, ccy), addQty: Number(add) || 0, budget: Number(budget) || 0, target: toNum(target, ccy), feePct: toNum(fee, ccy) }), [unit, mode, ccy, held, avg, price, add, budget, target, fee])
  const r = useMemo(() => averageDown(input), [input])
  const rows = useMemo(() => (r.ok ? scenarios(input, scenarioSteps(r.heldUnits)) : []), [r, input])

  return (
    <Section id="average" label="Average down calculator" title="Know your new average before you buy more." desc="Hitung harga rata-rata baru, jumlah lot yang dibutuhkan, dan titik impas saat menambah posisi pada saham yang sedang turun.">
      <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <div className="min-w-0 rounded-2xl border border-white/[.08] bg-[#101827] p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3"><TrendingDown className="shrink-0 text-rose-300" /><div><h3 className="text-sm font-semibold">Posisi &amp; rencana beli</h3><p className="text-[11px] text-slate-500">Isi data dari aplikasi sekuritas kamu</p></div></div>
          <div className="mb-4 grid grid-cols-2 gap-3">
            <Seg label="Mata uang" value={ccy} onChange={pickCcy} options={[['IDR', 'Rp'], ['USD', '$']]} />
            <Seg label="Satuan" value={unit} onChange={setUnit} options={[['lot', 'Lot'], ['share', 'Lembar']]} />
          </div>
          <Field id="ad-held" label={`Jumlah dimiliki (${U})`} value={held} onChange={setHeld} clean={digits} hint={unit === 'lot' ? '1 lot = 100 lembar' : undefined} />
          <Field id="ad-avg" label="Harga rata-rata saat ini (per lembar)" value={avg} onChange={setAvg} clean={clean} mode="decimal" hint={`= ${m(N(avg))}`} />
          <Field id="ad-price" label="Harga beli sekarang (harga pasar)" value={price} onChange={setPrice} clean={clean} mode="decimal" hint={`= ${m(N(price))}`} />
          <div className="mb-4 grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-[#0a111e] p-1" role="tablist" aria-label="Cara menghitung">
            {[['qty', `Tambah ${U}`], ['budget', 'Dana tersedia'], ['target', 'Target rata-rata']].map(([v, t]) => (
              <button key={v} role="tab" aria-selected={mode === v} onClick={() => setMode(v)} className={`rounded-lg px-1.5 py-2.5 text-center text-xs font-semibold leading-tight transition ${mode === v ? 'bg-cyan-300/15 text-cyan-100' : 'text-slate-400 hover:text-white'}`}>{t}</button>
            ))}
          </div>
          {mode === 'qty' && <Field id="ad-add" label={`Jumlah ${U} yang akan dibeli`} value={add} onChange={setAdd} clean={digits} />}
          {mode === 'budget' && <Field id="ad-budget" label="Dana yang tersedia" value={budget} onChange={setBudget} clean={digits} hint={`= ${m(Number(budget) || 0)}`} />}
          {mode === 'target' && <Field id="ad-target" label="Target harga rata-rata" value={target} onChange={setTarget} clean={clean} mode="decimal" hint="Dihitung jumlah minimal yang perlu dibeli untuk mencapainya." />}
          <Field id="ad-fee" label="Biaya beli (%) — opsional" value={fee} onChange={setFee} clean={clean} mode="decimal" hint={`Mis. ${ccy === 'IDR' ? '0,15' : '0.15'} untuk biaya broker. Biarkan 0 bila rata-rata di aplikasi sekuritasmu tidak memasukkan biaya.`} />
        </div>

        <div className="min-w-0 space-y-4" aria-live="polite">
          {!r.ok ? (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[.05] p-5 text-sm leading-6 text-amber-100/90"><AlertTriangle size={18} className="mt-0.5 shrink-0" /><p>{r.error}{r.need ? ` Minimal ${m(r.need)}.` : ''}</p></div>
          ) : (
            <>
              {r.kind === 'up' && <div className="flex items-start gap-2 rounded-xl border border-amber-300/20 bg-amber-300/[.05] p-3 text-xs leading-5 text-amber-100/90"><AlertTriangle size={14} className="mt-0.5 shrink-0" />Harga beli sekarang ≥ harga rata-rata, jadi ini <b>bukan</b> average down — rata-rata justru naik.</div>}
              {r.kind === 'new' && <div className="flex items-start gap-2 rounded-xl border border-cyan-300/15 bg-cyan-300/[.04] p-3 text-xs leading-5 text-cyan-100/80"><Info size={14} className="mt-0.5 shrink-0" />Belum ada kepemilikan: harga rata-rata sama dengan harga beli{N(fee) > 0 ? ' (termasuk biaya)' : ''}.</div>}
              {r.mode === 'budget' && r.addUnits === 0 && <div className="flex items-start gap-2 rounded-xl border border-amber-300/20 bg-amber-300/[.05] p-3 text-xs leading-5 text-amber-100/90"><AlertTriangle size={14} className="mt-0.5 shrink-0" />Dana belum cukup untuk membeli 1 {U}; minimal {m(r.oneUnitCost)}.</div>}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 rounded-2xl border border-cyan-300/25 bg-cyan-300/[.06] p-5">
                  <p className="text-[10px] tracking-widest text-slate-400">HARGA RATA-RATA BARU</p>
                  <p className="mt-2 break-words font-display text-3xl font-bold text-cyan-100 sm:text-4xl">{m(r.newAvg)}</p>
                  {r.avgDropPct !== null && <p className="mt-1 text-xs text-slate-400"><span className={`font-semibold ${tone(-r.avgDropPct)}`}>{percent(r.avgDropPct)}</span> dari {m(N(avg))}</p>}
                </div>
                <Stat label="TOTAL KEPEMILIKAN" sub={`${unit === 'lot' ? `${number(r.totalShares)} lembar · ` : ''}tambah ${number(r.addUnits)} ${U}`}>{number(r.totalUnits)} {U}</Stat>
                <Stat label="DANA DIBUTUHKAN" sub={r.mode === 'budget' ? `Sisa dana ${m(r.leftover)}` : r.fee > 0 ? `termasuk biaya ${m(r.fee)}` : `${number(r.addShares)} lembar × ${m(N(price))}`}>{m(r.buyCost)}</Stat>
                <Stat label="TITIK IMPAS" cls="border-violet-300/20 bg-violet-300/[.05]" sub={`naik dari harga sekarang${r.breakEvenBefore !== null ? ` (sebelumnya ${percent(r.breakEvenBefore)})` : ''}`}><span className={tone(-r.breakEvenAfter)}>{percent(r.breakEvenAfter)}</span></Stat>
                <Stat label="RUGI/UNTUNG SAAT INI" sub={r.plBefore !== null ? `sebelum beli: ${m(r.plBefore)} (${percent(r.plBeforePct)})` : 'belum ada posisi sebelumnya'}><span className={tone(r.plAfter)}>{m(r.plAfter)}</span> <span className="text-xs font-normal text-slate-500">{percent(r.plAfterPct)}</span></Stat>
              </div>
              {r.kind === 'down' && N(fee) === 0 && <p className="flex items-start gap-2 text-[11px] leading-5 text-slate-500"><Info size={13} className="mt-0.5 shrink-0 text-cyan-300" />Membeli di harga pasar tidak mengubah rugi (Rp) saat ini — yang turun adalah harga rata-rata dan titik impas.</p>}
              <div className="overflow-x-auto rounded-2xl border border-white/[.08] bg-[#101827]">
                <p className="px-4 pt-4 text-sm font-semibold">Skenario penambahan</p>
                <table className="mt-3 w-full text-xs">
                  <thead className="text-slate-500"><tr>{[`Tambah (${U})`, 'Dana', 'Rata-rata baru', 'Perubahan', 'Impas'].map((h, i) => <th key={h} className={`whitespace-nowrap px-3 py-2.5 font-semibold ${i ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr></thead>
                  <tbody>
                    {rows.map(s => (
                      <tr key={s.addUnits} className={`border-t border-white/[.05] tabular-nums ${s.addUnits === r.addUnits ? 'bg-cyan-300/[.05]' : ''}`}>
                        <td className="whitespace-nowrap px-3 py-2.5 text-left text-slate-300">+{number(s.addUnits)}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right text-slate-400">{m(s.buyCost)}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right text-cyan-100">{m(s.newAvg)}</td>
                        <td className={`whitespace-nowrap px-3 py-2.5 text-right ${tone(-s.avgDropPct)}`}>{s.avgDropPct === null ? '—' : percent(s.avgDropPct)}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right text-slate-300">{percent(s.breakEvenAfter)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <div className="flex items-start gap-2 rounded-xl bg-yellow-300/[.05] p-3 text-[11px] leading-5 text-yellow-100/70"><Info size={13} className="mt-0.5 shrink-0" />Average down menambah eksposur pada saham yang sedang turun dan tidak menjamin harga pulih. Pertimbangkan hanya bila alasan investasi awal masih berlaku, dan tetapkan batas risiko. Biaya jual, pajak, dan fraksi harga tidak dihitung. Simulasi edukasi — bukan rekomendasi.</div>
        </div>
      </div>
    </Section>
  )
}
