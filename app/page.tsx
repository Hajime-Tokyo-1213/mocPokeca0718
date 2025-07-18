'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar'
import CardList from '@/components/CardList'
import CardDetailView from '@/components/CardDetailView'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import { useInvoice } from '@/contexts/InvoiceContext'
import cardData from '@/data/basicdata.json'
import { Card } from '@/types/card'

type CardData = {
  [key: string]: Card[]
}

export default function Home() {
  const [searchValue, setSearchValue] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [quantities, setQuantities] = useState<{ [cardId: string]: number }>({})
  const { getTotalQuantity } = useInvoice()

  const filteredCards = useMemo(() => {
    if (!searchValue) return []
    
    const cards = (cardData as CardData)[searchValue] || []
    return cards
  }, [searchValue])

  const selectedCard = filteredCards[selectedIndex] || null

  const handleQuantityChange = (cardId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [cardId]: Math.max(0, quantity)
    }))
  }

  const handleSelectedQuantityChange = (delta: number) => {
    if (selectedCard) {
      const currentQuantity = quantities[selectedCard.cardId] || 0
      handleQuantityChange(selectedCard.cardId, currentQuantity + delta)
    }
  }

  useKeyboardNavigation({
    cardsLength: filteredCards.length,
    selectedIndex,
    setSelectedIndex,
    onQuantityChange: handleSelectedQuantityChange,
    searchValue,
    onSearchValueChange: setSearchValue,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ポケモンカード買取検索システム
          </h1>
          <Link
            href="/invoice"
            className="relative px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            納品書を見る
            {getTotalQuantity() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {getTotalQuantity()}
              </span>
            )}
          </Link>
        </div>
        
        <SearchBar 
          value={searchValue}
          onChange={setSearchValue}
        />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
            <CardList
              cards={filteredCards}
              selectedIndex={selectedIndex}
              quantities={quantities}
              onQuantityChange={handleQuantityChange}
              onCardSelect={setSelectedIndex}
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm">
            <CardDetailView card={selectedCard} />
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>操作方法:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>検索欄: ← → キーで数値を増減、F1キーでフォーカス</li>
            <li>カードリスト: ↑ ↓ キーで選択カードを移動、クリックで選択</li>
            <li>数量変更: Shift + ↑ ↓ キーで選択カードの数量を増減</li>
          </ul>
        </div>
      </div>
    </div>
  )
}