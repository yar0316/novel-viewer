/**
 * Supabaseクエリ関数のモック
 * テスト時にSupabaseの代わりに使用
 */
import { mockNovels, mockEpisodes } from '../test-utils'
import type { SearchParams, PaginationParams } from '../types'

export const mockGetNovelsList = jest.fn(async (
  searchParams?: SearchParams,
  pagination?: PaginationParams
) => {
  let filteredNovels = [...mockNovels]

  // 検索フィルター
  if (searchParams?.query) {
    filteredNovels = filteredNovels.filter(novel =>
      novel.title.toLowerCase().includes(searchParams.query!.toLowerCase())
    )
  }

  if (searchParams?.genre) {
    filteredNovels = filteredNovels.filter(novel =>
      novel.genre === searchParams.genre
    )
  }

  if (searchParams?.author) {
    filteredNovels = filteredNovels.filter(novel =>
      novel.author?.toLowerCase().includes(searchParams.author!.toLowerCase())
    )
  }

  // ページネーション
  if (pagination) {
    const start = (pagination.page - 1) * pagination.limit
    const end = start + pagination.limit
    filteredNovels = filteredNovels.slice(start, end)
  }

  return { data: filteredNovels, error: null }
})

export const mockGetNovelById = jest.fn(async (id: string) => {
  const novel = mockNovels.find(n => n.id === parseInt(id))
  if (novel) {
    return { data: novel, error: null }
  }
  return { data: null, error: new Error('Novel not found') }
})

export const mockGetEpisodesByNovelId = jest.fn(async (novelId: string) => {
  const episodes = mockEpisodes.filter(e => e.novel_id === parseInt(novelId))
  return { data: episodes, error: null }
})

export const mockGetEpisodeById = jest.fn(async (id: string) => {
  const episode = mockEpisodes.find(e => e.id === id)
  if (episode) {
    return { data: episode, error: null }
  }
  return { data: null, error: new Error('Episode not found') }
})