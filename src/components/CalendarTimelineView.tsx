import React, { useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Clock, Flame } from 'lucide-react'

interface CalendarTimelineViewProps {
  onBack: () => void
  onSelectTask?: (taskId: string) => void
}

export const CalendarTimelineView: React.FC<CalendarTimelineViewProps> = ({ onBack, onSelectTask }) => {
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
    <div className="w-full h-full flex flex-col justify-between px-5 pt-12 pb-24 text-white select-none overflow-y-auto scrollbar-thin">
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
          SCHEDULED FOR THU, OCT 22
        </div>

        {/* 09:00 - 10:30 Completed Item */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 opacity-70 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-[11px] font-mono text-emerald-400 font-semibold">09:00 - 10:30 • COMPLETED</div>
              <div className="text-xs font-semibold text-white/90 line-through mt-0.5">
                Core OS Engineering Architecture Sync
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">Room 4B • Audio Labs Sync</div>
            </div>
          </div>
        </div>

        {/* 11:30 - 12:45 Active Focus Sprint (Glowing) */}
        <div className="p-3.5 rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/40 shadow-[0_0_20px_rgba(0,240,255,0.2)] flex items-start justify-between">
          <div className="flex items-start gap-3">
            <span className="relative flex h-3 w-3 mt-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F0FF] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00F0FF]" />
            </span>
            <div>
              <div className="text-[11px] font-mono text-[#00F0FF] font-semibold">11:30 - 12:45 • ACTIVE SPRINT</div>
              <div className="text-xs font-semibold text-white mt-0.5">
                Finalize Apple 2026 Liquid Glass Spec & Token Exports
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Sprint 2/4 • 3 of 4 subtasks done</div>
            </div>
          </div>
        </div>

        {/* 14:00 - 15:00 Upcoming */}
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-[11px] font-mono text-neutral-400">14:00 - 15:00 • UPCOMING</div>
              <div className="text-xs font-semibold text-white mt-0.5">
                Review spatial sound design for Todobar micro-haptics
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">Audio Labs • Haptics v2 • 2 files</div>
            </div>
          </div>
        </div>

        {/* 16:15 - 17:00 Upcoming */}
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-[11px] font-mono text-neutral-400">16:15 - 17:00 • UPCOMING</div>
              <div className="text-xs font-semibold text-white mt-0.5">
                Executive pitch deck for iOS Liquid Glass redesign
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">With Tim & Alan • Keynote v4</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
