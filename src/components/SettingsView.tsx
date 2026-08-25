import React, { useState } from 'react'
import {
  Volume2,
  VolumeX,
  Download,
  Upload,
  Layout,
  Check,
  Image as ImageIcon,
} from 'lucide-react'
import { AppSettings, Task, CustomList, DockEdge } from '../types'
import { THEME_PRESETS_LIST, WALLPAPER_PRESETS } from '../constants/themes'
import { LiquidGlassIcon } from './LiquidGlassIcon'
import { sounds } from '../services/audio'

interface SettingsViewProps {
  settings: AppSettings
  onUpdateSettings: (patch: Partial<AppSettings>) => void
  onResetSettings: () => void
  tasks: Task[]
  lists: CustomList[]
  onImportData: (data: { tasks?: Task[]; lists?: CustomList[] }) => void
  onRestoreSampleData: () => void
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetSettings,
  tasks,
  lists,
  onImportData,
  onRestoreSampleData,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null)

  const handleExportJson = () => {
    sounds.playClick(settings.playSounds)
    const exportPayload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tasks,
      lists,
      settings,
    }
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `todobar-pro-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (parsed.tasks || parsed.lists) {
          onImportData({ tasks: parsed.tasks, lists: parsed.lists })
          setImportStatus('Backup restored successfully!')
          sounds.playComplete(settings.playSounds)
        } else {
          setImportStatus('Invalid backup file format.')
        }
      } catch (err) {
        setImportStatus('Failed to parse JSON backup.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-1 gap-3.5 scrollbar-thin pb-28 md:pb-6">
      {/* 1. Liquid Glass Theme Selector */}
      <div className="flex flex-col gap-2.5 p-3.5 rounded-2xl liquid-glass-card shadow-lg">
        <div className="flex items-center gap-2">
          <LiquidGlassIcon type="sparkles" size="xs" />
          <h2 className="text-xs font-extrabold text-text-primary drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            Liquid Glass Visual Palette
          </h2>
        </div>
        <p className="text-[11px] text-text-muted font-medium">
          Apple Liquid Glass materials with dynamic specular highlights and light refraction.
        </p>

        <div className="grid grid-cols-2 gap-2 mt-1">
          {THEME_PRESETS_LIST.map((theme) => {
            const isSelected = settings.visualStyle === theme.id
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  sounds.playClick(settings.playSounds)
                  onUpdateSettings({ visualStyle: theme.id, themeMode: theme.mode })
                }}
                className={`flex flex-col gap-1.5 p-2.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-accent bg-accent/25 ring-2 ring-white/60 shadow-xl shadow-accent/40 scale-[1.02] backdrop-blur-xl'
                    : 'border-white/10 hover:border-white/20 bg-white/[0.04] hover:bg-white/[0.08]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full shadow-md" style={{ backgroundColor: theme.accentColor, boxShadow: `0 0 8px ${theme.accentColor}` }} />
                    <span className="text-xs font-extrabold text-text-primary">{theme.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-accent stroke-[3]" />}
                </div>
                <span className="text-[10px] text-text-muted leading-tight line-clamp-1 font-medium">
                  {theme.description}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Workspace Backdrop Simulator */}
      <div className="flex flex-col gap-2.5 p-4 rounded-3xl liquid-glass-card shadow-xl">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-accent" />
          <h2 className="text-xs font-extrabold text-text-primary drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            Workspace Backdrop Wallpaper
          </h2>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-text-secondary">Desktop Wallpaper Preview</span>
          <input
            type="checkbox"
            checked={settings.desktopSimulatorMode}
            onChange={(e) => onUpdateSettings({ desktopSimulatorMode: e.target.checked })}
            className="rounded accent-accent cursor-pointer"
          />
        </div>

        {settings.desktopSimulatorMode && (
          <div className="grid grid-cols-3 gap-2 mt-1">
            {WALLPAPER_PRESETS.map((wp) => (
              <button
                key={wp.id}
                type="button"
                onClick={() => onUpdateSettings({ backdropImage: wp.url })}
                className={`relative rounded-2xl overflow-hidden h-14 border transition-all cursor-pointer ${
                  settings.backdropImage === wp.url ? 'ring-2 ring-accent border-accent scale-105 shadow-xl' : 'border-white/10 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={wp.url} alt={wp.name} className="w-full h-full object-cover" />
                <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] font-bold text-white text-center py-0.5 backdrop-blur-md">
                  {wp.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Dock Placement & Geometry */}
      <div className="flex flex-col gap-3 p-4 rounded-3xl liquid-glass-card shadow-xl">
        <div className="flex items-center gap-2">
          <Layout className="w-4 h-4 text-accent" />
          <h2 className="text-xs font-extrabold text-text-primary drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            Dock Edge & Window Geometry
          </h2>
        </div>

        {/* Dock Edge Liquid Morphing Segmented Picker */}
        {(() => {
          const dockEdges: DockEdge[] = ['right', 'left', 'top', 'floating']
          const activeEdgeIdx = Math.max(0, dockEdges.indexOf(settings.dockEdge))

          return (
            <div
              role="tablist"
              aria-label="Dock edge placement"
              className="relative grid grid-cols-4 p-1 rounded-2xl liquid-segmented-bar text-xs select-none"
            >
              {/* Dynamic Morphing Liquid Pill with Apple Spring Easing */}
              <div
                className="absolute top-1 bottom-1 rounded-xl pointer-events-none transition-all duration-380 ease-[cubic-bezier(0.34,1.45,0.64,1)] liquid-morph-capsule"
                style={{
                  left: `calc(${activeEdgeIdx * 25}% + 2px)`,
                  width: 'calc(25% - 4px)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '2px',
                    left: '15%',
                    right: '15%',
                    height: '40%',
                    borderRadius: '50%',
                    background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.35) 0%, transparent 75%)',
                    filter: 'blur(1.5px)',
                  }}
                />
              </div>

              {dockEdges.map((edge) => {
                const isSelected = settings.dockEdge === edge
                return (
                  <button
                    key={edge}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => {
                      sounds.playClick(settings.playSounds)
                      onUpdateSettings({ dockEdge: edge })
                    }}
                    className={`py-2 z-10 capitalize font-medium transition-all cursor-pointer text-center active:scale-95 text-xs ${
                      isSelected
                        ? 'text-white font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]'
                        : 'text-white/50 hover:text-white/80'
                    }`}
                  >
                    {edge}
                  </button>
                )
              })}
            </div>
          )
        })()}

        {/* Panel Width Slider */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs font-extrabold text-text-secondary">
            <span>Panel Width</span>
            <span className="font-mono text-accent">{settings.panelWidth}px</span>
          </div>
          <input
            type="range"
            min="340"
            max="640"
            step="10"
            value={settings.panelWidth}
            onChange={(e) => onUpdateSettings({ panelWidth: parseInt(e.target.value, 10) })}
            className="accent-accent cursor-pointer"
          />
        </div>

        {/* Corner Radius Slider */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs font-extrabold text-text-secondary">
            <span>Window Corner Radius</span>
            <span className="font-mono text-accent">{settings.panelRadius}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="36"
            step="2"
            value={settings.panelRadius}
            onChange={(e) => onUpdateSettings({ panelRadius: parseInt(e.target.value, 10) })}
            className="accent-accent cursor-pointer"
          />
        </div>
      </div>

      {/* 4. Audio Feedback & Sound FX */}
      <div className="flex items-center justify-between p-4 rounded-3xl liquid-glass-card shadow-xl">
        <div className="flex items-center gap-3">
          {settings.playSounds ? (
            <Volume2 className="w-5 h-5 text-accent" />
          ) : (
            <VolumeX className="w-5 h-5 text-text-muted" />
          )}
          <div>
            <h2 className="text-xs font-extrabold text-text-primary">Sound Chimes & Haptics</h2>
            <p className="text-[11px] text-text-muted font-medium">Procedural Web Audio completion bells</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onUpdateSettings({ playSounds: !settings.playSounds })}
          className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-md ${
            settings.playSounds ? 'bg-accent text-white shadow-accent/40 hover:scale-105' : 'bg-white/10 text-text-muted'
          }`}
        >
          {settings.playSounds ? 'Enabled' : 'Muted'}
        </button>
      </div>

      {/* 5. Backup, Restore & Reset */}
      <div className="flex flex-col gap-2.5 p-4 rounded-3xl liquid-glass-card shadow-xl">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-accent" />
          <h2 className="text-xs font-extrabold text-text-primary drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            Data Storage & Backup
          </h2>
        </div>

        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <button
            type="button"
            onClick={handleExportJson}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-2xl liquid-glass-pill text-xs font-extrabold text-text-primary hover:border-accent transition-all cursor-pointer shadow-lg hover:scale-105"
          >
            <Download className="w-3.5 h-3.5 text-accent" />
            <span>Export Backup</span>
          </button>

          <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-2xl liquid-glass-pill text-xs font-extrabold text-text-primary hover:border-accent transition-all cursor-pointer shadow-lg hover:scale-105">
            <Upload className="w-3.5 h-3.5 text-accent" />
            <span>Restore</span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>
        </div>

        {importStatus && (
          <div className="text-xs font-bold text-accent bg-accent/20 p-3 rounded-2xl text-center shadow-md">
            {importStatus}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => {
              if (confirm('Restore starter demo sample tasks?')) {
                onRestoreSampleData()
              }
            }}
            className="text-xs font-extrabold text-accent hover:underline cursor-pointer"
          >
            Load Sample Tasks
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm('Reset all preferences to default values?')) {
                onResetSettings()
              }
            }}
            className="text-xs font-extrabold text-rose-400 hover:underline cursor-pointer"
          >
            Reset Defaults
          </button>
        </div>
      </div>
    </div>
  )
}
