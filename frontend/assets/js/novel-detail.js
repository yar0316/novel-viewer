// 小説詳細画面 Alpine.js アプリケーション

function novelDetailApp() {
    return {
        // 初期化
        init() {
            console.log('Novel Detail App が初期化されました');
            this.getNovelIdFromUrl();
            this.loadNovelDetail();
        },
        
        // データ
        novel: {},
        novelId: 1,
        
        // メソッド
        getNovelIdFromUrl() {
            const urlParams = new URLSearchParams(window.location.search);
            this.novelId = parseInt(urlParams.get('id')) || 1;
            console.log('取得した小説ID:', this.novelId);
        },
        
        async loadNovelDetail() {
            try {
                const response = await fetch('../assets/data/novels.json');
                const data = await response.json();
                
                // 指定されたIDの小説を検索
                const targetNovel = data.novels.find(novel => novel.id === this.novelId);
                if (!targetNovel) {
                    throw new Error(`小説ID ${this.novelId} が見つかりません`);
                }
                
                // 基本情報を設定
                this.novel = {
                    id: targetNovel.id,
                    title: targetNovel.title,
                    author: targetNovel.author,
                    summary: targetNovel.summary,
                    episodes: []
                };
                
                // 話一覧を設定
                const novelEpisodes = data.episodes[this.novelId.toString()];
                if (novelEpisodes) {
                    this.novel.episodes = novelEpisodes.map(episode => ({
                        id: episode.id,
                        title: episode.title,
                        postDate: episode.postDate
                    }));
                }
                
                console.log('小説詳細データを読み込みました:', this.novel);
            } catch (error) {
                console.error('小説詳細データの読み込みに失敗しました:', error);
                // フォールバック用のサンプルデータ
                this.novel = {
                    id: this.novelId,
                    title: 'データ読み込みエラー',
                    author: '不明',
                    summary: 'データの読み込みに失敗しました。',
                    episodes: []
                };
            }
        },
        
        openEpisode(episodeId) {
            console.log('話を開く:', episodeId);
            // URLパラメータを使って話閲覧画面へ遷移
            window.location.href = `episode.html?novelId=${this.novel.id}&episodeId=${episodeId}`;
        }
    }
}