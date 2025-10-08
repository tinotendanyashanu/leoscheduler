import { Hono } from 'hono'
import { cors, handlePreflight } from './cors'
import { oauth } from './oauth'
import { xApi } from './x-api'
import { Post, User } from './schema'

export interface Env {
  POSTS_KV: KVNamespace
  USERS_KV: KVNamespace
  JWT_SECRET: string
  X_CLIENT_ID: string
  X_CLIENT_SECRET: string
  BASE_URL: string
}

const app = new Hono()

// Apply CORS to all routes
app.use('*', cors())

// Handle preflight requests
app.options('*', handlePreflight())

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// OAuth routes
app.get('/auth/connect', async (c) => {
  const env = c.env as unknown as Env
  const { authUrl, state, codeVerifier } = await oauth.createAuthUrl(env.X_CLIENT_ID, env.BASE_URL)
  
  // Store code verifier temporarily (5 minutes)
  await env.USERS_KV.put(`state:${state}`, codeVerifier, { expirationTtl: 300 })
  
  return c.json({ authUrl })
})

app.get('/auth/callback', async (c) => {
  const env = c.env as unknown as Env
  const code = c.req.query('code')
  const state = c.req.query('state')
  
  if (!code || !state) {
    return c.json({ error: 'Missing code or state' }, 400)
  }
  
  // Retrieve and delete code verifier
  const codeVerifier = await env.USERS_KV.get(`state:${state}`)
  if (!codeVerifier) {
    return c.json({ error: 'Invalid or expired state' }, 400)
  }
  await env.USERS_KV.delete(`state:${state}`)
  
  try {
    const tokens = await oauth.exchangeCodeForTokens(
      code,
      codeVerifier,
      env.X_CLIENT_ID,
      env.X_CLIENT_SECRET,
      env.BASE_URL
    ) as any
    
    // Get user info
    const userInfo = await xApi.getUserInfo(tokens.access_token)
    
    const user: User = {
      id: userInfo.id,
      username: userInfo.username,
      displayName: userInfo.name,
      profileImage: userInfo.profile_image_url,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || null,
      tokenExpiry: new Date(Date.now() + (tokens.expires_in * 1000)).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Store user
    await env.USERS_KV.put(`user:${user.id}`, JSON.stringify(user))
    
    // Create JWT session
    const jwt = await oauth.createJWT(user.id, env.JWT_SECRET)
    
    // Redirect to frontend with JWT
    return c.redirect(`${env.BASE_URL}?token=${jwt}`)
  } catch (error) {
    console.error('OAuth callback error:', error)
    return c.json({ error: 'Authentication failed' }, 500)
  }
})

// Get current user
app.get('/api/user', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const token = authHeader.slice(7)
  const payload = await oauth.verifyJWT(token, c.env.JWT_SECRET)
  if (!payload) {
    return c.json({ error: 'Invalid token' }, 401)
  }
  
  const user = await c.env.USERS_KV.get(`user:${payload.sub}`)
  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }
  
  const userData = JSON.parse(user) as User
  
  // Don't send sensitive tokens to frontend
  const { accessToken, refreshToken, ...safeUser } = userData
  return c.json(safeUser)
})

// Get posts
app.get('/api/posts', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const token = authHeader.slice(7)
  const payload = await oauth.verifyJWT(token, c.env.JWT_SECRET)
  if (!payload) {
    return c.json({ error: 'Invalid token' }, 401)
  }
  
  const userId = payload.sub
  const postsData = await c.env.POSTS_KV.get(`posts:${userId}`)
  const posts = postsData ? JSON.parse(postsData) : []
  
  return c.json(posts)
})

// Create post
app.post('/api/posts', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const token = authHeader.slice(7)
  const payload = await oauth.verifyJWT(token, c.env.JWT_SECRET)
  if (!payload) {
    return c.json({ error: 'Invalid token' }, 401)
  }
  
  const userId = payload.sub
  const body = await c.req.json()
  
  const post: Post = {
    id: body.id || crypto.randomUUID(),
    content: body.content,
    mediaUrls: body.mediaUrls || [],
    scheduledFor: body.scheduledFor,
    status: body.status || 'draft',
    userId,
    threadOrder: body.threadOrder || 0,
    parentId: body.parentId || null,
    postedTweetId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  // Get existing posts
  const postsData = await c.env.POSTS_KV.get(`posts:${userId}`)
  const posts = postsData ? JSON.parse(postsData) : []
  
  // Add new post
  posts.push(post)
  
  // Save back to KV
  await c.env.POSTS_KV.put(`posts:${userId}`, JSON.stringify(posts))
  
  return c.json(post)
})

// Update post
app.put('/api/posts/:id', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const token = authHeader.slice(7)
  const payload = await oauth.verifyJWT(token, c.env.JWT_SECRET)
  if (!payload) {
    return c.json({ error: 'Invalid token' }, 401)
  }
  
  const userId = payload.sub
  const postId = c.req.param('id')
  const body = await c.req.json()
  
  // Get existing posts
  const postsData = await c.env.POSTS_KV.get(`posts:${userId}`)
  const posts = postsData ? JSON.parse(postsData) : []
  
  // Find and update post
  const postIndex = posts.findIndex((p: Post) => p.id === postId)
  if (postIndex === -1) {
    return c.json({ error: 'Post not found' }, 404)
  }
  
  posts[postIndex] = {
    ...posts[postIndex],
    ...body,
    updatedAt: new Date().toISOString()
  }
  
  // Save back to KV
  await c.env.POSTS_KV.put(`posts:${userId}`, JSON.stringify(posts))
  
  return c.json(posts[postIndex])
})

