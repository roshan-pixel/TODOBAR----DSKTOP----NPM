import React, { useState } from 'react'
import {
  Search,
  Calendar,
  User,
  Target,
  Flame,
  Check,
  Paperclip,
  ArrowUpDown,
  ListTodo,
  Palette,
  Headphones,
  Users,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import { TodayTask } from '../types'
import { isWorkTask, isDesignSystemTask } from '../hooks/useTodayTasks'

interface TodayViewProps {
  tasks: TodayTask[]
  onToggleTask: (id: string) => void
  onStartFocus: () => void
  onOpenSearch: () => void
  onOpenCalendar: () => void
  onOpenAccount: () => void
  focusTimeString?: string
  focusMinutesRemaining?: number
  isFocusRunning?: boolean
  focusTaskTitle?: string
}

export const TodayView: React.FC<TodayViewProps> = ({
  tasks,
  onToggleTask,
  onStartFocus,
  onOpenSearch,
  onOpenCalendar,
  onOpenAccount,
  focusTimeString = '24:07',
  focusMinutesRemaining = 24,
  isFocusRunning = true,
  focusTaskTitle = 'Design System Tokens Refinement',
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'work' | 'design'>('all')
  const [isCompletedOpen, setIsCompletedOpen] = useState(true)
  const [sortByPriority, setSortByPriority] = useState(false)

  // Dynamic calculations from real tasks
  const totalCount = tasks.length
  const completedCount = tasks.filter(t => t.done).length
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const leftTodayCount = Math.max(0, totalCount - completedCount)

  // Category counts (dynamic)
  const allCount = totalCount
  const workCount = tasks.filter(isWorkTask).length
  const designCount = tasks.filter(isDesignSystemTask).length

  // Filtered active tasks
  const activeTasks = tasks.filter(t => !t.done)
  const completedTasks = tasks.filter(t => t.done)

  const filteredActiveTasks = activeTasks
    .filter(task => {
      if (selectedFilter === 'work') return isWorkTask(task)
      if (selectedFilter === 'design') return isDesignSystemTask(task)
      return true
    })
    .sort((a, b) => {
      if (!sortByPriority) return 0
      const order = { focus: 0, normal: 1, later: 2 }
      return (order[a.priority] ?? 1) - (order[b.priority] ?? 1)
    })

  const filteredCompletedTasks = completedTasks.filter(task => {
    if (selectedFilter === 'work') return isWorkTask(task)
    if (selectedFilter === 'design') return isDesignSystemTask(task)
    return true
  })

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
        className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-[#071e30]/85 via-[#0a2342]/75 to-[#141238]/75 border border-[#00F0FF]/40 backdrop-blur-2xl hover:border-[#00F0FF]/70 cursor-pointer transition-all shadow-[0_8px_30px_rgba(0,240,255,0.18),inset_0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-between shrink-0"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] flex items-center justify-center shadow-[0_0_14px_rgba(0,240,255,0.35)] shrink-0">
            <Target className="w-5 h-5 stroke-[2.4]" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-bold text-white flex items-center gap-1.5 truncate tracking-wide">
              <span>FOCUS MODE</span>
              <span className="text-[#00F0FF]">•</span>
              <span className="text-neutral-300 font-medium">
                {isFocusRunning ? `${focusMinutesRemaining}m remaining` : `Paused (${focusTimeString})`}
              </span>
            </div>
            <div className="text-xs text-neutral-400 truncate mt-0.5 font-normal">
              {focusTaskTitle}
            </div>
          </div>
        </div>

        {/* Animated Equalizer Waveform */}
        <div className="flex items-end gap-[3px] h-4 pr-1 shrink-0">
          <span
            className={`w-[2.5px] bg-[#00F0FF] rounded-full h-3 shadow-[0_0_6px_#00F0FF] ${
              isFocusRunning ? 'animate-[pulse_0.8s_infinite]' : 'opacity-60'
            }`}
          />
          <span
            className={`w-[2.5px] bg-[#00F0FF] rounded-full h-4.5 shadow-[0_0_6px_#00F0FF] ${
              isFocusRunning ? 'animate-[pulse_1.2s_infinite]' : 'opacity-60'
            }`}
          />
          <span
            className={`w-[2.5px] bg-[#00F0FF] rounded-full h-2 shadow-[0_0_6px_#00F0FF] ${
              isFocusRunning ? 'animate-[pulse_0.6s_infinite]' : 'opacity-60'
            }`}
          />
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
            <span>{completionPercentage === 100 ? 'All tasks conquered today!' : 'Deep flow state activated'}</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            </span>
          </div>
        </div>

        {/* Dynamic Completion Radial Progress Dial */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 70 70">
              <circle cx="35" cy="35" r="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5.5" />
              <circle
                cx="35"
                cy="35"
                r="28"
                fill="none"
                stroke={completionPercentage === 100 ? '#10b981' : '#00F0FF'}
                strokeWidth="5.5"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - completionPercentage / 100)}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
                style={{
                  filter:
                    completionPercentage === 100
                      ? 'drop-shadow(0 0 8px rgba(16,185,129,0.65))'
                      : 'drop-shadow(0 0 8px rgba(0,240,255,0.65))',
                }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-base font-mono font-bold text-white leading-none">
                {completionPercentage}%
              </span>
              <span className="text-[9px] font-mono text-neutral-400 mt-0.5">
                {completedCount} of {totalCount}
              </span>
            </div>
          </div>
          <span className="mt-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono font-medium text-neutral-200 border border-white/15 backdrop-blur-md">
            {leftTodayCount > 0 ? `+${leftTodayCount} left today` : 'All done today!'}
          </span>
        </div>
      </div>

      {/* Dynamic Category Filter Chips */}
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
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
              selectedFilter === 'all' ? 'bg-[#00F0FF]/30 text-[#00F0FF]' : 'bg-white/10 text-neutral-400'
            }`}
          >
            {allCount}
          </span>
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
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
              selectedFilter === 'work' ? 'bg-[#00F0FF]/30 text-[#00F0FF]' : 'bg-white/10 text-neutral-400'
            }`}
          >
            {workCount}
          </span>
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
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
              selectedFilter === 'design' ? 'bg-[#00F0FF]/30 text-[#00F0FF]' : 'bg-white/10 text-neutral-400'
            }`}
          >
            {designCount}
          </span>
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
          onClick={() => setSortByPriority(!sortByPriority)}
          className={`flex items-center gap-1 text-xs font-mono transition-colors ${
            sortByPriority ? 'text-[#00F0FF]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <span>{sortByPriority ? 'Sorted' : 'Auto-sort'}</span>
          <ArrowUpDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Priority Focus Tasks List */}
      <div className="mt-3 flex flex-col gap-3.5">
        {filteredActiveTasks.length === 0 ? (
          <div className="p-6 rounded-[22px] bg-white/[0.03] border border-white/10 text-center flex flex-col items-center justify-center">
            <Sparkles className="w-6 h-6 text-[#00F0FF] mb-2" />
            <p className="text-sm font-semibold text-neutral-200">No active tasks in this view</p>
            <p className="text-xs text-neutral-400 mt-1">
              {leftTodayCount === 0 ? 'All tasks conquered!' : 'Switch filters or tap + to add one'}
            </p>
          </div>
        ) : (
          filteredActiveTasks.map(task => (
            <div
              key={task.id}
              className="w-full shrink-0 p-4 rounded-[22px] border transition-all duration-300 bg-white/[0.08] border-white/18 hover:border-white/30 hover:bg-white/[0.11] shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.2)]"
            >
              <div className="flex items-start gap-3.5">
                {/* Checkbox Squircle */}
                <button
                  type="button"
                  onClick={() => onToggleTask(task.id)}
                  className="w-6 h-6 rounded-xl flex items-center justify-center transition-all mt-0.5 shrink-0 border-2 border-white/25 hover:border-[#00F0FF] bg-white/5 hover:bg-[#00F0FF]/10 active:scale-90"
                  aria-label={`Mark ${task.title} as completed`}
                >
                  {task.done && <Check className="w-4 h-4 stroke-[3.2] text-[#00F0FF]" />}
                </button>

                <div className="flex-1 min-w-0">
                  {/* Priority Badge & Time */}
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        task.tagColor || 'bg-rose-500/20 text-rose-300 border-rose-500/35'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${task.dotColor || 'bg-rose-400'}`} />
                      {task.priorityTag || 'Priority'}
                    </span>
                    <span className="text-xs font-mono font-bold text-neutral-200">{task.time}</span>
                  </div>

                  {/* Title (Crisp, readable, bold white, NO strikethrough!) */}
                  <h3 className="text-[15px] font-bold text-white leading-snug">
                    {task.title}
                  </h3>

                  {/* Subtasks Progress Bar if available */}
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
                      {isDesignSystemTask(task) && <Palette className="w-3.5 h-3.5 text-neutral-400" />}
                      {!isDesignSystemTask(task) && task.title.toLowerCase().includes('audio') && (
                        <Headphones className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                      {!isDesignSystemTask(task) && !task.title.toLowerCase().includes('audio') && (
                        <Users className="w-3.5 h-3.5 text-neutral-400" />
                      )}
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
          ))
        )}
      </div>

      {/* Completed Today Section - Minimalist High-End Liquid Glass Boxes */}
      <div className="mt-5 mb-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-neutral-300 tracking-tight">Completed today</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-neutral-300 bg-white/[0.08] border border-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              {filteredCompletedTasks.length}
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
          <div className="flex flex-col gap-3">
            {filteredCompletedTasks.length === 0 ? (
              <div className="p-4 rounded-[20px] bg-white/[0.02] border border-white/[0.06] text-center text-xs text-neutral-500 font-mono">
                No completed tasks in this view yet
              </div>
            ) : (
              filteredCompletedTasks.map(task => (
                <div
                  key={task.id}
                  className="w-full shrink-0 group p-3.5 sm:p-4 rounded-[20px] bg-gradient-to-b from-white/[0.04] to-white/[0.015] border border-white/[0.08] backdrop-blur-2xl flex items-start gap-3.5 hover:bg-white/[0.045] hover:border-white/15 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)]"
                >
                  {/* Jewel-like Minimalist Squircle Checkbox */}
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    className="w-5 h-5 rounded-[7px] flex items-center justify-center transition-all mt-0.5 shrink-0 bg-emerald-400/20 border border-emerald-400/45 text-emerald-300 hover:bg-emerald-400/30 shadow-[0_0_10px_rgba(52,211,153,0.25)] active:scale-90"
                    aria-label={`Uncheck ${task.title}`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  {/* Title & Metadata */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] leading-snug transition-all text-neutral-400/85 line-through decoration-neutral-500/50 font-normal">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400">
                      <span className="font-mono text-neutral-300">
                        {task.completedAt || task.time}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-neutral-600" />
                      <span className="truncate text-neutral-400">{task.category}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
