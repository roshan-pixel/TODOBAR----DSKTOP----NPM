import React, { useState, useEffect, useRef } from 'react'
import { Search, X, Check, Flame, Zap, Moon, Calendar, Folder } from 'lucide-react'
import { Task, CustomList } from '../types'
import { sounds } from '../services/audio'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  tasks: Task[]
  lists: CustomList[]
  onToggleTask: (id: string) => void
  playSounds: boolean
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  tasks,
  lists,
  onToggleTask,
  playSounds,
}) => {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  const filteredTasks = tasks.filter(t => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))
    )
  })

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < filteredTasks.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredTasks.length - 1))
    } else if (e.key === 'Enter' && filteredTasks[selectedIndex]) {
      e.preventDefault()
      sounds.playClick(playSounds)
      onToggleTask(filteredTasks[selectedIndex].id)
    }
  }

  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-md animate-in fade-in duration-150 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl liquid-glass-sidebar shadow-2xl overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-150"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
          <Search className="w-5 h-5 text-accent shrink-0 drop-shadow-[0_0_6px_var(--glow-color)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search objectives, tags, or projects..."
            className="flex-1 bg-transparent text-sm font-semibold text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-1 scrollbar-thin">
          {filteredTasks.map((task, idx) => {
            const isSelected = idx === selectedIndex
            const list = lists.find(l => l.id === task.listId)

            return (
              <div
                key={task.id}
                onClick={() => {
                  sounds.playClick(playSounds)
                  onToggleTask(task.id)
                }}
                className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-accent/25 border border-accent text-white shadow-md'
                    : 'hover:bg-white/10 text-text-primary border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                    task.done ? 'bg-accent border-accent text-white' : 'border-white/20'
                  }`}>
                    {task.done && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <span className={`text-xs font-semibold truncate ${task.done ? 'line-through text-text-muted' : ''}`}>
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-text-muted">
                  {list && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 font-medium">
                      {list.title}
                    </span>
                  )}
                  {task.priority === 'focus' && <Flame className="w-3 h-3 text-amber-400" />}
                  {task.priority === 'normal' && <Zap className="w-3 h-3 text-sky-400" />}
                  {task.priority === 'later' && <Moon className="w-3 h-3 text-slate-400" />}
                </div>
              </div>
            )
          })}

          {filteredTasks.length === 0 && (
            <div className="text-center text-xs font-medium text-text-muted py-8">
              No matching tasks found.
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-white/[0.04] border-t border-white/10 flex items-center justify-between text-[11px] text-text-muted">
          <span>Navigate with <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono text-text-secondary">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono text-text-secondary">↓</kbd></span>
          <span>Toggle with <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono text-text-secondary">Enter</kbd></span>
        </div>
      </div>
    </div>
  )
}
