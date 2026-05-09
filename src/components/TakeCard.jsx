import { memo, useState, useEffect } from 'react'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import { useGame } from '../state/gameState.js'
import { getDevilsAdvocate, getAnalystNote } from '../utils/claudeInsights.js'

const SLOTS = [
  { left: 6,  top: 76,  dir: { x: -40, y: 0  } },
  { right: 6, top: 76,  dir: { x: 40,  y: 0  } },
  { left: 6,  top: 136, dir: { x: -40, y: 0  } },
  { right: 6, top: 136, dir: { x: 40,  y: 0  } },
  { left: 6,  top: 196, dir: { x: -30, y: 10 } },
  { right: 6, top: 196, dir: { x: 30,  y: 10 } },
]

const GENERIC_REACTIONS = [
  { username: '@anon_beef', side: 'AGREE',    text: 'umm hmm 👀' },
  { username: '@market_watcher', side: 'AGREE',    text: 'I knew it 🔥' },
  { username: '@hotpocket99', side: 'AGREE',    text: 'called it from day one' },
  { username: '@lurker_mode', side: 'AGREE',    text: 'finally someone said it' },
  { username: '@cold_takes', side: 'DISAGREE', text: 'absolutely not lmao' },
  { username: '@contrarian_', side: 'DISAGREE', text: 'nah this is cooked' },
  { username: '@ratio_lord', side: 'DISAGREE', text: 'hard disagree bestie' },
  { username: '@beef_skeptic', side: 'AGREE',    text: 'this one got me thinking' },
  { username: '@just_vibes', side: 'AGREE',    text: 'sending this to everyone' },
  { username: '@devil_anon', side: 'DISAGREE', text: 'who let this person cook' },
  { username: '@based_dept', side: 'AGREE',    text: 'BASED 💯' },
  { username: '@scepticpill', side: 'DISAGREE', text: 'the delusion is real' },
]

function FloatingComments({ takeId }) {
  const { state } = useGame()
  const seeded = state.comments[takeId] || []
  const comments = seeded.length ? seeded : GENERIC_REACTIONS
  const [active, setActive] = useState([])

  useEffect(() => {
    if (!comments.length) return
    let i = 0
    const show = () => {
      const comment = comments[i % comments.length]
      i++
      const slot = SLOTS[Math.floor(Math.random() * SLOTS.length)]
      const id = Date.now() + Math.random()
      setActive(prev => prev.length >= 2 ? [{ id, comment, slot }] : [...prev, { id, comment, slot }])
      setTimeout(() => setActive(prev => prev.filter(a => a.id !== id)), 2400)
    }
    show()
    const t = setInterval(show, 1400)
    return () => clearInterval(t)
  }, [comments.length, takeId])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 15, borderRadius: 24 }}>
      <AnimatePresence>
        {active.map(({ id, comment, slot }) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, x: slot.dir.x, y: slot.dir.y }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.35 }}
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              ...(slot.left !== undefined ? { left: slot.left } : { right: slot.right }),
              top: slot.top,
              maxWidth: 148,
              background: comment.side === 'AGREE'
                ? 'rgba(16,185,129,0.92)'
                : 'rgba(239,68,68,0.92)',
              color: '#111',
              borderRadius: 10,
              padding: '5px 9px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
            }}
          >
            <p style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, opacity: 0.8, marginBottom: 1 }}>
              {comment.username}
            </p>
            <p style={{ fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 600, lineHeight: 1.3 }}>
              {comment.text.length > 38 ? comment.text.slice(0, 38) + '…' : comment.text}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

const SPICE = {
  1: { label: 'MILD',    icon: '🌶️',       color: '#f59e0b' },
  2: { label: 'SPICY',   icon: '🌶️🌶️',     color: '#f97316' },
  3: { label: 'NUCLEAR', icon: '🌶️🌶️🌶️', color: '#ef4444' },
}

const STAKES = [10, 50, 100, 500]

