import { useState } from 'react'
import { useGame } from '../state/gameState.js'

function formatTime(mins) {
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function OpenRow({ pos }) {
  const winning = pos.side === 'AGREE' ? pos.agreePct > 50 : pos.agreePct < 50
  const yourPct = pos.side === 'AGREE' ? pos.agreePct : 100 - pos.agreePct
  const projected = (pos.stake * (100 / Math.max(yourPct, 1))).toFixed(0)

  return (
    <div
      className="mx-4 mb-2 rounded-2xl overflow-hidden"
      style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderLeft: `4px solid ${winning ? '#10b981' : '#ef4444'}` }}
    >
      <div className="px-4 py-3">
        <p className="font-semibold text-base leading-snug mb-2" style={{ color: '#111' }}>
          {pos.text.length > 52 ? pos.text.slice(0, 52) + '…' : pos.text}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold px-2 py-0.5 rounded-full"
              style={{
                background: pos.side === 'AGREE' ? '#f0fdf4' : '#fff5f5',
                color: pos.side === 'AGREE' ? '#10b981' : '#ef4444',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {pos.side}
            </span>
            <span className="text-sm font-bold" style={{ color: '#111', fontFamily: "'JetBrains Mono', monospace" }}>
              ${pos.stake}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm" style={{ color: '#aaa', fontFamily: "'JetBrains Mono', monospace" }}>
              proj. ${projected} · {formatTime(pos.timeLeftMinutes)}
            </div>
            <div className="text-sm font-bold" style={{ color: winning ? '#10b981' : '#ef4444', fontFamily: "'JetBrains Mono', monospace" }}>
              {yourPct.toFixed(0)}% your side
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HistoryRow({ item }) {
  const isBigWin = item.id === 101
  const win = item.outcome === 'WIN'
  const pending = item.outcome === 'PENDING'

  return (
    <div
      className="mx-4 mb-2 rounded-2xl overflow-hidden"
      style={{
        background: '#fff',
        boxShadow: isBigWin ? '0 0 20px rgba(251,191,36,0.25)' : '0 2px 12px rgba(0,0,0,0.06)',
        border: isBigWin ? '1.5px solid #fbbf24' : 'none',
      }}
    >
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-base leading-snug flex-1" style={{ color: '#111' }}>
            {item.text.length > 48 ? item.text.slice(0, 48) + '…' : item.text}
          </p>
          {isBigWin && (
            <span className="text-sm font-black whitespace-nowrap" style={{ color: '#fbbf24', fontFamily: "'JetBrains Mono', monospace" }}>
              🔥 BIG WIN
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold px-2 py-0.5 rounded-full"
              style={{
                background: item.yourSide === 'AGREE' ? '#f0fdf4' : '#fff5f5',
                color: item.yourSide === 'AGREE' ? '#10b981' : '#ef4444',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {item.yourSide}
            </span>
            <span className="text-sm" style={{ color: '#aaa', fontFamily: "'JetBrains Mono', monospace" }}>
              ${item.stake} staked
            </span>
          </div>
          <div className="flex items-center gap-2">
            {pending ? (
              <span className="text-sm font-bold px-2 py-0.5 rounded-full" style={{ background: '#fef9c3', color: '#ca8a04', fontFamily: "'JetBrains Mono', monospace" }}>PENDING</span>
            ) : (
              <>
                <span className="text-sm font-bold px-2 py-0.5 rounded-full"
                  style={{ background: win ? '#f0fdf4' : '#fff5f5', color: win ? '#10b981' : '#ef4444', fontFamily: "'JetBrains Mono', monospace" }}>
                  {win ? 'WIN' : 'LOSS'}
                </span>
                {win && (
                  <span className="text-base font-black" style={{ color: '#fbbf24', fontFamily: "'JetBrains Mono', monospace" }}>
                    +${item.payout}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PortfolioScreen() {
  const { state } = useGame()
  const [tab, setTab] = useState('open')

  const totalExposure = state.openPositions.reduce((s, p) => s + p.stake, 0)

  return (
    <div className="flex flex-col h-full" style={{ background: '#fafafa' }}>
      {/* header */}
      <div className="px-5 pt-4 pb-3 flex-shrink-0" style={{ background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#aaa', fontFamily: "'JetBrains Mono', monospace" }}>
            Total Exposure
          </span>
          <span className="text-sm font-semibold" style={{ color: '#10b981', fontFamily: "'JetBrains Mono', monospace" }}>
            P&L +$127.40 ↑
          </span>
        </div>
        <div className="text-4xl font-black" style={{ color: '#111', fontFamily: "'JetBrains Mono', monospace" }}>
          ${totalExposure.toLocaleString()}.00
        </div>
      </div>

      {/* tab pills */}
      <div className="flex gap-2 px-4 py-3 flex-shrink-0">
        {[['open', `Open (${state.openPositions.length})`], ['history', 'History']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="px-4 py-1.5 rounded-full text-sm font-bold transition-all"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              background: tab === id ? '#ef4444' : '#f0f0f0',
              color: tab === id ? '#fff' : '#888',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* list */}
      <div className="flex-1 overflow-y-auto pb-4">
        {tab === 'open'
          ? [...state.openPositions].reverse().map((pos, i) => <OpenRow key={i} pos={pos} />)
          : state.resolvedHistory.map(item => <HistoryRow key={item.id} item={item} />)
        }
      </div>
    </div>
  )
}
