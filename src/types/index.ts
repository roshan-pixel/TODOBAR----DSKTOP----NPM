export type TaskPriority = 'focus' | 'normal' | 'later'

export type SubTask = {
  id: string
  title: string
  done: boolean
}

export type Task = {
  id: string
  title: string
  description?: string
  priority: TaskPriority
  listId: string // 'today' | 'inbox' | custom-list-id
  dueDate?: string // YYYY-MM-DD
  dueTime?: string // HH:mm
  reminderAt?: string // ISO timestamp or YYYY-MM-DDTHH:mm
  estimatedMinutes?: number
  tags: string[]
  subtasks?: SubTask[]
  done: boolean
  createdAt: string
  completedAt?: string
  isPinned?: boolean
}

export type CustomList = {
  id: string
  title: string
  color: string
  icon: string
  isPinnedToToday?: boolean
  sortOrder: number
}

export type ThemeMode = 'light' | 'dark' | 'system'

export type ThemePreset =
  | 'studio'
  | 'obsidian'
  | 'porcelain'
  | 'frostline'
  | 'carbon'
  | 'papertrail'
  | 'terra'
  | 'ember'
  | 'midnight'
  | 'graphite'
  | 'blueprint'
  | 'rosegold'

export type DockEdge = 'right' | 'left' | 'top' | 'floating'

export type TaskDensity = 'compact' | 'normal' | 'spacious'

export type TaskSortMode = 'priority' | 'newest' | 'oldest' | 'dueDate' | 'manual'

export type TabVisibility = 'always' | 'hover'

export type SectionView = 'today' | 'calendar' | 'lists' | 'pomodoro' | 'settings'

export type SidebarSettings = {
  dockEdge: DockEdge
  panelWidth: number
  handlePosition: number // percentage 0-100
  handleHeight: number
  tabVisibility: TabVisibility
  themeMode: ThemeMode
  visualStyle: ThemePreset
  density: TaskDensity
  taskSortMode: TaskSortMode
  showCompleted: boolean
  playSounds: boolean
  notificationsEnabled: boolean
  autoSnoozeMinutes: number
  motionSpeed: number // ms animation duration
  panelRadius: number
  surfaceOpacity: number // 50 - 100
  backdropBlur: number // 0 - 24px
  backdropImage: string
  backdropImageName: string
  backdropOpacity: number // 0 - 100
  backdropDim: number // 0 - 80
  globalShortcut: string
  launchAtLogin: boolean
  defaultPriority: TaskPriority
  isExpanded: boolean // true = sidebar panel open, false = retracted
  desktopSimulatorMode: boolean // preview with wallpaper simulator or edge container
}

export type AppSettings = SidebarSettings

export type ReminderNotification = {
  id: string
  taskId: string
  taskTitle: string
  listTitle: string
  dueLabel: string
  reminderAt: string
  snoozedCount?: number
}

export type FocusTimerMode = 'focus' | 'shortBreak' | 'longBreak'

export type FocusTimerState = {
  activeTaskId: string | null
  activeTaskTitle: string | null
  mode: FocusTimerMode
  durationMinutes: number
  secondsRemaining: number
  isRunning: boolean
  completedSessions: number
}
