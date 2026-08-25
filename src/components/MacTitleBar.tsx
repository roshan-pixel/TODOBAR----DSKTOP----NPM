import React from 'react'
import { SectionView, DockEdge } from '../types'
import { sounds } from '../services/audio'
import { LiquidGlassIcon } from './LiquidGlassIcon'

interface MacTitleBarProps {
  title: string
  activeView: SectionView
  dockEdge: DockEdge
  isExpanded: boolean
  onToggleSidebar: () => void
  onOpenSearch: () => void
  onOpenAdd?: () => void
  onOpenSettings?: () => void
  playSounds: boolean
  totalTasks: number
  completedTasks: number
  isMobile?: boolean
}

export const MacTitleBar: React.FC<MacTitleBarProps> = ({
  title,
  activeView,
  onToggleSidebar,
  onOpenSearch,
  onOpenAdd,
  onOpenSettings,
  playSounds,
  isMobile = false,
}) => {
  // Format current date matching reference "Tuesday, Aug 25"
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  // On mobile: hamburger opens settings (not toggle/collapse)
  // On desktop: hamburger toggles sidebar as usual
  const handleMenuPress = () => {
    sounds.playClick(playSounds)
    if (isMobile) {
      // On mobile, the hamburger navigates to settings instead of hiding the entire app
      if (onOpenSettings) onOpenSettings()
    } else {
      onToggleSidebar()
    }
  }

  // iOS 26 Liquid Glass Header with Generous Top Safe Area and Airy Hierarchy
  return (
    <header className="flex flex-col px-5 pt-[max(env(safe-area-inset-top),48px)] pb-3 bg-transparent select-none shrink-0 z-20">
      <div className="relative flex items-center justify-between w-full min-h-[44px]">
        {/* Left: Floating Circular Glass Menu Orb */}
        <div className="flex items-center z-10">
          <button
            type="button"
            onClick={handleMenuPress}
            title={isMobile ? 'Settings' : 'Toggle Navigation Menu'}
            aria-label={isMobile ? 'Open Settings' : 'Navigation Menu'}
            className="w-10 h-10 rounded-full liquid-glass-orb flex items-center justify-center cursor-pointer text-white/80 active:scale-95"
          >
            <LiquidGlassIcon type="menu" size="sm" />
          </button>
        </div>

        {/* Center: Title & Subtitle (Absolute Centering Across Whole Screen) */}
        <div className="absolute inset-x-0 flex flex-col items-center justify-center text-center pointer-events-none z-0">
          <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            {activeView === 'today' ? 'Today' : title}
          </h1>
          <p className="text-[12.5px] text-white/60 font-normal tracking-wide mt-0.5">
            {formattedDate}
          </p>
        </div>

        {/* Right: Floating Circular Glass Search & Add Orbs */}
        <div className="flex items-center gap-2 z-10">
          <button
            type="button"
            onClick={() => {
              sounds.playClick(playSounds)
              onOpenSearch()
            }}
            title="Spotlight Search"
            aria-label="Search tasks"
            className="w-10 h-10 rounded-full liquid-glass-orb flex items-center justify-center cursor-pointer text-white/80 active:scale-95"
          >
            <LiquidGlassIcon type="search" size="sm" />
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick(playSounds)
              if (onOpenAdd) onOpenAdd()
              else onOpenSearch()
            }}
            title="Add New Objective"
            aria-label="Add new objective"
            className="w-10 h-10 rounded-full liquid-glass-orb flex items-center justify-center cursor-pointer text-white/80 active:scale-95"
          >
            <LiquidGlassIcon type="plus" size="sm" />
          </button>
        </div>
      </div>
    </header>
  )
}

