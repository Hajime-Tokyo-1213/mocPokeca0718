'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error page:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-red-600 mb-4">エラーが発生しました</h2>
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <p className="text-gray-700 mb-2">
            データの取得中にエラーが発生しました。
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-gray-600">詳細情報</summary>
              <pre className="mt-2 text-xs text-gray-500 overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </div>
        <button
          onClick={reset}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          再試行
        </button>
      </div>
    </div>
  )
}