import { useState } from 'react'
import { useGame } from '../state/gameState.js'
import { users } from '../data/users.js'

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }

function Avatar({ user, size = 32 }) {
  const letter = user.username.replace('@', '')[0].toUpperCase()
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold flex-shrink-0"
      style={{ width: size, height: size, background: user.avatarColor, color: '#fff', fontSize: size * 0.42 }}
    >
      {letter}
    </div>
  )
}

function BettorRow({ user, isYou }) {
  return (
    <div
      className="mx-4 mb-2 px-4 py-3 rounded-2xl flex items-center gap-3"
      style={{
        background: isYou ? '#fff5f5' : '#fff',
        boxShadow: isYou ? '0 0 0 1.5px #ef4444' : '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      <span
        className="font-black text-xl w-8 text-center flex-shrink-0"
        style={{ color: '#ccc', fontFamily: "'JetBrains Mono', monospace" }}
      >
        {MEDALS[user.rank] ?? `#${user.rank}`}
      </span>
      <Avatar user={user} size={40} />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-base truncate" style={{ color: isYou ? '#ef4444' : '#111', fontFamily: "'JetBrains Mono', monospace" }}>
          {user.username}{isYou ? ' (you)' : ''}
        </p>
        <p className="text-sm" style={{ color: '#aaa', fontFamily: "'JetBrains Mono', monospace" }}>
          {user.winRate}% win rate
        </p>
      </div>
      <span className="font-black text-base" style={{ color: '#fbbf24', fontFamily: "'JetBrains Mono', monospace" }}>
        ${user.totalEarnings.toLocaleString()}
      </span>
    </div>
  )
}

function TakeRow({ take, rank }) {
  const creator = users.find(u => u.username === take.submittedBy)
  return (
    <div
      className="mx-4 mb-2 px-4 py-3 rounded-2xl flex items-center gap-3"
      style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      <span className="font-black text-base w-7 flex-shrink-0" style={{ color: '#ccc', fontFamily: "'JetBrains Mono', monospace" }}>
        {MEDALS[rank] ?? `#${rank}`}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-base leading-snug truncate" style={{ color: '#111' }}>
          "{take.text.length > 38 ? take.text.slice(0, 38) + '…' : take.text}"
        </p>
        <p className="text-sm mt-0.5" style={{ color: '#aaa', fontFamily: "'JetBrains Mono', monospace" }}>
          by {take.submittedBy}
        </p>
      </div>
      {creator && <Avatar user={creator} size={32} />}
      <span className="font-black text-base flex-shrink-0" style={{ color: '#fbbf24', fontFamily: "'JetBrains Mono', monospace" }}>
        ${take.totalPool.toLocaleString()}
      </span>
    </div>
  )
}

export default function LeaderboardScreen() {
  const { state } = useGame()
  const [view, setView] = useState('bettors')

  const youUser = users.find(u => u.username === state.user.username)
  const sortedBettors = [...users].sort((a, b) => a.rank - b.rank)
  const sortedTakes = [...state.activeTakes].sort((a, b) => b.totalPool - a.totalPool)

  return (
    <div className="flex flex-col h-full" style={{ background: '#fafafa' }}>
      {/* header */}
      <div className="px-5 pt-4 pb-3 flex-shrink-0" style={{ background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <h1 className="text-2xl font-black mb-3" style={{ color: '#111', fontFamily: "'JetBrains Mono', monospace" }}>
          Leaderboard
        </h1>
        <div className="flex gap-2">
          {[['bettors', '🏆 Sharpest Bettors'], ['takes', '🥩 Hottest Takes']].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className="px-3 py-1.5 rounded-full text-sm font-bold transition-all"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                background: view === id ? '#ef4444' : '#f0f0f0',
                color: view === id ? '#fff' : '#888',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* sticky you-bar */}
      {view === 'bettors' && youUser && (
        <div className="flex items-center gap-3 px-5 py-2 flex-shrink-0" style={{ background: '#fff5f5', borderBottom: '1px solid #fecaca' }}>
          <Avatar user={youUser} size={32} />
          <div className="flex-1">
            <span className="text-sm font-bold" style={{ color: '#ef4444', fontFamily: "'JetBrains Mono', monospace" }}>
              You — Rank #{youUser.rank}
            </span>
          </div>
          <span className="text-sm font-bold" style={{ color: '#aaa', fontFamily: "'JetBrains Mono', monospace" }}>
            {youUser.winRate}% wins
          </span>
        </div>
      )}

      {/* list */}
      <div className="flex-1 overflow-y-auto pt-3 pb-4">
        {view === 'bettors'
          ? sortedBettors.map(u => <BettorRow key={u.username} user={u} isYou={u.username === state.user.username} />)
          : sortedTakes.map((t, i) => <TakeRow key={t.id} take={t} rank={i + 1} />)
        }
      </div>
    </div>
  )
}
