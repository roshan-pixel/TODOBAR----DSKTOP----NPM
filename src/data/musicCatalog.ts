export interface CatalogItem {
  id: string
  title: string
  artist: string
  genre: 'POP HITS' | 'LOFI & CHILL' | 'SYNTHWAVE' | 'SOUNDTRACKS' | 'BINAURAL' | 'PIANO & CLASSICAL' | 'JAZZ & CAFE' | 'GAMING & ANIME' | 'PHONK & EDM' | 'ROCK & METAL'
  color: string
  videoId?: string
  playlistId?: string
  keywords: string[]
}

export const FULL_MUSIC_CATALOG: CatalogItem[] = [
  // 1. 🔥 POP HITS & CHART TOPPERS
  {
    id: 'starboy',
    title: 'Starboy',
    artist: 'The Weeknd ft. Daft Punk',
    genre: 'POP HITS',
    color: '#ef4444',
    videoId: '34Na4j8AVgA',
    keywords: ['starboy', 'star boy', 'the weeknd', 'daft punk', 'starboy the weeknd']
  },
  {
    id: 'blinding-lights',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    genre: 'POP HITS',
    color: '#f97316',
    videoId: '4NRXx6U8ABQ',
    keywords: ['blinding lights', 'the weeknd', 'blinding lights weeknd']
  },
  {
    id: 'coldplay-yellow',
    title: 'Yellow',
    artist: 'Coldplay',
    genre: 'POP HITS',
    color: '#eab308',
    videoId: 'yKNxeF4KMsY',
    keywords: ['coldplay yellow', 'coldplay', 'cold play', 'yellow']
  },
  {
    id: 'coldplay-viva',
    title: 'Viva La Vida',
    artist: 'Coldplay',
    genre: 'POP HITS',
    color: '#84cc16',
    videoId: 'dvgZkm1xWPE',
    keywords: ['viva la vida', 'coldplay viva la vida', 'coldplay']
  },
  {
    id: 'coldplay-fixyou',
    title: 'Fix You',
    artist: 'Coldplay',
    genre: 'POP HITS',
    color: '#06b6d4',
    videoId: 'k4V3Mo61fJM',
    keywords: ['fix you', 'coldplay fix you', 'coldplay']
  },
  {
    id: 'shape-of-you',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    genre: 'POP HITS',
    color: '#3b82f6',
    videoId: 'JGwWNGJdvx8',
    keywords: ['shape of you', 'ed sheeran']
  },
  {
    id: 'as-it-was',
    title: 'As It Was',
    artist: 'Harry Styles',
    genre: 'POP HITS',
    color: '#ec4899',
    videoId: 'H5v3kku4y6Q',
    keywords: ['as it was', 'harry styles']
  },
  {
    id: 'die-with-a-smile',
    title: 'Die With A Smile',
    artist: 'Lady Gaga & Bruno Mars',
    genre: 'POP HITS',
    color: '#a855f7',
    videoId: 'kPa7bsKwL-c',
    keywords: ['die with a smile', 'lady gaga', 'bruno mars']
  },
  {
    id: 'espresso',
    title: 'Espresso',
    artist: 'Sabrina Carpenter',
    genre: 'POP HITS',
    color: '#f43f5e',
    videoId: 'eVli-tstM5E',
    keywords: ['espresso', 'sabrina carpenter']
  },
  {
    id: 'birds-feather',
    title: 'BIRDS OF A FEATHER',
    artist: 'Billie Eilish',
    genre: 'POP HITS',
    color: '#10b981',
    videoId: 'V9PVRfjEBTI',
    keywords: ['birds of a feather', 'billie eilish']
  },
  {
    id: 'good-luck-babe',
    title: 'Good Luck, Babe!',
    artist: 'Chappell Roan',
    genre: 'POP HITS',
    color: '#d946ef',
    videoId: '1RKqOmSkGgM',
    keywords: ['good luck babe', 'chappell roan']
  },
  {
    id: 'not-like-us',
    title: 'Not Like Us',
    artist: 'Kendrick Lamar',
    genre: 'POP HITS',
    color: '#e11d48',
    videoId: 'H58vbez_m4E',
    keywords: ['not like us', 'kendrick lamar']
  },
  {
    id: 'drake-gods-plan',
    title: "God's Plan",
    artist: 'Drake',
    genre: 'POP HITS',
    color: '#8b5cf6',
    videoId: 'xpVfcZ0ZcFM',
    keywords: ['gods plan', 'drake']
  },
  {
    id: 'travis-fein',
    title: 'FE!N',
    artist: 'Travis Scott ft. Playboi Carti',
    genre: 'POP HITS',
    color: '#6366f1',
    videoId: 'B9synWjqBn8',
    keywords: ['fein', 'travis scott', 'playboi carti']
  },
  {
    id: 'sza-kill-bill',
    title: 'Kill Bill',
    artist: 'SZA',
    genre: 'POP HITS',
    color: '#14b8a6',
    videoId: 'M4ZoCHID9GI',
    keywords: ['kill bill', 'sza']
  },
  {
    id: 'ariana-7-rings',
    title: '7 rings',
    artist: 'Ariana Grande',
    genre: 'POP HITS',
    color: '#f472b6',
    videoId: 'QYh6mYIJG2Y',
    keywords: ['7 rings', 'ariana grande']
  },
  {
    id: 'justin-peaches',
    title: 'Peaches',
    artist: 'Justin Bieber',
    genre: 'POP HITS',
    color: '#fb923c',
    videoId: 'tQ0yjYUFKAE',
    keywords: ['peaches', 'justin bieber']
  },
  {
    id: 'stay-kid-laroi',
    title: 'STAY',
    artist: 'The Kid LAROI & Justin Bieber',
    genre: 'POP HITS',
    color: '#38bdf8',
    videoId: 'kTJczUoc26U',
    keywords: ['stay', 'kid laroi', 'justin bieber']
  },
  {
    id: 'heat-waves',
    title: 'Heat Waves',
    artist: 'Glass Animals',
    genre: 'POP HITS',
    color: '#06b6d4',
    videoId: 'mRD0-GxqHVo',
    keywords: ['heat waves', 'glass animals']
  },

  // 2. ☕ LOFI & CHILL BEATS
  {
    id: 'lofi-girl-beats',
    title: 'Lofi Girl - 24/7 Relax & Study Beats',
    artist: 'Lofi Girl Live',
    genre: 'LOFI & CHILL',
    color: '#f59e0b',
    videoId: '5qap5aO4i9A',
    keywords: ['lofi girl', 'lofi grill', 'lofi grill beats', 'lofi gilr', 'lofi beats', 'chilledcow', 'lofi hip hop', 'lofi']
  },
  {
    id: 'lofi-sleep',
    title: 'Lofi Sleep Beats',
    artist: 'Lofi Records',
    genre: 'LOFI & CHILL',
    color: '#6366f1',
    videoId: 'DWcjZJyZuYg',
    keywords: ['lofi sleep', 'sleep lofi', 'chill lofi']
  },
  {
    id: 'anime-lofi',
    title: 'Anime Lofi Chill Beats',
    artist: 'Anime Lofi Studio',
    genre: 'LOFI & CHILL',
    color: '#ec4899',
    videoId: 'TURbeWK2wwg',
    keywords: ['anime lofi', 'anime chill', 'ghibli lofi']
  },
  {
    id: 'zelda-lofi',
    title: 'Zelda & Chill Lofi',
    artist: 'GameChops',
    genre: 'LOFI & CHILL',
    color: '#10b981',
    videoId: 'GdzrrWA8B7A',
    keywords: ['zelda lofi', 'zelda and chill', 'nintendo lofi']
  },
  {
    id: 'nujabes-homework',
    title: 'Nujabes Homework Edit',
    artist: 'Nujabes Tribute',
    genre: 'LOFI & CHILL',
    color: '#f97316',
    videoId: 'g9hwjQBQFIo',
    keywords: ['nujabes', 'nujabes homework', 'hip hop lofi']
  },
  {
    id: 'jazzhop-cafe',
    title: 'Coffee Shop Jazzhop',
    artist: 'Jazzhop Cafe',
    genre: 'LOFI & CHILL',
    color: '#84cc16',
    videoId: '2gliGgeb2ak',
    keywords: ['jazzhop', 'coffee shop lofi', 'cafe beats']
  },
  {
    id: 'tokyo-night-lofi',
    title: 'Tokyo Night Lofi Beats',
    artist: 'Chillhop Music',
    genre: 'LOFI & CHILL',
    color: '#06b6d4',
    videoId: 'F89Kwh6hPqI',
    keywords: ['tokyo lofi', 'tokyo night', 'japan lofi']
  },

  // 3. 🌌 SYNTHWAVE & CYBERPUNK
  {
    id: 'synthwave-coding',
    title: 'Synthwave Radio - Chill Synth / Cyberpunk',
    artist: 'Lofi Girl Synthwave',
    genre: 'SYNTHWAVE',
    color: '#00F0FF',
    videoId: '4xDzrJKXOOY',
    keywords: ['synthwave coding', 'synthwave', 'synth wave', 'retrowave', 'cyberpunk', 'defcon synthwave']
  },
  {
    id: 'cyberpunk-2077',
    title: 'Cyberpunk 2077 Focus Mix',
    artist: 'Night City Radio',
    genre: 'SYNTHWAVE',
    color: '#e11d48',
    videoId: 'MVPTG58-fsU',
    keywords: ['cyberpunk', 'cyberpunk 2077', 'night city', 'darksynth']
  },
  {
    id: 'blade-runner-2049',
    title: 'Blade Runner 2049 Ambient Focus',
    artist: 'Hans Zimmer & Vangelis',
    genre: 'SYNTHWAVE',
    color: '#38bdf8',
    videoId: 'Q_H779ge368',
    keywords: ['blade runner', 'blade runner 2049', 'ambient synth']
  },
  {
    id: 'tron-legacy-ost',
    title: 'Tron Legacy Soundtrack',
    artist: 'Daft Punk',
    genre: 'SYNTHWAVE',
    color: '#0284c7',
    videoId: '18-gL1g8qjE',
    keywords: ['tron legacy', 'daft punk tron', 'tron soundtrack']
  },
  {
    id: 'stranger-things-theme',
    title: 'Stranger Things Synth Theme',
    artist: 'Kyle Dixon & Michael Stein',
    genre: 'SYNTHWAVE',
    color: '#be123c',
    videoId: 'R6h4Jd66e74',
    keywords: ['stranger things', 'stranger things synth', '80s synth']
  },

  // 4. 🎬 SOUNDTRACKS & HANS ZIMMER
  {
    id: 'interstellar-suite',
    title: 'Hans Zimmer - Interstellar Suite',
    artist: 'Hans Zimmer',
    genre: 'SOUNDTRACKS',
    color: '#38bdf8',
    videoId: 'UDVtMYqUA4U',
    keywords: ['hans zimmer focus', 'hans zimmer', 'interstellar', 'interstellar theme']
  },
  {
    id: 'inception-time',
    title: 'Time (Inception Theme)',
    artist: 'Hans Zimmer',
    genre: 'SOUNDTRACKS',
    color: '#a855f7',
    videoId: 'RxabA78sufc',
    keywords: ['inception', 'time', 'time hans zimmer', 'hans zimmer time']
  },

  // 5. 🧠 BINAURAL & BRAINWAVES
  {
    id: 'deep-binaural-432',
    title: '432Hz Deep Focus Binaural Waves',
    artist: 'Neuro Focus Labs',
    genre: 'BINAURAL',
    color: '#10b981',
    videoId: '1ZYbU82GVz4',
    keywords: ['deep binaural 432hz', 'binaural', 'binaural beats', '432hz', 'brain food', 'alpha waves']
  },
  {
    id: 'brown-noise-10h',
    title: '10 Hours Deep Brown Noise',
    artist: 'Sleep & Focus Therapy',
    genre: 'BINAURAL',
    color: '#78350f',
    videoId: 'RqzGzwTY-6w',
    keywords: ['brown noise', 'deep brown noise', 'focus noise']
  },
  {
    id: 'white-noise-10h',
    title: '10 Hours Pure White Noise',
    artist: 'Sound Relaxation',
    genre: 'BINAURAL',
    color: '#94a3b8',
    videoId: 'nMfPqeZjc2c',
    keywords: ['white noise', 'pure white noise']
  },
  {
    id: 'rain-sounds-heavy',
    title: 'Heavy Rain & Thunderstorm Focus',
    artist: 'Nature Soundscapes',
    genre: 'BINAURAL',
    color: '#0284c7',
    videoId: 'mPZkdNFkNps',
    keywords: ['rain sounds', 'rain', 'thunderstorm', 'heavy rain']
  },

  // 6. 🎹 PIANO & CLASSICAL
  {
    id: 'peaceful-piano-pl',
    title: 'Peaceful Piano Focus Playlist',
    artist: 'Acoustic Piano',
    genre: 'PIANO & CLASSICAL',
    color: '#38bdf8',
    playlistId: 'PLxA687tYuMWhU2dF228p3N1pY94X9vY0O',
    keywords: ['peaceful piano', 'piano', 'piano focus', 'relaxing piano']
  },
  {
    id: 'classical-study-mix',
    title: 'Mozart & Beethoven Classical Study',
    artist: 'Classical Focus Ensemble',
    genre: 'PIANO & CLASSICAL',
    color: '#f59e0b',
    videoId: 'jgpJVI3tDbY',
    keywords: ['classical study', 'classical', 'mozart', 'beethoven', 'classical focus']
  },
  {
    id: 'einaudi-nuvole',
    title: 'Nuvole Bianche',
    artist: 'Ludovico Einaudi',
    genre: 'PIANO & CLASSICAL',
    color: '#818cf8',
    videoId: 'kcihcYn4860',
    keywords: ['ludovico einaudi', 'nuvole bianche', 'einaudi']
  },
  {
    id: 'yiruma-river',
    title: 'River Flows in You',
    artist: 'Yiruma',
    genre: 'PIANO & CLASSICAL',
    color: '#c084fc',
    videoId: '7maJOI3QMu0',
    keywords: ['yiruma', 'river flows in you']
  },

  // 7. 🎷 JAZZ & CAFE
  {
    id: 'coffee-cafe-jazz',
    title: 'Warm Cafe Jazz Beats',
    artist: 'Coffee Table Jazz',
    genre: 'JAZZ & CAFE',
    color: '#fb923c',
    videoId: 'Dx5qFachd3A',
    keywords: ['coffee table jazz', 'cafe jazz', 'jazz', 'smooth jazz']
  },
  {
    id: 'bossa-nova-cafe',
    title: 'Bossa Nova Cafe Chill',
    artist: 'Bossa Nova Trio',
    genre: 'JAZZ & CAFE',
    color: '#facc15',
    videoId: 'g65oWFMSoqc',
    keywords: ['bossa nova', 'bossa nova cafe', 'brazilian jazz']
  },

  // 8. 🎮 GAMING & ANIME
  {
    id: 'minecraft-c418-ost',
    title: 'Minecraft C418 Full OST',
    artist: 'C418',
    genre: 'GAMING & ANIME',
    color: '#22c55e',
    videoId: 'N8zaFYb9LzA',
    keywords: ['minecraft soundtrack', 'minecraft', 'c418', 'sweden minecraft']
  },
  {
    id: 'skyrim-ambient-ost',
    title: 'Skyrim Atmospheres Focus',
    artist: 'Jeremy Soule',
    genre: 'GAMING & ANIME',
    color: '#64748b',
    videoId: 'x5R6w4X94wY',
    keywords: ['skyrim ambient', 'skyrim', 'skyrim atmospheres']
  },
  {
    id: 'studio-ghibli-piano',
    title: 'Studio Ghibli Relaxing Piano',
    artist: 'Joe Hisaishi Piano',
    genre: 'GAMING & ANIME',
    color: '#a7f3d0',
    videoId: 'R0VpT17ZtG8',
    keywords: ['studio ghibli', 'spirited away', 'totoro', 'ghibli piano']
  },

  // 9. 🎧 PHONK & EDM
  {
    id: 'drift-phonk-coding',
    title: 'Drift Phonk Gaming & Coding',
    artist: 'Phonk Nation',
    genre: 'PHONK & EDM',
    color: '#dc2626',
    videoId: '1-s8LVbPjiw',
    keywords: ['phonk coding', 'phonk', 'drift phonk']
  },
  {
    id: 'deep-house-chill',
    title: 'Deep House Chill Focus',
    artist: 'Deep House Lounge',
    genre: 'PHONK & EDM',
    color: '#2563eb',
    videoId: 'W9pOS4XCHGQ',
    keywords: ['deep house', 'deep house chill', 'house music']
  },

  // 10. 🎸 ROCK & METAL
  {
    id: 'queen-bohemian',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    genre: 'ROCK & METAL',
    color: '#eab308',
    videoId: 'fJ9rUzIMcZQ',
    keywords: ['rock focus', 'queen', 'bohemian rhapsody']
  },
  {
    id: 'linkin-park-numb',
    title: 'Numb',
    artist: 'Linkin Park',
    genre: 'ROCK & METAL',
    color: '#64748b',
    videoId: 'eVTXPUF4Oz4',
    keywords: ['linkin park', 'numb', 'rock']
  }
]
