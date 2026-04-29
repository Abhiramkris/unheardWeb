import { NextResponse, type NextRequest } from 'next/server'

const ALLOWED_ORIGINS = [
  'https://unheard.co.in',
  'https://www.unheard.co.in',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
]

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin')
  
  // Handle preflight requests (OPTIONS)
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 })
    
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Info')
      response.headers.set('Access-Control-Max-Age', '86400') // 24 hours
    }
    
    return response
  }

  // Handle regular requests
  const response = NextResponse.next()
  
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Info')
    response.headers.set('Vary', 'Origin')
  }

  return response
}

// Ensure middleware only runs for API routes and auth routes
export const config = {
  matcher: ['/api/:path*', '/auth/:path*']
}
