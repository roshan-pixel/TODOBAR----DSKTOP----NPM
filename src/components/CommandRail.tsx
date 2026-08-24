import React from 'react'
import { SectionView, DockEdge } from '../types'
import { LiquidGlassIcon, LiquidIconType } from './LiquidGlassIcon'
import { sounds } from '../services/audio'

interface CommandRailProps {
  activeView: SectionView
  onSelectView: (view: SectionView) => void
  onOpenSearch: () => void
  onToggleSidebar: () => void
  isExpanded: boolean
  dockEdge: DockEdge
  playSounds: boolean
  totalOpenTasks: number
  totalCompletedTasks: number
}

export const CommandRail: React.FC<CommandRailProps> = ({
  activeView,
  onSelectView,
  onOpenSearch,
  playSounds,
  totalOpenTasks,
  totalCompletedTasks,
}) => {
  const total = totalOpenTasks + totalCompletedTasks
  const percent = total > 0 ? Math.round((totalCompletedTasks / total) * 100) : 0

  const navItems: { id: SectionView; label: string; iconType: LiquidIconType; badge?: number; shortcut: string }[] = [
    { id: 'today', label: "Today's Focus", iconType: 'today', badge: totalOpenTasks > 0 ? totalOpenTasks : undefined, shortcut: '⌘1' },
    { id: 'calendar', label: 'Calendar Plan', iconType: 'calendar', shortcut: '⌘2' },
    { id: 'lists', label: 'Project Lists', iconType: 'lists', shortcut: '⌘3' },
    { id: 'pomodoro', label: 'Focus Chamber', iconType: 'pomodoro', shortcut: '⌘4' },
    { id: 'settings', label: 'Preferences', iconType: 'settings', shortcut: '⌘,' },
  ]

  const handleNav = (view: SectionView) => {
    sounds.playClick(playSounds)
    onSelectView(view)
  }

  // Active item index for sliding capsule physics
  const activeIndex = navItems.findIndex(item => item.id === activeView)

  return (
    <nav
      aria-label="Liquid Glass Navigation Rail"
      className="flex flex-col items-center justify-between py-3.5 px-2 select-none w-15 shrink-0 transition-colors duration-200 liquid-glass-rail relative z-20"
    >
      {/* Top: Liquid Glass App Logo & Spotlight Search */}
      <div className="flex flex-col items-center gap-2.5 w-full">
        {/* App Logo */}
        <button
          type="button"
          onClick={() => handleNav('today')}
          title="Todobar Pro (⌘1)"
          aria-label="Todobar Pro Home"
          className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
        >
          <LiquidGlassIcon type="sparkles" size="md" />
        </button>

        {/* Global Spotlight Search Button */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick(playSounds)
            onOpenSearch()
          }}
          title="Spotlight Search (/)"
          aria-label="Search tasks"
          className="flex items-center justify-center relative group cursor-pointer active:scale-95 transition-transform"
        >
          <LiquidGlassIcon type="search" size="sm" />
          <span className="absolute left-full ml-3 px-3 py-1.5 text-xs font-semibold rounded-xl bg-black/85 text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-2xl border border-white/15 font-mono backdrop-blur-xl">
            Search (/)
          </span>
        </button>

        <div className="w-7 h-[1px] bg-white/10 my-0.5" />

        {/* Navigation Items (Apple HIG Liquid Glass Capsule Rail) */}
        <div className="relative flex flex-col gap-1.5 w-full items-center" role="tablist">
          {/* Sliding Liquid Glass Capsule Highlight */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-11 h-10 rounded-[12px] pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              top: `${activeIndex * 44}px`,
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.08) 100%)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.28)',
              boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.4), 0 4px 14px rgba(0, 0, 0, 0.25)',
            }}
          />

          {navItems.map((item) => {
            const isActive = activeView === item.id
            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={isActive}
                aria-label={item.label}
                onClick={() => handleNav(item.id)}
                title={`${item.label} (${item.shortcut})`}
                className="w-11 h-9.5 flex items-center justify-center relative group cursor-pointer z-10 transition-transform active:scale-95"
              >
                <LiquidGlassIcon
                  type={item.iconType}
                  size="sm"
                  isActive={isActive}
                />

                {/* Subtle Refined Badge for Today open tasks */}
                {item.badge !== undefined && (
                  <span
                    aria-label={`${item.badge} open tasks`}
                    className="absolute -top-1 -right-1 text-[10px] min-w-[17px] h-4 px-1 rounded-full flex items-center justify-center font-extrabold font-mono text-white shadow-md z-20 border border-white/30"
                    style={{
                      background: 'rgba(239, 68, 68, 0.9)',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}

                {/* Apple HIG Tooltip */}
                <span className="absolute left-full ml-3 px-3 py-1.5 text-xs font-semibold rounded-xl bg-black/85 text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-2xl border border-white/15 flex items-center gap-2 backdrop-blur-xl">
                  {item.label}
                  <kbd className="px-1.5 py-0.5 text-[10px] bg-white/10 rounded-md font-mono text-slate-200 border border-white/15">
                    {item.shortcut}
                  </kbd>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Bottom: Apple Progress Dial */}
      <div className="flex flex-col items-center gap-3 w-full">
        <button
          type="button"
          onClick={() => handleNav('today')}
          title={`Today's Progress: ${percent}% completed (${totalCompletedTasks}/${total})`}
          aria-label={`Today's Progress: ${percent}%`}
          className="flex flex-col items-center cursor-pointer group relative w-10 h-10 rounded-[12px] bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 hover:scale-105 justify-center transition-all shadow-sm"
        >
          <div className="w-7 h-7 relative flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/15 stroke-current"
                strokeWidth="3.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-white stroke-current transition-all duration-500 drop-shadow-[0_0_4px_rgba(255,255,255,0.6)]"
                strokeDasharray={`${percent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[8px] font-mono font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {percent}%
            </span>
          </div>
        </button>
      </div>
    </nav>
  )
}
