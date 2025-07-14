/**
 * NovelListコンポーネントのテスト
 * TDD Red Phase: 失敗するテストを先に作成
 */
import { render, screen } from '@/lib/test-utils'
import { NovelList } from './NovelList'
import { mockNovels } from '@/lib/test-utils'

describe('NovelList', () => {
  test('小説リストが正しく表示される', () => {
    render(<NovelList novels={mockNovels} />)
    
    // 各小説のタイトルが表示されることを確認
    mockNovels.forEach(novel => {
      expect(screen.getByText(novel.title)).toBeInTheDocument()
    })
  })

  test('空のリストの場合、適切なメッセージが表示される', () => {
    render(<NovelList novels={[]} />)
    
    expect(screen.getByText('小説がまだ投稿されていません。')).toBeInTheDocument()
  })

  test('検索クエリがある場合、検索結果メッセージが表示される', () => {
    const searchQuery = 'テスト検索'
    render(<NovelList novels={mockNovels} searchQuery={searchQuery} />)
    
    expect(screen.getByText(`「${searchQuery}」の検索結果: ${mockNovels.length}件`)).toBeInTheDocument()
  })

  test('検索結果が空の場合、適切なメッセージが表示される', () => {
    const searchQuery = '見つからない検索'
    render(<NovelList novels={[]} searchQuery={searchQuery} />)
    
    expect(screen.getByText(`「${searchQuery}」に一致する小説が見つかりませんでした。`)).toBeInTheDocument()
  })

  test('NovelCardコンポーネントが各小説に対して表示される', () => {
    render(<NovelList novels={mockNovels} />)
    
    // 各小説がarticle要素として表示されることを確認
    const novelCards = screen.getAllByRole('article')
    expect(novelCards).toHaveLength(mockNovels.length)
  })

  test('小説リストがgridレイアウトで表示される', () => {
    render(<NovelList novels={mockNovels} />)
    
    // gridクラスを持つ要素が存在することを確認
    const gridContainer = document.querySelector('.grid')
    expect(gridContainer).toBeInTheDocument()
  })
})