import React from 'react'
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Headphones,
  Heart,
  Shield,
  Check,
  CheckCircle2,
} from 'lucide-react'
import { TodayTask } from '../types'

interface FocusModeViewProps {
  onBack: () => void
  onComplete: () => void
  secondsRemaining: number
  totalSeconds: number
  isRunning: boolean
  onTogglePlayPause: () => void
  onReset: () => void
  onAdjust: (deltaMinutes: number) => void
  activeTask?: TodayTask
  onToggleTask?: (id: string) => void
}

export const FocusModeView: React.FC<FocusModeViewProps> = ({
  onBack,
  onComplete,
  secondsRemaining,
  totalSeconds,
  isRunning,
  onTogglePlayPause,
  onReset,
  onAdjust,
  activeTask,
  onToggleTask,
}) => {
  const mins = Math.floor(secondsRemaining / 60)
  const secs = secondsRemaining % 60
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((totalSeconds - secondsRemaining) / totalSeconds) * 100))
  )

  const taskTitle = activeTask?.title || 'Finalize Apple 2026 Liquid Glass Spec & Design Tokens'
  const taskCategory = activeTask?.category || 'FIGMA DESIGN SYSTEM'
  const isUrgent = activeTask?.priority === 'focus'

  return (
    <div className="w-full h-full flex flex-col px-4 sm:px-5 pt-[max(env(safe-area-inset-top,14px),14px)] pb-36 text-white select-none overflow-y-auto scrollbar-thin max-w-[430px] mx-auto bg-gradient-to-b from-[#0a0e20] via-[#060916] to-[#030610]">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold tracking-wider text-neutral-300 transition-colors border border-white/15"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>TODAY</span>
        </button>
        <span
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-wider uppercase border transition-all ${
            isRunning
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isRunning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
            }`}
          />
          {isRunning ? 'FLOW STATE • SPRINT 2/4' : 'SPRINT PAUSED'}
        </span>
      </div>

      {/* Task Context Title */}
      <div className="mt-4 p-4 rounded-2xl bg-white/[0.05] border border-white/12 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between text-[11px] font-mono mb-1 text-neutral-400">
          <span className="text-[#00F0FF] uppercase tracking-wide">{taskCategory}</span>
          <span
            className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
              isUrgent ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-cyan-500/20 text-cyan-300'
            }`}
          >
            {isUrgent ? 'URGENT • HIGH' : 'IN FOCUS'}
          </span>
        </div>
        <h2 className="text-[15px] font-bold text-white leading-snug">
          {taskTitle}
        </h2>
        {activeTask?.subtasksCount && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-neutral-400 font-mono">{activeTask.subtasksCount} resolved</span>
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00F0FF] to-emerald-400 rounded-full shadow-[0_0_8px_#00F0FF]"
                style={{ width: `${activeTask.subtaskProgress || 75}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Hero Circular Countdown Dial */}
      <div className="my-6 flex flex-col items-center justify-center relative">
        <div className="relative w-56 h-56 flex items-center justify-center">
          {/* Circular SVG Ring */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            {/* Background Track */}
            <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            {/* Progress Arc */}
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke={isRunning ? '#00F0FF' : '#f59e0b'}
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 85}
              strokeDashoffset={2 * Math.PI * 85 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              className="transition-all duration-700 ease-linear shadow-[0_0_20px_#00F0FF]"
              style={{
                filter: isRunning
                  ? 'drop-shadow(0 0 12px rgba(0,240,255,0.7))'
                  : 'drop-shadow(0 0 12px rgba(245,158,11,0.7))',
              }}
            />
          </svg>

          {/* Time Center */}
          <div className="absolute flex flex-col items-center text-center pointer-events-none">
            <span
              className={`text-4xl font-mono font-bold tracking-tight text-white ${
                isRunning ? 'drop-shadow-[0_0_14px_rgba(0,240,255,0.6)]' : 'drop-shadow-[0_0_14px_rgba(245,158,11,0.6)]'
              }`}
            >
              {timeStr}
            </span>
            <span className="text-[10px] font-mono tracking-wider uppercase text-neutral-400 mt-1">
              {isRunning ? 'REMAINING IN SPRINT' : 'SPRINT IS PAUSED'}
            </span>
            <span
              className={`text-[11px] font-mono mt-0.5 font-medium ${
                isRunning ? 'text-[#00F0FF]' : 'text-amber-300'
              }`}
            >
              {Math.floor(totalSeconds / 60)}:00 Target • Flow 98%
            </span>
          </div>
        </div>

        {/* Quick Adjustment Nudges */}
        <div className="flex items-center gap-3 mt-3">
          <button
            type="button"
            onClick={() => onAdjust(-5)}
            className="px-3.5 py-1.5 rounded-full text-xs font-mono bg-white/10 hover:bg-white/18 text-neutral-300 transition-colors border border-white/10 active:scale-95 shadow-sm"
            title="Subtract 5 minutes"
          >
            -5m
          </button>
          <span className="text-[11px] font-mono text-neutral-400">adjust sprint</span>
          <button
            type="button"
            onClick={() => onAdjust(5)}
            className="px-3.5 py-1.5 rounded-full text-xs font-mono bg-white/10 hover:bg-white/18 text-neutral-300 transition-colors border border-white/10 active:scale-95 shadow-sm"
            title="Add 5 minutes"
          >
            +5m
          </button>
        </div>
      </div>

      {/* Dial Controls (Reset, Pause/Resume, Skip/Complete) */}
      <div className="flex items-center justify-center gap-4 mb-5">
        <button
          type="button"
          onClick={onReset}
          className="p-3.5 rounded-full bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white transition-all border border-white/15 active:scale-90 shadow-md"
          title="Reset Sprint Timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Primary Toggle Play / Pause Button */}
        <button
          type="button"
          onClick={onTogglePlayPause}
          className={`flex items-center gap-2 px-7 py-3.5 rounded-full text-neutral-950 font-bold text-sm tracking-wide hover:scale-105 active:scale-95 transition-all ${
            isRunning
              ? 'bg-gradient-to-r from-[#00c6d4] via-[#00F0FF] to-[#38bdf8] shadow-[0_0_24px_rgba(0,240,255,0.65),inset_0_1px_0_rgba(255,255,255,0.7)]'
              : 'bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#00F0FF] shadow-[0_0_24px_rgba(52,211,153,0.65),inset_0_1px_0_rgba(255,255,255,0.7)]'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause Focus</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Resume Focus</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onComplete}
          className="p-3.5 rounded-full bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white transition-all border border-white/15 active:scale-90 shadow-md"
          title="Complete Sprint"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Spatial Audio & Soundscape Deck */}
      <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md mb-3">
        <div className="flex items-center justify-between text-[11px] font-mono mb-2 text-neutral-400">
          <div className="flex items-center gap-1.5 text-white/90 font-medium">
            <Headphones className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>SPATIAL AUDIO & SOUNDSCAPE</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] bg-cyan-950/50 text-[#7dd3fc] border border-cyan-500/30">
            Head Tracked
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-white">Binaural Alpha Waves 432Hz</div>
            <div className="text-[10px] text-neutral-400">Biometric Resonance • Deep Attention</div>
          </div>
          {/* Animated Waveform */}
          <div className="flex items-end gap-[3px] h-4">
            {[10, 16, 8, 18, 12, 14].map((h, i) => (
              <span
                key={i}
                style={{ height: `${h}px` }}
                className={`w-[2px] bg-[#00F0FF] rounded-full shadow-[0_0_4px_#00F0FF] ${
                  isRunning ? 'animate-pulse' : 'opacity-40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Live Biometrics & Shield Telemetry */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2.5">
          <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20" />
          <div>
            <div className="text-[10px] font-mono uppercase text-neutral-400">Resting HR</div>
            <div className="text-xs font-semibold text-white font-mono">60 BPM</div>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
          <div>
            <div className="text-[10px] font-mono uppercase text-neutral-400">Shield Status</div>
            <div className="text-xs font-semibold text-white font-mono">27 Silenced</div>
          </div>
        </div>
      </div>
    </div>
  )
}
