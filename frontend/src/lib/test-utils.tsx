/**
 * テスト用ユーティリティ
 * React Testing Libraryのセットアップとモックデータ
 */
import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import type { Novel, Episode } from './types'

// モックデータ
export const mockNovels: Novel[] = [
  {
    id: 1,
    title: '小説タイトルA',
    summary: 'これは小説Aの概要です。異世界に転生した主人公が、チート能力を駆使して活躍する物語です。',
    author: '夏目 漱石',
    updated_at: '2025-07-12T00:00:00Z',
    episodes: 15,
    genre: '異世界',
    tags: ['転生', 'チート'],
    created_at: '2025-06-01T00:00:00Z'
  },
  {
    id: 2,
    title: '小説タイトルB',
    summary: 'これは小説Bの概要です。現代を舞台にした、心温まる恋愛ストーリー。',
    author: '芥川 龍之介',
    updated_at: '2025-07-11T00:00:00Z',
    episodes: 30,
    genre: '恋愛',
    tags: ['現代', '学園'],
    created_at: '2025-05-15T00:00:00Z'
  }
]

export const mockEpisodes: Episode[] = [
  {
    id: 1,
    novel_id: 1,
    title: '第一章: 新たな始まり',
    post_date: '2025-06-01T00:00:00Z',
    content: [
      { id: 1, text: '　ここは章の本文が入ります。読みやすさを重視し、行間や文字サイズを調整します。' },
      { id: 2, text: '　吾輩は猫である。名前はまだ無い。' }
    ],
    order: 1,
    created_at: '2025-06-01T00:00:00Z'
  },
  {
    id: 2,
    novel_id: 1,
    title: '第二章: 初めての仲間',
    post_date: '2025-06-08T00:00:00Z',
    content: [
      { id: 3, text: '　第二章の内容です。' }
    ],
    order: 2,
    created_at: '2025-06-08T00:00:00Z'
  }
]

// カスタムレンダー関数
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, options)

export * from '@testing-library/react'
export { customRender as render }