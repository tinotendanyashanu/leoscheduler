#  Leo Scheduler Backend

Cloudflare Worker backend for the Leo Scheduler Twitter scheduling application.

##  Overview

This is the backend API for Leo Scheduler, built as a Cloudflare Worker using the Hono framework. It provides:

- **OAuth2 PKCE Authentication** with Twitter/X
- **RESTful API** for post management  
- **Automated Tweet Posting** via cron jobs
- **JWT Session Management**
- **KV Storage** for data persistence

##  Architecture

### Backend Structure
```
backend/
 src/
    index.ts        # Main application entry
    oauth.ts        # OAuth2 PKCE implementation
    x-api.ts        # Twitter API integration
    cors.ts         # CORS middleware
    schema.ts       # Data types and validation
    utils.ts        # Helper functions
 wrangler.toml       # Cloudflare configuration
 package.json        # Dependencies
 tsconfig.json       # TypeScript config
```

##  Quick Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Cloudflare
```bash
npx wrangler login
npx wrangler kv:namespace create "LEO_SCHEDULER"
```

### 3. Set Environment Variables
```bash
npx wrangler secret put X_CLIENT_ID
npx wrangler secret put X_CLIENT_SECRET
npx wrangler secret put JWT_SECRET
```

### 4. Deploy
```bash
npm run deploy
```

##  API Endpoints

### Authentication
- `GET /auth/login` - Initiate OAuth flow
- `POST /auth/callback` - Handle OAuth callback

### Posts
- `GET /api/posts` - Get all user posts
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/settings` - Update user settings

##  Development

```bash
# Start local development
npm run dev

# View logs
npx wrangler tail

# Deploy to production
npm run deploy
```

**For complete setup instructions, see the full README documentation.**
