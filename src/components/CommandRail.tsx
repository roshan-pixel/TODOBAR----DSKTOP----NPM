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
  isMobile?: boolean
}

export const CommandRail: React.FC<CommandRailProps> = ({
  activeView,
  onSelectView,
  onOpenSearch,
  playSounds,
  totalOpenTasks,
  totalCompletedTasks,
  isMobile = false,
}) => {
  const total = totalOpenTasks + totalCompletedTasks
  const percent = total > 0 ? Math.round((totalCompletedTasks / total) * 100) : 0

  const navItems: { id: SectionView; label: string; iconType: LiquidIconType; badge?: number; shortcut: string }[] = [
    { id: 'today', label: 'Today', iconType: 'today', badge: totalOpenTasks > 0 ? totalOpenTasks : undefined, shortcut: '⌘1' },
    { id: 'calendar', label: 'Calendar', iconType: 'calendar', shortcut: '⌘2' },
    { id: 'lists', label: 'Lists', iconType: 'lists', shortcut: '⌘3' },
    { id: 'pomodoro', label: 'Focus', iconType: 'focus', shortcut: '⌘4' },
    { id: 'settings', label: 'Settings', iconType: 'settings', shortcut: '⌘,' },
  ]

  const handleNav = (view: SectionView) => {
    sounds.playClick(playSounds)
    onSelectView(view)
  }

  // Active item index for sliding capsule physics
  const activeIndex = navItems.findIndex(item => item.id === activeView)

  // Mobile Bottom Navigation Bar Layout (Floating iOS 26 Liquid Glass Dock)
  if (isMobile) {
    return (
      <div className="fixed bottom-3 inset-x-0 px-5 pb-[max(env(safe-area-inset-bottom),6px)] z-30 pointer-events-none flex justify-center select-none">
        <nav
          aria-label="Floating Liquid Glass Bottom Dock"
          className="relative w-full max-w-[350px] p-1.5 rounded-[28px] liquid-glass-dock pointer-events-auto flex items-center justify-between shadow-2xl"
        >
          {/* Fluid Liquid Glass Morphing Selection Pill */}
          <div
            className="absolute top-1.5 bottom-1.5 rounded-[22px] pointer-events-none transition-all duration-380 ease-[cubic-bezier(0.32,0.72,0,1)] liquid-morph-capsule"
            style={{
              left: `${activeIndex * 20}%`,
              width: '20%',
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
                className="flex-1 py-1 flex flex-col items-center justify-center relative group cursor-pointer z-10 transition-transform active:scale-90"
              >
                <div className="relative flex items-center justify-center">
                  <LiquidGlassIcon
                    type={item.iconType}
                    size="sm"
                    isActive={isActive}
                  />

                  {/* iOS Style Floating Badge Orb */}
                  {item.badge !== undefined && (
                    <span
                      aria-label={`${item.badge} open tasks`}
                      className="absolute -top-1 -right-1 text-[9px] min-w-[15px] h-3.5 px-0.5 rounded-full flex items-center justify-center font-bold font-mono text-white shadow-sm z-20 border border-white/30 bg-gradient-to-r from-sky-500 to-indigo-500"
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>

                <span className={`text-[10px] font-medium tracking-tight transition-all duration-200 ${
                  isActive ? 'text-white/95 font-semibold' : 'text-white/45'
                }`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>
      </div>
    )
  }

  // Desktop Vertical Command Rail
  return (
    <nav
      aria-label="Liquid Glass Navigation Rail"
      className="flex flex-col items-center justify-between py-4 px-2 select-none w-16 shrink-0 transition-colors duration-200 liquid-glass-dock relative z-20 border-r border-white/15"
    >
      {/* Top: Liquid Glass App Logo & Spotlight Search */}
      <div className="flex flex-col items-center gap-3 w-full">
        {/* App Logo */}
        <button
          type="button"
          onClick={() => handleNav('today')}
          title="Todobar Pro"
          aria-label="Todobar Pro Home"
          className="w-11 h-11 rounded-full liquid-glass-orb flex items-center justify-center cursor-pointer active:scale-95 transition-transform text-white"
        >
          <LiquidGlassIcon type="today" size="sm" isActive={activeView === 'today'} />
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
          className="w-10 h-10 rounded-full liquid-glass-orb flex items-center justify-center cursor-pointer active:scale-95 transition-transform text-white/80"
        >
          <LiquidGlassIcon type="search" size="sm" />
        </button>

        <div className="w-8 h-[1px] bg-white/15 my-0.5" />

        {/* Navigation Items (Liquid Glass Capsule Rail) */}
        <div className="relative flex flex-col gap-2 w-full items-center" role="tablist">
          {/* Sliding Liquid Glass Capsule Highlight */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-11 h-11 rounded-[16px] pointer-events-none transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] liquid-morph-capsule"
            style={{
              top: `${activeIndex * 52}px`,
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
                className="w-11 h-11 flex items-center justify-center relative group cursor-pointer z-10 transition-transform active:scale-95 rounded-full"
              >
                <LiquidGlassIcon
                  type={item.iconType}
                  size="sm"
                  isActive={isActive}
                />

                {/* Refined Badge */}
                {item.badge !== undefined && (
                  <span
                    aria-label={`${item.badge} open tasks`}
                    className="absolute -top-1 -right-1 text-[9.5px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-bold font-mono text-white shadow-md z-20 border border-white/40 bg-gradient-to-r from-indigo-500 to-pink-500"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
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
          className="flex flex-col items-center cursor-pointer group relative w-10 h-10 rounded-full liquid-glass-orb justify-center transition-all shadow-sm"
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
                className="text-cyan-400 stroke-current transition-all duration-500 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]"
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
