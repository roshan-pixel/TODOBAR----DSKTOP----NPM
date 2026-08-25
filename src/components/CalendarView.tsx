import React, { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react'
import { Task, CustomList, TaskDensity } from '../types'
import { LiquidGlassIcon } from './LiquidGlassIcon'
import { TaskItem } from './TaskItem'
import { sounds } from '../services/audio'

interface CalendarViewProps {
  tasks: Task[]
  lists: CustomList[]
  density: TaskDensity
  playSounds: boolean
  onAddTask: (title: string, options?: any) => void
  onToggleTask: (id: string) => void
  onUpdateTask: (id: string, patch: Partial<Task>) => void
  onDeleteTask: (id: string) => void
  onAddSubtask: (taskId: string, title: string) => void
  onToggleSubtask: (taskId: string, subtaskId: string) => void
  onDeleteSubtask: (taskId: string, subtaskId: string) => void
  onStartFocus: (task: Task) => void
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  lists,
  density,
  playSounds,
  onAddTask,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onStartFocus,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0])
  const [quickTitle, setQuickTitle] = useState('')
  const [quickTime, setQuickTime] = useState('')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthName = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate)
  }, [currentDate])

  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate()
  }, [year, month])

  const firstDayIndex = useMemo(() => {
    return new Date(year, month, 1).getDay()
  }, [year, month])

  const prevMonth = () => {
    sounds.playClick(playSounds)
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    sounds.playClick(playSounds)
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    sounds.playClick(playSounds)
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today.toISOString().split('T')[0])
  }

  // Group tasks by dueDate
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>()
    tasks.forEach(task => {
      if (!task.dueDate) return
      const existing = map.get(task.dueDate) || []
      existing.push(task)
      map.set(task.dueDate, existing)
    })
    return map
  }, [tasks])

  const selectedDateTasks = useMemo(() => {
    return tasks.filter(t => t.dueDate === selectedDate)
  }, [tasks, selectedDate])

  const handleAddForSelectedDay = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickTitle.trim()) return

    onAddTask(quickTitle.trim(), {
      dueDate: selectedDate,
      dueTime: quickTime || undefined,
      priority: 'normal',
      listId: 'today',
    })

    setQuickTitle('')
    setQuickTime('')
  }

  const todayStr = new Date().toISOString().split('T')[0]

  const [calendarTab, setCalendarTab] = useState<'month' | 'day' | 'all'>('month')
  const calTabs = [
    { id: 'month' as const, label: 'Month View' },
    { id: 'day' as const, label: 'Day Agenda' },
    { id: 'all' as const, label: 'Upcoming' },
  ]
  const activeCalTabIdx = calTabs.findIndex(t => t.id === calendarTab)

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-1 gap-3.5 scrollbar-thin pb-28 md:pb-6">
      {/* Liquid Glass Segmented Mode Switcher */}
      <div
        role="tablist"
        aria-label="Calendar view modes"
        className="relative grid grid-cols-3 p-1 rounded-2xl liquid-segmented-bar text-xs w-full select-none shadow-md"
      >
        {/* Dynamic Morphing Liquid Pill with Apple Spring Easing */}
        <div
          className="absolute top-1 bottom-1 rounded-xl pointer-events-none transition-all duration-380 ease-[cubic-bezier(0.34,1.45,0.64,1)] liquid-morph-capsule"
          style={{
            left: `calc(${activeCalTabIdx * 33.333}% + 2px)`,
            width: 'calc(33.333% - 4px)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '2px',
              left: '15%',
              right: '15%',
              height: '40%',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.35) 0%, transparent 75%)',
              filter: 'blur(1.5px)',
            }}
          />
        </div>

        {calTabs.map((tab) => {
          const isActive = calendarTab === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                sounds.playClick(playSounds)
                setCalendarTab(tab.id)
              }}
              className={`py-2 z-10 font-medium text-center transition-all cursor-pointer truncate active:scale-95 text-xs ${
                isActive
                  ? 'text-white font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Month Header & Quick Actions */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-white/90 tracking-wide">
          {monthName}
        </span>

        <button
          onClick={goToToday}
          className="px-3 py-1 text-[11px] font-medium rounded-full liquid-glass-orb text-white/90 hover:text-white transition-all cursor-pointer shadow-sm"
        >
          Jump to Today
        </button>
      </div>

      {/* Liquid Glass Month Calendar Grid Card */}
      {(calendarTab === 'month' || calendarTab === 'day') && (
      <div className="flex flex-col p-3.5 rounded-2xl liquid-glass-card shadow-lg gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-extrabold text-text-primary drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            {monthName}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={prevMonth}
              title="Previous month"
              aria-label="Previous month"
              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors cursor-pointer backdrop-blur-md"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              title="Next month"
              aria-label="Next month"
              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors cursor-pointer backdrop-blur-md"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 text-center text-xs font-extrabold text-text-muted">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Leading empty slots */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-9 rounded-xl opacity-10" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
            const isSelected = selectedDate === dateStr
            const isToday = todayStr === dateStr
            const dayTasks = tasksByDate.get(dateStr) || []
            const activeCount = dayTasks.filter(t => !t.done).length

            return (
              <button
                key={dateStr}
                onClick={() => {
                  sounds.playClick(playSounds)
                  setSelectedDate(dateStr)
                }}
                className={`h-9 rounded-2xl flex flex-col items-center justify-center relative text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-accent text-white shadow-lg shadow-accent/50 font-extrabold ring-2 ring-white/60 scale-105 border border-white/40 backdrop-blur-xl'
                    : isToday
                    ? 'bg-accent/25 text-accent border border-accent/70 backdrop-blur-md shadow-sm'
                    : 'hover:bg-white/10 text-text-primary border border-transparent hover:border-white/15'
                }`}
              >
                <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">{dayNum}</span>

                {/* Dot indicator for tasks */}
                {dayTasks.length > 0 && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected
                          ? 'bg-white'
                          : activeCount > 0
                          ? 'bg-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)]'
                          : 'bg-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.9)]'
                      }`}
                    />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
      )}

      {/* Selected Day Agenda */}
      {(calendarTab === 'month' || calendarTab === 'day') && (
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-extrabold text-text-primary drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            <LiquidGlassIcon type="calendar" size="xs" />
            <span>
              Agenda for {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', weekday: 'short' }).format(new Date(selectedDate))}
            </span>
          </div>
          <span className="text-xs text-text-muted font-mono font-bold">
            {selectedDateTasks.length} task{selectedDateTasks.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Quick capture for this day */}
        <form onSubmit={handleAddForSelectedDay} className="flex items-center gap-2 p-3 rounded-2xl liquid-glass-card shadow-lg focus-within:border-accent">
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder={`Schedule task for ${new Date(selectedDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}...`}
            className="flex-1 bg-transparent text-xs font-bold text-text-primary placeholder:text-text-muted focus:outline-none"
          />

          <input
            type="time"
            value={quickTime}
            onChange={(e) => setQuickTime(e.target.value)}
            className="text-xs bg-white/10 border border-white/15 rounded-xl px-2 py-1 text-text-secondary font-bold focus:outline-none cursor-pointer backdrop-blur-md"
          />

          <button
            type="submit"
            disabled={!quickTitle.trim()}
            className="w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-bold shadow-md shadow-accent/40 hover:scale-105"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>
        </form>

        {/* Task list for selected day */}
        <div className="flex flex-col gap-2 pb-8">
          {selectedDateTasks.map((task) => (
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

          {selectedDateTasks.length === 0 && (
            <div className="text-center text-xs font-semibold text-text-muted py-8 liquid-glass-card rounded-3xl">
              No tasks scheduled for this day.
            </div>
          )}
        </div>
      </div>
      )}

      {/* Upcoming All Scheduled Tasks View */}
      {calendarTab === 'all' && (
        <div className="flex flex-col gap-2.5 pb-8">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-text-primary">All Scheduled Deadlines</span>
            <span className="text-xs text-text-muted font-mono font-bold">
              {tasks.filter(t => t.dueDate).length} scheduled
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {tasks
              .filter(t => t.dueDate)
              .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
              .map(task => (
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

            {tasks.filter(t => t.dueDate).length === 0 && (
              <div className="text-center text-xs font-semibold text-text-muted py-8 liquid-glass-card rounded-3xl">
                No upcoming scheduled tasks.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

