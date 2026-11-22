import { ArrowUpRight, Instagram } from 'lucide-react'
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, TAGLINE, asset } from '../lib/site'

const links = [['Tentang', '#about'], ['Konten', '#portfolio'], ['Produk', '#products'], ['AI Agent', '#agent'], ['Screener', '#market'], ['Dividen', '#dividend'], ['Average Down', '#average'], ['Chart', '#terminal']]

export default function Footer() {
  return (
    <footer className="border-t border-white/[.06] bg-[#06080e] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_auto] md:items-start">
        <div>
          <a href="#top" aria-label="DigiVest — kembali ke atas"><img src={asset('logo-lockup.png')} alt="DigiVest" width="640" height="505" className="h-24 w-auto sm:h-28" /></a>
          <p className="mt-3 text-xs text-slate-500">{TAGLINE}</p>
        </div>
        <div className="flex flex-col gap-5 md:items-end">
          <div className="flex flex-wrap gap-x-5 gap-y-3 text-xs text-slate-500">{links.map(([t, h]) => <a key={t} href={h} className="hover:text-white">{t}</a>)}</div>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs text-cyan-200 hover:text-white"><Instagram size={15} /> @{INSTAGRAM_HANDLE} <ArrowUpRight size={13} /></a>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-7xl border-t border-white/[.05] pt-5 text-[10px] leading-5 text-slate-600">
        © {new Date().getFullYear()} DigiVest. Seluruh konten, simulasi, dan data cuplikan bersifat edukasi dan bukan nasihat atau rekomendasi investasi. Investasi mengandung risiko; nilai dapat naik maupun turun. Data pasar live hanya tersedia bila provider berlisensi dikonfigurasi dan dapat tertunda.
      </p>
    </footer>
  )
}
