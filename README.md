<div align="center">
 
  # 🚀 My Personal Blog
  
  A modern, responsive, and lightweight full-stack blog application designed for publishing thoughts on engineering, design, and philosophy. Developed with dynamic routing, markdown support, claps, and interactive comments.
  
  [![React](https://img.shields.io/badge/React-19.0-blue?logo=react&style=flat-square)](#)
  [![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&style=flat-square)](#)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-38BDF8?logo=tailwind-css&style=flat-square)](#)
  [![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&style=flat-square)](#)
  [![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase&style=flat-square)](#)

</div>

---

## ✨ Features

*   **⚡ High Performance**: Powered by **React 19**, **Vite**, and **Tailwind CSS v4** for near-instant load times and responsive performance.
*   **💾 Resilient Storage Architecture**: Uses a dual-database design:
    *   Connects to **Firebase Cloud Firestore** for real-time global persistence.
    *   Automatically and gracefully falls back to browser **LocalStorage** if Firebase configuration is missing or restricted (guaranteeing zero-downtime development and instant setup).
*   **🛠️ Admin / Owner Mode**: Toggle Owner Mode from the top bar to create new articles, edit existing posts, and delete articles directly in-browser.
*   **📝 Markdown Editor with Live Preview**: A dedicated writing dashboard with a side-by-side or tabbed live Markdown editor.
*   **💬 Interactive Threaded Comments**: Readers can write comments, reply to existing threads, and clap for posts/comments without login friction.
*   **🔍 Advanced Search & Filtering**: Instant full-text search across titles, summaries, tags, and categories.
*   **🌐 Server-Side SPA Fallback**: Managed by an Express.js backend that handles routing for direct deep links and static asset delivery in production.

---

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React (Icons), Motion (Animations)
*   **Backend**: Express.js, TSX (TypeScript Execute)
*   **Database**: Firebase Cloud Firestore / LocalStorage Fallback
*   **Bundler**: Vite (Frontend), Esbuild (Backend Production Bundler)
*   **AI Integration**: `@google/genai` (Configured for Gemini API integration)

---

## 📁 Project Structure

```text
creative-blog/
├── assets/                     # Static media and graphics
├── src/                        # Frontend source code
│   ├── components/             # Reusable UI elements
│   │   ├── CommentSection.tsx  # Handles commenting and replies
│   │   ├── Dashboard.tsx       # Live markdown writing editor
│   │   ├── Navbar.tsx          # Main header navigation
│   │   ├── PostCard.tsx        # Homepage article preview cards
│   │   └── PostDetail.tsx      # Main article reader view
│   ├── data/
│   │   └── mockDefaults.ts     # Initial seed data for blog posts
│   ├── lib/
│   │   ├── dbService.ts        # Firestore/LocalStorage unified database API
│   │   ├── firebase.ts         # Firebase initialization
│   │   └── markdown.tsx        # Markdown-to-HTML parser
│   ├── types.ts                # TypeScript interfaces (Post, Comment)
│   ├── App.tsx                 # Core layout and state controller
│   ├── index.css               # Styling tokens and Tailwind setup
│   └── main.tsx                # Frontend entrypoint
├── server.ts                   # Express server entry point (Vite Dev vs. Prod Static serve)
├── firebase-applet-config.json # Firebase connection credentials
├── package.json                # Project configurations, scripts & dependencies
├── tsconfig.json               # TypeScript config
└── vite.config.ts              # Vite dev server configuration
```

---

## 🚀 Getting Started

### 📋 Prerequisites

Make sure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (version 18+ recommended)
*   [npm](https://www.npmjs.com/) (installed with Node)

---

### ⚙️ Installation & Configuration

1.  **Clone or Open the project directory**:
    ```bash
    cd creative-blog
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables Setup**:
    *   Create a `.env.local` file in the root directory by copying the example:
        ```bash
        cp .env.example .env.local
        ```
    *   Configure the variables inside `.env.local`:
        ```env
        GEMINI_API_KEY="your-gemini-api-key"
        APP_URL="http://localhost:3000"
        ```

4.  **Firebase Credentials Setup**:
    *   The project retrieves Firebase credentials from `firebase-applet-config.json`.
    *   If you don't have this configuration yet, the application will **automatically fall back to LocalStorage**, meaning it will function perfectly immediately without a database setup.

---

### 💻 Running the App

#### Development Mode (Fast Refresh)
To run the server and frontend concurrently in development mode:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the blog.

#### Production Build & Server Start
To compile, optimize, and launch the application in production mode:
```bash
# Build both frontend assets and the Express server
npm run build

# Start the compiled Express production server
npm run start
```
The server will boot and serve the optimized static files at `http://localhost:3000`.

---

## ⚙️ Backend API Endpoints

The Express server in `server.ts` exposes the following API routes:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status check (returns active db mode, timestamp, and status). |
| `GET` | `/api/seo/:slug` | SEO Metadata generator mock. Returns structured OpenGraph tags for a given post slug. |

---

## 🛡️ Database Fallback Mechanism

A key architectural component is `src/lib/dbService.ts`. In environments where:
*   Firebase configuration credentials are empty or invalid
*   Network connection is blocked
*   Firestore security rules restrict operations

The system intercepts errors, triggers `setLocalStorageMode(true)`, and routes all read, write, update, and delete actions directly to the browser's `localStorage`. This creates a seamless, self-contained demonstration environment.

---

## 📜 License

This project is licensed under the Apache-2.0 License. See the [LICENSE](LICENSE) file or source headers for detail.
