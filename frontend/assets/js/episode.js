// 話閲覧画面 Alpine.js アプリケーション

function episodeApp() {
    return {
        // 初期化
        init() {
            console.log('Episode App が初期化されました');
            this.getParamsFromUrl();
            this.loadEpisode();
        },
        
        // データ
        novel: {},
        episode: {},
        novelId: 1,
        episodeId: 1,
        
        // 計算されたプロパティ
        get hasPrevEpisode() {
            return this.episodeId > 1;
        },
        
        get hasNextEpisode() {
            // JSONデータから実際の総話数をチェック
            // とりあえず現在の実装では適当な値を返す
            // 実際には loadEpisode で総話数を取得して判定する
            return this.episodeId < 10; // 最大10話として仮設定
        },
        
        // メソッド
        getParamsFromUrl() {
            const urlParams = new URLSearchParams(window.location.search);
            this.novelId = parseInt(urlParams.get('novelId')) || 1;
            this.episodeId = parseInt(urlParams.get('episodeId')) || 1;
            console.log('取得したパラメータ - 小説ID:', this.novelId, '話ID:', this.episodeId);
        },
        
        async loadEpisode() {
            try {
                const response = await fetch('/assets/data/novels.json');
                const data = await response.json();
                
                // 小説の基本情報を取得
                const targetNovel = data.novels.find(novel => novel.id === this.novelId);
                if (!targetNovel) {
                    throw new Error(`小説ID ${this.novelId} が見つかりません`);
                }
                
                this.novel = {
                    id: targetNovel.id,
                    title: targetNovel.title
                };
                
                // 指定された話を取得
                const novelEpisodes = data.episodes[this.novelId.toString()];
                if (!novelEpisodes) {
                    throw new Error(`小説ID ${this.novelId} の話データが見つかりません`);
                }
                
                const targetEpisode = novelEpisodes.find(episode => episode.id === this.episodeId);
                if (!targetEpisode) {
                    throw new Error(`話ID ${this.episodeId} が見つかりません`);
                }
                
                this.episode = {
                    id: targetEpisode.id,
                    title: targetEpisode.title,
                    content: targetEpisode.content
                };
                
                console.log('話データを読み込みました:', this.episode);
            } catch (error) {
                console.error('話データの読み込みに失敗しました:', error);
                // フォールバック用のサンプルデータ
                this.novel = {
                    id: this.novelId,
                    title: 'データ読み込みエラー'
                };
                
                this.episode = {
                    id: this.episodeId,
                    title: 'データ読み込みエラー',
                    content: [
                        {
                            id: 1,
                            text: 'データの読み込みに失敗しました。'
                        }
                    ]
                };
            }
        },
        
        goToPrevEpisode() {
            if (this.hasPrevEpisode) {
                console.log('前の話へ:', this.episodeId - 1);
                // 前の話を読み込み
                window.location.href = `episode.html?novelId=${this.novelId}&episodeId=${this.episodeId - 1}`;
            }
        },
        
        goToNextEpisode() {
            if (this.hasNextEpisode) {
                console.log('次の話へ:', this.episodeId + 1);
                // 次の話を読み込み
                window.location.href = `episode.html?novelId=${this.novelId}&episodeId=${this.episodeId + 1}`;
            }
        },
        
        backToDetails() {
            console.log('目次へ戻る');
            // 小説詳細画面へ
            window.location.href = `novel-detail.html?id=${this.novelId}`;
        }
    }
}