import { Context } from 'hono'

export function cors() {
  return async (c: Context, next: () => Promise<void>) => {
    await next()
    
    const origin = c.req.header('Origin')
    const allowedOrigins = [
      'http://localhost:3000',
      'https://leoscheduler.vercel.app',
      // Add your production domain here
    ]
    
    if (origin && allowedOrigins.includes(origin)) {
      c.res.headers.set('Access-Control-Allow-Origin', origin)
    }
    
    c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    c.res.headers.set('Access-Control-Allow-Credentials', 'true')
    c.res.headers.set('Access-Control-Max-Age', '86400')
  }
}

export function handlePreflight() {
  return (c: Context) => {
    return c.text('', 204)
  }
}