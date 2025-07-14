/**
 * Next.js Middleware - Basic認証
 * 環境変数によって認証の有効/無効を制御
 */
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Basic認証が無効な場合はスキップ
  if (process.env.BASIC_AUTH_ENABLED !== 'true') {
    return NextResponse.next()
  }

  // 認証情報の取得
  const basicAuth = request.headers.get('authorization')
  const url = request.nextUrl

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')

    // 環境変数から認証情報を取得
    const validUser = process.env.BASIC_AUTH_USER
    const validPassword = process.env.BASIC_AUTH_PASSWORD

    if (user === validUser && pwd === validPassword) {
      return NextResponse.next()
    }
  }

  // 認証失敗時はWWW-Authenticateヘッダーを設定して401を返す
  url.pathname = '/api/auth'

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Novel Viewer"',
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (認証API)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}