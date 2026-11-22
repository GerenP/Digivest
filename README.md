# DigiVest — Edukasi Keuangan · Pasar Modal · Investasi Digital

Satu proyek gabungan dari tiga versi sebelumnya (`digivest_web_portfolio_analytics_app.tsx`, *DigiVest-Portfolio-React*, *DigiVest v2 Brand & Market Platform*), dengan logo resmi DigiVest, perhitungan yang sudah diperbaiki dan diuji, serta desain responsif penuh (320 px → 1920 px).

## Menjalankan

```bash
npm install
npm run dev        # API (Express :8787) + web (Vite :5173) sekaligus
```
Buka http://localhost:5173. Dari ponsel di jaringan yang sama: `http://<IP-komputer>:5173`.

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Mode pengembangan (API + web) |
| `npm run client` | Hanya frontend — tetap berjalan penuh dalam mode cuplikan |
| `npm run build` | Build produksi ke `dist/` |
| `npm start` | Server produksi: menyajikan `dist/` **dan** API dari satu port (:8787) |
| `npm test` | Uji unit perhitungan (model dividen, cuplikan harga, market mood, average down) |

Tanpa file `.env` semuanya berjalan tanpa error. Salin `.env.example` → `.env` hanya bila ingin mengaktifkan data pasar atau AI online.

## Mode data (jujur & berlabel)
- **CUPLIKAN PENUTUPAN** (default): harga dan perubahan 12 emiten (10 IDX + NVDA/AAPL) per penutupan **Kamis, 12 Nov 2026**, dikompilasi dari sumber publik bertanggal (tercantum di UI dan `src/lib/snapshot.js`), plus market breadth seluruh BEI pada hari itu (560 naik / 147 turun / 238 tetap → mood 72/100). Tidak ada harga acak. Ini **bukan real-time**: angka live ada di chart TradingView atau lewat provider berlisensi. Untuk memperbarui, edit `src/lib/snapshot.js` (isi `price` dan `prev`; persentase dihitung otomatis). RSI/EMA/pola/PER/PBV/yield tidak ditampilkan karena belum ada sumber datanya — tab Teknikal dan Fundamental muncul otomatis begitu datanya terisi.
- **DATA PROVIDER / DELAYED / LIVE**: aktif otomatis bila `IDX_PROVIDER_API_KEY` diisi. Label *LIVE* hanya muncul bila provider sendiri menyatakan real-time. Jika provider gagal, app kembali ke cuplikan penutupan dan menampilkan alasannya.
- **AI "Digi"**: online bila `OPENAI_API_KEY` diisi; jika tidak (atau gagal), menjawab dari materi edukasi bawaan dan menolak permintaan rekomendasi beli/jual.
- Hosting statis tanpa backend? Set `VITE_BACKEND=off` agar tidak ada panggilan `/api`.

## Model Kalkulator Dividen (`src/lib/dividend.js`)
Simulasi bulanan dengan asumsi yang ditampilkan di UI: harga saham tetap; dividen per saham tumbuh *g* per tahun, sehingga yield efektif tahun ke‑n = yield × (1+g)^(n−1); dividen dihitung rata per bulan; top‑up dibeli di akhir bulan; reinvestasi opsional; tanpa pajak/biaya/inflasi. Total dividen dijumlahkan dari angka baris yang tampil, sehingga **tabel dan kartu total selalu cocok**. Diuji terhadap rumus deret geometrik, bunga majemuk bulanan, dan anuitas top‑up.

## Navigasi
- **Layar lebar (≥ 1024 px, mis. laptop/desktop Windows):** navbar di bagian atas dengan semua fitur.
- **Layar sempit (< 1024 px, mis. ponsel/tablet Android):** tombol ☰ di kiri membuka **menu samping** (drawer) berisi semua fitur. Tutup dengan tombol ✕, ketuk area gelap, tombol Esc, atau pilih fitur. Fokus keyboard terkunci di dalam menu dan kembali ke tombol ☰ saat ditutup; scroll halaman dikunci selama menu terbuka.

