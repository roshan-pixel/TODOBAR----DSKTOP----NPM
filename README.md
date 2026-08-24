# 🌟 Todobar Pro — Liquid Glass Desktop Productivity Sidebar

<div align="center">

![Todobar Pro Banner](https://img.shields.io/badge/Design-Apple%20Liquid%20Glass%202026-blue?style=for-the-badge&logo=apple)
![React 19](https://img.shields.io/badge/React-19.x-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.x-38bdf8?style=for-the-badge&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A high-performance dockable desktop productivity sidebar inspired by Apple's 2026 Liquid Glass Design System.**

[✨ Features](#-features) • [🏛️ Architecture](./ARCHITECTURE.md) • [🚀 Quick Start](#-quick-start) • [⌨️ Shortcuts](#-keyboard-shortcuts) • [🎨 Themes](#-12-liquid-glass-themes)

</div>

---

## 🌟 Highlights & Features

### 🪟 1. Authentic Apple Liquid Glass System (macOS 26 / VisionOS HIG)
- **3D Refractive Glass Tiles**: Tactile squircle icons with ambient specular highlights (`linear-gradient(180deg, rgba(255,255,255,0.22) 0%, ...)`), inner refraction borders, and multi-layer backdrop blurs.
- **Continuous Morphing Capsule**: Sliding navigation rail with spring physics (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Zero Clipping Proportions**: Unified cards with balanced corner radiuses and generous breathing room.

### ⚡ 2. Non-Intrusive Dockable Sidebar
- **Draggable Liquid Glass Handle**: Reposition the dock handle anywhere along the screen edge or click to toggle with <kbd>Alt</kbd> + <kbd>T</kbd>.
- **Multi-Edge Docking**: Dock to **Right Edge**, **Left Edge**, **Top Dropdown**, or **Floating Window**.
- **Desktop Simulator**: Includes a built-in macOS wallpaper backdrop simulator to test transparency over real desktops.

### 🎯 3. Smart Task Management & Natural Language Processing
- **Smart NLP Quick Capture**: Type `!focus #dev Ship v2.0` to automatically set priority and extract tag pills.
- **3-Tier Priority System**: 🔥 **Focus Priority**, ⚡ **Standard Tasks**, 🌙 **Later / Backlog**.
- **Collapsible Subtasks Checklist**: Multi-step subtask tracking with live completion counters.
- **Time Estimates & Reminders**: Native notification daemon with sound alarms and custom snooze presets.

### ⏱️ 4. Focus Chamber (Pomodoro)
- **Glowing SVG Circular Progress Dial**: Real-time animated circular progress arc synced to the active objective.
- **Customizable Intervals**: 25m Focus, 5m Short Break, 15m Long Break presets.

### 📅 5. Calendar Agenda & Multi-Project Lists
- **Month Grid Agenda**: View daily task distributions and schedule agenda objectives by date.
- **Project Collections**: Color-coded custom folders with pin-to-today indicators.

### 🎵 6. Procedural Web Audio Soundscapes
- Built-in sound synthesizer generates tactile click feedback, soothing completion chimes, and timer alarms without external audio files.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Description |
| :--- | :--- |
| <kbd>Alt</kbd> + <kbd>T</kbd> | Toggle Sidebar (Expand / Retract) |
| <kbd>Esc</kbd> | Retract Sidebar / Dismiss Modal |
| <kbd>/</kbd> or <kbd>⌘</kbd> + <kbd>/</kbd> | Open Global Spotlight Search |
| <kbd>N</kbd> | Focus Quick Task Capture Input |
| <kbd>⌘</kbd> + <kbd>1</kbd> | Today's Objectives View |
| <kbd>⌘</kbd> + <kbd>2</kbd> | Calendar Agenda View |
| <kbd>⌘</kbd> + <kbd>3</kbd> | Project Collections View |
| <kbd>⌘</kbd> + <kbd>4</kbd> | Focus Chamber (Pomodoro) |
| <kbd>⌘</kbd> + <kbd>,</kbd> | Preferences & Theme Palette |

---

## 🎨 12 Liquid Glass Themes

1. 🌌 **Liquid Aurora** (Deep cyan & sapphire glow)
2. 🪟 **Frosted Glass** (Apple neutral titanium frost)
3. 🍇 **Neon Amethyst** (Vibrant purple obsidian)
4. 🌲 **Emerald Glaze** (Forest glass & mint highlights)
5. 🌅 **Sunset Horizon** (Rose & amber solar bloom)
6. 🌙 **Midnight Titanium** (High contrast deep space)
7. 🌸 **Sakura Petal** (Soft cherry blossom translucency)
8. ❄️ **Arctic Ice** (Glacial sky blue acrylic)
9. 🍫 **Amber Warmth** (Warm golden honey glass)
10. 🌊 **Pacific Deep** (Marine sapphire & turquoise)
11. 🛡️ **Cyber Obsidian** (Dark tactical carbon)
12. ⚡ **Electric Lime** (High-energy radioactive neon)

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation
```bash
# Clone the repository
git clone https://github.com/roshan-pixel/TODOBAR----DSKTOP----NPM.git

# Navigate into the project folder
cd TODOBAR----DSKTOP----NPM

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will launch on `http://localhost:5173`.

### Production Build
```bash
npm run build
```
Optimized static bundles will be compiled to the `dist/` directory.

---

## 🏛️ Architecture Documentation

For complete technical documentation on the component hierarchy, state flow, storage engine, and Web Audio synthesis, read [**ARCHITECTURE.md**](./ARCHITECTURE.md).

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
