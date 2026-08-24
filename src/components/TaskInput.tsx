import React, { useState, useRef, useEffect } from 'react'
import {
  Flame,
  Zap,
  Moon,
  Folder,
  ChevronDown,
  ArrowRight,
  Clock,
  Bell,
} from 'lucide-react'
import { TaskPriority, CustomList } from '../types'
import { sounds } from '../services/audio'

interface TaskInputProps {
  onAddTask: (
    title: string,
    options?: {
      priority?: TaskPriority
      listId?: string
      dueDate?: string
      dueTime?: string
      reminderAt?: string
      estimatedMinutes?: number
      tags?: string[]
      description?: string
    }
  ) => void
  lists: CustomList[]
  defaultListId?: string
  playSounds?: boolean
  inputRef?: React.RefObject<HTMLInputElement | null>
}

export const TaskInput: React.FC<TaskInputProps> = ({
  onAddTask,
  lists,
  defaultListId = 'today',
  playSounds = true,
  inputRef: externalInputRef,
}) => {
  const localInputRef = useRef<HTMLInputElement>(null)
  const activeInputRef = externalInputRef || localInputRef

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('normal')
  const [listId, setListId] = useState(defaultListId)
  const [dueDate, setDueDate] = useState<string>(() => new Date().toISOString().split('T')[0])
  const [dueTime, setDueTime] = useState<string>('')
  const [reminderAt, setReminderAt] = useState<string>('')
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | undefined>(undefined)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activePopover, setActivePopover] = useState<'priority' | 'list' | 'date' | 'reminder' | null>(null)

  useEffect(() => {
    setListId(defaultListId)
  }, [defaultListId])

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!title.trim()) return

    onAddTask(title, {
      priority,
      listId,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      reminderAt: reminderAt || undefined,
      estimatedMinutes: estimatedMinutes || undefined,
      description: description.trim() || undefined,
    })

    // Reset fields
    setTitle('')
    setDescription('')
    setDueTime('')
    setReminderAt('')
    setEstimatedMinutes(undefined)
    setIsExpanded(false)
    setActivePopover(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      setIsExpanded(false)
      setActivePopover(null)
      activeInputRef.current?.blur()
    }
  }

  const priorityMeta: Record<TaskPriority, { icon: React.ReactNode; label: string; bg: string }> = {
    focus: { icon: <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />, label: 'Focus', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    normal: { icon: <Zap className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />, label: 'Standard', bg: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
    later: { icon: <Moon className="w-3.5 h-3.5 text-slate-400" />, label: 'Later', bg: 'bg-white/10 text-slate-300 border-white/15' },
  }

  const currentList = lists.find(l => l.id === listId) || { id: 'today', title: 'Today', color: '#38bdf8' }

  return (
    <div className="flex flex-col gap-2 p-2.5 rounded-2xl liquid-glass-card shadow-lg focus-within:ring-2 focus-within:ring-white/40 overflow-hidden">
      {/* Primary Input Row */}
      <div className="flex items-center gap-2">
        {/* Priority cycle button */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick(playSounds)
            setPriority(prev => (prev === 'normal' ? 'focus' : prev === 'focus' ? 'later' : 'normal'))
          }}
          title={`Priority: ${priorityMeta[priority].label} (Click to cycle)`}
          aria-label={`Cycle priority, current: ${priorityMeta[priority].label}`}
          className={`w-7 h-7 rounded-lg border flex items-center justify-center cursor-pointer shrink-0 transition-transform active:scale-95 backdrop-blur-md ${priorityMeta[priority].bg}`}
        >
          {priorityMeta[priority].icon}
        </button>

        <input
          ref={activeInputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          onKeyDown={handleKeyDown}
          placeholder="Capture task... (e.g. !focus #work Submit report)"
          className="flex-1 bg-transparent text-xs font-bold text-white placeholder:text-white/40 focus:outline-none min-w-0"
        />

        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={!title.trim()}
          title="Add task (Enter)"
          aria-label="Add task"
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            title.trim()
              ? 'bg-white/25 hover:bg-white/35 text-white font-bold shadow-md border border-white/30 active:scale-95'
              : 'text-white/30 bg-white/[0.04] opacity-40 cursor-not-allowed'
          }`}
        >
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* Expanded Quick Tag & Metadata Strip */}
      {isExpanded && (
        <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.08] animate-in fade-in duration-150">
          {/* Notes description input */}
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add optional details..."
            className="text-[11px] font-medium bg-white/[0.06] px-2.5 py-1.5 rounded-lg text-white placeholder:text-white/40 focus:outline-none border border-white/10"
          />

          {/* Quick Option Pills */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            {/* List Picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActivePopover(prev => (prev === 'list' ? null : 'list'))}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.08] border border-white/15 text-white/80 hover:text-white font-semibold cursor-pointer text-[10.5px]"
              >
                <Folder className="w-3 h-3 text-white/70" />
                <span className="max-w-[70px] truncate">{currentList.title}</span>
                <ChevronDown className="w-2.5 h-2.5 opacity-60" />
              </button>

              {activePopover === 'list' && (
                <div className="absolute left-0 top-full mt-1.5 w-44 liquid-glass-card rounded-xl shadow-2xl z-50 p-1.5 flex flex-col gap-1 max-h-44 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setListId('today')
                      setActivePopover(null)
                    }}
                    className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-semibold w-full text-left transition-colors cursor-pointer ${
                      listId === 'today' ? 'bg-white/20 text-white font-bold' : 'hover:bg-white/10 text-white/80'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    Today
                  </button>
                  {lists.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => {
                        setListId(l.id)
                        setActivePopover(null)
                      }}
                      className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-semibold w-full text-left transition-colors cursor-pointer ${
                        listId === l.id ? 'bg-white/20 text-white font-bold' : 'hover:bg-white/10 text-white/80'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                      <span className="truncate">{l.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Due Date Picker */}
            <div className="relative flex items-center">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-[10.5px] bg-white/[0.08] border border-white/15 rounded-lg px-2 py-1 text-white/80 font-medium focus:outline-none cursor-pointer"
                title="Due Date"
              />
            </div>

            {/* Reminder Picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActivePopover(prev => (prev === 'reminder' ? null : 'reminder'))}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10.5px] font-semibold transition-all cursor-pointer ${
                  reminderAt
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-white/[0.08] border-white/15 text-white/80 hover:text-white'
                }`}
              >
                <Bell className="w-3 h-3" />
                <span>{reminderAt ? new Date(reminderAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Reminder'}</span>
              </button>

              {activePopover === 'reminder' && (
                <div className="absolute left-0 top-full mt-1.5 w-48 liquid-glass-card rounded-xl shadow-2xl z-50 p-2 flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-white mb-0.5">Set Reminder:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setReminderAt(new Date(Date.now() + 15 * 60 * 1000).toISOString())
                      setActivePopover(null)
                    }}
                    className="px-2 py-1 text-[11px] font-medium rounded-lg hover:bg-white/10 text-left text-white cursor-pointer"
                  >
                    In 15 minutes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReminderAt(new Date(Date.now() + 60 * 60 * 1000).toISOString())
                      setActivePopover(null)
                    }}
                    className="px-2 py-1 text-[11px] font-medium rounded-lg hover:bg-white/10 text-left text-white cursor-pointer"
                  >
                    In 1 hour
                  </button>
                  {reminderAt && (
                    <button
                      type="button"
                      onClick={() => {
                        setReminderAt('')
                        setActivePopover(null)
                      }}
                      className="px-2 py-1 text-[11px] font-bold rounded-lg text-rose-400 hover:bg-rose-500/20 text-left mt-0.5 border-t border-white/10 cursor-pointer"
                    >
                      Clear Reminder
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Estimated Minutes */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.08] border border-white/15 text-white/80">
              <Clock className="w-3 h-3 text-white/50" />
              <input
                type="number"
                min="5"
                max="480"
                step="5"
                placeholder="est"
                value={estimatedMinutes || ''}
                onChange={(e) => setEstimatedMinutes(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                className="w-8 bg-transparent text-[10.5px] text-white font-bold focus:outline-none font-mono"
              />
              <span className="text-[10px] font-medium text-white/50">m</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
