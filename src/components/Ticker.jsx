import { useEffect, useRef } from 'react'
import { useGame } from '../state/gameState.js'

const SPEED = 60 // px/sec

export default function Ticker() {
  const { state } = useGame()
  const innerRef = useRef(null)
  const posRef = useRef(0)
  const rafRef = useRef(null)

  // RAF loop — runs once, never restarts
  useEffect(() => {
    const el = innerRef.current
    if (!el) return

    const text = state.ticker.join(' · ')
    el.textContent = text + ' · ' + text

    let last = null
    function tick(ts) {
      if (last === null) last = ts
      const dt = (ts - last) / 1000
      last = ts

      posRef.current -= SPEED * dt

      const half = el.scrollWidth / 2
      if (half > 0 && -posRef.current >= half) {
        posRef.current += half
      }

      el.style.transform = `translateX(${posRef.current}px)`
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update text without touching position or restarting the loop
  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    const text = state.ticker.join(' · ')
    el.textContent = text + ' · ' + text
  }, [state.ticker])

  return (
    <div
      className="h-8 flex items-center overflow-hidden flex-shrink-0"
      style={{ background: '#1a1a1a', borderTop: '1px solid #ef4444', borderBottom: '1px solid #ef4444' }}
    >
      <div
        ref={innerRef}
        className="whitespace-nowrap text-white text-xs"
        style={{ fontFamily: "'JetBrains Mono', monospace", paddingLeft: 16, willChange: 'transform', display: 'inline-block' }}
      />
    </div>
  )
}
