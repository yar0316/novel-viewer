/**
 * NovelDetailコンポーネントのテスト
 * TDD原則に従って実装
 */
import { render, screen } from '@testing-library/react'
import { NovelDetail } from './NovelDetail'
import type { Novel } from '@/lib/types'

// テスト用のモックデータ
const mockNovelWithEpisodes = {
  id: 1,
  title: "テスト小説",
  author: "テスト作者",
  description: "これはテスト用の小説概要です。",
  updated_at: "2025-07-10T12:00:00Z",
  episodes: [
    {
      id: "ep1",
      title: "第一話のタイトル",
      episode_number: 1,
      published_at: "2025-06-01T00:00:00Z"
    },
    {
      id: "ep2", 
      title: "第二話のタイトル",
      episode_number: 2,
      published_at: "2025-06-08T00:00:00Z"
    }
  ]
} as Novel & {
  episodes: Array<{
    id: string
    title: string
    episode_number: number
    published_at: string
  }>
}

const mockNovelWithoutEpisodes = {
  id: 2,
  title: "話なし小説",
  author: "テスト作者2",
  description: "話がない小説です。",
  updated_at: "2025-07-11T12:00:00Z",
  episodes: []
} as Novel & {
  episodes: Array<{
    id: string
    title: string
    episode_number: number
    published_at: string
  }>
}

describe('NovelDetail', () => {
  test('小説のタイトルが表示される', () => {
    render(<NovelDetail novel={mockNovelWithEpisodes} />)
    expect(screen.getByText('テスト小説')).toBeInTheDocument()
  })

  test('作者名が表示される', () => {
    render(<NovelDetail novel={mockNovelWithEpisodes} />)
    expect(screen.getByText('作者:')).toBeInTheDocument()
    expect(screen.getByText('テスト作者')).toBeInTheDocument()
  })

  test('小説の概要が表示される', () => {
    render(<NovelDetail novel={mockNovelWithEpisodes} />)
    expect(screen.getByText('これはテスト用の小説概要です。')).toBeInTheDocument()
  })

  test('最終更新日が表示される', () => {
    render(<NovelDetail novel={mockNovelWithEpisodes} />)
    expect(screen.getByText(/最終更新: 2025\/7\/10/)).toBeInTheDocument()
  })

  test('話数が表示される', () => {
    render(<NovelDetail novel={mockNovelWithEpisodes} />)
    expect(screen.getByText('全2話')).toBeInTheDocument()
  })

  test('話一覧セクションが表示される', () => {
    render(<NovelDetail novel={mockNovelWithEpisodes} />)
    expect(screen.getByText('話一覧')).toBeInTheDocument()
  })

  test('トップページへの戻りリンクが表示される', () => {
    render(<NovelDetail novel={mockNovelWithEpisodes} />)
    const backLink = screen.getByText('← トップページに戻る')
    expect(backLink).toBeInTheDocument()
    expect(backLink.closest('a')).toHaveAttribute('href', '/')
  })

  test('話がない場合の表示', () => {
    render(<NovelDetail novel={mockNovelWithoutEpisodes} />)
    expect(screen.getByText('全0話')).toBeInTheDocument()
  })

  test('作者が設定されていない場合は作者情報が表示されない', () => {
    const novelWithoutAuthor = { ...mockNovelWithEpisodes, author: undefined }
    render(<NovelDetail novel={novelWithoutAuthor} />)
    expect(screen.queryByText(/作者:/)).not.toBeInTheDocument()
  })

  test('概要が設定されていない場合は概要が表示されない', () => {
    const novelWithoutDescription = { ...mockNovelWithEpisodes, description: undefined }
    render(<NovelDetail novel={novelWithoutDescription} />)
    expect(screen.queryByText('これはテスト用の小説概要です。')).not.toBeInTheDocument()
  })
})