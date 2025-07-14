/**
 * 話表示コンポーネント
 * TDD Green Phase: テストを通す最小限の実装
 */
import Link from 'next/link'
import type { Episode, Novel } from '@/lib/types'

interface EpisodeViewerProps {
  episode: Episode
  novel: Pick<Novel, 'id' | 'title' | 'author'>
  showBackLink?: boolean
  className?: string
}

export function EpisodeViewer({ 
  episode, 
  novel, 
  showBackLink = true, 
  className = "" 
}: EpisodeViewerProps) {
  return (
    <div data-testid="episode-viewer" className={`max-w-4xl mx-auto px-4 ${className}`}>
      {/* 小説への戻りリンク */}
      {showBackLink && (
        <div className="mb-6">
          <Link 
            href={`/novel/${novel.id}`}
            className="text-primary hover:text-primary/80 text-sm transition-colors"
          >
            ← {novel.title}へ戻る
          </Link>
        </div>
      )}

      {/* 話のタイトル */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          第{episode.episode_number}話: {episode.title}
        </h1>
      </header>

      {/* 話の本文 */}
      <article className="mb-8">
        {episode.content ? (
          <div 
            data-testid="episode-content"
            className="text-lg leading-relaxed text-gray-700 whitespace-pre-wrap"
          >
            {episode.content}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">本文がありません。</p>
          </div>
        )}
      </article>
    </div>
  )
}