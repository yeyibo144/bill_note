import { useEffect, useRef, useState } from 'react'
import { formatMoney } from '@/lib/utils'

interface AnimatedNumberProps {
  value: number
  format?: (n: number) => string
  className?: string
  duration?: number
}

/** Count-up number transition for the balance figures. */
export default function AnimatedNumber({
  value,
  format = (n) => formatMoney(n),
  className,
  duration = 550,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)

  useEffect(() => {
    const from = prev.current
    const to = value
    prev.current = value
    if (from === to) {
      setDisplay(to)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(from + (to - from) * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return <span className={className}>{format(display)}</span>
}
