import React, { useState } from 'react'
import {
  Plus,
  Trash2,
  ChevronRight,
  X,
} from 'lucide-react'
import { CustomList, Task, TaskDensity } from '../types'
import { LiquidGlassIcon } from './LiquidGlassIcon'
import { TaskItem } from './TaskItem'
import { TaskInput } from './TaskInput'
import { sounds } from '../services/audio'

interface ListsViewProps {
  tasks: Task[]
  lists: CustomList[]
  density: TaskDensity
  playSounds: boolean
  onAddList: (title: string, color?: string, isPinned?: boolean) => void
  onUpdateList: (id: string, patch: Partial<CustomList>) => void
  onDeleteList: (id: string) => void
  onAddTask: (title: string, options?: any) => void
  onToggleTask: (id: string) => void
  onUpdateTask: (id: string, patch: Partial<Task>) => void
  onDeleteTask: (id: string) => void
  onAddSubtask: (taskId: string, title: string) => void
  onToggleSubtask: (taskId: string, subtaskId: string) => void
  onDeleteSubtask: (taskId: string, subtaskId: string) => void
  onStartFocus: (task: Task) => void
}

const COLOR_OPTIONS = [
  '#38bdf8', // Sky
  '#818cf8', // Indigo
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f97316', // Orange
  '#eab308', // Yellow
  '#10b981', // Emerald
  '#06b6d4', // Cyan
]

