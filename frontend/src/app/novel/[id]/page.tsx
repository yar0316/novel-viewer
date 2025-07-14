/**
 * 小説詳細ページ
 * 小説情報と章一覧を表示
 */
import { notFound } from 'next/navigation'
import { NovelDetail } from '@/components/NovelDetail'
import { getNovelDetail } from '@/lib/supabase/queries'

interface NovelDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function NovelDetailPage({ params }: NovelDetailPageProps) {
  const { id } = await params
  
  // サーバーサイドでデータ取得（SSR）
  const { data: novel, error } = await getNovelDetail(id)

  // 小説が見つからない場合は404ページを表示
  if (!novel || error) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <NovelDetail novel={novel} />
    </div>
  )
}