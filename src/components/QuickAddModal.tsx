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
  Clock,
  Zap,
  Wand2,
  Trash2,
  Tag,
  Volume2,
} from 'lucide-react'
import { VoiceDictationSession } from '../services/speechToText'
import {
  parseNaturalLanguageTask,
  generateAISubtasks,
  cleanSpokenFillers,
  getSmartSuggestedDeadlines,
  AISubtask,
} from '../utils/nlpParser'
import { sounds } from '../services/audio'

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
  onAddTask: (taskData: any) => void
}

const QUICK_HASHTAGS = ['work', 'design', 'dev', 'urgent', 'client', 'personal', 'meeting']

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose, onAddTask }) => {
  const [taskText, setTaskText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioVolume, setAudioVolume] = useState(0)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [speechError, setSpeechError] = useState<string | null>(null)
  const [selectedDeadline, setSelectedDeadline] = useState<string | null>(null)
  const [selectedPriority, setSelectedPriority] = useState<'focus' | 'normal' | 'later' | null>(null)
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [subtasks, setSubtasks] = useState<AISubtask[]>([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false)

  const sessionRef = useRef<VoiceDictationSession | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Reset state on open; cleanup on close
  useEffect(() => {
    if (isOpen) {
      setTaskText('')
      setSelectedDeadline(null)
      setSelectedPriority(null)
      setActiveTags([])
      setSubtasks([])
      setSpeechError(null)
      setIsRecording(false)
      setIsProcessing(false)
      setRecordingSeconds(0)
      setTimeout(() => inputRef.current?.focus(), 150)
    } else {
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

  // Live NLP metadata parsing
  const parsedMeta = parseNaturalLanguageTask(taskText)

  // Effective attributes
  const effectiveDeadline = selectedDeadline || parsedMeta.dateStr
  const effectivePriority = selectedPriority || parsedMeta.priority || 'normal'
  const combinedTags = Array.from(new Set([...parsedMeta.tags, ...activeTags]))
  const suggestedDeadlines = getSmartSuggestedDeadlines()

  // Real-time microphone dictation handler
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
            // Real-time live typing streaming into the input!
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

  // AI Feature: Break task into tactical subtasks
  const handleAIBreakdown = () => {
    const titleToBreak = parsedMeta.cleanTitle || taskText.trim() || 'Focus Objective'
    setIsGeneratingSubtasks(true)
    sounds.playClick(true)

    setTimeout(() => {
      const generated = generateAISubtasks(titleToBreak)
      setSubtasks(generated)
      setIsGeneratingSubtasks(false)
      sounds.playComplete(true)
    }, 250)
  }

  // AI Feature: Clean speech fillers and format into executive action item
  const handleAIPolish = () => {
    const polished = cleanSpokenFillers(taskText)
    if (polished) {
      setTaskText(polished)
      sounds.playClick(true)
    }
  }

  // Toggle hashtag chip
  const toggleHashtag = (tag: string) => {
    sounds.playClick(true)
    if (activeTags.includes(tag)) {
      setActiveTags(activeTags.filter(t => t !== tag))
    } else {
      setActiveTags([...activeTags, tag])
    }
  }

  const toggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(s => (s.id === id ? { ...s, done: !s.done } : s)))
    sounds.playClick(true)
  }

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id))
    sounds.playClick(true)
  }

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return
    setSubtasks([
      ...subtasks,
      { id: `custom-${Date.now()}`, title: newSubtaskTitle.trim(), done: false },
    ])
    setNewSubtaskTitle('')
    sounds.playClick(true)
  }

  const handleCreate = () => {
    const titleToUse = parsedMeta.cleanTitle || taskText.trim()
    if (!titleToUse) return

    const isHigh = effectivePriority === 'focus'
    const finalDeadline = effectiveDeadline || 'Today'

    onAddTask({
      title: titleToUse,
      priority: effectivePriority,
      subtasks: subtasks.map(s => ({ id: s.id, title: s.title, done: s.done })),
      tags: combinedTags.length > 0 ? combinedTags : ['Work'],
      time: finalDeadline,
      category: combinedTags[0] ? `#${combinedTags[0]}` : parsedMeta.category,
      categoryType: combinedTags.some(t => /design|ui|ux|figma/i.test(t)) ? 'design' : 'work',
    })

    sounds.playComplete(true)
    onClose()
  }

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const titleNotEmpty = (parsedMeta.cleanTitle || taskText).trim().length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-md transition-all duration-300 select-none">
      {/* Sliding Sheet Drawer */}
      <div className="w-full max-w-[430px] rounded-t-[36px] bg-[#0c0d18]/95 border-t border-x border-white/20 p-5 pb-8 shadow-[0_-16px_50px_rgba(0,0,0,0.8),inset_0_1.5px_0_rgba(255,255,255,0.3)] animate-ios-fade-spring max-h-[92vh] overflow-y-auto scrollbar-thin">
        {/* Top Handlebar */}
        <div className="w-12 h-1 rounded-full bg-white/20 mx-auto mb-3" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-white">Create Task</span>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
              <Sparkles className="w-3 h-3 animate-pulse" /> AI VOICE POWERED
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

        {/* Hero Real-Time Speech Microphone Bar */}
        <div
          className={`mt-4 p-3.5 rounded-[24px] border transition-all duration-300 ${
            isRecording
              ? 'bg-gradient-to-r from-rose-950/40 via-red-900/30 to-rose-950/40 border-rose-500/50 shadow-[0_0_24px_rgba(244,63,94,0.35)]'
              : 'bg-white/[0.05] border-white/12 hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Central Pulsing Liquid Glass Mic Button */}
              <button
                type="button"
                onClick={handleToggleRecord}
                disabled={isProcessing}
                className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-95 ${
                  isRecording
                    ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.8)] scale-105 ring-4 ring-rose-500/30'
                    : 'bg-gradient-to-br from-[#00F0FF]/25 to-cyan-500/10 text-[#00F0FF] border border-[#00F0FF]/40 hover:bg-[#00F0FF]/30 shadow-[0_0_16px_rgba(0,240,255,0.25)]'
                }`}
                title={isRecording ? 'Tap to finish voice dictation' : 'Tap to speak your task'}
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <Mic className={`w-5 h-5 ${isRecording ? 'animate-pulse text-white' : ''}`} />
                )}
                {isRecording && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                  </span>
                )}
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-mono font-bold tracking-wider uppercase ${
                      isRecording ? 'text-rose-400' : 'text-neutral-300'
                    }`}
                  >
                    {isRecording ? 'LISTENING & TYPING LIVE...' : 'TAP MIC TO SPEAK TASK'}
                  </span>
                  {isRecording && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {formatSeconds(recordingSeconds)}
                    </span>
                  )}
                </div>

                {/* Dynamic Audio Visualizer Soundwave */}
                <div className="flex items-center gap-1 mt-1.5 h-3">
                  {[12, 22, 16, 28, 14, 26, 18, 24, 10, 20, 16, 25, 14, 19].map((baseH, i) => {
                    const scale = isRecording ? Math.max(0.2, (audioVolume / 100) * 1.6) : 0.18
                    const calculatedHeight = Math.max(3, Math.round(baseH * scale))
                    return (
                      <span
                        key={i}
                        style={{ height: `${calculatedHeight}px` }}
                        className={`w-[2.5px] rounded-full transition-all duration-75 ${
                          isRecording
                            ? 'bg-rose-400 shadow-[0_0_6px_#f43f5e]'
                            : 'bg-[#00F0FF]/70 shadow-[0_0_4px_#00F0FF]'
                        }`}
                      />
                    )
                  })}
                </div>
              </div>
            </div>

            {/* AI Polish Button */}
            {taskText.length > 5 && (
              <button
                type="button"
                onClick={handleAIPolish}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white text-[11px] font-medium border border-white/10 transition-colors"
                title="AI Polish: remove speech fillers and format cleanly"
              >
                <Wand2 className="w-3 h-3 text-[#00F0FF]" />
                <span>Polish</span>
              </button>
            )}
          </div>
        </div>

        {/* Speech Error Banner */}
        {speechError && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="leading-tight">{speechError}</span>
          </div>
        )}

        {/* Real-time Streaming Input Field */}
        <div className="mt-3 relative rounded-[20px] bg-white/[0.04] border border-white/10 focus-within:border-[#00F0FF]/50 focus-within:bg-white/[0.07] p-3.5 transition-all">
          <textarea
            ref={inputRef}
            rows={2}
            value={taskText}
            onChange={e => setTaskText(e.target.value)}
            className="w-full bg-transparent text-sm text-white/95 placeholder:text-neutral-500 resize-none outline-none font-sans leading-relaxed"
            placeholder="Type or speak: e.g. Finish client wireframes tomorrow at 3pm #design urgent"
          />
          {isRecording && (
            <span className="inline-block w-2 h-4 bg-[#00F0FF] animate-pulse ml-1 align-middle rounded-sm" />
          )}
        </div>

        {/* AI Deadline Prompt & Smart Deadline Suggester */}
        {titleNotEmpty && !effectiveDeadline ? (
          <div className="mt-3 p-3 rounded-[20px] bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span>Target Deadline?</span>
                <span className="text-[10px] text-amber-400/80 font-normal">
                  (When should this be completed?)
                </span>
              </div>
            </div>

            {/* Smart Suggested Deadline Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {suggestedDeadlines.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedDeadline(chip.value)
                    sounds.playClick(true)
                  }}
                  className="px-2.5 py-1.5 rounded-full text-xs font-medium bg-white/10 hover:bg-amber-400/20 hover:text-amber-200 text-white border border-white/15 hover:border-amber-400/40 transition-all shrink-0 active:scale-95"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          effectiveDeadline && (
            <div className="mt-3 flex items-center justify-between p-2 px-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs">
              <div className="flex items-center gap-1.5 text-cyan-300 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>Deadline:</span>
                <span className="font-bold text-white">{effectiveDeadline}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDeadline(null)}
                className="text-[10px] font-mono text-cyan-400 hover:text-white underline ml-2"
              >
                Change
              </button>
            </div>
          )
        )}

        {/* Priority Selector (P1 / P2 / P3) */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1">
              <Flag className="w-3 h-3" /> PRIORITY LEVEL
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              {effectivePriority === 'focus'
                ? '🔴 P1 - High Priority'
                : effectivePriority === 'later'
                ? '🟢 P3 - Low Priority'
                : '🟡 P2 - Medium Priority'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedPriority('focus')
                sounds.playClick(true)
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                effectivePriority === 'focus'
                  ? 'bg-rose-500/25 text-rose-300 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.35)]'
                  : 'bg-white/[0.04] text-neutral-400 hover:text-white border-white/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_6px_#f43f5e]" />
              <span>P1 High</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedPriority('normal')
                sounds.playClick(true)
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                effectivePriority === 'normal'
                  ? 'bg-amber-500/25 text-amber-300 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                  : 'bg-white/[0.04] text-neutral-400 hover:text-white border-white/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
              <span>P2 Medium</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedPriority('later')
                sounds.playClick(true)
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                effectivePriority === 'later'
                  ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                  : 'bg-white/[0.04] text-neutral-400 hover:text-white border-white/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
              <span>P3 Low</span>
            </button>
          </div>
        </div>

        {/* Hashtags Bar */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1">
              <Hash className="w-3 h-3" /> HASHTAGS & CATEGORIES
            </span>
            {combinedTags.length > 0 && (
              <span className="text-[10px] font-mono text-purple-300">
                {combinedTags.length} active
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {QUICK_HASHTAGS.map(tag => {
              const isActive = combinedTags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleHashtag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-1 border ${
                    isActive
                      ? 'bg-purple-500/30 text-purple-200 border-purple-400/60 shadow-[0_0_10px_rgba(168,85,247,0.35)]'
                      : 'bg-white/[0.04] text-neutral-400 hover:text-white border-white/10'
                  }`}
                >
                  <span className="text-purple-400">#</span>
                  <span>{tag}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* AI Action Breakdown & Subtasks Section */}
        <div className="mt-3.5 p-3.5 rounded-[22px] bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono font-bold text-neutral-300 uppercase tracking-wide">
                SUBTASKS ({subtasks.length})
              </span>
              {parsedMeta.estimatedMinutes && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/40 text-cyan-300 border border-cyan-500/30">
                  ⏱️ ~{parsedMeta.estimatedMinutes}m effort
                </span>
              )}
            </div>

            {/* AI Breakdown Button */}
            <button
              type="button"
              onClick={handleAIBreakdown}
              disabled={isGeneratingSubtasks}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#00F0FF]/20 to-cyan-500/20 text-[#00F0FF] text-[11px] font-bold border border-[#00F0FF]/40 hover:bg-[#00F0FF]/30 active:scale-95 transition-all shadow-[0_0_12px_rgba(0,240,255,0.2)]"
              title="Generate AI action plan with tactical subtasks"
            >
              {isGeneratingSubtasks ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              <span>✨ Break into Steps</span>
            </button>
          </div>

          {/* Subtask items list */}
          {subtasks.length > 0 && (
            <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1 scrollbar-thin mb-2">
              {subtasks.map(s => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs transition-all hover:bg-white/[0.07]"
                >
                  <button
                    type="button"
                    onClick={() => toggleSubtask(s.id)}
                    className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${
                      s.done
                        ? 'bg-emerald-400 text-neutral-950 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                        : 'border border-white/30 bg-white/5 hover:border-[#00F0FF]'
                    }`}
                  >
                    {s.done && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                  <span
                    className={`flex-1 truncate ${
                      s.done ? 'line-through text-neutral-500' : 'text-neutral-200'
                    }`}
                  >
                    {s.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSubtask(s.id)}
                    className="p-1 text-neutral-500 hover:text-rose-400 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Quick Add Subtask Input */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={e => setNewSubtaskTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSubtask()}
              placeholder="Add step or action item..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-white/25"
            />
            <button
              type="button"
              onClick={addSubtask}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-[#00F0FF] border border-white/10 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Create Task Action Button */}
        <button
          type="button"
          onClick={handleCreate}
          disabled={!titleNotEmpty}
          className={`mt-4 w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${
            titleNotEmpty
              ? 'bg-gradient-to-r from-[#00c6d4] via-[#00F0FF] to-[#38bdf8] text-neutral-950 shadow-[0_0_24px_rgba(0,240,255,0.6),inset_0_1px_0_rgba(255,255,255,0.7)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
              : 'bg-white/10 text-neutral-500 cursor-not-allowed border border-white/10'
          }`}
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create Task</span>
        </button>
      </div>
    </div>
  )
}

