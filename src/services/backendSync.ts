/**
 * Backend Sync Service for Todobar
 * Connects the Todobar frontend to the Google Sheets SQL backend server.
 */

import { Task, TodayTask } from '../types'

const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_API_URL || 'http://127.0.0.1:5050'

export interface BackendHealthResponse {
  status: string
  service_account: string
  spreadsheet_id: string
  connected: boolean
}

export async function checkBackendHealth(): Promise<BackendHealthResponse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function fetchTasksFromBackend(): Promise<Task[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/tasks`)
    if (!res.ok) throw new Error('Failed to fetch tasks')
    const data = await res.json()
    return data.tasks || []
  } catch (e) {
    console.warn('[Todobar BackendSync] Could not reach Sheets backend:', e)
    return []
  }
}

export async function syncTaskToBackend(task: Task | TodayTask): Promise<boolean> {
  try {
    const payload = {
      id: task.id,
      title: task.title,
      completed: task.done,
      priority: task.priority,
      category: 'category' in task ? task.category : ('tags' in task ? task.tags?.[0] : 'General'),
      notes: 'description' in task ? task.description : '',
      created_at: 'createdAt' in task ? task.createdAt : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const res = await fetch(`${BACKEND_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return res.ok
  } catch (e) {
    console.warn('[Todobar BackendSync] Failed to sync task:', e)
    return false
  }
}

export async function executeSql(query: string): Promise<any[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/sql`, {
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
