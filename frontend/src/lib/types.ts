/**
 * Web小説サイト用TypeScript型定義
 * Supabaseスキーマに基づく型定義（手動定義版）
 * 実際の運用時はSupabase CLIによる自動生成に置き換え
 */

export interface Novel {
  id: number
  title: string
  summary: string
  description?: string
  author: string
  updated_at: string
  episodes: number
  genre?: string
  tags?: string[]
  created_at: string
}

export interface Episode {
  id: string
  novel_id: number
  title: string
  episode_number: number
  published_at: string
  content: string
  created_at?: string
}


/**
 * API レスポンス型
 */
export interface ApiError {
  message: string
  code?: string
}

export interface ApiResponse<T> {
  data: T | null
  error: ApiError | null
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

/**
 * エピソード詳細とナビゲーション情報
 */
export interface EpisodeInfo {
  id: string
  title: string
  episode_number: number
}

export interface EpisodeDetail {
  episode: Episode
  novel: Pick<Novel, 'id' | 'title' | 'author'>
  navigation: {
    prevEpisode: EpisodeInfo | null
    nextEpisode: EpisodeInfo | null
  }
}