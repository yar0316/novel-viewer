/**
 * EpisodeNavigationコンポーネントのテスト
 * TDD原則に従って実装 - Red Phase（失敗するテスト）
 */
import { render, screen } from '@testing-library/react'
import { EpisodeNavigation } from './EpisodeNavigation'

// テスト用のモックデータ
const mockNavigationData = {
  novelId: "1",
  currentEpisodeId: "ep2",
  currentEpisodeNumber: 2,
  prevEpisode: {
    id: "ep1",
    title: "新たな始まり",
    episode_number: 1
  },
  nextEpisode: {
    id: "ep3", 
    title: "試練の森",
    episode_number: 3
  }
}

const mockNavigationWithoutPrev = {
  novelId: "1",
  currentEpisodeId: "ep1",
  currentEpisodeNumber: 1,
  prevEpisode: null,
  nextEpisode: {
    id: "ep2",
    title: "初めての仲間", 
    episode_number: 2
  }
}

const mockNavigationWithoutNext = {
  novelId: "1",
  currentEpisodeId: "ep3",
  currentEpisodeNumber: 3,
  prevEpisode: {
    id: "ep2",
    title: "初めての仲間",
    episode_number: 2
  },
  nextEpisode: null
}

describe('EpisodeNavigation', () => {
  test('前話へのリンクが正しく表示される', () => {
    render(<EpisodeNavigation {...mockNavigationData} />)
    
    const prevLink = screen.getByText('← 前話: 新たな始まり')
    expect(prevLink).toBeInTheDocument()
    expect(prevLink.closest('a')).toHaveAttribute('href', '/novel/1/episode/ep1')
  })

  test('次話へのリンクが正しく表示される', () => {
    render(<EpisodeNavigation {...mockNavigationData} />)
    
    const nextLink = screen.getByText('次話: 試練の森 →')
    expect(nextLink).toBeInTheDocument()
    expect(nextLink.closest('a')).toHaveAttribute('href', '/novel/1/episode/ep3')
  })

  test('目次へ戻るリンクが表示される', () => {
    render(<EpisodeNavigation {...mockNavigationData} />)
    
    const backLink = screen.getByText('目次へ戻る')
    expect(backLink).toBeInTheDocument()
    expect(backLink.closest('a')).toHaveAttribute('href', '/novel/1')
  })

  test('最初の話では前話リンクが表示されない', () => {
    render(<EpisodeNavigation {...mockNavigationWithoutPrev} />)
    
    expect(screen.queryByText(/← 前話:/)).not.toBeInTheDocument()
    expect(screen.getByText('次話: 初めての仲間 →')).toBeInTheDocument()
  })

  test('最後の話では次話リンクが表示されない', () => {
    render(<EpisodeNavigation {...mockNavigationWithoutNext} />)
    
    expect(screen.getByText('← 前話: 初めての仲間')).toBeInTheDocument()
    expect(screen.queryByText(/次話:.*→/)).not.toBeInTheDocument()
  })

  test('前話も次話もない場合は目次リンクのみ表示される', () => {
    const singleEpisode = {
      novelId: "1",
      currentEpisodeId: "ep1", 
      currentEpisodeNumber: 1,
      prevEpisode: null,
      nextEpisode: null
    }
    
    render(<EpisodeNavigation {...singleEpisode} />)
    
    expect(screen.queryByText(/← 前話:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/次話:.*→/)).not.toBeInTheDocument()
    expect(screen.getByText('目次へ戻る')).toBeInTheDocument()
  })

  test('ナビゲーションが適切なレイアウトクラスを持つ', () => {
    render(<EpisodeNavigation {...mockNavigationData} />)
    
    const navigation = screen.getByRole('navigation')
    expect(navigation).toHaveClass('flex')
    expect(navigation).toHaveClass('justify-between')
    expect(navigation).toHaveClass('items-center')
  })

  test('スマホでのタッチしやすいボタンサイズが適用される', () => {
    render(<EpisodeNavigation {...mockNavigationData} />)
    
    const prevLink = screen.getByText('← 前話: 新たな始まり').closest('a')
    const nextLink = screen.getByText('次話: 試練の森 →').closest('a')
    
    expect(prevLink).toHaveClass('p-3') // タッチしやすいpadding
    expect(nextLink).toHaveClass('p-3')
  })
})