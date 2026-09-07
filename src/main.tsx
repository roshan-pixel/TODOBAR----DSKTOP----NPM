import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { SpotifyCallback } from './components/SpotifyCallback'
import './index.css'

function Root() {
  if (window.location.pathname === '/spotify-callback') {
    return (
      <SpotifyCallback
        onSuccess={() => { window.location.href = '/' }}
        onError={(msg) => {
          console.error('Spotify auth error:', msg)
          window.location.href = '/'
        }}
      />
    )
  }
  return <App />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
