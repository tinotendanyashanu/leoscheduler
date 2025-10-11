#  Leo Scheduler - Complete Documentation

A comprehensive guide to the Leo Scheduler Twitter scheduling application.

##  Table of Contents

- [ Quick Start](#-quick-start)
- [ Architecture](#-architecture)
- [ Installation & Setup](#-installation--setup)
- [ Configuration](#-configuration)
- [ Development](#-development)
- [ Usage Guide](#-usage-guide)
- [ API Reference](#-api-reference)
- [ Deployment](#-deployment)
- [ Troubleshooting](#-troubleshooting)
- [ Contributing](#-contributing)

##  Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Cloudflare account
- Twitter Developer account

### 1. Clone and Install
```bash
git clone <repository-url>
cd leoscheduler
npm install
```

### 2. Backend Setup
```bash
cd backend
npm install
npx wrangler login
```

### 3. Environment Configuration
```bash
# Create environment file
cp .env.example .env.local

# Edit with your credentials
NEXT_PUBLIC_API_URL=https://your-worker.your-subdomain.workers.dev
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Start Development
```bash
# Frontend
npm run dev

# Backend (separate terminal)
cd backend
npm run dev
```

##  Architecture

### System Overview
```
        
   Frontend             Cloudflare            Twitter/X     
   (Next.js)        Worker            API           
                        (Backend)                           
        
                                
                                
                                
    
   Local                KV Storage     
   Storage              (Persistence)  
    
```

### Frontend Architecture
- **Framework**: Next.js 15 with App Router
- **State Management**: Zustand with localStorage persistence
- **UI Components**: shadcn/ui with Tailwind CSS
- **Drag & Drop**: @dnd-kit for Kanban functionality
- **Date Handling**: date-fns for calendar operations

### Backend Architecture
- **Runtime**: Cloudflare Workers with Hono framework
- **Authentication**: OAuth2 PKCE + JWT sessions
- **Storage**: KV Store for user data and tokens
- **Scheduling**: Cron triggers for automated posting
- **API Integration**: Twitter/X API v2

**See the complete documentation for detailed setup, usage, and deployment instructions.**
