/**
 * EpisodeViewerコンポーネントのテスト
 * TDD原則に従って実装 - Red Phase（失敗するテスト）
 */
import { render, screen } from '@testing-library/react'
import { EpisodeViewer } from './EpisodeViewer'

// テスト用のモックデータ
const mockEpisode = {
  id: "ep1",
  title: "新たな始まり",
  episode_number: 1,
  published_at: "2025-06-01T00:00:00Z",
  content: "これはテスト用の話の本文です。読みやすい形で表示されることを期待しています。\n\n段落分けもしっかりと表示される必要があります。",
  novel_id: 1
}

const mockNovel = {
  id: 1,
  title: "テスト小説",
  author: "テスト作者"
}

describe('EpisodeViewer', () => {
  test('話のタイトルが表示される', () => {
    render(<EpisodeViewer episode={mockEpisode} novel={mockNovel} />)
    expect(screen.getByText('第1話: 新たな始まり')).toBeInTheDocument()
  })

  test('話の本文が表示される', () => {
    render(<EpisodeViewer episode={mockEpisode} novel={mockNovel} />)
    expect(screen.getByText(/これはテスト用の話の本文です/)).toBeInTheDocument()
  })

  test('小説タイトルへのリンクが表示される', () => {
    render(<EpisodeViewer episode={mockEpisode} novel={mockNovel} />)
    const backLink = screen.getByText('← テスト小説へ戻る')
    expect(backLink).toBeInTheDocument()
    expect(backLink.closest('a')).toHaveAttribute('href', '/novel/1')
  })

  test('本文が段落分けされて表示される', () => {
    render(<EpisodeViewer episode={mockEpisode} novel={mockNovel} />)
    
    // 段落が適切に分かれて表示されていることを確認
    const contentContainer = screen.getByTestId('episode-content')
    expect(contentContainer).toBeInTheDocument()
    
    // 改行が段落分けとして処理されていることを確認
    expect(contentContainer).toHaveTextContent('これはテスト用の話の本文です')
    expect(contentContainer).toHaveTextContent('段落分けもしっかりと表示される必要があります')
  })

  test('読みやすいフォントサイズとスタイルが適用される', () => {
    render(<EpisodeViewer episode={mockEpisode} novel={mockNovel} />)
    
    const contentContainer = screen.getByTestId('episode-content')
    expect(contentContainer).toHaveClass('text-lg') // 読みやすいフォントサイズ
    expect(contentContainer).toHaveClass('leading-relaxed') // ゆったりとした行間
  })

  test('本文が空の場合のメッセージが表示される', () => {
    const emptyEpisode = { ...mockEpisode, content: '' }
    render(<EpisodeViewer episode={emptyEpisode} novel={mockNovel} />)
    
    expect(screen.getByText('本文がありません。')).toBeInTheDocument()
  })

  test('スマホでの読書体験を考慮したレイアウトが適用される', () => {
    render(<EpisodeViewer episode={mockEpisode} novel={mockNovel} />)
    
    const container = screen.getByTestId('episode-viewer')
    expect(container).toHaveClass('max-w-4xl') // 最大幅制限
    expect(container).toHaveClass('mx-auto') // 中央配置
    expect(container).toHaveClass('px-4') // 左右padding
  })
})