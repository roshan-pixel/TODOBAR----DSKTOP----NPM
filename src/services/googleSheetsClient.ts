/**
 * Direct Google Sheets Client for Todobar
 * Authenticates directly with Google Sheets API v4 using the service account:
 * todobar-sheets-backend@utility-melody-390608.iam.gserviceaccount.com
 * via standard W3C WebCrypto API (RS256 JWT exchange).
 *
 * Works 100% serverless across Render static hosting, mobile browsers, and desktop.
 */

import { TodayTask } from '../types'

declare const __GOOGLE_SERVICE_ACCOUNT__: any

export const GOOGLE_SHEET_ID =
  (import.meta as any).env?.VITE_GOOGLE_SHEET_ID ||
  '1b9OitPeSDeBhtrx_bZ2ovrByLMXfmEJfcSP8S4PEAGI'

export const TASKS_SHEET_GID = 1056381145
export const TASKS_SHEET_NAME = 'tasks'

interface ServiceAccountConfig {
  client_email: string
  private_key: string
}

let cachedServiceAccount: ServiceAccountConfig | null = null

function getServiceAccount(): ServiceAccountConfig | null {
  if (cachedServiceAccount) return cachedServiceAccount

  // 1. Check Vite injected define
  try {
    if (typeof __GOOGLE_SERVICE_ACCOUNT__ !== 'undefined' && __GOOGLE_SERVICE_ACCOUNT__?.client_email) {
      cachedServiceAccount = {
        client_email: __GOOGLE_SERVICE_ACCOUNT__.client_email,
        private_key: __GOOGLE_SERVICE_ACCOUNT__.private_key,
      }
      return cachedServiceAccount
    }
  } catch {}

  // 2. Check Vite env variables
  const envEmail = (import.meta as any).env?.VITE_SERVICE_ACCOUNT_EMAIL
  const envKey = (import.meta as any).env?.VITE_SERVICE_ACCOUNT_KEY
  if (envEmail && envKey) {
    cachedServiceAccount = {
      client_email: envEmail,
      private_key: envKey.replace(/\\n/g, '\n'),
    }
    return cachedServiceAccount
  }

  // 3. Check JSON in env variable
  const rawEnv = (import.meta as any).env?.VITE_SERVICE_ACCOUNT_JSON
  if (rawEnv) {
    try {
      const parsed = JSON.parse(rawEnv)
      cachedServiceAccount = {
        client_email: parsed.client_email,
        private_key: parsed.private_key,
      }
      return cachedServiceAccount
    } catch {}
  }

  return null
}

// Token cache in memory
let cachedToken: string | null = null
let tokenExpiresAt = 0

