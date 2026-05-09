import { useState, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { GameProvider } from './state/GameProvider.jsx'
import { useGame } from './state/gameState.js'
import { startSimulation } from './utils/liveSimulation.js'
import PhoneFrame from './components/PhoneFrame.jsx'
import TabBar from './components/TabBar.jsx'
import MarketScreen from './components/MarketScreen.jsx'
import PortfolioScreen from './components/PortfolioScreen.jsx'
import LeaderboardScreen from './components/LeaderboardScreen.jsx'
import SubmitScreen from './components/SubmitScreen.jsx'
import CommentsModal from './components/CommentsModal.jsx'
import ResolutionScreen from './components/ResolutionScreen.jsx'

const resolutionsFired = { win: false, loss: false }

function AppShell() {
  const [activeTab, setActiveTab] = useState('market')
  const [selectedTake, setSelectedTake] = useState(null)
  const [resolution, setResolution] = useState(null)
  const { state, dispatch } = useGame()
  const stateRef = useRef(state)
  const tabRef = useRef(activeTab)

  useEffect(() => { stateRef.current = state }, [state])
  useEffect(() => { tabRef.current = activeTab }, [activeTab])

  useEffect(() => {
    const stop = startSimulation(
      dispatch,
      () => stateRef.current,
      () => tabRef.current,
    )
    return stop
  }, [dispatch])

  useEffect(() => {
    if (resolutionsFired.win && resolutionsFired.loss) return
    const win = !resolutionsFired.win ? setTimeout(() => {
      resolutionsFired.win = true
      setResolution({ outcome: 'WIN', text: "Remote work made everyone worse at their actual jobs", side: 'DISAGREE', stake: 75, payout: 198 })
    }, 20000) : null
    const loss = !resolutionsFired.loss ? setTimeout(() => {
      resolutionsFired.loss = true
      setResolution({ outcome: 'LOSS', text: "College is a scam for 80% of the people who go", side: 'AGREE', stake: 150, payout: 0 })
    }, 45000) : null
    return () => { clearTimeout(win); clearTimeout(loss) }
  }, [])

  return (
    <PhoneFrame
      tabBar={<TabBar active={activeTab} onSelect={setActiveTab} />}
      overlay={
        <AnimatePresence>
          {resolution && (
            <ResolutionScreen key={resolution.outcome} event={resolution} onDismiss={() => setResolution(null)} />
          )}
          {!resolution && selectedTake && (
            <CommentsModal key={selectedTake.id} take={selectedTake} onClose={() => setSelectedTake(null)} />
          )}
        </AnimatePresence>
      }
    >
      <div className="h-full" style={{ background: '#fafafa' }}>
        {activeTab === 'market'      && <MarketScreen onTapTake={setSelectedTake} />}
        {activeTab === 'portfolio'   && <PortfolioScreen />}
        {activeTab === 'leaderboard' && <LeaderboardScreen />}
        {activeTab === 'submit'      && <SubmitScreen />}
      </div>
    </PhoneFrame>
  )
}

export default function App() {
  return (
    <GameProvider>
      <AppShell />
    </GameProvider>
  )
}
