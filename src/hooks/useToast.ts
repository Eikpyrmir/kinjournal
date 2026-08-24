import { useCallback, useEffect, useRef, useState } from 'react'

export const TOAST_MS = 2500

export function useToast(timeoutMs: number = TOAST_MS) {
  const [message, setMessage] = useState<string | null>(null)
  const hideTimer = useRef<number | null>(null)

  const showToast = useCallback(
    (text: string) => {
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current)
      setMessage(text)
      hideTimer.current = window.setTimeout(() => {
        setMessage(null)
        hideTimer.current = null
      }, timeoutMs)
    },
    [timeoutMs],
  )

  const clearToast = useCallback(() => {
    if (hideTimer.current !== null) window.clearTimeout(hideTimer.current)
    setMessage(null)
    hideTimer.current = null
  }, [])

  useEffect(
    () => () => {
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current)
    },
    [],
  )

  return { message, showToast, clearToast }
}
