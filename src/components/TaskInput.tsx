import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Zap,
  Flame,
  Moon,
  Calendar,
  Clock,
  Bell,
  X,
  Plus,
  Pencil,
  ChevronDown,
  MoreHorizontal,
  Send,
  Mic,
  MicOff,
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
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showClockPicker, setShowClockPicker] = useState(false)
  const [showReminderOptions, setShowReminderOptions] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    setListId(defaultListId)
  }, [defaultListId])

  // Focus modal input whenever popup opens
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        modalInputRef.current?.focus()
      }, 90)
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
    setShowDatePicker(false)
    setShowClockPicker(false)
    setShowReminderOptions(false)
    setShowMoreMenu(false)
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!title.trim()) return

    onAddTask(title.trim(), {
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

  // Voice dictation toggle
  const toggleSpeechRecognition = () => {
    sounds.playClick(playSounds)
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice dictation is supported in Chrome, Edge, and Safari.')
      return
    }

    if (isListening) {
      setIsListening(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => setIsListening(true)
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        if (transcript) {
          setTitle((prev) => (prev ? `${prev} ${transcript}` : transcript))
        }
        setIsListening(false)
      }
      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
      recognition.start()
    } catch (err) {
      setIsListening(false)
    }
  }

  // Quick Date Helpers
  const setDateToday = () => {
    sounds.playClick(playSounds)
    setDueDate(new Date().toISOString().split('T')[0])
    setShowDatePicker(false)
  }

  const setDateTomorrow = () => {
    sounds.playClick(playSounds)
    const tom = new Date()
    tom.setDate(tom.getDate() + 1)
    setDueDate(tom.toISOString().split('T')[0])
    setShowDatePicker(false)
  }

  const setDateNextWeek = () => {
    sounds.playClick(playSounds)
    const next = new Date()
    next.setDate(next.getDate() + 7)
    setDueDate(next.toISOString().split('T')[0])
    setShowDatePicker(false)
  }

  // Quick Times
  const quickTimes = [
    { label: 'Morning', time: '09:00', icon: '🌅' },
    { label: 'Noon', time: '12:00', icon: '☀️' },
    { label: 'Afternoon', time: '15:00', icon: '☕' },
    { label: 'Evening', time: '18:00', icon: '🌆' },
    { label: 'Night', time: '21:00', icon: '🌙' },
  ]

  // Date formatted label
  const getDateLabel = () => {
    const todayStr = new Date().toISOString().split('T')[0]
    const tomDate = new Date()
    tomDate.setDate(tomDate.getDate() + 1)
    const tomStr = tomDate.toISOString().split('T')[0]

    if (dueDate === todayStr) return 'Today'
    if (dueDate === tomStr) return 'Tomorrow'
    if (!dueDate) return 'Schedule date'

    try {
      const d = new Date(`${dueDate}T00:00:00`)
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return dueDate
    }
  }

  // Collection options (combine Today with user lists)
  const defaultCollections = [
    { id: 'today', title: 'Today', color: '#38bdf8' },
    { id: 'work', title: 'Work', color: '#818cf8' },
    { id: 'personal', title: 'Personal', color: '#34d399' },
    { id: 'ideas', title: 'Ideas', color: '#fbbf24' },
  ]

  const collectionList = lists.length > 0
    ? [{ id: 'today', title: 'Today', color: '#38bdf8' }, ...lists.map(l => ({ id: l.id, title: l.title, color: l.color }))]
    : defaultCollections

  return (
    <>
      {/* ── 1. Compact Floating Trigger Bar in the Main View ── */}
      <div
        onClick={openModal}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl liquid-glass-card hover:bg-white/[0.12] hover:border-white/25 transition-all cursor-pointer select-none group shadow-lg"
      >
        {/* Priority Indicator Orb */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-sky-500/20 border-sky-400/40 text-sky-300 transition-transform group-hover:scale-105 shadow-[0_0_10px_rgba(56,189,248,0.25)]">
          <Zap className="w-4 h-4 fill-sky-400 text-sky-300" />
        </div>

        {/* Placeholder text that invites clicking for full popup modal */}
        <div className="flex-1 flex items-center justify-between min-w-0">
          <span className="text-xs font-medium text-white/50 group-hover:text-white/80 transition-colors">
            Capture task... (Tap to open full editor)
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/[0.08] text-white/60 border border-white/10">
              New
            </span>
            <div className="w-7 h-7 rounded-full liquid-glass-orb flex items-center justify-center text-white/80 group-hover:text-white group-hover:bg-white/20 transition-all">
              <Plus className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Full Native Apple Liquid Glass Modal Popup (Reference unnamed.png) ── */}
      {typeof document !== 'undefined' && isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-3 pb-6 sm:p-4 select-none animate-in fade-in duration-200">
          {/* Backdrop Blur */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity"
            onClick={closeModal}
          />

          {/* Modal Container */}
          <div
            className="relative w-full sm:max-w-[460px] max-h-[88dvh] overflow-y-auto rounded-[32px] p-5 sm:p-6 flex flex-col gap-4 z-10 shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-250 scrollbar-none"
            style={{
              background: 'linear-gradient(180deg, rgba(22, 28, 62, 0.88) 0%, rgba(14, 18, 42, 0.92) 100%)',
              backdropFilter: 'blur(54px) saturate(200%)',
              WebkitBackdropFilter: 'blur(54px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              boxShadow: [
                'inset 0 1.5px 0 rgba(255, 255, 255, 0.5)',
                'inset 0 -1px 0 rgba(0, 0, 0, 0.35)',
                '0 32px 80px rgba(0, 0, 0, 0.85)',
                '0 0 50px rgba(99, 102, 241, 0.30)',
              ].join(', '),
            }}
            onKeyDown={handleKeyDown}
          >
            {/* Top Sheet Grab Handle (iOS native indicator) */}
            <div className="w-10 h-1 rounded-full bg-white/30 mx-auto -mt-1 -mb-1 shrink-0" />

            {/* 1. Header */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                {/* Luminous Glass Lightning Orb */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border"
                  style={{
                    background: 'radial-gradient(circle, rgba(56,189,248,0.4) 0%, rgba(99,102,241,0.25) 60%, rgba(255,255,255,0.06) 100%)',
                    borderColor: 'rgba(255, 255, 255, 0.35)',
                    boxShadow: '0 0 16px rgba(56, 189, 248, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                  }}
                >
                  <Zap className="w-6 h-6 text-sky-400 fill-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                </div>

                <div className="flex flex-col">
                  <h2 className="text-lg font-bold text-white tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                    Capture Objective
                  </h2>
                  <p className="text-xs text-white/60 font-normal mt-0.5">
                    Add what you want to accomplish
                  </p>
                </div>
              </div>

              {/* Close Circular Glass Button */}
              <button
                type="button"
                onClick={closeModal}
                className="w-9 h-9 rounded-full liquid-glass-orb flex items-center justify-center text-white/70 hover:text-white cursor-pointer active:scale-90 transition-all"
                title="Close"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>

            {/* 2. Main Objective Input */}
            <div className="relative rounded-[22px] bg-white/[0.06] border border-white/18 focus-within:border-sky-400/80 focus-within:ring-2 focus-within:ring-sky-400/25 px-4 py-3.5 flex items-center gap-3 transition-all backdrop-blur-xl shadow-inner">
              {/* Cyan Accent Indicator */}
              <div className="w-0.5 h-6 rounded-full bg-sky-400 shrink-0 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />

              <input
                ref={modalInputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be accomplished?"
                className="w-full bg-transparent text-sm font-semibold text-white placeholder:text-white/40 focus:outline-none tracking-tight"
              />

              {/* Voice / Mic Action Button */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                title={isListening ? 'Listening...' : 'Voice capture'}
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-500/30 border-rose-400 text-rose-300 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                    : 'bg-white/[0.08] hover:bg-white/[0.15] border-white/12 text-white/75'
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* 3. Secondary Notes Field */}
            <div className="relative rounded-[18px] bg-white/[0.04] border border-white/10 focus-within:border-white/25 px-4 py-2.5 flex items-center gap-2.5 transition-all">
              <Pencil className="w-3.5 h-3.5 text-white/40 shrink-0" />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes, checklist items, or details... (optional)"
                className="w-full bg-transparent text-xs text-white placeholder:text-white/35 focus:outline-none font-normal"
              />
            </div>

            {/* 4. Priority Section */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-white/70">Priority</span>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'focus' as const, label: 'Focus', icon: <Flame className="w-3.5 h-3.5 fill-current text-amber-400" /> },
                  { id: 'normal' as const, label: 'Standard', icon: <Zap className="w-3.5 h-3.5 fill-current text-sky-400" /> },
                  { id: 'later' as const, label: 'Later', icon: <Moon className="w-3.5 h-3.5 text-slate-300" /> },
                ].map((tier) => {
                  const isSelected = priority === tier.id
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => {
                        sounds.playClick(playSounds)
                        setPriority(tier.id)
                      }}
                      className={`py-2.5 px-3 rounded-[20px] border flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-gradient-to-r from-sky-500/40 via-indigo-600/40 to-purple-600/40 border-sky-400/80 text-white shadow-[0_0_20px_rgba(56,189,248,0.4),inset_0_1px_1px_rgba(255,255,255,0.45)] ring-1 ring-sky-300/30 font-bold'
                          : 'bg-white/[0.05] border-white/10 text-white/60 hover:text-white/90 hover:bg-white/[0.08]'
                      }`}
                    >
                      {tier.icon}
                      <span>{tier.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 5. Collection Section */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-white/70">Collection</span>
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
                {collectionList.map((col) => {
                  const isSelected = listId === col.id
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => {
                        sounds.playClick(playSounds)
                        setListId(col.id)
                      }}
                      className={`px-4 py-2 rounded-full border text-xs font-medium flex items-center gap-2 shrink-0 cursor-pointer transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-sky-500/25 border-sky-400/80 text-white shadow-[0_0_12px_rgba(56,189,248,0.35)] ring-1 ring-white/20 font-semibold'
                          : 'bg-white/[0.05] border-white/10 text-white/70 hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: col.color, boxShadow: `0 0 6px ${col.color}` }}
                      />
                      <span className="truncate max-w-[120px]">{col.title}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 6. Schedule Section */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-white/70">Schedule</span>

              {/* Date & Time Pickers Row */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Date Dropdown Pill */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick(playSounds)
                    setShowDatePicker((prev) => !prev)
                    setShowClockPicker(false)
                  }}
                  className="relative rounded-2xl bg-white/[0.05] border border-white/12 hover:bg-white/[0.09] hover:border-white/20 px-3.5 py-2.5 flex items-center justify-between text-xs text-white/85 cursor-pointer transition-all active:scale-98"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Calendar className="w-4 h-4 text-white/60 shrink-0" />
                    <span className="truncate">{getDateLabel()}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-white/40 shrink-0" />
                </button>

                {/* Time Dropdown Pill */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick(playSounds)
                    setShowClockPicker((prev) => !prev)
                    setShowDatePicker(false)
                  }}
                  className="relative rounded-2xl bg-white/[0.05] border border-white/12 hover:bg-white/[0.09] hover:border-white/20 px-3.5 py-2.5 flex items-center justify-between text-xs text-white/85 cursor-pointer transition-all active:scale-98"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Clock className="w-4 h-4 text-white/60 shrink-0" />
                    <span className="truncate">{dueTime ? dueTime : 'Set time'}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-white/40 shrink-0" />
                </button>
              </div>

              {/* Date Popover Menu */}
              {showDatePicker && (
                <div className="p-3 rounded-2xl bg-white/[0.08] border border-white/20 flex flex-col gap-2 animate-in fade-in duration-150 backdrop-blur-xl">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={setDateToday}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/15 text-white cursor-pointer active:scale-95"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={setDateTomorrow}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/15 text-white cursor-pointer active:scale-95"
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={setDateNextWeek}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/15 text-white cursor-pointer active:scale-95"
                    >
                      Next Week
                    </button>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-white/10">
                    <span className="text-[11px] text-white/60">Custom date:</span>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => {
                        setDueDate(e.target.value)
                        setShowDatePicker(false)
                      }}
                      className="bg-white/10 border border-white/20 text-xs font-mono font-semibold text-white rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Clock / Time Popover Menu */}
              {showClockPicker && (
                <div className="p-3 rounded-2xl bg-white/[0.08] border border-white/20 flex flex-col gap-2.5 animate-in fade-in duration-150 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      Select Time
                    </span>
                    <input
                      type="time"
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      className="bg-white/10 border border-white/20 text-xs font-mono font-bold text-white rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                    />
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {quickTimes.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => {
                          sounds.playClick(playSounds)
                          setDueTime(slot.time)
                          setShowClockPicker(false)
                        }}
                        className={`flex flex-col items-center justify-center p-1.5 rounded-xl border text-[10px] font-semibold cursor-pointer transition-all ${
                          dueTime === slot.time
                            ? 'bg-sky-500/30 border-sky-400 text-white shadow-sm'
                            : 'bg-white/[0.05] border-white/10 text-white/70 hover:text-white'
                        }`}
                      >
                        <span>{slot.icon}</span>
                        <span>{slot.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reminder Row with iOS Glass Toggle */}
              <div className="relative rounded-2xl bg-white/[0.05] border border-white/12 hover:bg-white/[0.08] px-3.5 py-2.5 flex items-center justify-between text-xs text-white/85 transition-all">
                <div
                  className="flex items-center gap-2 cursor-pointer flex-1"
                  onClick={() => {
                    sounds.playClick(playSounds)
                    if (reminderOption === 'none') {
                      setReminderOption('at_time')
                      setShowReminderOptions(true)
                    } else {
                      setShowReminderOptions((prev) => !prev)
                    }
                  }}
                >
                  <Bell className="w-4 h-4 text-white/60 shrink-0" />
                  <span>
                    {reminderOption !== 'none'
                      ? `Reminder (${reminderOption === 'at_time' ? 'At time' : reminderOption})`
                      : 'Set reminder'}
                  </span>
                </div>

                {/* iOS Glass Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick(playSounds)
                    if (reminderOption !== 'none') {
                      setReminderOption('none')
                      setShowReminderOptions(false)
                    } else {
                      setReminderOption('at_time')
                      setShowReminderOptions(true)
                    }
                  }}
                  aria-label="Toggle reminder"
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 border ${
                    reminderOption !== 'none'
                      ? 'bg-sky-500/80 border-sky-400/80 shadow-[0_0_10px_rgba(56,189,248,0.5)]'
                      : 'bg-white/15 border-white/20'
                  }`}
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform ${
                      reminderOption !== 'none' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Reminder Duration Presets Dropdown */}
              {showReminderOptions && reminderOption !== 'none' && (
                <div className="p-3 rounded-2xl bg-white/[0.08] border border-white/20 flex flex-col gap-2 animate-in fade-in duration-150 backdrop-blur-xl">
                  <span className="text-[11px] font-semibold text-white/70">Alert timing</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'at_time', label: 'At time' },
                      { id: '15m', label: '15m before' },
                      { id: '30m', label: '30m before' },
                      { id: '1h', label: '1h before' },
                      { id: '1d', label: '1d before' },
                      { id: 'none', label: 'Turn Off' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          sounds.playClick(playSounds)
                          setReminderOption(opt.id as any)
                          if (opt.id === 'none') setShowReminderOptions(false)
                        }}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border cursor-pointer transition-all ${
                          reminderOption === opt.id
                            ? 'bg-sky-500/30 border-sky-400 text-sky-200 shadow-sm'
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

            {/* 7. Bottom Action Bar */}
            <div className="flex items-center gap-3 pt-2 mt-0.5">
              {/* Options Orb Button (•••) */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick(playSounds)
                  setShowMoreMenu((prev) => !prev)
                }}
                className="w-12 h-12 rounded-full liquid-glass-orb flex items-center justify-center text-white/70 hover:text-white cursor-pointer active:scale-90 shrink-0"
                title="More Options"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {/* Primary "Add Objective" Liquid Glass Action Button */}
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!title.trim()}
                className={`flex-1 h-12 rounded-full flex items-center justify-center gap-2.5 font-bold text-sm text-white cursor-pointer transition-all active:scale-98 shadow-xl ${
                  title.trim()
                    ? 'border border-white/40 text-white shadow-[0_0_26px_rgba(56,189,248,0.45),inset_0_1px_1px_rgba(255,255,255,0.6)] hover:brightness-110'
                    : 'bg-white/10 text-white/30 border border-white/10 cursor-not-allowed'
                }`}
                style={
                  title.trim()
                    ? {
                        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.5) 0%, rgba(99, 102, 241, 0.5) 50%, rgba(168, 85, 247, 0.5) 100%)',
                        backdropFilter: 'blur(20px)',
                      }
                    : undefined
                }
              >
                <span>Add Objective</span>
                <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
                  <Send className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
              </button>
            </div>

            {/* Extra Options Dropdown (Duration estimate & Quick reset) */}
            {showMoreMenu && (
              <div className="p-3.5 rounded-2xl bg-white/[0.08] border border-white/20 flex flex-col gap-2.5 animate-in fade-in duration-150 backdrop-blur-xl">
                <span className="text-xs font-bold text-white">Estimated Focus Duration</span>
                <div className="flex items-center gap-2">
                  {[15, 25, 45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        sounds.playClick(playSounds)
                        setEstimatedMinutes(mins)
                        setShowMoreMenu(false)
                      }}
                      className={`flex-1 py-1.5 rounded-xl border text-xs font-mono font-semibold cursor-pointer transition-all ${
                        estimatedMinutes === mins
                          ? 'bg-sky-500/30 border-sky-400 text-white'
                          : 'bg-white/[0.05] border-white/10 text-white/70 hover:text-white'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="text-xs text-rose-300 hover:underline cursor-pointer"
                  >
                    Cancel & Discard
                  </button>
                  {estimatedMinutes && (
                    <button
                      type="button"
                      onClick={() => setEstimatedMinutes(undefined)}
                      className="text-xs text-white/60 hover:text-white cursor-pointer"
                    >
                      Clear estimate
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
