import React from 'react'
import { Trophy, Flame, Clock, Zap, Shield, Heart, ArrowRight } from 'lucide-react'

interface SessionCompletedViewProps {
  onReturnToToday: () => void
}

export const SessionCompletedView: React.FC<SessionCompletedViewProps> = ({ onReturnToToday }) => {
  return (
    <div className="w-full h-full flex flex-col justify-between px-5 pt-12 pb-24 text-white select-none overflow-y-auto scrollbar-thin">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <span className="text-xs font-mono uppercase text-neutral-400 tracking-wider">SESSION SUMMARY</span>
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
          Deep neural synchronization maintained throughout 45-minute sprint.
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 fill-current" />
          <span>13-Day Flow Streak (New Record!)</span>
        </div>
      </div>

      {/* Session Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 gap-2.5 my-3">
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
          <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] font-mono uppercase">
            <Clock className="w-3 h-3 text-[#00F0FF]" /> Focus Time
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">45m 00s</div>
          <div className="text-[10px] text-emerald-400 mt-0.5 font-medium">+100% Target Met</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
          <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] font-mono uppercase">
            <Zap className="w-3 h-3 text-[#00F0FF]" /> Attention Index
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">98.4%</div>
          <div className="text-[10px] text-cyan-400 mt-0.5 font-medium">Peak Alpha Resonance</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
          <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] font-mono uppercase">
            <Shield className="w-3 h-3 text-emerald-400" /> Alerts Silenced
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">22</div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Zero Breaches</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
          <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] font-mono uppercase">
            <Heart className="w-3 h-3 text-rose-400" /> Avg Heart Rate
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">62 BPM</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Calm / Steady</div>
        </div>
      </div>

      {/* SVG Attention Curve Graph */}
      <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 mb-4">
        <div className="text-[10px] font-mono uppercase text-neutral-400 mb-1">
          FLOW DEPTH TELEMETRY
        </div>
        <div className="h-16 w-full relative">
          <svg className="w-full h-full" viewBox="0 0 300 60" preserveAspectRatio="none">
            <defs>
              <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,50 Q40,45 80,20 T160,15 T240,10 T300,12 L300,60 L0,60 Z"
              fill="url(#curveGrad)"
            />
            <path
              d="M0,50 Q40,45 80,20 T160,15 T240,10 T300,12"
              fill="none"
              stroke="#00F0FF"
              strokeWidth="2.5"
            />
          </svg>
        </div>
      </div>

      {/* Return to Today Primary Button */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onReturnToToday}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00c6d4] via-[#00F0FF] to-[#38bdf8] text-neutral-950 font-semibold text-sm tracking-wide shadow-[0_0_24px_rgba(0,240,255,0.6),inset_0_1px_0_rgba(255,255,255,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <span>Return to Today's Tasks</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
