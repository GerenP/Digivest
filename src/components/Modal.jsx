import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({ onClose, label, children, wide = false }) {
  const box = useRef(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = e => e.key === 'Escape' && closeRef.current()
    document.addEventListener('keydown', onKey)
    box.current?.focus()
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [])
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#050811]/85 backdrop-blur-md sm:items-center sm:p-4"
      onMouseDown={e => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={box}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`relative max-h-[92dvh] w-full animate-rise overflow-y-auto rounded-t-3xl border border-white/10 bg-[#101725] shadow-[0_30px_120px_rgba(0,0,0,.65)] outline-none sm:rounded-3xl ${wide ? 'sm:max-w-2xl' : 'sm:max-w-xl'}`}
      >
        <button onClick={onClose} aria-label="Tutup" className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white">
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  )
}
