import { useState, useEffect, useCallback } from 'react'
import { TodayTask } from '../types'
import { sounds } from '../services/audio'

const STORAGE_KEY = 'todobar.prototype.tasks.v5'

export const isDesignSystemTask = (task: TodayTask): boolean => {
  if (task.categoryType) return task.categoryType === 'design'
  const text = `${task.title} ${task.category || ''}`.toLowerCase()
  return (
    text.includes('figma') ||
    text.includes('design system') ||
    text.includes('design token') ||
    text.includes('swiftui liquid')
  )
}

export const isWorkTask = (task: TodayTask): boolean => {
  if (task.categoryType) return task.categoryType === 'work'
  return !isDesignSystemTask(task)
}

export const INITIAL_TODAY_TASKS: TodayTask[] = []

export function useTodayTasks() {
  const [tasks, setTasks] = useState<TodayTask[]>(() => {
    try {
      // Clean up legacy mock storage if found
      if (typeof window !== 'undefined' && window.localStorage) {
        if (localStorage.getItem('todobar.prototype.tasks.v4')) {
          localStorage.removeItem('todobar.prototype.tasks.v4')
        }
      }
      const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          const mockIds = new Set(['task-1', 'task-2', 'task-3', 'comp-1', 'comp-2', 'comp-3', 'comp-4'])
          return parsed.filter((t: TodayTask) => !mockIds.has(t.id))
        }
      }
    } catch (e) {
      console.warn('Failed to load tasks from storage', e)
    }
    return INITIAL_TODAY_TASKS
  })

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch (e) {
      console.warn('Failed to save tasks to storage', e)
    }
  }, [tasks])

  const toggleTask = useCallback((taskId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const nextDone = !task.done
          if (nextDone) {
            sounds.playComplete(true)
          } else {
            sounds.playClick(true)
          }
          return {
            ...task,
            done: nextDone,
            completedAt: nextDone
              ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : undefined,
          }
        }
        return task
      })
    )
  }, [])

  const addTask = useCallback((taskData: {
    title: string
    category?: string
    priority?: 'focus' | 'normal' | 'later'
    time?: string
    categoryType?: 'work' | 'design'
  }) => {
    const isDesign =
      taskData.categoryType === 'design' ||
      `${taskData.title} ${taskData.category || ''}`.toLowerCase().includes('design')
    const isFocus = taskData.priority === 'focus'

    const newTask: TodayTask = {
      id: `task-${Date.now()}`,
      title: taskData.title,
      priority: taskData.priority || 'normal',
      done: false,
      time: taskData.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: taskData.category || (isDesign ? 'Figma Design System' : 'General Work'),
      categoryType: taskData.categoryType || (isDesign ? 'design' : 'work'),
      priorityTag: isFocus ? 'High Priority' : 'Normal',
      dotColor: isFocus ? 'bg-rose-400' : 'bg-[#00F0FF]',
      tagColor: isFocus
        ? 'bg-rose-500/20 text-rose-300 border-rose-500/35'
        : 'bg-cyan-500/20 text-[#00F0FF] border-cyan-500/35',
    }

    setTasks(prev => [newTask, ...prev])
    sounds.playClick(true)
    return newTask
  }, [])

  const resetTasksToDefault = useCallback(() => {
    setTasks(INITIAL_TODAY_TASKS)
  }, [])

  // Auto-computed metrics
  const totalCount = tasks.length
  const completedCount = tasks.filter(t => t.done).length
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const leftTodayCount = Math.max(0, totalCount - completedCount)

  const activeTasks = tasks.filter(t => !t.done)
  const completedTasks = tasks.filter(t => t.done)

  // Category counts
  const allCount = totalCount
  const workCount = tasks.filter(isWorkTask).length
  const designCount = tasks.filter(isDesignSystemTask).length

  return {
    tasks,
    activeTasks,
    completedTasks,
    toggleTask,
    addTask,
    resetTasksToDefault,
    totalCount,
    completedCount,
    completionPercentage,
    leftTodayCount,
    allCount,
    workCount,
    designCount,
  }
}