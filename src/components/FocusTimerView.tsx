import React, { useEffect, useState } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react'
import { FocusTimerState, FocusTimerMode, Task } from '../types'
import { LiquidGlassIcon } from './LiquidGlassIcon'
import { sounds } from '../services/audio'

interface FocusTimerViewProps {
  tasks: Task[]
  timerState: FocusTimerState
  onUpdateTimer: (patch: Partial<FocusTimerState>) => void
  onCompleteTask: (taskId: string) => void
  playSounds: boolean
}

export const FocusTimerView: React.FC<FocusTimerViewProps> = ({
  tasks,
  timerState,
  onUpdateTimer,
  onCompleteTask,
  playSounds,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>(timerState.activeTaskId || '')

  const {
    mode,
    durationMinutes,
    secondsRemaining,
    isRunning,
    completedSessions,
    activeTaskId,
  } = timerState

  // Tick timer
  useEffect(() => {
    let interval: any = null
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        onUpdateTimer({ secondsRemaining: secondsRemaining - 1 })
      }, 1000)
    } else if (secondsRemaining === 0 && isRunning) {
      // Session finished
      sounds.playComplete(playSounds)
      onUpdateTimer({
        isRunning: false,
        completedSessions: mode === 'focus' ? completedSessions + 1 : completedSessions,
        mode: mode === 'focus' ? 'shortBreak' : 'focus',
        durationMinutes: mode === 'focus' ? 5 : 25,
        secondsRemaining: (mode === 'focus' ? 5 : 25) * 60,
      })
    }
    return () => clearInterval(interval)
  }, [isRunning, secondsRemaining, mode, completedSessions, playSounds, onUpdateTimer])

  const toggleRunning = () => {
    sounds.playClick(playSounds)
    onUpdateTimer({ isRunning: !isRunning })
  }

  const resetTimer = () => {
    sounds.playClick(playSounds)
    onUpdateTimer({
      isRunning: false,
      secondsRemaining: durationMinutes * 60,
    })
  }

  const setMode = (newMode: FocusTimerMode, mins: number) => {
    sounds.playClick(playSounds)
    onUpdateTimer({
      mode: newMode,
      durationMinutes: mins,
      secondsRemaining: mins * 60,
      isRunning: false,
    })
  }

  const handleSelectTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    setSelectedTaskId(taskId)
    onUpdateTimer({
      activeTaskId: taskId || null,
      activeTaskTitle: task ? task.title : null,
    })
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const totalSecs = durationMinutes * 60
  const progressPercent = totalSecs > 0 ? ((totalSecs - secondsRemaining) / totalSecs) * 100 : 0

  const activeTask = tasks.find(t => t.id === activeTaskId)

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-3.5 gap-4 items-center scrollbar-thin pb-24 md:pb-6">
      {/* Header */}
      <div className="w-full flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <LiquidGlassIcon type="pomodoro" size="md" />
          <div>
            <h1 className="text-base font-extrabold text-text-primary tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              Focus Chamber
            </h1>
            <p className="text-xs text-text-muted font-semibold mt-0.5">Deep Work Session</p>
          </div>
        </div>

        {/* Completed streaks */}
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl liquid-glass-pill text-xs font-bold text-amber-300 shadow-lg">
          <LiquidGlassIcon type="focus" size="xs" />
          <span>{completedSessions} Pomodoros</span>
        </div>
      </div>

      {/* Preset Mode Segmented Control */}
      <div className="flex items-center p-1 rounded-2xl liquid-glass-control text-xs w-full max-w-sm shadow-lg">
        <button
          onClick={() => setMode('focus', 25)}
          className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mode === 'focus' && durationMinutes === 25
              ? 'bg-accent text-white shadow-lg shadow-accent/40 border border-white/30 backdrop-blur-lg scale-[1.02]'
              : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.08]'
          }`}
        >
          <LiquidGlassIcon type="focus" size="xs" />
          25m Focus
        </button>
        <button
          onClick={() => setMode('focus', 50)}
          className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mode === 'focus' && durationMinutes === 50
              ? 'bg-accent text-white shadow-lg shadow-accent/40 border border-white/30 backdrop-blur-lg scale-[1.02]'
              : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.08]'
          }`}
        >
          <LiquidGlassIcon type="sparkles" size="xs" />
          50m Deep
        </button>
        <button
          onClick={() => setMode('shortBreak', 5)}
          className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mode === 'shortBreak'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 border border-white/30 backdrop-blur-lg scale-[1.02]'
              : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.08]'
          }`}
        >
          <LiquidGlassIcon type="coffee" size="xs" />
          5m Break
        </button>
      </div>

      {/* Liquid Glass Apple Watch Circular Timer Gauge */}
      <div className="relative w-56 h-56 flex items-center justify-center my-2">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background Track */}
          <circle
            cx="50"
            cy="50"
            r="42"
            className="text-white/10 stroke-current"
            strokeWidth="6"
            fill="none"
          />
          {/* Glowing Animated Liquid Progress Arc */}
          <circle
            cx="50"
            cy="50"
            r="42"
            className="text-accent stroke-current transition-all duration-300 drop-shadow-[0_0_12px_var(--glow-color)]"
            strokeWidth="6"
            strokeDasharray={2 * Math.PI * 42}
            strokeDashoffset={2 * Math.PI * 42 * (1 - progressPercent / 100)}
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Digital Time Inside Center */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold font-mono text-text-primary tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
            {formatTime(secondsRemaining)}
          </span>
          <span className="text-xs font-extrabold uppercase tracking-widest text-text-muted mt-1">
            {mode === 'focus' ? 'Focus Session' : 'Rest & Recharge'}
          </span>
        </div>
      </div>

      {/* Play / Pause / Reset Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={resetTimer}
          title="Reset session"
          className="w-11 h-11 rounded-2xl liquid-glass-pill flex items-center justify-center text-text-secondary hover:text-text-primary hover:scale-105 transition-all cursor-pointer shadow-lg"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={toggleRunning}
          title={isRunning ? 'Pause' : 'Start'}
          className={`w-14 h-14 rounded-3xl flex items-center justify-center text-white transition-all cursor-pointer shadow-2xl hover:scale-105 active:scale-95 border border-white/40 ${
            isRunning
              ? 'bg-amber-500 shadow-amber-500/50'
              : 'bg-accent shadow-accent/60 drop-shadow-[0_0_16px_var(--glow-color)]'
          }`}
        >
          {isRunning ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
        </button>

        {activeTaskId && (
          <button
            onClick={() => {
              sounds.playComplete(playSounds)
              onCompleteTask(activeTaskId)
            }}
            title="Mark linked task complete"
            className="cursor-pointer hover:scale-105 transition-transform"
          >
            <LiquidGlassIcon type="check" size="md" isActive={true} />
          </button>
        )}
      </div>

      {/* Task Linking Card */}
      <div className="w-full p-4 rounded-3xl liquid-glass-card shadow-xl flex flex-col gap-2 mt-1">
        <span className="text-xs font-bold text-text-primary drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
          Target Objective:
        </span>
        <select
          value={selectedTaskId}
          onChange={(e) => handleSelectTask(e.target.value)}
          className="w-full text-xs font-bold bg-white/10 px-3 py-2 rounded-xl border border-white/15 text-text-primary focus:outline-none focus:border-accent cursor-pointer backdrop-blur-xl"
        >
          <option value="" className="bg-slate-900 text-white">-- Select task to focus on --</option>
          {tasks.filter(t => !t.done).map((t) => (
            <option key={t.id} value={t.id} className="bg-slate-900 text-white">
              {t.title}
            </option>
          ))}
        </select>

        {activeTask && (
          <div className="flex items-center justify-between text-xs pt-1 text-text-secondary">
            <span className="truncate max-w-[240px]">Focusing on: <strong className="text-accent">{activeTask.title}</strong></span>
          </div>
        )}
      </div>
    </div>
  )
}
