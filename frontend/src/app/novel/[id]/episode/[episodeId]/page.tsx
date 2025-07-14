/**
 * 話閲覧ページ
 * TDD Green Phase: テストを通す最小限の実装
 */
import { notFound } from 'next/navigation'
import { EpisodeViewer } from '@/components/EpisodeViewer'
import { EpisodeNavigation } from '@/components/EpisodeNavigation'
import { getEpisodeDetail } from '@/lib/supabase/queries'

interface EpisodePageProps {
  params: Promise<{
    id: string
    episodeId: string
  }>
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const { id, episodeId } = await params
  
  // サーバーサイドでデータ取得（SSR）
  const { data: episodeDetail, error } = await getEpisodeDetail(id, episodeId)

  // 話が見つからない場合は404ページを表示
  if (!episodeDetail || error) {
    notFound()
    return // この行は実際には到達しないが、TypeScriptとテストのために必要
  }

  const { episode, novel, navigation } = episodeDetail

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 話の表示 */}
      <EpisodeViewer episode={episode} novel={novel} />
      
      {/* ナビゲーション */}
      <EpisodeNavigation
        novelId={id}
        currentEpisodeId={episodeId}
        currentEpisodeNumber={episode.episode_number}
        prevEpisode={navigation.prevEpisode}
        nextEpisode={navigation.nextEpisode}
      />
    </div>
  )
}