export const ListsView: React.FC<ListsViewProps> = ({
  tasks,
  lists,
  density,
  playSounds,
  onAddList,
  onUpdateList,
  onDeleteList,
  onAddTask,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onStartFocus,
}) => {
  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [isCreatingList, setIsCreatingList] = useState(false)
  const [newListTitle, setNewListTitle] = useState('')
  const [newListColor, setNewListColor] = useState(COLOR_OPTIONS[0])
  const [newListPinned, setNewListPinned] = useState(true)

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newListTitle.trim()) return
    onAddList(newListTitle.trim(), newListColor, newListPinned)
    setNewListTitle('')
    setIsCreatingList(false)
  }

  const selectedList = lists.find(l => l.id === selectedListId)
  const activeListTasks = selectedListId ? tasks.filter(t => t.listId === selectedListId) : []

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-3.5 gap-4 scrollbar-thin pb-24 md:pb-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          {selectedListId ? (
            <button
              onClick={() => setSelectedListId(null)}
              className="flex items-center gap-1 text-xs font-extrabold text-accent hover:underline cursor-pointer"
            >
              ← Collections
            </button>
          ) : (
            <>
              <LiquidGlassIcon type="lists" size="md" />
              <div>
                <h1 className="text-base font-extrabold text-text-primary tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                  Project Collections
                </h1>
                <p className="text-xs text-text-muted font-semibold mt-0.5">{lists.length} custom projects</p>
              </div>
            </>
          )}
        </div>

        {!selectedListId && (
          <button
            onClick={() => {
              sounds.playClick(playSounds)
              setIsCreatingList(prev => !prev)
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl liquid-glass-pill text-xs font-extrabold text-text-primary hover:border-accent transition-all cursor-pointer shadow-lg hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5 text-accent stroke-[3]" />
            <span>New List</span>
          </button>
        )}
      </div>

      {/* New List Modal Form */}
      {isCreatingList && !selectedListId && (
        <form onSubmit={handleCreateList} className="flex flex-col gap-3 p-4 rounded-3xl liquid-glass-card shadow-2xl border-accent/40 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary">Create New Project</span>
            <button
              type="button"
              onClick={() => setIsCreatingList(false)}
              className="text-text-muted hover:text-text-primary p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            autoFocus
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            placeholder="e.g. Website Launch, Marketing, Design Sprint..."
            className="w-full text-xs font-bold bg-white/10 px-3 py-2 rounded-xl border border-white/15 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent backdrop-blur-xl"
          />

          {/* Color swatches */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-text-muted">Color:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewListColor(c)}
                  className={`w-6 h-6 rounded-xl cursor-pointer transition-transform ${
                    newListColor === c ? 'scale-125 ring-2 ring-white shadow-lg' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c, boxShadow: `0 2px 8px ${c}60` }}
                />
              ))}
            </div>
          </div>

          {/* Pin to Today Toggle */}
          <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={newListPinned}
              onChange={(e) => setNewListPinned(e.target.checked)}
              className="rounded accent-accent cursor-pointer"
            />
            <span>Pin tasks from this list into "Today's Objectives"</span>
          </label>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsCreatingList(false)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl hover:bg-white/10 text-text-muted cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newListTitle.trim()}
              className="px-4 py-1.5 text-xs font-bold rounded-xl bg-accent text-white disabled:opacity-40 cursor-pointer shadow-md shadow-accent/40 hover:scale-105"
            >
              Create List
            </button>
          </div>
        </form>
      )}

      {/* Selected List Detail View */}
      {selectedList ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-4 rounded-3xl liquid-glass-card shadow-xl">
            <div className="flex items-center gap-3">
              <LiquidGlassIcon type="folder" size="md" customColor={selectedList.color} />
              <div>
                <h2 className="text-sm font-extrabold text-text-primary drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                  {selectedList.title}
                </h2>
                <span className="text-[11px] text-text-muted font-bold">
                  {activeListTasks.filter(t => t.done).length}/{activeListTasks.length} completed
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onUpdateList(selectedList.id, { isPinnedToToday: !selectedList.isPinnedToToday })}
                title={selectedList.isPinnedToToday ? 'Unpin from Today' : 'Pin to Today'}
                className="cursor-pointer"
              >
                <LiquidGlassIcon type="pin" size="xs" isActive={!!selectedList.isPinnedToToday} />
              </button>

              <button
                onClick={() => {
                  onDeleteList(selectedList.id)
                  setSelectedListId(null)
                }}
                title="Delete List"
                className="p-2 rounded-xl bg-white/10 border border-white/15 text-text-muted hover:text-rose-300 hover:bg-rose-500/25 transition-colors cursor-pointer backdrop-blur-md"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick task capture inside this list */}
          <TaskInput
            onAddTask={onAddTask}
            lists={lists}
            defaultListId={selectedList.id}
            playSounds={playSounds}
          />

          {/* Task list */}
          <div className="flex flex-col gap-2 pb-8">
            {activeListTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                lists={lists}
                density={density}
                onToggle={onToggleTask}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                onAddSubtask={onAddSubtask}
                onToggleSubtask={onToggleSubtask}
                onDeleteSubtask={onDeleteSubtask}
                onStartFocus={onStartFocus}
                playSounds={playSounds}
              />
            ))}

            {activeListTasks.length === 0 && (
              <div className="text-center text-xs font-semibold text-text-muted py-8 liquid-glass-card rounded-3xl">
                No tasks in this list yet. Add one above!
              </div>
            )}
          </div>
        </div>
      ) : (
        /* List Cards Grid with 3D Liquid Glass Folder Icons */
        <div className="flex flex-col gap-2.5 pb-8">
          {lists.map((list) => {
            const listTasks = tasks.filter(t => t.listId === list.id)
            const completed = listTasks.filter(t => t.done).length
            const total = listTasks.length
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0

            return (
              <div
                key={list.id}
                onClick={() => {
                  sounds.playClick(playSounds)
                  setSelectedListId(list.id)
                }}
                className="flex items-center justify-between p-3.5 rounded-3xl liquid-glass-card shadow-lg cursor-pointer group hover:scale-[1.01] transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <LiquidGlassIcon type="folder" size="sm" customColor={list.color} />

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-text-primary truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                        {list.title}
                      </span>
                      {list.isPinnedToToday && (
                        <LiquidGlassIcon type="pin" size="xs" />
                      )}
                    </div>
                    <span className="text-[11px] text-text-muted font-bold">
                      {completed}/{total} completed
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Progress fraction */}
                  <div className="w-16 bg-white/10 h-1.5 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${percent}%`, backgroundColor: list.color }}
                    />
                  </div>

                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
