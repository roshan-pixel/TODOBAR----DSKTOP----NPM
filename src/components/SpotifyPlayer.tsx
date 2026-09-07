import React, { useRef, useState, useEffect } from 'react'
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Volume2,
  Search, ListMusic, Music, LogOut, AlertCircle, ExternalLink, X
} from 'lucide-react'
import { useSpotify } from '../hooks/useSpotify'
import { initiateSpotifyLogin } from '../services/spotify'

function msToTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}:${(s % 60).toString().padStart(2, '0')}`
}

function AlbumArt({ url, isPlaying }: { url?: string; isPlaying: boolean }) {
  return (
    <div className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 ${isPlaying ? 'shadow-[0_0_20px_rgba(29,185,84,0.5)]' : ''}`}>
      {url ? (
        <img src={url} alt="Album art" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-white/10 flex items-center justify-center">
          <Music className="w-6 h-6 text-neutral-500" />
        </div>
      )}
      {isPlaying && (
        <div className="absolute inset-0 border border-[#1DB954]/40 rounded-xl pointer-events-none" />
      )}
    </div>
  )
}

function ProgressBar({ progressMs, durationMs }: { progressMs: number; durationMs: number }) {
  const percent = durationMs > 0 ? Math.min(100, (progressMs / durationMs) * 100) : 0
  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-[9px] font-mono text-neutral-500 w-6 text-right">{msToTime(progressMs)}</span>
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden relative">
        <div
          className="h-full bg-gradient-to-r from-[#1DB954] to-[#1ed760] rounded-full transition-all duration-1000"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-[9px] font-mono text-neutral-500 w-6">{msToTime(durationMs)}</span>
    </div>
  )
}

