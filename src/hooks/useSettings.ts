import { useState, useEffect, useCallback } from 'react'
import { SidebarSettings, DockEdge, ThemePreset, ThemeMode } from '../types'
import { scheduleLocalStorageWrite, getFromStorage } from '../services/storage'

const SETTINGS_STORAGE_KEY = 'todobar.v2.settings'

export const DEFAULT_SETTINGS: SidebarSettings = {
  dockEdge: 'right',
  panelWidth: 420,
  handlePosition: 45, // percentage from top
  handleHeight: 90,
  tabVisibility: 'always',
  themeMode: 'dark',
  visualStyle: 'obsidian',
  density: 'normal',
  taskSortMode: 'priority',
  showCompleted: true,
  playSounds: true,
  notificationsEnabled: true,
  autoSnoozeMinutes: 10,
  motionSpeed: 240,
  panelRadius: 20,
  surfaceOpacity: 95,
  backdropBlur: 12,
  backdropImage: '',
  backdropImageName: '',
  backdropOpacity: 65,
  backdropDim: 20,
  globalShortcut: 'Alt + T',
  launchAtLogin: true,
  defaultPriority: 'normal',
  isExpanded: true,
  desktopSimulatorMode: true,
}

function sanitizeSettings(val: Partial<SidebarSettings>): SidebarSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...val,
    panelWidth: Math.min(Math.max(val.panelWidth ?? DEFAULT_SETTINGS.panelWidth, 320), 680),
    handlePosition: Math.min(Math.max(val.handlePosition ?? DEFAULT_SETTINGS.handlePosition, 5), 95),
    handleHeight: Math.min(Math.max(val.handleHeight ?? DEFAULT_SETTINGS.handleHeight, 48), 160),
    surfaceOpacity: Math.min(Math.max(val.surfaceOpacity ?? DEFAULT_SETTINGS.surfaceOpacity, 40), 100),
    backdropBlur: Math.min(Math.max(val.backdropBlur ?? DEFAULT_SETTINGS.backdropBlur, 0), 30),
    backdropOpacity: Math.min(Math.max(val.backdropOpacity ?? DEFAULT_SETTINGS.backdropOpacity, 0), 100),
    backdropDim: Math.min(Math.max(val.backdropDim ?? DEFAULT_SETTINGS.backdropDim, 0), 90),
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<SidebarSettings>(() => {
    return sanitizeSettings(getFromStorage<Partial<SidebarSettings>>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS))
  })

  // Debounced auto-save
  useEffect(() => {
    return scheduleLocalStorageWrite(SETTINGS_STORAGE_KEY, JSON.stringify(settings), 400)
  }, [settings])

  const updateSettings = useCallback((patch: Partial<SidebarSettings>) => {
    setSettings(prev => sanitizeSettings({ ...prev, ...patch }))
  }, [])

  const toggleSidebar = useCallback(() => {
    setSettings(prev => ({ ...prev, isExpanded: !prev.isExpanded }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  return {
    settings,
    updateSettings,
    toggleSidebar,
    resetSettings,
  }
}
