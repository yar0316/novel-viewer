/**
 * 話閲覧ページのテスト
 * TDD原則に従って実装 - Red Phase（失敗するテスト）
 */
import { render, screen } from '@testing-library/react'
import EpisodePage from './page'

// Next.js 15のmockを設定
jest.mock('next/navigation', () => ({
  notFound: jest.fn()
}))

// Supabaseクエリのmock
jest.mock('@/lib/supabase/queries', () => ({
  getEpisodeDetail: jest.fn()
}))

import { notFound } from 'next/navigation'
import { getEpisodeDetail } from '@/lib/supabase/queries'

const mockGetEpisodeDetail = getEpisodeDetail as jest.MockedFunction<typeof getEpisodeDetail>
const mockNotFound = notFound as jest.MockedFunction<typeof notFound>

// テスト用のモックデータ
const mockEpisodeDetail = {
  episode: {
    id: "ep1",
    title: "新たな始まり",
    episode_number: 1,
    published_at: "2025-06-01T00:00:00Z",
    content: "これはテスト用の話の本文です。",
    novel_id: 1
  },
  novel: {
    id: 1,
    title: "テスト小説",
    author: "テスト作者"
  },
  navigation: {
    prevEpisode: null,
    nextEpisode: {
      id: "ep2",
      title: "初めての仲間",
      episode_number: 2
    }
  }
}

describe('EpisodePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('話が正常に表示される', async () => {
    mockGetEpisodeDetail.mockResolvedValue({
      data: mockEpisodeDetail,
      error: null
    })

    const props = {
      params: Promise.resolve({
        id: '1',
        episodeId: 'ep1'
      })
    }

    render(await EpisodePage(props))

    expect(screen.getByText('第1話: 新たな始まり')).toBeInTheDocument()
    expect(screen.getByText('これはテスト用の話の本文です。')).toBeInTheDocument()
  })

  test('話が見つからない場合は404ページを表示', async () => {
    mockGetEpisodeDetail.mockResolvedValue({
      data: null,
      error: { message: 'Episode not found' }
    })

    const props = {
      params: Promise.resolve({
        id: '1',
        episodeId: 'nonexistent'
      })
    }

    await EpisodePage(props)

    expect(mockNotFound).toHaveBeenCalled()
  })

  test('データ取得エラーの場合は404ページを表示', async () => {
    mockGetEpisodeDetail.mockResolvedValue({
      data: null,
      error: { message: 'Database error' }
    })

    const props = {
      params: Promise.resolve({
        id: '1', 
        episodeId: 'ep1'
      })
    }

    await EpisodePage(props)

    expect(mockNotFound).toHaveBeenCalled()
  })

  test('正しいパラメータでデータ取得関数が呼ばれる', async () => {
    mockGetEpisodeDetail.mockResolvedValue({
      data: mockEpisodeDetail,
      error: null
    })

    const props = {
      params: Promise.resolve({
        id: '1',
        episodeId: 'ep1'
      })
    }

    await EpisodePage(props)

    expect(mockGetEpisodeDetail).toHaveBeenCalledWith('1', 'ep1')
  })

  test('ページコンテナが適切なクラスを持つ', async () => {
    mockGetEpisodeDetail.mockResolvedValue({
      data: mockEpisodeDetail,
      error: null
    })

    const props = {
      params: Promise.resolve({
        id: '1',
        episodeId: 'ep1'
      })
    }

    const { container } = render(await EpisodePage(props))
    const pageContainer = container.firstChild

    expect(pageContainer).toHaveClass('container')
    expect(pageContainer).toHaveClass('mx-auto')
    expect(pageContainer).toHaveClass('px-4')
    expect(pageContainer).toHaveClass('py-6')
  })
})