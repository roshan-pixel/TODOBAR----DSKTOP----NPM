import React, { useState } from 'react'
import { Search, X, Mic, Calendar, Flag, Sparkles, CheckCircle2 } from 'lucide-react'
import { TodayTask } from '../types'

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectResult?: (text: string) => void
  tasks?: TodayTask[]
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
  tasks = [],
}) => {
  const [query, setQuery] = useState('')

  if (!isOpen) return null

  const filteredTasks = query.trim()
    ? tasks.filter(
        t =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          (t.category && t.category.toLowerCase().includes(query.toLowerCase()))
      )
    : tasks.slice(0, 5)

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
            placeholder="Search tasks, categories..."
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
        <button
          type="button"
          onClick={() => setQuery('focus')}
          className="px-3 py-1 rounded-full text-xs font-medium bg-[#00F0FF]/15 text-[#7dd3fc] border border-[#00F0FF]/30 whitespace-nowrap"
        >
          High Priority
        </button>
        <button
          type="button"
          onClick={() => setQuery('work')}
          className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/10 hover:bg-white/15 whitespace-nowrap"
        >
          Work
        </button>
        <button
          type="button"
          onClick={() => setQuery('design')}
          className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/10 hover:bg-white/15 whitespace-nowrap"
        >
          Design
        </button>
      </div>

      {/* Search Results List */}
      <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
            {query.trim() ? `SEARCH RESULTS (${filteredTasks.length})` : 'TASKS'}
          </div>
          {filteredTasks.length === 0 ? (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-center text-xs text-neutral-400">
              {query.trim() ? 'No matching tasks found' : 'No tasks created yet. Tap + to add one!'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => {
                    if (onSelectResult) onSelectResult(task.title)
                    onClose()
                  }}
                  className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] cursor-pointer border border-white/10 transition-all"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-white">
                    <span className={task.done ? 'line-through text-neutral-400' : ''}>{task.title}</span>
                    <span className={`text-[10px] font-mono ${task.priority === 'focus' ? 'text-rose-400' : 'text-neutral-400'}`}>
                      {task.priorityTag || task.priority?.toUpperCase()}
                    </span>
                  </div>
                  {task.category && (
                    <div className="text-[10px] text-neutral-400 mt-1">{task.category}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Suggested Queries */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#00F0FF]" />
            <span>QUICK ACTIONS</span>
          </div>
          <div className="space-y-1.5">
            <div
              onClick={() => {
                setQuery('')
              }}
              className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] text-xs text-neutral-300 border border-white/5 cursor-pointer"
            >
              "Show all active tasks"
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
