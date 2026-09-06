import React, { useState } from 'react'
import { X, Play, Wind, Radio, Mic, Heart, Shield, Check } from 'lucide-react'

interface MiniBreakModalProps {
  isOpen: boolean
  onResumeSprint: () => void
  onEndEarly: () => void
}

export const MiniBreakModal: React.FC<MiniBreakModalProps> = ({
  isOpen,
  onResumeSprint,
  onEndEarly,
}) => {
  const [selectedCadence, setSelectedCadence] = useState<'eye' | 'bio' | 'stretch'>('eye')
  const [isSoundscapeOn, setIsSoundscapeOn] = useState(true)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 transition-all">
      {/* Modal Container calibrated to iPhone portrait */}
      <div className="w-full max-w-[390px] max-h-[85vh] rounded-[32px] bg-[#090a14]/95 border border-white/20 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.9),inset_0_1.5px_0_rgba(255,255,255,0.3)] overflow-y-auto scrollbar-thin text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
              SPRINT 3 SUSPENDED
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 text-[#00F0FF] border border-cyan-500/30">
              FLOW PRESERVED
            </span>
          </div>
          <button
            type="button"
            onClick={onResumeSprint}
            className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sprint Telemetry Dial Card */}
        <div className="mt-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3">
          {/* Mini Progress Dial */}
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
              <circle
                cx="30"
                cy="30"
                r="24"
                fill="none"
                stroke="#00F0FF"
                strokeWidth="4"
                strokeDasharray={2 * Math.PI * 24}
                strokeDashoffset={2 * Math.PI * 24 * (1 - 0.85)}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xs font-mono font-bold text-white">85%</span>
          </div>
          <div>
            <div className="text-[10px] font-mono text-neutral-400">Sprint 3 Target: 45:00 • Paused at: 28:17</div>
            <div className="text-xs font-semibold text-white mt-0.5">Review spatial sound design...</div>
            <div className="text-[10px] text-[#00F0FF] font-mono mt-0.5">Neural Depth: 94% Locked</div>
          </div>
        </div>

        {/* Mini-Break Cadence Selector */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-2">
            <span>MINI-BREAK CADENCE</span>
            <span className="text-cyan-400">Auto-resumes on timer</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCadence('eye')}
              className={`p-2 rounded-xl text-center border transition-all ${
                selectedCadence === 'eye'
                  ? 'bg-[#00F0FF]/15 border-[#00F0FF]/50 text-white shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                  : 'bg-white/[0.03] border-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              <div className="text-[10px] font-semibold">Quick Eye Reset</div>
              <div className="text-xs font-bold font-mono text-[#00F0FF] mt-0.5">2 min</div>
              <div className="text-[9px] text-neutral-400">20-20-20 Rule</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCadence('bio')}
              className={`p-2 rounded-xl text-center border transition-all ${
                selectedCadence === 'bio'
                  ? 'bg-[#00F0FF]/15 border-[#00F0FF]/50 text-white shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                  : 'bg-white/[0.03] border-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              <div className="text-[10px] font-semibold">Bio Reset</div>
              <div className="text-xs font-bold font-mono text-[#00F0FF] mt-0.5">5 min</div>
              <div className="text-[9px] text-neutral-400">Focus 4-7-8</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCadence('stretch')}
              className={`p-2 rounded-xl text-center border transition-all ${
                selectedCadence === 'stretch'
                  ? 'bg-[#00F0FF]/15 border-[#00F0FF]/50 text-white shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                  : 'bg-white/[0.03] border-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              <div className="text-[10px] font-semibold">Physical Stretch</div>
              <div className="text-xs font-bold font-mono text-[#00F0FF] mt-0.5">8 min</div>
              <div className="text-[9px] text-neutral-400">Hydrate & Walk</div>
            </button>
          </div>
        </div>

        {/* Box Breathing Pacer (30s) */}
        <div className="mt-3.5 p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-cyan-500/20 text-[#00F0FF]">
              <Wind className="w-4 h-4 animate-[spin_4s_linear_infinite]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Box Breath Cycle (30s)</div>
              <div className="text-[10px] text-neutral-400">Slow exhale lowers prefrontal friction</div>
            </div>
          </div>
          <button
            type="button"
            className="px-3 py-1 rounded-full text-xs font-medium bg-[#00F0FF]/20 text-[#7dd3fc] border border-[#00F0FF]/40 hover:bg-[#00F0FF]/30 transition-colors"
          >
            Breathe
          </button>
        </div>

        {/* Soundscape Soft Recovery Alpha Toggle */}
        <div className="mt-2.5 p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-[#00F0FF]" />
            <div>
              <div className="text-xs font-semibold text-white">Soundscape: Soft Recovery Alpha</div>
              <div className="text-[10px] text-neutral-400">Switching 40Hz Gamma → 432Hz Calm Waves</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSoundscapeOn(!isSoundscapeOn)}
            className={`w-10 h-6 rounded-full p-0.5 transition-colors ${
              isSoundscapeOn ? 'bg-[#00F0FF]' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-black shadow-md transition-transform ${
                isSoundscapeOn ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Stray Thought / Blocker Dictation */}
        <div className="mt-2.5 p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-white">Park Stray Thought / Blocker</div>
            <div className="text-[10px] text-neutral-400">Voice dictation saves to task backlog</div>
          </div>
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs text-neutral-200 border border-white/10 transition-colors"
          >
            <Mic className="w-3 h-3 text-[#00F0FF]" />
            <span>Record</span>
          </button>
        </div>

        {/* Biometrics */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <div>
              <div className="text-[9px] font-mono text-neutral-400 uppercase">Heart Rate</div>
              <div className="text-xs font-semibold font-mono text-white">61 BPM Stabilized</div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <div>
              <div className="text-[9px] font-mono text-neutral-400 uppercase">Shield Status</div>
              <div className="text-xs font-semibold font-mono text-white">27 Silenced Active</div>
            </div>
          </div>
        </div>

        {/* Primary CTA: Resume Sprint */}
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={onResumeSprint}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00c6d4] via-[#00F0FF] to-[#38bdf8] text-neutral-950 font-semibold text-sm tracking-wide shadow-[0_0_24px_rgba(0,240,255,0.6),inset_0_1px_0_rgba(255,255,255,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume Sprint 3 (28:17)</span>
          </button>

          <div className="flex items-center justify-center gap-4 mt-1">
            <button
              type="button"
              onClick={onResumeSprint}
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              ✓ Mark Sprint Done
            </button>
            <button
              type="button"
              onClick={onEndEarly}
              className="text-xs text-neutral-500 hover:text-rose-400 transition-colors"
            >
              ✕ End Sprint 3 Early
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
