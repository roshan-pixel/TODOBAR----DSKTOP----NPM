import React, { useState, useEffect, useRef } from 'react'
import {
  Music,
  Plus,
  Trash2,
  ExternalLink,
  Check,
  Radio,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  X,
  Search,
  Zap,
} from 'lucide-react'

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

export interface MediaItem {
  id: string
  source: 'radio' | 'spotify' | 'youtube'
  type: 'stream' | 'track' | 'playlist' | 'video'
  title: string
  subtitle: string
  genreTag: string
  color: string
  streamUrl?: string
  embedUrl?: string
  sourceUrl: string
  isCustom?: boolean
}

// ── 1. FULL-LENGTH 24/7 FOCUS STATIONS (Zero 30s Limits, Continuous Full Audio) ──
const FULL_RADIO_STATIONS: MediaItem[] = [
  {
    id: 'lofi-radio',
    source: 'radio',
    type: 'stream',
    title: 'Chill Lofi 24/7',
    subtitle: 'Lo-Fi Chillhop Beats • 100% Full Stream',
    genreTag: 'FULL LO-FI',
    color: '#f59e0b',
    streamUrl: 'https://streams.ilovemusic.de/iloveradio17.mp3',
    sourceUrl: 'https://streams.ilovemusic.de/iloveradio17.mp3',
  },
  {
    id: 'groove-salad',
    source: 'radio',
    type: 'stream',
    title: 'Groove Salad Ambient',
    subtitle: 'Downtempo Chill Flow • 100% Full Stream',
    genreTag: 'FULL CHILL',
    color: '#00F0FF',
    streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
    sourceUrl: 'https://somafm.com/groovesalad/',
  },
  {
    id: 'defcon-radio',
    source: 'radio',
    type: 'stream',
    title: 'DEF CON Synthwave',
    subtitle: 'Cyberpunk & Synth Coding • 100% Full Stream',
    genreTag: 'FULL SYNTH',
    color: '#a855f7',
    streamUrl: 'https://ice1.somafm.com/defcon-128-mp3',
    sourceUrl: 'https://somafm.com/defcon/',
  },
  {
    id: 'drone-zone',
    source: 'radio',
    type: 'stream',
    title: 'Drone Zone Deep Flow',
    subtitle: 'Atmospheric Brainwaves • 100% Full Stream',
    genreTag: 'FULL BINAURAL',
    color: '#10b981',
    streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3',
    sourceUrl: 'https://somafm.com/dronezone/',
  },
  {
    id: 'lush-piano',
    source: 'radio',
    type: 'stream',
    title: 'Lush Acoustic Piano',
    subtitle: 'Mellow Piano & Acoustic • 100% Full Stream',
    genreTag: 'FULL PIANO',
    color: '#38bdf8',
    streamUrl: 'https://ice1.somafm.com/lush-128-mp3',
    sourceUrl: 'https://somafm.com/lush/',
  },
  {
    id: 'jazz-universe',
    source: 'radio',
    type: 'stream',
    title: 'Coffee Table Jazz',
    subtitle: 'Warm Cafe Acoustics & Jazz • 100% Full Stream',
    genreTag: 'FULL JAZZ',
    color: '#fb923c',
    streamUrl: 'https://ice2.somafm.com/sonicuniverse-128-mp3',
    sourceUrl: 'https://somafm.com/sonicuniverse/',
  },
]

// ── 2. SPOTIFY EMBED STATIONS ──
const SPOTIFY_STATIONS: MediaItem[] = [
  {
    id: '37i9dQZF1DX9RwfGbeGQYe',
    source: 'spotify',
    type: 'playlist',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX9RwfGbeGQYe?utm_source=generator&theme=0',
    title: 'Chill Lofi Study Beats',
    subtitle: 'Spotify Curated Playlist',
    genreTag: 'SPOTIFY LO-FI',
    color: '#f59e0b',
    sourceUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX9RwfGbeGQYe',
  },
  {
    id: '37i9dQZF1DX8Uebhn9wzrS',
    source: 'spotify',
    type: 'playlist',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX8Uebhn9wzrS?utm_source=generator&theme=0',
    title: 'Deep Focus Ambient',
    subtitle: 'Spotify Ambient Electronic',
    genreTag: 'SPOTIFY AMBIENT',
    color: '#00F0FF',
    sourceUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX8Uebhn9wzrS',
  },
  {
    id: '37i9dQZF1DXdLEN7aqioXM',
    source: 'spotify',
    type: 'playlist',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM?utm_source=generator&theme=0',
    title: 'Cyberpunk Synthwave',
    subtitle: 'Spotify Retro Coding Drive',
    genreTag: 'SPOTIFY SYNTH',
    color: '#a855f7',
    sourceUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM',
  },
  {
    id: '37i9dQZF1DX24KhEZmBurn',
    source: 'spotify',
    type: 'playlist',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX24KhEZmBurn?utm_source=generator&theme=0',
    title: 'Brain Food Neuro Flow',
    subtitle: 'Spotify Binaural Electronic',
    genreTag: 'SPOTIFY BINAURAL',
    color: '#10b981',
    sourceUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX24KhEZmBurn',
  },
]