function pemToBinary(pem: string): Uint8Array {
  const b64 = pem
    .replace(/-----[^\n]+-----/g, '')
    .replace(/\s+/g, '')
  const raw = atob(b64)
  const bytes = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) {
    bytes[i] = raw.charCodeAt(i)
  }
  return bytes
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function base64UrlEncodeStr(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * Mint and exchange a signed RS256 JWT for a Google OAuth access token.
 */
export async function getGoogleAccessToken(): Promise<string | null> {
  const sa = getServiceAccount()
  if (!sa) {
    console.warn('[Google Sheets] No service account credentials configured.')
    return null
  }

  // Return cached token if still valid (buffer 300s)
  if (cachedToken && Date.now() < tokenExpiresAt - 300000) {
    return cachedToken
  }

  try {
    const subtle = window.crypto?.subtle || (window as any).crypto?.webcrypto?.subtle
    if (!subtle) {
      console.warn('[Google Sheets] WebCrypto API is not available in this environment.')
      return null
    }

    const binaryKey = pemToBinary(sa.private_key)
    const cryptoKey = await subtle.importKey(
      'pkcs8',
      binaryKey as unknown as BufferSource,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const now = Math.floor(Date.now() / 1000)
    const header = { alg: 'RS256', typ: 'JWT' }
    const claim = {
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    }

    const headerB64 = base64UrlEncodeStr(JSON.stringify(header))
    const claimB64 = base64UrlEncodeStr(JSON.stringify(claim))
    const toSign = `${headerB64}.${claimB64}`

    const signature = await subtle.sign(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      new TextEncoder().encode(toSign)
    )

    const jwt = `${toSign}.${base64UrlEncodeBytes(new Uint8Array(signature))}`

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[Google Sheets] OAuth token exchange failed:', err)
      return null
    }

    const data = await res.json()
    if (data.access_token) {
      cachedToken = data.access_token
      tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000
      return cachedToken
    }
  } catch (e) {
    console.error('[Google Sheets] Error getting access token:', e)
  }
  return null
}

/**
 * Append a new task row to the tasks sheet.
 */
export async function appendTaskToSheet(task: TodayTask): Promise<boolean> {
  const token = await getGoogleAccessToken()
  if (!token) return false

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${TASKS_SHEET_NAME}!A:I:append?valueInputOption=USER_ENTERED`
  const row = [
    task.id,
    task.title,
    '', // notes
    task.priority || 'normal',
    task.category || 'General Work',
    task.time || 'Today',
    task.done ? 'true' : 'false',
    new Date().toISOString(),
    new Date().toISOString(),
  ]

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [row] }),
    })
    return res.ok
  } catch (e) {
    console.warn('[Google Sheets] Failed to append task:', e)
    return false
  }
}

/**
 * Update task completion or metadata in the sheet.
 * If row does not exist, appends it.
 */
export async function updateTaskInSheet(task: TodayTask): Promise<boolean> {
  const token = await getGoogleAccessToken()
  if (!token) return false

  try {
    const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${TASKS_SHEET_NAME}!A:A`
    const getRes = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!getRes.ok) return false
    const data = await getRes.json()
    const rows: string[][] = data.values || []

    let rowIndex = -1
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === task.id) {
        rowIndex = i + 1
        break
      }
    }

    if (rowIndex === -1) {
      return await appendTaskToSheet(task)
    }

    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${TASKS_SHEET_NAME}!A${rowIndex}:I${rowIndex}?valueInputOption=USER_ENTERED`
    const row = [
      task.id,
      task.title,
      '',
      task.priority || 'normal',
      task.category || 'General Work',
      task.time || 'Today',
      task.done ? 'true' : 'false',
      new Date().toISOString(),
      new Date().toISOString(),
    ]

    const putRes = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [row] }),
    })
    return putRes.ok
  } catch (e) {
    console.warn('[Google Sheets] Failed to update task:', e)
    return false
  }
}

/**
 * Delete task from sheet by ID using batchUpdate deleteDimension.
 */
export async function deleteTaskFromSheet(taskId: string): Promise<boolean> {
  const token = await getGoogleAccessToken()
  if (!token) return false

  try {
    const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${TASKS_SHEET_NAME}!A:A`
    const getRes = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!getRes.ok) return false
    const data = await getRes.json()
    const rows: string[][] = data.values || []

    const rowIndex = rows.findIndex(r => r[0] === taskId)
    if (rowIndex === -1) return true

    const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}:batchUpdate`
    const res = await fetch(batchUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: TASKS_SHEET_GID,
                dimension: 'ROWS',
                startIndex: rowIndex,
                endIndex: rowIndex + 1,
              },
            },
          },
        ],
      }),
    })
    return res.ok
  } catch (e) {
    console.warn('[Google Sheets] Failed to delete task:', e)
    return false
  }
}

/**
 * Read all tasks directly via Google Sheets API v4.
 */
export async function readTasksFromSheetAPI(): Promise<TodayTask[] | null> {
  const token = await getGoogleAccessToken()
  if (!token) return null

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${TASKS_SHEET_NAME}!A1:I500`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    const data = await res.json()
    const rows: string[][] = data.values || []
    if (rows.length <= 1) return []

    const tasks: TodayTask[] = []
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i]
      const id = (r[0] || '').trim()
      const title = (r[1] || '').trim()
      if (!id || !title) continue

      const priority = (r[3] || 'normal') as any
      const isFocus = priority === 'focus'
      const completedStr = (r[6] || '').toString().toLowerCase().trim()
      const done = completedStr === 'true' || completedStr === '1'

      tasks.push({
        id,
        title,
        priority: isFocus ? 'focus' : 'normal',
        done,
        category: r[4] || 'General Work',
        categoryType: (r[4] || '').toLowerCase().includes('design') ? 'design' : 'work',
        time: r[5] || 'Today',
        priorityTag: isFocus ? 'High Priority' : 'Normal',
        dotColor: isFocus ? 'bg-rose-400' : 'bg-[#00F0FF]',
        tagColor: isFocus
          ? 'bg-rose-500/20 text-rose-300 border-rose-500/35'
          : 'bg-cyan-500/20 text-[#00F0FF] border-cyan-500/35',
        completedAt: done ? r[8] || r[7] || 'Completed' : undefined,
      })
    }
    return tasks
  } catch (e) {
    console.warn('[Google Sheets] Direct API read error:', e)
    return null
  }
}
