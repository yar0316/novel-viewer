/**
 * 小説カードコンポーネント
 * 小説一覧で使用される各小説の表示カード
 */
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/date-utils'
import type { Novel } from '@/lib/types'

interface NovelCardProps {
  novel: Novel
  /** カードのクリック可能性を制御 */
  clickable?: boolean
  /** 追加のCSSクラス */
  className?: string
}

export function NovelCard({ 
  novel, 
  clickable = true, 
  className = '' 
}: NovelCardProps) {

  const cardTitle = clickable ? (
    <Link 
      href={`/novel/${novel.id}`}
      className="text-blue-600 hover:text-blue-800 transition-colors"
    >
      {novel.title}
    </Link>
  ) : (
    <span>{novel.title}</span>
  )

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {cardTitle}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {novel.summary}
        </p>
        
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>更新日: {formatDate(novel.updated_at)}</span>
          <span>全{novel.episodes}章</span>
        </div>
        
        {novel.author && (
          <div className="mt-2">
            <span className="text-xs text-gray-500">作者: {novel.author}</span>
          </div>
        )}
        
        {novel.genre && (
          <div className="mt-2">
            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
              {novel.genre}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}