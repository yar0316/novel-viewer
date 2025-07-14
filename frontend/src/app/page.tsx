/**
 * トップページ - 小説一覧表示
 * サーバーサイドレンダリングでSupabaseからデータを取得
 */
import { NovelList } from '@/components/NovelList'
import { getNovelsList } from '@/lib/supabase/queries'

interface HomePageProps {
  searchParams: Promise<{
    search?: string
  }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const searchQuery = params.search
  
  // サーバーサイドでデータ取得（SSR）
  const { data: novels, error } = await getNovelsList(
    searchQuery ? { query: searchQuery } : undefined,
    { page: 1, limit: 20 }
  )

  // エラーハンドリング
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">
          データの取得に失敗しました。しばらく待ってから再度お試しください。
        </p>
      </div>
    )
  }

  return (
    <div>
      <NovelList novels={novels || []} searchQuery={searchQuery} />
    </div>
  )
}
