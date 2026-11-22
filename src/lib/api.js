async function request(path, options = {}) {
  const response = await fetch(path, { headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(options.timeout ?? 15000), ...options })
  const data = await response.json().catch(() => ({ error: 'Respons server tidak valid' }))
  if (!response.ok) throw new Error(data.error || `Request gagal (${response.status})`)
  return data
}
let healthProbe // satu kali probe dipakai bersama (Screener & AI Agent)
export const api = {
  health: () => {
    if (import.meta.env.VITE_BACKEND === 'off') return Promise.reject(new Error('Backend dinonaktifkan (VITE_BACKEND=off)'))
    return (healthProbe ??= request('/api/health', { timeout: 4000 }))
  },
  screener: (params = {}) => request(`/api/market/screener?${new URLSearchParams(params)}`),
  fundamentals: ticker => request(`/api/market/fundamentals/${encodeURIComponent(ticker)}`),
  sentiment: () => request('/api/market/sentiment'),
  history: (ticker, interval = '1D') => request(`/api/market/history/${encodeURIComponent(ticker)}?interval=${interval}`),
  ask: payload => request('/api/agent/chat', { method: 'POST', body: JSON.stringify(payload), timeout: 35000 }),
}
