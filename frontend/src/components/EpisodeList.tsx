/**
 * 話一覧表示コンポーネント
 * 小説の各話へのリンクを表示
 */
import Link from 'next/link'

interface Episode {
  id: string
  title: string
  episode_number: number
  published_at: string
}

interface EpisodeListProps {
  episodes: Episode[]
  novelId: string
}

export function EpisodeList({ episodes, novelId }: EpisodeListProps) {
  if (episodes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          話がまだ投稿されていません。
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {episodes.map((episode) => (
        <Link
          key={episode.id}
          href={`/novel/${novelId}/episode/${episode.id}`}
          className="block p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 hover:text-primary transition-colors">
                第{episode.episode_number}話: {episode.title}
              </h3>
            </div>
            <div className="text-sm text-gray-500">
              投稿日: {new Date(episode.published_at).toLocaleDateString('ja-JP')}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}