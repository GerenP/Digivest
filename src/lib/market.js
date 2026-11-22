// Utilitas data pasar (bukan data itu sendiri). Data cuplikan ada di snapshot.js.
export const PATTERNS = ['EMA 20 Bounce', 'Trend Following', 'Demand Zone', 'Fair Value Gap', 'Breakout', 'Harmonic Pattern', 'RSI Oversold', 'Cup & Handle', 'Double Bottom']
export const isAboveEma = row => /^(Above|Extended)/.test(row.ema || '')

// Fraksi harga BEI: <200→1, 200–<500→2, 500–<2.000→5, 2.000–<5.000→10, ≥5.000→25
export const tickSize = (p, ccy) => (ccy === 'USD' ? 0.01 : p < 200 ? 1 : p < 500 ? 2 : p < 2000 ? 5 : p < 5000 ? 10 : 25)

const round2 = n => Math.round(n * 100) / 100
// Perubahan (%) SELALU dihitung dari penutupan sebelumnya (prev) sehingga harga & persentase konsisten.
export const withChange = row => ({ ...row, change: row.prev ? round2((row.price / row.prev - 1) * 100) : null })

// Proxy sentimen berbasis market breadth (bukan CNN Fear & Greed Index). Rumus sama dengan server.
export function sentimentFromCounts(advancing, declining, unchanged) {
  const total = advancing + declining + unchanged
  const score = total ? Math.round((100 * (advancing + 0.5 * unchanged)) / total) : null
  const label = score === null ? 'Data belum tersedia' : score < 20 ? 'Extreme Fear' : score < 40 ? 'Fear' : score < 60 ? 'Neutral' : score < 80 ? 'Greed' : 'Extreme Greed'
  return { score, label, advancing, declining, unchanged, sampleSize: total }
}
export function sentimentOf(rows) {
  const s = rows.filter(x => Number.isFinite(x.change))
  const advancing = s.filter(x => x.change > 0).length
  const declining = s.filter(x => x.change < 0).length
  return sentimentFromCounts(advancing, declining, s.length - advancing - declining)
}

const n = v => (Number.isFinite(Number(v)) && v !== null && v !== '' ? Number(v) : null)
export const fromProvider = it => ({
  code: String(it.symbol), name: it.name || '', ccy: 'IDR', price: n(it.price), prev: null,
  change: n(it.changePercent) === null ? null : round2(n(it.changePercent)),
  volume: n(it.volume), value: n(it.value), per: null, pbv: null, yld: null, rsi: null, ema: null, pattern: null, sector: '',
  tv: `IDX:${it.symbol}`,
})
