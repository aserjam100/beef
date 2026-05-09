import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../state/gameState.js'

const SPICE_DOTS = { 1: '🌶️', 2: '🌶️🌶️', 3: '🌶️🌶️🌶️' }

const AVATAR_COLORS = {
  '@vibes_only': '#8b5cf6', '@market_maker_mike': '#3b82f6',
  '@spicy_takes_only': '#ef4444', '@touch_grass_2026': '#10b981',
  '@regret_minimizer': '#f59e0b', '@bear_market_betty': '#ec4899',
  '@bet_against_me': '#06b6d4', '@hot_take_haver': '#f97316',
  '@cilantro_truther': '#84cc16', '@short_seller_99': '#a855f7',
  '@hot_dog_sandwich': '#14b8a6', '@beef_lord': '#ef4444',
}

function avatarColor(username) {
  return AVATAR_COLORS[username] || '#aaa'
}

function sortComments(comments, mode) {
  if (mode === 'spicy') {
    return [...comments].sort((a, b) => b.spice - a.spice)
  }
  // controversial: interleave agree and disagree
  const agrees = comments.filter(c => c.side === 'AGREE')
  const disagrees = comments.filter(c => c.side === 'DISAGREE')
  const result = []
  const max = Math.max(agrees.length, disagrees.length)
  for (let i = 0; i < max; i++) {
    if (i < agrees.length) result.push(agrees[i])
    if (i < disagrees.length) result.push(disagrees[i])
  }
  return result
}

function CommentRow({ comment }) {
  const initials = comment.username.replace('@', '').slice(0, 2).toUpperCase()
  return (
    <div className="flex gap-3 py-4" style={{ borderBottom: '1px solid #f5f5f5' }}>
      <div
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white"
        style={{ background: avatarColor(comment.username), fontFamily: "'JetBrains Mono', monospace" }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold" style={{ color: '#111', fontFamily: "'JetBrains Mono', monospace" }}>
            {comment.username}
          </span>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              background: comment.side === 'AGREE' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
              color: comment.side === 'AGREE' ? '#10b981' : '#ef4444',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {comment.side === 'AGREE' ? '💚 AGREE' : '❌ DISAGREE'}
          </span>
          <span className="ml-auto text-xs">{SPICE_DOTS[comment.spice]}</span>
        </div>
        <p className="text-sm leading-snug" style={{ color: '#444', fontFamily: 'Inter, sans-serif' }}>
          {comment.text}
        </p>
      </div>
    </div>
  )
}

export default function CommentsModal({ take, onClose }) {
  const { state, dispatch } = useGame()
  const [sortMode, setSortMode] = useState('controversial')
  const [selectedSide, setSelectedSide] = useState(null)
  const [commentText, setCommentText] = useState('')
  const inputRef = useRef(null)

  const comments = state.comments[take.id] || []
  const sorted = sortComments(comments, sortMode)

  function handlePost() {
    if (!selectedSide || !commentText.trim()) return
    const newComment = {
      id: Date.now(),
      username: '@beef_lord',
      side: selectedSide,
      text: commentText.trim(),
      spice: 2,
    }
    dispatch({ type: 'COMMENT', payload: { takeId: take.id, comment: newComment } })
    dispatch({
      type: 'ADD_TOAST',
      payload: { id: Date.now(), message: `${selectedSide === 'AGREE' ? '💚' : '❌'} Comment dropped`, variant: selectedSide === 'AGREE' ? 'agree' : 'disagree', duration: 1500 },
    })
    setCommentText('')
    setSelectedSide(null)
  }

  function handleSelectSide(side) {
    setSelectedSide(side)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 350 }}
      style={{ background: '#fff', borderRadius: '24px 24px 0 0', overflow: 'hidden', pointerEvents: 'auto' }}
    >
      {/* handle */}
      <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
        <div className="rounded-full" style={{ width: 40, height: 4, background: '#e5e5e5' }} />
      </div>

      {/* header */}
      <div className="px-5 pb-3 flex-shrink-0" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <div className="flex items-start justify-between gap-3">
          <p className="font-bold text-base leading-snug flex-1" style={{ color: '#111', fontFamily: "'JetBrains Mono', monospace" }}>
            "{take.text.length > 70 ? take.text.slice(0, 70) + '…' : take.text}"
          </p>
          <button onClick={onClose} className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#f5f5f5', color: '#888', fontSize: 16 }}>
            ✕
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs font-bold" style={{ color: '#aaa', fontFamily: "'JetBrains Mono', monospace" }}>
            {comments.length} comments ·
          </span>
          {/* sort tabs */}
          <div className="flex gap-1">
            {['controversial', 'spicy'].map(mode => (
              <button
                key={mode}
                onClick={() => setSortMode(mode)}
                className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: sortMode === mode ? '#111' : '#f5f5f5',
                  color: sortMode === mode ? '#fff' : '#aaa',
                }}
              >
                {mode === 'controversial' ? '⚡ CONTROVERSIAL' : '🌶️ SPICY'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* comments list */}
      <div className="flex-1 overflow-y-auto px-5" style={{ minHeight: 0 }}>
        <AnimatePresence initial={false}>
          {sorted.map((comment, i) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <CommentRow comment={comment} />
            </motion.div>
          ))}
        </AnimatePresence>
        {comments.length === 0 && (
          <p className="text-center py-12 text-sm font-semibold" style={{ color: '#ccc', fontFamily: "'JetBrains Mono', monospace" }}>
            No comments yet. Be the first.
          </p>
        )}
        <div style={{ height: 16 }} />
      </div>

      {/* comment form */}
      <div className="flex-shrink-0 px-5 py-4" style={{ borderTop: '1px solid #f0f0f0', background: '#fff' }}>
        <p className="text-xs font-bold mb-3 tracking-widest" style={{ color: '#aaa', fontFamily: "'JetBrains Mono', monospace" }}>
          PICK YOUR SIDE TO COMMENT
        </p>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => handleSelectSide('AGREE')}
            className="flex-1 py-2.5 rounded-xl font-black text-sm transition-all"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              background: selectedSide === 'AGREE' ? '#10b981' : '#f5f5f5',
              color: selectedSide === 'AGREE' ? '#fff' : '#aaa',
            }}
          >
            💚 I AGREE
          </button>
          <button
            onClick={() => handleSelectSide('DISAGREE')}
            className="flex-1 py-2.5 rounded-xl font-black text-sm transition-all"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              background: selectedSide === 'DISAGREE' ? '#ef4444' : '#f5f5f5',
              color: selectedSide === 'DISAGREE' ? '#fff' : '#aaa',
            }}
          >
            ❌ I DISAGREE
          </button>
        </div>

        <AnimatePresence>
          {selectedSide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 overflow-hidden"
            >
              <input
                ref={inputRef}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePost()}
                placeholder="Drop your take..."
                className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  background: '#f5f5f5',
                  color: '#111',
                  border: `1.5px solid ${selectedSide === 'AGREE' ? '#10b981' : '#ef4444'}`,
                }}
              />
              <button
                onClick={handlePost}
                disabled={!commentText.trim()}
                className="px-4 py-2.5 rounded-xl font-black text-sm transition-all"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: commentText.trim()
                    ? (selectedSide === 'AGREE' ? '#10b981' : '#ef4444')
                    : '#f0f0f0',
                  color: commentText.trim() ? '#fff' : '#ccc',
                }}
              >
                POST
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
