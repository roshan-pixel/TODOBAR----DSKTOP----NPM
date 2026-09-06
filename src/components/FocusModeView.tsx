import React, { useState, useEffect } from 'react'
import { ArrowLeft, Play, Pause, RotateCcw, SkipForward, Headphones, Heart, Shield, Radio } from 'lucide-react'

interface FocusModeViewProps {
  onBack: () => void
  onPause: () => void
  onComplete: () => void
}

export const FocusModeView: React.FC<FocusModeViewProps> = ({ onBack, onPause, onComplete }) => {
  const [secondsRemaining, setSecondsRemaining] = useState(24 * 60 + 7) // 24:07
  const [isRunning, setIsRunning] = useState(true)
  const totalSeconds = 45 * 60 // 45:00 target

  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          onComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning, onComplete])

  const mins = Math.floor(secondsRemaining / 60)
  const secs = secondsRemaining % 60
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  const progressPercent = Math.round(((totalSeconds - secondsRemaining) / totalSeconds) * 100)

  const handleAdjust = (deltaMins: number) => {
    setSecondsRemaining(prev => Math.max(60, prev + deltaMins * 60))
  }

  const handlePauseClick = () => {
    setIsRunning(false)
    onPause()
  }

  return (
    <div className="w-full h-full flex flex-col justify-between px-5 pt-12 pb-24 text-white select-none overflow-y-auto scrollbar-thin">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold tracking-wider text-neutral-300 transition-colors border border-white/15"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>TODAY</span>
        </button>
        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-mono tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          FLOW STATE • SPRINT 2/4
        </span>
      </div>

      {/* Task Context Title */}
      <div className="mt-4 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
        <div className="flex items-center justify-between text-[11px] font-mono mb-1 text-neutral-400">
          <span className="text-[#00F0FF]">FIGMA DESIGN SYSTEM</span>
          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold text-[10px]">
            URGENT • HIGH
          </span>
        </div>
        <h2 className="text-sm font-semibold text-white/95 leading-snug">
          Finalize Apple 2026 Liquid Glass Spec & Design Tokens
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-neutral-400">3 of 4 subtasks resolved</span>
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#00F0FF] to-emerald-400 w-3/4 rounded-full" />
          </div>
        </div>
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
              stroke="#00F0FF"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 85}
              strokeDashoffset={2 * Math.PI * 85 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000 shadow-[0_0_20px_#00F0FF]"
              style={{ filter: 'drop-shadow(0 0 10px #00F0FF)' }}
            />
          </svg>

          {/* Time Center */}
          <div className="absolute flex flex-col items-center text-center">
            <span className="text-4xl font-mono font-bold tracking-tight text-white drop-shadow-[0_0_12px_rgba(0,240,255,0.5)]">
              {timeStr}
            </span>
            <span className="text-[10px] font-mono tracking-wider uppercase text-neutral-400 mt-1">
              REMAINING IN SPRINT 2
            </span>
            <span className="text-[11px] font-mono text-[#00F0FF] mt-0.5 font-medium">
              45:00 Target • Flow 98%
            </span>
          </div>
        </div>

        {/* Quick Adjustment Nudges */}
        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            onClick={() => handleAdjust(-5)}
            className="px-3 py-1 rounded-full text-xs font-mono bg-white/10 hover:bg-white/15 text-neutral-300 transition-colors border border-white/10"
          >
            -5m
          </button>
          <button
            type="button"
            onClick={() => handleAdjust(5)}
            className="px-3 py-1 rounded-full text-xs font-mono bg-white/10 hover:bg-white/15 text-neutral-300 transition-colors border border-white/10"
          >
            +5m
          </button>
        </div>
      </div>

      {/* Dial Controls (Reset, Pause, Skip) */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          type="button"
          onClick={() => setSecondsRemaining(45 * 60)}
          className="p-3 rounded-full bg-white/10 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors border border-white/10"
          title="Reset Timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handlePauseClick}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#00c6d4] via-[#00F0FF] to-[#38bdf8] text-neutral-950 font-semibold text-sm tracking-wide shadow-[0_0_24px_rgba(0,240,255,0.6),inset_0_1px_0_rgba(255,255,255,0.7)] hover:scale-105 active:scale-95 transition-all"
        >
          <Pause className="w-4 h-4 fill-current" />
          <span>Pause Focus</span>
        </button>

        <button
          type="button"
          onClick={onComplete}
          className="p-3 rounded-full bg-white/10 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors border border-white/10"
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
                className="w-[2px] bg-[#00F0FF] rounded-full animate-pulse shadow-[0_0_4px_#00F0FF]"
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
