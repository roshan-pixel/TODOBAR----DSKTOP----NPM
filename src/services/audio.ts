// Procedural audio synthesis using standard Web Audio API
// High performance, zero external sound assets needed

class SoundEngine {
  private ctx: AudioContext | null = null

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  /**
   * Play crisp completion chime (two harmonized bright bell tones)
   */
  playComplete(enabled = true) {
    if (!enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'sine'
    osc2.type = 'triangle'

    // Major 6th chord progression up
    osc1.frequency.setValueAtTime(587.33, now) // D5
    osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.08) // A5

    osc2.frequency.setValueAtTime(1174.66, now) // D6
    osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08) // E6

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.18, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.45)
    osc2.stop(now + 0.45)
  }

  /**
   * Play subtle click / pop for button presses or tab transitions
   */
  playClick(enabled = true) {
    if (!enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(400, now)
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.04)

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.04)
  }

  /**
   * Play urgent alert bell for reminders
   */
  playReminder(enabled = true) {
    if (!enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const freqs = [659.25, 783.99, 987.77, 1318.51] // E5, G5, B5, E6

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const startOffset = idx * 0.09

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + startOffset)

      gain.gain.setValueAtTime(0.001, now + startOffset)
      gain.gain.linearRampToValueAtTime(0.15, now + startOffset + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + 0.5)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + startOffset)
      osc.stop(now + startOffset + 0.5)
    })
  }

  /**
   * Play pomodoro timer finish triumph sound
   */
  playTimerDone(enabled = true) {
    if (!enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const startTime = now + i * 0.12

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, startTime)

      gain.gain.setValueAtTime(0.001, startTime)
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startTime)
      osc.stop(startTime + 0.6)
    })
  }
}

export const sounds = new SoundEngine()
