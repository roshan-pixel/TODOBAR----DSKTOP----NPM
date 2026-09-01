import React, { useState } from 'react'
import {
  Check,
  Play,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  Clock,
  Bell,
} from 'lucide-react'
import { Task, TaskDensity, CustomList } from '../types'
import { sounds } from '../services/audio'

interface TaskItemProps {
  task: Task
  lists: CustomList[]
  density: TaskDensity
  onToggle: (id: string) => void
  onUpdate: (id: string, patch: Partial<Task>) => void
  onDelete: (id: string) => void
  onAddSubtask: (taskId: string, title: string) => void
  onToggleSubtask: (taskId: string, subtaskId: string) => void
  onDeleteSubtask: (taskId: string, subtaskId: string) => void
  onStartFocus?: (task: Task) => void
  playSounds?: boolean
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onUpdate,
  onDelete,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onStartFocus,
  playSounds = true,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [showSubtasks, setShowSubtasks] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      onUpdate(task.id, { title: editTitle.trim() })
    }
    setIsEditing(false)
  }

  const handleAddSub = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtaskTitle.trim()) return
    onAddSubtask(task.id, newSubtaskTitle.trim())
    setNewSubtaskTitle('')
  }

  const subtasks = task.subtasks || []
  const completedSubtasks = subtasks.filter(s => s.done).length

  return (
    <div
      className={`group relative flex flex-col rounded-2xl liquid-glass-card transition-all overflow-hidden ${
        task.done ? 'opacity-50' : ''
      }`}
    >
      {/* Main Task Card Row */}
      <div className="flex items-center justify-between gap-3.5 w-full px-4 py-3.5">
        {/* Left: Elegant Glass Checkbox Ring */}
        <button
          type="button"
          onClick={() => {
            sounds.playComplete(playSounds)
            onToggle(task.id)
          }}
          title={task.done ? 'Mark pending' : 'Mark complete'}
          aria-label={task.done ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
          className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center cursor-pointer liquid-checkbox-ring transition-transform active:scale-90 ${
            task.done ? 'checked' : ''
          }`}
        >
          {task.done && (
            <Check className="w-3.5 h-3.5 text-white stroke-[2.8] animate-in zoom-in-50 duration-150" />
          )}
        </button>

        {/* Center: Title, Description, and Metadata */}
        <div className="flex flex-col min-w-0 flex-1 justify-center">
          {/* Title */}
          {isEditing ? (
            <input
              type="text"
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit()
                if (e.key === 'Escape') setIsEditing(false)
              }}
              className="w-full text-sm font-semibold bg-white/10 px-2 py-1 rounded-lg border border-white/25 text-white focus:outline-none"
            />
          ) : (
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                onDoubleClick={() => setIsEditing(true)}
                className={`text-[13.5px] font-semibold tracking-tight select-text cursor-pointer truncate ${
                  task.done ? 'line-through text-white/40 font-normal' : 'text-white'
                }`}
              >
                {task.title}
              </span>
              {task.priority === 'focus' && <span className="text-sm shrink-0">🔥</span>}
              {task.priority === 'normal' && <span className="text-[13px] text-sky-400 shrink-0">⚡</span>}
            </div>
          )}

          {/* Description line */}
          {task.description && (
            <p className="text-[11.5px] text-white/55 truncate font-normal leading-tight mt-0.5">
              {task.description}
            </p>
          )}

          {/* Metadata Row */}
          {(subtasks.length > 0 || task.estimatedMinutes || task.reminderAt) && (
            <div className="flex items-center gap-2 mt-1.5 text-[10.5px] text-white/50 flex-wrap">
              {/* Subtasks Count Pill */}
              {subtasks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowSubtasks(prev => !prev)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.08] text-white/80 hover:text-white border border-white/10 font-mono font-semibold transition-colors cursor-pointer shrink-0 text-[10px]"
                >
                  <span>{completedSubtasks}/{subtasks.length}</span>
                  {showSubtasks ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
                </button>
              )}

              {/* Estimated Duration */}
              {task.estimatedMinutes && (
                <span className="font-mono text-white/60 flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3 text-white/40" />
                  {task.estimatedMinutes}m
                </span>
              )}

              {/* Reminder Badge */}
              {task.reminderAt && !task.done && (
                <span className="font-mono text-amber-300/90 flex items-center gap-1 shrink-0">
                  <Bell className="w-3 h-3 text-amber-400" />
                  {new Date(task.reminderAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: Circular Glass Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onStartFocus && !task.done && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                sounds.playClick(playSounds)
                onStartFocus(task)
              }}
              title="Start Focus Timer"
              aria-label="Start Focus Timer"
              className="w-8 h-8 rounded-full liquid-glass-orb flex items-center justify-center cursor-pointer text-white/80 hover:text-white active:scale-90"
            >
              <Play className="w-3 h-3 fill-current ml-0.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            title="Edit Task"
            aria-label="Edit Task"
            className="w-8 h-8 rounded-full liquid-glass-orb flex items-center justify-center cursor-pointer text-white/50 hover:text-white/90 active:scale-90"
          >
            <Pencil className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick(playSounds)
              onDelete(task.id)
            }}
            title="Delete Task"
            aria-label="Delete Task"
            className="w-8 h-8 rounded-full liquid-glass-orb flex items-center justify-center cursor-pointer text-white/40 hover:text-rose-300 active:scale-90"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Subtasks Collapsible Checklist */}
      {showSubtasks && (
        <div className="flex flex-col gap-2 px-5 pb-3.5 pt-2 border-t border-white/[0.08] bg-black/10 backdrop-blur-md">
          {subtasks.map((sub) => (
            <div key={sub.id} className="flex items-center justify-between gap-2.5 group/sub">
              <button
                type="button"
                onClick={() => onToggleSubtask(task.id, sub.id)}
                className="flex items-center gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                  sub.done ? 'bg-cyan-500 border-cyan-400 text-white' : 'border-white/30 bg-white/[0.05]'
                }`}>
                  {sub.done && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span className={`text-xs font-normal truncate ${sub.done ? 'line-through text-white/40' : 'text-white/85'}`}>
                  {sub.title}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onDeleteSubtask(task.id, sub.id)}
                className="opacity-0 group-hover/sub:opacity-100 text-white/40 hover:text-rose-300 p-0.5 transition-opacity cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Add Subtask Input */}
          <form onSubmit={handleAddSub} className="flex items-center gap-2 mt-1">
            <Plus className="w-3.5 h-3.5 text-white/50" />
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Add subtask step..."
              className="flex-1 bg-transparent text-xs text-white placeholder:text-white/40 font-normal focus:outline-none"
            />
          </form>
        </div>
      )}
    </div>
  )
}