function formatTime(mins) {
  if (mins < 60) return `${mins}m left`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m left` : `${h}h left`
}

const TakeCard = memo(function TakeCard({ take, onSwipe, onTap, isTop, stackIndex }) {
  const [stake, setStake] = useState(50)
  const [activeInsight, setActiveInsight] = useState(null)
  const [devilText, setDevilText] = useState(null)
  const [analystText, setAnalystText] = useState(null)
  const [insightLoading, setInsightLoading] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const agreeOpacity = useTransform(x, [20, 120], [0, 1])
  const disagreeOpacity = useTransform(x, [-120, -20], [1, 0])
  const agreeGlow = useTransform(x, [0, 120], [0, 0.5])
  const disagreeGlow = useTransform(x, [-120, 0], [0.5, 0])

  const spice = SPICE[take.spice] ?? SPICE[1]
  const scale = isTop ? 1 : stackIndex === 1 ? 0.95 : 0.9
  const yOffset = isTop ? 0 : stackIndex === 1 ? 8 : 16
  const opacity = isTop ? 1 : stackIndex === 1 ? 0.7 : 0.4
  const dark = !!take.isPrivate
  const urgent = take.timeLeftMinutes <= 60
  const closing = take.timeLeftMinutes <= 30

  async function handleInsight(type) {
    if (activeInsight === type) { setActiveInsight(null); return }
    setActiveInsight(type)
    const alreadyLoaded = type === 'devil' ? devilText : analystText
    if (alreadyLoaded) return
    setInsightLoading(true)
    try {
      const text = type === 'devil' ? await getDevilsAdvocate(take) : await getAnalystNote(take)
      if (type === 'devil') setDevilText(text || 'The crowd is smarter than you think.')
      else setAnalystText(text || 'Analyst unavailable. Probably also betting on this.')
    } catch {
      if (type === 'devil') setDevilText('The crowd is smarter than you think.')
      else setAnalystText('Analyst unavailable. Probably also betting on this.')
    } finally {
      setInsightLoading(false)
    }
  }

  function handleDragEnd(_, info) {
    if (info.offset.x > 100)       onSwipe('AGREE', stake)
    else if (info.offset.x < -100) onSwipe('DISAGREE', stake)
    else if (info.offset.y < -100) onSwipe('SKIP', stake)
  }

  if (!isTop) {
    return (
      <div
        className="absolute"
        style={{
          width: 340, height: 520, borderRadius: 24,
          background: dark ? '#1a1a1a' : '#fff',
          boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.08)',
          transform: `translateY(${yOffset}px) scale(${scale})`,
          opacity, top: 0, left: 0,
        }}
      />
    )
  }

  return (
    <motion.div
      style={{ x, y, rotate, position: 'absolute', top: 0, left: 0, zIndex: 10, cursor: 'grab' }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.8}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
    >
      <motion.div className="absolute inset-0 pointer-events-none"
        style={{ opacity: agreeGlow, boxShadow: '0 0 60px rgba(16,185,129,0.5)', borderRadius: 24 }}
      />
      <motion.div className="absolute inset-0 pointer-events-none"
        style={{ opacity: disagreeGlow, boxShadow: '0 0 60px rgba(239,68,68,0.5)', borderRadius: 24 }}
      />

      <div
        style={{
          width: 340, height: 520, borderRadius: 24,
          background: dark ? '#111' : '#fff',
          animation: urgent ? (dark ? 'urgent-glow-dark 1.4s ease-in-out infinite' : 'urgent-glow 1.4s ease-in-out infinite') : 'none',
          boxShadow: urgent ? undefined : dark
            ? '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(251,191,36,0.2)'
            : '0 8px 40px rgba(0,0,0,0.12)',
          padding: 24,
          display: 'flex', flexDirection: 'column',
          position: 'relative', userSelect: 'none',
        }}
      >
        {/* AGREE stamp */}
        <motion.div style={{
          opacity: agreeOpacity, position: 'absolute', top: 24, right: 24, zIndex: 20,
          pointerEvents: 'none',
          border: '3px solid #10b981', color: '#10b981', padding: '5px 14px',
          borderRadius: 8, fontWeight: 900, fontSize: 18, transform: 'rotate(-12deg)',
          fontFamily: "'JetBrains Mono', monospace",
          background: dark ? 'rgba(16,185,129,0.15)' : '#f0fdf4',
        }}>
          AGREE 💚
        </motion.div>

        {/* DISAGREE stamp */}
        <motion.div style={{
          opacity: disagreeOpacity, position: 'absolute', top: 24, left: 24, zIndex: 20,
          pointerEvents: 'none',
          border: '3px solid #ef4444', color: '#ef4444', padding: '5px 14px',
          borderRadius: 8, fontWeight: 900, fontSize: 18, transform: 'rotate(12deg)',
          fontFamily: "'JetBrains Mono', monospace",
          background: dark ? 'rgba(239,68,68,0.15)' : '#fff5f5',
        }}>
          DISAGREE 💔
        </motion.div>

        {/* CLOSING banner */}
        {closing && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            background: '#ef4444', borderRadius: '24px 24px 0 0',
            padding: '6px 0', textAlign: 'center',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 900, fontSize: 13, color: '#fff', letterSpacing: '0.1em',
            animation: 'blink-badge 1s ease-in-out infinite',
            zIndex: 5,
          }}>
            🚨 CLOSING IN {take.timeLeftMinutes}m — PLACE YOUR BET
          </div>
        )}

        {/* header row */}
        <div className="flex items-center justify-between mb-2" style={{ marginTop: closing ? 28 : 0 }}>
          <div className="flex items-center gap-2">
            {/* comments button */}
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); onTap?.() }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold transition-all"
              style={{
                background: dark ? 'rgba(255,255,255,0.08)' : '#f5f5f5',
                color: dark ? '#666' : '#bbb',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              💬
            </button>
            {dark ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-bold"
                style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)', fontFamily: "'JetBrains Mono', monospace" }}
              >
                🔒 DARK POOL
              </div>
            ) : urgent ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-bold"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', fontFamily: "'JetBrains Mono', monospace", animation: 'blink-badge 1.4s ease-in-out infinite' }}
              >
                ⚡ {take.timeLeftMinutes}m LEFT
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold"
            style={{
              background: spice.color + (dark ? '25' : '15'),
              color: spice.color,
              border: `1px solid ${spice.color}30`,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <span>{spice.icon}</span>
            <span>{spice.label}</span>
          </div>
        </div>

        {/* take text + insight overlay */}
        <div className="flex-1 relative flex items-center justify-center px-2" style={{ minHeight: 0 }}>
          <p
            className="font-bold text-center leading-tight"
            style={{ color: dark ? '#fff' : '#111', fontSize: take.text.length > 50 ? 22 : take.text.length > 35 ? 26 : 30 }}
          >
            "{take.text}"
          </p>
          <AnimatePresence>
            {activeInsight && (
              <motion.div
                key={activeInsight}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex flex-col rounded-2xl p-4 overflow-y-auto"
                style={{
                  background: activeInsight === 'devil' ? 'rgba(185,28,28,0.97)' : 'rgba(30,64,175,0.97)',
                  zIndex: 16,
                }}
              >
                <p className="text-xs font-black mb-2 tracking-widest" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'JetBrains Mono', monospace" }}>
                  {activeInsight === 'devil' ? '😈 SATAN SPEAKS' : '📟 BEEF ORACLE'}
                </p>
                <p className="text-sm font-semibold leading-snug" style={{ color: '#fff', fontFamily: 'Inter, sans-serif' }}>
                  {insightLoading
                    ? (activeInsight === 'devil' ? 'Cooking up a counter...' : 'Reading the market...')
                    : (activeInsight === 'devil' ? devilText : analystText)
                  }
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* odds bar */}
        <div className="mb-3">
          <div className="flex justify-between mb-1.5">
            <span className="text-sm font-bold" style={{ color: '#10b981', fontFamily: "'JetBrains Mono', monospace" }}>
              AGREE {take.agreePct}%
            </span>
            <span className="text-sm font-bold" style={{ color: '#ef4444', fontFamily: "'JetBrains Mono', monospace" }}>
              {100 - take.agreePct}% DISAGREE
            </span>
          </div>
          <div className="w-full rounded-full overflow-hidden" style={{ height: 12, background: dark ? '#333' : '#f0f0f0' }}>
            <div className="h-full flex">
              <div style={{ width: `${take.agreePct}%`, background: '#10b981' }} />
              <div style={{ width: `${100 - take.agreePct}%`, background: '#ef4444' }} />
            </div>
          </div>
        </div>

        {/* stats */}
        <p className="text-center text-sm mb-3" style={{ color: dark ? '#555' : '#aaa', fontFamily: "'JetBrains Mono', monospace" }}>
          {dark
            ? `🔒 ${take.joinedCount || 0} joined · ${take.voteCount} voted · $${(take.totalPool || 0).toLocaleString()} staked · ${formatTime(take.timeLeftMinutes)}`
            : urgent
              ? `$${take.totalPool.toLocaleString()} pool · ${take.voteCount.toLocaleString()} votes`
              : `$${take.totalPool.toLocaleString()} pool · ${take.voteCount.toLocaleString()} votes · ${formatTime(take.timeLeftMinutes)}`
          }
        </p>

        {/* insight buttons */}
        <div className="flex gap-2 mb-3">
          {[['devil', '😈 SATAN'], ['analyst', '📟 BEEF ORACLE']].map(([type, label]) => (
            <button
              key={type}
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); handleInsight(type) }}
              className="flex-1 py-1.5 rounded-xl text-xs font-black transition-all"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                background: activeInsight === type
                  ? (type === 'devil' ? '#b91c1c' : '#1d4ed8')
                  : (dark ? '#1f1f1f' : '#f5f5f5'),
                color: activeInsight === type ? '#fff' : (dark ? '#444' : '#bbb'),
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* stake selector */}
        <div className="flex gap-2 justify-center">
          {STAKES.map(s => (
            <button
              key={s}
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); setStake(s) }}
              className="flex-1 py-2 rounded-xl font-bold transition-all"
              style={{
                fontSize: 15,
                fontFamily: "'JetBrains Mono', monospace",
                background: stake === s
                  ? (dark ? '#fbbf24' : '#ef4444')
                  : (dark ? '#1f1f1f' : '#f5f5f5'),
                color: stake === s
                  ? (dark ? '#111' : '#fff')
                  : (dark ? '#555' : '#888'),
                border: stake === s
                  ? `1.5px solid ${dark ? '#fbbf24' : '#fbbf24'}`
                  : `1.5px solid ${dark ? '#2a2a2a' : 'transparent'}`,
              }}
            >
              ${s}
            </button>
          ))}
        </div>

        {/* posted by */}
        <p className="text-center mt-2" style={{ color: dark ? '#333' : '#ccc', fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
          Posted by {take.submittedBy}
        </p>

        <FloatingComments takeId={take.id} />
      </div>
    </motion.div>
  )
})

export default TakeCard
