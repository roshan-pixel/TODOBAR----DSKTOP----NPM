import React, { useState, useEffect, useRef } from 'react'
import {
  Music,
  Plus,
  Trash2,
  ExternalLink,
  Headphones,
  Check,
  Radio,
  ChevronDown,
  ChevronUp,
  Sliders,
  Sparkles,
  X,
  Volume2,
} from 'lucide-react'

export interface SpotifyMediaItem {
  id: string
  type: 'track' | 'playlist' | 'album'
  embedUrl: string
  title: string
  subtitle?: string
  genreTag: string
  color: string
  sourceUrl: string
  isCustom?: boolean
}

// ── Curated Focus Stations (Ready to play instantly with Zero Login) ──────────
const CURATED_STATIONS: SpotifyMediaItem[] = [
  {
    id: '37i9dQZF1DX9RwfGbeGQYe',
    type: 'playlist',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX9RwfGbeGQYe?utm_source=generator&theme=0',
    title: 'Chill Lofi Study',
    subtitle: 'Lo-Fi Beats • Calm Flow',
    genreTag: 'LO-FI',
    color: '#f59e0b', // warm amber
    sourceUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX9RwfGbeGQYe',
  },
  {
    id: '37i9dQZF1DX8Uebhn9wzrS',
    type: 'playlist',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX8Uebhn9wzrS?utm_source=generator&theme=0',
    title: 'Deep Focus Ambient',
    subtitle: 'Atmospheric post-rock & synth',
    genreTag: 'AMBIENT',
    color: '#00F0FF', // cyan
    sourceUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX8Uebhn9wzrS',
  },
  {
    id: '37i9dQZF1DXdLEN7aqioXM',
    type: 'playlist',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM?utm_source=generator&theme=0',
    title: 'Cyberpunk Synth',
    subtitle: 'High-energy coding drive',
    genreTag: 'SYNTHWAVE',
    color: '#a855f7', // purple
    sourceUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM',
  },
  {
    id: '37i9dQZF1DX24KhEZmBurn',
    type: 'playlist',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX24KhEZmBurn?utm_source=generator&theme=0',
    title: 'Brain Food Neuro Flow',
    subtitle: 'Binaural beats & deep flow',
    genreTag: 'BINAURAL',
    color: '#10b981', // emerald
    sourceUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX24KhEZmBurn',
  },
  {
    id: '37i9dQZF1DX4sWSpwq3LiO',
    type: 'playlist',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator&theme=0',
    title: 'Peaceful Piano',
    subtitle: 'Minimal modern piano focus',
    genreTag: 'PIANO',
    color: '#38bdf8', // sky blue
    sourceUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO',
  },
  {
    id: '37i9dQZF1DWVqfgj8NZEp1',
    type: 'playlist',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWVqfgj8NZEp1?utm_source=generator&theme=0',
    title: 'Coffee Table Jazz',
    subtitle: 'Warm cafe acoustics & jazz',
    genreTag: 'JAZZ',
    color: '#fb923c', // orange
    sourceUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWVqfgj8NZEp1',
  },
]

const STORAGE_CUSTOM_KEY = 'todobar_custom_spotify_music'
const STORAGE_ACTIVE_KEY = 'todobar_active_spotify_music'

export function parseSpotifyUrl(input: string): { type: 'track' | 'playlist' | 'album'; id: string } | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const uriMatch = trimmed.match(/spotify:(track|playlist|album):([a-zA-Z0-9]+)/i)
  if (uriMatch) {
    return { type: uriMatch[1].toLowerCase() as any, id: uriMatch[2] }
  }

  const urlMatch = trimmed.match(/open\.spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/i)
  if (urlMatch) {
    return { type: urlMatch[1].toLowerCase() as any, id: urlMatch[2] }
  }

  if (/^[a-zA-Z0-9]{22}$/.test(trimmed)) {
    return { type: 'track', id: trimmed }
  }

  return null
}

interface SpotifyPlayerProps {
  isRunning?: boolean
}