Pergantian berdasarkan lebar layar (bukan deteksi OS), sehingga jendela sempit di Windows pun mendapat menu samping.

## Kalkulator Average Down (`src/lib/averagedown.js`)
Rumus: rata-rata baru = (lembar lama × rata-rata lama + lembar baru × harga beli × (1 + biaya%)) ÷ total lembar; 1 lot = 100 lembar. Tiga cara hitung: **jumlah lot yang dibeli**, **dana yang tersedia** (lot dibulatkan ke bawah, sisa dana ditampilkan), atau **target rata-rata** (jumlah minimal, dibulatkan ke atas). Hasil: rata-rata baru, total kepemilikan, dana dibutuhkan, titik impas, rugi/untung saat ini, dan tabel skenario. Biaya jual, pajak, dan fraksi harga tidak dihitung. Angka IDR memakai titik = ribuan dan koma = desimal (USD sebaliknya), jadi mengetik `5.000` berarti 5000. Diuji terhadap rumus rata-rata tertimbang, keminimalan jumlah pada mode target, dan sisa dana.

## Logo
Aset dibuat dari gambar logo yang kamu kirim (`public/`): `logo-mark.png` (simbol DV, latar transparan), `logo-lockup.png` (simbol + wordmark), `logo-full.webp/png` (artwork asli), `favicon.png`, `apple-touch-icon.png`. Header memakai simbol + wordmark teks agar tetap tajam di layar kecil; hero menampilkan artwork penuh; footer memakai lockup.

## Perbaikan penting dari ketiga versi
- Rumus dividen versi TSX salah (yield bertambah *poin persen*, bukan tumbuh persentase) → model baru + uji.
- Semua harga "contoh" pada versi lama adalah angka karangan yang jauh dari pasar (mis. BBCA Rp 10.325, padahal penutupan 12 Nov 2026 Rp 5.475), dan harga TSX bergerak acak dengan pembulatan yang salah → diganti cuplikan penutupan bertanggal bersumber; simulasi acak dihapus.
- Tombol *View* AAPL membuka `IDX:AAPL` (salah) → `NASDAQ:AAPL`.
- Jumlah per pola (mis. "Demand Zone 18") hard‑coded dan tak cocok dengan tabel → dihitung dari data.
- Filter cepat & tab Fundamental/Fear & Greed/Price versi React hanya tampilan → kini berfungsi.
- `tailwind.config.js` v1/v2 menimpa palet `cyan`/`violet` sehingga ratusan kelas (`cyan-300`, `from-cyan-400`, …) tidak menghasilkan CSS (tombol utama tak terlihat) → diperbaiki.
- Jam berlabel WIB memakai zona waktu browser → memakai `Asia/Jakarta`.
- Klaim tak terverifikasi dihapus: "150K+ Community Reach", "800+ Saham", "98%", "Active Portfolio Manager", "Real‑Time"/"data terhubung" pada data simulasi, label "Strong Buy", alokasi portofolio & proyeksi 7% yang dikarang, serta angka likes/net‑buy. Edit di `src/lib/site.js` bila kamu punya data resmi.

## Struktur
```
public/            logo & favicon
server/index.js    Express: proxy provider IDX, AI chat, sajikan dist/
src/lib/           dividend.js, averagedown.js, market.js, snapshot.js, useMarket.js, digi.js, site.js, api.js, format.js (+ *.test.js)
src/components/    Nav, Hero, About, Portfolio, Products, AgentBuilder, Screener, DividendLab, AverageDown, TradingTerminal, Footer, Modal, Onboarding
```
Akun Instagram, teks konten, dan persona diatur di `src/lib/site.js`.

## Catatan
- Chart memakai widget TradingView publik (butuh internet; data dapat tertunda). Bila gagal dimuat, tampil pesan dan tautan "Buka di TradingView".
- Seluruh konten, simulasi, dan data cuplikan bersifat edukasi — bukan nasihat atau rekomendasi investasi.
