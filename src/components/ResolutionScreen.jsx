import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PARTICLES = ['💸', '🔥', '💰', '🏆', '💚', '⚡']

function WinParticles() {
  const items = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    emoji: PARTICLES[i % PARTICLES.length],
    x: (Math.random() - 0.5) * 300,
    y: -(80 + Math.random() * 200),
    rotate: (Math.random() - 0.5) * 360,
    delay: Math.random() * 0.4,
  }))
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {items.map(p => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 0 }}
          animate={{ opacity: 0, x: p.x, y: p.y, rotate: p.rotate, scale: 1.5 }}
          transition={{ duration: 1.8, delay: p.delay, ease: 'easeOut' }}
          style={{ position: 'absolute', left: '50%', top: '40%', fontSize: 28 }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  )
}

export default function ResolutionScreen({ event, onDismiss }) {
  const isWin = event.outcome === 'WIN'

  useEffect(() => {
    const t = setTimeout(onDismiss, 4500)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0, scale: 1.06 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      style={{ background: isWin ? '#052e16' : '#0f0f0f', pointerEvents: 'auto' }}
      onClick={onDismiss}
    >
      {isWin && <WinParticles />}

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col items-center gap-4 text-center"
      >
        <span style={{ fontSize: 64 }}>{isWin ? '🏆' : '💀'}</span>

        <p className="text-xs font-black tracking-widest" style={{ color: isWin ? '#4ade80' : '#ef4444', fontFamily: "'JetBrains Mono', monospace" }}>
          POSITION RESOLVED
        </p>

        <p className="font-bold text-lg leading-snug" style={{ color: isWin ? '#fff' : '#555', fontFamily: "'JetBrains Mono', monospace", maxWidth: 260 }}>
          "{event.text}"
        </p>

        <div className="flex items-center gap-3 mt-2">
          <span className="text-sm font-bold px-3 py-1 rounded-full"
            style={{
              background: event.side === 'AGREE' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
              color: event.side === 'AGREE' ? '#4ade80' : '#f87171',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {event.side}
          </span>
          <span className="text-sm font-bold" style={{ color: '#555', fontFamily: "'JetBrains Mono', monospace" }}>
            ${event.stake} staked
          </span>
        </div>

        <motion.p
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
          className="font-black"
          style={{
            fontSize: 52,
            fontFamily: "'JetBrains Mono', monospace",
            color: isWin ? '#fbbf24' : '#ef4444',
          }}
        >
          {isWin ? `+$${event.payout}` : `-$${event.stake}`}
        </motion.p>

        <p className="font-black text-sm" style={{ color: isWin ? '#4ade80' : '#ef4444', fontFamily: "'JetBrains Mono', monospace" }}>
          {isWin ? '🔥 YOU CALLED IT' : '😈 THE MARKET HUMBLED YOU'}
        </p>

        <p className="text-xs mt-4" style={{ color: '#333', fontFamily: "'JetBrains Mono', monospace" }}>
          tap to dismiss
        </p>
      </motion.div>
    </motion.div>
  )
}
