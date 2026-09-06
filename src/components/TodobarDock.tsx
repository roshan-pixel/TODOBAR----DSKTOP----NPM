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
    <div className="fixed inset-x-0 bottom-6 flex items-center justify-between px-5 z-40 pointer-events-none select-none max-w-[430px] mx-auto">
      {/* Main Glass Navigation Capsule */}
      <nav
        aria-label="Todobar Dock"
        className="pointer-events-auto flex-1 flex items-center justify-around gap-1 p-1.5 mr-2.5 rounded-[28px] bg-[#0c1026]/90 backdrop-blur-[45px] border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.75),inset_0_1.5px_0_rgba(255,255,255,0.35)] transition-all duration-300"
      >
        {/* TODAY Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('today')}
          className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-[22px] text-xs font-bold tracking-wide transition-all duration-300 ${
            activeTab === 'today'
              ? 'bg-gradient-to-b from-white/28 to-white/12 text-white border border-white/40 shadow-[0_4px_16px_rgba(0,0,0,0.4),0_0_16px_rgba(0,240,255,0.45),inset_0_1px_1px_rgba(255,255,255,0.6)]'
              : 'text-neutral-400 hover:text-white/90 hover:bg-white/5 border border-transparent'
          }`}
        >
          <Sun className={`w-4 h-4 shrink-0 ${activeTab === 'today' ? 'text-[#00F0FF]' : 'text-neutral-400'}`} />
          <span>TODAY</span>
        </button>

        {/* FOCUS Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('focus')}
          className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-[22px] text-xs font-bold tracking-wide transition-all duration-300 ${
            activeTab === 'focus'
              ? 'bg-gradient-to-b from-white/28 to-white/12 text-white border border-white/40 shadow-[0_4px_16px_rgba(0,0,0,0.4),0_0_16px_rgba(0,240,255,0.45),inset_0_1px_1px_rgba(255,255,255,0.6)]'
              : 'text-neutral-400 hover:text-white/90 hover:bg-white/5 border border-transparent'
          }`}
        >
          <Target className={`w-4 h-4 shrink-0 ${activeTab === 'focus' ? 'text-[#00F0FF]' : 'text-neutral-400'}`} />
          <span>FOCUS</span>
        </button>

        {/* DONE Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('done')}
          className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-[22px] text-xs font-bold tracking-wide transition-all duration-300 ${
            activeTab === 'done'
              ? 'bg-gradient-to-b from-white/28 to-white/12 text-white border border-white/40 shadow-[0_4px_16px_rgba(0,0,0,0.4),0_0_16px_rgba(0,240,255,0.45),inset_0_1px_1px_rgba(255,255,255,0.6)]'
              : 'text-neutral-400 hover:text-white/90 hover:bg-white/5 border border-transparent'
          }`}
        >
          <CheckCircle className={`w-4 h-4 shrink-0 ${activeTab === 'done' ? 'text-[#00F0FF]' : 'text-neutral-400'}`} />
          <span>DONE</span>
        </button>

        {/* Audio / Waveform Visualizer Button */}
        <button
          type="button"
          onClick={onToggleAudio}
          title="Toggle Spatial Binaural Soundscape"
          className="shrink-0 p-2.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/8 transition-colors flex items-center justify-center"
        >
          <div className="flex items-end gap-[2px] h-3.5 px-0.5">
            <span className={`w-[2px] bg-[#00F0FF] rounded-full transition-all ${isAudioActive ? 'animate-[pulse_0.8s_ease-in-out_infinite] h-3 shadow-[0_0_6px_#00F0FF]' : 'h-1.5 opacity-40'}`} />
            <span className={`w-[2px] bg-[#00F0FF] rounded-full transition-all ${isAudioActive ? 'animate-[pulse_1.1s_ease-in-out_infinite] h-4 shadow-[0_0_6px_#00F0FF]' : 'h-2 opacity-40'}`} />
            <span className={`w-[2px] bg-[#00F0FF] rounded-full transition-all ${isAudioActive ? 'animate-[pulse_0.6s_ease-in-out_infinite] h-2.5 shadow-[0_0_6px_#00F0FF]' : 'h-1 opacity-40'}`} />
          </div>
        </button>
      </nav>

      {/* Floating Cyan Quick Action Button */}
      <button
        type="button"
        onClick={onQuickAdd}
        title="Quick Add Task (NLP & Dictation)"
        className="pointer-events-auto shrink-0 flex items-center justify-center w-[52px] h-[52px] rounded-[24px] bg-gradient-to-tr from-[#00c6d4] via-[#00F0FF] to-[#38bdf8] text-neutral-950 shadow-[0_0_28px_rgba(0,240,255,0.75),inset_0_1.5px_0_rgba(255,255,255,0.8),0_10px_25px_rgba(0,0,0,0.6)] hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <Plus className="w-7 h-7 stroke-[3]" />
      </button>
    </div>
  )
}
