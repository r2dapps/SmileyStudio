# 💖 Smiley Studio (v1.0.0)

A custom, high-performance, mobile-optimized **Pro Vocal Recording & Pitch Trainer Progressive Web Application (PWA)** designed specifically for singer **Smiley**.

![Smiley Studio App Icon](public/icon-512.png)

---

## 🌟 Live Demo & Web App URL

- **Hosted Web App**: [https://r2dapps.github.io/SmileyStudio/](https://r2dapps.github.io/SmileyStudio/)
- **GitHub Repository**: [https://github.com/r2dapps/SmileyStudio](https://github.com/r2dapps/SmileyStudio)

---

## 🌟 Features Overview

- **🎙️ Real-time Recording Studio**: Low-latency live mic monitoring, pitch display, and high-quality multi-stream audio recording.
- **🎛️ Pro Vocal FX Rack**: 7 real-time DSP audio effect plugins:
  - **Noise Gate**: Mutes room noise hiss automatically.
  - **Parametric EQ**: Highpass, Lowpass, Bandpass, and Peaking frequency shaping.
  - **Dynamics Compressor**: Studio volume leveling.
  - **Tube Saturation**: Harmonic warmth waveshaper.
  - **Stereo Chorus**: LFO modulated voice doubler.
  - **Feedback Delay**: Echo repeat circuit.
  - **Concert Reverb**: Algorithmic convolver space reverb.
- **📱 Instagram-Style Bottom Navigation**: Floating glassmorphism tab bar with active glowing icons:
  - **Studio** (`/`): Realtime spectrum visualizer & quick preset cards.
  - **FX Rack** (`/fx`): Master vocal chain sliders.
  - **Tracks** (`/tracks`): Karaoke backing track song loader & volume mixer.
  - **Vault** (`/vault`): IndexedDB local song history, audio playback, WAV & WebM exports.
  - **Practice** (`/practice`): Interactive Chromatic Pitch Tuner needle gauge & Studio Metronome (40-240 BPM).
  - **Settings** (`/settings`): Mobile performance modes & app information.
- **⚡ Progressive Web App (PWA)**: Installable on iOS/Android home screens, full offline support, and Screen Wake Lock API to prevent display sleep during vocal takes.
- **💸 100% Free**: Zero subscription fees, zero server costs, hosted 100% free on GitHub Pages.

---

## 🛠️ Tech Stack & Architecture

- **Core**: React 18, TypeScript, Vite, React Router v6, Zustand, Tailwind CSS.
- **Audio Core**: Decoupled Web Audio API DSP Engine (`StudioController.ts`, `GraphBuilder.ts`, `AudioEngine.ts`).
- **Database**: Offline dual-store IndexedDB (`recordings` metadata + `blobs` audio store).

---

## 🚀 How to Host on GitHub Pages (Auto-Deployment)

### Method 1: Automatic GitHub Actions (Recommended)
This repository includes a pre-configured GitHub Actions workflow in `.github/workflows/deploy.yml`.

1. Push your project code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Smiley Studio v1.0.0"
   git remote add origin https://github.com/r2dapps/SmileyStudio.git
   git push -u origin main
   ```
2. GitHub Actions will **automatically build and deploy** your app to GitHub Pages!
3. In your GitHub repository settings, go to **Pages** -> Set Source to **`gh-pages` branch**.

### Method 2: Manual Deployment Script
You can also deploy manually at any time with one terminal command:
```bash
npm run deploy
```

---

## 💻 Local Development Setup

```bash
# Clone repository
git clone https://github.com/r2dapps/SmileyStudio.git

# Navigate into directory
cd SmileyStudio

# Install dependencies
npm install

# Start local dev server
npm run dev

# Production build
npm run build
```

---

Made with ❤️ for **Smiley**.
