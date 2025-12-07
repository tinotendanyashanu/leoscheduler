import { Context } from 'hono'

export function cors() {
  return async (c: Context, next: () => Promise<void>) => {
    await next()
    
    const origin = c.req.header('Origin')
    const appOrigin = (c.env as any)?.APP_ORIGIN as string | undefined
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://0.0.0.0:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      appOrigin,
      'https://leoscheduler.vercel.app',
    ].filter(Boolean) as string[]
    
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
