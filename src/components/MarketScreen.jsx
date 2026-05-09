import { useState, useCallback } from 'react'
import { useGame } from '../state/gameState.js'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber.js'
import Ticker from './Ticker.jsx'
import TakeCard from './TakeCard.jsx'
import Toast from './Toast.jsx'

let toastId = 0

export default function MarketScreen({ onTapTake }) {
  const { state, dispatch } = useGame()
  const [deckIndex, setDeckIndex] = useState(0)
  const [exhausted, setExhausted] = useState(false)

  const votedIds = new Set(state.openPositions.map(p => p.takeId))
  const takes = state.activeTakes.filter(t => !votedIds.has(t.id))
  const animatedBalance = useAnimatedNumber(state.user.balance)
  const visibleTakes = takes.slice(deckIndex, deckIndex + 3)

  const handleSwipe = useCallback((take, side, stake) => {
    if (side === 'SKIP') {
      setDeckIndex(i => {
        const next = i + 1
        if (next >= takes.length) { setExhausted(true); return 0 }
        return next
      })
      return
    }

    dispatch({ type: 'PLACE_BET', payload: { takeId: take.id, side, stake, text: take.text } })
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: ++toastId,
        message: `${side === 'AGREE' ? '✅' : '❌'} BET PLACED — $${stake} on ${side}`,
        variant: side === 'AGREE' ? 'agree' : 'disagree',
        duration: 1800,
      },
    })

    setDeckIndex(i => {
      const next = i + 1
      if (next >= takes.length) { setExhausted(true); return 0 }
      return next
    })
  }, [dispatch, takes.length])

  return (
    <div className="flex flex-col h-full" style={{ background: '#fafafa' }}>
      <Toast />

      {/* top bar */}
      <div className="flex items-center justify-between px-5 pt-3 pb-2 flex-shrink-0" style={{ background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <div>
          <div
            className="text-3xl font-bold"
            style={{ color: '#ef4444', fontFamily: "'JetBrains Mono', monospace" }}
          >
            ${animatedBalance.toFixed(2)}
          </div>
          <div className="text-sm font-semibold" style={{ color: '#10b981', fontFamily: "'JetBrains Mono', monospace" }}>
            +$127.40 today ↑
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-2xl">🥩</span>
          <span
            className="text-xl font-black tracking-tight"
            style={{ color: '#111', fontFamily: "'JetBrains Mono', monospace" }}
          >
            BEEF
          </span>
        </div>
      </div>

      <Ticker />

      {/* card area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-2" style={{ minHeight: 0 }}>
        {exhausted ? (
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <span className="text-5xl">🐄</span>
            <p className="font-bold text-xl" style={{ color: '#111' }}>You've judged all the beef.</p>
            <p className="text-base" style={{ color: '#aaa' }}>Refreshing the herd…</p>
            <button
              onClick={() => { setExhausted(false); setDeckIndex(0) }}
              className="mt-2 px-6 py-3 rounded-xl font-bold text-white text-base"
              style={{ background: '#ef4444', fontFamily: "'JetBrains Mono', monospace" }}
            >
              BRING MORE BEEF
            </button>
          </div>
        ) : (
          <>
            <div className="relative" style={{ width: 340, height: 440 }}>
              {[...visibleTakes].reverse().map((take, reversedIdx) => {
                const stackIndex = visibleTakes.length - 1 - reversedIdx
                const isTop = stackIndex === 0
                return (
                  <TakeCard
                    key={take.id}
                    take={take}
                    isTop={isTop}
                    stackIndex={stackIndex}
                    onSwipe={(side, stake) => isTop && handleSwipe(take, side, stake)}
                    onTap={() => isTop && onTapTake?.(take)}
                  />
                )
              })}
            </div>

            <p
              className="mt-4 text-sm tracking-widest uppercase"
              style={{ color: '#ccc', fontFamily: "'JetBrains Mono', monospace" }}
            >
              ← DISAGREE &nbsp;·&nbsp; ↑ SKIP &nbsp;·&nbsp; AGREE →
            </p>
          </>
        )}
      </div>
    </div>
  )
}
