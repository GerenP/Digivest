// Model dividen DigiVest. Asumsi (ditampilkan juga di UI & README):
//  • Harga saham dianggap tetap → dividen per saham tumbuh `growthPct` per tahun, sehingga
//    yield efektif terhadap modal tahun ke-n = yield × (1 + g)^(n-1).
//  • Dividen dihitung rata per bulan; top-up bulanan dibeli di akhir bulan (setelah dividen bulan itu).
//  • reinvest = true → dividen langsung dibelikan saham lagi. Tanpa pajak, biaya, inflasi.
export const clamp = (n, min, max, fallback = min) => {
  const v = Number(n)
  return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback
}

export function projectDividends(input = {}) {
  const capital = clamp(input.capital, 0, 1e15, 0)
  const monthly = clamp(input.monthly, 0, 1e13, 0)
  const y = clamp(input.yieldPct, 0, 100, 0) / 100
  const g = clamp(input.growthPct, 0, 100, 0) / 100
  const years = Math.round(clamp(input.years, 1, 50, 1))
  const reinvest = input.reinvest !== false

  let base = capital
  let cumulative = 0
  const rows = []
  for (let yr = 1; yr <= years; yr++) {
    const rate = y * Math.pow(1 + g, yr - 1)
    let yearly = 0
    for (let m = 0; m < 12; m++) {
      const d = (base * rate) / 12
      yearly += d
      if (reinvest) base += d
      base += monthly
    }
    const dividend = Math.round(yearly)
    cumulative += dividend // dijumlah dari angka yang tampil → total selalu = jumlah baris tabel
    rows.push({
      year: yr,
      rate,
      dividend,
      monthlyIncome: Math.round(yearly / 12),
      cumulative,
      invested: capital + monthly * 12 * yr,
      value: Math.round(base),
    })
  }
  const last = rows[rows.length - 1]
  return {
    rows,
    totals: {
      invested: last.invested,
      value: last.value,
      dividends: last.cumulative,
      firstYear: rows[0].dividend,
      lastYear: last.dividend,
      lastMonthly: last.monthlyIncome,
    },
  }
}
