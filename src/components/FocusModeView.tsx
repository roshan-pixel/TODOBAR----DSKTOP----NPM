import React, { useRef, useState } from 'react'
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Zap,
  Target,
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
  justStartedFromTask?: boolean
}

function Particle({ delay, x, color }: { delay: number; x: number; color: string }) {
  return (
    <span
      className="absolute bottom-0 rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        width: 4,
        height: 4,
        background: color,
        boxShadow: `0 0 6px ${color}`,
        animation: `particleFloat ${1.8 + delay * 0.4}s ease-out ${delay * 0.3}s infinite`,
        opacity: 0,
      }}
    />
  )
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
  justStartedFromTask = false,
}) => {
  const mins = Math.floor(secondsRemaining / 60)
  const secs = secondsRemaining % 60
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((totalSeconds - secondsRemaining) / totalSeconds) * 100))
  )

  const taskTitle = activeTask?.title || 'Deep Work Session'
  const taskCategory = activeTask?.category || 'FOCUS SESSION'
  const isUrgent = activeTask?.priority === 'focus'

  const [sparking, setSparking] = useState(false)
  const sparkTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleToggle = () => {
    setSparking(true)
    onTogglePlayPause()
    if (sparkTimer.current) clearTimeout(sparkTimer.current)
    sparkTimer.current = setTimeout(() => setSparking(false), 700)
  }

  const particles = [
    { x: 15,  delay: 0,    color: '#00F0FF' },
    { x: 30,  delay: 1.4,  color: '#38bdf8' },
    { x: 48,  delay: 2.8,  color: '#a78bfa' },
    { x: 62,  delay: 0.7,  color: '#00F0FF' },
    { x: 78,  delay: 3.7,  color: '#34d399' },
    { x: 88,  delay: 2.1,  color: '#f472b6' },
    { x: 5,   delay: 5,    color: '#38bdf8' },
    { x: 95,  delay: 3,    color: '#a78bfa' },
  ]

  const circumference = 2 * Math.PI * 85

  return (
    <div className="w-full h-full flex flex-col select-none overflow-y-auto scrollbar-thin max-w-[430px] mx-auto relative">

      {/* Aurora Nebula Background */}
      <div
        className="absolute inset-0 pointer-events-none animate-aurora"
        style={{
          background: isRunning
            ? 'radial-gradient(ellipse 180% 100% at 50% 0%, rgba(0,240,255,0.12) 0%, rgba(99,102,241,0.08) 40%, transparent 70%), radial-gradient(ellipse 120% 80% at 80% 100%, rgba(168,85,247,0.1) 0%, transparent 60%)'
            : 'radial-gradient(ellipse 180% 100% at 50% 0%, rgba(245,158,11,0.10) 0%, rgba(239,68,68,0.06) 40%, transparent 70%)',
          backgroundSize: '200% 200%',
          zIndex: 0,
        }}
      />

      {/* Floating Particles when running */}
      {isRunning && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
          {particles.map((p, i) => <Particle key={i} {...p} />)}
        </div>
      )}

      {/* Main Content */}
      <div className="relative flex flex-col px-4 sm:px-5 pt-[max(env(safe-area-inset-top,14px),14px)] pb-36 text-white" style={{ zIndex: 2 }}>

        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold tracking-wider text-neutral-300 transition-colors border border-white/15 active:scale-95"
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
            <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            {isRunning ? 'FLOW STATE • ACTIVE' : 'SESSION PAUSED'}
          </span>
        </div>

        {/* Task Card */}
        <div
          className={`mt-4 p-4 rounded-2xl border backdrop-blur-md ${justStartedFromTask ? 'animate-task-entry' : ''} ${
            isRunning
              ? 'bg-white/[0.06] border-[#00F0FF]/25 shadow-[0_8px_24px_rgba(0,240,255,0.12),inset_0_1px_0_rgba(0,240,255,0.1)]'
              : 'bg-white/[0.05] border-white/12 shadow-[0_8px_24px_rgba(0,0,0,0.3)]'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-mono mb-1 text-neutral-400">
            <span className="text-[#00F0FF] uppercase tracking-wide flex items-center gap-1.5">
              <Target className="w-3 h-3" />
              {taskCategory}
            </span>
            <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
              isUrgent ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-cyan-500/20 text-cyan-300'
            }`}>
              {isUrgent ? 'URGENT • HIGH' : 'IN FOCUS'}
            </span>
          </div>
          <h2 className={`text-[15px] font-bold text-white leading-snug ${isRunning ? 'animate-magnetic' : ''}`}>
            {taskTitle}
          </h2>
          {activeTask?.subtasksCount && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-neutral-400 font-mono">{activeTask.subtasksCount} steps</span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00F0FF] to-emerald-400 rounded-full shadow-[0_0_8px_#00F0FF] transition-all duration-500"
                  style={{ width: `${activeTask.subtaskProgress || 75}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ═══ HERO TIMER with Orbit Rings ═══ */}
        <div className="my-6 flex flex-col items-center justify-center relative">
          <div className="relative w-64 h-64 flex items-center justify-center">

            {/* Plasma aura blob */}
            {isRunning && (
              <div
                className="absolute rounded-full animate-plasma-breath pointer-events-none"
                style={{
                  width: '140%', height: '140%',
                  background: 'conic-gradient(from 0deg, rgba(0,240,255,0.15), rgba(99,102,241,0.2), rgba(0,240,255,0.1), rgba(168,85,247,0.15), rgba(0,240,255,0.15))',
                  top: '-20%', left: '-20%', zIndex: 0,
                }}
              />
            )}

            {/* Slow outer orbit */}
            <div className="absolute animate-orbit-slow pointer-events-none" style={{ width: '118%', height: '118%', zIndex: 1 }}>
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(0,240,255,0.15)" strokeWidth="0.6" strokeDasharray="4 8" strokeLinecap="round" />
                <circle cx="50" cy="3" r="2" fill="#00F0FF" style={{ filter: 'drop-shadow(0 0 4px #00F0FF)' }} />
              </svg>
            </div>

            {/* Counter-orbit ring */}
            <div className="absolute animate-orbit-reverse pointer-events-none" style={{ width: '108%', height: '108%', zIndex: 1 }}>
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(168,85,247,0.2)" strokeWidth="0.5" strokeDasharray="2 12" strokeLinecap="round" />
                <circle cx="50" cy="3" r="1.5" fill="#a78bfa" style={{ filter: 'drop-shadow(0 0 3px #a78bfa)' }} />
                <circle cx="97" cy="50" r="1.5" fill="#f472b6" style={{ filter: 'drop-shadow(0 0 3px #f472b6)' }} />
              </svg>
            </div>

            {/* Fast inner orbit */}
            <div className="absolute animate-orbit pointer-events-none" style={{ width: '100%', height: '100%', zIndex: 1 }}>
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(52,211,153,0.12)" strokeWidth="0.4" strokeDasharray="1 20" strokeLinecap="round" />
                <circle cx="50" cy="3" r="1.2" fill="#34d399" style={{ filter: 'drop-shadow(0 0 3px #34d399)' }} />
                <circle cx="50" cy="97" r="1.2" fill="#38bdf8" style={{ filter: 'drop-shadow(0 0 3px #38bdf8)' }} />
              </svg>
            </div>

            {/* Neon pulse rings */}
            {isRunning && (
              <>
                <div className="absolute rounded-full border border-[#00F0FF]/60 animate-neon-ring" style={{ width: '80%', height: '80%', zIndex: 1 }} />
                <div className="absolute rounded-full border border-[#00F0FF]/40 animate-neon-ring-delay" style={{ width: '80%', height: '80%', zIndex: 1 }} />
                <div className="absolute rounded-full border border-[#00F0FF]/20 animate-neon-ring-delay2" style={{ width: '80%', height: '80%', zIndex: 1 }} />
              </>
            )}

            {/* Progress Arc SVG with chromatic shimmer */}
            <svg
              className={`w-full h-full -rotate-90 relative ${isRunning ? 'animate-chroma' : ''}`}
              viewBox="0 0 200 200"
              style={{ zIndex: 2 }}
            >
              <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
              <circle
                cx="100" cy="100" r="85" fill="none"
                stroke="url(#arcGradient)"
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progressPercent / 100)}
                strokeLinecap="round"
                className="transition-all duration-700 ease-linear"
              />
              <defs>
                <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor={isRunning ? '#00F0FF' : '#f59e0b'} />
                  <stop offset="50%"  stopColor={isRunning ? '#a78bfa' : '#ef4444'} />
                  <stop offset="100%" stopColor={isRunning ? '#34d399' : '#fbbf24'} />
                </linearGradient>
              </defs>
            </svg>

            {/* Time digits */}
            <div className="absolute flex flex-col items-center text-center pointer-events-none" style={{ zIndex: 3 }}>
              <span className={`text-5xl font-mono font-black tracking-tight text-white ${isRunning ? 'animate-timer-glow' : 'animate-timer-glow-amber'}`}>
                {timeStr}
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 mt-1">
                {isRunning ? 'REMAINING' : 'PAUSED'}
              </span>
              <span className={`text-[11px] font-mono mt-1 font-medium ${isRunning ? 'text-[#00F0FF]' : 'text-amber-300'}`}>
                {Math.floor(totalSeconds / 60)}:00 Target
              </span>
            </div>
          </div>

          {/* Sprint length adjust */}
          <div className="flex items-center gap-3 mt-3">
            <button type="button" onClick={() => onAdjust(-5)} className="px-3.5 py-1.5 rounded-full text-xs font-mono bg-white/10 hover:bg-white/18 text-neutral-300 transition-colors border border-white/10 active:scale-95">-5m</button>
            <span className="text-[11px] font-mono text-neutral-500">sprint length</span>
            <button type="button" onClick={() => onAdjust(5)} className="px-3.5 py-1.5 rounded-full text-xs font-mono bg-white/10 hover:bg-white/18 text-neutral-300 transition-colors border border-white/10 active:scale-95">+5m</button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-5 mb-6">
          <button type="button" onClick={onReset} className="p-3.5 rounded-full bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white transition-all border border-white/15 active:scale-90 shadow-md">
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Play/Pause with spark burst */}
          <div className="relative">
            {sparking && (
              <>
                <span className="absolute inset-0 rounded-full bg-[#00F0FF]/40 pointer-events-none" style={{ animation: 'pressRipple 0.6s ease-out forwards' }} />
                <span className="absolute inset-0 rounded-full bg-[#a78bfa]/30 pointer-events-none" style={{ animation: 'pressRipple 0.6s ease-out 0.1s forwards' }} />
                <Zap className="absolute text-[#00F0FF] pointer-events-none" style={{ width: 20, height: 20, top: -14, left: '50%', transform: 'translateX(-50%)', animation: 'sparkBurst 0.5s ease-out forwards', filter: 'drop-shadow(0 0 6px #00F0FF)' }} />
              </>
            )}
            <button
              type="button"
              onClick={handleToggle}
              className={`relative flex items-center gap-2 px-8 py-4 rounded-full text-neutral-950 font-black text-sm tracking-wide transition-all hover:scale-105 active:scale-95 overflow-hidden ${
                isRunning
                  ? 'bg-gradient-to-r from-[#00c6d4] via-[#00F0FF] to-[#38bdf8] shadow-[0_0_28px_rgba(0,240,255,0.7),0_0_60px_rgba(0,240,255,0.3),inset_0_1.5px_0_rgba(255,255,255,0.8)]'
                  : 'bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#00F0FF] shadow-[0_0_28px_rgba(52,211,153,0.7),0_0_60px_rgba(52,211,153,0.3),inset_0_1.5px_0_rgba(255,255,255,0.8)]'
              }`}
            >
              {isRunning ? <><Pause className="w-5 h-5 fill-current" /><span>Pause</span></> : <><Play className="w-5 h-5 fill-current ml-0.5" /><span>Resume</span></>}
            </button>
          </div>

          <button type="button" onClick={onComplete} className="p-3.5 rounded-full bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white transition-all border border-white/15 active:scale-90 shadow-md">
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Animated EQ Soundscape */}
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-white/80 font-medium tracking-wide">SOUNDSCAPE</span>
            <span className="text-[10px] font-mono text-[#00F0FF] bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-500/30">Binaural 432Hz</span>
          </div>
          <div className="flex items-end gap-[3px] h-8">
            {[0,1,2,3,4,5,6].map(i => (
              <span
                key={i}
                className={`rounded-full flex-1 ${
                  isRunning
                    ? `bg-gradient-to-t from-[#00F0FF] to-[#a78bfa] shadow-[0_0_4px_#00F0FF] animate-eq${i+1}`
                    : 'bg-white/20'
                }`}
                style={{ height: isRunning ? undefined : `${[8,16,10,22,12,18,8][i]}px` }}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'SPRINT',  value: '2 / 4',  color: 'text-[#00F0FF]' },
            { label: 'FLOW',    value: '98%',     color: 'text-emerald-400' },
            { label: 'SHIELD',  value: '27 off',  color: 'text-violet-400' },
          ].map(stat => (
            <div key={stat.label} className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-center">
              <div className="text-[9px] font-mono uppercase text-neutral-500 tracking-widest">{stat.label}</div>
              <div className={`text-sm font-bold font-mono mt-0.5 ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