export const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ isRunning = false }) => {
  const [currentMedia, setCurrentMedia] = useState<SpotifyMediaItem>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return CURATED_STATIONS[0]
  })

  const [customList, setCustomList] = useState<SpotifyMediaItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CUSTOM_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return []
  })

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [playerHeight, setPlayerHeight] = useState<'compact' | 'expanded'>('compact')
  const [urlInput, setUrlInput] = useState('')
  const [titleInput, setTitleInput] = useState('')
  const [isLoadingMeta, setIsLoadingMeta] = useState(false)
  const [inputError, setInputError] = useState<string | null>(null)
  const [addSuccess, setAddSuccess] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  // Save active media
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVE_KEY, JSON.stringify(currentMedia))
    } catch {}
  }, [currentMedia])

  // Save custom list
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(customList))
    } catch {}
  }, [customList])

  // Auto-focus input when add drawer opens
  useEffect(() => {
    if (isAddOpen) {
      setTimeout(() => inputRef.current?.focus(), 120)
    }
  }, [isAddOpen])

  // Auto-fetch title via oEmbed when user pastes a link
  const handleUrlChange = async (val: string) => {
    setUrlInput(val)
    setInputError(null)

    const parsed = parseSpotifyUrl(val)
    if (!parsed) return

    setIsLoadingMeta(true)
    try {
      const cleanUrl = `https://open.spotify.com/${parsed.type}/${parsed.id}`
      const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(cleanUrl)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.title && !titleInput) {
          setTitleInput(data.title)
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingMeta(false)
    }
  }

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault()
    setInputError(null)

    const parsed = parseSpotifyUrl(urlInput)
    if (!parsed) {
      setInputError('Please paste a valid Spotify track, album, or playlist link')
      return
    }

    const cleanUrl = `https://open.spotify.com/${parsed.type}/${parsed.id}`
    const embedUrl = `https://open.spotify.com/embed/${parsed.type}/${parsed.id}?utm_source=generator&theme=0`
    const finalTitle = titleInput.trim() || `Custom ${parsed.type.toUpperCase()}`

    const newItem: SpotifyMediaItem = {
      id: parsed.id,
      type: parsed.type,
      embedUrl,
      title: finalTitle,
      subtitle: `My Added ${parsed.type}`,
      genreTag: parsed.type.toUpperCase(),
      color: '#1DB954',
      sourceUrl: cleanUrl,
      isCustom: true,
    }

    setCustomList(prev => [newItem, ...prev.filter(x => x.id !== newItem.id)])
    setCurrentMedia(newItem)
    setUrlInput('')
    setTitleInput('')
    setAddSuccess(true)
    setTimeout(() => {
      setAddSuccess(false)
      setIsAddOpen(false)
    }, 800)
  }

  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setCustomList(prev => prev.filter(x => x.id !== id))
    if (currentMedia.id === id) {
      setCurrentMedia(CURATED_STATIONS[0])
    }
  }

  const iframeHeight = playerHeight === 'compact' ? '80' : '152'

  return (
    <div className="w-full rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden mb-4 transition-all">
      
      {/* ── 1. COMPACT TOP CONTROLS BAR ── */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
        
        {/* Left: Spotify Brand & Soundscape Title */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-[#1DB954] shadow-[0_0_12px_rgba(29,185,84,0.5)] shrink-0">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-black">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>
          
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[11px] font-mono font-bold tracking-wider text-white truncate">
              {currentMedia.genreTag}
            </span>
            <span
              className="text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider shrink-0"
              style={{
                backgroundColor: `${currentMedia.color}22`,
                color: currentMedia.color,
                border: `1px solid ${currentMedia.color}44`,
              }}
            >
              FLOW
            </span>
          </div>
        </div>

        {/* Center: Live Soundwave Visualizer Bars */}
        <div className="flex items-end gap-[2px] h-4 px-2" title="Audio Flow Visualizer">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <span
              key={i}
              className={`w-[2px] rounded-full transition-all ${
                isRunning ? `animate-eq${i}` : 'h-1.5 bg-white/20'
              }`}
              style={{
                backgroundColor: isRunning ? currentMedia.color : undefined,
                boxShadow: isRunning ? `0 0 6px ${currentMedia.color}` : undefined,
              }}
            />
          ))}
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Height Switcher: Compact vs Expanded */}
          <button
            type="button"
            onClick={() => setPlayerHeight(h => (h === 'compact' ? 'expanded' : 'compact'))}
            title={playerHeight === 'compact' ? 'Expand player view' : 'Collapse to mini bar'}
            className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/12 text-neutral-400 hover:text-white transition-all text-[10px] font-mono flex items-center gap-0.5"
          >
            {playerHeight === 'compact' ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Add Song Toggle Button */}
          <button
            type="button"
            onClick={() => setIsAddOpen(v => !v)}
            title="Add your own Spotify track or playlist"
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono font-medium transition-all ${
              isAddOpen
                ? 'bg-[#00F0FF] text-black shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                : 'bg-white/[0.06] hover:bg-white/12 text-neutral-300 hover:text-white border border-white/10'
            }`}
          >
            <Plus className="w-3 h-3 stroke-[2.5]" />
            <span>Add Link</span>
          </button>

          {/* Open in external Spotify app */}
          <a
            href={currentMedia.sourceUrl}
            target="_blank"
            rel="noreferrer"
            title="Open in Spotify"
            className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/12 text-neutral-400 hover:text-[#1DB954] transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* ── 2. QUICK-SWIPE FOCUS STATION PILLS (Zero Navigation Required!) ── */}
      <div className="px-3 pt-2.5 pb-2 overflow-x-auto scrollbar-none flex items-center gap-1.5">
        {CURATED_STATIONS.map(st => {
          const isSelected = currentMedia.id === st.id
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => setCurrentMedia(st)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium whitespace-nowrap transition-all active:scale-95 shrink-0 ${
                isSelected
                  ? 'text-black font-bold shadow-md'
                  : 'bg-white/[0.05] hover:bg-white/10 text-neutral-400 hover:text-white border border-white/5'
              }`}
              style={{
                backgroundColor: isSelected ? st.color : undefined,
                boxShadow: isSelected ? `0 0 14px ${st.color}88` : undefined,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isSelected ? '#000' : st.color }} />
              <span>{st.title.split(' ')[0]}</span>
            </button>
          )
        })}

        {/* User's custom songs in the pill bar */}
        {customList.map(c => {
          const isSelected = currentMedia.id === c.id
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCurrentMedia(c)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium whitespace-nowrap transition-all active:scale-95 shrink-0 ${
                isSelected
                  ? 'bg-[#1DB954] text-black font-bold shadow-[0_0_12px_rgba(29,185,84,0.6)]'
                  : 'bg-white/[0.05] hover:bg-white/10 text-emerald-400/80 border border-emerald-500/20'
              }`}
            >
              <Music className="w-2.5 h-2.5" />
              <span className="truncate max-w-[80px]">{c.title}</span>
            </button>
          )
        })}
      </div>

      {/* ── 3. EMBEDDED ZERO-LOGIN SPOTIFY PLAYER ── */}
      <div className="px-3 pb-3">
        <div
          className="w-full rounded-2xl overflow-hidden border border-white/10 bg-black/80 shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-all duration-300"
          style={{ height: `${iframeHeight}px` }}
        >
          <iframe
            key={`${currentMedia.embedUrl}-${iframeHeight}`}
            src={currentMedia.embedUrl}
            width="100%"
            height={iframeHeight}
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title={`Spotify: ${currentMedia.title}`}
            className="w-full h-full block"
          />
        </div>
      </div>

      {/* ── 4. EXPANDABLE "ADD MUSIC OF YOUR CHOICE" DRAWER ── */}
      {isAddOpen && (
        <div className="p-3.5 border-t border-white/[0.08] bg-black/40 backdrop-blur-xl animate-task-entry">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-mono font-bold tracking-wider text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
              ADD YOUR SPOTIFY MUSIC
            </span>
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="p-1 rounded-full text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <form onSubmit={handleAddSong} className="flex flex-col gap-2">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={urlInput}
                onChange={e => handleUrlChange(e.target.value)}
                placeholder="Paste Spotify track or playlist link..."
                className="w-full px-3 py-2 text-xs font-mono bg-white/[0.06] border border-white/15 rounded-xl text-white placeholder:text-neutral-500 outline-none focus:border-[#00F0FF] transition-all pr-8"
              />
              {isLoadingMeta && (
                <span className="absolute right-2.5 top-2.5 w-3.5 h-3.5 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                placeholder="Custom label (optional)"
                className="flex-1 px-3 py-2 text-xs bg-white/[0.06] border border-white/15 rounded-xl text-white placeholder:text-neutral-500 outline-none focus:border-[#00F0FF] transition-all"
              />
              <button
                type="submit"
                disabled={!urlInput.trim()}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 active:scale-95 bg-gradient-to-r from-[#1DB954] to-[#00F0FF] text-black shadow-[0_0_14px_rgba(29,185,84,0.4)] disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add & Play</span>
              </button>
            </div>

            {inputError && (
              <p className="text-[10px] font-mono text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                {inputError}
              </p>
            )}

            {addSuccess && (
              <p className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
                <Check className="w-3 h-3 stroke-[3]" /> Added to your music! Playing now…
              </p>
            )}
          </form>

          {/* User's Saved Tracks List */}
          {customList.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-white/10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  My Saved Music ({customList.length})
                </span>
              </div>
              <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto scrollbar-none pr-1">
                {customList.map(item => {
                  const isCurrent = currentMedia.id === item.id
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setCurrentMedia(item)
                        setIsAddOpen(false)
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl border text-left cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-[#00F0FF]/15 border-[#00F0FF]/40 text-[#00F0FF]'
                          : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Music className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-xs font-medium truncate">{item.title}</span>
                      </div>
                      <button
                        type="button"
                        onClick={e => handleDeleteCustom(item.id, e)}
                        title="Remove"
                        className="p-1 rounded-md text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-2 shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
