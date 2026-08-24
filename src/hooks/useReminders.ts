import { useState, useEffect, useCallback, useRef } from 'react'
import { Task, ReminderNotification, CustomList } from '../types'
import { sounds } from '../services/audio'

export function useReminders(
  tasks: Task[],
  lists: CustomList[],
  updateTask: (id: string, patch: Partial<Task>) => void,
  enabled = true,
  playSounds = true
) {
  const [notifications, setNotifications] = useState<ReminderNotification[]>([])
  const notifiedIdsRef = useRef<Set<string>>(new Set())

  // Check reminders every 5 seconds
  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => {
      const now = new Date().getTime()

      tasks.forEach(task => {
        if (task.done || !task.reminderAt) return

        const reminderTime = new Date(task.reminderAt).getTime()
        if (isNaN(reminderTime)) return

        // If reminder time has passed and not notified in this cycle
        if (reminderTime <= now && !notifiedIdsRef.current.has(task.id)) {
          notifiedIdsRef.current.add(task.id)

          const list = lists.find(l => l.id === task.listId)
          const listTitle = task.listId === 'today' ? 'Today' : list ? list.title : 'Task'

          const newNotification: ReminderNotification = {
            id: `notif_${Date.now()}_${task.id}`,
            taskId: task.id,
            taskTitle: task.title,
            listTitle,
            dueLabel: task.dueTime ? `Due at ${task.dueTime}` : 'Due now',
            reminderAt: task.reminderAt,
          }

          setNotifications(prev => [newNotification, ...prev])
          sounds.playReminder(playSounds)
        }
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [tasks, lists, enabled, playSounds])

  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }, [])

  const snoozeNotification = useCallback((
    notificationId: string,
    taskId: string,
    minutes = 10
  ) => {
    const nextReminder = new Date(Date.now() + minutes * 60 * 1000).toISOString()

    // Reset from notified set so it can fire again
    notifiedIdsRef.current.delete(taskId)

    // Update task with new reminder time
    updateTask(taskId, { reminderAt: nextReminder })

    // Remove notification toast
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    sounds.playClick(playSounds)
  }, [updateTask, playSounds])

  return {
    notifications,
    dismissNotification,
    snoozeNotification,
  }
}
