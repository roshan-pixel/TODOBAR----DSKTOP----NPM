import React from 'react'
import {
  Sun,
  Calendar,
  List,
  Target,
  Settings,
  Search,
  Plus,
  Menu,
  Zap,
  Flame,
  Moon,
  Check,
  Folder,
  Pin,
  Bell,
  Clock,
  Coffee,
  Share2,
  Bookmark,
  Info,
  ChevronLeft,
  ChevronRight,
  Play,
  Pencil,
  Trash2,
} from 'lucide-react'

export type LiquidIconType =
  | 'today'
  | 'calendar'
  | 'lists'
  | 'pomodoro'
  | 'focus'
  | 'settings'
  | 'search'
  | 'plus'
  | 'menu'
  | 'sparkles'
  | 'normal'
  | 'later'
  | 'check'
  | 'folder'
  | 'pin'
  | 'bell'
  | 'clock'
  | 'coffee'
  | 'share'
  | 'bookmark'
  | 'info'
  | 'back'
  | 'play'
  | 'pencil'
  | 'trash'

export type LiquidIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface LiquidGlassIconProps {
  type: LiquidIconType
  size?: LiquidIconSize
  isActive?: boolean
  customColor?: string
  className?: string
}

export const LiquidGlassIcon: React.FC<LiquidGlassIconProps> = ({
  type,
  size = 'md',
  isActive = false,
  className = '',
}) => {
  // Sizing definitions matching Apple HIG toolbar & control standards
  const sizeClasses: Record<LiquidIconSize, { box: string; icon: string; radius: string }> = {
    xs: { box: 'w-6 h-6', icon: 'w-3.5 h-3.5', radius: 'rounded-[8px]' },
    sm: { box: 'w-8 h-8', icon: 'w-4 h-4', radius: 'rounded-[10px]' },
    md: { box: 'w-10 h-10', icon: 'w-5 h-5', radius: 'rounded-[14px]' },
    lg: { box: 'w-11 h-11', icon: 'w-5.5 h-5.5', radius: 'rounded-full' },
    xl: { box: 'w-13 h-13', icon: 'w-6 h-6', radius: 'rounded-full' },
  }

  // Authentic Apple Liquid Glass Icon Definitions
  const renderIconGlyph = (iconType: LiquidIconType, cls: string) => {
    const strokeClass = `${cls} stroke-[1.75] transition-all duration-200`

    switch (iconType) {
      case 'today':
        // SF Symbol Sun with radiating ray dots
        return (
          <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        )
      case 'calendar':
        return (
          <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="4" />
            <path d="M16 2v4" />
            <path d="M8 2v4" />
            <path d="M3 10h18" />
            <circle cx="8" cy="14" r="0.75" fill="currentColor" />
            <circle cx="12" cy="14" r="0.75" fill="currentColor" />
            <circle cx="16" cy="14" r="0.75" fill="currentColor" />
            <circle cx="8" cy="18" r="0.75" fill="currentColor" />
            <circle cx="12" cy="18" r="0.75" fill="currentColor" />
          </svg>
        )
      case 'lists':
        return (
          <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="9" x2="20" y1="6" y2="6" />
            <line x1="9" x2="20" y1="12" y2="12" />
            <line x1="9" x2="20" y1="18" y2="18" />
            <circle cx="4.5" cy="6" r="1.25" fill="currentColor" />
            <circle cx="4.5" cy="12" r="1.25" fill="currentColor" />
            <circle cx="4.5" cy="18" r="1.25" fill="currentColor" />
          </svg>
        )
      case 'pomodoro':
      case 'focus':
        // Concentric target ring focus symbol
        return (
          <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="4.5" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
          </svg>
        )
      case 'settings':
        return <Settings className={strokeClass} />
      case 'search':
        return <Search className={strokeClass} />
      case 'plus':
        return <Plus className={strokeClass} />
      case 'menu':
        return <Menu className={strokeClass} />
      case 'sparkles':
      case 'normal':
        return <Zap className={strokeClass} />
      case 'later':
        return <Moon className={strokeClass} />
      case 'check':
        return <Check className={`${cls} stroke-[2.8]`} />
      case 'play':
        return <Play className={`${cls} fill-current stroke-none`} />
      case 'pencil':
        return <Pencil className={strokeClass} />
      case 'trash':
        return <Trash2 className={strokeClass} />
      case 'clock':
        return <Clock className={strokeClass} />
      case 'bell':
        return <Bell className={strokeClass} />
      default:
        return <Sun className={strokeClass} />
    }
  }

  const sz = sizeClasses[size]

  return (
    <div
      className={`relative ${sz.box} ${sz.radius} flex items-center justify-center select-none transition-all duration-200 backdrop-blur-2xl ${className} ${
        isActive
          ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]'
          : 'text-white/60 group-hover:text-white'
      }`}
    >
      <div className="relative z-10 flex items-center justify-center">
        {renderIconGlyph(type, sz.icon)}
      </div>
    </div>
  )
}
