import React, { useEffect, useState } from 'react'
import { exchangeCodeForToken } from '../services/spotify'

interface SpotifyCallbackProps {
  onSuccess: () => void
  onError: (msg: string) => void
}

export const SpotifyCallback: React.FC<SpotifyCallbackProps> = ({ onSuccess, onError }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    const error = params.get('error')

    if (error) {
      setStatus('error')
      onError(`Spotify denied: ${error}`)
      return
    }

    if (!code || !state) {
      setStatus('error')
      onError('Invalid callback parameters')
      return
    }

    exchangeCodeForToken(code, state).then(tokens => {
      if (tokens) {
        setStatus('success')
        // Clean URL
        window.history.replaceState({}, '', '/')
        onSuccess()
      } else {
        setStatus('error')
        onError('Token exchange failed')
      }
    })
  }, [onSuccess, onError])

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#030712]">
      <div className="flex flex-col items-center gap-4">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 rounded-full border-2 border-[#1DB954]/30 border-t-[#1DB954] animate-spin" />
            <p className="text-sm font-mono text-neutral-400">Connecting to Spotify…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-12 h-12 rounded-full bg-[#1DB954]/20 flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-sm font-mono text-[#1DB954]">Connected! Redirecting…</p>
          </>
        )}
        {status === 'error' && (
          <p className="text-sm font-mono text-red-400">Connection failed. Please try again.</p>
        )}
      </div>
    </div>
  )
}
