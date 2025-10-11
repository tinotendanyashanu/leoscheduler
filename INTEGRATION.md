#  Frontend-Backend Integration Guide

Complete guide for integrating the Leo Scheduler frontend with the Cloudflare Worker backend.

##  Table of Contents

- [ Architecture Overview](#-architecture-overview)
- [ Authentication Flow](#-authentication-flow)
- [ API Client Setup](#-api-client-setup)
- [ State Synchronization](#-state-synchronization)
- [ Configuration](#-configuration)
- [ Deployment Integration](#-deployment-integration)
- [ Debugging](#-debugging)

##  Architecture Overview

### Communication Flow
```
Frontend (Next.js)     Backend (Cloudflare Worker)
    
  User Interface          Hono Router          
                                             
  Zustand Store     OAuth Handler          
                                             
  API Client             X API Client          
                                             
  HTTP Requests          KV Storage            
    
```

### Data Flow
1. **User Action**  Zustand store updates
2. **Store Change**  API client calls backend
3. **Backend Processing**  KV storage operations
4. **Response**  Frontend state updates
5. **UI Re-render**  User sees changes

##  Authentication Flow

### OAuth2 PKCE Implementation
The Leo Scheduler uses OAuth2 PKCE flow for secure Twitter authentication:

1. **Frontend**: User clicks "Sign in with X"
2. **Backend**: Generates PKCE challenge and redirects to Twitter
3. **Twitter**: User authorizes application
4. **Backend**: Exchanges authorization code for access token
5. **Backend**: Creates JWT session and returns to frontend
6. **Frontend**: Stores JWT and updates authentication state

### Frontend Auth Integration
```typescript
// hooks/use-auth.ts
export function useAuth() {
  const { user, token, setAuth, clearAuth } = useAuthStore()

  const login = async () => {
    const { authUrl, state } = await api.auth.getAuthUrl()
    localStorage.setItem('oauth_state', state)
    window.location.href = authUrl
  }

  return { user, token, login, logout: clearAuth }
}
```

**See the complete integration guide for detailed implementation examples.**
