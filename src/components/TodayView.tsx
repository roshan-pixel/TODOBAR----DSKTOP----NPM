import React, { useState, useMemo } from 'react'
import {
  Sun,
  ChevronDown,
  ChevronRight,
  Sparkles,
  CheckCheck,
} from 'lucide-react'
import { Task, CustomList, TaskDensity, TaskSortMode, TaskPriority } from '../types'
import { TaskInput } from './TaskInput'
import { TaskItem } from './TaskItem'
import { sounds } from '../services/audio'

interface TodayViewProps {
  tasks: Task[]
  lists: CustomList[]
  density: TaskDensity
  taskSortMode: TaskSortMode
  showCompleted: boolean
  playSounds: boolean
  onAddTask: (title: string, options?: any) => void
  onToggleTask: (id: string) => void
  onUpdateTask: (id: string, patch: Partial<Task>) => void
  onDeleteTask: (id: string) => void
  onAddSubtask: (taskId: string, title: string) => void
  onToggleSubtask: (taskId: string, subtaskId: string) => void
  onDeleteSubtask: (taskId: string, subtaskId: string) => void
  onStartFocus: (task: Task) => void
  onClearCompleted: () => void
  inputRef?: React.RefObject<HTMLInputElement | null>
}

export const TodayView: React.FC<TodayViewProps> = ({
  tasks,
  lists,
  density,
  taskSortMode,
  showCompleted,
  playSounds,
  onAddTask,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onStartFocus,
  onClearCompleted,
  inputRef,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'focus' | 'normal' | 'later'>('all')
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  const todayStr = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).format(new Date())
  }, [])

  // Filter tasks belonging to Today or Pinned lists
  const todayTasks = useMemo(() => {
    return tasks.filter(t => {
      const list = lists.find(l => l.id === t.listId)
      return t.listId === 'today' || (list && list.isPinnedToToday)
    })
  }, [tasks, lists])

  // Sort logic
  const sortFn = (a: Task, b: Task) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    if (taskSortMode === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (taskSortMode === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    if (taskSortMode === 'dueDate') {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
      return dateA - dateB
    }
    const pOrder: Record<TaskPriority, number> = { focus: 0, normal: 1, later: 2 }
    return pOrder[a.priority] - pOrder[b.priority]
  }

  const completedTodayTasks = useMemo(() => todayTasks.filter(t => t.done), [todayTasks])

  const totalCount = todayTasks.length
  const completedCount = completedTodayTasks.length
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Filtered lists by tier
  const focusTasks = useMemo(
    () => todayTasks.filter(t => t.priority === 'focus' && (!t.done || showCompleted)).sort(sortFn),
    [todayTasks, showCompleted, taskSortMode]
  )
  const normalTasks = useMemo(
    () => todayTasks.filter(t => t.priority === 'normal' && (!t.done || showCompleted)).sort(sortFn),
    [todayTasks, showCompleted, taskSortMode]
  )
  const laterTasks = useMemo(
    () => todayTasks.filter(t => t.priority === 'later' && (!t.done || showCompleted)).sort(sortFn),
    [todayTasks, showCompleted, taskSortMode]
  )

  const toggleSectionCollapse = (key: string) => {
    sounds.playClick(playSounds)
    setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const filterTabs: { id: 'all' | 'focus' | 'normal' | 'later'; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: totalCount },
    { id: 'focus', label: 'Focus', count: focusTasks.filter(t => !t.done).length },
    { id: 'normal', label: 'Standard', count: normalTasks.filter(t => !t.done).length },
    { id: 'later', label: 'Later', count: laterTasks.filter(t => !t.done).length },
  ]

  const activeTabIdx = filterTabs.findIndex(t => t.id === filterMode)

  return (
    <div className="flex flex-col h-full overflow-y-auto px-3.5 py-3 gap-3.5 scrollbar-thin pb-24 md:pb-4">
      {/* Header Banner */}
      <section aria-labelledby="today-heading" className="flex flex-col gap-2 pt-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-4.5 h-4.5 text-amber-300 animate-spin-slow shrink-0" />
            <div>
              <h1 id="today-heading" className="text-sm font-bold text-white tracking-tight">
                Today's Objectives
              </h1>
              <p className="text-[11px] text-white/60 font-medium">{todayStr}</p>
            </div>
          </div>

          {/* Mini completion status capsule */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.08] border border-white/12 shadow-sm">
            <span className="text-xs font-bold text-white font-mono">
              {completedCount}/{totalCount}
            </span>
            <div className="w-4.5 h-4.5 relative flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
                <path
                  className="text-white/15 stroke-current"
                  strokeWidth="3.5"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-white stroke-current transition-all duration-300"
                  strokeDasharray={`${completionPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          role="progressbar"
          aria-valuenow={completionPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          className="w-full bg-white/[0.08] border border-white/10 h-1.5 rounded-full overflow-hidden backdrop-blur-md"
        >
          <div
            className="h-full bg-white/90 transition-all duration-300 rounded-full"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </section>

      {/* Quick Task Capture */}
      <TaskInput
        onAddTask={onAddTask}
        lists={lists}
        defaultListId="today"
        playSounds={playSounds}
        inputRef={inputRef}
      />

      {/* Apple Native Segmented Control */}
      <div
        role="tablist"
        aria-label="Filter tasks by priority"
        className="relative grid grid-cols-4 p-1 rounded-xl bg-white/[0.06] border border-white/12 shadow-sm"
      >
        {/* Continuous Sliding Glass Highlight */}
        <div
          className="absolute top-1 bottom-1 rounded-lg pointer-events-none transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] bg-white/20 border border-white/30 shadow-sm backdrop-blur-xl"
          style={{
            width: 'calc(25% - 2px)',
            transform: `translateX(calc(${activeTabIdx * 100}% + ${activeTabIdx * 2}px))`,
          }}
        />

        {filterTabs.map((tab) => {
          const isActive = filterMode === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                sounds.playClick(playSounds)
                setFilterMode(tab.id)
              }}
              className={`py-1.5 z-10 font-bold text-center text-[11px] truncate transition-colors cursor-pointer ${
                isActive ? 'text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              {tab.label} {tab.count > 0 ? `(${tab.count})` : ''}
            </button>
          )
        })}
      </div>

      {/* Priority Groups Container */}
      <div className="flex flex-col gap-3 pb-8">
        {/* Tier 1: Focus Priority Tasks */}
        {(filterMode === 'all' || filterMode === 'focus') && focusTasks.length > 0 && (
          <section aria-label="Focus priority tasks" className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => toggleSectionCollapse('focus')}
              className="flex items-center justify-between text-xs font-bold text-amber-300 uppercase tracking-wider py-1 px-1 cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                <span>Focus Priority ({focusTasks.filter(t => !t.done).length})</span>
              </div>
              {collapsedSections['focus'] ? <ChevronRight className="w-3.5 h-3.5 text-white/50" /> : <ChevronDown className="w-3.5 h-3.5 text-white/50" />}
            </button>

            {!collapsedSections['focus'] && (
              <div className="flex flex-col gap-2">
                {focusTasks.map(task => (
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
              </div>
            )}
          </section>
        )}

        {/* Tier 2: Standard Tasks */}
        {(filterMode === 'all' || filterMode === 'normal') && normalTasks.length > 0 && (
          <section aria-label="Standard priority tasks" className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => toggleSectionCollapse('normal')}
              className="flex items-center justify-between text-xs font-bold text-sky-300 uppercase tracking-wider py-1 px-1 cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50" />
                <span>Standard Tasks ({normalTasks.filter(t => !t.done).length})</span>
              </div>
              {collapsedSections['normal'] ? <ChevronRight className="w-3.5 h-3.5 text-white/50" /> : <ChevronDown className="w-3.5 h-3.5 text-white/50" />}
            </button>

            {!collapsedSections['normal'] && (
              <div className="flex flex-col gap-2">
                {normalTasks.map(task => (
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
              </div>
            )}
          </section>
        )}

        {/* Tier 3: Later Tasks */}
        {(filterMode === 'all' || filterMode === 'later') && laterTasks.length > 0 && (
          <section aria-label="Later tasks" className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => toggleSectionCollapse('later')}
              className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider py-1 px-1 cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Later / Backlog ({laterTasks.filter(t => !t.done).length})</span>
              </div>
              {collapsedSections['later'] ? <ChevronRight className="w-3.5 h-3.5 text-white/50" /> : <ChevronDown className="w-3.5 h-3.5 text-white/50" />}
            </button>

            {!collapsedSections['later'] && (
              <div className="flex flex-col gap-2">
                {laterTasks.map(task => (
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
              </div>
            )}
          </section>
        )}

        {/* Empty State */}
        {todayTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 rounded-2xl liquid-glass-card text-center gap-3 mt-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">All caught up!</h3>
              <p className="text-xs text-white/60 mt-1 max-w-[220px]">
                Type an objective above or press <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white/80 border border-white/15">N</kbd> to add.
              </p>
            </div>
          </div>
        )}

        {/* Clear Completed Action */}
        {completedCount > 0 && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => {
                sounds.playClick(playSounds)
                onClearCompleted()
              }}
              className="flex items-center gap-2 text-xs text-white/80 hover:text-white px-4 py-2 rounded-xl liquid-glass-pill transition-all cursor-pointer font-bold shadow-md hover:scale-105"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Clear {completedCount} completed task{completedCount > 1 ? 's' : ''}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
