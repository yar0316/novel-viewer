/**
 * ローディングスピナーコンポーネント
 */
export function LoadingSpinner({ message = "読み込み中..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8" data-testid="loading-spinner">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="mt-2 text-sm text-gray-600">{message}</p>
    </div>
  )
}