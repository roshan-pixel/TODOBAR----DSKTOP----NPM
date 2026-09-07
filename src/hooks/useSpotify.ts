import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getCurrentPlayback,
  getUserPlaylists,
  pausePlayback,
  resumePlayback,
  skipToNext,
  skipToPrevious,
  setVolume,
  toggleShuffle,
  playContext,
  searchSpotify,
  loadTokens,
  clearTokens,
  getValidToken,
  type SpotifyPlaybackState,
  type SpotifyPlaylist,
  type SpotifyTrack,
} from '../services/spotify'

export type SpotifyView = 'player' | 'playlists' | 'search'

export function useSpotify() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!loadTokens())
  const [playback, setPlayback] = useState<SpotifyPlaybackState | null>(null)
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([])
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [volume, setVolumeLocal] = useState(80)
  const [view, setView] = useState<SpotifyView>('player')
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Polling playback state ────────────────────────────────────────────────

  const fetchPlayback = useCallback(async () => {
    const token = await getValidToken()
    if (!token) { setIsAuthenticated(false); return }
    const state = await getCurrentPlayback()
    if (state) {
      setPlayback(state)
      setVolumeLocal(state.device?.volume_percent ?? 80)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    fetchPlayback()
    pollRef.current = setInterval(fetchPlayback, 3000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [isAuthenticated, fetchPlayback])

  // ── Playlists ─────────────────────────────────────────────────────────────

  const fetchPlaylists = useCallback(async () => {
    const items = await getUserPlaylists(50)
    setPlaylists(items)
  }, [])

  useEffect(() => {
    if (isAuthenticated && view === 'playlists' && playlists.length === 0) {
      fetchPlaylists()
    }
  }, [isAuthenticated, view, playlists.length, fetchPlaylists])

  // ── Controls ──────────────────────────────────────────────────────────────

  const handlePlayPause = useCallback(async () => {
    try {
      if (playback?.is_playing) {
        await pausePlayback()
        setPlayback(p => p ? { ...p, is_playing: false } : p)
      } else {
        await resumePlayback()
        setPlayback(p => p ? { ...p, is_playing: true } : p)
      }
    } catch (e) {
      setError('No active Spotify device. Open Spotify on any device first.')
    }
  }, [playback])

  const handleNext = useCallback(async () => {
    try { await skipToNext(); setTimeout(fetchPlayback, 400) }
    catch { setError('Playback error') }
  }, [fetchPlayback])

  const handlePrev = useCallback(async () => {
    try { await skipToPrevious(); setTimeout(fetchPlayback, 400) }
    catch { setError('Playback error') }
  }, [fetchPlayback])

  const handleVolume = useCallback(async (v: number) => {
    setVolumeLocal(v)
    try { await setVolume(v) } catch {}
  }, [])

  const handleShuffle = useCallback(async () => {
    const next = !playback?.shuffle_state
    try {
      await toggleShuffle(next)
      setPlayback(p => p ? { ...p, shuffle_state: next } : p)
    } catch {}
  }, [playback])

  const handlePlayPlaylist = useCallback(async (uri: string) => {
    try {
      await playContext(uri)
      setView('player')
      setTimeout(fetchPlayback, 600)
    } catch {
      setError('No active Spotify device. Open Spotify on any device first.')
    }
  }, [fetchPlayback])

  // ── Search ────────────────────────────────────────────────────────────────

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q)
    if (!q.trim()) { setSearchResults([]); return }
    setIsSearching(true)
    const results = await searchSpotify(q)
    setSearchResults(results)
    setIsSearching(false)
  }, [])

  // ── Auth ──────────────────────────────────────────────────────────────────

  const logout = useCallback(() => {
    clearTokens()
    setIsAuthenticated(false)
    setPlayback(null)
    setPlaylists([])
  }, [])

  const onAuthSuccess = useCallback(() => {
    setIsAuthenticated(true)
  }, [])

  return {
    isAuthenticated,
    playback,
    playlists,
    searchResults,
    searchQuery,
    isSearching,
    volume,
    view,
    error,
    setView,
    setError,
    onAuthSuccess,
    handlePlayPause,
    handleNext,
    handlePrev,
    handleVolume,
    handleShuffle,
    handlePlayPlaylist,
    handleSearch,
    logout,
    fetchPlayback,
  }
}
