import React, { useRef, useLayoutEffect, useState } from 'react'
import { SectionView, DockEdge } from '../types'
import { LiquidGlassIcon, LiquidIconType } from './LiquidGlassIcon'
import { sounds } from '../services/audio'

// ─── MobileDock: Pixel-perfect liquid glass bottom nav ───────────────────────
interface MobileDockProps {
  navItems: { id: SectionView; label: string; iconType: LiquidIconType; badge?: number; shortcut: string }[]
  activeView: SectionView
  handleNav: (view: SectionView) => void
}

const MobileDock: React.FC<MobileDockProps> = ({ navItems, activeView, handleNav }) => {
  const navRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 })
  const [mounted, setMounted] = useState(false)

  const activeIndex = navItems.findIndex(item => item.id === activeView)

  // Measure real button positions → move pill to exactly cover the active tab
  useLayoutEffect(() => {
    const btn = btnRefs.current[activeIndex]
    const nav = navRef.current
    if (!btn || !nav) return

    const navRect = nav.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()

    setPillStyle({
      left: btnRect.left - navRect.left,
      width: btnRect.width,
    })
    if (!mounted) setMounted(true)
  }, [activeIndex, activeView])

  return (
    <div className="fixed bottom-3 inset-x-0 px-4 pb-[max(env(safe-area-inset-bottom),4px)] z-30 pointer-events-none flex justify-center select-none">
      {/* Outer dock capsule */}
      <div
        ref={navRef}
        className="relative w-full max-w-[360px] rounded-[32px] pointer-events-auto shadow-2xl"
        style={{
          background: 'rgba(14, 10, 36, 0.60)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.16)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28), 0 20px 60px rgba(0,0,0,0.65)',
          padding: '6px',
        }}
      >
        {/* ── Liquid glass morphing pill ── */}
        {mounted && (
          <div
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              top: '6px',
              bottom: '6px',
              left: `${pillStyle.left}px`,
              width: `${pillStyle.width}px`,
              // Apple spring: slight overshoot on position change
              transition: 'left 420ms cubic-bezier(0.34, 1.56, 0.64, 1), width 380ms cubic-bezier(0.34, 1.4, 0.64, 1)',
              borderRadius: '24px',
              // Layered liquid glass pill — matches WWDC25 bubble aesthetic
              background: 'rgba(255,255,255,0.14)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.30)',
              boxShadow: [
                // Top specular highlight (the "glass edge" shine)
                'inset 0 1.5px 0 rgba(255,255,255,0.55)',
                // Bottom inner shadow for depth
                'inset 0 -1px 0 rgba(0,0,0,0.18)',
                // Soft outer glow
                '0 4px 20px rgba(255,255,255,0.08)',
                '0 2px 8px rgba(0,0,0,0.4)',
              ].join(', '),
            }}
          >
            {/* Inner bright core — mimics the lozenge bubble from WWDC25 */}
            <div
              style={{
                position: 'absolute',
                top: '2px',
                left: '20%',
                right: '20%',
                height: '40%',
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(255,255,255,0.22) 0%, transparent 80%)',
                filter: 'blur(3px)',
              }}
            />
          </div>
        )}

        {/* Nav buttons row */}
        <div className="relative flex items-center justify-between z-10">
          {navItems.map((item, idx) => {
            const isActive = activeView === item.id
            return (
              <button
                key={item.id}
                ref={el => { btnRefs.current[idx] = el }}
                role="tab"
                aria-selected={isActive}
                aria-label={item.label}
                onClick={() => handleNav(item.id)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer relative py-1.5 transition-transform duration-150 active:scale-90"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {/* Icon wrapper */}
                <div className="relative flex items-center justify-center">
                  <div
                    className="transition-all duration-300"
                    style={{
                      transform: isActive ? 'scale(1.08)' : 'scale(1)',
                    }}
                  >
                    <LiquidGlassIcon
                      type={item.iconType}
                      size="sm"
                      isActive={isActive}
                    />
                  </div>

                  {/* Badge */}
                  {item.badge !== undefined && (
                    <span
                      aria-label={`${item.badge} open tasks`}
                      className="absolute -top-1 -right-1 text-[9px] min-w-[15px] h-3.5 px-0.5 rounded-full flex items-center justify-center font-bold font-mono text-white shadow-sm z-20 border border-white/30 bg-gradient-to-r from-sky-500 to-indigo-500"
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  className="text-[10px] font-medium tracking-tight transition-all duration-200"
                  style={{
                    color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.42)',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────────────────

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
      <MobileDock
        navItems={navItems}
        activeView={activeView}
        handleNav={handleNav}
      />
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
