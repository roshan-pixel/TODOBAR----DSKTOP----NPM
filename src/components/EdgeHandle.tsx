import React, { useRef, useState } from 'react'
import { GripVertical, GripHorizontal } from 'lucide-react'
import { DockEdge } from '../types'
import { sounds } from '../services/audio'

interface EdgeHandleProps {
  dockEdge: DockEdge
  handlePosition: number // percentage 0-100
  handleHeight: number
  isExpanded: boolean
  onToggle: () => void
  onUpdatePosition: (newPos: number) => void
  playSounds: boolean
  openTasksCount: number
}

export const EdgeHandle: React.FC<EdgeHandleProps> = ({
  dockEdge,
  handlePosition,
  handleHeight,
  isExpanded,
  onToggle,
  onUpdatePosition,
  playSounds,
  openTasksCount,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ startY: number; startX: number; startPos: number }>({
    startY: 0,
    startX: 0,
    startPos: handlePosition,
  })
  const hasMovedRef = useRef(false)

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    setIsDragging(true)
    hasMovedRef.current = false
    dragStartRef.current = {
      startY: e.clientY,
      startX: e.clientX,
      startPos: handlePosition,
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    e.preventDefault()

    const isVerticalEdge = dockEdge === 'right' || dockEdge === 'left'
    const delta = isVerticalEdge
      ? e.clientY - dragStartRef.current.startY
      : e.clientX - dragStartRef.current.startX

    const parentSize = isVerticalEdge ? window.innerHeight : window.innerWidth
    const deltaPercent = (delta / parentSize) * 100

    if (Math.abs(delta) > 4) {
      hasMovedRef.current = true
    }

    const nextPos = Math.min(Math.max(dragStartRef.current.startPos + deltaPercent, 5), 95)
    onUpdatePosition(nextPos)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    setIsDragging(false)
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {}

    if (!hasMovedRef.current) {
      sounds.playClick(playSounds)
      onToggle()
    }
  }

  const isVertical = dockEdge === 'right' || dockEdge === 'left' || dockEdge === 'floating'

  const getHandleStyle = (): React.CSSProperties => {
    const springTransition = isDragging ? 'none' : 'all 360ms cubic-bezier(0.16, 1, 0.3, 1)'

    if (dockEdge === 'right') {
      return {
        top: `${handlePosition}%`,
        right: isExpanded ? 'var(--panel-width)' : '0px',
        transform: 'translateY(-50%)',
        height: `${handleHeight}px`,
        width: '30px',
        borderTopLeftRadius: '14px',
        borderBottomLeftRadius: '14px',
        transition: springTransition,
      }
    }
    if (dockEdge === 'left') {
      return {
        top: `${handlePosition}%`,
        left: isExpanded ? 'var(--panel-width)' : '0px',
        transform: 'translateY(-50%)',
        height: `${handleHeight}px`,
        width: '30px',
        borderTopRightRadius: '14px',
        borderBottomRightRadius: '14px',
        transition: springTransition,
      }
    }
    if (dockEdge === 'top') {
      return {
        left: `${handlePosition}%`,
        top: isExpanded ? 'var(--panel-width)' : '0px',
        transform: 'translateX(-50%)',
        width: `${handleHeight * 1.4}px`,
        height: '30px',
        borderBottomLeftRadius: '14px',
        borderBottomRightRadius: '14px',
        transition: springTransition,
      }
    }
    return {
      top: `${handlePosition}%`,
      right: '20px',
      transform: 'translateY(-50%)',
      height: `${handleHeight}px`,
      width: '30px',
      borderRadius: '14px',
      transition: springTransition,
    }
  }

  return (
    <div
      style={getHandleStyle()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`fixed z-50 flex items-center justify-center cursor-grab active:cursor-grabbing select-none liquid-glass-handle group ${
        isDragging ? 'scale-105 ring-2 ring-white/60' : 'hover:scale-105'
      }`}
      title={isExpanded ? 'Drag to reposition / Click to close' : 'Drag to reposition / Click to open (Alt+T)'}
    >
      {/* Specular Liquid Ambient Line */}
      <div
        className={`absolute bg-white/40 group-hover:bg-white/80 rounded-full transition-all duration-300 shadow-sm ${
          isVertical
            ? 'w-[3.5px] h-8 group-hover:h-12'
            : 'h-[3.5px] w-8 group-hover:w-12'
        }`}
      />

      {/* Grip Icon & Badge */}
      <div className="relative z-10 flex flex-col items-center gap-1 text-white/70 group-hover:text-white transition-colors">
        {isVertical ? (
          <>
            <GripVertical className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
            {openTasksCount > 0 && !isExpanded && (
              <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-emerald-500 text-white leading-tight shadow-md border border-white/30">
                {openTasksCount}
              </span>
            )}
          </>
        ) : (
          <GripHorizontal className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </div>
  )
}
