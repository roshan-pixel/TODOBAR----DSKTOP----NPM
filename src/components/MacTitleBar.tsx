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
  playSounds,
  isMobile = false,
}) => {
  // Format current date matching reference "Tuesday, Aug 25"
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  // iOS 26 Liquid Glass Header
  return (
    <header className="flex flex-col px-5 pt-safe pb-2 bg-transparent select-none shrink-0 z-20">
      <div className="flex items-center justify-between w-full pt-2">
        {/* Left: Floating Circular Glass Menu Orb */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick(playSounds)
            onToggleSidebar()
          }}
          title="Toggle Navigation Menu"
          aria-label="Navigation Menu"
          className="w-11 h-11 rounded-full liquid-glass-orb flex items-center justify-center cursor-pointer text-white/90"
        >
          <LiquidGlassIcon type="menu" size="sm" />
        </button>

        {/* Center: Title & Subtitle */}
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
            {activeView === 'today' ? 'Today' : title}
          </h1>
          <p className="text-xs text-white/60 font-medium tracking-wide mt-0.5">
            {formattedDate}
          </p>
        </div>

        {/* Right: Floating Circular Glass Search & Add Orbs */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              sounds.playClick(playSounds)
              onOpenSearch()
            }}
            title="Spotlight Search"
            aria-label="Search tasks"
            className="w-11 h-11 rounded-full liquid-glass-orb flex items-center justify-center cursor-pointer text-white/90"
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
            className="w-11 h-11 rounded-full liquid-glass-orb flex items-center justify-center cursor-pointer text-white/90"
          >
            <LiquidGlassIcon type="plus" size="sm" />
          </button>
        </div>
      </div>
    </header>
  )
}
