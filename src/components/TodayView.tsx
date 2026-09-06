import React, { useState } from 'react'
import {
  Search,
  Calendar,
  User,
  Target,
  Flame,
  Check,
  CheckCircle2,
  Paperclip,
  ArrowUpDown,
  ListTodo,
  Palette,
  Headphones,
  Users,
  ChevronDown,
} from 'lucide-react'
import { Task, TaskPriority } from '../types'

interface TodayViewProps {
  tasks: Task[]
  onToggleTask: (id: string) => void
  onStartFocus: () => void
  onOpenSearch: () => void
  onOpenCalendar: () => void
  onOpenAccount: () => void
}

export const TodayView: React.FC<TodayViewProps> = ({
  tasks,
  onToggleTask,
  onStartFocus,
  onOpenSearch,
  onOpenCalendar,
  onOpenAccount,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'work' | 'design'>('all')

  const defaultSampleTasks = [
    {
      id: 'task-1',
      title: 'Finalize Apple 2026 Liquid Glass spec & token exports',
      priority: 'focus' as TaskPriority,
      done: true,
      time: '11:30 AM',
      category: 'Figma Design System',
      subtasksCount: '3/4 subtasks',
      subtaskProgress: 75,
      avatars: [
        { initials: 'JD', bg: 'bg-[#3b49df] text-white' },
        { initials: 'AL', bg: 'bg-[#10b981] text-neutral-950 font-bold' },
      ],
      priorityTag: 'High Priority',
      dotColor: 'bg-rose-400',
      tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/35',
    },
    {
      id: 'task-2',
      title: 'Review spatial sound design for Todobar micro-haptics',
      priority: 'normal' as TaskPriority,
      done: false,
      time: '2:00 PM',
      category: 'Audio Labs • Haptics v2',
      attachments: '2 files',
      priorityTag: 'Medium',
      dotColor: 'bg-[#00F0FF]',
      tagColor: 'bg-cyan-500/20 text-[#00F0FF] border-cyan-500/35',
    },
    {
      id: 'task-3',
      title: 'Executive pitch deck for iOS Liquid Glass redesign',
      priority: 'focus' as TaskPriority,
      done: false,
      time: '4:15 PM',
      category: 'With Tim & Alan • Keynote v4',
      priorityTag: 'High Priority',
      dotColor: 'bg-rose-400',
      tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/35',
    },
    {
      id: 'task-4',
      title: 'Morning alignment with Core OS engineering',
      priority: 'later' as TaskPriority,
      done: true,
      time: '9:15 AM',
      category: 'Completed • Room 4B',
      priorityTag: 'Normal',
      dotColor: 'bg-emerald-400',
      tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35',
    },
  ]

  const [taskList, setTaskList] = useState(defaultSampleTasks)

  const [completedTasks, setCompletedTasks] = useState([
    {
      id: 'comp-1',
      title: 'Morning alignment with Core OS engineering',
      time: '9:15 AM',
      category: 'Room 4B',
      done: true,
    },
    {
      id: 'comp-2',
      title: 'Review token exports for SwiftUI Liquid Glass',
      time: '8:45 AM',
      category: 'Design Tokens',
      done: true,
    },
    {
      id: 'comp-3',
      title: 'Sync with Alan on Keynote v4 outline',
      time: '8:15 AM',
      category: 'Keynote v4',
      done: true,
    },
    {
      id: 'comp-4',
      title: 'Daily standup & backlog triage',
      time: '8:00 AM',
      category: 'Sprint 3',
      done: true,
    },
  ])
  const [isCompletedOpen, setIsCompletedOpen] = useState(true)

  const toggleCompletedTask = (id: string) => {
    setCompletedTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, done: !t.done } : t))
    )
  }

  const handleToggle = (id: string) => {
    setTaskList(prev =>
      prev.map(t => (t.id === id ? { ...t, done: !t.done } : t))
    )
    onToggleTask(id)
  }

  const completedCount = taskList.filter(t => t.done).length + completedTasks.filter(t => t.done).length
  const completionPercentage = 57 // Matches exact prototype dial value

  return (
    <div className="w-full h-full flex flex-col px-5 pt-12 pb-48 text-white select-none overflow-y-auto scrollbar-thin max-w-[430px] mx-auto bg-gradient-to-b from-[#0a0e20] via-[#060916] to-[#030610]">
      {/* Top Header Row */}
      <div className="flex items-center justify-between pt-2 pb-2 shrink-0">
        <h1 className="text-[32px] font-extrabold tracking-tight text-white leading-none">Today</h1>
        <div className="flex items-center gap-2.5">
          {/* Search Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/15 text-neutral-300 hover:text-white transition-all border border-white/15 flex items-center justify-center backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.3)] shrink-0"
            title="Global Search"
          >
            <Search className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* Calendar Button */}
          <button
            type="button"
            onClick={onOpenCalendar}
            className="w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/15 text-neutral-300 hover:text-white transition-all border border-white/15 flex items-center justify-center backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.3)] shrink-0"
            title="Calendar & Timeline"
          >
            <Calendar className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* Profile / Account Avatar with Cyan Border matching prototype */}
          <button
            type="button"
            onClick={onOpenAccount}
            className="w-10 h-10 rounded-full bg-[#0d1428] border-2 border-[#00F0FF] hover:border-white transition-all flex items-center justify-center shadow-[0_0_16px_rgba(0,240,255,0.4)] shrink-0"
            title="Account & Flow Profile"
          >
            <User className="w-5 h-5 text-[#00F0FF] stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* Hero Focus Mode Dynamic Pill Banner */}
      <div
        onClick={onStartFocus}
        className="mt-2 p-3.5 rounded-2xl bg-gradient-to-r from-[#071e30]/85 via-[#0a2342]/75 to-[#141238]/75 border border-[#00F0FF]/40 backdrop-blur-2xl hover:border-[#00F0FF]/70 cursor-pointer transition-all shadow-[0_8px_30px_rgba(0,240,255,0.18),inset_0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-between shrink-0"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] flex items-center justify-center shadow-[0_0_14px_rgba(0,240,255,0.35)] shrink-0">
            <Target className="w-5 h-5 stroke-[2.4]" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-bold text-white flex items-center gap-1.5 truncate tracking-wide">
              <span>FOCUS MODE</span>
              <span className="text-[#00F0FF]">•</span>
              <span className="text-neutral-300 font-medium">24m remaining</span>
            </div>
            <div className="text-xs text-neutral-400 truncate mt-0.5 font-normal">
              Design System Tokens Refinement
            </div>
          </div>
        </div>
        {/* Animated Equalizer Waveform */}
        <div className="flex items-end gap-[3px] h-4 pr-1 shrink-0">
          <span className="w-[2.5px] bg-[#00F0FF] rounded-full animate-[pulse_0.8s_infinite] h-3 shadow-[0_0_6px_#00F0FF]" />
          <span className="w-[2.5px] bg-[#00F0FF] rounded-full animate-[pulse_1.2s_infinite] h-4.5 shadow-[0_0_6px_#00F0FF]" />
          <span className="w-[2.5px] bg-[#00F0FF] rounded-full animate-[pulse_0.6s_infinite] h-2 shadow-[0_0_6px_#00F0FF]" />
        </div>
      </div>

      {/* Hero Greeting & Flow State Streak Card */}
      <div className="mt-3.5 p-4 sm:p-5 rounded-[28px] bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/12 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.18)] flex items-center justify-between shrink-0">
        <div className="flex-1 pr-2">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono text-neutral-400">Thursday, Oct 22</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[11px] font-semibold border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              <Flame className="w-3 h-3 fill-current text-amber-400" /> 12 day streak
            </span>
          </div>
          <h2 className="text-2xl sm:text-[26px] font-black tracking-tight text-white leading-tight">
            Good morning,<br />Alexander
          </h2>
          <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1.5 font-medium">
            <span>Deep flow state activated</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            </span>
          </div>
        </div>

        {/* Completion Radial Progress Dial matching prototype */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 70 70">
              <circle cx="35" cy="35" r="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5.5" />
              <circle
                cx="35"
                cy="35"
                r="28"
                fill="none"
                stroke="#00F0FF"
                strokeWidth="5.5"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - completionPercentage / 100)}
                strokeLinecap="round"
                className="transition-all duration-700"
                style={{ filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.65))' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-base font-mono font-bold text-white leading-none">57%</span>
              <span className="text-[9px] font-mono text-neutral-400 mt-0.5">4 of 7</span>
            </div>
          </div>
          <span className="mt-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono font-medium text-neutral-200 border border-white/15 backdrop-blur-md">
            +3 left today
          </span>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="mt-3.5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
        <button
          type="button"
          onClick={() => setSelectedFilter('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all shrink-0 flex items-center gap-1.5 ${
            selectedFilter === 'all'
              ? 'bg-[#00F0FF]/18 text-white border border-[#00F0FF]/70 shadow-[0_0_16px_rgba(0,240,255,0.35),inset_0_1px_0_rgba(255,255,255,0.3)]'
              : 'bg-white/[0.06] text-neutral-400 hover:text-white border border-white/12'
          }`}
        >
          <span>ALL TASKS</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${selectedFilter === 'all' ? 'bg-[#00F0FF]/30 text-[#00F0FF]' : 'bg-white/10 text-neutral-400'}`}>7</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedFilter('work')}
          className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all shrink-0 flex items-center gap-1.5 ${
            selectedFilter === 'work'
              ? 'bg-[#00F0FF]/18 text-white border border-[#00F0FF]/70 shadow-[0_0_16px_rgba(0,240,255,0.35),inset_0_1px_0_rgba(255,255,255,0.3)]'
              : 'bg-white/[0.06] text-neutral-400 hover:text-white border border-white/12'
          }`}
        >
          <span>WORK</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${selectedFilter === 'work' ? 'bg-[#00F0FF]/30 text-[#00F0FF]' : 'bg-white/10 text-neutral-400'}`}>3</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedFilter('design')}
          className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all shrink-0 flex items-center gap-1.5 ${
            selectedFilter === 'design'
              ? 'bg-[#00F0FF]/18 text-white border border-[#00F0FF]/70 shadow-[0_0_16px_rgba(0,240,255,0.35),inset_0_1px_0_rgba(255,255,255,0.3)]'
              : 'bg-white/[0.06] text-neutral-400 hover:text-white border border-white/12'
          }`}
        >
          <span>DESIGN SYSTEM</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${selectedFilter === 'design' ? 'bg-[#00F0FF]/30 text-[#00F0FF]' : 'bg-white/10 text-neutral-400'}`}>2</span>
        </button>
      </div>

      {/* Priority Focus Header Row with Auto-sort */}
      <div className="mt-3.5 flex items-center justify-between shrink-0">
        <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-300 font-bold flex items-center gap-1.5">
          <span>PRIORITY FOCUS</span>
          <span className="w-2 h-2 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
        </div>
        <button
          type="button"
          className="flex items-center gap-1 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
        >
          <span>Auto-sort</span>
          <ArrowUpDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Priority Focus Tasks List */}
      <div className="mt-2.5 space-y-3">
        {taskList.slice(0, 3).map(task => (
          <div
            key={task.id}
            className={`p-4 rounded-[22px] border transition-all duration-300 ${
              task.done
                ? 'bg-white/[0.05] border-white/14 shadow-[0_6px_24px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.12)]'
                : 'bg-white/[0.08] border-white/18 hover:border-white/30 hover:bg-white/[0.11] shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.2)]'
            }`}
          >
            <div className="flex items-start gap-3.5">
              {/* Checkbox Squircle */}
              <button
                type="button"
                onClick={() => handleToggle(task.id)}
                className={`w-6 h-6 rounded-xl flex items-center justify-center transition-all mt-0.5 shrink-0 ${
                  task.done
                    ? 'bg-[#00F0FF] text-neutral-950 shadow-[0_0_14px_rgba(0,240,255,0.7)]'
                    : 'border-2 border-white/25 hover:border-[#00F0FF] bg-white/5'
                }`}
              >
                {task.done && <Check className="w-4 h-4 stroke-[3.2]" />}
              </button>

              <div className="flex-1 min-w-0">
                {/* Priority Badge & Time */}
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${task.tagColor}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${task.dotColor || 'bg-rose-400'}`} />
                    {task.priorityTag}
                  </span>
                  <span className="text-xs font-mono font-bold text-neutral-200">{task.time}</span>
                </div>

                {/* Title (Crisp, readable, bold white, NO strikethrough!) */}
                <h3 className="text-[15px] font-bold text-white leading-snug">
                  {task.title}
                </h3>

                {/* Subtasks Progress Bar (Task 1) */}
                {task.subtaskProgress && (
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

                {/* Footer Project & Team Avatars / Attachments */}
                <div className="mt-3 flex items-center justify-between text-xs text-neutral-400 pt-1 border-t border-white/[0.06]">
                  <div className="flex items-center gap-1.5 font-medium text-neutral-300 text-xs">
                    {task.id === 'task-1' && <Palette className="w-3.5 h-3.5 text-neutral-400" />}
                    {task.id === 'task-2' && <Headphones className="w-3.5 h-3.5 text-neutral-400" />}
                    {task.id === 'task-3' && <Users className="w-3.5 h-3.5 text-neutral-400" />}
                    <span>{task.category}</span>
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
        ))}
      </div>

      {/* Completed Today Section - Minimalist High-End Liquid Glass */}
      <div className="mt-8 mb-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-neutral-300 tracking-tight">Completed today</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-neutral-300 bg-white/[0.08] border border-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              {completedTasks.filter(t => t.done).length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsCompletedOpen(!isCompletedOpen)}
            className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400 hover:text-neutral-200 transition-colors py-1 px-2.5 rounded-lg hover:bg-white/[0.06] border border-transparent hover:border-white/10"
          >
            <span>{isCompletedOpen ? 'Hide' : 'Show'}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                isCompletedOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {isCompletedOpen && (
          <div className="rounded-[22px] bg-gradient-to-b from-white/[0.045] to-white/[0.015] border border-white/10 backdrop-blur-2xl divide-y divide-white/[0.05] overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all">
            {completedTasks.map(task => (
              <div
                key={task.id}
                className="group px-4 py-3.5 flex items-start gap-3.5 hover:bg-white/[0.03] transition-colors"
              >
                {/* Jewel-like Minimalist Squircle Checkbox */}
                <button
                  type="button"
                  onClick={() => toggleCompletedTask(task.id)}
                  className={`w-5 h-5 rounded-[7px] flex items-center justify-center transition-all mt-0.5 shrink-0 ${
                    task.done
                      ? 'bg-emerald-400/20 border border-emerald-400/45 text-emerald-300 hover:bg-emerald-400/30 shadow-[0_0_10px_rgba(52,211,153,0.25)]'
                      : 'border-2 border-white/25 hover:border-white/45 bg-white/[0.04]'
                  }`}
                  aria-label={`Toggle ${task.title}`}
                >
                  {task.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                {/* Title & Metadata */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[13px] leading-snug transition-all ${
                      task.done
                        ? 'text-neutral-400/85 line-through decoration-neutral-500/50 font-normal'
                        : 'text-white font-semibold'
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-neutral-400">
                    <span className="font-mono text-neutral-300">{task.time}</span>
                    <span className="w-1 h-1 rounded-full bg-neutral-600" />
                    <span className="truncate text-neutral-400">{task.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

