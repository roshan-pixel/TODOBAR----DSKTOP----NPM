import { Task, CustomList, SidebarSettings } from '../types'

export const INITIAL_CUSTOM_LISTS: CustomList[] = [
  {
    id: 'work',
    title: 'Work & Projects',
    color: '#3b82f6',
    icon: 'Briefcase',
    isPinnedToToday: true,
    sortOrder: 1,
  },
  {
    id: 'personal',
    title: 'Personal Life',
    color: '#10b981',
    icon: 'User',
    isPinnedToToday: false,
    sortOrder: 2,
  },
  {
    id: 'ideas',
    title: 'Ideas & Scratchpad',
    color: '#f59e0b',
    icon: 'Lightbulb',
    isPinnedToToday: false,
    sortOrder: 3,
  },
]

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Ship Todobar Pro dockable sidebar',
    description: 'Finalize keyboard shortcuts, responsive layout and sleek theme switching',
    priority: 'focus',
    listId: 'today',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '18:00',
    estimatedMinutes: 45,
    tags: ['code', 'release'],
    done: false,
    createdAt: new Date().toISOString(),
    isPinned: true,
    subtasks: [
      { id: 'sub-1', title: 'Verify dock edge transitions', done: true },
      { id: 'sub-2', title: 'Test reminder alert snoozing', done: true },
      { id: 'sub-3', title: 'Review custom theme palettes', done: false },
    ],
  },
  {
    id: 'task-2',
    title: 'Review team pull requests & security audit',
    description: 'Check OWASP checks and dependency updates',
    priority: 'focus',
    listId: 'work',
    dueDate: new Date().toISOString().split('T')[0],
    estimatedMinutes: 30,
    tags: ['review', 'security'],
    done: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Plan tomorrow sprint milestones',
    description: 'Break down tickets and assign story points',
    priority: 'normal',
    listId: 'today',
    dueDate: new Date().toISOString().split('T')[0],
    tags: ['planning'],
    done: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Hydrate & 15-minute mobility stretch',
    priority: 'normal',
    listId: 'personal',
    dueDate: new Date().toISOString().split('T')[0],
    tags: ['wellness'],
    done: true,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    title: 'Explore LLM tool-calling agent patterns',
    priority: 'later',
    listId: 'ideas',
    tags: ['ai', 'research'],
    done: false,
    createdAt: new Date().toISOString(),
  },
]

export function exportDataAsJson(tasks: Task[], lists: CustomList[], settings: SidebarSettings): void {
  const exportPayload = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    tasks,
    lists,
    settings,
  }

  const jsonStr = JSON.stringify(exportPayload, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `todobar-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportTasksAsMarkdown(tasks: Task[], lists: CustomList[]): void {
  const listMap = new Map<string, string>()
  listMap.set('today', 'Today')
  lists.forEach(l => listMap.set(l.id, l.title))

  let md = `# Todobar Export - ${new Date().toLocaleDateString()}\n\n`

  const activeTasks = tasks.filter(t => !t.done)
  const completedTasks = tasks.filter(t => t.done)

  md += `## 🚀 Active Tasks (${activeTasks.length})\n\n`
  activeTasks.forEach(t => {
    const list = listMap.get(t.listId) || 'General'
    const priorityIcon = t.priority === 'focus' ? '🔥 Focus' : t.priority === 'normal' ? '⚡ Normal' : '💤 Later'
    md += `- [ ] **${t.title}** [${priorityIcon}] [📁 ${list}]${t.dueDate ? ` (Due: ${t.dueDate})` : ''}\n`
    if (t.description) md += `  > ${t.description}\n`
    if (t.subtasks && t.subtasks.length > 0) {
      t.subtasks.forEach(s => {
        md += `  - [${s.done ? 'x' : ' '}] ${s.title}\n`
      })
    }
  })

  md += `\n## ✅ Completed Tasks (${completedTasks.length})\n\n`
  completedTasks.forEach(t => {
    md += `- [x] ~${t.title}~ ${t.completedAt ? `(Completed: ${new Date(t.completedAt).toLocaleTimeString()})` : ''}\n`
  })

  const blob = new Blob([md], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `todobar-tasks-${new Date().toISOString().split('T')[0]}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
