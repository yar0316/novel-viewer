/**
 * サイト共通フッターコンポーネント
 * シンプルなコピーライト表示
 */
export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 px-4 py-6 mt-8">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm text-gray-600">
          &copy; 2025 Web小説サイト
        </p>
      </div>
    </footer>
  )
}