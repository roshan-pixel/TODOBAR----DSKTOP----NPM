export function scheduleLocalStorageWrite(
  key: string,
  value: string,
  timeout = 300
) {
  let cancelled = false

  const write = () => {
    if (cancelled) return
    try {
      window.localStorage.setItem(key, value)
    } catch (e) {
      console.warn(`[Todobar Storage] Failed to write key "${key}" to localStorage:`, e)
    }
  }

  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    const idleWindow = window as unknown as {
      requestIdleCallback: (cb: () => void, opts: { timeout: number }) => number
      cancelIdleCallback: (h: number) => void
    }
    const handle = idleWindow.requestIdleCallback(write, { timeout })
    return () => {
      cancelled = true
      idleWindow.cancelIdleCallback(handle)
    }
  }

  const handle = globalThis.setTimeout(write, Math.min(timeout, 120))
  return () => {
    cancelled = true
    globalThis.clearTimeout(handle)
  }
}

export function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch (e) {
    console.warn(`[Todobar Storage] Failed reading key "${key}":`, e)
    return fallback
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.warn(`[Todobar Storage] Direct write error "${key}":`, e)
  }
}
