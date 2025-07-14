/**
 * Web小説サイト用TypeScript型定義
 * Supabaseスキーマに基づく型定義（手動定義版）
 * 実際の運用時はSupabase CLIによる自動生成に置き換え
 */

export interface Novel {
  id: number
  title: string
  summary: string
  author: string
  updated_at: string
  episodes: number
  genre?: string
  tags?: string[]
  created_at: string
}

export interface Episode {
  id: number
  novel_id: number
  title: string
  post_date: string
  content: Paragraph[]
  order: number
  created_at: string
}

export interface Paragraph {
  id: number
  text: string
}

/**
 * API レスポンス型
 */
export interface ApiResponse<T> {
  data: T | null
  error: Error | null
}

/**
 * ページネーション用型
 */
export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * 検索パラメータ型
 */
export interface SearchParams {
  query?: string
  genre?: string
  author?: string
}