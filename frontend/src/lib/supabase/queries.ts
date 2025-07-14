/**
 * Supabase データ取得用クエリ関数
 * サーバーサイドで使用する型安全なデータ取得関数
 */
import { createClient, createAdminClient } from './server'
import type { Novel, Episode, SearchParams, PaginationParams } from '../types'

// 開発環境用のモックデータ
const mockNovels: Novel[] = [
  {
    id: 1,
    title: "異世界転生記",
    summary: "普通の高校生が異世界に転生して冒険する物語です。魔法と剣の世界で、仲間たちと共に成長していく姿を描きます。",
    author: "山田太郎",
    updated_at: "2025-07-10T12:00:00Z",
    episodes: 15,
    genre: "ファンタジー",
    tags: ["異世界", "冒険", "成長"],
    created_at: "2025-01-01T00:00:00Z"
  },
  {
    id: 2,
    title: "現代魔法使いの日常",
    summary: "現代社会に隠れて生活する魔法使いの物語。日常の中にある小さな魔法を通して、人々との絆を描いています。",
    author: "佐藤花子",
    updated_at: "2025-07-08T15:30:00Z",
    episodes: 8,
    genre: "現代ファンタジー",
    tags: ["日常", "魔法", "現代"],
    created_at: "2025-02-15T00:00:00Z"
  },
  {
    id: 3,
    title: "宇宙の果ての物語",
    summary: "遥か未来の宇宙を舞台にしたSF小説。異星人との出会いや宇宙の謎を解き明かす冒険が始まります。",
    author: "田中一郎",
    updated_at: "2025-07-12T09:15:00Z",
    episodes: 12,
    genre: "SF",
    tags: ["宇宙", "未来", "冒険"],
    created_at: "2025-03-01T00:00:00Z"
  }
]

// モック話データ
const mockEpisodes = [
  {
    id: "ep1",
    title: "新たな始まり",
    episode_number: 1,
    published_at: "2025-06-01T00:00:00Z",
    novel_id: 1,
    content: "主人公が異世界に転生する第一話です..."
  },
  {
    id: "ep2", 
    title: "初めての仲間",
    episode_number: 2,
    published_at: "2025-06-08T00:00:00Z",
    novel_id: 1,
    content: "仲間との出会いを描く第二話です..."
  },
  {
    id: "ep3",
    title: "試練の森",
    episode_number: 3, 
    published_at: "2025-06-15T00:00:00Z",
    novel_id: 1,
    content: "森での試練を描く第三話です..."
  }
]

/**
 * 小説一覧を取得
 */
export async function getNovelsList(
  searchParams?: SearchParams,
  pagination?: PaginationParams
) {
  // 環境変数が設定されていない場合はモックデータを返す
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('Supabase環境変数が未設定のため、モックデータを使用します')
    
    let filteredNovels = [...mockNovels]
    
    // 検索フィルター
    if (searchParams?.query) {
      filteredNovels = filteredNovels.filter(novel =>
        novel.title.toLowerCase().includes(searchParams.query!.toLowerCase())
      )
    }
    
    if (searchParams?.genre) {
      filteredNovels = filteredNovels.filter(novel => novel.genre === searchParams.genre)
    }
    
    if (searchParams?.author) {
      filteredNovels = filteredNovels.filter(novel =>
        novel.author.toLowerCase().includes(searchParams.author!.toLowerCase())
      )
    }

    // ページネーション
    if (pagination) {
      const from = (pagination.page - 1) * pagination.limit
      const to = from + pagination.limit
      filteredNovels = filteredNovels.slice(from, to)
    }

    return { data: filteredNovels, error: null }
  }

  const supabase = await createClient()
  
  let query = supabase
    .from('novels')
    .select('*')
    .order('updated_at', { ascending: false })

  // 検索フィルター
  if (searchParams?.query) {
    query = query.ilike('title', `%${searchParams.query}%`)
  }
  
  if (searchParams?.genre) {
    query = query.eq('genre', searchParams.genre)
  }
  
  if (searchParams?.author) {
    query = query.ilike('author', `%${searchParams.author}%`)
  }

  // ページネーション
  if (pagination) {
    const from = (pagination.page - 1) * pagination.limit
    const to = from + pagination.limit - 1
    query = query.range(from, to)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching novels:', error)
    return { data: null, error }
  }

  return { data: data as Novel[], error: null }
}

/**
 * 小説詳細を取得（話一覧込み）
 */
export async function getNovelDetail(id: string) {
  // 環境変数が設定されていない場合はモックデータを返す
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('Supabase環境変数が未設定のため、モックデータを使用します')
    
    const novel = mockNovels.find(n => n.id.toString() === id)
    if (!novel) {
      return { data: null, error: { message: 'Novel not found' } }
    }

    // 該当する話を取得
    const episodes = mockEpisodes
      .filter(ep => ep.novel_id.toString() === id)
      .map(ep => ({
        id: ep.id,
        title: ep.title,
        episode_number: ep.episode_number,
        published_at: ep.published_at
      }))

    return { 
      data: { 
        ...novel, 
        description: novel.summary, // summaryをdescriptionとして使用
        episodes 
      }, 
      error: null 
    }
  }

  const supabase = await createClient()
  
  // 小説情報と話一覧を並行取得
  const [novelResult, episodesResult] = await Promise.all([
    supabase.from('novels').select('*').eq('id', id).single(),
    supabase.from('episodes').select('id, title, episode_number, published_at').eq('novel_id', id).order('episode_number', { ascending: true })
  ])

  if (novelResult.error) {
    console.error('Error fetching novel:', novelResult.error)
    return { data: null, error: novelResult.error }
  }

  return { 
    data: { 
      ...novelResult.data as Novel, 
      episodes: episodesResult.data || [] 
    }, 
    error: null 
  }
}

/**
 * 小説詳細を取得
 */
export async function getNovelById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('novels')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching novel:', error)
    return { data: null, error }
  }

  return { data: data as Novel, error: null }
}

/**
 * 小説のエピソード一覧を取得
 */
export async function getEpisodesByNovelId(novelId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .eq('novel_id', novelId)
    .order('order', { ascending: true })

  if (error) {
    console.error('Error fetching episodes:', error)
    return { data: null, error }
  }

  return { data: data as Episode[], error: null }
}

/**
 * 特定のエピソードを取得
 */
export async function getEpisodeById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching episode:', error)
    return { data: null, error }
  }

  return { data: data as Episode, error: null }
}

/**
 * 管理者用: 全小説統計を取得
 * service_roleキーを使用してRLSをバイパス
 */
export async function getAdminStats() {
  const supabase = createAdminClient()
  
  const [novelsCount, episodesCount] = await Promise.all([
    supabase.from('novels').select('*', { count: 'exact', head: true }),
    supabase.from('episodes').select('*', { count: 'exact', head: true })
  ])

  return {
    totalNovels: novelsCount.count || 0,
    totalEpisodes: episodesCount.count || 0
  }
}