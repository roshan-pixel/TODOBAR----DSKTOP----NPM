import React, { useState } from 'react'
import { X, Mic, Calendar, Flag, Hash, User, Plus, Sparkles, Check } from 'lucide-react'

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
  onAddTask: (taskData: any) => void
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose, onAddTask }) => {
  const [taskText, setTaskText] = useState(
    'Finalize spatial audio review tomorrow at 3:00 PM with Tim #Design !high'
  )
  const [isRecording, setIsRecording] = useState(false)
  const [subtasks, setSubtasks] = useState([
    { id: '1', title: 'Export spatial waveform tokens', done: false },
    { id: '2', title: 'Check iOS 2026 HIG guidelines for glass...', done: false },
  ])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')

  if (!isOpen) return null

  const handleCreate = () => {
    onAddTask({
      title: taskText,
      priority: 'focus',
      subtasks: subtasks.map(s => ({ id: s.id, title: s.title, done: s.done })),
      tags: ['Design', 'Systems'],
    })
    onClose()
  }

  const toggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(s => (s.id === id ? { ...s, done: !s.done } : s)))
  }

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return
    setSubtasks([...subtasks, { id: Date.now().toString(), title: newSubtaskTitle.trim(), done: false }])
    setNewSubtaskTitle('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md transition-all duration-300">
      {/* Sliding Sheet Drawer */}
      <div className="w-full max-w-[430px] rounded-t-[36px] bg-[#0c0d18]/95 border-t border-x border-white/20 p-5 pb-10 shadow-[0_-16px_50px_rgba(0,0,0,0.8),inset_0_1.5px_0_rgba(255,255,255,0.3)] animate-ios-fade-spring">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-wide text-white">New Task</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-2.5 h-2.5" /> NLP ACTIVE
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* NLP Natural Language Input */}
        <div className="mt-4">
          <textarea
            rows={2}
            value={taskText}
            onChange={e => setTaskText(e.target.value)}
            className="w-full bg-transparent text-sm text-white/95 placeholder:text-neutral-500 resize-none outline-none font-sans leading-relaxed"
            placeholder="What needs to be done? e.g. Design review tomorrow 3pm !high #Design"
          />
        </div>

        {/* Parsed NLP Smart Pills */}
        <div className="flex flex-wrap gap-1.5 mt-2 pb-3 border-b border-white/10">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-cyan-950/40 text-[#7dd3fc] border border-cyan-500/30">
            <Calendar className="w-3 h-3 text-[#00F0FF]" /> Tomorrow, 3:00 PM
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-950/40 text-rose-300 border border-red-500/30">
            <Flag className="w-3 h-3 text-rose-400" /> High Priority
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-purple-950/40 text-purple-300 border border-purple-500/30">
            <Hash className="w-3 h-3 text-purple-400" /> Design / Systems
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-950/40 text-blue-300 border border-blue-500/30">
            <User className="w-3 h-3 text-blue-400" /> Tim
          </span>
        </div>

        {/* Live Voice Dictation Waveform Section */}
        <div className="mt-3 p-3 rounded-[20px] bg-white/[0.04] border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsRecording(!isRecording)}
              className={`p-2.5 rounded-full transition-all ${
                isRecording
                  ? 'bg-rose-500 text-white shadow-[0_0_14px_rgba(244,63,94,0.6)] animate-pulse'
                  : 'bg-white/10 text-[#00F0FF] hover:bg-white/15'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
            <div>
              <div className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">
                LIVE DICTATION & WAVEFORM
              </div>
              <div className="flex items-center gap-1 mt-1">
                {/* Waveform bars */}
                {[12, 22, 16, 28, 14, 26, 18, 24, 10, 20].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: isRecording ? `${h}px` : '4px' }}
                    className="w-[2px] bg-[#00F0FF] rounded-full transition-all duration-150 shadow-[0_0_4px_#00F0FF]"
                  />
                ))}
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">00:14</span>
        </div>

        {/* Smart Schedule Pills */}
        <div className="mt-3">
          <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
            SMART SCHEDULE
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button className="px-3 py-1.5 rounded-full text-xs bg-white/10 hover:bg-white/15 text-white/90 border border-white/15 transition-colors">
              ☀️ Today
            </button>
            <button className="px-3 py-1.5 rounded-full text-xs bg-[#00F0FF]/20 text-[#7dd3fc] border border-[#00F0FF]/40 font-medium">
              📅 Tomorrow 3 PM
            </button>
            <button className="px-3 py-1.5 rounded-full text-xs bg-white/10 hover:bg-white/15 text-white/90 border border-white/15 transition-colors">
              🗓️ This Weekend
            </button>
          </div>
        </div>

        {/* Subtasks Checklist */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
              SUBTASKS ({subtasks.length})
            </span>
          </div>
          <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
            {subtasks.map(s => (
              <div
                key={s.id}
                onClick={() => toggleSubtask(s.id)}
                className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] cursor-pointer transition-colors border border-white/5"
              >
                <div
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${
                    s.done ? 'bg-[#00F0FF] border-[#00F0FF]' : 'border-white/30'
                  }`}
                >
                  {s.done && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                </div>
                <span className={`text-xs ${s.done ? 'line-through text-neutral-500' : 'text-neutral-200'}`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons: Details + Create Task CTA */}
        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-neutral-300 text-xs font-semibold tracking-wider transition-colors border border-white/15"
          >
            Details
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-[#00c6d4] via-[#00F0FF] to-[#38bdf8] text-neutral-950 font-semibold text-sm tracking-wide shadow-[0_0_24px_rgba(0,240,255,0.6),inset_0_1px_0_rgba(255,255,255,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <span>Create Task</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    </div>
  )
}
