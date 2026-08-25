import React, { useState, useMemo, useRef, useEffect } from 'react'
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
import { sounds } from './services/audio'

const VIEW_ORDER: SectionView[] = ['today', 'calendar', 'lists', 'pomodoro', 'settings']

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
  const [slideDirection, setSlideDirection] = useState<'right' | 'left' | 'pop'>('pop')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false)
  const quickInputRef = useRef<HTMLInputElement>(null)

  // Listen for mobile viewport resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle Liquid Slide View Navigation (like iPhone apps)
  const handleSelectView = (nextView: SectionView) => {
    if (nextView === activeView) return
    const currentIdx = VIEW_ORDER.indexOf(activeView)
    const nextIdx = VIEW_ORDER.indexOf(nextView)
    setSlideDirection(nextIdx > currentIdx ? 'right' : 'left')
    setActiveView(nextView)
  }

  // Touch Swipe Gesture Navigation (Swipe left/right to change view)
  const touchStartRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 })
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y
      const elapsedTime = Date.now() - touchStartRef.current.time

      // Check for horizontal swipe gesture (quick and mostly horizontal)
      if (elapsedTime < 500 && Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        const currentIdx = VIEW_ORDER.indexOf(activeView)
        if (deltaX < 0 && currentIdx < VIEW_ORDER.length - 1) {
          // Swipe Left -> Next Tab
          sounds.playClick(settings.playSounds)
          handleSelectView(VIEW_ORDER[currentIdx + 1])
        } else if (deltaX > 0 && currentIdx > 0) {
          // Swipe Right -> Prev Tab
          sounds.playClick(settings.playSounds)
          handleSelectView(VIEW_ORDER[currentIdx - 1])
        }
      }
    }
  }

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
    handleSelectView('pomodoro')
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
      handleSelectView(view)
      if (!settings.isExpanded) {
        updateSettings({ isExpanded: true })
      }
    },
    onOpenSearch: () => setIsSearchOpen(true),
    onOpenHelp: () => handleSelectView('settings'),
    onFocusInput: () => {
      if (!settings.isExpanded) updateSettings({ isExpanded: true })
      handleSelectView('today')
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
    const springCurve = 'transform 380ms cubic-bezier(0.32, 0.72, 0, 1), opacity 380ms cubic-bezier(0.32, 0.72, 0, 1)'

    // Mobile Full-Sheet Presentation
    if (isMobile) {
      return {
        width: '100%',
        maxWidth: '100%',
        height: '100%',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        transform: settings.isExpanded ? 'translateY(0%)' : 'translateY(100%)',
        borderTopLeftRadius: settings.isExpanded ? '20px' : '0px',
        borderTopRightRadius: settings.isExpanded ? '20px' : '0px',
        transition: springCurve,
      }
    }

    const isRight = settings.dockEdge === 'right'
    const isLeft = settings.dockEdge === 'left'
    const isTop = settings.dockEdge === 'top'

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

  const activeAnimationClass =
    slideDirection === 'right'
      ? 'animate-ios-slide-right'
      : slideDirection === 'left'
      ? 'animate-ios-slide-left'
      : 'animate-ios-fade-spring'

  return (
    <div
      style={themeCssVariables}
      className={`relative w-screen h-screen overflow-hidden select-none font-sans text-text-primary ${
        settings.themeMode === 'dark' ? 'dark' : ''
      }`}
    >
      {/* 60fps Living Liquid Fluid Gradient Mesh Background (iOS 26 Liquid Glass System) */}
      <div className="living-liquid-bg">
        <div className="living-liquid-mesh-1" />
        <div className="living-liquid-mesh-2" />
        <div className="living-liquid-mesh-3" />
      </div>

      {/* Desktop Workspace Wallpaper Backdrop */}
      {settings.desktopSimulatorMode && !isMobile && (
        <DesktopSimulator
          backdropImage={settings.backdropImage}
          backdropBlur={settings.backdropBlur}
          dockEdge={settings.dockEdge}
        />
      )}

      {/* Draggable Liquid Glass Edge Handle / Mobile Floating Quick Pill */}
      <EdgeHandle
        dockEdge={settings.dockEdge}
        handlePosition={settings.handlePosition}
        handleHeight={settings.handleHeight}
        isExpanded={settings.isExpanded}
        onToggle={toggleSidebar}
        onUpdatePosition={(pos) => updateSettings({ handlePosition: pos })}
        playSounds={settings.playSounds}
        openTasksCount={openTasksCount}
        isMobile={isMobile}
      />

      {/* Ambient Liquid Backlight Glow */}
      {settings.isExpanded && !isMobile && (
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
        className={`fixed z-40 flex overflow-hidden liquid-glass-sidebar ${
          isMobile ? 'flex-col' : 'flex-row'
        }`}
      >
        {/* Desktop Vertical Command Rail */}
        {!isMobile && (
          <CommandRail
            activeView={activeView}
            onSelectView={handleSelectView}
            onOpenSearch={() => setIsSearchOpen(true)}
            onToggleSidebar={toggleSidebar}
            isExpanded={settings.isExpanded}
            dockEdge={settings.dockEdge}
            playSounds={settings.playSounds}
            totalOpenTasks={openTasksCount}
            totalCompletedTasks={completedTasksCount}
            isMobile={false}
          />
        )}

        {/* Liquid Glass View Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Native macOS / iOS Liquid Unified Title Bar */}
          <MacTitleBar
            title={viewTitles[activeView]}
            activeView={activeView}
            dockEdge={settings.dockEdge}
            isExpanded={settings.isExpanded}
            onToggleSidebar={toggleSidebar}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenAdd={() => {
              handleSelectView('today')
              setTimeout(() => quickInputRef.current?.focus(), 50)
            }}
            playSounds={settings.playSounds}
            totalTasks={totalTasksCount}
            completedTasks={completedTasksCount}
            isMobile={isMobile}
          />

          {/* Active Liquid Content View with iOS Slide Transition & Touch Gestures */}
          <main
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="flex-1 overflow-hidden relative touch-scroll-ios"
          >
            <div key={activeView} className={`h-full w-full ${activeAnimationClass}`}>
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
            </div>
          </main>

          {/* Mobile Liquid Bottom Navigation Bar */}
          {isMobile && (
            <CommandRail
              activeView={activeView}
              onSelectView={handleSelectView}
              onOpenSearch={() => setIsSearchOpen(true)}
              onToggleSidebar={toggleSidebar}
              isExpanded={settings.isExpanded}
              dockEdge={settings.dockEdge}
              playSounds={settings.playSounds}
              totalOpenTasks={openTasksCount}
              totalCompletedTasks={completedTasksCount}
              isMobile={true}
            />
          )}
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
