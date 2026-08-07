import { useEffect, useState } from 'react'

export function useClock(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const refresh = () => setNow(new Date())
    const immediateTimer = window.setTimeout(refresh, 0)
    const intervalTimer = window.setInterval(refresh, intervalMs)
    return () => {
      window.clearTimeout(immediateTimer)
      window.clearInterval(intervalTimer)
    }
  }, [intervalMs])

  return now
}
