import { asset } from '../lib/site'

// Logo resmi DigiVest (gambar yang diunggah) — simbol "DV" + wordmark teks agar tetap tajam & terbaca di layar kecil.
export default function Brand({ href = '#top', onClick }) {
  return (
    <a href={href} onClick={onClick} className="flex shrink-0 items-center gap-2.5" aria-label="DigiVest — ke atas">
      <img src={asset('logo-mark.png')} alt="" width="520" height="294" className="h-8 w-auto sm:h-9" />
      <span className="font-display text-[20px] font-bold leading-none tracking-tight sm:text-[22px]">
        Digi<span className="gradient-text">Vest</span>
      </span>
    </a>
  )
}
