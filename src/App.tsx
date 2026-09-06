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
import { useTasks } from './hooks/useTasks'

export type PrototypeScreen = 'today' | 'focus' | 'completed' | 'calendar' | 'account'

export function App() {
  const [currentScreen, setCurrentScreen] = useState<PrototypeScreen>('today')
  const [activeTab, setActiveTab] = useState<TodobarTab>('today')
  const [islandMode, setIslandMode] = useState<IslandMode>('focusing')
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [isMiniBreakOpen, setIsMiniBreakOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSimulatedFrame, setIsSimulatedFrame] = useState(true)
  const [isAudioActive, setIsAudioActive] = useState(true)

  const { tasks, toggleTask, addTask } = useTasks(true)

  // Tab Selection
  const handleSelectTab = (tab: TodobarTab) => {
    setActiveTab(tab)
    if (tab === 'today') {
      setCurrentScreen('today')
    } else if (tab === 'focus') {
      setCurrentScreen('focus')
      setIslandMode('focusing')
    } else if (tab === 'done') {
      setCurrentScreen('completed')
      setIslandMode('completed')
    }
  }

  // Focus Handlers
  const handleStartFocus = () => {
    setCurrentScreen('focus')
    setActiveTab('focus')
    setIslandMode('focusing')
  }

  const handlePauseFocus = () => {
    setIsMiniBreakOpen(true)
    setIslandMode('paused')
  }

  const handleResumeSprint = () => {
    setIsMiniBreakOpen(false)
    setIslandMode('focusing')
  }

  const handleEndSprintEarly = () => {
    setIsMiniBreakOpen(false)
    setCurrentScreen('today')
    setActiveTab('today')
    setIslandMode('idle')
  }

  const handleCompleteSession = () => {
    setCurrentScreen('completed')
    setActiveTab('done')
    setIslandMode('completed')
  }

  const handleReturnToToday = () => {
    setCurrentScreen('today')
    setActiveTab('today')
    setIslandMode('idle')
  }

  return (
    <IPhone16ProMaxFrame
      isSimulatedFrame={isSimulatedFrame}
      onToggleFrame={() => setIsSimulatedFrame(!isSimulatedFrame)}
      islandMode={islandMode}
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
            onStartFocus={handleStartFocus}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenCalendar={() => setCurrentScreen('calendar')}
            onOpenAccount={() => setCurrentScreen('account')}
          />
        )}

        {currentScreen === 'focus' && (
          <FocusModeView
            onBack={() => {
              setCurrentScreen('today')
              setActiveTab('today')
            }}
            onPause={handlePauseFocus}
            onComplete={handleCompleteSession}
          />
        )}

        {currentScreen === 'completed' && (
          <SessionCompletedView onReturnToToday={handleReturnToToday} />
        )}

        {currentScreen === 'calendar' && (
          <CalendarTimelineView
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
          addTask(taskData.title, taskData)
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
        onClose={() => setIsSearchOpen(false)}
      />
    </IPhone16ProMaxFrame>
  )
}
