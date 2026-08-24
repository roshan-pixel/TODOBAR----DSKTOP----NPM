import React from 'react'
import {
  Sun,
  CalendarDays,
  ListTodo,
  Timer,
  Settings,
  Search,
  Sparkles,
  Flame,
  Zap,
  Moon,
  Check,
  Folder,
  Pin,
  Bell,
  Clock,
  Coffee,
  Plus,
  Share2,
  Bookmark,
  Info,
  ChevronLeft,
} from 'lucide-react'

export type LiquidIconType =
  | 'today'
  | 'calendar'
  | 'lists'
  | 'pomodoro'
  | 'settings'
  | 'search'
  | 'sparkles'
  | 'focus'
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

export type LiquidIconSize = 'xs' | 'sm' | 'md' | 'lg'

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
  customColor,
  className = '',
}) => {
  // Sizing definitions matching Apple HIG toolbar & control standards
  const sizeClasses: Record<LiquidIconSize, { box: string; icon: string; radius: string }> = {
    xs: { box: 'w-6 h-6', icon: 'w-3.5 h-3.5', radius: 'rounded-[8px]' },
    sm: { box: 'w-8 h-8', icon: 'w-4 h-4', radius: 'rounded-[10px]' },
    md: { box: 'w-9 h-9', icon: 'w-4.5 h-4.5', radius: 'rounded-[12px]' },
    lg: { box: 'w-11 h-11', icon: 'w-5.5 h-5.5', radius: 'rounded-[16px]' },
  }

  // Authentic Apple Liquid Glass Icon Definitions (Refined, frosted, subtle neutral specular)
  const renderIconGlyph = (iconType: LiquidIconType, cls: string) => {
    const strokeClass = `${cls} stroke-[2] transition-colors duration-150`

    switch (iconType) {
      case 'today':
        return <Sun className={`${strokeClass} text-white`} />
      case 'calendar':
        return <CalendarDays className={`${strokeClass} text-white`} />
      case 'lists':
        return <ListTodo className={`${strokeClass} text-white`} />
      case 'pomodoro':
        return <Timer className={`${strokeClass} text-white`} />
      case 'settings':
        return <Settings className={`${strokeClass} text-white`} />
      case 'search':
        return <Search className={`${strokeClass} text-white/90`} />
      case 'sparkles':
        return <Sparkles className={`${strokeClass} text-white fill-white/20`} />
      case 'focus':
        return <Flame className={`${strokeClass} text-amber-300 fill-amber-400/20`} />
      case 'normal':
        return <Zap className={`${strokeClass} text-sky-300 fill-sky-400/20`} />
      case 'later':
        return <Moon className={`${strokeClass} text-slate-300`} />
      case 'check':
        return <Check className={`${strokeClass} text-white stroke-[2.8]`} />
      case 'folder':
        return <Folder className={`${strokeClass}`} style={{ color: customColor || 'white' }} />
      case 'pin':
        return <Pin className={`${strokeClass} text-white`} />
      case 'bell':
        return <Bell className={`${strokeClass} text-amber-300`} />
      case 'clock':
        return <Clock className={`${strokeClass} text-white/80`} />
      case 'coffee':
        return <Coffee className={`${strokeClass} text-emerald-300`} />
      case 'share':
        return <Share2 className={`${strokeClass} text-white`} />
      case 'bookmark':
        return <Bookmark className={`${strokeClass} text-white`} />
      case 'info':
        return <Info className={`${strokeClass} text-white`} />
      case 'back':
        return <ChevronLeft className={`${strokeClass} text-white`} />
      default:
        return <Sun className={`${strokeClass} text-white`} />
    }
  }

  const sz = sizeClasses[size]

  return (
    <div
      className={`relative ${sz.box} ${sz.radius} flex items-center justify-center select-none transition-all duration-200 group/liquid-icon backdrop-blur-2xl ${className} ${
        isActive
          ? 'bg-white/20 border-white/35 shadow-lg scale-105'
          : 'bg-white/[0.08] hover:bg-white/[0.14] border-white/15 hover:border-white/25 shadow-sm'
      }`}
      style={{
        borderWidth: '1px',
        borderStyle: 'solid',
        boxShadow: isActive
          ? 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.4), inset 0 -0.5px 0.5px 0 rgba(0, 0, 0, 0.25), 0 4px 16px rgba(0, 0, 0, 0.25)'
          : 'inset 0 1px 0.5px 0 rgba(255, 255, 255, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* Authentic Apple Specular Top Glaze */}
      <div
        className={`absolute inset-x-0 top-0 h-[45%] ${sz.radius} pointer-events-none rounded-b-none`}
        style={{
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.04) 70%, transparent 100%)',
        }}
      />

      {/* Monochrome Crisp SF Symbol Glyph */}
      <div className="relative z-10 flex items-center justify-center">
        {renderIconGlyph(type, sz.icon)}
      </div>
    </div>
  )
}
