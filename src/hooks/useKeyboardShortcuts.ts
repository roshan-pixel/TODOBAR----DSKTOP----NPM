import { useEffect } from 'react'
import { SectionView } from '../types'

interface ShortcutHandlers {
  onToggleSidebar: () => void
  onCloseSidebar: () => void
  onSelectView: (view: SectionView) => void
  onOpenSearch: () => void
  onOpenHelp: () => void
  onFocusInput: () => void
}

export function useKeyboardShortcuts({
  onToggleSidebar,
  onCloseSidebar,
  onSelectView,
  onOpenSearch,
  onOpenHelp,
  onFocusInput,
}: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase()
      const isInputFocused = activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable

      // Global shortcut: Alt + T or Ctrl + Space
      if ((e.altKey && (e.key === 't' || e.key === 'T')) || (e.ctrlKey && e.code === 'Space')) {
        e.preventDefault()
        onToggleSidebar()
        return
      }

      // Escape: Close sidebar or clear modal
      if (e.key === 'Escape') {
        onCloseSidebar()
        return
      }

      // If typing in input, don't trigger single-key navigation shortcuts
      if (isInputFocused) return

      // Number keys 1-5 for tab navigation
      if (e.key === '1') {
        e.preventDefault()
        onSelectView('today')
      } else if (e.key === '2') {
        e.preventDefault()
        onSelectView('calendar')
      } else if (e.key === '3') {
        e.preventDefault()
        onSelectView('lists')
      } else if (e.key === '4') {
        e.preventDefault()
        onSelectView('pomodoro')
      } else if (e.key === '5') {
        e.preventDefault()
        onSelectView('settings')
      }

      // Slash '/' for search
      if (e.key === '/') {
        e.preventDefault()
        onOpenSearch()
      }

      // 'N' or 'n' for new task focus
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        onFocusInput()
      }

      // '?' for shortcuts help modal
      if (e.key === '?') {
        e.preventDefault()
        onOpenHelp()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onToggleSidebar, onCloseSidebar, onSelectView, onOpenSearch, onOpenHelp, onFocusInput])
}
