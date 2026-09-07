/**
 * Backend Sync Service for Todobar
 * Connects the Todobar frontend to the Google Sheets SQL backend server
 * with direct Google Sheets reader fallback and local offline outbox.
 */

import { Task, TodayTask } from '../types'

export const GOOGLE_SHEET_ID =
  (import.meta as any).env?.VITE_GOOGLE_SHEET_ID ||
  '1b9OitPeSDeBhtrx_bZ2ovrByLMXfmEJfcSP8S4PEAGI'

export const getBackendUrl = (): string => {
  if ((import.meta as any).env?.VITE_BACKEND_API_URL) {
    return (import.meta as any).env.VITE_BACKEND_API_URL
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://127.0.0.1:5050'
    }
  }
  return 'https://todobar-backend.onrender.com'
}

export interface BackendHealthResponse {
  status: string
  service_account: string
  spreadsheet_id: string
  connected: boolean
}

export async function checkBackendHealth(): Promise<BackendHealthResponse | null> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

/**
 * Direct zero-server read from Google Sheets gviz public endpoint.
 * Works seamlessly across Render, localhost, mobile, and desktop.
 */
export async function fetchTasksFromGoogleSheets(): Promise<TodayTask[]> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json&sheet=tasks`
    const res = await fetch(url)
    if (!res.ok) return []
    const raw = await res.text()
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start === -1 || end === -1) return []
    const json = JSON.parse(raw.substring(start, end + 1))
    const rows = json.table?.rows || []
    if (rows.length <= 1) return []

    // Parse rows safely, skipping header if present
    const tasks: TodayTask[] = []
    for (let i = 0; i < rows.length; i++) {
      const c = rows[i].c || []
      const id = String(c[0]?.v || '').trim()
      const title = String(c[1]?.v || '').trim()
      if (!id || !title || id.toLowerCase() === 'id') continue

      const priority = (c[3]?.v as any) || 'normal'
      const isFocus = priority === 'focus'
      const completedRaw = c[6]?.v
      const completedStr = String(completedRaw ?? '').toLowerCase().trim()
      const done =
        completedRaw === 1 ||
        completedRaw === true ||
        completedStr === 'true' ||
        completedStr === '1'

      tasks.push({
        id,
        title,
        priority: isFocus ? 'focus' : 'normal',
        done,
        category: String(c[4]?.v || 'General Work'),
        categoryType: String(c[4]?.v || '').toLowerCase().includes('design') ? 'design' : 'work',
        time: String(c[5]?.v || 'Today'),
        priorityTag: isFocus ? 'High Priority' : 'Normal',
        dotColor: isFocus ? 'bg-rose-400' : 'bg-[#00F0FF]',
        tagColor: isFocus
          ? 'bg-rose-500/20 text-rose-300 border-rose-500/35'
          : 'bg-cyan-500/20 text-[#00F0FF] border-cyan-500/35',
        completedAt: done ? String(c[8]?.v || c[7]?.v || 'Completed') : undefined,
      })
    }
    return tasks
  } catch (e) {
    console.warn('[Google Sheets Sync] Could not fetch directly from sheet:', e)
    return []
  }
}

/**
 * Fetch tasks trying backend API first, then Google Sheets direct endpoint.
 */
export async function fetchTasksFromBackend(): Promise<TodayTask[]> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/tasks`)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.tasks) && data.tasks.length > 0) {
        return data.tasks.map((r: any) => ({
          id: r.id,
          title: r.title,
          done: r.completed === 1 || r.completed === true || String(r.completed).toLowerCase() === 'true',
          priority: r.priority || 'normal',
          category: r.category || 'General Work',
          categoryType: String(r.category || '').toLowerCase().includes('design') ? 'design' : 'work',
          time: r.due_date || 'Today',
          priorityTag: r.priority === 'focus' ? 'High Priority' : 'Normal',
          dotColor: r.priority === 'focus' ? 'bg-rose-400' : 'bg-[#00F0FF]',
          tagColor: r.priority === 'focus'
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/35'
            : 'bg-cyan-500/20 text-[#00F0FF] border-cyan-500/35',
          completedAt: r.completed ? (r.updated_at || r.created_at) : undefined,
        }))
      }
    }
  } catch (e) {
    // Backend API is not available (e.g. running statically without server)
  }

  // Fallback to direct Google Sheets read
  return await fetchTasksFromGoogleSheets()
}

// Offline outbox queue key
const OUTBOX_KEY = 'todobar.sync.outbox.v1'

function getOutbox(): any[] {
  try {
    const saved = localStorage.getItem(OUTBOX_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveOutbox(items: any[]): void {
  try {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(items))
  } catch {}
}

export async function syncTaskToBackend(task: Task | TodayTask): Promise<boolean> {
  const payload = {
    id: task.id,
    title: task.title,
    completed: task.done,
    priority: task.priority,
    category: 'category' in task ? task.category : ('tags' in task ? task.tags?.[0] : 'General'),
    notes: 'description' in task ? (task as any).description : '',
    due_date: 'time' in task ? (task as any).time : ('dueDate' in task ? (task as any).dueDate : 'Today'),
    created_at: 'createdAt' in task ? (task as any).createdAt : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  try {
    const res = await fetch(`${getBackendUrl()}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      // Drain any pending outbox items
      drainOutbox()
      return true
    }
  } catch (e) {
    // If backend unreachable, queue in outbox
    const outbox = getOutbox().filter(item => item.id !== payload.id)
    outbox.push(payload)
    saveOutbox(outbox)
  }
  return false
}

export async function deleteTaskFromBackend(taskId: string): Promise<boolean> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/tasks/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: taskId }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function drainOutbox(): Promise<void> {
  const outbox = getOutbox()
  if (outbox.length === 0) return

  const remaining: any[] = []
  for (const item of outbox) {
    try {
      const res = await fetch(`${getBackendUrl()}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })
      if (!res.ok) remaining.push(item)
    } catch {
      remaining.push(item)
    }
  }
  saveOutbox(remaining)
}

export async function executeSql(query: string): Promise<any[]> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/sql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'SQL query failed')
    }
    const data = await res.json()
    return data.rows || []
  } catch (e) {
    console.error('[Todobar SQL] Error executing SQL:', e)
    throw e
  }
}
