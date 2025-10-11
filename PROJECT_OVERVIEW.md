#  Leo Scheduler - Project Overview

A modern, full-stack Twitter scheduling application built with Next.js 15 and Cloudflare Workers.

![Leo Scheduler](https://img.shields.io/badge/Status-Production%20Ready-green)
![Next.js](https://img.shields.io/badge/Next.js-15.0.4-blueviolet)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-orange)

##  Features

-  **Kanban Board**: Drag & drop posts between Draft  Ready  Scheduled  Sent
-  **Calendar Views**: Week and month views with time slot scheduling  
-  **Tweet Composer**: Multi-step thread creation with character counting
-  **Live Preview**: Real-time tweet preview with link parsing
-  **Automated Posting**: Cron-based scheduled posting with thread support
-  **Secure Auth**: OAuth2 PKCE + JWT session management
-  **Dark Mode**: System-aware theme switching
-  **Responsive**: Works on desktop, tablet, and mobile

##  Quick Start

### 1. Clone & Install
```bash
git clone <repository>
cd leoscheduler
npm install
```

### 2. Setup Backend
```bash
cd backend
npm install
npx wrangler login
npm run setup  # Follow the deployment guide
```

### 3. Configure Environment
```bash
# Copy and edit environment file
cp .env.example .env.local
```

### 4. Start Development
```bash
npm run dev
```

Visit `http://localhost:3000` and start scheduling tweets!

##  Documentation

- **[ Complete Documentation](./DOCUMENTATION.md)** - Comprehensive setup and usage guide
- **[ Integration Guide](./INTEGRATION.md)** - Frontend-backend integration details  
- **[ Backend Setup](./backend/README.md)** - Cloudflare Worker configuration

##  Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Pre-built accessible components
- **Zustand** - Lightweight state management
- **@dnd-kit** - Drag and drop functionality

### Backend  
- **Cloudflare Workers** - Edge computing platform
- **Hono** - Lightweight web framework
- **JWT** - Stateless authentication
- **KV Storage** - Persistent data storage
- **Cron Triggers** - Automated scheduling

**Start scheduling your tweets like a pro! **
