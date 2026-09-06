import React, { useState, useMemo } from 'react'
import {
  Search,
  Calendar,
  Sparkles,
  Flame,
  Check,
  CheckCircle2,
  Clock,
  Paperclip,
  Users,
  ChevronRight,
  ArrowUpDown,
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

  // Sample tasks matching the Stitch prototype exactly if tasks are empty
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
      avatars: ['JS', 'AL'],
      priorityTag: 'High Priority',
      tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
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
      tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    {
      id: 'task-3',
      title: 'Executive pitch deck for iOS Liquid Glass redesign',
      priority: 'focus' as TaskPriority,
      done: false,
      time: '4:15 PM',
      category: 'With Tim & Alan • Keynote v4',
      priorityTag: 'High Priority',
      tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      id: 'task-4',
      title: 'Morning alignment with Core OS engineering',
      priority: 'later' as TaskPriority,
      done: true,
      time: '9:15 AM',
      category: 'Completed • Room 4B',
      priorityTag: 'Normal',
      tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
  ]

  const [taskList, setTaskList] = useState(defaultSampleTasks)

  const handleToggle = (id: string) => {
    setTaskList(prev =>
      prev.map(t => (t.id === id ? { ...t, done: !t.done } : t))
    )
    onToggleTask(id)
  }

  const activeCount = taskList.filter(t => !t.done).length
  const completedCount = taskList.filter(t => t.done).length
  const completionPercentage = Math.round((completedCount / taskList.length) * 100)

  return (
    <div className="w-full h-full flex flex-col px-4 sm:px-5 pt-[max(env(safe-area-inset-top,14px),14px)] pb-44 text-white select-none overflow-y-auto scrollbar-thin max-w-[430px] mx-auto">
      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-1 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-white">Today</h1>
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/15 text-neutral-300 hover:text-white transition-colors border border-white/10 flex items-center justify-center backdrop-blur-md shrink-0"
            title="Global Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Calendar Button */}
          <button
            type="button"
            onClick={onOpenCalendar}
            className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/15 text-neutral-300 hover:text-white transition-colors border border-white/10 flex items-center justify-center backdrop-blur-md shrink-0"
            title="Calendar & Timeline"
          >
            <Calendar className="w-4 h-4" />
          </button>

          {/* Profile / Account Avatar */}
          <button
            type="button"
            onClick={onOpenAccount}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#00c6d4] to-[#38bdf8] p-[1.5px] hover:scale-105 transition-transform shrink-0"
            title="Account & Flow Profile"
          >
            <div className="w-full h-full rounded-full bg-[#0c0d18] flex items-center justify-center text-[10px] font-bold font-mono text-[#00F0FF]">
              AV
            </div>
          </button>
        </div>
      </div>

      {/* Hero Focus Mode Dynamic Pill Banner */}
      <div
        onClick={onStartFocus}
        className="mt-2.5 p-3 rounded-2xl bg-gradient-to-r from-[#041a29]/70 via-[#071d38]/60 to-[#141030]/60 border border-[#00F0FF]/30 backdrop-blur-xl hover:border-[#00F0FF]/60 cursor-pointer transition-all shadow-[0_4px_20px_rgba(0,240,255,0.14)] flex items-center justify-between shrink-0"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/30 text-[#00F0FF] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold font-mono text-white flex items-center gap-1.5 truncate">
              <span>FOCUS MODE • 24m remaining</span>
            </div>
            <div className="text-[10px] text-neutral-400 truncate">Design System Tokens Refinement</div>
          </div>
        </div>
        {/* Animated Equalizer Waveform */}
        <div className="flex items-end gap-[3px] h-3.5 pr-1 shrink-0">
          <span className="w-[2px] bg-[#00F0FF] rounded-full animate-[pulse_0.8s_infinite] h-2.5 shadow-[0_0_4px_#00F0FF]" />
          <span className="w-[2px] bg-[#00F0FF] rounded-full animate-[pulse_1.2s_infinite] h-3.5 shadow-[0_0_4px_#00F0FF]" />
          <span className="w-[2px] bg-[#00F0FF] rounded-full animate-[pulse_0.6s_infinite] h-1.5 shadow-[0_0_4px_#00F0FF]" />
        </div>
      </div>

      {/* Hero Greeting & Flow State Streak Card */}
      <div className="mt-3 p-4 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-neutral-400">Thursday, Oct 22</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
              <Flame className="w-2.5 h-2.5 fill-current" /> 12 day streak
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">Good morning, Alexander</h2>
          <div className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1.5">
            <span>Deep flow state activated</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
        </div>

        {/* Completion Radial Progress Dial matching prototype */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
              <circle
                cx="30"
                cy="30"
                r="24"
                fill="none"
                stroke="#00F0FF"
                strokeWidth="4"
                strokeDasharray={2 * Math.PI * 24}
                strokeDashoffset={2 * Math.PI * 24 * (1 - 57 / 100)}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xs font-mono font-bold text-white">57%</span>
              <span className="text-[8px] font-mono text-neutral-400">4 of 7</span>
            </div>
          </div>
          <span className="mt-1 px-2 py-0.5 rounded-full bg-white/[0.08] text-[9px] font-mono text-neutral-300 border border-white/10">
            +3 left today
          </span>
        </div>
      </div>

      {/* Category Filter Pills & Auto-sort */}
      <div className="mt-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              selectedFilter === 'all'
                ? 'bg-[#00F0FF]/20 text-white border border-[#00F0FF]/60 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'bg-white/[0.05] text-neutral-400 hover:text-white border border-white/10'
            }`}
          >
            ALL TASKS <span className="text-[10px] font-mono opacity-80">7</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('work')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              selectedFilter === 'work'
                ? 'bg-[#00F0FF]/20 text-white border border-[#00F0FF]/60 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'bg-white/[0.05] text-neutral-400 hover:text-white border border-white/10'
            }`}
          >
            WORK <span className="text-[10px] font-mono opacity-80">3</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('design')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              selectedFilter === 'design'
                ? 'bg-[#00F0FF]/20 text-white border border-[#00F0FF]/60 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'bg-white/[0.05] text-neutral-400 hover:text-white border border-white/10'
            }`}
          >
            DESIGN SYSTEM <span className="text-[10px] font-mono opacity-80">2</span>
          </button>
        </div>

        <button
          type="button"
          className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-white transition-colors shrink-0"
        >
          <span>Auto-sort</span>
          <ArrowUpDown className="w-3 h-3" />
        </button>
      </div>

      {/* Priority Focus Tasks List */}
      <div className="mt-3 space-y-2.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
          <span>PRIORITY FOCUS</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
        </div>

        {taskList.slice(0, 3).map(task => (
          <div
            key={task.id}
            className={`p-3.5 rounded-2xl border transition-all duration-300 ${
              task.done
                ? 'bg-white/[0.03] border-white/10 opacity-80'
                : 'bg-white/[0.06] border-white/15 hover:border-white/30 hover:bg-white/[0.09] shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Checkbox */}
              <button
                type="button"
                onClick={() => handleToggle(task.id)}
                className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all mt-0.5 shrink-0 ${
                  task.done
                    ? 'bg-[#00F0FF] border-[#00F0FF] shadow-[0_0_10px_#00F0FF]'
                    : 'border-white/30 hover:border-[#00F0FF] bg-white/5'
                }`}
              >
                {task.done && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${task.tagColor}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${task.priorityTag === 'Medium' ? 'bg-[#00F0FF]' : 'bg-rose-400'}`} />
                    {task.priorityTag}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">{task.time}</span>
                </div>

                <h3 className={`text-sm font-semibold leading-snug ${task.done ? 'line-through text-neutral-400' : 'text-white'}`}>
                  {task.title}
                </h3>

                {/* Subtasks Progress or Attachments */}
                {task.subtaskProgress && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] font-mono text-neutral-400">{task.subtasksCount}</span>
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#00F0FF] to-emerald-400 rounded-full"
                        style={{ width: `${task.subtaskProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Footer Badges & Team Avatars */}
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    {task.category}
                  </span>
                  {task.avatars && (
                    <div className="flex -space-x-1.5">
                      {task.avatars.map((av, idx) => (
                        <span
                          key={idx}
                          className="w-4 h-4 rounded-full bg-neutral-800 border border-neutral-700 text-[8px] font-bold flex items-center justify-center text-white"
                        >
                          {av}
                        </span>
                      ))}
                    </div>
                  )}
                  {task.attachments && (
                    <span className="flex items-center gap-1 text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded-full">
                      <Paperclip className="w-2.5 h-2.5" /> {task.attachments}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Completed Today Section */}
      <div className="mt-4 space-y-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
          COMPLETED TODAY (4)
        </div>
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 opacity-70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-xs font-medium text-neutral-300 line-through">
                Morning alignment with Core OS engineering
              </div>
              <div className="text-[10px] text-neutral-500 font-mono">Completed at 9:15 AM</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
