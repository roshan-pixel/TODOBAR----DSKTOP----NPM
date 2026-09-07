import React, { useState, useEffect } from 'react'
import {
  Play,
  Music,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  Headphones,
  Check,
  Search,
  Radio,
  ListMusic,
} from 'lucide-react'

export interface SpotifyMediaItem {
  id: string
  type: 'track' | 'playlist' | 'album'
  embedUrl: string
  title: string
  subtitle?: string
  thumbnailUrl?: string
  sourceUrl: string
  isCustom?: boolean
}

// ── Built-in Focus Stations (Ready to play instantly with Zero Login) ──────────
const CURATED_STATIONS: SpotifyMediaItem[] = [
  {
    id: '37i9dQZF1DX9RwfGbeGQYe',
    type: 'playlist',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX9RwfGbeGQYe?utm_source=generator&theme=0',
    title: 'Chill Lofi Study Beats',
    subtitle: 'Lo-Fi Chillhop • Focus & Relax',
    sourceUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX9RwfGbeGQYe',
  },
  {
    id: '37i9dQZF1DX8Uebhn9wzrS',
    type: 'playlist',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX8Uebhn9wzrS?utm_source=generator&theme=0',
    title: 'Deep Focus Ambient',
    subtitle: 'Atmospheric electronic & post-rock',
    sourceUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX8Uebhn9wzrS',
  },
  {
    id: '37i9dQZF1DXdLEN7aqioXM',
    type: 'playlist',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM?utm_source=generator&theme=0',
    title: 'Cyberpunk Synthwave',
    subtitle: 'Retro synth & high-energy coding drive',
    sourceUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM',
  },
  {
    id: '37i9dQZF1DX24KhEZmBurn',
    type: 'playlist',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX24KhEZmBurn?utm_source=generator&theme=0',
    title: 'Brain Food (Neuro Flow)',
    subtitle: 'Binaural beats & electronic focus',
    sourceUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX24KhEZmBurn',
  },
  {
    id: '37i9dQZF1DX4sWSpwq3LiO',
    type: 'playlist',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator&theme=0',
    title: 'Peaceful Piano Focus',
    subtitle: 'Acoustic piano & modern classical',
    sourceUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO',
  },
  {
    id: '37i9dQZF1DWVqfgj8NZEp1',
    type: 'playlist',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWVqfgj8NZEp1?utm_source=generator&theme=0',
    title: 'Coffee Table Jazz',
    subtitle: 'Warm relaxing cafe jazz',
    sourceUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWVqfgj8NZEp1',
  },
]

const STORAGE_CUSTOM_KEY = 'todobar_custom_spotify_music'
const STORAGE_ACTIVE_KEY = 'todobar_active_spotify_music'

export function parseSpotifyUrl(input: string): { type: 'track' | 'playlist' | 'album'; id: string } | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  // Match spotify:track:id or spotify:playlist:id or spotify:album:id
  const uriMatch = trimmed.match(/spotify:(track|playlist|album):([a-zA-Z0-9]+)/i)
  if (uriMatch) {
    return { type: uriMatch[1].toLowerCase() as any, id: uriMatch[2] }
  }

  // Match open.spotify.com/(track|playlist|album)/id
  const urlMatch = trimmed.match(/open\.spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/i)
  if (urlMatch) {
    return { type: urlMatch[1].toLowerCase() as any, id: urlMatch[2] }
  }

  // Fallback: 22-char Spotify ID
  if (/^[a-zA-Z0-9]{22}$/.test(trimmed)) {
    return { type: 'track', id: trimmed }
  }

  return null
}

