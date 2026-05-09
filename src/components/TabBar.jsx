const TABS = [
  { id: 'market',      label: 'MARKET',      icon: '🥩' },
  { id: 'portfolio',   label: 'PORTFOLIO',   icon: '💼' },
  { id: 'leaderboard', label: 'LEADERBOARD', icon: '🏆' },
  { id: 'submit',      label: 'SUBMIT',      icon: '➕' },
]

export default function TabBar({ active, onSelect }) {
  return (
    <div
      className="flex items-stretch w-full h-full"
      style={{ background: '#fff', borderTop: '1px solid #f0f0f0' }}
    >
      {TABS.map(tab => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-opacity"
            style={{ color: isActive ? '#ef4444' : '#bbb' }}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span
              className="text-[11px] font-semibold tracking-widest leading-none"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
