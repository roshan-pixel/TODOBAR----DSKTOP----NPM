import React, { useState, useRef, useCallback } from 'react'
import {
  Check,
  Trash2,
  ListTodo,
  Palette,
  Headphones,
  Users,
  Paperclip,
} from 'lucide-react'
import { TodayTask } from '../types'
import { sounds } from '../services/audio'

interface SwipeableTaskItemProps {
  task: TodayTask
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  isDesignSystemTask: (task: TodayTask) => boolean
  isCompleted?: boolean
}

const SWIPE_THRESHOLD = 90 // px to trigger delete
const MAX_SWIPE = 300 // px max swipe limit

export const SwipeableTaskItem: React.FC<SwipeableTaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  isDesignSystemTask,
  isCompleted = false,
}) => {
  const [offsetX, setOffsetX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const currentXRef = useRef(0)
  const isHorizontalDragRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Trigger smooth delete animation and callback
  const triggerDelete = useCallback(() => {
    setIsDeleting(true)
    setOffsetX(MAX_SWIPE)
    sounds.playDelete(true)

    // Allow slide-out and height collapse animation to complete
    setTimeout(() => {
      onDelete(task.id)
    }, 280)
  }, [onDelete, task.id])

  // Pointer event handlers (works for both touch & mouse)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDeleting) return
    // Ignore clicks on buttons/interactive elements directly
    const target = e.target as HTMLElement
    if (target.closest('button') && !target.closest('.drag-handle')) {
      return
    }

    startXRef.current = e.clientX
    startYRef.current = e.clientY
    currentXRef.current = e.clientX
    isHorizontalDragRef.current = false
    setIsDragging(true)

    // Capture pointer
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {}
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isDeleting) return

    const deltaX = e.clientX - startXRef.current
    const deltaY = e.clientY - startYRef.current

    // Detect if this is horizontal swipe vs vertical scroll
    if (!isHorizontalDragRef.current) {
      if (Math.abs(deltaY) > 8 && Math.abs(deltaY) > Math.abs(deltaX)) {
        // Vertical scroll - release drag
        setIsDragging(false)
        setOffsetX(0)
        return
      }
      if (Math.abs(deltaX) > 6) {
        isHorizontalDragRef.current = true
      }
    }

    if (isHorizontalDragRef.current) {
      // Prevent browser default scroll during horizontal swipe
      e.preventDefault?.()

      // Only allow swipe to the right (positive X)
      if (deltaX > 0) {
        // Soft resistance as it goes past threshold
        const damp = deltaX > SWIPE_THRESHOLD ? SWIPE_THRESHOLD + (deltaX - SWIPE_THRESHOLD) * 0.6 : deltaX
        setOffsetX(Math.min(MAX_SWIPE, Math.max(0, damp)))
      } else {
        // Slight resistance when dragging left
        setOffsetX(Math.max(-20, deltaX * 0.2))
      }
      currentXRef.current = e.clientX
    }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    setIsDragging(false)
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}

    const deltaX = currentXRef.current - startXRef.current

    if (deltaX >= SWIPE_THRESHOLD) {
      // Swiped past threshold -> trigger delete!
      triggerDelete()
    } else {
      // Snap back with spring animation
      setOffsetX(0)
    }
    isHorizontalDragRef.current = false
  }

  const isArmed = offsetX >= SWIPE_THRESHOLD
  const progress = Math.min(1, Math.max(0, offsetX / SWIPE_THRESHOLD))

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden transition-all duration-300 ease-out select-none ${
        isDeleting ? 'max-h-0 opacity-0 mb-0 pointer-events-none scale-95' : 'max-h-[300px] opacity-100'
      }`}
      style={{
        transitionProperty: 'max-height, opacity, margin, transform',
        transitionDuration: isDeleting ? '280ms' : '200ms',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Red Background Action (Revealed as card slides right) */}
      <div
        className="absolute inset-0 rounded-[22px] flex items-center justify-start px-5 bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 border border-red-500/40 shadow-[inset_0_0_24px_rgba(220,38,38,0.5)] transition-opacity"
        style={{
          opacity: offsetX > 5 ? Math.min(1, progress + 0.15) : 0,
        }}
      >
        <div
          className="flex items-center gap-2 text-white font-mono font-bold tracking-wide transition-transform duration-150"
          style={{
            transform: `scale(${isArmed ? 1.15 : 0.85 + progress * 0.25}) translateX(${Math.min(20, offsetX * 0.1)}px)`,
          }}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isArmed
                ? 'bg-white text-red-600 shadow-[0_0_16px_rgba(255,255,255,0.7)] rotate-[-8deg]'
                : 'bg-white/20 text-white'
            }`}
          >
            <Trash2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xs uppercase">
            {isArmed ? 'Release to Delete' : 'Slide to Delete'}
          </span>
        </div>
      </div>

      {/* Foreground Task Card */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          touchAction: 'pan-y',
        }}
        className={`w-full relative z-10 shrink-0 rounded-[22px] transition-colors duration-200 cursor-grab active:cursor-grabbing ${
          isCompleted
            ? 'p-3.5 sm:p-4 bg-gradient-to-b from-white/[0.04] to-white/[0.015] border border-white/[0.08] backdrop-blur-2xl hover:bg-white/[0.045] hover:border-white/15 shadow-[0_4px_16px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)]'
            : 'p-4 bg-white/[0.08] border border-white/18 hover:border-white/30 hover:bg-white/[0.11] shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.2)]'
        }`}
      >
        <div className="flex items-start gap-3.5">
          {/* Checkbox Squircle */}
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              onToggle(task.id)
            }}
            className={`transition-all mt-0.5 shrink-0 flex items-center justify-center active:scale-90 ${
              isCompleted
                ? 'w-5 h-5 rounded-[7px] bg-emerald-400/20 border border-emerald-400/45 text-emerald-300 hover:bg-emerald-400/30 shadow-[0_0_10px_rgba(52,211,153,0.25)]'
                : 'w-6 h-6 rounded-xl border-2 border-white/25 hover:border-[#00F0FF] bg-white/5 hover:bg-[#00F0FF]/10'
            }`}
            aria-label={`Mark ${task.title} as ${task.done ? 'uncompleted' : 'completed'}`}
          >
            {task.done && (
              <Check className={isCompleted ? 'w-3.5 h-3.5 stroke-[3]' : 'w-4 h-4 stroke-[3.2] text-[#00F0FF]'} />
            )}
          </button>

          {/* Main Card Content */}
          <div className="flex-1 min-w-0">
            {/* Header: Priority Badge & Time + Quick Delete button */}
            <div className="flex items-center justify-between text-xs mb-1.5">
              {!isCompleted ? (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                    task.tagColor || 'bg-rose-500/20 text-rose-300 border-rose-500/35'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${task.dotColor || 'bg-rose-400'}`} />
                  {task.priorityTag || 'Priority'}
                </span>
              ) : (
                <span className="font-mono text-neutral-300 text-[11px]">
                  {task.completedAt || task.time}
                </span>
              )}

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-neutral-200">
                  {task.time}
                </span>

                {/* Explicit Trash Button (Always accessible via click/hover) */}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    triggerDelete()
                  }}
                  className={`p-1 -mr-1 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/15 active:scale-90 transition-all ${
                    isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-0'
                  }`}
                  aria-label="Delete task"
                  title="Delete task (or slide right)"
                >
                  <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                </button>
              </div>
            </div>

            {/* Title */}
            <h3
              className={`leading-snug transition-all ${
                isCompleted
                  ? 'text-[13px] text-neutral-400/85 line-through decoration-neutral-500/50 font-normal'
                  : 'text-[15px] font-bold text-white'
              }`}
            >
              {task.title}
            </h3>

            {/* Subtasks Progress Bar if available */}
            {!isCompleted && task.subtaskProgress && (
              <div className="mt-2.5 flex items-center gap-2.5">
                <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 shrink-0">
                  <ListTodo className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{task.subtasksCount}</span>
                </div>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00F0FF] to-emerald-400 rounded-full shadow-[0_0_8px_#00F0FF]"
                    style={{ width: `${task.subtaskProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Footer Project & Meta */}
            <div className="mt-3 flex items-center justify-between text-xs text-neutral-400 pt-1 border-t border-white/[0.06]">
              <div className="flex items-center gap-1.5 font-medium text-neutral-300 text-xs">
                {isDesignSystemTask(task) && <Palette className="w-3.5 h-3.5 text-neutral-400" />}
                {!isDesignSystemTask(task) && task.title.toLowerCase().includes('audio') && (
                  <Headphones className="w-3.5 h-3.5 text-neutral-400" />
                )}
                {!isDesignSystemTask(task) && !task.title.toLowerCase().includes('audio') && (
                  <Users className="w-3.5 h-3.5 text-neutral-400" />
                )}
                <span className="truncate">{task.category}</span>
              </div>

              {task.avatars && (
                <div className="flex -space-x-1.5 shrink-0">
                  {task.avatars.map((av, idx) => (
                    <span
                      key={idx}
                      className={`w-5 h-5 rounded-full border border-[#0c0d18] text-[9px] flex items-center justify-center shadow-md ${av.bg}`}
                    >
                      {av.initials}
                    </span>
                  ))}
                </div>
              )}

              {task.attachments && (
                <span className="flex items-center gap-1 text-[11px] font-mono bg-white/10 px-2.5 py-0.5 rounded-full text-neutral-200 border border-white/10">
                  <Paperclip className="w-3 h-3" /> {task.attachments}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