export const SpotifyPlayer: React.FC = () => {
  const {
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
  } = useSpotify()

  const searchInputRef = useRef<HTMLInputElement>(null)
  const [showVolume, setShowVolume] = useState(false)

  // Handle OAuth callback on this URL
  useEffect(() => {
    if (window.location.pathname === '/spotify-callback') {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const state = params.get('state')
      if (code && state) {
        import('../services/spotify').then(({ exchangeCodeForToken }) => {
          exchangeCodeForToken(code, state).then(tokens => {
            if (tokens) {
              window.history.replaceState({}, '', '/')
              onAuthSuccess()
            }
          })
        })
      }
    }
  }, [onAuthSuccess])

  useEffect(() => {
    if (view === 'search') {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [view])

  const track = playback?.item
  const albumArt = track?.album?.images?.[0]?.url
  const artistName = track?.artists?.map(a => a.name).join(', ') ?? ''

  // ── Not logged in ──────────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="w-full p-3.5 rounded-2xl bg-gradient-to-br from-[#1DB954]/10 to-[#121212]/80 border border-[#1DB954]/20 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-[#1DB954]/20 border border-[#1DB954]/30 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#1DB954]">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-bold text-white">Spotify Music</p>
            <p className="text-[10px] font-mono text-neutral-400">Connect to play your music</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => initiateSpotifyLogin()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-[13px] transition-all active:scale-95 shadow-[0_0_20px_rgba(29,185,84,0.4)]"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Connect Spotify
        </button>
      </div>
    )
  }

  // ── Player view ────────────────────────────────────────────────────────────

  const PlayerView = () => (
    <div className="flex flex-col gap-2.5">
      {/* Track info */}
      <div className="flex items-center gap-3">
        <AlbumArt url={albumArt} isPlaying={playback?.is_playing ?? false} />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-white truncate leading-tight">
            {track?.name ?? 'Not playing'}
          </p>
          <p className="text-[11px] text-neutral-400 truncate mt-0.5">
            {artistName || 'Open Spotify on any device'}
          </p>
          {track && (
            <p className="text-[9px] font-mono text-neutral-600 truncate mt-0.5">
              {track.album.name}
            </p>
          )}
        </div>
        {/* Shuffle */}
        <button
          type="button"
          onClick={handleShuffle}
          className={`p-1.5 rounded-lg transition-all ${playback?.shuffle_state ? 'text-[#1DB954] bg-[#1DB954]/15' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          <Shuffle className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress */}
      {track && (
        <ProgressBar
          progressMs={playback?.progress_ms ?? 0}
          durationMs={track.duration_ms}
        />
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handlePlayPause}
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all active:scale-90 shadow-lg ${
            playback?.is_playing
              ? 'bg-white text-black shadow-[0_0_18px_rgba(255,255,255,0.3)]'
              : 'bg-[#1DB954] text-black shadow-[0_0_18px_rgba(29,185,84,0.5)]'
          }`}
        >
          {playback?.is_playing
            ? <Pause className="w-4 h-4 fill-current" />
            : <Play className="w-4 h-4 fill-current ml-0.5" />
          }
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Volume */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowVolume(v => !v)}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
          {showVolume && (
            <div className="absolute bottom-10 right-0 w-8 h-28 bg-[#1a1f2e] border border-white/10 rounded-2xl p-2 flex flex-col items-center shadow-xl">
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={e => handleVolume(Number(e.target.value))}
                className="w-2 h-full accent-[#1DB954] cursor-pointer"
                style={{ writingMode: 'vertical-lr', direction: 'rtl', appearance: 'slider-vertical' as any }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // ── Playlist view ──────────────────────────────────────────────────────────

  const PlaylistView = () => (
    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto scrollbar-none">
      {playlists.length === 0 ? (
        <div className="flex items-center justify-center py-6 text-neutral-500 text-xs font-mono">
          Loading playlists…
        </div>
      ) : (
        playlists.map(pl => (
          <button
            key={pl.id}
            type="button"
            onClick={() => handlePlayPlaylist(pl.uri)}
            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all text-left active:scale-[0.98] group"
          >
            <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-white/10">
              {pl.images?.[0] ? (
                <img src={pl.images[0].url} alt={pl.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ListMusic className="w-4 h-4 text-neutral-500" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white truncate">{pl.name}</p>
              <p className="text-[9px] font-mono text-neutral-500">{pl.tracks.total} tracks</p>
            </div>
            <Play className="w-3.5 h-3.5 text-[#1DB954] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>
        ))
      )}
    </div>
  )

  // ── Search view ────────────────────────────────────────────────────────────

  const SearchView = () => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.06] border border-white/10 rounded-xl">
        <Search className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search songs, artists…"
          className="flex-1 bg-transparent text-[12px] text-white placeholder-neutral-500 outline-none min-w-0"
        />
        {searchQuery && (
          <button onClick={() => handleSearch('')} className="text-neutral-500 hover:text-white">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="flex flex-col gap-1 max-h-40 overflow-y-auto scrollbar-none">
        {isSearching && (
          <p className="text-center text-[10px] font-mono text-neutral-500 py-3">Searching…</p>
        )}
        {!isSearching && searchResults.map(track => (
          <button
            key={track.id}
            type="button"
            onClick={async () => {
              const { playTrackUri } = await import('../services/spotify')
              playTrackUri(track.uri)
              setView('player')
            }}
            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all text-left active:scale-[0.98] group"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-white/10">
              <img
                src={track.album.images?.slice(-1)[0]?.url}
                alt={track.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-white truncate">{track.name}</p>
              <p className="text-[9px] font-mono text-neutral-500 truncate">
                {track.artists.map(a => a.name).join(', ')}
              </p>
            </div>
            <Play className="w-3 h-3 text-[#1DB954] opacity-0 group-hover:opacity-100 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div className="w-full rounded-2xl bg-gradient-to-br from-[#121212]/90 to-[#0a0a0a]/80 border border-white/10 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 pt-3 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-[#1DB954]">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          <span className="text-[11px] font-bold text-white tracking-wide">SPOTIFY</span>
          {playback?.is_playing && (
            <span className="flex items-end gap-[2px] h-3 ml-1">
              {[0,1,2].map(i => (
                <span
                  key={i}
                  className="w-[2px] bg-[#1DB954] rounded-full"
                  style={{
                    animation: `eq${i + 1} 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
                    height: `${[6, 10, 7][i]}px`,
                  }}
                />
              ))}
            </span>
          )}
        </div>

        {/* View tabs */}
        <div className="flex items-center gap-1">
          {([
            { id: 'player', icon: <Music className="w-3 h-3" /> },
            { id: 'playlists', icon: <ListMusic className="w-3 h-3" /> },
            { id: 'search', icon: <Search className="w-3 h-3" /> },
          ] as const).map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setView(tab.id)}
              className={`p-1.5 rounded-lg transition-all ${
                view === tab.id
                  ? 'bg-[#1DB954]/20 text-[#1DB954]'
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.06]'
              }`}
            >
              {tab.icon}
            </button>
          ))}
          <button
            type="button"
            onClick={logout}
            title="Disconnect Spotify"
            className="p-1.5 rounded-lg text-neutral-600 hover:text-red-400 hover:bg-red-500/10 transition-all ml-1"
          >
            <LogOut className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-3 mt-2 p-2 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-red-300 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Body */}
      <div className="px-3.5 py-3">
        {view === 'player' && <PlayerView />}
        {view === 'playlists' && <PlaylistView />}
        {view === 'search' && <SearchView />}
      </div>
    </div>
  )
}
