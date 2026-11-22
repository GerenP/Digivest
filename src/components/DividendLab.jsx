import { useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Calculator, Info } from 'lucide-react'
import Section from './Section'
import { clamp, projectDividends } from '../lib/dividend'
import { compact, rupiah } from '../lib/format'

const axis = { fill: '#8491a9', fontSize: 10 }
const tip = { background: '#101827', border: '1px solid #ffffff20', borderRadius: 12, fontSize: 12 }

function Money({ id, label, value, onChange }) {
  return (
    <div className="mb-5">
      <label htmlFor={id} className="mb-2 block text-xs text-slate-400">{label}</label>
      <input id={id} className="input-dark" type="text" inputMode="numeric" autoComplete="off" value={value} onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 13))} />
      <p className="mt-1 text-[11px] text-slate-500">= {rupiah(Number(value) || 0)}</p>
    </div>
  )
}
function Slider({ id, label, value, set, min, max, step, unit }) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex justify-between text-xs"><label htmlFor={id} className="text-slate-400">{label}</label><b className="text-cyan-200">{value}{unit}</b></div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={e => set(Number(e.target.value))} />
    </div>
  )
}

export default function DividendLab({ preset }) {
  const [capital, setCapital] = useState('25000000')
  const [monthly, setMonthly] = useState('1500000')
  const [yieldPct, setYield] = useState(6)
  const [growth, setGrowth] = useState(4)
  const [years, setYears] = useState(10)
  const [reinvest, setReinvest] = useState(true)

  useEffect(() => {
    if (!preset) return
    setCapital(String(clamp(preset.capital, 0, 1e13, 0)))
    setYears(clamp(preset.years, 1, 30, 10))
  }, [preset])

  const { rows, totals } = useMemo(
    () => projectDividends({ capital: Number(capital), monthly: Number(monthly), yieldPct, growthPct: growth, years, reinvest }),
    [capital, monthly, yieldPct, growth, years, reinvest],
  )
  const cards = [
    ['Total modal disetor', totals.invested, 'border-white/[.08] bg-[#101827]', ''],
    ['Nilai portofolio (harga tetap)', totals.value, 'border-cyan-300/20 bg-cyan-300/[.05]', 'text-cyan-200'],
    ['Total dividen diterima', totals.dividends, 'border-white/[.08] bg-[#101827]', ''],
    ['Rata-rata dividen / bulan (tahun ke-' + years + ')', totals.lastMonthly, 'border-violet-300/20 bg-violet-300/[.05]', 'text-violet-200'],
  ]
  return (
    <Section id="dividend" label="Dividend lab" title="Explore the power of dividend growth." desc="Simulasi sederhana untuk memahami bagaimana yield, pertumbuhan dividen, top-up bulanan, dan reinvestasi memengaruhi estimasi pendapatan pasif.">
      <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <div className="min-w-0 rounded-2xl border border-white/[.08] bg-[#101827] p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-3"><Calculator className="text-cyan-200" /><div><h3 className="text-sm font-semibold">Simulation inputs</h3><p className="text-[11px] text-slate-500">Ubah asumsi sesuai skenario</p></div></div>
          <Money id="dl-cap" label="Modal awal (Rp)" value={capital} onChange={setCapital} />
          <Money id="dl-mon" label="Top-up bulanan (Rp)" value={monthly} onChange={setMonthly} />
          <Slider id="dl-y" label="Dividend yield" value={yieldPct} set={setYield} min={0} max={15} step={0.5} unit="%" />
          <Slider id="dl-g" label="Pertumbuhan dividen / tahun" value={growth} set={setGrowth} min={0} max={20} step={0.5} unit="%" />
          <Slider id="dl-n" label="Horizon investasi" value={years} set={setYears} min={1} max={30} step={1} unit=" tahun" />
          <label className="mb-5 flex cursor-pointer items-start gap-3 text-xs text-slate-300"><input type="checkbox" className="mt-0.5 h-4 w-4" checked={reinvest} onChange={e => setReinvest(e.target.checked)} /><span>Reinvestasi dividen<span className="block text-[11px] text-slate-500">Dividen langsung dibelikan saham lagi (compounding).</span></span></label>
          <div className="rounded-xl bg-yellow-300/[.05] p-3 text-[11px] leading-5 text-yellow-100/70"><Info size={13} className="mr-1 inline" />Asumsi: harga saham tetap, dividen per saham tumbuh sesuai persentase di atas, dividen dihitung rata per bulan, top-up dibeli di akhir bulan. Belum memperhitungkan pajak, biaya, inflasi, atau perubahan kebijakan dividen. Simulasi — bukan proyeksi pasti.</div>
        </div>
        <div className="min-w-0 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {cards.map(([t, v, cls, txt]) => (
              <div key={t} className={`rounded-xl border p-4 ${cls}`}><p className="text-[10px] leading-4 text-slate-500">{t}</p><p className={`mt-2 break-words font-display text-base font-bold sm:text-lg ${txt}`}>{rupiah(v)}</p></div>
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="min-w-0 rounded-2xl border border-white/[.08] bg-[#101827] p-4 sm:p-5">
              <h3 className="text-sm font-semibold">Nilai portofolio vs modal disetor</h3>
              <div className="mt-4 h-60 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={rows} margin={{ left: 0, right: 8, top: 8 }}>
                    <defs><linearGradient id="dlv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#46d9f2" stopOpacity=".3" /><stop offset="100%" stopColor="#46d9f2" stopOpacity="0" /></linearGradient></defs>
                    <CartesianGrid stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="year" tickFormatter={y => `T${y}`} tick={axis} axisLine={false} tickLine={false} minTickGap={4} />
                    <YAxis tickFormatter={compact} tick={axis} axisLine={false} tickLine={false} width={48} />
                    <Tooltip formatter={(v, n) => [rupiah(v), n]} labelFormatter={y => `Tahun ke-${y}`} contentStyle={tip} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area dataKey="value" name="Nilai portofolio" type="monotone" stroke="#46d9f2" strokeWidth={2.5} fill="url(#dlv)" />
                    <Area dataKey="invested" name="Modal disetor" type="monotone" stroke="#7657ff" strokeWidth={2} fill="none" strokeDasharray="5 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="min-w-0 rounded-2xl border border-white/[.08] bg-[#101827] p-4 sm:p-5">
              <h3 className="text-sm font-semibold">Dividen per tahun</h3>
              <div className="mt-4 h-60 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rows} margin={{ left: 0, right: 8, top: 8 }}>
                    <CartesianGrid stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="year" tickFormatter={y => `T${y}`} tick={axis} axisLine={false} tickLine={false} minTickGap={4} />
                    <YAxis tickFormatter={compact} tick={axis} axisLine={false} tickLine={false} width={48} />
                    <Tooltip formatter={v => [rupiah(v), 'Dividen']} labelFormatter={y => `Tahun ke-${y}`} contentStyle={tip} cursor={{ fill: '#ffffff08' }} />
                    <Bar dataKey="dividend" name="Dividen" fill="#7657ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="max-h-72 overflow-auto rounded-2xl border border-white/[.08] bg-[#101827]">
            <table className="w-full min-w-[560px] text-xs">
              <thead className="sticky top-0 bg-[#172338] text-slate-500">
                <tr>{['Tahun', 'Yield efektif', 'Dividen / tahun', '≈ / bulan', 'Akumulasi dividen', 'Nilai portofolio'].map((h, i) => <th key={h} className={`whitespace-nowrap px-4 py-3 font-semibold ${i ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.year} className="whitespace-nowrap border-t border-white/[.05] tabular-nums">
                    <td className="px-4 py-3 text-left text-slate-300">Tahun {r.year}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{(r.rate * 100).toFixed(2)}%</td>
                    <td className="px-4 py-3 text-right text-cyan-100">{rupiah(r.dividend)}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{rupiah(r.monthlyIncome)}</td>
                    <td className="px-4 py-3 text-right">{rupiah(r.cumulative)}</td>
                    <td className="px-4 py-3 text-right text-cyan-200">{rupiah(r.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Section>
  )
}
