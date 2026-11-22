import { useEffect, useRef, useState } from 'react'
import { Bot, LoaderCircle, Send, ShieldCheck, WandSparkles } from 'lucide-react'
import Section from './Section'
import { api } from '../lib/api'
import { digiReply } from '../lib/digi'

const presets = [
  ['Financial Tutor', 'Konsep dasar investasi & manajemen risiko.'],
  ['Stock Researcher', 'Cara membaca fundamental perusahaan.'],
  ['Dividend Strategist', 'Faktor penting strategi dividen.'],
  ['Technical Mentor', 'RSI, EMA, support & resistance.'],
]
const quick = ['Apa itu IHSG?', 'Cara membaca PER dan PBV?', 'Apa risiko dividend trap?', 'Apa itu RSI dan EMA?']
const HELLO = 'Halo! Aku Digi, pendamping belajar DigiVest. Pilih persona, lalu tanyakan hal yang ingin kamu pelajari. Aku membantu secara edukatif dan risk-aware — bukan rekomendasi beli/jual.'

export default function AgentBuilder() {
  const [agent, setAgent] = useState(presets[0][0])
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState([{ role: 'assistant', content: HELLO }])
  const [loading, setLoading] = useState(false)
  const [online, setOnline] = useState(false) // true bila backend + OPENAI_API_KEY aktif
  const feed = useRef(null)

  useEffect(() => {
    let off = false
    api.health().then(h => !off && setOnline(Boolean(h?.aiConfigured))).catch(() => {})
    return () => { off = true }
  }, [])
  useEffect(() => { if (feed.current) feed.current.scrollTop = feed.current.scrollHeight }, [messages, loading])

  async function send(text = prompt) {
    const content = text.trim()
    if (!content || loading) return
    const history = [...messages, { role: 'user', content }]
    setMessages(history)
    setPrompt('')
    let reply
    if (online) {
      setLoading(true)
      try { reply = (await api.ask({ agent, messages: history.slice(-12) })).reply }
      catch { reply = `${digiReply(content)}\n\n(AI online sedang tidak tersedia — jawaban dari materi bawaan.)` }
      setLoading(false)
    } else reply = digiReply(content)
    setMessages(m => [...m, { role: 'assistant', content: reply }])
  }

  return (
    <Section id="agent" label="Build your own AI companion" title="Your market questions deserve a thinking partner." desc="Pilih persona dan ajukan pertanyaan. Digi dirancang sebagai pendamping edukasi, bukan penasihat investasi." dark>
      <div className="grid grid-cols-[minmax(0,1fr)] overflow-hidden rounded-3xl border border-white/10 bg-[#0c1320] lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="min-w-0 border-b border-white/[.07] p-4 sm:p-5 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2 text-sm font-semibold"><WandSparkles size={17} className="text-cyan-200" /> Agent workspace</div>
          <p className="mt-1 text-[10px] text-slate-500">Pilih persona asisten</p>
          <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:block lg:space-y-2 lg:overflow-visible lg:px-0 lg:pb-0" role="radiogroup" aria-label="Persona agent">
            {presets.map(([name, desc]) => (
              <button key={name} role="radio" aria-checked={agent === name} onClick={() => setAgent(name)} className={`w-[200px] shrink-0 rounded-xl border p-3 text-left transition lg:w-full ${agent === name ? 'border-cyan-300/35 bg-cyan-300/[.07]' : 'border-white/[.06] hover:bg-white/[.03]'}`}>
                <span className="block text-xs font-semibold">{name}</span>
                <span className="mt-1 block text-[10px] leading-4 text-slate-500">{desc}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 hidden rounded-xl border border-violet-300/15 bg-violet-300/[.05] p-3 sm:block">
            <p className="flex items-center gap-2 text-[10px] font-semibold text-violet-200"><ShieldCheck size={13} /> Responsible AI</p>
            <p className="mt-2 text-[10px] leading-5 text-slate-500">Tidak memberi sinyal transaksi personal atau menjamin keuntungan. Verifikasi data dan pertimbangkan risiko.</p>
          </div>
        </aside>
        <div className="flex h-[70dvh] max-h-[640px] min-h-[440px] min-w-0 flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-white/[.07] px-4 py-3 sm:px-5 sm:py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-violet-600 text-[#07101b]"><Bot size={18} /></div>
              <div className="min-w-0"><p className="truncate text-xs font-semibold">DigiVest / {agent}</p><p className={`mt-1 flex items-center gap-1 text-[10px] ${online ? 'text-emerald-300' : 'text-yellow-200'}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{online ? 'AI online (backend)' : 'Mode offline · materi bawaan'}</p></div>
            </div>
          </div>
          <div ref={feed} className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[92%] whitespace-pre-line rounded-2xl px-4 py-3 text-[13px] leading-6 sm:max-w-[85%] sm:text-xs ${m.role === 'user' ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white' : 'border border-white/[.07] bg-[#141e2d] text-slate-300'}`}>{m.content}</div>
              </div>
            ))}
            {loading && <div className="flex items-center gap-2 text-xs text-cyan-200"><LoaderCircle size={14} className="animate-spin" /> Digi sedang menyusun jawaban...</div>}
          </div>
          <div className="border-t border-white/[.07] p-3 sm:p-4">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
              {quick.map(q => <button key={q} onClick={() => send(q)} className="shrink-0 rounded-full border border-white/10 px-3 py-2 text-[11px] text-slate-400 hover:border-cyan-300/30 hover:text-cyan-100">{q}</button>)}
            </div>
            <div className="flex gap-2">
              <input value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.nativeEvent.isComposing && send()} placeholder="Tanyakan sesuatu kepada Digi..." aria-label="Pertanyaan untuk Digi" className="input-dark min-w-0 text-xs" />
              <button onClick={() => send()} disabled={loading || !prompt.trim()} aria-label="Kirim" className="grid w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 text-[#06101a] disabled:opacity-40"><Send size={16} /></button>
            </div>
            <p className="mt-2 text-[10px] text-slate-600">Jawaban dapat keliru dan bersifat edukasi. Jangan masukkan data pribadi atau kredensial akun.</p>
          </div>
        </div>
      </div>
    </Section>
  )
}
