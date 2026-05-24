# CodeDash 💻🚀

CodeDash is a real-time developer activity dashboard that tracks your programming sessions, keystrokes, and unique coding style directly from your editor. It gamifies the development workflow with levels, streaks, and milestones while giving you deep, data-driven insights into your productivity.

### 🔗 [Live Application Demo](https://code-activity-dashboard-lxiy.vercel.app)

---

## 📸 Demonstration

![CodeDash Walkthrough](./assets/demo.gif) 

---

## 🛠️ The Architecture

CodeDash is a full-stack monorepo comprised of three tightly integrated components:

1. **The Web Frontend (React + Vite)**: A responsive, dark-mode-first dashboard using **Framer Motion** for smooth transitions and **Recharts** to visualize language evolution, peak hours, and activity heatmaps.
2. **The Backend Server (Node.js + Express + Socket.io)**: A scalable REST and WebSocket server managing MongoDB databases, authentication, real-time activity sync, and background task queues (Bull).
3. **The VS Code Extension (VS Code API)**: A lightweight local extension that monitors active files, keystrokes, and typing metrics, safely buffering data offline and syncing securely to the cloud via personal API secrets.

---

## ✨ Core Features

- **Real-Time Sync**: Changes in your editor are processed and displayed on your active session card in real-time via secure WebSockets.
- **Coding Style Fingerprint**: Computes a manual typing-to-paste/AI ratio to visualize your unique coding fingerprint.
- **Gamified Progression**: Earn XP, level up, maintain persistent streaks, and unlock developer milestones.
- **Unified Language Breakdown**: Combines your active editing metrics from VS Code with historical repository data synced via the GitHub API.
- **Privacy First**: Sensitive API keys and authentication tokens are handled securely using JWTs and protected backend schemas.

---

## 🔌 VS Code Extension Installation (Beta)

Since the extension is currently in beta, you can install it manually in seconds:

1. **[Download the codetracker.vsix file](https://github.com/SelahNs/code-activity-dashboard/raw/main/codetracker-0.0.1.vsix)** directly from the root of this repository.
2. Open **VS Code**.
3. Go to the **Extensions** view (`Ctrl+Shift+X` or `Cmd+Shift+X`).
4. Click the **`...`** (More Actions) icon in the top-right corner of the Extensions panel.
5. Select **Install from VSIX...**
6. Select the downloaded `codetracker-0.0.1.vsix` file.
7. Click **Set CodeTracker Key** in your VS Code status bar and paste the API Key found on your web profile settings page.

---

## 🧰 Tech Stack

### Frontend
- **Framework**: React 18, Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Visualizations**: Recharts

### Backend
- **Platform**: Node.js, Express
- **Database**: MongoDB (Mongoose)
- **WebSockets**: Socket.io
- **Queue System**: Bull / Redis
- **Security**: JWT, bcrypt, CORS, NoSQL injection protection

### Extension
- **Platform**: VS Code Extension API

---

## 🔒 Security & Best Practices

- **Token-Based Authentication**: Implements clean JWT-based access and refresh tokens.
- **Secure API Secrets**: User `apiSecret` fields are hashed and hidden (`select: false`) by default, exposed only via verified single-purpose endpoints.
- **Dynamic CORS Controls**: Restricts communication dynamically in production to trusted client origins.
