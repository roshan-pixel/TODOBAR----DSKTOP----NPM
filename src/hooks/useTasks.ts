import { useState, useEffect, useCallback } from 'react'
import { Task, CustomList, TaskPriority } from '../types'
import { scheduleLocalStorageWrite, getFromStorage } from '../services/storage'
import { INITIAL_TASKS, INITIAL_CUSTOM_LISTS } from '../services/exportImport'
import { sounds } from '../services/audio'

const TASKS_STORAGE_KEY = 'todobar.v2.tasks'
const LISTS_STORAGE_KEY = 'todobar.v2.lists'

export function useTasks(playSounds = true) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    return getFromStorage<Task[]>(TASKS_STORAGE_KEY, INITIAL_TASKS)
  })

  const [lists, setLists] = useState<CustomList[]>(() => {
    return getFromStorage<CustomList[]>(LISTS_STORAGE_KEY, INITIAL_CUSTOM_LISTS)
  })

  // Debounced auto-save
  useEffect(() => {
    return scheduleLocalStorageWrite(TASKS_STORAGE_KEY, JSON.stringify(tasks), 400)
  }, [tasks])

  useEffect(() => {
    return scheduleLocalStorageWrite(LISTS_STORAGE_KEY, JSON.stringify(lists), 400)
  }, [lists])

  /**
   * Add a new task with optional smart tag parsing
   */
  const addTask = useCallback((
    title: string,
    options: {
      priority?: TaskPriority
      listId?: string
      dueDate?: string
      dueTime?: string
      reminderAt?: string
      estimatedMinutes?: number
      tags?: string[]
      description?: string
    } = {}
  ) => {
    if (!title.trim()) return

    // Smart natural parsing if tags or priorities in title
    let parsedTitle = title.trim()
    let parsedPriority: TaskPriority = options.priority || 'normal'
    const parsedTags: string[] = [...(options.tags || [])]

    if (parsedTitle.includes('!focus') || parsedTitle.includes('!high')) {
      parsedPriority = 'focus'
      parsedTitle = parsedTitle.replace(/!(focus|high)/g, '').trim()
    } else if (parsedTitle.includes('!later') || parsedTitle.includes('!low')) {
      parsedPriority = 'later'
      parsedTitle = parsedTitle.replace(/!(later|low)/g, '').trim()
    }

    const tagMatches = parsedTitle.match(/#([\w-]+)/g)
    if (tagMatches) {
      tagMatches.forEach(tag => {
        const cleanTag = tag.substring(1).toLowerCase()
        if (!parsedTags.includes(cleanTag)) parsedTags.push(cleanTag)
      })
      parsedTitle = parsedTitle.replace(/#([\w-]+)/g, '').trim()
    }

    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: parsedTitle || title.trim(),
      description: options.description || '',
      priority: parsedPriority,
      listId: options.listId || 'today',
      dueDate: options.dueDate || new Date().toISOString().split('T')[0],
      dueTime: options.dueTime,
      reminderAt: options.reminderAt,
      estimatedMinutes: options.estimatedMinutes,
      tags: parsedTags,
      subtasks: [],
      done: false,
      createdAt: new Date().toISOString(),
    }

    setTasks(prev => [newTask, ...prev])
    sounds.playClick(playSounds)
    return newTask
  }, [playSounds])

  /**
   * Toggle task complete status with audio feedback
   */
  const toggleTask = useCallback((taskId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const nextDone = !task.done
          if (nextDone) {
            sounds.playComplete(playSounds)
          } else {
            sounds.playClick(playSounds)
          }
          return {
            ...task,
            done: nextDone,
            completedAt: nextDone ? new Date().toISOString() : undefined,
          }
        }
        return task
      })
    )
  }, [playSounds])

  /**
   * Update arbitrary task fields
   */
  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(task => (task.id === taskId ? { ...task, ...updates } : task))
    )
  }, [])

  /**
   * Delete a task
   */
  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
    sounds.playClick(playSounds)
  }, [playSounds])

  /**
   * Subtask actions
   */
  const addSubtask = useCallback((taskId: string, subtaskTitle: string) => {
    if (!subtaskTitle.trim()) return
    const newSub: { id: string; title: string; done: boolean } = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      title: subtaskTitle.trim(),
      done: false,
    }
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: [...(task.subtasks || []), newSub],
          }
        }
        return task
      })
    )
  }, [])

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId && task.subtasks) {
          return {
            ...task,
            subtasks: task.subtasks.map(sub => {
              if (sub.id === subtaskId) {
                const nextDone = !sub.done
                if (nextDone) sounds.playComplete(playSounds)
                return { ...sub, done: nextDone }
              }
              return sub
            }),
          }
        }
        return task
      })
    )
  }, [playSounds])

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId && task.subtasks) {
          return {
            ...task,
            subtasks: task.subtasks.filter(sub => sub.id !== subtaskId),
          }
        }
        return task
      })
    )
  }, [])

  /**
   * Custom list management
   */
  const addList = useCallback((title: string, color = '#3b82f6', isPinned = false, icon = 'Folder') => {
    if (!title.trim()) return
    const newList: CustomList = {
      id: `list_${Date.now()}`,
      title: title.trim(),
      color,
      icon,
      isPinnedToToday: isPinned,
      sortOrder: lists.length + 1,
    }
    setLists(prev => [...prev, newList])
    sounds.playClick(playSounds)
    return newList
  }, [lists.length, playSounds])

  const updateList = useCallback((listId: string, patch: Partial<CustomList>) => {
    setLists(prev => prev.map(l => (l.id === listId ? { ...l, ...patch } : l)))
  }, [])

  const deleteList = useCallback((listId: string) => {
    setLists(prev => prev.filter(l => l.id !== listId))
    sounds.playClick(playSounds)
  }, [playSounds])

  /**
   * Bulk actions
   */
  const clearCompleted = useCallback(() => {
    setTasks(prev => prev.filter(t => !t.done))
    sounds.playClick(playSounds)
  }, [playSounds])

  const restoreSampleData = useCallback(() => {
    setTasks(INITIAL_TASKS)
    setLists(INITIAL_CUSTOM_LISTS)
    sounds.playClick(playSounds)
  }, [playSounds])

  const importAllData = useCallback((importedTasksOrObj: Task[] | { tasks?: Task[]; lists?: CustomList[] }, importedLists?: CustomList[]) => {
    if (Array.isArray(importedTasksOrObj)) {
      setTasks(importedTasksOrObj)
      if (importedLists) setLists(importedLists)
    } else if (importedTasksOrObj && typeof importedTasksOrObj === 'object') {
      if (importedTasksOrObj.tasks) setTasks(importedTasksOrObj.tasks)
      if (importedTasksOrObj.lists) setLists(importedTasksOrObj.lists)
    }
  }, [])

  return {
    tasks,
    lists,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    addList,
    updateList,
    deleteList,
    clearCompleted,
    restoreSampleData,
    importAllData,
  }
}
