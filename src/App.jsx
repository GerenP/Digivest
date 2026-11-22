import { useCallback, useEffect, useState } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import About from './components/About'
import Portfolio from './components/Portfolio'
import Products from './components/Products'
import AgentBuilder from './components/AgentBuilder'
import Screener from './components/Screener'
import DividendLab from './components/DividendLab'
import AverageDown from './components/AverageDown'
import TradingTerminal from './components/TradingTerminal'
import Footer from './components/Footer'
import Onboarding from './components/Onboarding'
import { useMarket } from './lib/useMarket'
import { personas } from './lib/site'

const KEY = 'digivest-onboarded'
const seen = () => { try { return sessionStorage.getItem(KEY) === '1' } catch { return false } }
const mark = () => { try { sessionStorage.setItem(KEY, '1') } catch { /* mode privat: abaikan */ } }
const go = id => requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))

export default function App() {
  const market = useMarket()
  const [setup, setSetup] = useState(false)
  const [profile, setProfile] = useState(null)
  const [symbol, setSymbol] = useState('IDX:COMPOSITE')
  const [screenerReq, setScreenerReq] = useState(null)

  useEffect(() => { if (!seen()) setSetup(true) }, [])
  const close = useCallback(() => { mark(); setSetup(false) }, [])
  const done = useCallback(p => {
    mark()
    setProfile(p)
    setSetup(false)
    const t = personas.find(x => x.id === p.persona)
    if (t?.tab) setScreenerReq({ tab: t.tab, n: Date.now() })
    if (t) setTimeout(() => go(t.target.slice(1)), 60)
  }, [])
  const openChart = useCallback(sym => { setSymbol(sym); go('terminal') }, [])

  return (
    <div className="min-h-dvh overflow-x-clip bg-ink text-slate-100">
      <Nav onSetup={() => setSetup(true)} market={market} />
      <main>
        <Hero goal={personas.find(p => p.id === profile?.persona)?.goal} />
        <About />
        <Portfolio />
        <Products />
        <AgentBuilder />
        <Screener market={market} onChart={openChart} request={screenerReq} />
        <DividendLab preset={profile} />
        <AverageDown />
        <TradingTerminal symbol={symbol} onSymbol={setSymbol} />
      </main>
      <Footer />
      {setup && <Onboarding onClose={close} onDone={done} />}
    </div>
  )
}
