import { useState, useEffect, useCallback, useRef } from 'react'
import { TodayTask } from '../types'
import { sounds } from '../services/audio'
import {
  fetchTasksFromBackend,
  syncTaskToBackend,
  deleteTaskFromBackend,
  drainOutbox,
} from '../services/backendSync'

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
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mockIds = new Set(['task-1', 'task-2', 'task-3', 'comp-1', 'comp-2', 'comp-3', 'comp-4'])
          const filtered = parsed.filter((t: TodayTask) => !mockIds.has(t.id))
          if (filtered.length > 0) return filtered
        }
      }
    } catch (e) {
      console.warn('Failed to load tasks from storage', e)
    }
    return INITIAL_TODAY_TASKS
  })

  const [isLoading, setIsLoading] = useState(false)
  const isSyncingRef = useRef(false)

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch (e) {
      console.warn('Failed to save tasks to storage', e)
    }
  }, [tasks])

  // Hydrate from Google Sheets / Backend on mount and periodically
  const loadTasksFromRemote = useCallback(async () => {
    if (isSyncingRef.current) return
    try {
      isSyncingRef.current = true
      setIsLoading(true)

      // First drain any pending offline outbox items
      await drainOutbox()

      const remoteTasks = await fetchTasksFromBackend()
      if (Array.isArray(remoteTasks) && remoteTasks.length > 0) {
        setTasks(prev => {
          // Merge by ID: keep local tasks, append any new remote tasks
          const localMap = new Map(prev.map(t => [t.id, t]))
          const merged = [...prev]

          for (const remote of remoteTasks) {
            if (!localMap.has(remote.id)) {
              merged.push(remote)
              localMap.set(remote.id, remote)
            } else {
              // Update completion status if changed in sheet
              const idx = merged.findIndex(t => t.id === remote.id)
              if (idx !== -1 && merged[idx].done !== remote.done) {
                merged[idx] = {
                  ...merged[idx],
                  done: remote.done,
                  completedAt: remote.completedAt || merged[idx].completedAt,
                }
              }
            }
          }
          return merged
        })
      }
    } catch (err) {
      console.warn('[Todobar] Error fetching tasks from backend:', err)
    } finally {
      setIsLoading(false)
      isSyncingRef.current = false
    }
  }, [])

  useEffect(() => {
    loadTasksFromRemote()

    // Periodically re-sync with Google Sheets every 20 seconds
    const interval = setInterval(loadTasksFromRemote, 20000)
    return () => clearInterval(interval)
  }, [loadTasksFromRemote])

  const toggleTask = useCallback((taskId: string) => {
    setTasks(prev => {
      let updatedTask: TodayTask | null = null
      const next = prev.map(task => {
        if (task.id === taskId) {
          const nextDone = !task.done
          if (nextDone) {
            sounds.playComplete(true)
          } else {
            sounds.playClick(true)
          }
          updatedTask = {
            ...task,
            done: nextDone,
            completedAt: nextDone
              ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : undefined,
          }
          return updatedTask
        }
        return task
      })

      if (updatedTask) {
        syncTaskToBackend(updatedTask).catch(err => {
          console.warn('[Todobar] Backend sync toggle failed:', err)
        })
      }
      return next
    })
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

    // Trigger backend and Google Sheets synchronization
    syncTaskToBackend(newTask).catch(err => {
      console.warn('[Todobar] Backend sync add failed, queued in offline outbox:', err)
    })

    return newTask
  }, [])

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    sounds.playClick(true)
    deleteTaskFromBackend(taskId).catch(err => {
      console.warn('[Todobar] Backend delete failed:', err)
    })
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
    deleteTask,
    resetTasksToDefault,
    refreshTasks: loadTasksFromRemote,
    isLoading,
    totalCount,
    completedCount,
    completionPercentage,
    leftTodayCount,
    allCount,
    workCount,
    designCount,
  }
}