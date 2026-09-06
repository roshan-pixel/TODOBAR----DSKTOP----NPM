import React from 'react'
import { Trophy, Flame, Clock, Zap, Shield, Heart, ArrowRight, CheckCircle2, Check } from 'lucide-react'
import { TodayTask } from '../types'

interface SessionCompletedViewProps {
  onReturnToToday: () => void
  completedTasks?: TodayTask[]
  focusMinutesElapsed?: number
}

export const SessionCompletedView: React.FC<SessionCompletedViewProps> = ({
  onReturnToToday,
  completedTasks = [],
  focusMinutesElapsed = 45,
}) => {
  return (
    <div className="w-full h-full flex flex-col justify-between px-5 pt-12 pb-36 text-white select-none overflow-y-auto scrollbar-thin bg-gradient-to-b from-[#0a0e20] via-[#060916] to-[#030610]">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10 pt-2">
          <span className="text-xs font-mono uppercase text-neutral-400 tracking-wider">DONE & SPRINT SUMMARY</span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            FLOW CONQUERED
          </span>
        </div>

        {/* Hero Trophy & Title */}
        <div className="my-5 flex flex-col items-center text-center">
          <div className="relative mb-3 flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-[#00F0FF]/20 to-emerald-500/20 border border-[#00F0FF]/40 shadow-[0_0_30px_rgba(0,240,255,0.4)]">
            <Trophy className="w-10 h-10 text-[#00F0FF]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Sprint Conquered!</h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-[280px] leading-relaxed">
            Deep neural synchronization maintained throughout {focusMinutesElapsed}-minute sprint.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <Flame className="w-3.5 h-3.5 fill-current text-amber-400" />
            <span>13-Day Flow Streak (New Record!)</span>
          </div>
        </div>

        {/* Session Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 my-3">
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] font-mono uppercase">
              <Clock className="w-3 h-3 text-[#00F0FF]" /> Focus Time
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">{focusMinutesElapsed}m 00s</div>
            <div className="text-[10px] text-emerald-400 mt-0.5 font-medium">+100% Target Met</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] font-mono uppercase">
              <CheckCircle2 className="w-3 h-3 text-[#00F0FF]" /> Completed Today
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">{completedTasks.length} tasks</div>
            <div className="text-[10px] text-cyan-400 mt-0.5 font-medium">Synced Across Tabs</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] font-mono uppercase">
              <Shield className="w-3 h-3 text-emerald-400" /> Alerts Silenced
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">27</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">Zero Breaches</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] font-mono uppercase">
              <Heart className="w-3 h-3 text-rose-400" /> Avg Heart Rate
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">60 BPM</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Calm / Steady</div>
          </div>
        </div>

        {/* Completed Tasks List on Done Screen */}
        <div className="my-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold mb-2 flex items-center justify-between">
            <span>Conquered Tasks</span>
            <span className="text-[#00F0FF]">{completedTasks.length} Done</span>
          </div>

          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto scrollbar-thin pr-1">
            {completedTasks.length === 0 ? (
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-neutral-500">
                No tasks completed yet
              </div>
            ) : (
              completedTasks.map(t => (
                <div
                  key={t.id}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/8 text-xs"
                >
                  <span className="w-4 h-4 rounded-md bg-emerald-400/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/40">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                  <span className="flex-1 text-neutral-300 truncate font-medium">{t.title}</span>
                  <span className="text-[10px] font-mono text-neutral-500 shrink-0">{t.completedAt || t.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Return to Today Primary Button */}
      <div className="flex flex-col gap-2 mt-4">
        <button
          type="button"
          onClick={onReturnToToday}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00c6d4] via-[#00F0FF] to-[#38bdf8] text-neutral-950 font-bold text-sm tracking-wide shadow-[0_0_24px_rgba(0,240,255,0.6),inset_0_1px_0_rgba(255,255,255,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <span>Return to Today's Tasks</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
