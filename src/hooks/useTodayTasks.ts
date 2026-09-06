import { useState, useEffect, useCallback } from 'react'
import { TodayTask } from '../types'
import { sounds } from '../services/audio'

const STORAGE_KEY = 'todobar.prototype.tasks.v4'

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

export const INITIAL_TODAY_TASKS: TodayTask[] = [
  {
    id: 'task-1',
    title: 'Finalize Apple 2026 Liquid Glass spec & token exports',
    priority: 'focus',
    done: false,
    time: '11:30 AM',
    category: 'Figma Design System',
    categoryType: 'design',
    subtasksCount: '3/4 subtasks',
    subtaskProgress: 75,
    avatars: [
      { initials: 'JD', bg: 'bg-[#3b49df] text-white' },
      { initials: 'AL', bg: 'bg-[#10b981] text-neutral-950 font-bold' },
    ],
    priorityTag: 'High Priority',
    dotColor: 'bg-rose-400',
    tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/35',
  },
  {
    id: 'task-2',
    title: 'Review spatial sound design for Todobar micro-haptics',
    priority: 'normal',
    done: false,
    time: '2:00 PM',
    category: 'Audio Labs • Haptics v2',
    categoryType: 'work',
    attachments: '2 files',
    priorityTag: 'Medium',
    dotColor: 'bg-[#00F0FF]',
    tagColor: 'bg-cyan-500/20 text-[#00F0FF] border-cyan-500/35',
  },
  {
    id: 'task-3',
    title: 'Executive pitch deck for iOS Liquid Glass redesign',
    priority: 'focus',
    done: false,
    time: '4:15 PM',
    category: 'With Tim & Alan • Keynote v4',
    categoryType: 'work',
    priorityTag: 'High Priority',
    dotColor: 'bg-rose-400',
    tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/35',
  },
  {
    id: 'comp-1',
    title: 'Morning alignment with Core OS engineering',
    priority: 'normal',
    time: '9:15 AM',
    category: 'Room 4B',
    categoryType: 'work',
    done: true,
    priorityTag: 'Normal',
    dotColor: 'bg-emerald-400',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35',
    completedAt: '9:15 AM',
  },
  {
    id: 'comp-2',
    title: 'Review token exports for SwiftUI Liquid Glass',
    priority: 'normal',
    time: '8:45 AM',
    category: 'Design Tokens',
    categoryType: 'design',
    done: true,
    priorityTag: 'Normal',
    dotColor: 'bg-emerald-400',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35',
    completedAt: '8:45 AM',
  },
  {
    id: 'comp-3',
    title: 'Sync with Alan on Keynote v4 outline',
    priority: 'normal',
    time: '8:15 AM',
    category: 'Keynote v4',
    categoryType: 'work',
    done: true,
    priorityTag: 'Normal',
    dotColor: 'bg-emerald-400',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35',
    completedAt: '8:15 AM',
  },
  {
    id: 'comp-4',
    title: 'Daily standup & backlog triage',
    priority: 'normal',
    time: '8:00 AM',
    category: 'Sprint 3',
    categoryType: 'work',
    done: true,
    priorityTag: 'Normal',
    dotColor: 'bg-emerald-400',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35',
    completedAt: '8:00 AM',
  },
]

export function useTodayTasks() {
  const [tasks, setTasks] = useState<TodayTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
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