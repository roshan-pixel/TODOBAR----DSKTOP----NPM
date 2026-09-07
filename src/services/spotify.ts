/**
 * Spotify Web API service
 * Uses Authorization Code with PKCE flow (no backend secret needed in browser)
 */

export const SPOTIFY_CLIENT_ID = '00c3442807f34300852ec58da893a4be'
const REDIRECT_URI = `${window.location.origin}/spotify-callback`
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
  'user-top-read',
].join(' ')

// ── PKCE helpers ─────────────────────────────────────────────────────────────

function base64URLEncode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const data = new TextEncoder().encode(plain)
  return crypto.subtle.digest('SHA-256', data)
}

function generateCodeVerifier(): string {
  const array = new Uint8Array(64)
  crypto.getRandomValues(array)
  return base64URLEncode(array.buffer)
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  return base64URLEncode(await sha256(verifier))
}

// ── OAuth ─────────────────────────────────────────────────────────────────────

export async function initiateSpotifyLogin(): Promise<void> {
  const verifier = generateCodeVerifier()
  const challenge = await generateCodeChallenge(verifier)
  const state = crypto.randomUUID()

  sessionStorage.setItem('spotify_code_verifier', verifier)
  sessionStorage.setItem('spotify_state', state)

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    state,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  })

  window.location.href = `https://accounts.spotify.com/authorize?${params}`
}

export async function exchangeCodeForToken(code: string, state: string): Promise<SpotifyTokens | null> {
  const storedState = sessionStorage.getItem('spotify_state')
  const verifier = sessionStorage.getItem('spotify_code_verifier')

  if (state !== storedState || !verifier) return null

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  })

  if (!res.ok) return null
  const data = await res.json()

  const tokens: SpotifyTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  }
  saveTokens(tokens)
  return tokens
}

export async function refreshAccessToken(refresh_token: string): Promise<SpotifyTokens | null> {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token,
    }),
  })
  if (!res.ok) return null
  const data = await res.json()
  const tokens: SpotifyTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  }
  saveTokens(tokens)
  return tokens
}

// ── Token persistence ─────────────────────────────────────────────────────────

export interface SpotifyTokens {
  access_token: string
  refresh_token: string
  expires_at: number
}

const TOKEN_KEY = 'spotify_tokens'

export function saveTokens(tokens: SpotifyTokens) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))
}

export function loadTokens(): SpotifyTokens | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem('spotify_code_verifier')
  sessionStorage.removeItem('spotify_state')
}

export async function getValidToken(): Promise<string | null> {
  let tokens = loadTokens()
  if (!tokens) return null
  if (Date.now() >= tokens.expires_at - 60_000) {
    tokens = await refreshAccessToken(tokens.refresh_token)
  }
  return tokens?.access_token ?? null
}

// ── API calls ─────────────────────────────────────────────────────────────────

async function apiFetch(path: string, options?: RequestInit) {
  const token = await getValidToken()
  if (!token) throw new Error('Not authenticated')
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (res.status === 204) return null
  if (!res.ok) throw new Error(`Spotify API ${res.status}`)
  return res.json()
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: { name: string; images: { url: string; width: number }[] }
  duration_ms: number
  uri: string
}

export interface SpotifyPlaybackState {
  is_playing: boolean
  progress_ms: number
  item: SpotifyTrack | null
  device: { id: string; name: string; volume_percent: number } | null
  shuffle_state: boolean
  repeat_state: 'off' | 'track' | 'context'
  context: { uri: string; type: string } | null
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  images: { url: string }[]
  tracks: { total: number }
  uri: string
}

export async function getCurrentPlayback(): Promise<SpotifyPlaybackState | null> {
  try { return await apiFetch('/me/player') } catch { return null }
}

export async function getUserPlaylists(limit = 20): Promise<SpotifyPlaylist[]> {
  try {
    const data = await apiFetch(`/me/playlists?limit=${limit}`)
    return data?.items ?? []
  } catch { return [] }
}

export async function playContext(context_uri: string, offset?: number) {
  const body: Record<string, unknown> = { context_uri }
  if (offset !== undefined) body.offset = { position: offset }
  await apiFetch('/me/player/play', { method: 'PUT', body: JSON.stringify(body) })
}

export async function playTrackUri(uri: string) {
  await apiFetch('/me/player/play', {
    method: 'PUT',
    body: JSON.stringify({ uris: [uri] }),
  })
}

export async function pausePlayback() {
  await apiFetch('/me/player/pause', { method: 'PUT' })
}

export async function resumePlayback() {
  await apiFetch('/me/player/play', { method: 'PUT' })
}

export async function skipToNext() {
  await apiFetch('/me/player/next', { method: 'POST' })
}

export async function skipToPrevious() {
  await apiFetch('/me/player/previous', { method: 'POST' })
}

export async function setVolume(volume: number) {
  await apiFetch(`/me/player/volume?volume_percent=${Math.round(volume)}`, { method: 'PUT' })
}

export async function toggleShuffle(state: boolean) {
  await apiFetch(`/me/player/shuffle?state=${state}`, { method: 'PUT' })
}

export async function searchSpotify(query: string): Promise<SpotifyTrack[]> {
  try {
    const data = await apiFetch(`/search?q=${encodeURIComponent(query)}&type=track&limit=10`)
    return data?.tracks?.items ?? []
  } catch { return [] }
}

export async function getCurrentUser() {
  try { return await apiFetch('/me') } catch { return null }
}
