// Google Cloud Speech-to-Text v1 & Web Speech API Integration
// Seamless dual-engine: Real-time browser recognition + Google Cloud API

const GOOGLE_API_KEY =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GOOGLE_SPEECH_API_KEY ||
  'AIzaSyApaRpV3SMllSsMvdALP81zmQlrV_9w7k0'

export interface SpeechRecognitionHandlers {
  onInterim?: (text: string) => void
  onFinal?: (text: string) => void
  onError?: (error: string) => void
  onVolumeChange?: (volume: number) => void
  onStart?: () => void
  onStop?: () => void
}

/**
 * Transcribe an audio Blob using the Google Cloud Speech-to-Text REST API
 */
export async function transcribeWithGoogleCloud(
  audioBlob: Blob,
  languageCode = 'en-US'
): Promise<string> {
  const base64Audio = await blobToBase64(audioBlob)

  const payload = {
    config: {
      languageCode,
      enableAutomaticPunctuation: true,
      model: 'default',
    },
    audio: {
      content: base64Audio,
    },
  }

  const endpoint = `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const msg = errorData?.error?.message || `HTTP ${response.status}: Failed to recognize speech`
    throw new Error(msg)
  }

  const data = await response.json()
  const results = data.results || []

  if (results.length === 0) {
    return ''
  }

  const transcript = results
    .map((r: { alternatives?: { transcript?: string }[] }) => r.alternatives?.[0]?.transcript || '')
    .filter(Boolean)
    .join(' ')
    .trim()

  return transcript
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      // Strip data:audio/*;base64, prefix
      const base64 = result.split(',')[1] || result
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Unified Voice Dictation Session:
 * - Listens via Web Speech API for instant live-streaming transcription
 * - Concurrently records audio with MediaRecorder + AudioContext for Google Cloud STT & live waveform
 */
export class VoiceDictationSession {
  private recognition: any = null
  private mediaRecorder: MediaRecorder | null = null
  private audioStream: MediaStream | null = null
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private animFrameId: number | null = null
  private recordedChunks: Blob[] = []
  private isRecording = false
  private accumulatedTranscript = ''

  constructor(private handlers: SpeechRecognitionHandlers = {}) {}

  public async start(): Promise<void> {
    if (this.isRecording) return
    this.isRecording = true
    this.accumulatedTranscript = ''
    this.recordedChunks = []

    try {
      // 1. Request microphone access
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      })

      // 2. Set up AudioContext & Analyser for real-time waveform visualizer
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.audioContext = new AudioCtx()
        const source = this.audioContext.createMediaStreamSource(this.audioStream)
        this.analyser = this.audioContext.createAnalyser()
        this.analyser.fftSize = 64
        source.connect(this.analyser)

        const sampleBuffer = new Uint8Array(this.analyser.frequencyBinCount)
        const pollVolume = () => {
          if (!this.isRecording || !this.analyser) return
          this.analyser.getByteFrequencyData(sampleBuffer)
          let sum = 0
          for (let i = 0; i < sampleBuffer.length; i++) {
            sum += sampleBuffer[i]
          }
          const avg = sum / sampleBuffer.length
          const normalized = Math.min(100, Math.round((avg / 128) * 100))
          this.handlers.onVolumeChange?.(normalized)
          this.animFrameId = requestAnimationFrame(pollVolume)
        }
        pollVolume()
      }

      // 3. Set up MediaRecorder for Google Cloud Speech-to-Text
      try {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : ''

        this.mediaRecorder = mimeType
          ? new MediaRecorder(this.audioStream, { mimeType })
          : new MediaRecorder(this.audioStream)

        this.mediaRecorder.ondataavailable = e => {
          if (e.data.size > 0) {
            this.recordedChunks.push(e.data)
          }
        }
        this.mediaRecorder.start(250)
      } catch (err) {
        console.warn('MediaRecorder not available or failed:', err)
      }

      // 4. Set up Browser Web Speech API for real-time zero-delay streaming
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

      if (SpeechRecognitionClass) {
        try {
          this.recognition = new SpeechRecognitionClass()
          this.recognition.continuous = true
          this.recognition.interimResults = true
          this.recognition.lang = 'en-US'

          this.recognition.onresult = (event: any) => {
            let interim = ''
            let final = ''

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const transcriptPiece = event.results[i][0].transcript
              if (event.results[i].isFinal) {
                final += transcriptPiece + ' '
              } else {
                interim += transcriptPiece
              }
            }

            if (final) {
              this.accumulatedTranscript += final
              this.handlers.onFinal?.(this.accumulatedTranscript.trim())
            }

            if (interim) {
              const combined = (this.accumulatedTranscript + ' ' + interim).trim()
              this.handlers.onInterim?.(combined)
            }
          }

          this.recognition.onerror = (e: any) => {
            console.warn('SpeechRecognition error:', e.error)
            if (e.error !== 'no-speech') {
              this.handlers.onError?.(e.error)
            }
          }

          this.recognition.start()
        } catch (e) {
          console.warn('SpeechRecognition start failed:', e)
        }
      }

      this.handlers.onStart?.()
    } catch (err: any) {
      this.isRecording = false
      const message =
        err.name === 'NotAllowedError'
          ? 'Microphone permission denied. Please allow microphone access in your browser settings.'
          : err.message || 'Failed to start microphone recording'
      this.handlers.onError?.(message)
      throw err
    }
  }

  public async stop(): Promise<string> {
    if (!this.isRecording) return this.accumulatedTranscript

    this.isRecording = false

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId)
      this.animFrameId = null
    }

    if (this.recognition) {
      try {
        this.recognition.stop()
      } catch (_) {}
      this.recognition = null
    }

    let audioBlob: Blob | null = null
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      await new Promise<void>(resolve => {
        if (!this.mediaRecorder) return resolve()
        this.mediaRecorder.onstop = () => {
          if (this.recordedChunks.length > 0) {
            audioBlob = new Blob(this.recordedChunks, {
              type: this.mediaRecorder?.mimeType || 'audio/webm',
            })
          }
          resolve()
        }
        this.mediaRecorder.stop()
      })
    }

    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop())
      this.audioStream = null
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {})
      this.audioContext = null
    }

    this.handlers.onStop?.()

    // If Web Speech API already provided transcript, use it
    if (this.accumulatedTranscript.trim()) {
      return this.accumulatedTranscript.trim()
    }

    // Otherwise, fallback to Google Cloud Speech-to-Text API with recorded audioBlob
    if (audioBlob) {
      try {
        const cloudTranscript = await transcribeWithGoogleCloud(audioBlob)
        if (cloudTranscript) {
          this.accumulatedTranscript = cloudTranscript
          this.handlers.onFinal?.(cloudTranscript)
          return cloudTranscript
        }
      } catch (err: any) {
        console.warn('Google Cloud Speech-to-Text fallback error:', err)
      }
    }

    return this.accumulatedTranscript.trim()
  }

  public getIsRecording(): boolean {
    return this.isRecording
  }
}
