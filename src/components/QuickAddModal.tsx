import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  Mic,
  Calendar,
  Flag,
  Hash,
  User,
  Plus,
  Sparkles,
  Check,
  Loader2,
  AlertCircle,
  Volume2,
} from 'lucide-react'
import { VoiceDictationSession } from '../services/speechToText'
import { parseNaturalLanguageTask } from '../utils/nlpParser'
import { sounds } from '../services/audio'

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
  onAddTask: (taskData: any) => void
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose, onAddTask }) => {
  const [taskText, setTaskText] = useState(
    'Finalize spatial audio review tomorrow at 3:00 PM with Tim #Design !high'
  )
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioVolume, setAudioVolume] = useState(0)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [speechError, setSpeechError] = useState<string | null>(null)
  const [subtasks, setSubtasks] = useState([
    { id: '1', title: 'Export spatial waveform tokens', done: false },
    { id: '2', title: 'Check iOS 2026 HIG guidelines for glass...', done: false },
  ])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')

  const sessionRef = useRef<VoiceDictationSession | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Clean up session on unmount or close
  useEffect(() => {
    if (!isOpen) {
      if (sessionRef.current) {
        sessionRef.current.stop().catch(() => {})
        sessionRef.current = null
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setIsRecording(false)
      setIsProcessing(false)
      setRecordingSeconds(0)
      setSpeechError(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  // Natural language parsing of current text
  const parsedMeta = parseNaturalLanguageTask(taskText)

  const handleToggleRecord = async () => {
    setSpeechError(null)

    if (isRecording) {
      // Stop recording
      setIsProcessing(true)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      if (sessionRef.current) {
        try {
          const finalTranscript = await sessionRef.current.stop()
          if (finalTranscript) {
            setTaskText(finalTranscript)
            sounds.playComplete(true)
          } else {
            sounds.playClick(true)
          }
        } catch (err: any) {
          setSpeechError(err.message || 'Speech recognition failed')
        }
        sessionRef.current = null
      }

      setIsRecording(false)
      setIsProcessing(false)
      setRecordingSeconds(0)
    } else {
      // Start recording
      try {
        sounds.playClick(true)
        setRecordingSeconds(0)

        const session = new VoiceDictationSession({
          onStart: () => {
            setIsRecording(true)
            setIsProcessing(false)
            timerRef.current = setInterval(() => {
              setRecordingSeconds(s => s + 1)
            }, 1000)
          },
          onInterim: interim => {
            setTaskText(interim)
          },
          onFinal: final => {
            setTaskText(final)
          },
          onVolumeChange: vol => {
            setAudioVolume(vol)
          },
          onError: err => {
            setSpeechError(err)
            setIsRecording(false)
            setIsProcessing(false)
            if (timerRef.current) {
              clearInterval(timerRef.current)
              timerRef.current = null
            }
          },
          onStop: () => {
            setIsRecording(false)
          },
        })

        sessionRef.current = session
        await session.start()
      } catch (err: any) {
        setSpeechError(err.message || 'Could not access microphone')
        setIsRecording(false)
        setIsProcessing(false)
      }
    }
  }

  const handleCreate = () => {
    const titleToUse = parsedMeta.cleanTitle || taskText.trim()
    if (!titleToUse) return

    onAddTask({
      title: titleToUse,
      priority: parsedMeta.priority || 'focus',
      subtasks: subtasks.map(s => ({ id: s.id, title: s.title, done: s.done })),
      tags: parsedMeta.tags.length > 0 ? parsedMeta.tags : ['Design', 'Systems'],
      time: parsedMeta.dateStr || 'Today',
    })
    sounds.playComplete(true)
    onClose()
  }

  const toggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(s => (s.id === id ? { ...s, done: !s.done } : s)))
  }

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return
    setSubtasks([...subtasks, { id: Date.now().toString(), title: newSubtaskTitle.trim(), done: false }])
    setNewSubtaskTitle('')
  }

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-md transition-all duration-300 select-none">
      {/* Sliding Sheet Drawer */}
      <div className="w-full max-w-[430px] rounded-t-[36px] bg-[#0c0d18]/95 border-t border-x border-white/20 p-5 pb-10 shadow-[0_-16px_50px_rgba(0,0,0,0.8),inset_0_1.5px_0_rgba(255,255,255,0.3)] animate-ios-fade-spring">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-wide text-white">New Task</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-2.5 h-2.5" /> SPEECH NLP ACTIVE
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* NLP Natural Language Input */}
        <div className="mt-4">
          <textarea
            rows={2}
            value={taskText}
            onChange={e => setTaskText(e.target.value)}
            className="w-full bg-transparent text-sm text-white/95 placeholder:text-neutral-500 resize-none outline-none font-sans leading-relaxed"
            placeholder="Tap mic or type: e.g. Design review tomorrow 3pm with Tim !high #Design"
          />
        </div>

        {/* Error notification if speech error occurs */}
        {speechError && (
          <div className="mt-2 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="leading-tight">{speechError}</span>
          </div>
        )}

        {/* Parsed NLP Smart Pills */}
        <div className="flex flex-wrap gap-1.5 mt-2 pb-3 border-b border-white/10">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-cyan-950/40 text-[#7dd3fc] border border-cyan-500/30">
            <Calendar className="w-3 h-3 text-[#00F0FF]" /> {parsedMeta.dateStr || 'Tomorrow, 3:00 PM'}
          </span>
          <span
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              parsedMeta.priority === 'focus'
                ? 'bg-rose-950/40 text-rose-300 border-rose-500/30'
                : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
            }`}
          >
            <Flag className="w-3 h-3" />{' '}
            {parsedMeta.priority === 'focus' ? 'High Priority' : 'Normal Priority'}
          </span>
          {parsedMeta.tags.length > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-purple-950/40 text-purple-300 border border-purple-500/30">
              <Hash className="w-3 h-3 text-purple-400" /> {parsedMeta.tags.join(' / ')}
            </span>
          )}
          {parsedMeta.assignee && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-950/40 text-blue-300 border border-blue-500/30">
              <User className="w-3 h-3 text-blue-400" /> {parsedMeta.assignee}
            </span>
          )}
        </div>

        {/* Live Voice Dictation Waveform Section */}
        <div
          className={`mt-3 p-3 rounded-[20px] border transition-all flex items-center justify-between ${
            isRecording
              ? 'bg-rose-950/25 border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
              : 'bg-white/[0.04] border-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleRecord}
              disabled={isProcessing}
              className={`p-2.5 rounded-full transition-all ${
                isRecording
                  ? 'bg-rose-500 text-white shadow-[0_0_16px_rgba(244,63,94,0.7)] animate-pulse'
                  : 'bg-white/10 text-[#00F0FF] hover:bg-white/15'
              }`}
              title={isRecording ? 'Tap to finish voice dictation' : 'Start Google Speech Dictation'}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
            <div>
              <div className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase flex items-center gap-1.5">
                <span>{isRecording ? 'RECORDING & TRANSCRIBING...' : 'LIVE SPEECH-TO-TEXT'}</span>
                {isRecording && (
                  <span className="inline-flex w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                )}
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                {/* Live reactive waveform bars scaled by voice volume */}
                {[14, 24, 18, 30, 16, 28, 20, 26, 12, 22, 16, 25].map((baseH, i) => {
                  const scale = isRecording ? Math.max(0.2, (audioVolume / 100) * 1.5) : 0.15
                  const calculatedHeight = Math.max(4, Math.round(baseH * scale))
                  return (
                    <span
                      key={i}
                      style={{ height: `${calculatedHeight}px` }}
                      className={`w-[2px] rounded-full transition-all duration-100 ${
                        isRecording
                          ? 'bg-rose-400 shadow-[0_0_6px_#f43f5e]'
                          : 'bg-[#00F0FF] shadow-[0_0_4px_#00F0FF]'
                      }`}
                    />
                  )
                })}
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">
            {isRecording ? formatSeconds(recordingSeconds) : '00:14'}
          </span>
        </div>

        {/* Smart Schedule Pills */}
        <div className="mt-3">
          <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
            SMART SCHEDULE
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setTaskText(prev => `${prev} today 5pm`.trim())}
              className="px-3 py-1.5 rounded-full text-xs bg-white/10 hover:bg-white/15 text-white/90 border border-white/15 transition-colors shrink-0"
            >
              ☀️ Today
            </button>
            <button
              type="button"
              onClick={() => setTaskText(prev => `${prev} tomorrow 3pm`.trim())}
              className="px-3 py-1.5 rounded-full text-xs bg-[#00F0FF]/20 text-[#7dd3fc] border border-[#00F0FF]/40 font-medium shrink-0"
            >
              📅 Tomorrow 3 PM
            </button>
            <button
              type="button"
              onClick={() => setTaskText(prev => `${prev} this weekend`.trim())}
              className="px-3 py-1.5 rounded-full text-xs bg-white/10 hover:bg-white/15 text-white/90 border border-white/15 transition-colors shrink-0"
            >
              🗓️ This Weekend
            </button>
          </div>
        </div>

        {/* Subtasks Checklist */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
              SUBTASKS ({subtasks.length})
            </span>
          </div>
          <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1 scrollbar-thin">
            {subtasks.map(s => (
              <div
                key={s.id}
                className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/8 text-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleSubtask(s.id)}
                  className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${
                    s.done
                      ? 'bg-emerald-400 text-neutral-950'
                      : 'border border-white/30 bg-white/5'
                  }`}
                >
                  {s.done && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <span className={`flex-1 truncate ${s.done ? 'line-through text-neutral-500' : 'text-neutral-200'}`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5 mt-2">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={e => setNewSubtaskTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSubtask()}
              placeholder="Add subtask..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-neutral-500 outline-none"
            />
            <button
              type="button"
              onClick={addSubtask}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-[#00F0FF] border border-white/10"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Create Task Button */}
        <button
          type="button"
          onClick={handleCreate}
          className="mt-4 w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00c6d4] via-[#00F0FF] to-[#38bdf8] text-neutral-950 font-bold text-sm tracking-wide shadow-[0_0_24px_rgba(0,240,255,0.6),inset_0_1px_0_rgba(255,255,255,0.7)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create Task</span>
        </button>
      </div>
    </div>
  )
}
