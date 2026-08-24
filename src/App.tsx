import React, { useState, useMemo, useRef } from 'react'
import {
  useTasks,
} from './hooks/useTasks'
import {
  useSettings,
} from './hooks/useSettings'
import {
  useReminders,
} from './hooks/useReminders'
import {
  useKeyboardShortcuts,
} from './hooks/useKeyboardShortcuts'
import {
  SectionView,
  FocusTimerState,
  Task,
} from './types'
import { THEME_PRESETS_LIST } from './constants/themes'
import { MacTitleBar } from './components/MacTitleBar'
import { CommandRail } from './components/CommandRail'
import { EdgeHandle } from './components/EdgeHandle'
import { TodayView } from './components/TodayView'
import { CalendarView } from './components/CalendarView'
import { ListsView } from './components/ListsView'
import { FocusTimerView } from './components/FocusTimerView'
import { SettingsView } from './components/SettingsView'
import { SearchModal } from './components/SearchModal'
import { ReminderToastContainer } from './components/ReminderToastContainer'
import { DesktopSimulator } from './components/DesktopSimulator'

export function App() {
  const {
    settings,
    updateSettings,
    toggleSidebar,
    resetSettings,
  } = useSettings()

  const {
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
  } = useTasks(settings.playSounds)

  const {
    notifications,
    dismissNotification,
    snoozeNotification,
  } = useReminders(
    tasks,
    lists,
    updateTask,
    settings.notificationsEnabled,
    settings.playSounds
  )

  const [activeView, setActiveView] = useState<SectionView>('today')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const quickInputRef = useRef<HTMLInputElement>(null)

  // Focus Timer State
  const [timerState, setTimerState] = useState<FocusTimerState>({
    activeTaskId: null,
    activeTaskTitle: null,
    mode: 'focus',
    durationMinutes: 25,
    secondsRemaining: 25 * 60,
    isRunning: false,
    completedSessions: 0,
  })

  const handleStartFocusOnTask = (task: Task) => {
    setTimerState(prev => ({
      ...prev,
      activeTaskId: task.id,
      activeTaskTitle: task.title,
      isRunning: true,
      secondsRemaining: prev.durationMinutes * 60,
    }))
    setActiveView('pomodoro')
  }

  // Keyboard navigation with macOS HIG shortcuts
  useKeyboardShortcuts({
    onToggleSidebar: toggleSidebar,
    onCloseSidebar: () => {
      if (isSearchOpen) {
        setIsSearchOpen(false)
      } else if (settings.isExpanded) {
        updateSettings({ isExpanded: false })
      }
    },
    onSelectView: (view) => {
      setActiveView(view)
      if (!settings.isExpanded) {
        updateSettings({ isExpanded: true })
      }
    },
    onOpenSearch: () => setIsSearchOpen(true),
    onOpenHelp: () => setActiveView('settings'),
    onFocusInput: () => {
      if (!settings.isExpanded) updateSettings({ isExpanded: true })
      setActiveView('today')
      setTimeout(() => quickInputRef.current?.focus(), 50)
    },
  })

  // Theme matching config
  const currentTheme = useMemo(() => {
    const found = THEME_PRESETS_LIST.find(t => t.id === settings.visualStyle)
    return found || THEME_PRESETS_LIST[0]
  }, [settings.visualStyle])

  // CSS variables object for dynamic styling
  const themeCssVariables = useMemo(() => {
    return {
      '--accent': currentTheme.accentColor,
      '--accent-soft': currentTheme.accentSoft,
      '--accent-text': currentTheme.accentText,
      '--bg-workspace': currentTheme.bgWorkspace,
      '--bg-sidebar': currentTheme.bgSidebar,
      '--bg-rail': currentTheme.bgRail,
      '--bg-card': currentTheme.bgCard,
      '--bg-card-hover': currentTheme.bgCardHover,
      '--border-subtle': currentTheme.borderSubtle,
      '--border-strong': currentTheme.borderStrong,
      '--text-primary': currentTheme.textPrimary,
      '--text-secondary': currentTheme.textSecondary,
      '--text-muted': currentTheme.textMuted,
      '--glow-color': currentTheme.glowColor,
      '--panel-width': `${settings.panelWidth}px`,
      '--panel-radius': `${settings.panelRadius}px`,
    } as React.CSSProperties
  }, [currentTheme, settings.panelWidth, settings.panelRadius])

  const openTasksCount = tasks.filter(t => !t.done).length
  const completedTasksCount = tasks.filter(t => t.done).length
  const totalTasksCount = tasks.length

  const viewTitles: Record<SectionView, string> = {
    today: "Today's Objectives",
    calendar: 'Calendar Agenda',
    lists: 'Project Collections',
    pomodoro: 'Focus Chamber',
    settings: 'Preferences',
  }

  // Panel transform based on dockEdge and isExpanded with Apple spring curve
  const getPanelStyle = (): React.CSSProperties => {
    const isRight = settings.dockEdge === 'right'
    const isLeft = settings.dockEdge === 'left'
    const isTop = settings.dockEdge === 'top'
    const springCurve = 'transform 360ms cubic-bezier(0.16, 1, 0.3, 1), opacity 360ms cubic-bezier(0.16, 1, 0.3, 1)'

    if (isRight) {
      return {
        width: `${settings.panelWidth}px`,
        right: 0,
        top: 0,
        bottom: 0,
        transform: settings.isExpanded ? 'translateX(0%)' : 'translateX(100%)',
        borderTopLeftRadius: `${settings.panelRadius}px`,
        borderBottomLeftRadius: `${settings.panelRadius}px`,
        transition: springCurve,
      }
    }
    if (isLeft) {
      return {
        width: `${settings.panelWidth}px`,
        left: 0,
        top: 0,
        bottom: 0,
        transform: settings.isExpanded ? 'translateX(0%)' : 'translateX(-100%)',
        borderTopRightRadius: `${settings.panelRadius}px`,
        borderBottomRightRadius: `${settings.panelRadius}px`,
        transition: springCurve,
      }
    }
    if (isTop) {
      return {
        width: '100%',
        maxWidth: '860px',
        left: '50%',
        top: 0,
        height: '540px',
        transform: settings.isExpanded ? 'translate(-50%, 0%)' : 'translate(-50%, -100%)',
        borderBottomLeftRadius: `${settings.panelRadius}px`,
        borderBottomRightRadius: `${settings.panelRadius}px`,
        transition: springCurve,
      }
    }
    // Floating
    return {
      width: `${settings.panelWidth}px`,
      right: '24px',
      top: '32px',
      bottom: '32px',
      transform: settings.isExpanded ? 'scale(1)' : 'scale(0.95)',
      opacity: settings.isExpanded ? 1 : 0,
      pointerEvents: settings.isExpanded ? 'auto' : 'none',
      borderRadius: `${settings.panelRadius}px`,
      transition: springCurve,
    }
  }

  return (
    <div
      style={themeCssVariables}
      className={`relative w-screen h-screen overflow-hidden select-none font-sans text-text-primary ${
        settings.themeMode === 'dark' ? 'dark' : ''
      }`}
    >
      {/* Desktop Workspace Wallpaper Backdrop */}
      {settings.desktopSimulatorMode && (
        <DesktopSimulator
          backdropImage={settings.backdropImage}
          backdropBlur={settings.backdropBlur}
          dockEdge={settings.dockEdge}
        />
      )}

      {/* Draggable Liquid Glass Edge Handle */}
      <EdgeHandle
        dockEdge={settings.dockEdge}
        handlePosition={settings.handlePosition}
        handleHeight={settings.handleHeight}
        isExpanded={settings.isExpanded}
        onToggle={toggleSidebar}
        onUpdatePosition={(pos) => updateSettings({ handlePosition: pos })}
        playSounds={settings.playSounds}
        openTasksCount={openTasksCount}
      />

      {/* Ambient Liquid Backlight Glow */}
      {settings.isExpanded && (
        <div
          className="fixed pointer-events-none z-30 transition-all duration-500 animate-liquid-pulse"
          style={{
            top: '8%',
            bottom: '8%',
            right: settings.dockEdge === 'right' ? '0' : 'auto',
            left: settings.dockEdge === 'left' ? '0' : 'auto',
            width: `${settings.panelWidth + 60}px`,
            background: `radial-gradient(ellipse at center, var(--glow-color) 0%, transparent 70%)`,
            filter: 'blur(50px)',
          }}
        />
      )}

      {/* Main Liquid Transparent Glass Sidebar Panel */}
      <aside
        style={getPanelStyle()}
        aria-label="Todobar liquid glass application window"
        className="fixed z-40 flex liquid-glass-sidebar overflow-hidden"
      >
        {/* Left Liquid Glass Command Rail */}
        <CommandRail
          activeView={activeView}
          onSelectView={setActiveView}
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleSidebar={toggleSidebar}
          isExpanded={settings.isExpanded}
          dockEdge={settings.dockEdge}
          playSounds={settings.playSounds}
          totalOpenTasks={openTasksCount}
          totalCompletedTasks={completedTasksCount}
        />

        {/* Liquid Glass View Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Native macOS Liquid Unified Title Bar */}
          <MacTitleBar
            title={viewTitles[activeView]}
            activeView={activeView}
            dockEdge={settings.dockEdge}
            isExpanded={settings.isExpanded}
            onToggleSidebar={toggleSidebar}
            onOpenSearch={() => setIsSearchOpen(true)}
            playSounds={settings.playSounds}
            totalTasks={totalTasksCount}
            completedTasks={completedTasksCount}
          />

          {/* Active Liquid Content View */}
          <main className="flex-1 overflow-hidden">
            {activeView === 'today' && (
              <TodayView
                tasks={tasks}
                lists={lists}
                density={settings.density}
                taskSortMode={settings.taskSortMode}
                showCompleted={settings.showCompleted}
                playSounds={settings.playSounds}
                onAddTask={addTask}
                onToggleTask={toggleTask}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onAddSubtask={addSubtask}
                onToggleSubtask={toggleSubtask}
                onDeleteSubtask={deleteSubtask}
                onStartFocus={handleStartFocusOnTask}
                onClearCompleted={clearCompleted}
                inputRef={quickInputRef}
              />
            )}

            {activeView === 'calendar' && (
              <CalendarView
                tasks={tasks}
                lists={lists}
                density={settings.density}
                playSounds={settings.playSounds}
                onAddTask={addTask}
                onToggleTask={toggleTask}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onAddSubtask={addSubtask}
                onToggleSubtask={toggleSubtask}
                onDeleteSubtask={deleteSubtask}
                onStartFocus={handleStartFocusOnTask}
              />
            )}

            {activeView === 'lists' && (
              <ListsView
                tasks={tasks}
                lists={lists}
                density={settings.density}
                playSounds={settings.playSounds}
                onAddList={addList}
                onUpdateList={updateList}
                onDeleteList={deleteList}
                onAddTask={addTask}
                onToggleTask={toggleTask}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onAddSubtask={addSubtask}
                onToggleSubtask={toggleSubtask}
                onDeleteSubtask={deleteSubtask}
                onStartFocus={handleStartFocusOnTask}
              />
            )}

            {activeView === 'pomodoro' && (
              <FocusTimerView
                tasks={tasks}
                timerState={timerState}
                onUpdateTimer={(patch) => setTimerState(prev => ({ ...prev, ...patch }))}
                onCompleteTask={toggleTask}
                playSounds={settings.playSounds}
              />
            )}

            {activeView === 'settings' && (
              <SettingsView
                settings={settings}
                onUpdateSettings={updateSettings}
                onResetSettings={resetSettings}
                tasks={tasks}
                lists={lists}
                onImportData={importAllData}
                onRestoreSampleData={restoreSampleData}
              />
            )}
          </main>
        </div>
      </aside>

      {/* Global Spotlight Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        tasks={tasks}
        lists={lists}
        onToggleTask={toggleTask}
        playSounds={settings.playSounds}
      />

      {/* Reminder Notification Toasts Container */}
      <ReminderToastContainer
        notifications={notifications}
        onDismiss={dismissNotification}
        onSnooze={snoozeNotification}
      />
    </div>
  )
}

export default App
