import React, { useState } from 'react'
import { Sparkles, ShieldCheck, Cpu, Eye, EyeOff } from 'lucide-react'

interface DesktopSimulatorProps {
  backdropImage?: string
  backdropBlur?: number
  dockEdge?: string
}

export const DesktopSimulator: React.FC<DesktopSimulatorProps> = ({
  backdropImage,
  backdropBlur = 0,
}) => {
  const [showMockup, setShowMockup] = useState(true)

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Background wallpaper layer */}
      {backdropImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-500 scale-105"
          style={{
            backgroundImage: `url(${backdropImage})`,
            filter: backdropBlur ? `blur(${backdropBlur}px)` : 'none',
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      )}

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px]" />

      {/* Toggle Simulator Card visibility in bottom-left corner */}
      <div className="absolute bottom-5 left-5 z-10 pointer-events-auto">
        <button
          onClick={() => setShowMockup(prev => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-mono border border-slate-700/80 backdrop-blur-md shadow-xl transition-all cursor-pointer"
        >
          {showMockup ? <EyeOff className="w-3.5 h-3.5 text-sky-400" /> : <Eye className="w-3.5 h-3.5 text-sky-400" />}
          <span>{showMockup ? 'Hide Info Card' : 'Show Workspace Card'}</span>
        </button>
      </div>

      {/* Simulated Developer Workspace Mockup Window (Positioned on the LEFT so it never overlaps right sidebar) */}
      {showMockup && (
        <div className="absolute left-8 top-12 max-w-md w-full p-5 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-slate-700/80 shadow-2xl flex flex-col gap-3.5 text-slate-200 pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
              <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              <span className="text-xs font-mono text-slate-300 ml-2 font-semibold">todobar-desktop-preview</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-sky-400" /> Tauri v2</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Local-First</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 font-mono text-xs">
            <p className="text-sky-400 font-bold text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Welcome to Todobar Pro
            </p>
            <p className="text-slate-300 leading-relaxed text-[11.5px]">
              A high-performance dockable desktop todo sidebar designed to stay out of your way until you need it.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-1 text-[11px] text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <span className="text-white font-bold block mb-0.5">⚡ Dockable Handle</span>
                Drag handle along edge or click to toggle.
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <span className="text-white font-bold block mb-0.5">⌨️ Hotkey</span>
                Press <kbd className="px-1 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono font-bold">Alt + T</kbd> to toggle.
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <span className="text-white font-bold block mb-0.5">⏱️ Focus Timer</span>
                Pomodoro timer linked to active tasks.
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <span className="text-white font-bold block mb-0.5">🎨 12 Themes</span>
                Curated dark and light color palettes.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
