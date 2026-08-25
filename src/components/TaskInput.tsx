import React, { useState, useRef, useEffect } from 'react'
import {
  Zap,
  ChevronRight,
  Flame,
  Moon,
  Folder,
  Calendar,
  Clock,
  Bell,
  X,
  Plus,
  Check,
  Sparkles,
  AlarmClock,
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
  const modalInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('normal')
  const [listId, setListId] = useState(defaultListId)
  const [dueDate, setDueDate] = useState<string>(() => new Date().toISOString().split('T')[0])
  const [dueTime, setDueTime] = useState<string>('')
  const [reminderAt, setReminderAt] = useState<string>('')
  const [reminderOption, setReminderOption] = useState<'none' | 'at_time' | '15m' | '30m' | '1h' | '1d'>('none')
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | undefined>(undefined)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showClockWidget, setShowClockWidget] = useState(false)
  const [showReminderPicker, setShowReminderPicker] = useState(false)

  useEffect(() => {
    setListId(defaultListId)
  }, [defaultListId])

  // Focus modal input whenever popup opens
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        modalInputRef.current?.focus()
      }, 80)
    }
  }, [isModalOpen])

  // Calculate reminderAt when dueDate, dueTime, or reminderOption changes
  useEffect(() => {
    if (reminderOption === 'none') {
      setReminderAt('')
      return
    }

    const dateStr = dueDate || new Date().toISOString().split('T')[0]
    const timeStr = dueTime || '09:00'
    const targetDate = new Date(`${dateStr}T${timeStr}:00`)

    if (isNaN(targetDate.getTime())) return

    let offsetMs = 0
    if (reminderOption === '15m') offsetMs = 15 * 60 * 1000
    else if (reminderOption === '30m') offsetMs = 30 * 60 * 1000
    else if (reminderOption === '1h') offsetMs = 60 * 60 * 1000
    else if (reminderOption === '1d') offsetMs = 24 * 60 * 60 * 1000

    const reminderDate = new Date(targetDate.getTime() - offsetMs)
    setReminderAt(reminderDate.toISOString())
  }, [dueDate, dueTime, reminderOption])

  const openModal = () => {
    sounds.playClick(playSounds)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setShowClockWidget(false)
    setShowReminderPicker(false)
  }

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

    // Reset state
    setTitle('')
    setDescription('')
    setDueTime('')
    setReminderAt('')
    setReminderOption('none')
    setEstimatedMinutes(undefined)
    closeModal()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      closeModal()
    }
  }

  // Quick Date Helpers
  const setDateToday = () => {
    sounds.playClick(playSounds)
    setDueDate(new Date().toISOString().split('T')[0])
  }

  const setDateTomorrow = () => {
    sounds.playClick(playSounds)
    const tom = new Date()
    tom.setDate(tom.getDate() + 1)
    setDueDate(tom.toISOString().split('T')[0])
  }

  const setDateNextWeek = () => {
    sounds.playClick(playSounds)
    const next = new Date()
    next.setDate(next.getDate() + 7)
    setDueDate(next.toISOString().split('T')[0])
  }

  // Quick Clock / Time slots
  const quickTimes = [
    { label: 'Morning', time: '09:00', icon: '🌅' },
    { label: 'Noon', time: '12:00', icon: '☀️' },
    { label: 'Afternoon', time: '15:00', icon: '☕' },
    { label: 'Evening', time: '18:00', icon: '🌆' },
    { label: 'Night', time: '21:00', icon: '🌙' },
  ]

  const priorityMeta: Record<TaskPriority, { icon: React.ReactNode; label: string; activeClass: string; ringColor: string }> = {
    focus: {
      icon: <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />,
      label: 'Focus (High)',
      activeClass: 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.35)]',
      ringColor: '#f59e0b',
    },
    normal: {
      icon: <Zap className="w-4 h-4 text-sky-400 fill-sky-400" />,
      label: 'Standard',
      activeClass: 'bg-sky-500/25 border-sky-400 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.3)]',
      ringColor: '#38bdf8',
    },
    later: {
      icon: <Moon className="w-4 h-4 text-slate-300" />,
      label: 'Later (Low)',
      activeClass: 'bg-white/20 border-white/40 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]',
      ringColor: '#94a3b8',
    },
  }

  const currentList = lists.find(l => l.id === listId) || { id: 'today', title: 'Today', color: '#38bdf8' }

  return (
    <>
      {/* ── 1. Compact Floating Trigger Bar in the Main View ── */}
      <div
        onClick={openModal}
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl liquid-glass-card hover:bg-white/[0.12] hover:border-white/25 transition-all cursor-pointer select-none group shadow-lg"
      >
        {/* Priority Indicator Orb */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${
            priority === 'focus'
              ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
              : priority === 'later'
              ? 'bg-white/10 border-white/20 text-slate-300'
              : 'bg-sky-500/20 border-sky-400/40 text-sky-300'
          }`}
        >
          {priorityMeta[priority].icon}
        </div>

        {/* Placeholder text that invites clicking for full popup modal */}
        <div className="flex-1 flex items-center justify-between min-w-0">
          <span className="text-xs font-medium text-white/50 group-hover:text-white/80 transition-colors">
            Capture task... (Tap to open full editor)
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/[0.08] text-white/60 border border-white/10">
              New
            </span>
            <div className="w-7 h-7 rounded-full liquid-glass-orb flex items-center justify-center text-white/80 group-hover:text-white group-hover:bg-white/20 transition-all">
              <Plus className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Full Liquid Glass Modal Popup (Spacious & Rich) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
          {/* Backdrop Blur */}
          <div
            className="absolute inset-0 bg-black/65 backdrop-blur-md transition-opacity"
            onClick={closeModal}
          />

          {/* Modal Container */}
          <div
            className="relative w-full max-w-[480px] rounded-[28px] p-5 flex flex-col gap-4 z-10 shadow-2xl animate-in zoom-in-95 duration-200"
            style={{
              background: 'rgba(18, 12, 42, 0.88)',
              backdropFilter: 'blur(48px) saturate(200%)',
              WebkitBackdropFilter: 'blur(48px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              boxShadow: [
                'inset 0 1.5px 0 rgba(255, 255, 255, 0.45)',
                'inset 0 -1px 0 rgba(0, 0, 0, 0.30)',
                '0 32px 80px rgba(0, 0, 0, 0.85)',
              ].join(', '),
            }}
            onKeyDown={handleKeyDown}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full liquid-glass-orb flex items-center justify-center text-sky-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Capture Objective
                </h3>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="w-8 h-8 rounded-full liquid-glass-orb flex items-center justify-center text-white/60 hover:text-white cursor-pointer active:scale-90 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Task Title Input (Large & Clear) */}
            <div className="flex flex-col gap-1.5">
              <input
                ref={modalInputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be accomplished?"
                className="w-full text-base font-semibold text-white placeholder:text-white/35 bg-white/[0.06] border border-white/15 focus:border-sky-400/80 focus:bg-white/[0.10] rounded-2xl px-4 py-3 outline-none transition-all"
              />
            </div>

            {/* Task Description Textarea (Optional Details) */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add optional notes, checklist items, or details..."
              rows={2}
              className="w-full text-xs font-normal text-white placeholder:text-white/35 bg-white/[0.04] border border-white/10 focus:border-white/25 rounded-xl px-3.5 py-2.5 outline-none resize-none transition-all scrollbar-thin"
            />

            {/* Priority Selector (Segmented Liquid Buttons) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">
                Priority Tier
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['focus', 'normal', 'later'] as TaskPriority[]).map((p) => {
                  const meta = priorityMeta[p]
                  const isSelected = priority === p
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        sounds.playClick(playSounds)
                        setPriority(p)
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all active:scale-95 ${
                        isSelected
                          ? meta.activeClass
                          : 'bg-white/[0.05] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.09]'
                      }`}
                    >
                      {meta.icon}
                      <span>{meta.label.split(' ')[0]}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* List Selection Chips */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">
                Target Collection
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick(playSounds)
                    setListId('today')
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border transition-all ${
                    listId === 'today'
                      ? 'bg-sky-500/25 border-sky-400 text-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                      : 'bg-white/[0.05] border-white/10 text-white/60 hover:text-white'
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
                      sounds.playClick(playSounds)
                      setListId(l.id)
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border transition-all ${
                      listId === l.id
                        ? 'bg-white/20 border-white/40 text-white shadow-md'
                        : 'bg-white/[0.05] border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className="truncate max-w-[110px]">{l.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date & Clock Widget Section */}
            <div className="flex flex-col gap-2 pt-1">
              <label className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">
                Schedule & Time
              </label>

              {/* Quick Date Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={setDateToday}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/[0.07] border border-white/15 text-white/80 hover:text-white cursor-pointer active:scale-95 transition-all"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={setDateTomorrow}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/[0.07] border border-white/15 text-white/80 hover:text-white cursor-pointer active:scale-95 transition-all"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={setDateNextWeek}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/[0.07] border border-white/15 text-white/80 hover:text-white cursor-pointer active:scale-95 transition-all"
                >
                  Next Week
                </button>

                {/* Native Date Picker input */}
                <div className="flex items-center gap-1 bg-white/[0.07] border border-white/15 rounded-full px-2.5 py-1 text-white/80">
                  <Calendar className="w-3 h-3 text-white/50" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="bg-transparent text-[11px] text-white font-medium focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Interactive Clock Widget Button & Widget Dropdown */}
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick(playSounds)
                    setShowClockWidget((prev) => !prev)
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all ${
                    dueTime
                      ? 'bg-indigo-500/25 border-indigo-400 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                      : 'bg-white/[0.07] border-white/15 text-white/80 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{dueTime ? `Time: ${dueTime}` : 'Select Time (Clock)'}</span>
                </button>

                {/* Reminder Notification Toggle Button */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick(playSounds)
                    setShowReminderPicker((prev) => !prev)
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all ${
                    reminderOption !== 'none'
                      ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                      : 'bg-white/[0.07] border-white/15 text-white/80 hover:text-white'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {reminderOption !== 'none'
                      ? `Reminder (${reminderOption})`
                      : 'Set Reminder'}
                  </span>
                </button>
              </div>

              {/* ── Clock Widget Popover ── */}
              {showClockWidget && (
                <div className="p-3.5 rounded-2xl bg-white/[0.08] border border-white/20 flex flex-col gap-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      Clock Widget
                    </span>
                    <input
                      type="time"
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      className="bg-white/10 border border-white/20 text-xs font-mono font-bold text-white rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                    />
                  </div>

                  {/* Quick Time Presets */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {quickTimes.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => {
                          sounds.playClick(playSounds)
                          setDueTime(slot.time)
                        }}
                        className={`flex flex-col items-center justify-center p-1.5 rounded-xl border text-[10px] font-semibold cursor-pointer transition-all ${
                          dueTime === slot.time
                            ? 'bg-sky-500/30 border-sky-400 text-white shadow-sm'
                            : 'bg-white/[0.05] border-white/10 text-white/70 hover:text-white hover:bg-white/[0.10]'
                        }`}
                      >
                        <span className="text-xs">{slot.icon}</span>
                        <span>{slot.label}</span>
                        <span className="text-[9px] text-white/50 font-mono">{slot.time}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Reminder Notification Options ── */}
              {showReminderPicker && (
                <div className="p-3.5 rounded-2xl bg-white/[0.08] border border-white/20 flex flex-col gap-2 animate-in fade-in duration-150">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    Notification Alert
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {[
                      { id: 'none', label: 'Off' },
                      { id: 'at_time', label: 'At time of task' },
                      { id: '15m', label: '15 mins before' },
                      { id: '30m', label: '30 mins before' },
                      { id: '1h', label: '1 hour before' },
                      { id: '1d', label: '1 day before' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          sounds.playClick(playSounds)
                          setReminderOption(opt.id as any)
                        }}
                        className={`py-1.5 px-2 rounded-xl text-[10.5px] font-semibold border cursor-pointer transition-all ${
                          reminderOption === opt.id
                            ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                            : 'bg-white/[0.05] border-white/10 text-white/70 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10 mt-1">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-full text-xs font-semibold text-white/70 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 cursor-pointer transition-all active:scale-95"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!title.trim()}
                className={`px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer ${
                  title.trim()
                    ? 'bg-gradient-to-r from-sky-400 to-indigo-500 text-white border border-white/30 shadow-[0_0_18px_rgba(56,189,248,0.4)] active:scale-95 hover:brightness-110'
                    : 'bg-white/10 text-white/30 border border-white/10 cursor-not-allowed'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Objective</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
