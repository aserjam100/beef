import { useState, useEffect, useRef } from 'react'
import { useGame } from '../state/gameState.js'
import { scoreWithClaude } from '../utils/claudeScorer.js'

let nextId = 200

function GaugeBar({ score }) {
  const color = score < 30 ? '#fbbf24' : score < 60 ? '#f97316' : '#ef4444'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 12, background: '#f0f0f0' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, background: `linear-gradient(90deg, #fbbf24, ${color})` }}
        />
      </div>
      <span className="text-xl font-black w-12 text-right" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>
        {score}
      </span>
    </div>
  )
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return 'BEEF-' + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function SubmitScreen() {
  const { dispatch } = useGame()
  const [text, setText] = useState('')
  const [result, setResult] = useState({ score: 0, label: 'Too vague — give us something to argue about', verdict: 'REJECTED' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isPrivate, setIsPrivate] = useState(false)
  const [roomCode, setRoomCode] = useState(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (!text.trim() || text.trim().length < 10) {
      setResult({ score: 0, label: 'Too vague — give us something to argue about', verdict: 'REJECTED' })
      setError(null)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const r = await scoreWithClaude(text)
        setResult(r)
      } catch {
        setError('AI offline — check your API key')
        setResult({ score: 0, label: 'Could not connect to AI', verdict: 'REJECTED' })
      } finally {
        setLoading(false)
      }
    }, 1500)
    return () => clearTimeout(debounceRef.current)
  }, [text])

  function handleSubmit() {
    if (result.score < 30) return
    const spice = result.score >= 80 ? 3 : result.score >= 60 ? 2 : 1
    const code = isPrivate ? generateRoomCode() : null
    dispatch({ type: 'ADD_TAKE', payload: {
      id: ++nextId, text: text.trim(), spice,
      agreePct: 50, totalPool: 0, voteCount: 0,
      timeLeftMinutes: 360, submittedBy: '@beef_lord',
      isPrivate,
      roomCode: code,
    }})
    if (isPrivate && code) {
      setRoomCode(code)
    } else {
      dispatch({
        type: 'ADD_TOAST',
        payload: { id: Date.now(), message: '🥩 Your beef is now on the market', variant: 'success', duration: 2000 },
      })
    }
    setText('')
    setResult({ score: 0, label: 'Too vague — give us something to argue about', verdict: 'REJECTED' })
  }

  function handleCopyCode() {
    navigator.clipboard?.writeText(roomCode)
    dispatch({
      type: 'ADD_TOAST',
      payload: { id: Date.now(), message: '🔒 Room code copied', variant: 'success', duration: 1500 },
    })
    setRoomCode(null)
  }

  const canSubmit = result.score >= 30 && !loading

  const verdictLabel = loading
    ? '🤖 AI is judging your beef...'
    : result.verdict === 'NUCLEAR' ? '☢️ NUCLEAR — elite beef'
    : result.verdict === 'SPICY'   ? '🌶️ SPICY — genuine controversy'
    : result.verdict === 'ALLOWED' ? '✅ Allowed — could be hotter'
    : !text.trim() ? 'Too vague — give us something to argue about'
    : '❌ Too safe — nobody will argue about this'

  return (
    <div className="flex flex-col h-full" style={{ background: '#fafafa' }}>
      {/* room code modal */}
      {roomCode && (
        <div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-5 px-6"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
        >
          <span className="text-5xl">🔒</span>
          <p className="text-xl font-black text-center" style={{ color: '#fff', fontFamily: "'JetBrains Mono', monospace" }}>
            Dark pool is open
          </p>
          <p className="text-sm text-center" style={{ color: '#aaa', fontFamily: "'JetBrains Mono', monospace" }}>
            Share this code. Only your people get in.
          </p>
          <div
            className="px-8 py-4 rounded-2xl font-black text-3xl tracking-widest"
            style={{ background: '#fbbf24', color: '#111', fontFamily: "'JetBrains Mono', monospace" }}
          >
            {roomCode}
          </div>
          <button
            onClick={handleCopyCode}
            className="w-full py-4 rounded-2xl font-black"
            style={{
              fontSize: 16,
              fontFamily: "'JetBrains Mono', monospace",
              background: '#ef4444',
              color: '#fff',
            }}
          >
            COPY CODE &amp; CLOSE
          </button>
        </div>
      )}

      {/* header */}
      <div className="px-5 pt-4 pb-3 flex-shrink-0" style={{ background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <h1 className="text-2xl font-black" style={{ color: '#111', fontFamily: "'JetBrains Mono', monospace" }}>
          🥩 Drop your beef
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#aaa', fontFamily: "'JetBrains Mono', monospace" }}>
          Hot takes only. Lukewarm opinions will be rejected.
        </p>
      </div>

      <div className="flex-1 flex flex-col px-5 pt-5 gap-5 overflow-y-auto">
        <textarea
          className="w-full rounded-2xl p-4 font-semibold resize-none outline-none"
          style={{
            fontSize: 16,
            background: '#fff',
            color: '#111',
            border: '1.5px solid #f0f0f0',
            fontFamily: 'Inter, sans-serif',
            minHeight: 120,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
          rows={4}
          placeholder="What's your hot take?"
          value={text}
          onChange={e => setText(e.target.value)}
        />

        {/* visibility toggle */}
        <div
          className="flex rounded-2xl overflow-hidden"
          style={{ border: '1.5px solid #f0f0f0', background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
        >
          <button
            onClick={() => setIsPrivate(false)}
            className="flex-1 py-3 font-black text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              background: !isPrivate ? '#ef4444' : 'transparent',
              color: !isPrivate ? '#fff' : '#bbb',
            }}
          >
            🌐 PUBLIC
          </button>
          <button
            onClick={() => setIsPrivate(true)}
            className="flex-1 py-3 font-black text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              background: isPrivate ? '#111' : 'transparent',
              color: isPrivate ? '#fbbf24' : '#bbb',
            }}
          >
            🔒 DARK POOL
          </button>
        </div>

        {isPrivate && (
          <p className="text-xs font-semibold -mt-2 text-center" style={{ color: '#aaa', fontFamily: "'JetBrains Mono', monospace" }}>
            Invite-only. Your network gets a room code. No leaderboard exposure.
          </p>
        )}

        {/* controversy score */}
        <div className="rounded-2xl p-4" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold uppercase tracking-widest" style={{ color: '#aaa', fontFamily: "'JetBrains Mono', monospace" }}>
              Controversy Score
            </span>
            {loading && (
              <span className="text-xs font-bold" style={{ color: '#ef4444', fontFamily: "'JetBrains Mono', monospace" }}>
                JUDGING...
              </span>
            )}
          </div>
          <GaugeBar score={result.score} />
          <p className="text-sm mt-3 font-semibold" style={{ color: '#888', fontFamily: "'JetBrains Mono', monospace" }}>
            {verdictLabel}
          </p>
          {error && (
            <p className="text-xs mt-2 font-semibold" style={{ color: '#f97316', fontFamily: "'JetBrains Mono', monospace" }}>
              ⚠️ {error}
            </p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full py-4 rounded-2xl font-black transition-all"
          style={{
            fontSize: 17,
            fontFamily: "'JetBrains Mono', monospace",
            background: loading ? '#f0f0f0' : canSubmit ? (isPrivate ? '#111' : '#ef4444') : '#f0f0f0',
            color: loading ? '#bbb' : canSubmit ? (isPrivate ? '#fbbf24' : '#fff') : '#ccc',
            animation: canSubmit ? 'pulse-btn 2s infinite' : 'none',
            boxShadow: canSubmit ? (isPrivate ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(239,68,68,0.3)') : 'none',
          }}
        >
          {loading ? 'AI IS THINKING...' : canSubmit
            ? (isPrivate ? '🔒 OPEN THE DARK POOL' : 'PUT YOUR BEEF ON THE MARKET 🥩')
            : 'NOT HOT ENOUGH'}
        </button>
      </div>
    </div>
  )
}
