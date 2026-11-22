import { useState } from 'react'
import { ArrowUpRight, Instagram, Play } from 'lucide-react'
import Section from './Section'
import Modal from './Modal'
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, posts } from '../lib/site'

export default function Portfolio() {
  const [open, setOpen] = useState(null)
  const post = open === null ? null : posts[open]
  return (
    <Section id="portfolio" label="Selected works" title="Ideas that make finance feel closer." desc="Portofolio konten edukasi DigiVest — mengubah topik pasar modal menjadi cerita visual yang mudah diikuti. Ketuk kartu untuk membaca ringkasannya.">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {posts.map((p, i) => (
          <button key={p.title} onClick={() => setOpen(i)} className="group block overflow-hidden rounded-2xl border border-white/[.08] bg-[#101827] text-left transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300">
            <span className={`relative flex aspect-[4/3] flex-col justify-between overflow-hidden bg-gradient-to-br ${p.bg} p-5`}>
              <span className="absolute -right-10 -top-12 h-52 w-52 rounded-full border-[26px] border-white/[.05]" />
              <span className="relative flex items-center justify-between text-[9px] font-bold tracking-[.18em] text-white/65"><span>DIGIVEST / 0{i + 1}</span><Instagram size={15} /></span>
              <span className="relative block">
                <span className="block text-[9px] font-bold tracking-[.2em] text-yellow-300">{p.tag}</span>
                <span className="mt-2 block font-display text-2xl font-bold leading-[1.08] text-white">{p.title}</span>
              </span>
              <span className="relative flex justify-between text-[9px] tracking-widest text-white/55"><span>EDUCATE · EMPOWER</span><Play size={14} /></span>
            </span>
            <span className="flex items-center justify-between gap-3 p-4">
              <span className="min-w-0"><span className="block truncate text-xs font-semibold">{p.title}</span><span className="mt-1 block text-[10px] text-slate-500">{p.date}</span></span>
              <span className="shrink-0 rounded-lg border border-white/10 p-2 text-slate-400 group-hover:text-cyan-200"><ArrowUpRight size={16} /></span>
            </span>
          </button>
        ))}
      </div>
      <div className="mt-8 flex flex-col justify-between gap-4 rounded-2xl border border-white/[.08] bg-[#101827] p-5 sm:flex-row sm:items-center">
        <div><p className="text-sm font-semibold">Follow the learning journey</p><p className="mt-1 text-xs text-slate-500">Konten, insight, dan aktivitas komunitas DigiVest.</p></div>
        <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 self-start rounded-lg border border-cyan-300/20 px-4 py-2.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-300/10">@{INSTAGRAM_HANDLE} <ArrowUpRight size={14} /></a>
      </div>
      {post && (
        <Modal onClose={() => setOpen(null)} label={post.title}>
          <div className={`bg-gradient-to-br ${post.bg} px-6 pb-6 pt-14`}>
            <p className="text-[10px] font-bold tracking-[.2em] text-yellow-300">{post.tag}</p>
            <h3 className="mt-2 font-display text-2xl font-bold leading-tight sm:text-3xl">{post.title}</h3>
          </div>
          <div className="space-y-4 p-6">
            <p className="text-sm leading-7 text-slate-300">{post.caption}</p>
            <p className="text-xs text-slate-500">Diunggah: {post.date}</p>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/20 px-4 py-2.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-300/10">Lihat di Instagram <ArrowUpRight size={14} /></a>
          </div>
        </Modal>
      )}
    </Section>
  )
}
