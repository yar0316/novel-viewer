/**
 * Supabase データ取得用クエリ関数
 * サーバーサイドで使用する型安全なデータ取得関数
 */
import { createClient, createAdminClient } from './server'
import type { Novel, Episode, SearchParams, PaginationParams, EpisodeDetail, NovelWithEpisodes } from '../types'

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
  // 異世界転生記のエピソード（novel_id = 1）
  {
    id: "ep1",
    title: "新たな始まり",
    episode_number: 1,
    published_at: "2025-06-01T00:00:00Z",
    novel_id: 1,
    content: "　主人公が異世界に転生する第一話です。普通のサラリーマンだった主人公が、突然の交通事故で命を落とし、気がつくと異世界の森の中にいました。\n\n　周りを見回すと、見たこともない植物や動物たちが生息していて、明らかに地球とは違う世界であることが分かります。困惑する主人公でしたが、やがて自分に特別な力が宿っていることに気づきます。"
  },
  {
    id: "ep2", 
    title: "初めての仲間",
    episode_number: 2,
    published_at: "2025-06-08T00:00:00Z",
    novel_id: 1,
    content: "　森で迷っていた主人公は、魔物に襲われている少女を発見します。持ち前の正義感から助けようとした主人公でしたが、まだ力の使い方が分からずに苦戦します。\n\n　しかし、危機的状況で覚醒した力により、魔物を撃退することができました。救った少女エルフィは、主人公の最初の仲間となります。"
  },
  {
    id: "ep3",
    title: "試練の森",
    episode_number: 3, 
    published_at: "2025-06-15T00:00:00Z",
    novel_id: 1,
    content: "　エルフィと共に森を進む主人公。しかし、森の奥には強力な魔物が住んでいると言われています。\n\n　村にたどり着くためには、その森を抜ける必要がありました。二人は協力して数々の試練に立ち向かっていきます。この経験を通じて、主人公とエルフィの絆は深まっていくのでした。"
  },
  
  // 現代魔法使いの日常のエピソード（novel_id = 2）
  {
    id: "magic_ep1",
    title: "隠された才能",
    episode_number: 1,
    published_at: "2025-06-20T00:00:00Z",
    novel_id: 2,
    content: "　大学生の田中美咲は、ごく普通の日常を送っていると思っていました。しかし、ある日の朝、コーヒーカップが宙に浮いているのを目撃します。\n\n　最初は寝ぼけていたのかと思いましたが、よく観察すると、自分の意識に反応してカップが動いていることに気づきました。美咲の魔法使いとしての覚醒の瞬間でした。"
  },
  {
    id: "magic_ep2",
    title: "魔法界への招待",
    episode_number: 2,
    published_at: "2025-06-27T00:00:00Z",
    novel_id: 2,
    content: "　美咲の前に現れたのは、魔法使いの先輩である山田ゆかりでした。ゆかりは美咲に、現代社会に隠れて生きる魔法使いたちの存在を教えます。\n\n　「普通の人々に知られてはいけない。でも、困っている人を助けることはできる」そんな魔法使いたちのルールを学んだ美咲は、新しい世界への一歩を踏み出します。"
  },
  {
    id: "magic_ep3",
    title: "初めての魔法使い",
    episode_number: 3,
    published_at: "2025-07-05T00:00:00Z",
    novel_id: 2,
    content: "　ゆかりに連れられて、美咲は街中の小さなカフェへ向かいます。そこには魔法使いたちが集まる秘密の場所がありました。\n\n　初めて出会う同世代の魔法使いたち。彼らとの交流を通して、美咲は魔法が単なる超能力ではなく、人と人とのつながりを大切にする力であることを学んでいきます。"
  },

  // 宇宙の果ての物語のエピソード（novel_id = 3）
  {
    id: "space_ep1",
    title: "星間航海の始まり",
    episode_number: 1,
    published_at: "2025-07-01T00:00:00Z",
    novel_id: 3,
    content: "　西暦2387年、宇宙探査船「ホープ号」の船長である高橋太郎は、人類初の銀河系外探査ミッションに就いていました。\n\n　地球から300光年離れた未知の星系で、突然船のセンサーが異常な信号を検知します。それは明らかに人工的な、地球外知的生命体からのメッセージでした。"
  },
  {
    id: "space_ep2",
    title: "異星人との遭遇",
    episode_number: 2,
    published_at: "2025-07-08T00:00:00Z",
    novel_id: 3,
    content: "　信号の発信源に向かったホープ号のクルーたちは、巨大な宇宙ステーションを発見します。そこで出会ったのは、人類とは全く異なる姿をした知的生命体でした。\n\n　彼らは「コスモス連邦」と名乗り、銀河系には数百の知的種族が平和に共存していることを太郎たちに教えます。人類の宇宙進出は、新たな段階に入ろうとしていました。"
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
  
  if (!supabase) {
    console.error('Supabase client creation failed')
    return { data: null, error: { message: 'Database connection failed' } }
  }
  
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
      return { data: null, error: { message: 'Novel not found', code: 'NOVEL_NOT_FOUND' } }
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
      } as NovelWithEpisodes, 
      error: null 
    }
  }

  const supabase = await createClient()
  
  if (!supabase) {
    console.error('Supabase client creation failed')
    return { data: null, error: { message: 'Database connection failed' } }
  }
  
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
    } as NovelWithEpisodes, 
    error: null 
  }
}

