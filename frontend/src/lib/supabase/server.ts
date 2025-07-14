/**
 * Supabase サーバーサイド用設定
 * React Server Components、Server Actions、Route Handlersで使用
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * サーバーコンポーネント用のSupabaseクライアント
 * cookieを使用してユーザーセッションを管理
 */
export async function createClient() {
  // 環境変数が設定されていない場合はnullを返す
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
  }

  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * 管理者権限用のSupabaseクライアント
 * service_roleキーを使用してRLSをバイパス
 * サーバーサイドでのみ使用
 */
export function createAdminClient() {
  // 環境変数が設定されていない場合はnullを返す
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      }
    }
  )
}