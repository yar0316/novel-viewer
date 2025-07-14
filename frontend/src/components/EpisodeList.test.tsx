/**
 * EpisodeListコンポーネントのテスト
 * TDD原則に従って実装
 */
import { render, screen } from '@testing-library/react'
import { EpisodeList } from './EpisodeList'

// テスト用のモックデータ
const mockEpisodes = [
  {
    id: "ep1",
    title: "新たな始まり",
    episode_number: 1,
    published_at: "2025-06-01T00:00:00Z"
  },
  {
    id: "ep2",
    title: "初めての仲間", 
    episode_number: 2,
    published_at: "2025-06-08T00:00:00Z"
  },
  {
    id: "ep3",
    title: "試練の森",
    episode_number: 3,
    published_at: "2025-06-15T00:00:00Z"
  }
]

const mockNovelId = "novel123"

describe('EpisodeList', () => {
  test('話一覧が表示される', () => {
    render(<EpisodeList episodes={mockEpisodes} novelId={mockNovelId} />)
    
    expect(screen.getByText('第1話: 新たな始まり')).toBeInTheDocument()
    expect(screen.getByText('第2話: 初めての仲間')).toBeInTheDocument()
    expect(screen.getByText('第3話: 試練の森')).toBeInTheDocument()
  })

  test('投稿日が表示される', () => {
    render(<EpisodeList episodes={mockEpisodes} novelId={mockNovelId} />)
    
    expect(screen.getByText('投稿日: 2025/6/1')).toBeInTheDocument()
    expect(screen.getByText('投稿日: 2025/6/8')).toBeInTheDocument()
    expect(screen.getByText('投稿日: 2025/6/15')).toBeInTheDocument()
  })

  test('各話へのリンクが正しく設定される', () => {
    render(<EpisodeList episodes={mockEpisodes} novelId={mockNovelId} />)
    
    const firstEpisodeLink = screen.getByText('第1話: 新たな始まり').closest('a')
    const secondEpisodeLink = screen.getByText('第2話: 初めての仲間').closest('a')
    const thirdEpisodeLink = screen.getByText('第3話: 試練の森').closest('a')
    
    expect(firstEpisodeLink).toHaveAttribute('href', '/novel/novel123/episode/ep1')
    expect(secondEpisodeLink).toHaveAttribute('href', '/novel/novel123/episode/ep2')
    expect(thirdEpisodeLink).toHaveAttribute('href', '/novel/novel123/episode/ep3')
  })

  test('話がない場合のメッセージが表示される', () => {
    render(<EpisodeList episodes={[]} novelId={mockNovelId} />)
    
    expect(screen.getByText('話がまだ投稿されていません。')).toBeInTheDocument()
  })

  test('話の順序が正しく表示される', () => {
    const unorderedEpisodes = [mockEpisodes[2], mockEpisodes[0], mockEpisodes[1]]
    render(<EpisodeList episodes={unorderedEpisodes} novelId={mockNovelId} />)
    
    const episodeLinks = screen.getAllByRole('link')
    expect(episodeLinks).toHaveLength(3)
    
    // リンクの順序はprops通りに表示される（ソートはしない）
    expect(episodeLinks[0]).toHaveTextContent('第3話: 試練の森')
    expect(episodeLinks[1]).toHaveTextContent('第1話: 新たな始まり')
    expect(episodeLinks[2]).toHaveTextContent('第2話: 初めての仲間')
  })

  test('ホバー効果が適用される', () => {
    render(<EpisodeList episodes={mockEpisodes} novelId={mockNovelId} />)
    
    const firstEpisodeLink = screen.getByText('第1話: 新たな始まり').closest('a')
    expect(firstEpisodeLink).toHaveClass('hover:bg-gray-50', 'hover:border-gray-300')
  })
})