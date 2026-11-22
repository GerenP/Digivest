const finite = n => n !== null && n !== '' && Number.isFinite(Number(n))
const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const num = new Intl.NumberFormat('id-ID')
const compactFmt = new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 })
const usdFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export const rupiah = n => (finite(n) ? idr.format(Number(n)) : '—')
export const number = n => (finite(n) ? num.format(Number(n)) : '—')
export const compact = n => (finite(n) ? compactFmt.format(Number(n)) : '—')
const pctFmt = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: 'exceptZero' })
export const percent = n => (finite(n) ? `${pctFmt.format(Number(n))}%` : '—')
export const price = (n, ccy = 'IDR') => (!finite(n) ? '—' : ccy === 'USD' ? usdFmt.format(Number(n)) : `Rp ${num.format(Number(n))}`)
export const dateTime = v => {
  const d = v ? new Date(v) : null
  return d && !Number.isNaN(d.getTime())
    ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Asia/Jakarta' }).format(d)
    : 'Belum tersedia'
}
export const clockWIB = (d = new Date()) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(d)

const idrDec = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 })
// Uang dengan hingga 2 desimal (rata-rata harga bisa pecahan): IDR → "Rp 3.466,67", USD → "$166.19"
export const money = (n, ccy = 'IDR') => {
  if (!finite(n)) return '—'
  const v = Number(n)
  return ccy === 'USD' ? usdFmt.format(v) : `${v < 0 ? '-' : ''}Rp ${idrDec.format(Math.abs(v))}`
}
