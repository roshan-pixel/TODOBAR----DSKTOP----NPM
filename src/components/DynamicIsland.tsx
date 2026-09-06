import React from 'react'
import { Sparkles, Pause, CheckCircle2 } from 'lucide-react'

export type IslandMode = 'idle' | 'focusing' | 'paused' | 'completed'

interface DynamicIslandProps {
  mode: IslandMode
  sprintName?: string
  timeRemaining?: string
  isCompact?: boolean
  onTap?: () => void
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  mode,
  sprintName = 'Sprint 2/4',
  timeRemaining = '24:07',
  isCompact = true,
  onTap,
}) => {
  return (
    <button
      type="button"
      onClick={onTap}
      className="group relative flex items-center justify-between px-3.5 h-[30px] rounded-full bg-black/95 border border-white/12 shadow-[0_4px_20px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
      style={{
        width: isCompact ? (mode === 'idle' ? '100px' : '132px') : (mode === 'idle' ? '126px' : '196px'),
      }}
      title="Tap Dynamic Island to inspect focus session"
    >
      {/* Status Badge */}
      <div className="flex items-center gap-1.5">
        {mode === 'focusing' && (
          <>
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            </span>
            <span className="text-[10px] tracking-wider font-semibold uppercase text-emerald-400 font-mono">
              FOCUSING
            </span>
          </>
        )}

        {mode === 'paused' && (
          <>
            <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] shrink-0" />
            <span className="text-[10px] tracking-wider font-semibold uppercase text-amber-400 font-mono">
              PAUSED
            </span>
          </>
        )}

        {mode === 'completed' && (
          <>
            <CheckCircle2 className="w-3 h-3 text-[#00F0FF] shrink-0" />
            <span className="text-[10px] tracking-wider font-semibold uppercase text-[#00F0FF] font-mono">
              CONQUERED
            </span>
          </>
        )}

        {mode === 'idle' && (
          <div className="w-full flex items-center justify-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
          </div>
        )}
      </div>

      {/* Extended time/waveform when not compact */}
      {!isCompact && mode !== 'idle' && (
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-white/80 font-medium">
            {timeRemaining}
          </span>

          {mode === 'focusing' && (
            <div className="flex items-end gap-[2px] h-3">
              <span className="w-[2px] bg-[#00F0FF] rounded-full animate-[pulse_1s_ease-in-out_infinite] h-2.5 shadow-[0_0_6px_#00F0FF]" />
              <span className="w-[2px] bg-[#00F0FF] rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-3 shadow-[0_0_6px_#00F0FF]" />
              <span className="w-[2px] bg-[#00F0FF] rounded-full animate-[pulse_1.2s_ease-in-out_infinite] h-1.5 shadow-[0_0_6px_#00F0FF]" />
            </div>
          )}

          {mode === 'paused' && (
            <Pause className="w-2.5 h-2.5 text-amber-400" />
          )}
        </div>
      )}
    </button>
  )
}
