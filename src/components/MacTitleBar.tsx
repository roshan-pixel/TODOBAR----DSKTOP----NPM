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

  // iOS 26 Liquid Glass Header with Generous Top Safe Area and Airy Hierarchy
  return (
    <header className="flex flex-col px-5 pt-[max(env(safe-area-inset-top),48px)] pb-3 bg-transparent select-none shrink-0 z-20">
      <div className="flex items-center justify-between w-full">
        {/* Left: Floating Circular Glass Menu Orb */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick(playSounds)
            onToggleSidebar()
          }}
          title="Toggle Navigation Menu"
          aria-label="Navigation Menu"
          className="w-10 h-10 rounded-full liquid-glass-orb flex items-center justify-center cursor-pointer text-white/80 active:scale-95"
        >
          <LiquidGlassIcon type="menu" size="sm" />
        </button>

        {/* Center: Title & Subtitle */}
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-xl font-semibold tracking-tight text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
            {activeView === 'today' ? 'Today' : title}
          </h1>
          <p className="text-[11.5px] text-white/50 font-normal tracking-wide mt-0.5">
            {formattedDate}
          </p>
        </div>

        {/* Right: Floating Circular Glass Search & Add Orbs */}
        <div className="flex items-center gap-2">
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
