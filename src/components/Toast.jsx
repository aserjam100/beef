import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from '../state/gameState.js'

function ToastItem({ toast }) {
  const { dispatch } = useGame()

  useEffect(() => {
    const t = setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id }), toast.duration ?? 1800)
    return () => clearTimeout(t)
  }, [toast.id, toast.duration, dispatch])

  const bg = toast.variant === 'success' ? '#10b981'
    : toast.variant === 'warning' ? '#f59e0b'
    : toast.variant === 'agree' ? '#10b981'
    : toast.variant === 'disagree' ? '#ef4444'
    : '#1a1a1a'

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -60, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="mx-3 mb-1 px-4 py-2.5 rounded-2xl text-white text-sm font-semibold shadow-lg"
      style={{ background: bg, fontFamily: "'JetBrains Mono', monospace" }}
    >
      {toast.message}
    </motion.div>
  )
}

export default function Toast() {
  const { state } = useGame()
  return (
    <div className="absolute top-2 left-0 right-0 z-50 flex flex-col">
      <AnimatePresence>
        {state.toasts.map(t => <ToastItem key={t.id} toast={t} />)}
      </AnimatePresence>
    </div>
  )
}
