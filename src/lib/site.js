export const INSTAGRAM_HANDLE = 'investingdigital_'
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`
export const TAGLINE = 'Edukasi Keuangan · Pasar Modal · Investasi Digital'

export const posts = [
  { tag: 'MARKET PERSPECTIVE', title: 'Demo Besar, IHSG Tetap Hijau?', date: '10 NOV 2026', bg: 'from-blue-950 via-indigo-900 to-cyan-950',
    desc: 'Membaca respons pasar di tengah dinamika sosial dan politik.',
    caption: 'Ketika situasi sosial-politik memanas, pasar tidak selalu bereaksi sama. Di konten ini kita bahas cara membaca IHSG dengan kepala dingin: lihat sektor, aliran dana, dan jangan mengambil keputusan hanya dari satu hari pergerakan.' },
  { tag: 'DIVIDEND EDUCATION', title: 'Hidup dari Dividen Seumur Hidup?', date: '07 NOV 2026', bg: 'from-violet-950 via-purple-900 to-blue-950',
    desc: 'Membedah dividend yield, pertumbuhan, dan ekspektasi realistis.',
    caption: 'Dividen pasif memang menarik, tapi waspadai dividend trap: yield tinggi yang muncul karena harga saham turun atau payout tidak berkelanjutan. Cek laba, arus kas, dan konsistensi pembagian sebelum berekspektasi.' },
  { tag: 'TECHNICAL 101', title: 'Smart Money Concept: Demand Zone', date: '04 NOV 2026', bg: 'from-cyan-950 via-indigo-950 to-slate-950',
    desc: 'Mengenal area permintaan dengan bahasa yang mudah dicerna.',
    caption: 'Bayangkan demand zone seperti area diskon yang pernah diburu banyak pembeli. Konsep ini membantu membaca price action, tetapi bukan jaminan harga akan memantul — selalu siapkan rencana risiko.' },
  { tag: 'INVESTING BASICS', title: 'Investasi Bukan Sekadar FOMO', date: '02 NOV 2026', bg: 'from-slate-900 via-blue-950 to-indigo-950',
    desc: 'Mengenali tujuan, risiko, dan proses sebelum membeli aset.',
    caption: 'FOMO membuat kita membeli di waktu yang salah. Mulai dari tujuan keuangan, dana darurat, profil risiko, lalu rencana yang bisa kamu jalankan secara konsisten.' },
]

export const personas = [
  { id: 'dividend', title: 'Pencari Dividen', desc: 'Pelajari income investing & dividend growth.', icon: '◈', goal: 'Bangun pemahaman income investing yang realistis.', target: '#dividend' },
  { id: 'swing', title: 'Trader Teknikal', desc: 'Eksplorasi pola harga, indikator, dan chart.', icon: '⌁', goal: 'Baca market dengan pendekatan teknikal yang terukur.', target: '#market', tab: 'Teknikal' },
  { id: 'beginner', title: 'Pemula ingin belajar', desc: 'Pahami dasar investasi dari nol, tanpa FOMO.', icon: '✦', goal: 'Belajar investasi dari fondasi yang benar.', target: '#agent' },
  { id: 'value', title: 'Value Investor', desc: 'Pahami valuasi: PER, PBV, dan yield.', icon: '◎', goal: 'Menilai perusahaan lewat fundamental, bukan sekadar tren.', target: '#market', tab: 'Fundamental' },
]

export const asset = p => `${import.meta.env.BASE_URL}${p}`
