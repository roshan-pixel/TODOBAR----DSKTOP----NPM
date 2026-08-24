import React from 'react'
import { Bell, Clock, X, Check } from 'lucide-react'
import { ReminderNotification } from '../types'

interface ReminderToastContainerProps {
  notifications: ReminderNotification[]
  onDismiss: (id: string) => void
  onSnooze: (id: string, taskId: string, minutes?: number) => void
}

export const ReminderToastContainer: React.FC<ReminderToastContainerProps> = ({
  notifications,
  onDismiss,
  onSnooze,
}) => {
  if (notifications.length === 0) return null

  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="pointer-events-auto flex flex-col p-3.5 rounded-2xl bg-card/95 backdrop-blur-xl border border-accent/40 shadow-2xl animate-in slide-in-from-top-3 duration-200 gap-2 ring-1 ring-accent/20"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-text-primary line-clamp-1">
                  {notif.taskTitle}
                </span>
                <span className="text-[10px] text-text-muted">
                  📁 {notif.listTitle} · {notif.dueLabel}
                </span>
              </div>
            </div>

            <button
              onClick={() => onDismiss(notif.id)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-card-hover"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action buttons (Snooze 5m, Snooze 10m, Dismiss) */}
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-subtle">
            <button
              onClick={() => onSnooze(notif.id, notif.taskId, 5)}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-card-hover hover:bg-subtle text-text-secondary transition-colors"
            >
              Snooze 5m
            </button>
            <button
              onClick={() => onSnooze(notif.id, notif.taskId, 10)}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors shadow-sm"
            >
              Snooze 10m
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
