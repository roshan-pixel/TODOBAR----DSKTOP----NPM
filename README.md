# 🌟 Todobar Pro — Liquid Glass Productivity System

<div align="center">

![Todobar Pro Banner](https://img.shields.io/badge/Design-Apple%20Liquid%20Glass%202026-blue?style=for-the-badge&logo=apple)
![React 19](https://img.shields.io/badge/React-19.x-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.x-38bdf8?style=for-the-badge&logo=tailwindcss)
![Google Cloud](https://img.shields.io/badge/Google%20Cloud-Speech--to--Text%20v1-4285f4?style=for-the-badge&logo=googlecloud)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A high-performance productivity system with Apple 2026 Liquid Glass aesthetics, tri-core tab synchronization, real-time focus stopwatch, and Google Cloud Speech-to-Text integration.**

[🌐 Live Web App](https://todobar-pro.onrender.com) • [📘 Detailed Documentation](./DOCUMENTATION.md) • [🏛️ System Architecture](./ARCHITECTURE.md) • [🚀 Quick Start](#-quick-start)

</div>

---

## 🌟 What's New & Core Capabilities

### 📱 1. Google Stitch Prototype & Apple 2026 Liquid Glass Experience
* **iPhone 16 Pro Max Simulation & Full-Bleed View**: High-fidelity Titanium chassis simulator with embedded Dynamic Island and home indicator, plus responsive full-bleed mode for real mobile devices.
* **Refractive Glass Physics**: Specular highlights, backdrop blur filters (`blur(48px)` with `saturate(220%)`), and Apple standard spring animations (`cubic-bezier(0.16, 1, 0.3, 1)`).

### 🔄 2. Tri-Core Tab State Synchronization
* **Today Hub**:
  * **Dynamic Radial Dial**: Mathematically calculated from live tasks (`${percentage}%`, `${completed} of ${total}`, and `+${left} left today`).
  * **Dynamic Category Chips**: Interactive `ALL TASKS`, `WORK`, and `DESIGN SYSTEM` chips with live task counters and list filtering.
  * **Hero Focus Banner**: Displays real-time ticking focus countdown and the active priority task.
* **Focus Chamber**:
  * **Global Real-Time Countdown**: Countdown continues ticking across tab switches without resetting.
  * **Interactive Controls**: Instant Pause/Resume CTA with dynamic liquid glass color states, `-5m`/`+5m` adjustments, and reset.
  * **Spatial Audio Soundscapes**: Procedural binaural alpha waves (432Hz) with live volume visualizer.
* **Done & Accomplishments**:
  * Displays total conquered tasks, actual focus minutes elapsed, and completion timestamps.

### 🎙️ 3. Google Cloud Speech-to-Text & Voice Dictation
* **Dual-Engine Speech Recognition**:
  * **Google Cloud Speech-to-Text API** (`speech.googleapis.com`) using GCP Project `utility-melody-390608`.
  * **Browser Web Speech API** (`webkitSpeechRecognition`) for instant zero-latency live streaming transcription as you speak.
* **Live Reactive Waveform Visualizer**:
  * AudioContext `AnalyserNode` drives real-time waveform bars that bounce with the user's voice.
* **Smart Natural Language Parser (NLP)**:
  * Automatically extracts priorities (`!high`, `urgent` $\rightarrow$ High Priority), dates/times (`tomorrow 3pm` $\rightarrow$ Smart Schedule), tags (`#Design`), and assignees (`with Tim`).

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/roshan-pixel/TODOBAR----DSKTOP----NPM.git
cd TODOBAR----DSKTOP----NPM

# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```

---

## 📚 Documentation & Architecture

* **[📘 Detailed Product Documentation (`DOCUMENTATION.md`)](./DOCUMENTATION.md)**: Feature walkthrough, NLP syntax guide, developer setup, and Google Cloud configuration.
* **[🏛️ Technical Architecture Specification (`ARCHITECTURE.md`)](./ARCHITECTURE.md)**: System topology, Mermaid sequence diagrams, state sync flows, and optical shader stacks.

---

## 📄 License
MIT License. Crafted with precision for high-performance productivity.
