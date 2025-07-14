/**
 * エラーメッセージコンポーネント
 */
interface ErrorMessageProps {
  title?: string
  message: string
  showRetry?: boolean
  onRetry?: () => void
}

export function ErrorMessage({ 
  title = "エラーが発生しました", 
  message, 
  showRetry = false, 
  onRetry 
}: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4" data-testid="error-message">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 transition-colors"
          >
            再試行
          </button>
        )}
      </div>
    </div>
  )
}