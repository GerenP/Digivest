export default function Section({label,title,desc,children,id,dark=false}){
 return <section id={id} className={`px-4 py-16 sm:px-6 sm:py-24 lg:px-8 ${dark?'border-y border-white/[.05] bg-[#0b111d]':''}`}><div className="mx-auto max-w-7xl"><div className="mb-9 max-w-2xl sm:mb-11"><p className="section-label mb-3">{label}</p><h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h2>{desc&&<p className="mt-4 text-sm leading-7 text-slate-400">{desc}</p>}</div>{children}</div></section>
}
