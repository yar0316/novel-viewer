// Vercel Edge Middleware for Basic Authentication
// Web小説閲覧サイト用のアクセス制限

export const config = {
  // すべてのパスにBasic認証を適用
  matcher: '/(.*)',
};

export default function middleware(request) {
  // Vercelの環境変数からユーザー名とパスワードを取得
  const basicAuthUser = process.env.BASIC_AUTH_USER;
  const basicAuthPassword = process.env.BASIC_AUTH_PASSWORD;

  // 環境変数が設定されていなければ認証をスキップ（開発環境用）
  if (!basicAuthUser || !basicAuthPassword) {
    console.warn('Basic Auth credentials are not set. Skipping authentication.');
    return; // 認証なしでアクセス許可
  }

  const authHeader = request.headers.get('authorization');

  if (authHeader) {
    const auth = authHeader.split(' ')[1];
    
    try {
      // Base64でエンコードされた認証情報をデコード
      const [user, pwd] = atob(auth).split(':');

      if (user === basicAuthUser && pwd === basicAuthPassword) {
        // 認証成功 - 本来のページへのアクセスを許可
        return;
      }
    } catch (error) {
      // Base64デコードエラーなど
      console.error('Basic Auth decode error:', error);
    }
  }

  // 認証失敗時は401エラーを返す
  return new Response('認証が必要です / Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Novel Viewer - Private Access"',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}