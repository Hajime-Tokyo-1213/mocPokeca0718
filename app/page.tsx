'use client'

import { useState, useMemo } from 'react'
import SearchBar from '@/components/SearchBar'
import CardList from '@/components/CardList'
import CardDetailView from '@/components/CardDetailView'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import cardData from '@/data/basicdata.json'
import { Card } from '@/types/card'

type CardData = {
  [key: string]: Card[]
}

export default function Home() {
  const [searchValue, setSearchValue] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [quantities, setQuantities] = useState<{ [cardId: string]: number }>({})

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          ポケモンカード買取検索システム
        </h1>
        
        <SearchBar 
          value={searchValue}
          onChange={setSearchValue}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
            <CardList
              cards={filteredCards}
              selectedIndex={selectedIndex}
              quantities={quantities}
              onQuantityChange={handleQuantityChange}
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm">
            <CardDetailView card={selectedCard} />
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>操作方法:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>検索欄: ← → キーで数値を増減</li>
            <li>カードリスト: ↑ ↓ キーで選択カードを移動</li>
            <li>数量変更: Shift + ↑ ↓ キーで選択カードの数量を増減</li>
          </ul>
        </div>
      </div>
    </div>
  )
}