/**
 * useTimerSync — Cross-device focus timer sync via Google Sheets backend
 *
 * Strategy:
 *  - On mount: fetch the latest saved timer state across all devices from Google Sheets.
 *    If it was recently active (within 2 hours) and still has time, calculate elapsed time
 *    and resume right where the user left off on the other device.
 *  - While running: push timer state to Google Sheets every 8 seconds.
 *  - On pause / start / duration adjust / complete: push immediately.
 *  - Primary sync: Todobar REST API server (/api/timer) connected to Google Sheets.
 *  - Direct fallback: Google Sheets public GViz / API v4 endpoint.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { getBackendUrl } from '../services/backendSync'
import { GOOGLE_SHEET_ID } from '../services/googleSheetsClient'

const SYNC_INTERVAL_MS = 8_000                  // Save every 8 seconds while timer is ticking
const MAX_RESUME_AGE_MS = 2 * 60 * 60 * 1000   // Only resume sessions updated within 2 hours

function getDeviceId(): string {
  let id = localStorage.getItem('todobar_device_id')
  if (!id) {
    id = `device-${crypto.randomUUID().slice(0, 8)}`
    localStorage.setItem('todobar_device_id', id)
  }
  return id
}

export interface SavedTimerState {
  deviceId: string
  secondsRemaining: number
  totalSeconds: number
  isRunning: boolean
  taskId?: string
  updatedAt: string
}

/**
 * Fetch latest timer state from backend (which mirrors Google Sheets),
 * falling back to direct Google Sheets GViz query.
 */
async function fetchLatestState(): Promise<SavedTimerState | null> {
  const backendUrl = getBackendUrl()

  // 1. Try backend API server
  try {
    const res = await fetch(`${backendUrl}/api/timer`, {
      headers: { Accept: 'application/json' },
    })
    if (res.ok) {
      const data = await res.json()
      if (data && data.seconds_remaining !== undefined) {
        return {
          deviceId: data.device_id || 'unknown',
          secondsRemaining: Number(data.seconds_remaining),
          totalSeconds: Number(data.total_seconds) || 2700,
          isRunning: Boolean(data.is_running),
          taskId: data.task_id || undefined,
          updatedAt: data.updated_at || new Date().toISOString(),
        }
      }
    }
  } catch (err) {
    console.debug('[TimerSync] Backend fetch failed, trying direct Google Sheets GViz...', err)
  }

  // 2. Direct Google Sheets GViz query fallback
  try {
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json&sheet=timer_state`
    const res = await fetch(url)
    if (res.ok) {
      const raw = await res.text()
      const start = raw.indexOf('{')
      const end = raw.lastIndexOf('}')
      if (start !== -1 && end !== -1) {
        const json = JSON.parse(raw.substring(start, end + 1))
        const rows = json.table?.rows || []
        if (rows.length > 0) {
          // Parse all rows and find the most recently updated one
          const records: SavedTimerState[] = []
          for (const row of rows) {
            const c = row.c || []
            const devId = String(c[0]?.v || '').trim()
            if (!devId || devId.toLowerCase() === 'device_id') continue

            const secRem = Number(c[1]?.v || 0)
            const totSec = Number(c[2]?.v || 2700)
            const isRun = String(c[3]?.v || '').toLowerCase() === '1' || String(c[3]?.v || '').toLowerCase() === 'true'
            const tId = String(c[4]?.v || '')
            const updAt = String(c[5]?.v || '')

            records.push({
              deviceId: devId,
              secondsRemaining: secRem,
              totalSeconds: totSec,
              isRunning: isRun,
              taskId: tId || undefined,
              updatedAt: updAt,
            })
          }

          if (records.length > 0) {
            records.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            return records[0]
          }
        }
      }
    }
  } catch (err) {
    console.debug('[TimerSync] Direct GViz fetch failed:', err)
  }

  return null
}

/**
 * Push current device's timer state to the backend / Google Sheets.
 */
async function pushState(
  secondsRemaining: number,
  totalSeconds: number,
  isRunning: boolean,
  taskId?: string
): Promise<boolean> {
  const backendUrl = getBackendUrl()
  const payload = {
    device_id: getDeviceId(),
    seconds_remaining: secondsRemaining,
    total_seconds: totalSeconds,
    is_running: isRunning,
    task_id: taskId ?? '',
    updated_at: new Date().toISOString(),
  }

  try {
    const res = await fetch(`${backendUrl}/api/timer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return res.ok
  } catch {
    return false
  }
}

