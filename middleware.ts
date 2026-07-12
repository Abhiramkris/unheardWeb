import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ALLOWED_ORIGINS = [
  'https://unheard.co.in',
  'https://www.unheard.co.in',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
]

export async function middleware(request: NextRequest) {
  const origin = request.headers.get('origin')
  const path = request.nextUrl.pathname

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
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
  
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Info')
    response.headers.set('Vary', 'Origin')
  }

  const isAdminPath = path.startsWith('/admin')
  const isSuperAdminPath = path.startsWith('/super-admin')

  // Protect admin and super-admin routes
  if (isAdminPath || isSuperAdminPath) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            response = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Securely refresh and verify user session
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(loginUrl)
    }

    // Query authenticated user's role from user_roles
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const userRole = roleData?.role

    if (isSuperAdminPath) {
      if (!userRole || !['admin', 'super_admin'].includes(userRole)) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } else if (isAdminPath) {
      if (!userRole || !['therapist', 'admin', 'super_admin'].includes(userRole)) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }

  return response
}

// Ensure middleware runs for protected directories as well as APIs
export const config = {
  matcher: ['/api/:path*', '/auth/:path*', '/admin/:path*', '/super-admin/:path*']
}
