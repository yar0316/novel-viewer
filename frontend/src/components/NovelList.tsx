/**
 * 小説一覧表示コンポーネント
 * 検索ボックスとNovelCardのリストを表示
 */
import { NovelCard } from './NovelCard'
import { SearchBox } from './SearchBox'
import type { Novel } from '@/lib/types'

interface NovelListProps {
  novels: Novel[]
  searchQuery?: string
}

export function NovelList({ novels, searchQuery }: NovelListProps) {
  return (
    <div className="space-y-6">
      {/* 検索ボックス */}
      <div className="mb-8">
        <SearchBox initialValue={searchQuery} />
      </div>

      {/* 検索結果の表示 */}
      {searchQuery && (
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            「{searchQuery}」の検索結果: {novels.length}件
          </p>
        </div>
      )}

      {/* 小説一覧またはメッセージ */}
      {novels.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchQuery 
              ? `「${searchQuery}」に一致する小説が見つかりませんでした。` 
              : '小説がまだ投稿されていません。'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {novels.map((novel) => (
            <NovelCard key={novel.id} novel={novel} />
          ))}
        </div>
      )}
    </div>
  )
}