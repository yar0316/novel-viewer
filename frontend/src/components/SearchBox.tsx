/**
 * 検索ボックスコンポーネント
 * 小説検索機能を提供
 */
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchBoxProps {
  /** 初期値 */
  initialValue?: string
}

export function SearchBox({ initialValue = '' }: SearchBoxProps) {
  const [query, setQuery] = useState(initialValue)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedQuery = query.trim()
    
    if (trimmedQuery) {
      const params = new URLSearchParams(searchParams)
      params.set('search', trimmedQuery)
      router.push(`/?${params.toString()}`)
    } else {
      const params = new URLSearchParams(searchParams)
      params.delete('search')
      const newUrl = params.toString() ? `/?${params.toString()}` : '/'
      router.push(newUrl)
    }
  }

  const handleClear = () => {
    setQuery('')
    const params = new URLSearchParams(searchParams)
    params.delete('search')
    const newUrl = params.toString() ? `/?${params.toString()}` : '/'
    router.push(newUrl)
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-lg mx-auto">
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="タイトル検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pr-10 h-10"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="クリア"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>
      <Button 
        type="submit" 
        className="h-10 w-10 p-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md flex items-center justify-center"
        aria-label="検索"
      >
        <Search className="h-4 w-4" />
      </Button>
    </form>
  )
}