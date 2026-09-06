import React from 'react'
import { Sun, Target, CheckCircle, Volume2, Plus } from 'lucide-react'

export type TodobarTab = 'today' | 'focus' | 'done'

interface TodobarDockProps {
  activeTab: TodobarTab
  onSelectTab: (tab: TodobarTab) => void
  onQuickAdd: () => void
  isAudioActive?: boolean
  onToggleAudio?: () => void
}

export const TodobarDock: React.FC<TodobarDockProps> = ({
  activeTab,
  onSelectTab,
  onQuickAdd,
  isAudioActive = true,
  onToggleAudio,
}) => {
  return (
    <div className="fixed bottom-6 inset-x-0 flex items-center justify-center gap-3 px-4 z-40 pointer-events-none select-none">
      {/* Main Glass Navigation Capsule */}
      <nav
        aria-label="Todobar Dock"
        className="pointer-events-auto flex items-center p-1.5 rounded-[26px] bg-[#0c081e]/80 backdrop-blur-[36px] border border-white/16 shadow-[0_20px_50px_rgba(0,0,0,0.65),inset_0_1.5px_0_rgba(255,255,255,0.3)] transition-all duration-300"
      >
        {/* TODAY Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('today')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[20px] text-xs font-semibold tracking-wider transition-all duration-300 ${
            activeTab === 'today'
              ? 'bg-gradient-to-b from-white/24 to-white/10 text-white border border-white/35 shadow-[0_4px_16px_rgba(0,0,0,0.4),0_0_14px_rgba(0,240,255,0.35),inset_0_1px_1px_rgba(255,255,255,0.5)]'
              : 'text-neutral-400 hover:text-white/90 hover:bg-white/5 border border-transparent'
          }`}
        >
          <Sun className={`w-3.5 h-3.5 ${activeTab === 'today' ? 'text-[#00F0FF]' : 'text-neutral-400'}`} />
          <span className="uppercase text-[11px] font-mono">TODAY</span>
        </button>

        {/* FOCUS Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('focus')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[20px] text-xs font-semibold tracking-wider transition-all duration-300 ${
            activeTab === 'focus'
              ? 'bg-gradient-to-b from-white/24 to-white/10 text-white border border-white/35 shadow-[0_4px_16px_rgba(0,0,0,0.4),0_0_14px_rgba(0,240,255,0.35),inset_0_1px_1px_rgba(255,255,255,0.5)]'
              : 'text-neutral-400 hover:text-white/90 hover:bg-white/5 border border-transparent'
          }`}
        >
          <Target className={`w-3.5 h-3.5 ${activeTab === 'focus' ? 'text-[#00F0FF]' : 'text-neutral-400'}`} />
          <span className="uppercase text-[11px] font-mono">FOCUS</span>
        </button>

        {/* DONE Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('done')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[20px] text-xs font-semibold tracking-wider transition-all duration-300 ${
            activeTab === 'done'
              ? 'bg-gradient-to-b from-white/24 to-white/10 text-white border border-white/35 shadow-[0_4px_16px_rgba(0,0,0,0.4),0_0_14px_rgba(0,240,255,0.35),inset_0_1px_1px_rgba(255,255,255,0.5)]'
              : 'text-neutral-400 hover:text-white/90 hover:bg-white/5 border border-transparent'
          }`}
        >
          <CheckCircle className={`w-3.5 h-3.5 ${activeTab === 'done' ? 'text-[#00F0FF]' : 'text-neutral-400'}`} />
          <span className="uppercase text-[11px] font-mono">DONE</span>
        </button>

        {/* Audio / Waveform Visualizer Button */}
        <button
          type="button"
          onClick={onToggleAudio}
          title="Toggle Spatial Binaural Soundscape"
          className="ml-1 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/8 transition-colors flex items-center justify-center"
        >
          <div className="flex items-end gap-[2px] h-3 px-1">
            <span className={`w-[2px] bg-[#00F0FF] rounded-full transition-all ${isAudioActive ? 'animate-[pulse_0.8s_ease-in-out_infinite] h-2.5 shadow-[0_0_6px_#00F0FF]' : 'h-1.5 opacity-40'}`} />
            <span className={`w-[2px] bg-[#00F0FF] rounded-full transition-all ${isAudioActive ? 'animate-[pulse_1.1s_ease-in-out_infinite] h-3.5 shadow-[0_0_6px_#00F0FF]' : 'h-2 opacity-40'}`} />
            <span className={`w-[2px] bg-[#00F0FF] rounded-full transition-all ${isAudioActive ? 'animate-[pulse_0.6s_ease-in-out_infinite] h-2 shadow-[0_0_6px_#00F0FF]' : 'h-1 opacity-40'}`} />
          </div>
        </button>
      </nav>

      {/* Floating Cyan Quick Action Button */}
      <button
        type="button"
        onClick={onQuickAdd}
        title="Quick Add Task (NLP & Dictation)"
        className="pointer-events-auto flex items-center justify-center w-12 h-12 rounded-[22px] bg-gradient-to-tr from-[#00c6d4] via-[#00F0FF] to-[#38bdf8] text-neutral-950 shadow-[0_0_22px_rgba(0,240,255,0.7),inset_0_1.5px_0_rgba(255,255,255,0.7),0_8px_20px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <Plus className="w-6 h-6 stroke-[2.8]" />
      </button>
    </div>
  )
}