interface UseTimerSyncOptions {
  secondsRemaining: number
  totalSeconds: number
  isRunning: boolean
  taskId?: string
  /** Invoked when a newer timer state from another device is restored */
  onRestore: (restored: {
    secondsRemaining: number
    totalSeconds: number
    isRunning: boolean
    taskId?: string
  }) => void
}

export function useTimerSync({
  secondsRemaining,
  totalSeconds,
  isRunning,
  taskId,
  onRestore,
}: UseTimerSyncOptions) {
  const [isSynced, setIsSynced] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'restored' | 'error'>('idle')
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)

  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const restoredRef = useRef(false)
  const currentDeviceId = useRef(getDeviceId())

  // Keep a mutable ref of current values so background intervals never read stale closures
  const stateRef = useRef({ secondsRemaining, totalSeconds, isRunning, taskId })
  useEffect(() => {
    stateRef.current = { secondsRemaining, totalSeconds, isRunning, taskId }
  }, [secondsRemaining, totalSeconds, isRunning, taskId])

  // ── 1. ON MOUNT: Check Google Sheets for active session from another device ──
  useEffect(() => {
    if (restoredRef.current) return
    restoredRef.current = true

    fetchLatestState().then(saved => {
      if (!saved) return

      const savedAt = new Date(saved.updatedAt).getTime()
      const now = Date.now()
      const ageMs = now - savedAt

      // If state is older than 2 hours or finished, don't auto-restore
      if (ageMs > MAX_RESUME_AGE_MS || saved.secondsRemaining <= 0) return

      // If the session was running when last saved, account for time elapsed
      let adjustedRemaining = saved.secondsRemaining
      if (saved.isRunning && ageMs > 0) {
        const elapsedSec = Math.floor(ageMs / 1000)
        adjustedRemaining = Math.max(0, saved.secondsRemaining - elapsedSec)
      }

      // If there's still time remaining, restore where the other device left off!
      if (adjustedRemaining > 0) {
        console.log(
          `[TimerSync] Found active session from ${saved.deviceId} (${Math.round(ageMs / 1000)}s ago). Resuming at ${adjustedRemaining}s.`
        )
        setSyncStatus('restored')
        setIsSynced(true)
        setLastSyncedAt(new Date())
        onRestore({
          secondsRemaining: adjustedRemaining,
          totalSeconds: saved.totalSeconds,
          isRunning: saved.isRunning,
          taskId: saved.taskId,
        })
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── 2. PUSH IMMEDIATELY ON STATE TRANSITIONS (Play / Pause / Reset) ──
  const pushNow = useCallback(async () => {
    const current = stateRef.current
    const ok = await pushState(
      current.secondsRemaining,
      current.totalSeconds,
      current.isRunning,
      current.taskId
    )
    if (ok) {
      setIsSynced(true)
      setLastSyncedAt(new Date())
      setSyncStatus('syncing')
      setTimeout(() => setSyncStatus('idle'), 1500)
    }
  }, [])

  // Push immediately when isRunning changes (pause, resume, start)
  useEffect(() => {
    pushNow()
  }, [isRunning, pushNow])

  // ── 3. PERIODIC BACKGROUND PUSH (Every 8s while running) ──
  useEffect(() => {
    if (syncIntervalRef.current) clearInterval(syncIntervalRef.current)
    if (!isRunning) return

    syncIntervalRef.current = setInterval(async () => {
      const current = stateRef.current
      const ok = await pushState(
        current.secondsRemaining,
        current.totalSeconds,
        current.isRunning,
        current.taskId
      )
      if (ok) {
        setIsSynced(true)
        setLastSyncedAt(new Date())
      }
    }, SYNC_INTERVAL_MS)

    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current)
    }
  }, [isRunning])

  return {
    isSynced,
    syncStatus,
    lastSyncedAt,
    deviceId: currentDeviceId.current,
    pushNow,
  }
}
