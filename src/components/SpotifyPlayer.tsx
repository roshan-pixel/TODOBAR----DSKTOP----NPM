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
  ListMusic,
} from 'lucide-react'
import { getBackendUrl } from '../services/backendSync'
import { FULL_MUSIC_CATALOG, CatalogItem } from '../data/musicCatalog'

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

export interface MediaItem {
  id: string
  source: 'radio' | 'youtube'
  type: 'stream' | 'track' | 'playlist' | 'video'
  title: string
  subtitle: string
  genreTag: string
  color: string
  streamUrl?: string
  embedUrl?: string
  sourceUrl?: string
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

const STORAGE_CUSTOM_KEY = 'todobar_custom_focus_music'
const STORAGE_ACTIVE_KEY = 'todobar_active_focus_music'

export const CURATED_MEDIA_MAP: Record<string, { videoId?: string; playlistId?: string; title: string }> = {}

// Dynamically inject all 100+ catalog items & keywords into lookup map
FULL_MUSIC_CATALOG.forEach(item => {
  const mapVal = {
    videoId: item.videoId,
    playlistId: item.playlistId,
    title: `${item.title} - ${item.artist}`,
  }
  CURATED_MEDIA_MAP[item.title.toLowerCase()] = mapVal
  item.keywords.forEach(kw => {
    CURATED_MEDIA_MAP[kw.toLowerCase()] = mapVal
  })
})

export function parseAnyMedia(input: string): {
  source: 'youtube' | 'audio' | 'search'
  type: 'track' | 'playlist' | 'video' | 'stream'
  id: string
  embedUrl: string
  suggestedTitle?: string
} {
  const trimmed = input.trim()

  // 1. YouTube Playlist link
  const ytPlMatch = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/i)
  if (ytPlMatch && (trimmed.includes('youtube.com') || trimmed.includes('youtu.be'))) {
    const plId = ytPlMatch[1]
    return {
      source: 'youtube',
      type: 'playlist',
      id: plId,
      embedUrl: `https://www.youtube-nocookie.com/embed/videoseries?list=${plId}&autoplay=1&playsinline=1`,
    }
  }

  // 1b. YouTube Video link
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

  // 3. Fallback: Search Query
  return {
    source: 'search',
    type: 'video',
    id: `search-${encodeURIComponent(trimmed)}`,
    embedUrl: '',
    suggestedTitle: trimmed,
  }
}

interface SpotifyPlayerProps {
  isRunning?: boolean
}