/**
 * 小説詳細を取得
 */
export async function getNovelById(id: string) {
  const supabase = await createClient()
  
  if (!supabase) {
    console.error('Supabase client creation failed')
    return { data: null, error: { message: 'Database connection failed' } }
  }
  
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
  
  if (!supabase) {
    console.error('Supabase client creation failed')
    return { data: null, error: { message: 'Database connection failed' } }
  }
  
  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .eq('novel_id', novelId)
    .order('episode_number', { ascending: true })

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
  
  if (!supabase) {
    console.error('Supabase client creation failed')
    return { data: null, error: { message: 'Database connection failed' } }
  }
  
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
 * 話詳細を取得（ナビゲーション情報込み）
 */
export async function getEpisodeDetail(novelId: string, episodeId: string): Promise<{ data: EpisodeDetail | null, error: unknown }> {
  // 環境変数が設定されていない場合はモックデータを返す
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('Supabase環境変数が未設定のため、モックデータを使用します')
    
    const novel = mockNovels.find(n => n.id.toString() === novelId)
    const episode = mockEpisodes.find(ep => ep.id === episodeId && ep.novel_id.toString() === novelId)
    
    if (!novel) {
      return { data: null, error: { message: 'Novel not found', code: 'NOVEL_NOT_FOUND' } }
    }
    
    if (!episode) {
      return { data: null, error: { message: 'Episode not found', code: 'EPISODE_NOT_FOUND' } }
    }

    // ナビゲーション用の前後話を取得
    const allNovelEpisodes = mockEpisodes
      .filter(ep => ep.novel_id.toString() === novelId)
      .sort((a, b) => a.episode_number - b.episode_number)
    
    const currentIndex = allNovelEpisodes.findIndex(ep => ep.id === episodeId)
    const prevEpisode = currentIndex > 0 ? allNovelEpisodes[currentIndex - 1] : null
    const nextEpisode = currentIndex < allNovelEpisodes.length - 1 ? allNovelEpisodes[currentIndex + 1] : null

    return { 
      data: {
        episode: {
          id: episode.id,
          title: episode.title,
          episode_number: episode.episode_number,
          published_at: episode.published_at,
          content: episode.content,
          novel_id: episode.novel_id
        },
        novel: {
          id: novel.id,
          title: novel.title,
          author: novel.author
        },
        navigation: {
          prevEpisode: prevEpisode ? {
            id: prevEpisode.id,
            title: prevEpisode.title,
            episode_number: prevEpisode.episode_number
          } : null,
          nextEpisode: nextEpisode ? {
            id: nextEpisode.id,
            title: nextEpisode.title,
            episode_number: nextEpisode.episode_number
          } : null
        }
      }, 
      error: null 
    }
  }

  const supabase = await createClient()
  
  if (!supabase) {
    console.error('Supabase client creation failed')
    return { data: null, error: { message: 'Database connection failed' } }
  }
  
  // 話詳細と小説情報を並行取得
  const [episodeResult, novelResult] = await Promise.all([
    supabase.from('episodes').select('*').eq('id', episodeId).eq('novel_id', novelId).single(),
    supabase.from('novels').select('id, title, author').eq('id', novelId).single()
  ])

  if (episodeResult.error || novelResult.error) {
    console.error('Error fetching episode detail:', episodeResult.error || novelResult.error)
    return { data: null, error: episodeResult.error || novelResult.error }
  }

  // ナビゲーション用の前後話を取得
  const navigationResult = await supabase
    .from('episodes')
    .select('id, title, episode_number')
    .eq('novel_id', novelId)
    .order('episode_number', { ascending: true })

  const allEpisodes = navigationResult.data || []
  const currentIndex = allEpisodes.findIndex(ep => ep.id === episodeId)
  const prevEpisode = currentIndex > 0 ? allEpisodes[currentIndex - 1] : null
  const nextEpisode = currentIndex < allEpisodes.length - 1 ? allEpisodes[currentIndex + 1] : null

  return { 
    data: {
      episode: episodeResult.data,
      novel: novelResult.data,
      navigation: {
        prevEpisode,
        nextEpisode
      }
    },
    error: null 
  }
}

/**
 * 管理者用: 全小説統計を取得
 * service_roleキーを使用してRLSをバイパス
 */
export async function getAdminStats() {
  const supabase = createAdminClient()
  
  if (!supabase) {
    console.error('Admin client creation failed')
    return {
      totalNovels: 0,
      totalEpisodes: 0
    }
  }
  
  const [novelsCount, episodesCount] = await Promise.all([
    supabase.from('novels').select('*', { count: 'exact', head: true }),
    supabase.from('episodes').select('*', { count: 'exact', head: true })
  ])

  return {
    totalNovels: novelsCount.count || 0,
    totalEpisodes: episodesCount.count || 0
  }
}