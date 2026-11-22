// Kalkulator average down. Semua hitungan dalam LEMBAR; 1 lot BEI = 100 lembar.
// Rumus inti:  rata-rata baru = (lembar lama × rata-rata lama + lembar baru × harga beli efektif) ÷ total lembar
// Harga beli efektif = harga × (1 + biaya beli%). Biaya jual & pajak tidak dihitung.
export const SHARES_PER_LOT = 100
const num = v => { const x = Number(v); return Number.isFinite(x) ? x : 0 }

export function averageDown(input = {}) {
  const per = input.unit === 'share' ? 1 : SHARES_PER_LOT
  const heldUnits = Math.max(0, Math.floor(num(input.held)))
  const S0 = heldUnits * per
  const A0 = Math.max(0, num(input.avg))
  const P = Math.max(0, num(input.price))
  const fee = Math.min(5, Math.max(0, num(input.feePct))) / 100
  const Pe = P * (1 + fee)
  const mode = input.mode === 'budget' || input.mode === 'target' ? input.mode : 'qty'
  const fail = error => ({ ok: false, error })

  if (!(P > 0)) return fail('Isi harga beli sekarang (lebih dari 0).')
  if (S0 > 0 && !(A0 > 0)) return fail('Isi harga rata-rata saat ini (lebih dari 0).')

  let addUnits
  if (mode === 'qty') addUnits = Math.max(0, Math.floor(num(input.addQty)))
  else if (mode === 'budget') addUnits = Math.floor(Math.max(0, num(input.budget)) / (per * Pe) + 1e-9)
  else {
    const T = num(input.target)
    if (S0 === 0) return fail('Isi jumlah kepemilikan saat ini untuk menghitung target rata-rata.')
    if (!(T > 0)) return fail('Isi target harga rata-rata.')
    if (T >= A0) return fail('Target harus lebih rendah dari harga rata-rata saat ini.')
    if (T <= Pe) return fail('Target tidak mungkin tercapai: rata-rata baru selalu berada di atas harga beli sekarang (termasuk biaya).')
    addUnits = Math.max(0, Math.ceil((S0 * (A0 - T)) / (T - Pe) / per - 1e-9)) // x = S0(A0−T)/(T−Pe), dibulatkan ke atas
  }

  const addShares = addUnits * per
  const buyCost = addShares * Pe
  const oldCost = S0 * A0
  const totalShares = S0 + addShares
  if (totalShares === 0)
    return mode === 'budget' ? { ok: false, error: `Dana belum cukup untuk membeli 1 ${per === 1 ? 'lembar' : 'lot'}.`, need: per * Pe } : fail('Isi jumlah kepemilikan atau jumlah yang akan dibeli.')
  const totalCost = oldCost + buyCost
  const newAvg = totalShares > 0 ? totalCost / totalShares : 0
  const had = S0 > 0
  const plAfter = totalShares > 0 ? P * totalShares - totalCost : null
  return {
    ok: true, mode, unit: per === 1 ? 'share' : 'lot', perUnit: per,
    kind: !had ? 'new' : P < A0 ? 'down' : P > A0 ? 'up' : 'same',
    heldUnits, heldShares: S0, addUnits, addShares, totalShares, totalUnits: totalShares / per,
    buyCost, fee: buyCost - addShares * P, oldCost, totalCost, newAvg,
    avgDropPct: had ? (newAvg / A0 - 1) * 100 : null,
    breakEvenBefore: had ? (A0 / P - 1) * 100 : null, // kenaikan dari harga sekarang agar kembali ke rata-rata lama
    breakEvenAfter: totalShares > 0 ? (newAvg / P - 1) * 100 : null,
    plBefore: had ? (P - A0) * S0 : null, plBeforePct: had ? (P / A0 - 1) * 100 : null,
    plAfter, plAfterPct: totalCost > 0 ? (plAfter / totalCost) * 100 : null,
    leftover: mode === 'budget' ? Math.max(0, num(input.budget) - buyCost) : null,
    oneUnitCost: per * Pe,
  }
}

// Skenario penambahan: kelipatan dari posisi saat ini (minimal 1 satuan), tanpa duplikat.
export const scenarioSteps = heldUnits => {
  const b = Math.max(1, heldUnits)
  return [...new Set([Math.max(1, Math.round(b / 2)), b, 2 * b, 3 * b, 5 * b])].sort((a, c) => a - c)
}
export const scenarios = (input, steps) => steps.map(q => averageDown({ ...input, mode: 'qty', addQty: q })).filter(r => r.ok)
