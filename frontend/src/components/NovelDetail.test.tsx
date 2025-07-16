/**
 * NovelDetailコンポーネントのテスト
 * TDD原則に従って実装
 */
import { render, screen } from '@testing-library/react'
import { NovelDetail } from './NovelDetail'
import type { NovelWithEpisodes } from '@/lib/types'

// テスト用のモックデータ
const mockNovelWithEpisodes = {
  id: 1,
  title: "テスト小説",
  author: "テスト作者",
  summary: "これはテスト用の小説のあらすじです。主人公が冒険を通じて成長していく物語です。",
  description: "これはテスト用の小説概要です。",
  updated_at: "2025-07-10T12:00:00Z",
  created_at: "2025-07-10T12:00:00Z",
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
} as NovelWithEpisodes

const mockNovelWithoutEpisodes = {
  id: 2,
  title: "話なし小説",
  author: "テスト作者2",
  summary: "話がない小説です。",
  description: "話がない小説です。",
  updated_at: "2025-07-11T12:00:00Z",
  created_at: "2025-07-11T12:00:00Z",
  episodes: []
} as NovelWithEpisodes

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
    const novelWithoutAuthor = { ...mockNovelWithEpisodes, author: '' }
    render(<NovelDetail novel={novelWithoutAuthor} />)
    expect(screen.queryByText(/作者:/)).not.toBeInTheDocument()
  })

  test('概要が設定されていない場合は概要が表示されない', () => {
    const novelWithoutDescription = { ...mockNovelWithEpisodes, description: undefined }
    render(<NovelDetail novel={novelWithoutDescription} />)
    expect(screen.queryByText('これはテスト用の小説概要です。')).not.toBeInTheDocument()
  })

  // Summary display functionality tests
  describe('Summary Display', () => {
    test('summaryが存在する場合、あらすじセクションが表示される', () => {
      render(<NovelDetail novel={mockNovelWithEpisodes} />)
      
      // あらすじセクションのヘッダーが表示される
      expect(screen.getByText('あらすじ')).toBeInTheDocument()
      
      // summaryの内容が表示される
      expect(screen.getByText('これはテスト用の小説のあらすじです。主人公が冒険を通じて成長していく物語です。')).toBeInTheDocument()
    })

    test('summaryが空文字列の場合、あらすじセクションが表示されない', () => {
      const novelWithEmptySummary = { ...mockNovelWithEpisodes, summary: '' }
      render(<NovelDetail novel={novelWithEmptySummary} />)
      
      // あらすじセクションが表示されない
      expect(screen.queryByText('あらすじ')).not.toBeInTheDocument()
    })

    test('summaryが空白文字のみの場合、あらすじセクションが表示されない', () => {
      const novelWithWhitespaceSummary = { ...mockNovelWithEpisodes, summary: '   \n\t  ' }
      render(<NovelDetail novel={novelWithWhitespaceSummary} />)
      
      // あらすじセクションが表示されない
      expect(screen.queryByText('あらすじ')).not.toBeInTheDocument()
    })

    test('summaryがnullの場合、あらすじセクションが表示されない', () => {
      const novelWithNullSummary = { ...mockNovelWithEpisodes, summary: null as any }
      render(<NovelDetail novel={novelWithNullSummary} />)
      
      // あらすじセクションが表示されない
      expect(screen.queryByText('あらすじ')).not.toBeInTheDocument()
    })

    test('summaryがundefinedの場合、あらすじセクションが表示されない', () => {
      const novelWithUndefinedSummary = { ...mockNovelWithEpisodes, summary: undefined as any }
      render(<NovelDetail novel={novelWithUndefinedSummary} />)
      
      // あらすじセクションが表示されない
      expect(screen.queryByText('あらすじ')).not.toBeInTheDocument()
    })

    test('あらすじセクションが適切なスタイリングで表示される', () => {
      render(<NovelDetail novel={mockNovelWithEpisodes} />)
      
      // あらすじヘッダーが適切なスタイルで表示される
      const summaryHeader = screen.getByText('あらすじ')
      expect(summaryHeader).toHaveClass('text-xl', 'font-semibold', 'text-gray-900')
      
      // あらすじ内容が適切なスタイルで表示される
      const summaryContent = screen.getByText('これはテスト用の小説のあらすじです。主人公が冒険を通じて成長していく物語です。')
      expect(summaryContent).toHaveClass('text-gray-700', 'leading-relaxed', 'whitespace-pre-wrap')
      
      // 背景スタイルが適用されている
      expect(summaryContent).toHaveClass('bg-gray-50', 'p-4', 'rounded-lg')
    })

    test('あらすじセクションが正しい位置に配置される', () => {
      render(<NovelDetail novel={mockNovelWithEpisodes} />)
      
      // タイトルが存在することを確認
      const title = screen.getByText('テスト小説')
      expect(title).toBeInTheDocument()
      
      // あらすじセクションが存在することを確認
      const summarySection = screen.getByText('あらすじ')
      expect(summarySection).toBeInTheDocument()
      
      // 話一覧セクションが存在することを確認
      const episodeSection = screen.getByText('話一覧')
      expect(episodeSection).toBeInTheDocument()
      
      // DOM内での順序を確認（タイトル → あらすじ → 話一覧）
      const container = document.querySelector('.max-w-4xl')
      expect(container).toBeInTheDocument()
      
      if (container) {
        const titleElement = title.closest('section')
        const summaryElement = summarySection.closest('section')
        const episodeElement = episodeSection.closest('section')
        
        // 要素の順序を確認
        if (titleElement && summaryElement && episodeElement) {
          const sections = Array.from(container.querySelectorAll('section'))
          const titlePosition = sections.indexOf(titleElement)
          const summaryPosition = sections.indexOf(summaryElement)
          const episodePosition = sections.indexOf(episodeElement)
          
          expect(titlePosition).toBeLessThan(summaryPosition)
          expect(summaryPosition).toBeLessThan(episodePosition)
        }
      }
    })

    test('改行を含むsummaryが適切に表示される', () => {
      const novelWithMultilineSummary = {
        ...mockNovelWithEpisodes,
        summary: '第一部：主人公の出発\n主人公が故郷を離れる決意を固める。\n\n第二部：冒険の始まり\n様々な困難に立ち向かう。'
      }
      render(<NovelDetail novel={novelWithMultilineSummary} />)
      
      // 改行を含むテキストが表示される
      expect(screen.getByText(/第一部：主人公の出発/)).toBeInTheDocument()
      expect(screen.getByText(/第二部：冒険の始まり/)).toBeInTheDocument()
      
      // whitespace-pre-wrapクラスが適用されていることを確認
      const summaryContent = screen.getByText(/第一部：主人公の出発/)
      expect(summaryContent).toHaveClass('whitespace-pre-wrap')
    })
  })
})