'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar'
import CardList from '@/components/CardList'
import CardDetailView from '@/components/CardDetailView'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation'
import { useInvoice } from '@/contexts/InvoiceContext'
import { CardData } from '@/lib/spreadsheet'

export default function HomeClient({ cardData: initialCardData }: { cardData: CardData }) {
  const [searchValue, setSearchValue] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [quantities, setQuantities] = useState<{ [cardId: string]: number }>({})
  const [cardData, setCardData] = useState<CardData>(initialCardData)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { getTotalQuantity, addItem } = useInvoice()

  const filteredCards = useMemo(() => {
    if (!searchValue) return []

    // すべてのカードを1つの配列にフラット化
    const allCards = Object.values(cardData).flat()
    const lowercasedSearchValue = searchValue.toLowerCase();

    // 商品型番が存在し、文字列であることも確認してからフィルタリングする
    return allCards.filter(card => {
      if (!card) return false;

      const title = card.商品タイトル?.toLowerCase() || '';
      const model = card.商品型番?.toLowerCase() || '';

      // 入力値が数字のみかどうかを判定
      const isNumeric = /^\d+$/.test(lowercasedSearchValue);

      if (isNumeric) {
        // 数字のみの場合は、商品型番の前方一致で検索
        return model.startsWith(lowercasedSearchValue);
      } else {
        // それ以外の場合は、商品タイトルの部分一致で検索
        return title.includes(lowercasedSearchValue);
      }
    });
  }, [searchValue, cardData])

  const selectedCard = filteredCards[selectedIndex] || null

  const handleQuantityChange = (cardId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [cardId]: Math.max(0, quantity)
    }))
  }

  const handleSelectedQuantityChange = (delta: number) => {
    if (selectedCard) {
      if (delta === 0) {
        // Enterキーが押された場合、現在の数量を納品書に追加
        const currentQuantity = quantities[selectedCard.cardId] || 0
        if (currentQuantity > 0) {
          addItem(selectedCard, currentQuantity)
          // 追加後、数量をリセット
          handleQuantityChange(selectedCard.cardId, 0)
        }
      } else {
        const currentQuantity = quantities[selectedCard.cardId] || 0
        handleQuantityChange(selectedCard.cardId, currentQuantity + delta)
      }
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/refresh-data')
      const result = await response.json()
      
      if (result.success) {
        setCardData(result.data)
        // 選択インデックスをリセット
        setSelectedIndex(0)
      } else {
        console.error('Failed to refresh data')
        alert('データの更新に失敗しました')
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
      alert('データの更新中にエラーが発生しました')
    } finally {
      setIsRefreshing(false)
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

  // スワイプナビゲーションの追加
  useSwipeNavigation({
    onSwipeUp: () => {
      // 上スワイプで前のカードへ（上矢印と同じ）
      if (selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1)
      }
    },
    onSwipeDown: () => {
      // 下スワイプで次のカードへ（下矢印と同じ）
      if (selectedIndex < filteredCards.length - 1) {
        setSelectedIndex(selectedIndex + 1)
      }
    },
    onSwipeLeft: () => {
      // 左スワイプで型番を増やす
      const numValue = parseInt(searchValue) || 0
      if (numValue < 999) {
        setSearchValue(String(numValue + 1).padStart(3, '0'))
      }
    },
    onSwipeRight: () => {
      // 右スワイプで型番を減らす
      const numValue = parseInt(searchValue) || 0
      if (numValue > 0) {
        setSearchValue(String(numValue - 1).padStart(3, '0'))
      }
    }
  })

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">ポケサーチ</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isRefreshing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  更新中...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  データ更新
                </>
              )}
            </button>
            <div className="relative">
              <Link href="/invoice">
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-300 ease-in-out transform hover:scale-105">
                  納品書を見る
                </button>
              </Link>
              {getTotalQuantity() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {getTotalQuantity()}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
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
            <li>納品書へ追加: Enter キーで選択カードを納品書に追加</li>
          </ul>
        </div>
      </main>
    </div>
  )
}