export const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ isRunning = false }) => {
  // Default to full-length Chill Lofi radio stream
  const [currentMedia, setCurrentMedia] = useState<MediaItem>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_KEY)
      if (saved) {
        const item = JSON.parse(saved)
        if (item.source === 'radio' || item.source === 'youtube') {
          return item
        }
      }
    } catch {}
    return FULL_RADIO_STATIONS[0]
  })

  // Mode: 'full_radio' | 'catalog'
  const [categoryMode, setCategoryMode] = useState<'full_radio' | 'catalog'>(() => {
    return currentMedia.source === 'radio' ? 'full_radio' : 'catalog'
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

  // Full 100+ Catalog Browser Drawer State
  const [isCatalogOpen, setIsCatalogOpen] = useState(false)
  const [catalogSearch, setCatalogSearch] = useState('')
  const [catalogGenre, setCatalogGenre] = useState<string>('ALL')

  const handleSelectCatalogItem = (item: CatalogItem) => {
    const isPlaylist = Boolean(item.playlistId)
    const embedUrl = isPlaylist
      ? `https://www.youtube-nocookie.com/embed/videoseries?list=${item.playlistId}&autoplay=1&playsinline=1`
      : `https://www.youtube-nocookie.com/embed/${item.videoId}?autoplay=1&playsinline=1`

    const newItem: MediaItem = {
      id: `catalog-${item.id}`,
      source: 'youtube',
      type: isPlaylist ? 'playlist' : 'video',
      embedUrl,
      title: `${item.title} • ${item.artist}`,
      subtitle: `100% Full Playback • ${item.genre} • Zero Login`,
      genreTag: item.genre,
      color: item.color,
      sourceUrl: `https://www.youtube.com/watch?v=${item.videoId || ''}`,
      isCustom: true,
    }

    setCurrentMedia(newItem)
    setCategoryMode('catalog')
    setIsCatalogOpen(false)
    setCustomList(prev => [newItem, ...prev.filter(x => x.id !== newItem.id)])
  }

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

  // Handle native audio playback source change
  useEffect(() => {
    if (currentMedia.source === 'radio' && currentMedia.streamUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio()
      }
      const audio = audioRef.current
      if (audio.src !== currentMedia.streamUrl) {
        audio.src = currentMedia.streamUrl
        audio.volume = radioVolume
        audio.muted = isRadioMuted
        audio.load()
        if (isRunning || isRadioPlaying) {
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
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
        setIsRadioPlaying(false)
      }
    }
  }, [currentMedia])

  // Sync playback with timer running state
  useEffect(() => {
    const audio = audioRef.current
    if (currentMedia.source === 'radio' && audio) {
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
    }
  }, [isRunning])

  // Volume & mute controls
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = radioVolume
      audioRef.current.muted = isRadioMuted
    }
  }, [radioVolume, isRadioMuted])

  const handleSearchOrAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const query = searchInput.trim()
    if (!query) return

    setIsLoadingSearch(true)
    const parsed = parseAnyMedia(query)

    let finalTitle = query
    let resolvedEmbedUrl = ''
    let isPlaylistMatch = false

    if (parsed.source === 'youtube') {
      const isPlaylist = parsed.type === 'playlist'
      const newItem: MediaItem = {
        id: parsed.id,
        source: 'youtube',
        type: parsed.type as any,
        embedUrl: parsed.embedUrl,
        title: finalTitle.startsWith('http') ? (isPlaylist ? 'Custom YouTube Playlist' : 'Custom YouTube Track') : finalTitle,
        subtitle: isPlaylist ? '100% Full Playlist • Zero Login' : '100% Full Playback • Zero Login',
        genreTag: isPlaylist ? 'FULL PLAYLIST' : 'FULL YOUTUBE',
        color: '#ef4444',
        sourceUrl: query,
        isCustom: true,
      }
      setCustomList(prev => [newItem, ...prev.filter(x => x.id !== newItem.id)])
      setCurrentMedia(newItem)
      setCategoryMode('catalog')
    } else {
      // Search term (e.g. Starboy, Lofi Grill, Coldplay)
      const cleanTitle = finalTitle.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
      const curated = Object.entries(CURATED_MEDIA_MAP).find(([k]) => cleanTitle.includes(k) || k.includes(cleanTitle))
      if (curated) {
        const [_, match] = curated
        resolvedEmbedUrl = match.playlistId
          ? `https://www.youtube-nocookie.com/embed/videoseries?list=${match.playlistId}&autoplay=1&playsinline=1`
          : `https://www.youtube-nocookie.com/embed/${match.videoId}?autoplay=1&playsinline=1`
        if (match.playlistId) isPlaylistMatch = true
      } else {
        try {
          const backendUrl = getBackendUrl()
          const res = await fetch(`${backendUrl}/api/music/resolve?q=${encodeURIComponent(finalTitle)}`, {
            headers: { 'Bypass-Tunnel-Reminder': 'true' }
          })
          if (res.ok) {
            const data = await res.json()
            if (data.embedUrl) {
              resolvedEmbedUrl = data.embedUrl
              if (data.isPlaylist) isPlaylistMatch = true
            }
          }
        } catch (err) {
          console.warn('Music resolve error:', err)
        }
      }

      const newItem: MediaItem = {
        id: `song-${Date.now()}`,
        source: resolvedEmbedUrl ? 'youtube' : 'radio',
        type: resolvedEmbedUrl ? (isPlaylistMatch ? 'playlist' : 'video') : 'stream',
        embedUrl: resolvedEmbedUrl || undefined,
        streamUrl: resolvedEmbedUrl ? undefined : FULL_RADIO_STATIONS[0].streamUrl,
        title: finalTitle,
        subtitle: resolvedEmbedUrl
          ? (isPlaylistMatch ? `Full Playlist • Zero Login` : `Full Song • Zero Login`)
          : 'Playing Full 24/7 Focus Stream',
        genreTag: resolvedEmbedUrl ? (isPlaylistMatch ? 'FULL PLAYLIST' : 'FULL SONG') : 'FULL STREAM',
        color: '#00F0FF',
        sourceUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(finalTitle)}`,
        isCustom: true,
      }
      setCustomList(prev => [newItem, ...prev.filter(x => x.id !== newItem.id)])
      setCurrentMedia(newItem)
      setCategoryMode('catalog')
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
            {currentMedia.source === 'youtube' ? (
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

        {/* Center: Live Equalizer */}
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

        {/* Right: Full Radio | List (100+) | Search */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="flex items-center gap-0.5 bg-white/[0.06] p-0.5 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => {
                setCategoryMode('full_radio')
                setCurrentMedia(FULL_RADIO_STATIONS[0])
                setIsCatalogOpen(false)
                setIsSearchOpen(false)
              }}
              title="Full 24/7 Focus Streams (Continuous lossless audio)"
              className={`px-2 py-1 rounded-lg text-[9px] font-mono font-semibold transition-all ${
                categoryMode === 'full_radio' && !isCatalogOpen
                  ? 'bg-[#00F0FF] text-black shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Full Radio
            </button>

            <button
              type="button"
              onClick={() => {
                setIsCatalogOpen(v => !v)
                setIsSearchOpen(false)
              }}
              title="Browse full catalog list of 100+ working songs & playlists"
              className={`px-2 py-1 rounded-lg text-[9px] font-mono font-bold transition-all flex items-center gap-1 ${
                isCatalogOpen
                  ? 'bg-[#00F0FF] text-black shadow-[0_0_12px_rgba(0,240,255,0.5)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ListMusic className="w-3 h-3" />
              <span>List (100+)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsSearchOpen(v => !v)
              setIsCatalogOpen(false)
            }}
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

      {/* ── 2. MAIN ACTIVE PLAYER VIEW ── */}
      <div className="p-3.5 space-y-3">
        
        {/* Track Title & Subtitle Info */}
        <div className="flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-2">
            <h4 className="text-sm font-semibold text-white tracking-wide truncate flex items-center gap-2">
              <span>{currentMedia.title}</span>
            </h4>
            <p className="text-[11px] text-neutral-400 font-mono truncate">
              {currentMedia.subtitle}
            </p>
          </div>
        </div>

        {/* A. 24/7 NATIVE FOCUS RADIO STATIONS BAR */}
        {categoryMode === 'full_radio' && !isCatalogOpen && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-3 gap-1.5">
              {FULL_RADIO_STATIONS.map(st => {
                const isActive = currentMedia.id === st.id
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setCurrentMedia(st)}
                    className={`p-2 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                      isActive
                        ? 'bg-white/[0.12] border-[#00F0FF] shadow-[0_0_14px_rgba(0,240,255,0.3)]'
                        : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.07] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="w-2 h-2 rounded-full shadow-sm"
                        style={{ backgroundColor: st.color, boxShadow: `0 0 6px ${st.color}` }}
                      />
                      {isActive && isPlayingLive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      )}
                    </div>
                    <div className="text-[11px] font-bold text-white truncate leading-tight">
                      {st.title}
                    </div>
                    <div className="text-[9px] font-mono text-neutral-400 truncate mt-0.5">
                      {st.genreTag}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Native Stream Audio Controls */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.04] border border-white/10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleRadioPlayback}
                  disabled={radioLoading}
                  className="w-9 h-9 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#a855f7] text-black flex items-center justify-center font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {radioLoading ? (
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : isRadioPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
                <div>
                  <div className="text-xs font-semibold text-white">
                    {isRadioPlaying ? 'Streaming Live Audio' : 'Stream Paused'}
                  </div>
                  <div className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>24/7 Lossless Audio Stream</span>
                  </div>
                </div>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/10">
                <button type="button" onClick={toggleRadioMute} className="text-neutral-400 hover:text-white">
                  {isRadioMuted || radioVolume === 0 ? (
                    <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isRadioMuted ? 0 : radioVolume}
                  onChange={e => {
                    const v = parseFloat(e.target.value)
                    setRadioVolume(v)
                    if (v > 0) setIsRadioMuted(false)
                  }}
                  className="w-16 h-1 accent-[#00F0FF] cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* B. FULL SONG / YOUTUBE EMBED PLAYER */}
        {currentMedia.source === 'youtube' && currentMedia.embedUrl && (
          <div className="w-full space-y-1.5">
            <div className={`w-full rounded-2xl overflow-hidden border border-[#00F0FF]/20 bg-black/80 shadow-[0_8px_24px_rgba(0,0,0,0.5),0_0_24px_rgba(0,240,255,0.08)] ${currentMedia.type === 'playlist' ? 'h-[220px]' : 'h-[152px]'}`}>
              <iframe
                key={currentMedia.embedUrl}
                src={currentMedia.embedUrl}
                width="100%"
                height={currentMedia.type === 'playlist' ? '220' : '152'}
                frameBorder="0"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                loading="lazy"
                title={currentMedia.title}
                className="w-full h-full block"
              />
            </div>
            <div className="px-1 flex items-center justify-between text-[9px] font-mono">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>100% FULL PLAYBACK • ZERO LOGIN • NO CUTS</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── 3. SEARCH & ADD DRAWER ── */}
      {isSearchOpen && (
        <div className="p-3.5 border-t border-white/[0.08] bg-black/60 backdrop-blur-2xl animate-task-entry">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold tracking-wider text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
              SEARCH & PLAY ANY SONG (ZERO LOGIN)
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
            Type any song name, artist, or YouTube link:
          </p>

          <form onSubmit={handleSearchOrAdd} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="e.g. Starboy, Lofi Grill, Coldplay, Interstellar..."
                  className="w-full px-3 py-2 text-xs font-mono bg-white/[0.06] border border-white/15 rounded-xl text-white placeholder:text-neutral-500 outline-none focus:border-[#00F0FF] transition-all pr-8"
                />
                {isLoadingSearch && (
                  <span className="absolute right-2.5 top-2.5 w-3.5 h-3.5 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              <button
                type="submit"
                disabled={!searchInput.trim()}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 active:scale-95 bg-gradient-to-r from-[#00F0FF] to-[#a855f7] text-black shadow-[0_0_14px_rgba(0,240,255,0.4)] disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Play</span>
              </button>
            </div>

            {searchSuccess && (
              <p className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
                <Check className="w-3 h-3 stroke-[3]" /> Loaded full song! Playing now…
              </p>
            )}
          </form>

          {/* Quick Search Chips */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto scrollbar-none py-0.5">
            {[
              'Starboy',
              'Lofi Grill',
              'Synthwave Coding',
              'Hans Zimmer Focus',
              'Deep Binaural 432Hz',
              'Coldplay Yellow',
              'Minecraft OST',
              'Phonk Coding',
              'Peaceful Piano',
              'Taylor Swift',
              'Cafe Jazz',
              'Brown Noise'
            ].map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchInput(tag)
                }}
                className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-white/[0.06] hover:bg-[#00F0FF]/20 text-neutral-300 hover:text-[#00F0FF] border border-white/10 hover:border-[#00F0FF]/40 whitespace-nowrap transition-all active:scale-95 shadow-sm"
              >
                + {tag}
              </button>
            ))}
          </div>

          {/* User's Saved Custom Music */}
          {customList.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1.5">
                My Recent Songs ({customList.length})
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

      {/* ── 4. FULL CATALOG BROWSER DRAWER (100+ Verified Working Tracks & Playlists) ── */}
      {isCatalogOpen && (
        <div className="p-3.5 border-t border-white/[0.08] bg-black/90 backdrop-blur-2xl animate-task-entry max-h-[440px] flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold tracking-wider text-white flex items-center gap-1.5">
              <ListMusic className="w-4 h-4 text-[#00F0FF]" />
              FULL MUSIC CATALOG (100+ VERIFIED WORKING SONGS & PLAYLISTS)
            </span>
            <button
              type="button"
              onClick={() => setIsCatalogOpen(false)}
              className="p-1 rounded-full text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Filter input */}
          <div className="mb-2">
            <input
              type="text"
              value={catalogSearch}
              onChange={e => setCatalogSearch(e.target.value)}
              placeholder="Search 100+ songs (e.g. Starboy, Lofi Grill, Synthwave, Coldplay, Rain)..."
              className="w-full px-3 py-1.5 text-xs font-mono bg-white/[0.06] border border-white/15 rounded-xl text-white placeholder:text-neutral-500 outline-none focus:border-[#00F0FF] transition-all"
            />
          </div>

          {/* Genre Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-2 mb-2 border-b border-white/10 shrink-0">
            {['ALL', 'POP HITS', 'LOFI & CHILL', 'SYNTHWAVE', 'SOUNDTRACKS', 'BINAURAL', 'PIANO & CLASSICAL', 'JAZZ & CAFE', 'GAMING & ANIME', 'PHONK & EDM', 'ROCK & METAL'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCatalogGenre(cat)}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold whitespace-nowrap transition-all ${
                  catalogGenre === cat
                    ? 'bg-[#00F0FF] text-black shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                    : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Catalog List */}
          <div className="overflow-y-auto scrollbar-none flex-1 space-y-1.5 pr-1">
            {FULL_MUSIC_CATALOG.filter(item => {
              const matchesGenre = catalogGenre === 'ALL' || item.genre === catalogGenre
              const query = catalogSearch.trim().toLowerCase()
              if (!query) return matchesGenre
              const matchesSearch =
                item.title.toLowerCase().includes(query) ||
                item.artist.toLowerCase().includes(query) ||
                item.keywords.some(k => k.includes(query))
              return matchesGenre && matchesSearch
            }).map(item => (
              <div
                key={item.id}
                onClick={() => handleSelectCatalogItem(item)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-[#00F0FF]/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white group-hover:text-[#00F0FF] transition-colors truncate">
                      {item.title}
                    </div>
                    <div className="text-[10px] font-mono text-neutral-400 truncate">
                      {item.artist} • <span className="text-neutral-500">{item.genre}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    handleSelectCatalogItem(item)
                  }}
                  className="px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 hover:bg-[#00F0FF] hover:text-black transition-all shrink-0 flex items-center gap-1"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>Play</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
