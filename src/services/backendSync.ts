/**
 * Backend Sync Service for Todobar
 * Connects the Todobar frontend directly to Google Sheets using the service account:
 * todobar-sheets-backend@utility-melody-390608.iam.gserviceaccount.com
 * with local SQLite / Python backend support and offline outbox.
 */

import { Task, TodayTask } from '../types'
import {
  GOOGLE_SHEET_ID,
  appendTaskToSheet,
  updateTaskInSheet,
  deleteTaskFromSheet,
  readTasksFromSheetAPI,
  getGoogleAccessToken,
} from './googleSheetsClient'

export { GOOGLE_SHEET_ID }

export const getBackendUrl = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    const isHttps = window.location.protocol === 'https:'
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://127.0.0.1:5050'
    }
    // If accessing via local network IP on mobile/other device
    if (/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(host)) {
      return `http://${host}:5050`
    }
    // When running on HTTPS (e.g. Render), route to HTTPS tunnel to avoid Mixed Content errors
    if (isHttps) {
      return 'https://plain-ends-appear.loca.lt'
    }
  }
  if ((import.meta as any).env?.VITE_BACKEND_API_URL) {
    return (import.meta as any).env.VITE_BACKEND_API_URL
  }
  return 'https://plain-ends-appear.loca.lt'
}

export interface BackendHealthResponse {
  status: string
  service_account: string
  spreadsheet_id: string
  connected: boolean
}

export async function checkBackendHealth(): Promise<BackendHealthResponse | null> {
  // Check if service account is active directly
  const token = await getGoogleAccessToken().catch(() => null)
  if (token) {
    return {
      status: 'online',
      service_account: 'todobar-sheets-backend@utility-melody-390608.iam.gserviceaccount.com',
      spreadsheet_id: GOOGLE_SHEET_ID,
      connected: true,
    }
  }

  // Fallback check localhost / backend
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
 * Fetch tasks trying direct Google Sheets API first, then gviz public endpoint, then local backend.
 */
export async function fetchTasksFromBackend(): Promise<TodayTask[]> {
  // 1. Direct Service Account API fetch
  try {
    const apiTasks = await readTasksFromSheetAPI()
    if (apiTasks && apiTasks.length > 0) {
      return apiTasks
    }
  } catch (e) {
    console.warn('[Google Sheets] Direct API read error, trying fallback:', e)
  }

  // 2. Direct Google Sheets gviz read
  try {
    const gvizTasks = await fetchTasksFromGoogleSheets()
    if (gvizTasks && gvizTasks.length > 0) {
      return gvizTasks
    }
  } catch {}

  // 3. Fallback to local server if running
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
  } catch (e) {}

  return []
}

// Offline outbox queue key
const OUTBOX_KEY = 'todobar.sync.outbox.v1'

function getOutbox(): TodayTask[] {
  try {
    const saved = localStorage.getItem(OUTBOX_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveOutbox(items: TodayTask[]): void {
  try {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(items))
  } catch {}
}

export async function syncTaskToBackend(task: Task | TodayTask): Promise<boolean> {
  const isTodayTask = 'done' in task
  const todayTask: TodayTask = {
    id: task.id,
    title: task.title,
    priority: task.priority,
    done: isTodayTask ? (task as TodayTask).done : false,
    category: 'category' in task ? (task as any).category : ('tags' in task ? (task as any).tags?.[0] : 'General'),
    time: 'time' in task ? (task as any).time : ('dueDate' in task ? (task as any).dueDate : 'Today'),
    dotColor: task.priority === 'focus' ? 'bg-rose-400' : 'bg-[#00F0FF]',
    priorityTag: task.priority === 'focus' ? 'High Priority' : 'Normal',
    tagColor: task.priority === 'focus' ? 'bg-rose-500/20 text-rose-300 border-rose-500/35' : 'bg-cyan-500/20 text-[#00F0FF] border-cyan-500/35',
  }

  let synced = false

  // 1. Direct Service Account write to Google Sheets
  try {
    synced = await updateTaskInSheet(todayTask)
  } catch (err) {
    console.warn('[Google Sheets] Direct write error:', err)
  }

  // 2. Also forward to local backend if running on localhost
  try {
    const payload = {
      id: task.id,
      title: task.title,
      completed: isTodayTask ? (task as TodayTask).done : false,
      priority: task.priority,
      category: todayTask.category,
      notes: 'description' in task ? (task as any).description : '',
      due_date: todayTask.time,
      created_at: 'createdAt' in task ? (task as any).createdAt : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const res = await fetch(`${getBackendUrl()}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) synced = true
  } catch {}

  if (synced) {
    drainOutbox()
    return true
  }

  // Queue in offline outbox if both failed
  const outbox = getOutbox().filter(item => item.id !== todayTask.id)
  outbox.push(todayTask)
  saveOutbox(outbox)
  return false
}

export async function deleteTaskFromBackend(taskId: string): Promise<boolean> {
  let deleted = false
  try {
    deleted = await deleteTaskFromSheet(taskId)
  } catch {}

  try {
    const res = await fetch(`${getBackendUrl()}/api/tasks/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: taskId }),
    })
    if (res.ok) deleted = true
  } catch {}

  return deleted
}

export async function drainOutbox(): Promise<void> {
  const outbox = getOutbox()
  if (outbox.length === 0) return

  const remaining: TodayTask[] = []
  for (const item of outbox) {
    try {
      const ok = await updateTaskInSheet(item)
      if (!ok) remaining.push(item)
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
