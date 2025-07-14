/**
 * 小説詳細表示コンポーネント
 * 小説情報と話一覧を表示
 */
import Link from 'next/link'
import { EpisodeList } from './EpisodeList'
import type { NovelWithEpisodes } from '@/lib/types'

interface NovelDetailProps {
  novel: NovelWithEpisodes
}

export function NovelDetail({ novel }: NovelDetailProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* トップページへの戻りリンク */}
      <div className="mb-6">
        <Link 
          href="/" 
          className="text-primary hover:text-primary/80 text-sm transition-colors"
        >
          ← トップページに戻る
        </Link>
      </div>

      {/* 小説情報 */}
      <section className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">{novel.title}</h1>
        
        {novel.author && (
          <p className="text-gray-600">
            作者: <span className="font-medium">{novel.author}</span>
          </p>
        )}
        
        {novel.description && (
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {novel.description}
            </p>
          </div>
        )}
        
        {/* メタ情報 */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          {novel.updated_at && (
            <span>最終更新: {new Date(novel.updated_at).toLocaleDateString('ja-JP')}</span>
          )}
          {novel.episodes && (
            <span>全{novel.episodes.length}話</span>
          )}
        </div>
      </section>

      {/* 話一覧 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">話一覧</h2>
        <EpisodeList episodes={novel.episodes || []} novelId={novel.id.toString()} />
      </section>
    </div>
  )
}