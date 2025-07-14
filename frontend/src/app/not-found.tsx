/**
 * 404ページ
 */
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-xl font-medium text-gray-700 mb-6">
        お探しのページが見つかりませんでした
      </h2>
      <p className="text-gray-600 mb-8">
        URLが間違っているか、ページが削除された可能性があります。
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 transition-colors"
      >
        トップページに戻る
      </Link>
    </div>
  )
}