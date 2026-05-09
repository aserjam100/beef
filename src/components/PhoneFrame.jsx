export default function PhoneFrame({ children, tabBar, overlay }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
      {/* tiled emoji background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Ctext x='10' y='40' font-size='24' opacity='0.035'%3E%F0%9F%A5%A9%3C/text%3E%3Ctext x='50' y='75' font-size='20' opacity='0.035'%3E%F0%9F%92%B8%3C/text%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* phone shell */}
      <div
        className="relative flex-shrink-0"
        style={{
          width: 390,
          height: 844,
          borderRadius: 56,
          border: '12px solid #000',
          boxShadow: '0 0 80px rgba(239,68,68,0.15), 0 0 0 1px #222',
          background: '#ffffff',
          overflow: 'hidden',
        }}
      >
        {/* notch */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 z-50"
          style={{
            width: 120,
            height: 30,
            background: '#000',
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          }}
        />

        {/* status bar */}
        <div
          className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-6"
          style={{ height: 44, paddingTop: 6 }}
        >
          <span className="text-xs font-semibold" style={{ color: '#111', fontFamily: "'JetBrains Mono', monospace" }}>
            9:41
          </span>
          <div className="flex items-center gap-1.5">
            {/* signal */}
            <svg width="17" height="12" viewBox="0 0 17 12" fill="#111">
              <rect x="0"  y="8" width="3" height="4" rx="0.5"/>
              <rect x="4"  y="5" width="3" height="7" rx="0.5"/>
              <rect x="8"  y="3" width="3" height="9" rx="0.5"/>
              <rect x="12" y="0" width="3" height="12" rx="0.5"/>
            </svg>
            {/* wifi */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="#111">
              <path d="M8 9.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
              <path d="M3.5 6.5a6.5 6.5 0 019 0" stroke="#111" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M1 4a10 10 0 0114 0" stroke="#111" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            </svg>
            {/* battery */}
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
              <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="#111" strokeOpacity="0.5"/>
              <rect x="2" y="2" width="16" height="8" rx="2" fill="#111"/>
              <path d="M23 4v4a2 2 0 000-4z" fill="#111" fillOpacity="0.4"/>
            </svg>
          </div>
        </div>

        {/* scrollable content area */}
        <div
          className="absolute left-0 right-0 overflow-hidden"
          style={{ top: 44, bottom: 72 }}
        >
          {children}
        </div>

        {/* tab bar slot */}
        {tabBar && (
          <div className="absolute bottom-0 left-0 right-0" style={{ height: 72 }}>
            {tabBar}
          </div>
        )}

        {/* full-screen overlay slot (comments modal, etc.) */}
        {overlay && (
          <div className="absolute inset-0 z-40" style={{ pointerEvents: 'none' }}>
            {overlay}
          </div>
        )}

        {/* home indicator */}
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full z-50"
          style={{ bottom: 6, width: 134, height: 5, background: 'rgba(0,0,0,0.15)' }}
        />
      </div>
    </div>
  )
}
