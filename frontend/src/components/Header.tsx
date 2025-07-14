/**
 * サイト共通ヘッダーコンポーネント
 * サイトタイトルのみ
 */
import Link from 'next/link'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <Link 
            href="/" 
            className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors"
          >
            Web小説サイト
          </Link>
        </div>
      </div>
    </header>
  )
}