// Delete post
app.delete('/api/posts/:id', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const token = authHeader.slice(7)
  const payload = await oauth.verifyJWT(token, c.env.JWT_SECRET)
  if (!payload) {
    return c.json({ error: 'Invalid token' }, 401)
  }
  
  const userId = payload.sub
  const postId = c.req.param('id')
  
  // Get existing posts
  const postsData = await c.env.POSTS_KV.get(`posts:${userId}`)
  const posts = postsData ? JSON.parse(postsData) : []
  
  // Filter out deleted post
  const filteredPosts = posts.filter((p: Post) => p.id !== postId)
  
  if (filteredPosts.length === posts.length) {
    return c.json({ error: 'Post not found' }, 404)
  }
  
  // Save back to KV
  await c.env.POSTS_KV.put(`posts:${userId}`, JSON.stringify(filteredPosts))
  
  return c.json({ success: true })
})

// Cron job to post scheduled tweets
export default {
  fetch: app.fetch,
  
  async scheduled(event: ScheduledEvent, env: Env) {
    console.log('Running scheduled tweet job...')
    
    try {
      // Get all user IDs from KV (this is a simplified approach)
      // In production, you might want a more efficient way to track users
      const { keys } = await env.USERS_KV.list({ prefix: 'user:' })
      
      for (const key of keys) {
        const userId = key.name.replace('user:', '')
        
        // Get user data
        const userData = await env.USERS_KV.get(key.name)
        if (!userData) continue
        
        const user = JSON.parse(userData) as User
        
        // Check if token needs refresh
        const tokenExpiry = new Date(user.tokenExpiry)
        const needsRefresh = tokenExpiry.getTime() - Date.now() < 300000 // 5 minutes
        
        let accessToken = user.accessToken
        if (needsRefresh && user.refreshToken) {
          try {
            const tokens = await xApi.refreshAccessToken(user.refreshToken, env.X_CLIENT_ID, env.X_CLIENT_SECRET)
            accessToken = tokens.access_token
            
            // Update user with new tokens
            const updatedUser = {
              ...user,
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token || user.refreshToken,
              tokenExpiry: new Date(Date.now() + (tokens.expires_in * 1000)).toISOString(),
              updatedAt: new Date().toISOString()
            }
            await env.USERS_KV.put(key.name, JSON.stringify(updatedUser))
          } catch (error) {
            console.error(`Failed to refresh token for user ${userId}:`, error)
            continue
          }
        }
        
        // Get user's posts
        const postsData = await env.POSTS_KV.get(`posts:${userId}`)
        if (!postsData) continue
        
        const posts = JSON.parse(postsData) as Post[]
        
        // Find posts scheduled for now (within the last minute to account for cron timing)
        const now = new Date()
        const oneMinuteAgo = new Date(now.getTime() - 60000)
        
        const postsToSend = posts.filter(post => 
          post.status === 'scheduled' &&
          post.scheduledFor &&
          new Date(post.scheduledFor) <= now &&
          new Date(post.scheduledFor) > oneMinuteAgo
        )
        
        if (postsToSend.length === 0) continue
        
        // Sort by thread order for proper threading
        postsToSend.sort((a, b) => a.threadOrder - b.threadOrder)
        
        // Post tweets
        for (const post of postsToSend) {
          try {
            let inReplyToTweetId: string | undefined
            
            // If this is a thread reply, find the parent tweet ID
            if (post.parentId) {
              const parentPost = posts.find(p => p.id === post.parentId)
              inReplyToTweetId = parentPost?.postedTweetId || undefined
            }
            
            const tweetResponse = await xApi.postTweet(accessToken, {
              text: post.content,
              media: post.mediaUrls.length > 0 ? { media_ids: post.mediaUrls } : undefined,
              reply: inReplyToTweetId ? { in_reply_to_tweet_id: inReplyToTweetId } : undefined
            })
            
            // Update post status
            const updatedPost = {
              ...post,
              status: 'sent' as const,
              postedTweetId: tweetResponse.data.id,
              updatedAt: new Date().toISOString()
            }
            
            // Update posts array
            const postIndex = posts.findIndex(p => p.id === post.id)
            posts[postIndex] = updatedPost
            
            console.log(`Posted tweet for user ${userId}: ${tweetResponse.data.id}`)
          } catch (error) {
            console.error(`Failed to post tweet for user ${userId}:`, error)
            
            // Mark post as failed
            const postIndex = posts.findIndex(p => p.id === post.id)
            posts[postIndex] = {
              ...posts[postIndex],
              status: 'draft' as const, // Reset to draft so user can reschedule
              updatedAt: new Date().toISOString()
            }
          }
        }
        
        // Save updated posts
        await env.POSTS_KV.put(`posts:${userId}`, JSON.stringify(posts))
      }
      
      console.log('Scheduled tweet job completed')
    } catch (error) {
      console.error('Scheduled tweet job failed:', error)
    }
  }
}