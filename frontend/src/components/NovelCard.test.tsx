/**
 * NovelCardコンポーネントのテスト
 * TDD Red Phase: 失敗するテストを先に作成
 */
import { render, screen } from '@/lib/test-utils'
import { NovelCard } from './NovelCard'
import { mockNovels } from '@/lib/test-utils'

const mockNovel = mockNovels[0]

describe('NovelCard', () => {
  test('小説のタイトルが表示される', () => {
    render(<NovelCard novel={mockNovel} />)
    
    // タイトルがリンクとして表示されることを確認
    const titleLink = screen.getByRole('link', { name: mockNovel.title })
    expect(titleLink).toBeInTheDocument()
    expect(titleLink).toHaveAttribute('href', `/novel/${mockNovel.id}`)
  })

  test('小説の概要が表示される', () => {
    render(<NovelCard novel={mockNovel} />)
    
    expect(screen.getByText(mockNovel.summary)).toBeInTheDocument()
  })

  test('更新日が正しい形式で表示される', () => {
    render(<NovelCard novel={mockNovel} />)
    
    // 更新日が日本語形式で表示されることを確認
    expect(screen.getByText(/更新日: 2025\/7\/12/)).toBeInTheDocument()
  })

  test('章数が表示される', () => {
    render(<NovelCard novel={mockNovel} />)
    
    expect(screen.getByText(`全${mockNovel.episodes}章`)).toBeInTheDocument()
  })

  test('作者名が表示される', () => {
    render(<NovelCard novel={mockNovel} />)
    
    expect(screen.getByText(`作者: ${mockNovel.author}`)).toBeInTheDocument()
  })

  test('ジャンルが表示される', () => {
    render(<NovelCard novel={mockNovel} />)
    
    expect(screen.getByText(mockNovel.genre!)).toBeInTheDocument()
  })

  test('作者がない場合は作者欄が表示されない', () => {
    const novelWithoutAuthor = { ...mockNovel, author: undefined }
    render(<NovelCard novel={novelWithoutAuthor} />)
    
    expect(screen.queryByText(/作者:/)).not.toBeInTheDocument()
  })

  test('ジャンルがない場合はジャンル欄が表示されない', () => {
    const novelWithoutGenre = { ...mockNovel, genre: undefined }
    render(<NovelCard novel={novelWithoutGenre} />)
    
    expect(screen.queryByText(mockNovel.genre!)).not.toBeInTheDocument()
  })

  test('カードがホバー時に影が変化する', () => {
    render(<NovelCard novel={mockNovel} />)
    
    const card = screen.getByRole('article')
    expect(card).toHaveClass('hover:shadow-md')
  })
})