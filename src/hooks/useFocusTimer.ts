import { useState, useEffect, useCallback } from 'react'
import { sounds } from '../services/audio'

interface UseFocusTimerOptions {
  initialSeconds?: number
  defaultTotalSeconds?: number
  onComplete?: () => void
}

export function useFocusTimer({
  initialSeconds = 24 * 60 + 7, // 24:07 default sprint progress
  defaultTotalSeconds = 45 * 60, // 45:00 sprint target
  onComplete,
}: UseFocusTimerOptions = {}) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds)
  const [totalSeconds, setTotalSeconds] = useState(defaultTotalSeconds)
  const [isRunning, setIsRunning] = useState(true)

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setIsRunning(false)
          sounds.playTimerDone(true)
          if (onComplete) {
            onComplete()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, onComplete])

  const togglePlayPause = useCallback(() => {
    setIsRunning(prev => {
      const next = !prev
      sounds.playClick(true)
      return next
    })
  }, [])

  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const resume = useCallback(() => {
    setIsRunning(true)
    sounds.playClick(true)
  }, [])

  const reset = useCallback((newTotal?: number) => {
    const target = newTotal ?? totalSeconds
    setSecondsRemaining(target)
    setIsRunning(false)
    sounds.playClick(true)
  }, [totalSeconds])

  const adjust = useCallback((deltaMinutes: number) => {
    setSecondsRemaining(prev => {
      const updated = Math.max(60, Math.min(90 * 60, prev + deltaMinutes * 60))
      sounds.playClick(true)
      return updated
    })
  }, [])

  const mins = Math.floor(secondsRemaining / 60)
  const secs = secondsRemaining % 60
  const timeString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((totalSeconds - secondsRemaining) / totalSeconds) * 100))
  )

  return {
    secondsRemaining,
    totalSeconds,
    isRunning,
    timeString,
    minutes: mins,
    seconds: secs,
    progressPercent,
    togglePlayPause,
    pause,
    resume,
    reset,
    adjust,
    setSecondsRemaining,
  }
}