export const SpotifyPlayer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'player' | 'stations' | 'add'>('player')
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

  // Add Song form inputs
  const [urlInput, setUrlInput] = useState('')
  const [titleInput, setTitleInput] = useState('')
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)
  const [inputError, setInputError] = useState<string | null>(null)
  const [addSuccess, setAddSuccess] = useState(false)

  // Save active media to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVE_KEY, JSON.stringify(currentMedia))
    } catch {}
  }, [currentMedia])

  // Save custom songs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(customList))
    } catch {}
  }, [customList])

  // Auto-fetch song/playlist title via oEmbed when URL is pasted
  const handleUrlChange = async (val: string) => {
    setUrlInput(val)
    setInputError(null)

    const parsed = parseSpotifyUrl(val)
    if (!parsed) return

    setIsLoadingMetadata(true)
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
      // silent fallback
    } finally {
      setIsLoadingMetadata(false)
    }
  }

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault()
    setInputError(null)

    const parsed = parseSpotifyUrl(urlInput)
    if (!parsed) {
      setInputError('Please paste a valid Spotify song, album, or playlist link')
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
      sourceUrl: cleanUrl,
      isCustom: true,
    }

    // Add to custom list if not already present
    setCustomList(prev => [newItem, ...prev.filter(x => x.id !== newItem.id)])
    setCurrentMedia(newItem)
    setUrlInput('')
    setTitleInput('')
    setAddSuccess(true)
    setTimeout(() => {
      setAddSuccess(false)
      setActiveTab('player')
    }, 900)
  }

  const handleSelectMedia = (item: SpotifyMediaItem) => {
    setCurrentMedia(item)
    setActiveTab('player')
  }

  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setCustomList(prev => prev.filter(x => x.id !== id))
    if (currentMedia.id === id) {
      setCurrentMedia(CURATED_STATIONS[0])
    }
  }

  return (
    <div className="w-full rounded-2xl bg-gradient-to-br from-[#0c121e]/95 via-[#080d1a]/95 to-[#030712]/95 border border-cyan-500/20 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.6)] overflow-hidden mb-3">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3.5 pt-3 pb-2.5 border-b border-white/[0.08] bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#1DB954] flex items-center justify-center shadow-[0_0_12px_rgba(29,185,84,0.6)]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-black">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>
          <span className="text-[11px] font-mono font-bold tracking-wider text-white">SPOTIFY FOCUS</span>
          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            NO LOGIN NEEDED
          </span>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-white/[0.06] p-0.5 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('player')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'player'
                ? 'bg-[#1DB954] text-black shadow-[0_0_10px_rgba(29,185,84,0.5)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Music className="w-3 h-3" />
            <span>Player</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stations')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'stations'
                ? 'bg-[#00F0FF] text-black shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>Stations</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'add'
                ? 'bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Plus className="w-3 h-3" />
            <span>Add Music</span>
          </button>
        </div>
      </div>

      {/* ══ TAB 1: PLAYER VIEW ══ */}
      {activeTab === 'player' && (
        <div className="p-3">
          {/* Active Song Info / Pill */}
          <div className="flex items-center justify-between mb-2.5 px-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex items-end gap-[2px] h-3 shrink-0">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-[2px] bg-[#1DB954] rounded-full animate-pulse"
                    style={{
                      height: `${[8, 12, 6][i]}px`,
                      animationDuration: `${0.6 + i * 0.2}s`,
                    }}
                  />
                ))}
              </span>
              <p className="text-[12px] font-bold text-white truncate">{currentMedia.title}</p>
            </div>
            <a
              href={currentMedia.sourceUrl}
              target="_blank"
              rel="noreferrer"
              title="Open in Spotify App"
              className="text-neutral-400 hover:text-[#1DB954] transition-colors p-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Official Spotify Zero-Login Embed Player */}
          <div className="w-full rounded-xl overflow-hidden border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)] bg-black/60">
            <iframe
              key={currentMedia.embedUrl}
              src={currentMedia.embedUrl}
              width="100%"
              height={currentMedia.type === 'track' ? '152' : '152'}
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title={`Spotify: ${currentMedia.title}`}
              className="w-full block"
            />
          </div>

          {/* Quick Switch Helper Bar */}
          <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-neutral-400 px-1">
            <span>Tap play inside player above</span>
            <button
              type="button"
              onClick={() => setActiveTab('stations')}
              className="text-[#00F0FF] hover:underline flex items-center gap-1"
            >
              <span>Change station</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* ══ TAB 2: CURATED STATIONS ══ */}
      {activeTab === 'stations' && (
        <div className="p-3">
          <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-2">
            One-Tap Focus Stations (No Login)
          </p>
          <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto scrollbar-none pr-1">
            {CURATED_STATIONS.map(station => {
              const isSelected = currentMedia.id === station.id
              return (
                <button
                  key={station.id}
                  type="button"
                  onClick={() => handleSelectMedia(station)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all active:scale-[0.98] ${
                    isSelected
                      ? 'bg-[#1DB954]/15 border-[#1DB954]/50 shadow-[0_0_15px_rgba(29,185,84,0.2)]'
                      : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#1DB954] text-black' : 'bg-white/10 text-neutral-300'
                      }`}
                    >
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-[12px] font-semibold truncate ${
                          isSelected ? 'text-[#1DB954]' : 'text-white'
                        }`}
                      >
                        {station.title}
                      </p>
                      <p className="text-[10px] text-neutral-400 truncate">{station.subtitle}</p>
                    </div>
                  </div>
                  {isSelected ? (
                    <span className="w-5 h-5 rounded-full bg-[#1DB954] text-black flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  ) : (
                    <Play className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ══ TAB 3: ADD MUSIC OF YOUR CHOICE ══ */}
      {activeTab === 'add' && (
        <div className="p-3">
          <form onSubmit={handleAddSong} className="flex flex-col gap-2.5 mb-3">
            <div>
              <label className="text-[10px] font-mono text-neutral-300 uppercase tracking-wider block mb-1">
                Paste Spotify Link (Song / Playlist / Album)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={urlInput}
                  onChange={e => handleUrlChange(e.target.value)}
                  placeholder="https://open.spotify.com/track/..."
                  className="w-full px-3 py-2 text-xs font-mono bg-white/[0.06] border border-white/15 rounded-xl text-white placeholder:text-neutral-500 outline-none focus:border-[#00F0FF] transition-all pr-8"
                />
                {isLoadingMetadata && (
                  <span className="absolute right-2.5 top-2.5 w-3.5 h-3.5 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-neutral-300 uppercase tracking-wider block mb-1">
                Custom Name / Label (Optional)
              </label>
              <input
                type="text"
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                placeholder="e.g. My Favorite Coding Beats"
                className="w-full px-3 py-2 text-xs bg-white/[0.06] border border-white/15 rounded-xl text-white placeholder:text-neutral-500 outline-none focus:border-[#00F0FF] transition-all"
              />
            </div>

            {inputError && (
              <p className="text-[11px] font-mono text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                {inputError}
              </p>
            )}

            {addSuccess && (
              <p className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Music added! Switching to player…
              </p>
            )}

            <button
              type="submit"
              disabled={!urlInput.trim()}
              className="w-full py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 bg-gradient-to-r from-[#1DB954] to-[#00F0FF] text-black shadow-[0_0_18px_rgba(29,185,84,0.4)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add to My Music & Play</span>
            </button>
          </form>

          {/* User's Saved Custom Music List */}
          {customList.length > 0 && (
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  My Added Music ({customList.length})
                </span>
              </div>
              <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto scrollbar-none pr-1">
                {customList.map(item => {
                  const isCurrent = currentMedia.id === item.id
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectMedia(item)}
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
                        title="Remove from my list"
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
