import React, { useState } from 'react'
import { Search, X, Mic, Calendar, Flag, Sparkles } from 'lucide-react'

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectResult?: (text: string) => void
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-xl p-5 text-white select-none animate-ios-fade-spring">
      {/* Top Search Bar */}
      <div className="flex items-center gap-3 pt-6 pb-4 border-b border-white/10">
        <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/[0.08] border border-white/15 focus-within:border-[#00F0FF]/60 transition-colors">
          <Search className="w-4 h-4 text-neutral-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tasks, tags, audio labs, AI..."
            className="w-full bg-transparent text-sm text-white placeholder:text-neutral-500 outline-none"
          />
          <Mic className="w-4 h-4 text-[#00F0FF] cursor-pointer hover:scale-110 transition-transform" />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Quick Filter Chips */}
      <div className="flex items-center gap-1.5 py-3 overflow-x-auto scrollbar-none">
        <button className="px-3 py-1 rounded-full text-xs font-medium bg-[#00F0FF]/15 text-[#7dd3fc] border border-[#00F0FF]/30 whitespace-nowrap">
          High Priority
        </button>
        <button className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/10 hover:bg-white/15 whitespace-nowrap">
          Due Today
        </button>
        <button className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/10 hover:bg-white/15 whitespace-nowrap">
          #Design
        </button>
        <button className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/10 hover:bg-white/15 whitespace-nowrap">
          #AudioLabs
        </button>
      </div>

      {/* Search Results List */}
      <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
        {/* Recent Tasks */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
            RECENT TASKS
          </div>
          <div className="space-y-2">
            <div
              onClick={() => {
                if (onSelectResult) onSelectResult('Finalize Apple 2026 Liquid Glass')
                onClose()
              }}
              className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] cursor-pointer border border-white/10 transition-all"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-white">
                <span>Finalize Apple 2026 Liquid Glass spec</span>
                <span className="text-[10px] text-rose-400 font-mono">HIGH PRIORITY</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">Figma Design System • 3/4 subtasks</div>
            </div>

            <div
              onClick={() => {
                if (onSelectResult) onSelectResult('Review spatial sound design')
                onClose()
              }}
              className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] cursor-pointer border border-white/10 transition-all"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-white">
                <span>Review spatial sound design for Todobar micro-haptics</span>
                <span className="text-[10px] text-blue-400 font-mono">MEDIUM</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">Audio Labs • Haptics v2</div>
            </div>
          </div>
        </div>

        {/* AI Suggested Queries */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#00F0FF]" />
            <span>AI NATURAL LANGUAGE ACTIONS</span>
          </div>
          <div className="space-y-1.5">
            <div className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] text-xs text-neutral-300 border border-white/5 cursor-pointer">
              "Show tasks with unresolved subtasks"
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] text-xs text-neutral-300 border border-white/5 cursor-pointer">
              "Start 45m Pomodoro sprint on Figma Design System"
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
