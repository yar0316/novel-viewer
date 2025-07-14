/**
 * 話ナビゲーションコンポーネント
 * TDD Green Phase: テストを通す最小限の実装
 */
import Link from 'next/link'
import type { EpisodeInfo } from '@/lib/types'

interface EpisodeNavigationProps {
  novelId: string
  currentEpisodeId: string
  currentEpisodeNumber: number
  prevEpisode: EpisodeInfo | null
  nextEpisode: EpisodeInfo | null
  showTableOfContents?: boolean
  className?: string
}

export function EpisodeNavigation({
  novelId,
  currentEpisodeId,
  currentEpisodeNumber,
  prevEpisode,
  nextEpisode,
  showTableOfContents = true,
  className = ""
}: EpisodeNavigationProps) {
  return (
    <nav 
      role="navigation"
      className={`flex justify-between items-center mt-8 p-4 border-t border-gray-200 ${className}`}
    >
      {/* 前話リンク */}
      <div className="flex-1">
        {prevEpisode ? (
          <Link
            href={`/novel/${novelId}/episode/${prevEpisode.id}`}
            className="inline-block p-3 text-primary hover:text-primary/80 transition-colors"
          >
            ← 前話: {prevEpisode.title}
          </Link>
        ) : (
          <div></div>
        )}
      </div>

      {/* 目次へ戻るリンク */}
      {showTableOfContents && (
        <div className="flex-shrink-0 mx-4">
          <Link
            href={`/novel/${novelId}`}
            className="inline-block p-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition-colors"
          >
            目次へ戻る
          </Link>
        </div>
      )}

      {/* 次話リンク */}
      <div className="flex-1 text-right">
        {nextEpisode ? (
          <Link
            href={`/novel/${novelId}/episode/${nextEpisode.id}`}
            className="inline-block p-3 text-primary hover:text-primary/80 transition-colors"
          >
            次話: {nextEpisode.title} →
          </Link>
        ) : (
          <div></div>
        )}
      </div>
    </nav>
  )
}