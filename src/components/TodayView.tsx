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

  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], [])

  // Filter tasks belonging to Today:
  // 1. listId is 'today'
  // 2. dueDate is today or earlier (scheduled / overdue)
  // 3. task's list is pinned to today
  const todayTasks = useMemo(() => {
    return tasks.filter(t => {
      if (t.listId === 'today') return true
      if (t.dueDate && t.dueDate <= todayDateStr) return true
      const list = lists.find(l => l.id === t.listId)
      return list && list.isPinnedToToday
    })
  }, [tasks, lists, todayDateStr])

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

  const activeFocusCount = focusTasks.filter(t => !t.done).length
  const activeNormalCount = normalTasks.filter(t => !t.done).length
  const activeLaterCount = laterTasks.filter(t => !t.done).length

  const toggleSectionCollapse = (key: string) => {
    sounds.playClick(playSounds)
    setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const filterTabs: { id: 'all' | 'focus' | 'normal' | 'later'; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: totalCount - completedCount },
    { id: 'focus', label: 'Focus', count: activeFocusCount },
    { id: 'normal', label: 'Standard', count: activeNormalCount },
    { id: 'later', label: 'Later', count: activeLaterCount },
  ]

  const activeTabIdx = filterTabs.findIndex(t => t.id === filterMode)

  return (
    <div className="flex flex-col h-full overflow-y-auto px-3 py-1 gap-3 scrollbar-thin pb-28 md:pb-6">
      {/* 1. Today's Objectives Floating Glass Card */}
      <section
        aria-label="Today's Objectives Progress Card"
        className="rounded-2xl liquid-glass-card px-4 py-3.5 flex items-center justify-between gap-3 select-none"
      >
        {/* Left: Sun Glass Orb */}
        <div className="w-10 h-10 rounded-full liquid-glass-orb flex items-center justify-center text-amber-300 shrink-0"
             style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.25) 0%, rgba(251,146,60,0.15) 100%)', border: '1px solid rgba(251,191,36,0.3)' }}>
          <Sun className="w-5 h-5 stroke-[1.8]" />
        </div>

        {/* Center: Title & Single Clean Progress Bar */}
        <div className="flex flex-col flex-1 min-w-0 gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Today's Objectives
            </h2>
            <span className="text-[12px] text-white/50 font-medium">
              {completionPercentage}% complete
            </span>
          </div>

          {/* Single Clean Luminous Liquid Progress Bar */}
          <div
            role="progressbar"
            aria-valuenow={completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            className="w-full bg-white/[0.08] border border-white/10 h-[5px] rounded-full overflow-hidden relative"
          >
            <div
              className="h-full liquid-progress-bar transition-all duration-400 rounded-full"
              style={{ width: `${Math.max(completionPercentage, totalCount > 0 ? 0 : 0)}%` }}
            />
          </div>
        </div>

        {/* Right: Count Badge + Chevron */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="px-2.5 py-1 rounded-full flex items-center gap-1 liquid-glass-orb">
            <span className="text-[12px] font-semibold text-white/90">{completedCount}/{totalCount}</span>
            <ChevronRight className="w-3 h-3 text-white/50 stroke-[2.5]" />
          </div>
        </div>
      </section>

      {/* 2. Quick Floating Task Capture Bar */}
      <TaskInput
        onAddTask={onAddTask}
        lists={lists}
        defaultListId="today"
        playSounds={playSounds}
        inputRef={inputRef}
      />

      {/* 3. Liquid Morphing Segmented Filter Tabs Bar */}
      <div
        role="tablist"
        aria-label="Filter tasks by category"
        className="relative grid grid-cols-4 p-1 rounded-2xl bg-white/[0.06] border border-white/12 backdrop-blur-xl overflow-hidden select-none"
      >
        {/* Physical Liquid Morphing Highlight Pill with Spring Physics */}
        <div
          className="absolute top-1 bottom-1 rounded-xl pointer-events-none transition-all duration-380 ease-[cubic-bezier(0.32,0.72,0,1)] liquid-morph-capsule"
          style={{
            left: `calc(${activeTabIdx * 25}% + 2px)`,
            width: 'calc(25% - 4px)',
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
              className={`py-2 z-10 font-medium text-center text-[13px] truncate transition-all duration-200 cursor-pointer active:scale-95 ${
                isActive
                  ? 'text-white font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]'
                  : 'text-white/50 hover:text-white/75'
              }`}
            >
              {tab.label} {tab.count > 0 ? `(${tab.count})` : ''}
            </button>
          )
        })}
      </div>

      {/* 4. Priority Task Groups (Focus, Standard, Later) */}
      <div className="flex flex-col gap-3 pb-4">
        {/* Tier 1: Focus Priority Tasks */}
        {(filterMode === 'all' || filterMode === 'focus') && focusTasks.length > 0 && (
          <section aria-label="Focus priority tasks" className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => toggleSectionCollapse('focus')}
              className="flex items-center justify-between text-[11px] font-semibold text-white/60 uppercase tracking-wider py-0.5 px-1 cursor-pointer select-none"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                <span>FOCUS PRIORITY ({focusTasks.filter(t => !t.done).length})</span>
              </div>
              {collapsedSections['focus'] ? <ChevronRight className="w-3 h-3 text-white/40" /> : <ChevronDown className="w-3 h-3 text-white/40" />}
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
          <section aria-label="Standard tasks" className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => toggleSectionCollapse('normal')}
              className="flex items-center justify-between text-[11px] font-semibold text-white/60 uppercase tracking-wider py-0.5 px-1 cursor-pointer select-none"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
                <span>STANDARD TASKS ({normalTasks.filter(t => !t.done).length})</span>
              </div>
              {collapsedSections['normal'] ? <ChevronRight className="w-3 h-3 text-white/40" /> : <ChevronDown className="w-3 h-3 text-white/40" />}
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
              className="flex items-center justify-between text-[11px] font-semibold text-white/50 uppercase tracking-wider py-0.5 px-1 cursor-pointer select-none"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.6)]" />
                <span>LATER ({laterTasks.filter(t => !t.done).length})</span>
              </div>
              {collapsedSections['later'] ? <ChevronRight className="w-3 h-3 text-white/40" /> : <ChevronDown className="w-3 h-3 text-white/40" />}
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

        {/* Empty state when no tasks match filter */}
        {todayTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 rounded-[26px] liquid-glass-card text-center gap-2 mt-4">
            <Sun className="w-8 h-8 text-white/40" />
            <h3 className="text-sm font-semibold text-white">All Clear for Today</h3>
            <p className="text-xs text-white/50">Capture a new task above to get started.</p>
          </div>
        )}

        {/* Clear Completed Action */}
        {completedCount > 0 && onClearCompleted && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => {
                sounds.playClick(playSounds)
                onClearCompleted()
              }}
              className="flex items-center gap-2 text-xs text-white/80 hover:text-white px-4 py-2 rounded-full liquid-glass-orb transition-all cursor-pointer font-medium shadow-md"
            >
              <span>Clear {completedCount} completed task{completedCount > 1 ? 's' : ''}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
