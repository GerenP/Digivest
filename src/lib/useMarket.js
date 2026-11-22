import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from './api'
import { fromProvider, sentimentFromCounts, sentimentOf, withChange } from './market'
import { SNAPSHOT } from './snapshot'

const SNAP_ROWS = SNAPSHOT.rows.map(withChange)
const { advancing, declining, unchanged } = SNAPSHOT.breadth
const SNAP_MOOD = sentimentFromCounts(advancing, declining, unchanged)

// Mode: 'snapshot' (default, tanpa backend) → 'live' / 'delayed' / 'provider' bila backend + API key provider aktif
// → kembali ke 'snapshot' bila provider gagal. Tidak ada harga acak/simulasi.
export function useMarket() {
  const [s, setS] = useState({ mode: 'snapshot', rows: SNAP_ROWS, updatedAt: null, label: SNAPSHOT.label, error: '', loading: false })
  const pullRef = useRef(null)

  useEffect(() => {
    let off = false
    let timer
    let gotLive = false
    const startSnapshot = (error = '') => {
      clearInterval(timer)
      pullRef.current = null
      setS({ mode: 'snapshot', rows: SNAP_ROWS, updatedAt: null, label: SNAPSHOT.label, error, loading: false })
    }
    const startLive = () => {
      const pull = async () => {
        setS(p => ({ ...p, loading: true }))
        try {
          const res = await api.screener({})
          if (off) return
          const rows = (res.items || []).map(fromProvider).filter(x => x.code && x.code !== 'undefined')
          if (!rows.length) throw new Error('Provider tidak mengembalikan data.')
          gotLive = true
          const m = String(res.mode || '').toLowerCase()
          setS({ mode: /delay/.test(m) ? 'delayed' : /real|live/.test(m) ? 'live' : 'provider', rows, updatedAt: res.updatedAt || Date.now(), label: '', error: '', loading: false })
        } catch (e) {
          if (off) return
          if (!gotLive) startSnapshot(`${e.message} — menampilkan cuplikan penutupan.`)
          else setS(p => ({ ...p, error: e.message, loading: false }))
        }
      }
      pullRef.current = pull
      pull()
      timer = setInterval(pull, 10000)
    }
    api.health().then(h => { if (!off && h?.providerConfigured) startLive() }).catch(() => {})
    return () => { off = true; clearInterval(timer) }
  }, [])

  const refresh = useCallback(() => pullRef.current?.(), [])
  return { ...s, sentiment: s.mode === 'snapshot' ? SNAP_MOOD : sentimentOf(s.rows), refresh }
}