const STORAGE_CUSTOM_KEY = 'todobar_custom_focus_music'
const STORAGE_ACTIVE_KEY = 'todobar_active_focus_music'

export function parseAnyMedia(input: string): {
  source: 'spotify' | 'youtube' | 'audio'
  type: 'track' | 'playlist' | 'album' | 'video' | 'stream'
  id: string
  embedUrl: string
  suggestedTitle?: string
} {
  const trimmed = input.trim()

  // 1. YouTube link
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/|music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/i)
  if (ytMatch) {
    const id = ytMatch[1]
    return {
      source: 'youtube',
      type: 'video',
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1`,
    }
  }

  // 2. Direct MP3/Audio stream
  if (/\.(mp3|aac|m4a|ogg|wav)($|\?)/i.test(trimmed)) {
    return {
      source: 'audio',
      type: 'stream',
      id: trimmed,
      embedUrl: trimmed,
    }
  }

  // 3. Spotify URI (spotify:track:id or spotify:playlist:id)
  const uriMatch = trimmed.match(/spotify:(track|playlist|album):([a-zA-Z0-9]+)/i)
  if (uriMatch) {
    const t = uriMatch[1].toLowerCase() as 'track' | 'playlist' | 'album'
    const id = uriMatch[2]
    return {
      source: 'spotify',
      type: t,
      id,
      embedUrl: `https://open.spotify.com/embed/${t}/${id}?utm_source=generator&theme=0`,
    }
  }

  // 4. Spotify URL (open.spotify.com/(track|playlist|album)/id)
  const urlMatch = trimmed.match(/open\.spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/i)
  if (urlMatch) {
    const t = urlMatch[1].toLowerCase() as 'track' | 'playlist' | 'album'
    const id = urlMatch[2]
    return {
      source: 'spotify',
      type: t,
      id,
      embedUrl: `https://open.spotify.com/embed/${t}/${id}?utm_source=generator&theme=0`,
    }
  }

  // 5. Default Fallback: Full Song Search (No Login Required, 100% Full Playback)
  return {
    source: 'youtube',
    type: 'video',
    id: `search-${encodeURIComponent(trimmed)}`,
    embedUrl: `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(trimmed)}&autoplay=1`,
    suggestedTitle: trimmed,
  }
}

interface SpotifyPlayerProps {
  isRunning?: boolean
}

