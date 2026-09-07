import React, { useState } from 'react'
import { IPhone16ProMaxFrame } from './components/IPhone16ProMaxFrame'
import { DynamicIsland, IslandMode } from './components/DynamicIsland'
import { TodobarDock, TodobarTab } from './components/TodobarDock'
import { TodayView } from './components/TodayView'
import { QuickAddModal } from './components/QuickAddModal'
import { FocusModeView } from './components/FocusModeView'
import { SessionCompletedView } from './components/SessionCompletedView'
import { MiniBreakModal } from './components/MiniBreakModal'
import { CalendarTimelineView } from './components/CalendarTimelineView'
import { GlobalSearchModal } from './components/GlobalSearchModal'
import { AccountProfileView } from './components/AccountProfileView'
import { useTodayTasks } from './hooks/useTodayTasks'
import { useFocusTimer } from './hooks/useFocusTimer'

export type PrototypeScreen = 'today' | 'focus' | 'completed' | 'calendar' | 'account'

export function App() {
  const [currentScreen, setCurrentScreen] = useState<PrototypeScreen>('today')
  const [activeTab, setActiveTab] = useState<TodobarTab>('today')
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [isMiniBreakOpen, setIsMiniBreakOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSimulatedFrame, setIsSimulatedFrame] = useState(true)
  const [isAudioActive, setIsAudioActive] = useState(true)

  // Centralized Tasks State - Synchronized across all screens
  const {
    tasks,
    activeTasks,
    completedTasks,
    toggleTask,
    addTask,
    deleteTask,
  } = useTodayTasks()

  // Sprints & Centralized Focus Stopwatch - Ticks down in real time across tabs
  const handleSessionComplete = () => {
    setCurrentScreen('completed')
    setActiveTab('done')
  }

  const timer = useFocusTimer({
    initialSeconds: 24 * 60 + 7, // 24:07 active sprint progress
    defaultTotalSeconds: 45 * 60, // 45:00 target
    onComplete: handleSessionComplete,
  })

  // Determine Dynamic Island status dynamically
  const getIslandMode = (): IslandMode => {
    if (currentScreen === 'completed') return 'completed'
    if (timer.isRunning) return 'focusing'
    return 'paused'
  }

  // Tab Selection
  const handleSelectTab = (tab: TodobarTab) => {
    setActiveTab(tab)
    if (tab === 'today') {
      setCurrentScreen('today')
    } else if (tab === 'focus') {
      setCurrentScreen('focus')
    } else if (tab === 'done') {
      setCurrentScreen('completed')
    }
  }

  // Focus Handlers
  const handleStartFocus = () => {
    setCurrentScreen('focus')
    setActiveTab('focus')
    if (!timer.isRunning) {
      timer.resume()
    }
  }

  const handleResumeSprint = () => {
    setIsMiniBreakOpen(false)
    timer.resume()
  }

  const handleEndSprintEarly = () => {
    setIsMiniBreakOpen(false)
    timer.pause()
    setCurrentScreen('today')
    setActiveTab('today')
  }

  const handleReturnToToday = () => {
    setCurrentScreen('today')
    setActiveTab('today')
  }

  // Active task for focus sprint
  const activeFocusTask = activeTasks.find(t => t.priority === 'focus') || activeTasks[0]

  return (
    <IPhone16ProMaxFrame
      isSimulatedFrame={isSimulatedFrame}
      onToggleFrame={() => setIsSimulatedFrame(!isSimulatedFrame)}
      islandMode={getIslandMode()}
      timeRemaining={timer.timeString}
      onTapIsland={() => {
        if (currentScreen === 'focus') {
          setIsMiniBreakOpen(true)
        } else {
          handleStartFocus()
        }
      }}
    >
      {/* Main Active Screen Content */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        {currentScreen === 'today' && (
          <TodayView
            tasks={tasks}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onStartFocus={handleStartFocus}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenCalendar={() => setCurrentScreen('calendar')}
            onOpenAccount={() => setCurrentScreen('account')}
            focusTimeString={timer.timeString}
            focusMinutesRemaining={timer.minutes}
            isFocusRunning={timer.isRunning}
            focusTaskTitle={activeFocusTask?.title || 'No active focus task'}
          />
        )}

        {currentScreen === 'focus' && (
          <FocusModeView
            onBack={() => {
              setCurrentScreen('today')
              setActiveTab('today')
            }}
            onComplete={handleSessionComplete}
            secondsRemaining={timer.secondsRemaining}
            totalSeconds={timer.totalSeconds}
            isRunning={timer.isRunning}
            onTogglePlayPause={timer.togglePlayPause}
            onReset={() => timer.reset()}
            onAdjust={timer.adjust}
            activeTask={activeFocusTask}
            onToggleTask={toggleTask}
          />
        )}

        {currentScreen === 'completed' && (
          <SessionCompletedView
            onReturnToToday={handleReturnToToday}
            completedTasks={completedTasks}
            focusMinutesElapsed={Math.max(1, Math.round((timer.totalSeconds - timer.secondsRemaining) / 60)) || 45}
          />
        )}

        {currentScreen === 'calendar' && (
          <CalendarTimelineView
            tasks={tasks}
            onBack={() => {
              setCurrentScreen('today')
              setActiveTab('today')
            }}
          />
        )}

        {currentScreen === 'account' && (
          <AccountProfileView
            onBack={() => {
              setCurrentScreen('today')
              setActiveTab('today')
            }}
          />
        )}
      </div>

      {/* Persistent Todobar Dock (Shown on primary dashboard screens) */}
      {(currentScreen === 'today' || currentScreen === 'focus' || currentScreen === 'completed') && (
        <TodobarDock
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onQuickAdd={() => setIsQuickAddOpen(true)}
          isAudioActive={isAudioActive}
          onToggleAudio={() => setIsAudioActive(!isAudioActive)}
        />
      )}

      {/* Quick Add Task Modal Drawer */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddTask={taskData => {
          addTask({
            title: taskData.title,
            priority: taskData.priority,
            category: taskData.category || (taskData.tags?.[0] ? `#${taskData.tags[0]}` : undefined),
            time: taskData.time,
            categoryType: taskData.categoryType || (taskData.tags?.some((t: string) => /design|ui|ux|figma/i.test(t)) ? 'design' : 'work'),
            subtasksCount: taskData.subtasks?.length > 0 ? `${taskData.subtasks.filter((s: any) => s.done).length}/${taskData.subtasks.length}` : undefined,
            subtaskProgress: taskData.subtasks?.length > 0 ? Math.round((taskData.subtasks.filter((s: any) => s.done).length / taskData.subtasks.length) * 100) : undefined,
          })
        }}
      />

      {/* Mini-Break & Pause Modal */}
      <MiniBreakModal
        isOpen={isMiniBreakOpen}
        onResumeSprint={handleResumeSprint}
        onEndEarly={handleEndSprintEarly}
      />

      {/* Global Search & Omnibox Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        tasks={tasks}
        onClose={() => setIsSearchOpen(false)}
      />
    </IPhone16ProMaxFrame>
  )
}
