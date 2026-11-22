import {BookOpen,Compass,Target,Users} from 'lucide-react'
import Section from './Section'
const cards=[
 {icon:Compass,title:'Our vision',text:'Membangun generasi yang lebih sadar finansial dan mampu membaca peluang sekaligus risiko di pasar modal.'},
 {icon:Target,title:'Our mission',text:'Menyederhanakan konsep keuangan melalui edukasi visual, analisis berbasis data, dan pengalaman digital yang mudah dipahami.'},
 {icon:BookOpen,title:'Our approach',text:'Learn the concept, understand the data, question the risk, then make an informed decision.'}
]
export default function About(){return <Section id="about" label="Who we are" title="Membuat dunia investasi lebih mudah dipahami." desc="DigiVest hadir di persimpangan edukasi keuangan, pasar modal, dan teknologi digital. Kami percaya literasi finansial harus terasa relevan, bukan intimidatif." dark>
 <div className="grid gap-4 md:grid-cols-3">{cards.map(({icon:Icon,title,text})=><article key={title} className="rounded-2xl border border-white/[.08] bg-[#101827] p-6 transition hover:-translate-y-1 hover:border-cyan-300/25"><div className="mb-6 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-cyan-300/15 to-violet-500/20 text-cyan-200"><Icon size={20}/></div><h3 className="font-display text-xl font-bold">{title}</h3><p className="mt-3 text-xs leading-6 text-slate-400">{text}</p></article>)}</div>
 <div className="mt-7 grid gap-5 rounded-3xl border border-white/[.08] bg-gradient-to-r from-[#15233a] to-[#17132b] p-7 md:grid-cols-[1fr_auto] md:items-center"><div><p className="section-label">Built for Gen-Z</p><h3 className="mt-2 font-display text-2xl font-bold">From financial curiosity to financial confidence.</h3><p className="mt-2 max-w-2xl text-xs leading-6 text-slate-400">Konten DigiVest menghubungkan isu ekonomi, dinamika IHSG, strategi dividen, dan teknologi dengan bahasa yang lebih dekat dengan generasi muda.</p></div><div className="flex items-center gap-3 text-xs text-slate-300"><Users size={20} className="text-violet-300"/> Community-driven learning</div></div>
 </Section>}
