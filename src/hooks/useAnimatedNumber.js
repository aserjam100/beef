import { useEffect, useRef, useState } from 'react'

export function useAnimatedNumber(target, duration = 400) {
  const [display, setDisplay] = useState(target)
  const fromRef = useRef(target)
  const startRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const from = fromRef.current
    if (from === target) return
    startRef.current = null

    const step = (ts) => {
      if (!startRef.current) startRef.current = ts
      const progress = Math.min((ts - startRef.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(from + (target - from) * eased)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        fromRef.current = target
      }
    }

    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return display
}