export const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ isRunning = false }) => {
  // Default to full-length Chill Lofi stream
  const [currentMedia, setCurrentMedia] = useState<MediaItem>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return FULL_RADIO_STATIONS[0]
  })

  // Mode: 'full_stream' | 'spotify'
  const [categoryMode, setCategoryMode] = useState<'full_stream' | 'spotify'>(() => {
    return currentMedia.source === 'radio' ? 'full_stream' : 'spotify'
  })

  // Native radio playback state
  const [isRadioPlaying, setIsRadioPlaying] = useState(false)
  const [isRadioMuted, setIsRadioMuted] = useState(false)
  const [radioVolume, setRadioVolume] = useState(0.8)
  const [radioLoading, setRadioLoading] = useState(false)

  // Custom user tracks
  const [customList, setCustomList] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CUSTOM_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return []
  })

  // Search & Add drawer
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)
  const [searchSuccess, setSearchSuccess] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

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

  // Focus search input on open
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 120)
    }
  }, [isSearchOpen])

  // Handle native audio playback
  useEffect(() => {
    if (currentMedia.source === 'radio' && currentMedia.streamUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio()
      }
      const audio = audioRef.current
      audio.src = currentMedia.streamUrl
      audio.volume = radioVolume
      audio.muted = isRadioMuted

      if (isRunning) {
        setRadioLoading(true)
        audio.play()
          .then(() => {
            setIsRadioPlaying(true)
            setRadioLoading(false)
          })
          .catch(() => {
            setIsRadioPlaying(false)
            setRadioLoading(false)
          })
      } else {
        setIsRadioPlaying(false)
        audio.pause()
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
        setIsRadioPlaying(false)
      }
    }
  }, [currentMedia])

  const handleSearchOrAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const query = searchInput.trim()
    if (!query) return

    setIsLoadingSearch(true)
    const parsed = parseAnyMedia(query)

    let finalTitle = query
    let finalSubtitle = 'Full-Length Song (No Login Needed)'

    // If user pasted a Spotify link, fetch title via oEmbed and play full version
    if (parsed.source === 'spotify') {
      try {
        const cleanUrl = `https://open.spotify.com/${parsed.type}/${parsed.id}`
        const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(cleanUrl)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.title) {
            finalTitle = data.title
            finalSubtitle = `Full Track • ${data.author_name || 'Spotify'}`
          }
        }
      } catch {}

      // Play the full audio version so it doesn't cut off at 30s!
      const newItem: MediaItem = {
        id: `full-spotify-${parsed.id}`,
        source: 'youtube',
        type: 'video',
        embedUrl: `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(finalTitle)}&autoplay=1`,
        title: finalTitle,
        subtitle: finalSubtitle,
        genreTag: 'FULL SONG',
        color: '#1DB954',
        sourceUrl: `https://open.spotify.com/${parsed.type}/${parsed.id}`,
        isCustom: true,
      }

      setCustomList(prev => [newItem, ...prev.filter(x => x.id !== newItem.id)])
      setCurrentMedia(newItem)
    } else if (parsed.source === 'youtube') {
      const newItem: MediaItem = {
        id: parsed.id,
        source: 'youtube',
        type: 'video',
        embedUrl: parsed.embedUrl,
        title: finalTitle.startsWith('http') ? 'Custom YouTube Song' : finalTitle,
        subtitle: '100% Full Playback • Zero Login',
        genreTag: 'FULL YOUTUBE',
        color: '#ef4444',
        sourceUrl: query,
        isCustom: true,
      }
      setCustomList(prev => [newItem, ...prev.filter(x => x.id !== newItem.id)])
      setCurrentMedia(newItem)
    } else {
      // General song name search
      const newItem: MediaItem = {
        id: `song-${Date.now()}`,
        source: 'youtube',
        type: 'video',
        embedUrl: parsed.embedUrl,
        title: finalTitle,
        subtitle: 'Full-Length Song (No Login)',
        genreTag: 'FULL SONG',
        color: '#00F0FF',
        sourceUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(finalTitle)}`,
        isCustom: true,
      }
      setCustomList(prev => [newItem, ...prev.filter(x => x.id !== newItem.id)])
      setCurrentMedia(newItem)
    }

    setIsLoadingSearch(false)
    setSearchSuccess(true)
    setSearchInput('')
    setTimeout(() => {
      setSearchSuccess(false)
      setIsSearchOpen(false)
    }, 800)
  }

  const toggleRadioPlayback = () => {
    if (!audioRef.current && currentMedia.streamUrl) {
      audioRef.current = new Audio(currentMedia.streamUrl)
    }
    const audio = audioRef.current
    if (!audio) return

    if (isRadioPlaying) {
      audio.pause()
      setIsRadioPlaying(false)
    } else {
      setRadioLoading(true)
      audio.play()
        .then(() => {
          setIsRadioPlaying(true)
          setRadioLoading(false)
        })
        .catch(() => {
          setIsRadioPlaying(false)
          setRadioLoading(false)
        })
    }
  }

  const toggleRadioMute = () => {
    if (audioRef.current) {
      const next = !isRadioMuted
      audioRef.current.muted = next
      setIsRadioMuted(next)
    }
  }

  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setCustomList(prev => prev.filter(x => x.id !== id))
    if (currentMedia.id === id) {
      setCurrentMedia(FULL_RADIO_STATIONS[0])
    }
  }

  const isRadioActive = currentMedia.source === 'radio'
  const isPlayingLive = isRadioActive ? isRadioPlaying : isRunning

  return (
    <div className="w-full rounded-3xl bg-gradient-to-br from-[#0c1220]/95 via-[#080e1a]/95 to-[#030612]/95 border border-cyan-500/20 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden mb-4 transition-all">
      
      {/* ── 1. TOP STATUS & NAVIGATION BAR ── */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.08] bg-white/[0.02]">
        
        {/* Left: Mode Badge & Title */}
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center shadow-md shrink-0"
            style={{
              backgroundColor: currentMedia.color,
              boxShadow: `0 0 12px ${currentMedia.color}66`,
            }}
          >
            {currentMedia.source === 'spotify' ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-black">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            ) : currentMedia.source === 'youtube' ? (
              <YoutubeIcon className="w-3.5 h-3.5 text-white" />
            ) : (
              <Radio className="w-3.5 h-3.5 text-black stroke-[2.5]" />
            )}
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[11px] font-mono font-bold tracking-wider text-white truncate">
              {currentMedia.genreTag}
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              FULL PLAYBACK
            </span>
          </div>
        </div>

        {/* Center: Live 7-Band Equalizer */}
        <div className="flex items-end gap-[2px] h-4 px-2" title="Live Audio Flow">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <span
              key={i}
              className={`w-[2px] rounded-full transition-all ${
                isPlayingLive ? `animate-eq${i}` : 'h-1.5 bg-white/20'
              }`}
              style={{
                backgroundColor: isPlayingLive ? currentMedia.color : undefined,
                boxShadow: isPlayingLive ? `0 0 6px ${currentMedia.color}` : undefined,
              }}
            />
          ))}
        </div>

        {/* Right: Mode Switcher & Search Button */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="flex items-center gap-0.5 bg-white/[0.06] p-0.5 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => {
                setCategoryMode('full_stream')
                setCurrentMedia(FULL_RADIO_STATIONS[0])
              }}
              title="Full 24/7 Focus Streams (Zero 30s limits, no login needed)"
              className={`px-2 py-1 rounded-lg text-[9px] font-mono font-semibold transition-all ${
                categoryMode === 'full_stream'
                  ? 'bg-[#00F0FF] text-black shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Full Radio
            </button>
            <button
              type="button"
              onClick={() => {
                setCategoryMode('spotify')
                setCurrentMedia(SPOTIFY_STATIONS[0])
              }}
              title="Spotify Embed Playlists"
              className={`px-2 py-1 rounded-lg text-[9px] font-mono font-semibold transition-all ${
                categoryMode === 'spotify'
                  ? 'bg-[#1DB954] text-black shadow-[0_0_8px_rgba(29,185,84,0.4)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Spotify
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsSearchOpen(v => !v)}
            title="Search ANY song of your choice or paste link"
            className={`p-1.5 rounded-lg border transition-all ${
              isSearchOpen
                ? 'bg-purple-500 text-white border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                : 'bg-white/[0.06] hover:bg-white/12 text-neutral-300 border-white/10'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── 2. QUICK-SWIPE FOCUS STATION PILLS (Instant 1-Tap Switching) ── */}
      <div className="px-3 pt-2.5 pb-2 overflow-x-auto scrollbar-none flex items-center gap-1.5">
        {(categoryMode === 'full_stream' ? FULL_RADIO_STATIONS : SPOTIFY_STATIONS).map(st => {
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
                  ? 'bg-purple-500 text-white font-bold shadow-[0_0_12px_rgba(168,85,247,0.6)]'
                  : 'bg-white/[0.05] hover:bg-white/10 text-purple-300 border border-purple-500/20'
              }`}
            >
              <Music className="w-2.5 h-2.5" />
              <span className="truncate max-w-[80px]">{c.title}</span>
            </button>
          )
        })}
      </div>

      {/* ── 3. MAIN AUDIO ENGINE (Continuous Full Playback) ── */}
      <div className="px-3 pb-3">
        {/* A. NATIVE FULL-LENGTH AUDIO RADIO PLAYER (Zero 30s limit, 100% full stream) */}
        {currentMedia.source === 'radio' && (
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-3">
                <p className="text-[13px] font-bold text-white truncate">{currentMedia.title}</p>
                <p className="text-[10px] text-neutral-400 truncate mt-0.5">{currentMedia.subtitle}</p>
              </div>

              {/* Native Radio Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={toggleRadioMute}
                  className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  {isRadioMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={toggleRadioPlayback}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-black transition-all active:scale-90 shadow-lg ${
                    isRadioPlaying
                      ? 'bg-white shadow-[0_0_16px_rgba(255,255,255,0.4)]'
                      : 'bg-gradient-to-r from-[#00c6d4] to-[#00F0FF] shadow-[0_0_16px_rgba(0,240,255,0.6)]'
                  }`}
                >
                  {radioLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : isRadioPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[9px] font-mono text-emerald-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>NO LOGIN NEEDED • CONTINUOUS FULL STREAM</span>
              </span>
              <span className="text-neutral-500 font-mono">128 KBPS HQ</span>
            </div>
          </div>
        )}

        {/* B. SPOTIFY EMBED WITH EASY FULL TRACK RESOLVER */}
        {currentMedia.source === 'spotify' && currentMedia.embedUrl && (
          <div className="flex flex-col gap-2">
            <div className="w-full rounded-2xl overflow-hidden border border-white/10 bg-black/80 shadow-[0_8px_24px_rgba(0,0,0,0.5)] h-[80px]">
              <iframe
                key={currentMedia.embedUrl}
                src={currentMedia.embedUrl}
                width="100%"
                height="80"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title={`Spotify: ${currentMedia.title}`}
                className="w-full h-full block"
              />
            </div>

            <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => {
                  setCategoryMode('full_stream')
                  setCurrentMedia(FULL_RADIO_STATIONS[0])
                }}
                className="text-[#00F0FF] font-semibold hover:underline flex items-center gap-1"
              >
                <Zap className="w-3 h-3 text-[#00F0FF]" />
                <span>Play Full Music (No 30s Limit)</span>
              </button>
              <a
                href={currentMedia.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#1DB954] hover:underline flex items-center gap-1 text-[9px]"
              >
                <span>Spotify App</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        )}

        {/* C. FULL SONG SEARCH / YOUTUBE EMBED (Plays 100% full song without login or preview limits) */}
        {currentMedia.source === 'youtube' && currentMedia.embedUrl && (
          <div className="w-full rounded-2xl overflow-hidden border border-white/10 bg-black/80 shadow-[0_8px_24px_rgba(0,0,0,0.5)] h-[152px]">
            <iframe
              key={currentMedia.embedUrl}
              src={currentMedia.embedUrl}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; encrypted-media; picture-in-picture"
              loading="lazy"
              title={currentMedia.title}
              className="w-full h-full block"
            />
          </div>
        )}
      </div>

      {/* ── 4. "SEARCH ANY SONG OF YOUR CHOICE" DRAWER (Full Playback Without Login) ── */}
      {isSearchOpen && (
        <div className="p-3.5 border-t border-white/[0.08] bg-black/60 backdrop-blur-2xl animate-task-entry">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold tracking-wider text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
              PLAY ANY SONG IN FULL (ZERO LOGIN)
            </span>
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="p-1 rounded-full text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[10px] text-neutral-400 font-mono mb-2">
            Type any song name, artist, or paste any Spotify/YouTube link:
          </p>

          <form onSubmit={handleSearchOrAdd} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="e.g. Starboy, Interstellar, Coldplay, Lofi Girl..."
                  className="w-full px-3 py-2 text-xs font-mono bg-white/[0.06] border border-white/15 rounded-xl text-white placeholder:text-neutral-500 outline-none focus:border-[#00F0FF] transition-all pr-8"
                />
                {isLoadingSearch && (
                  <span className="absolute right-2.5 top-2.5 w-3.5 h-3.5 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              <button
                type="submit"
                disabled={!searchInput.trim()}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 active:scale-95 bg-gradient-to-r from-[#00F0FF] to-[#1DB954] text-black shadow-[0_0_14px_rgba(0,240,255,0.4)] disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Play Full</span>
              </button>
            </div>

            {searchSuccess && (
              <p className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
                <Check className="w-3 h-3 stroke-[3]" /> Loaded full song! Playing now…
              </p>
            )}
          </form>

          {/* Quick Search Chips */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto scrollbar-none">
            {['Lofi Girl Beats', 'Synthwave Coding', 'Hans Zimmer Focus', 'Deep Binaural 432Hz'].map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchInput(tag)
                }}
                className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-white/[0.04] hover:bg-white/10 text-neutral-400 hover:text-white border border-white/5 whitespace-nowrap transition-colors"
              >
                + {tag}
              </button>
            ))}
          </div>

          {/* User's Saved Custom Music */}
          {customList.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1.5">
                My Saved Songs ({customList.length})
              </span>
              <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto scrollbar-none pr-1">
                {customList.map(item => {
                  const isCurrent = currentMedia.id === item.id
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setCurrentMedia(item)
                        setIsSearchOpen(false)
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl border text-left cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-[#00F0FF]/15 border-[#00F0FF]/40 text-[#00F0FF]'
                          : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Music className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
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
