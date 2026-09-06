# 📘 Todobar Pro — Comprehensive Product & Developer Documentation

> **Todobar Pro** is a next-generation productivity application that mirrors the **Apple 2026 Liquid Glass Design System** (iOS 26 / VisionOS HIG) and Google Stitch prototype. It delivers real-time tri-core tab synchronization, persistent flow-state sprint tracking, and a dual-engine Speech-to-Text pipeline powered by Google Cloud Speech-to-Text and Web Speech APIs.

---

## 🚀 Quick Reference

| Resource | Link / Value |
| :--- | :--- |
| **Live Production Web App** | [https://todobar-pro.onrender.com](https://todobar-pro.onrender.com) |
| **GitHub Repository** | [roshan-pixel/TODOBAR----DSKTOP----NPM](https://github.com/roshan-pixel/TODOBAR----DSKTOP----NPM.git) |
| **Google Cloud Project** | `utility-melody-390608` (Project Number: `355900045452`) |
| **Cloud Speech Service** | `speech.googleapis.com` (Cloud Speech-to-Text v1 API) |
| **Design Framework** | Apple Liquid Glass 2026 / Tailwind CSS v4 / React 19 / TypeScript |

---

## 🌟 1. Core Feature Walkthrough

### 1.1 Today View (Primary Hub)
* **Dynamic Radial Completion Dial**:
  * Calculates real-time completion status mathematically:
    $$\text{Percentage} = \text{Math.round}\left(\frac{\text{Completed}}{\text{Total}} \times 100\right)$$
  * Live SVG circle `strokeDashoffset` smoothly transitions upon checking or unchecking tasks.
  * Displays dynamic fraction (e.g. `4 of 7`, `5 of 7`, `7 of 7`) and remaining counter (`+3 left today`, `All done today!`).
* **Dynamic Category Determination (`WORK` vs `DESIGN SYSTEM`)**:
  * **`DESIGN SYSTEM`**: Filtered for Figma tokens, specs, SwiftUI Liquid Glass design components.
  * **`WORK`**: Filtered for core OS alignment, micro-haptics, Keynote pitch decks, and daily standups.
  * **`ALL TASKS`**: Full workload overview.
  * Selecting any chip filters the visible Priority Focus cards and Completed Today list instantly.
* **Hero Focus Mode Dynamic Pill Banner**:
  * Displays the live ticking countdown time from the active sprint (`24m remaining` or `Paused (24:02)`).
  * Displays the title of the current priority task.
  * Animated equalizer bars indicate active focus state.
  * One-click navigation straight to the Focus tab.
* **Flow State Streak Card**:
  * Displays current day streak (e.g. `🔥 12 day streak`) and active flow beacon.
* **Priority Focus Cards**:
  * High-end squircle checkboxes with smooth haptic audio feedback.
  * Subtask progress meter (e.g. `3/4 subtasks resolved` with gradient progress bar).
  * Team member avatars and attachment pill counters.
  * Auto-sort toggle to order tasks by urgency.
* **Completed Today Accordion**:
  * Minimalist liquid glass cards with jewel-like checkmarks and strikethrough styling.
  * Show/Hide collapsible toggle to maintain a clean workspace.

---

### 1.2 Focus Mode View (Deep Work Chamber)
* **Persistent Real-Time Stopwatch**:
  * Centralized timer engine continues ticking across tab switches without resetting.
  * Large circular SVG countdown dial with vibrant cyan drop-shadow.
* **Interactive Controls**:
  * **Pause / Resume**: The primary CTA button toggles between:
    * `Pause Focus` (Cyan glow, active ticking countdown)
    * `Resume Focus` (Emerald gradient, paused state with amber status ring)
  * **Sprint Adjustments**: `-5m` and `+5m` buttons to extend or shorten sprints on the fly.
  * **Reset (`RotateCcw`)**: Returns the timer to target sprint duration (45:00).
  * **Complete Sprint (`SkipForward`)**: Finishes sprint, awards victory chime, and transitions to the Done view.
* **Spatial Audio Soundscape Deck**:
  * Procedurally synthesizes Binaural Alpha Waves (432Hz) with live equalizer visualization.
* **Biometric & Shield Telemetry**:
  * Monitors resting heart rate (60 BPM) and silenced notifications (27 Silenced).

---

### 1.3 Done View (Session Completed & Accomplishments)
* **Conquered Sprint Telemetry**:
  * Displays actual elapsed focus sprint minutes (e.g. `45m 00s Focus Time`).
  * Shows total completed tasks today dynamically synced from the Today tab.
* **Conquered Tasks History**:
  * Scrollable list of all tasks completed today with completion timestamps.
* **Return Navigation**:
  * Prominent `Return to Today's Tasks` button for quick return to the daily dashboard.

---

### 1.4 Dynamic Island Emulation
* Embedded directly into the iPhone status bar container.
* Real-time hardware/software states:
  * `focusing`: Pulsing emerald indicator with live ticking timer and equalizer waves.
  * `paused`: Amber indicator showing paused status.
  * `completed`: Cyan checkmark badge celebrating sprint completion.
* Tap-to-inspect: Tapping the Dynamic Island toggles focus inspection or launches the mini-break modal.

---

## 🎙️ 2. Dual-Engine Speech-to-Text Pipeline

Todobar Pro integrates an enterprise-grade dual-engine speech recognition pipeline:

```
User Spoken Voice
       │
       ▼
navigator.mediaDevices.getUserMedia()
       │
       ├─────────────────────────────────┬─────────────────────────────────┐
       ▼                                 ▼                                 ▼
Web Audio AnalyserNode           Browser Web Speech API            MediaRecorder Audio Blob
       │                                 │                                 │
       ▼                                 ▼                                 ▼
Live Waveform Bars              Instant Streaming Text              Base64 Audio Payload
 (Reactive volume 0-100)        (Zero-delay UI feedback)                   │
                                         │                                 ▼
                                         │                    Google Cloud Speech-to-Text v1
                                         │                      (speech.googleapis.com)
                                         │                                 │
                                         ▼                                 ▼
                                  Combined Transcript Text <───────────────┘
                                         │
                                         ▼
                                 NLP Parser Engine
                           (!high, tomorrow 3pm, #Design)
                                         │
                                         ▼
                             Structured TodayTask Created
```

### 2.1 Google Cloud Speech-to-Text API Configuration
* **Endpoint**: `https://speech.googleapis.com/v1/speech:recognize?key={API_KEY}`
* **Project**: `utility-melody-390608`
* **Features**:
  * Automatic punctuation recognition.
  * Multi-language audio transcription.
  * Base64 WebM / WAV audio payload processing.

### 2.2 NLP Natural Language Task Parser
The NLP engine (`src/utils/nlpParser.ts`) scans transcribed voice or typed input for smart tokens:

| Token / Syntax | Extracted Metadata | Example Spoken Input |
| :--- | :--- | :--- |
| `!high`, `urgent`, `critical`, `asap` | Priority: `focus` (High Priority) | `"Prepare keynote slides !high"` |
| `!low`, `later`, `someday` | Priority: `later` (Low Priority) | `"Read article later"` |
| `#<tag>` (e.g. `#Design`, `#Work`) | Category Tags | `"Sync Figma components #Design"` |
| `tomorrow 3pm`, `today 5pm` | Smart Schedule Date | `"Design review tomorrow at 3:00 PM"` |
| `with <Name>` | Assignee Binding | `"Executive review with Tim and Alan"` |

---

## 🛠️ 3. Developer & Setup Guide

### 3.1 Prerequisites
* Node.js v18+ (tested on Node v24.13.0)
* npm or pnpm

### 3.2 Installation
```bash
# Clone the repository
git clone https://github.com/roshan-pixel/TODOBAR----DSKTOP----NPM.git
cd TODOBAR----DSKTOP----NPM

# Install dependencies
npm install

# Start local development server
npm run dev
```

### 3.3 Environment Variables (`.env`)
```env
VITE_GOOGLE_SPEECH_API_KEY=AIzaSyApaRpV3SMllSsMvdALP81zmQlrV_9w7k0
```

### 3.4 Production Build & Testing
```bash
# Type check and build production bundle
npm run build

# Preview local production bundle
npm run preview -- --port 4173

# Run automated Playwright end-to-end tests
python scratch/test_interactive_sync.py
python scratch/test_quick_add_speech.py
```

---

## 🎨 4. Apple 2026 Liquid Glass Design System Specifications

### 4.1 Color Palette

| Token | Hex Value | Semantic Role |
| :--- | :--- | :--- |
| `--liquid-cyan` | `#00F0FF` | Primary action glow, focus highlights, active tabs |
| `--liquid-emerald` | `#10B981` | Completed checks, flow state indicators, success |
| `--liquid-amber` | `#F59E0B` | Streak badges, sprint paused indicators |
| `--liquid-rose` | `#F43F5E` | High-priority flags, recording states |
| `--glass-dark` | `#0A0E20` | Primary backdrop gradient start |
| `--glass-deep` | `#030610` | Primary backdrop gradient end |

### 4.2 CSS Material Shaders
* **Multi-layer Specular Highlights**: Inset shadows (`inset 0 1px 0 rgba(255, 255, 255, 0.2)`) mimic top-lit refraction on thick curved glass.
* **Optical Backdrop Blur**: `backdrop-blur-2xl` with saturation boost (`saturate(190%)`) preserves legibility over dynamic wallpapers.
* **Spring Transitions**: Apple standard `cubic-bezier(0.16, 1, 0.3, 1)` applied to all transform and opacity transitions.

---

## 🚢 5. Deployment Architecture

Todobar Pro is continuously deployed on **Render**:
1. Code pushed to GitHub branch `main`.
2. Render detects commit and triggers automated build: `npm run build`.
3. Vite compiles and minifies assets into `dist/`.
4. Render serves the static single-page app with HTTPS and global CDN caching.
