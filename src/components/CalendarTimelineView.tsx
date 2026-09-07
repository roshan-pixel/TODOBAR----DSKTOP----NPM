import React, { useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Clock, Flame, Calendar as CalendarIcon } from 'lucide-react'
import { TodayTask } from '../types'

interface CalendarTimelineViewProps {
  onBack: () => void
  onSelectTask?: (taskId: string) => void
  tasks?: TodayTask[]
}

export const CalendarTimelineView: React.FC<CalendarTimelineViewProps> = ({ onBack, onSelectTask, tasks = [] }) => {
  const [selectedDay, setSelectedDay] = useState(22)

  const days = [
    { day: 'Mon', date: 19 },
    { day: 'Tue', date: 20 },
    { day: 'Wed', date: 21 },
    { day: 'Thu', date: 22, isToday: true },
    { day: 'Fri', date: 23 },
    { day: 'Sat', date: 24 },
    { day: 'Sun', date: 25 },
  ]

  return (
    <div className="w-full h-full flex flex-col px-4 sm:px-5 pt-[max(env(safe-area-inset-top,14px),14px)] pb-36 text-white select-none overflow-y-auto scrollbar-thin max-w-[430px] mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold tracking-wider text-neutral-300 transition-colors border border-white/15"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>TODAY</span>
        </button>
        <div className="flex items-center gap-1 text-sm font-semibold tracking-wide text-white">
          <span>October 2026</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 text-[#00F0FF] border border-cyan-500/30">
          TIMELINE
        </span>
      </div>

      {/* Horizontal Liquid Glass Date Scrubber */}
      <div className="my-4">
        <div className="grid grid-cols-7 gap-1.5 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
          {days.map(d => {
            const isSelected = selectedDay === d.date
            return (
              <button
                key={d.date}
                type="button"
                onClick={() => setSelectedDay(d.date)}
                className={`py-2 flex flex-col items-center justify-center rounded-xl transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#00F0FF]/30 to-[#00F0FF]/10 text-white border border-[#00F0FF]/50 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className="text-[10px] font-mono uppercase">{d.day}</span>
                <span className="text-sm font-bold mt-0.5">{d.date}</span>
                {d.isToday && <Flame className="w-2.5 h-2.5 text-amber-400 mt-0.5" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Time-Blocked Schedule Cards */}
      <div className="flex-1 space-y-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
          SCHEDULED FOR TODAY
        </div>

        {tasks.length === 0 ? (
          <div className="p-6 rounded-[22px] bg-white/[0.03] border border-white/10 text-center flex flex-col items-center justify-center mt-2">
            <CalendarIcon className="w-7 h-7 text-[#00F0FF]/70 mb-2.5" />
            <p className="text-sm font-semibold text-neutral-200">No scheduled tasks</p>
            <p className="text-xs text-neutral-400 mt-1">
              Add your own tasks with times to populate the timeline.
            </p>
          </div>
        ) : (
          tasks.map(task => (
            <div
              key={task.id}
              onClick={() => onSelectTask?.(task.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                task.done
                  ? 'bg-white/[0.03] border-white/10 opacity-70'
                  : task.priority === 'focus'
                  ? 'bg-[#00F0FF]/10 border-[#00F0FF]/40 shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                  : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]'
              }`}
            >
              <div className="flex items-start gap-3">
                {task.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                ) : (
                  <Clock className={`w-4 h-4 mt-0.5 shrink-0 ${task.priority === 'focus' ? 'text-[#00F0FF]' : 'text-neutral-400'}`} />
                )}
                <div className="flex-1 min-w-0">
                  <div className={`text-[11px] font-mono font-semibold ${
                    task.done ? 'text-emerald-400' : task.priority === 'focus' ? 'text-[#00F0FF]' : 'text-neutral-400'
                  }`}>
                    {task.time || 'Today'} • {task.done ? 'COMPLETED' : task.priority === 'focus' ? 'ACTIVE SPRINT' : 'UPCOMING'}
                  </div>
                  <div className={`text-xs font-semibold mt-0.5 truncate ${task.done ? 'text-white/90 line-through' : 'text-white'}`}>
                    {task.title}
                  </div>
                  {task.category && (
                    <div className="text-[10px] text-neutral-400 mt-0.5 truncate">{task.category}</div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
