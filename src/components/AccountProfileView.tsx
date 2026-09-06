import React, { useState } from 'react'
import { ArrowLeft, Flame, Clock, Zap, Watch, Headphones, Monitor, Settings } from 'lucide-react'

interface AccountProfileViewProps {
  onBack: () => void
}

export const AccountProfileView: React.FC<AccountProfileViewProps> = ({ onBack }) => {
  const [healthKitSync, setHealthKitSync] = useState(true)
  const [spatialAudio, setSpatialAudio] = useState(true)

  return (
    <div className="w-full h-full flex flex-col px-4 sm:px-5 pt-[max(env(safe-area-inset-top,14px),14px)] pb-36 text-white select-none overflow-y-auto scrollbar-thin max-w-[430px] mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold tracking-wider text-neutral-300 transition-colors border border-white/15"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>TODAY</span>
        </button>
        <span className="text-xs font-mono uppercase text-white font-semibold">PROFILE & TELEMETRY</span>
        <button className="p-1.5 rounded-full bg-white/10 hover:bg-white/15 text-neutral-300">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* User Identity Glass Card */}
      <div className="my-4 p-4 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl flex items-center gap-3.5">
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00c6d4] to-[#38bdf8] p-0.5 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
          <div className="w-full h-full rounded-[14px] bg-[#0c0d18] flex items-center justify-center font-bold font-mono text-lg text-[#00F0FF]">
            AV
          </div>
        </div>
        <div>
          <div className="text-base font-bold text-white">Alexander Vance</div>
          <div className="text-xs text-neutral-400">Senior Product Architect</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-[#00F0FF]/15 text-[#7dd3fc] border border-[#00F0FF]/30 font-semibold">
              PRO SUBSCRIBER
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">Deep Flow Active •</span>
          </div>
        </div>
      </div>

      {/* Lifetime Telemetry Metrics Grid */}
      <div className="mb-4">
        <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
          LIFETIME FOCUS TELEMETRY
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
            <Flame className="w-4 h-4 text-amber-400 mx-auto" />
            <div className="text-base font-bold font-mono text-white mt-1">12 Days</div>
            <div className="text-[9px] text-neutral-400">Flow Streak</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
            <Clock className="w-4 h-4 text-[#00F0FF] mx-auto" />
            <div className="text-base font-bold font-mono text-white mt-1">142h</div>
            <div className="text-[9px] text-neutral-400">Focus Time</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
            <Zap className="w-4 h-4 text-emerald-400 mx-auto" />
            <div className="text-base font-bold font-mono text-white mt-1">98.4%</div>
            <div className="text-[9px] text-neutral-400">Avg Attention</div>
          </div>
        </div>
      </div>

      {/* Integrations & Sensory Systems */}
      <div className="space-y-2.5 flex-1">
        <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
          SENSORY & HARDWARE INTEGRATIONS
        </div>

        {/* Apple Watch */}
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Watch className="w-4 h-4 text-[#00F0FF]" />
            <div>
              <div className="text-xs font-semibold text-white">Apple Watch HealthKit Sync</div>
              <div className="text-[10px] text-neutral-400">Live HRV & Resting HR Biometrics</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setHealthKitSync(!healthKitSync)}
            className={`w-10 h-6 rounded-full p-0.5 transition-colors ${
              healthKitSync ? 'bg-[#00F0FF]' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-black shadow-md transition-transform ${
                healthKitSync ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Spatial Audio */}
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Headphones className="w-4 h-4 text-[#00F0FF]" />
            <div>
              <div className="text-xs font-semibold text-white">Spatial Audio & Binaural Engine</div>
              <div className="text-[10px] text-neutral-400">Dolby Atmos Dynamic Head Tracking</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSpatialAudio(!spatialAudio)}
            className={`w-10 h-6 rounded-full p-0.5 transition-colors ${
              spatialAudio ? 'bg-[#00F0FF]' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-black shadow-md transition-transform ${
                spatialAudio ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Desktop Sync */}
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-xs font-semibold text-white">Todobar Desktop & NPM Sync</div>
              <div className="text-[10px] text-emerald-400 font-mono">Connected • Port 10086</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            ACTIVE
          </span>
        </div>
      </div>
    </div>
  )
}
