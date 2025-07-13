// Web小説閲覧サイト Alpine.js アプリケーション

function novelApp() {
    return {
        // 初期化
        init() {
            console.log('Novel App が初期化されました');
            this.loadNovels();
        },
        
        // データ
        novels: [],
        searchQuery: '',
        
        // 計算されたプロパティ
        get filteredNovels() {
            if (!this.searchQuery) {
                return this.novels;
            }
            return this.novels.filter(novel => 
                novel.title.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        },
        
        // メソッド
        async loadNovels() {
            try {
                const response = await fetch('../assets/data/novels.json');
                const data = await response.json();
                this.novels = data.novels;
                console.log('小説データを読み込みました:', this.novels);
            } catch (error) {
                console.error('小説データの読み込みに失敗しました:', error);
                // フォールバック用のサンプルデータ
                this.novels = [
                    {
                        id: 1,
                        title: '小説タイトルA',
                        summary: 'これは小説Aの概要です。',
                        updatedAt: '2025/07/12',
                        episodes: 8
                    }
                ];
            }
        },
        
        searchNovels() {
            console.log('検索実行:', this.searchQuery);
        },
        
        openNovel(novelId) {
            console.log('小説を開く:', novelId);
            // URLパラメータを使って小説詳細画面へ遷移
            window.location.href = `novel-detail.html?id=${novelId}`;
        }
    }
}