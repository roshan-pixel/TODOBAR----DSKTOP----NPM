import React, { useState } from 'react'
import {
  Check,
  Flame,
  Zap,
  Moon,
  Clock,
  Bell,
  Trash2,
  ChevronDown,
  ChevronRight,
  Plus,
  Play,
  Pencil,
  X,
} from 'lucide-react'
import { Task, TaskPriority, TaskDensity, CustomList } from '../types'
import { LiquidGlassIcon } from './LiquidGlassIcon'
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
  lists,
  density,
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
  const [isHovered, setIsHovered] = useState(false)

  const priorityMeta: Record<TaskPriority, { icon: React.ReactNode; label: string; badgeColor: string }> = {
    focus: {
      icon: <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />,
      label: 'Focus',
      badgeColor: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
    },
    normal: {
      icon: <Zap className="w-3 h-3 text-sky-400 fill-sky-400" />,
      label: 'Standard',
      badgeColor: 'bg-sky-500/20 border-sky-500/40 text-sky-300',
    },
    later: {
      icon: <Moon className="w-3 h-3 text-slate-400" />,
      label: 'Later',
      badgeColor: 'bg-white/10 border-white/15 text-slate-300',
    },
  }

  const handlePriorityCycle = (e: React.MouseEvent) => {
    e.stopPropagation()
    sounds.playClick(playSounds)
    const nextPriority: TaskPriority =
      task.priority === 'normal' ? 'focus' : task.priority === 'focus' ? 'later' : 'normal'
    onUpdate(task.id, { priority: nextPriority })
  }

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

  // Density padding classes
  const densityPadding =
    density === 'compact' ? 'p-2.5' : density === 'spacious' ? 'p-4' : 'p-3'

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex flex-col rounded-3xl liquid-glass-card shadow-lg transition-all overflow-hidden ${
        task.done ? 'opacity-65' : ''
      }`}
    >
      {/* Main Task Card Row (Matching List View Box Pattern) */}
      <div className={`flex items-center justify-between gap-3 w-full ${densityPadding}`}>
        {/* Left: 3D Liquid Glass Checkbox Tile + Content */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* 3D Liquid Glass Checkbox Tile */}
          <button
            type="button"
            onClick={() => onToggle(task.id)}
            title={task.done ? 'Mark pending' : 'Mark complete'}
            aria-label={task.done ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as complete`}
            className="cursor-pointer shrink-0 transition-transform active:scale-95"
          >
            {task.done ? (
              <LiquidGlassIcon type="check" size="xs" isActive={true} />
            ) : (
              <div
                className="w-6 h-6 rounded-[8px] flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.16] border border-white/20 hover:border-white/35 transition-all shadow-sm backdrop-blur-xl relative overflow-hidden"
                style={{
                  boxShadow: 'inset 0 1px 0.5px 0 rgba(255, 255, 255, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15)',
                }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-[45%] rounded-[8px] pointer-events-none rounded-b-none"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.04) 70%, transparent 100%)',
                  }}
                />
              </div>
            )}
          </button>

          {/* Center Details */}
          <div className="flex flex-col min-w-0 flex-1 gap-0.5">
            {/* Title Line */}
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
                className="w-full text-xs font-bold bg-white/15 px-2 py-0.5 rounded-lg border border-accent text-white focus:outline-none backdrop-blur-xl"
              />
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <span
                  onDoubleClick={() => setIsEditing(true)}
                  className={`text-xs font-bold select-text cursor-pointer truncate ${
                    task.done ? 'line-through text-white/50' : 'text-white'
                  }`}
                >
                  {task.title}
                </span>

                {/* Priority Pill */}
                <button
                  type="button"
                  onClick={handlePriorityCycle}
                  title={`Priority: ${priorityMeta[task.priority].label} (Click to cycle)`}
                  aria-label={`Current priority: ${priorityMeta[task.priority].label}`}
                  className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer transition-transform active:scale-95 backdrop-blur-md ${priorityMeta[task.priority].badgeColor}`}
                >
                  {priorityMeta[task.priority].icon}
                  <span className="hidden sm:inline">{priorityMeta[task.priority].label}</span>
                </button>
              </div>
            )}

            {/* Sub-Details Line: Description or Tags / Subtasks / Time */}
            <div className="flex items-center gap-2 text-[11px] text-white/60 truncate">
              {task.description ? (
                <span className="truncate text-white/70">{task.description}</span>
              ) : task.tags && task.tags.length > 0 ? (
                <div className="flex items-center gap-1">
                  {task.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[9.5px] px-1.5 py-0.2 rounded-md bg-white/[0.08] text-white/80 border border-white/10 font-mono font-medium backdrop-blur-sm"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              ) : null}

              {/* Subtask count */}
              {subtasks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowSubtasks(prev => !prev)}
                  className="flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded-md bg-white/[0.08] text-white/80 hover:text-white border border-white/12 font-mono font-semibold backdrop-blur-sm transition-colors cursor-pointer shrink-0"
                >
                  <span>{completedSubtasks}/{subtasks.length}</span>
                  {showSubtasks ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
                </button>
              )}

              {/* Estimated minutes */}
              {task.estimatedMinutes && (
                <span className="text-[10px] font-mono font-medium text-white/70 flex items-center gap-1 shrink-0">
                  <Clock className="w-2.5 h-2.5 text-white/50" />
                  {task.estimatedMinutes}m
                </span>
              )}

              {/* Reminder badge */}
              {task.reminderAt && !task.done && (
                <span className="text-[10px] font-mono font-medium text-amber-300 flex items-center gap-1 shrink-0">
                  <Bell className="w-2.5 h-2.5" />
                  {new Date(task.reminderAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {onStartFocus && !task.done && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                sounds.playClick(playSounds)
                onStartFocus(task)
              }}
              title="Start Focus Timer"
              className="w-7 h-7 rounded-xl flex items-center justify-center bg-white/10 hover:bg-accent hover:text-white text-white/80 transition-colors cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            title="Edit"
            className="w-7 h-7 rounded-xl flex items-center justify-center bg-white/10 hover:text-white text-white/80 transition-colors cursor-pointer"
          >
            <Pencil className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(task.id)}
            title="Delete"
            className="w-7 h-7 rounded-xl flex items-center justify-center bg-white/10 hover:bg-rose-500/30 hover:text-rose-300 text-white/80 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Subtasks Collapsible Checklist */}
      {showSubtasks && (
        <div className="flex flex-col gap-1.5 px-4 pb-3 pt-2 border-t border-white/[0.08] bg-black/15 backdrop-blur-md">
          {subtasks.map((sub) => (
            <div key={sub.id} className="flex items-center justify-between gap-2 group/sub">
              <button
                type="button"
                onClick={() => onToggleSubtask(task.id, sub.id)}
                className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer"
              >
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                  sub.done ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-white/30 bg-white/[0.05]'
                }`}>
                  {sub.done && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span className={`text-[11px] font-medium truncate ${sub.done ? 'line-through text-white/40' : 'text-white/90'}`}>
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
          <form onSubmit={handleAddSub} className="flex items-center gap-1.5 mt-1">
            <Plus className="w-3 h-3 text-white/60" />
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Add subtask step..."
              className="flex-1 bg-transparent text-[11px] text-white placeholder:text-white/40 font-medium focus:outline-none"
            />
          </form>
        </div>
      )}
    </div>
  )
}
