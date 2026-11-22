// CUPLIKAN HARGA PENUTUPAN — dikompilasi dari sumber publik bertanggal. BUKAN data real-time.
// Cara memperbarui: ganti `price` (penutupan terakhir) dan `prev` (penutupan sebelumnya) di bawah;
// persentase perubahan dihitung otomatis. Kolom RSI/EMA/pola/PER/PBV/yield sengaja kosong (belum ada sumber data) —
// tab Teknikal & Fundamental otomatis muncul begitu baris diisi data tersebut atau provider terhubung.
const row = ([code, name, ccy, price, prev, sector]) => ({
  code, name, ccy, price, prev, sector,
  volume: null, per: null, pbv: null, yld: null, rsi: null, ema: null, pattern: null,
  tv: ccy === 'USD' ? `NASDAQ:${code}` : `IDX:${code}`,
})

export const SNAPSHOT = {
  label: 'Penutupan Kamis, 12 Nov 2026',
  short: '12 NOV',
  // seluruh saham BEI pada hari itu (IDX Mobile via Kontan): 560 naik, 147 turun, 238 tetap
  breadth: { advancing: 560, declining: 147, unchanged: 238 },
  sources: 'Bareksa, Bloomberg Technoz, Kontan, Periskop (data BEI), Journalarta, Yahoo Finance, CNN',
  rows: [
    ['BBCA', 'Bank Central Asia Tbk', 'IDR', 5475, 5325, 'Keuangan'],
    ['BBRI', 'Bank Rakyat Indonesia (Persero) Tbk', 'IDR', 3030, 2860, 'Keuangan'],
    ['BMRI', 'Bank Mandiri (Persero) Tbk', 'IDR', 3890, 3770, 'Keuangan'],
    ['TLKM', 'Telkom Indonesia (Persero) Tbk', 'IDR', 2130, 2060, 'Telekomunikasi'],
    ['ASII', 'Astra International Tbk', 'IDR', 5450, 5250, 'Otomotif & industri'],
    ['AMRT', 'Sumber Alfaria Trijaya Tbk', 'IDR', 1000, 960, 'Ritel'],
    ['ADRO', 'Alamtri Resources Indonesia Tbk', 'IDR', 2450, 2310, 'Energi'],
    ['ANTM', 'Aneka Tambang Tbk', 'IDR', 2800, 2750, 'Pertambangan'],
    ['ICBP', 'Indofood CBP Sukses Makmur Tbk', 'IDR', 6775, 6475, 'Konsumer'],
    ['GOTO', 'GoTo Gojek Tokopedia Tbk', 'IDR', 25, 25, 'Teknologi'],
    ['NVDA', 'NVIDIA Corporation (US)', 'USD', 166.19, 173.73, 'Teknologi global'],
    ['AAPL', 'Apple Inc (US)', 'USD', 354.88, 355.36, 'Teknologi global'],
  ].map(row),
}
