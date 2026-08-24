import React from 'react'
import { Search, PanelRightClose, PanelRightOpen, Maximize2, Minus, X } from 'lucide-react'
import { SectionView, DockEdge } from '../types'
import { sounds } from '../services/audio'

interface MacTitleBarProps {
  title: string
  activeView: SectionView
  dockEdge: DockEdge
  isExpanded: boolean
  onToggleSidebar: () => void
  onOpenSearch: () => void
  playSounds: boolean
  totalTasks: number
  completedTasks: number
}

export const MacTitleBar: React.FC<MacTitleBarProps> = ({
  title,
  activeView,
  dockEdge,
  isExpanded,
  onToggleSidebar,
  onOpenSearch,
  playSounds,
  totalTasks,
  completedTasks,
}) => {
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-transparent border-b border-white/[0.08] select-none shrink-0 h-11 backdrop-blur-md">
      {/* Left: macOS Traffic Lights & Title */}
      <div className="flex items-center gap-3">
        {/* macOS Traffic Light Window Controls */}
        <div className="flex items-center gap-1.5 group/traffic">
          <button
            type="button"
            onClick={() => {
              sounds.playClick(playSounds)
              onToggleSidebar()
            }}
            title="Close / Retract Sidebar (Alt+T)"
            aria-label="Close window"
            className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] flex items-center justify-center cursor-pointer shadow-sm active:brightness-75 transition-all"
          >
            <X className="w-1.5 h-1.5 text-[#4c0002] opacity-0 group-hover/traffic:opacity-100 transition-opacity stroke-[3]" />
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playClick(playSounds)
              onToggleSidebar()
            }}
            title="Minimize"
            aria-label="Minimize window"
            className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] flex items-center justify-center cursor-pointer shadow-sm active:brightness-75 transition-all"
          >
            <Minus className="w-1.5 h-1.5 text-[#5c3e00] opacity-0 group-hover/traffic:opacity-100 transition-opacity stroke-[3]" />
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playClick(playSounds)
            }}
            title="Expand / Fullscreen"
            aria-label="Expand window"
            className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] flex items-center justify-center cursor-pointer shadow-sm active:brightness-75 transition-all"
          >
            <Maximize2 className="w-1.5 h-1.5 text-[#003800] opacity-0 group-hover/traffic:opacity-100 transition-opacity stroke-[3]" />
          </button>
        </div>

        {/* View Title matching Apple HIG typography */}
        <div className="flex items-center gap-2 pl-1">
          <span className="text-xs font-semibold text-white tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            {title}
          </span>
          {totalTasks > 0 && (
            <span className="text-[10px] font-mono font-medium px-2 py-0.2 rounded-full bg-white/[0.08] border border-white/10 text-white/80 shadow-sm backdrop-blur-md">
              {completedTasks}/{totalTasks}
            </span>
          )}
        </div>
      </div>

      {/* Right: Apple Floating Liquid Glass Search Pill & Sidebar Retract */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            sounds.playClick(playSounds)
            onOpenSearch()
          }}
          title="Spotlight Search (⌘/ or /)"
          aria-label="Spotlight Search"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.1] hover:bg-white/[0.18] border border-white/20 text-white/90 hover:text-white text-xs font-medium transition-all cursor-pointer shadow-sm backdrop-blur-xl"
        >
          <Search className="w-3 h-3 text-white stroke-[2.2]" />
          <span className="text-[11px] hidden sm:inline">Search</span>
          <kbd className="text-[9px] px-1 py-0.2 rounded-full bg-white/15 font-mono border border-white/20 text-white/80">
            /
          </kbd>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playClick(playSounds)
            onToggleSidebar()
          }}
          title={isExpanded ? 'Dock Sidebar (Alt+T)' : 'Expand Sidebar (Alt+T)'}
          aria-label="Toggle sidebar"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          {dockEdge === 'right' ? (
            <PanelRightClose className="w-3.5 h-3.5" />
          ) : (
            <PanelRightOpen className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </header>
  )
}
