'use client'

import { Card } from '@/types/card'
import CardListItem from './CardListItem'

interface CardListProps {
  cards: Card[]
  selectedIndex: number
  quantities: { [cardId: string]: number }
  onQuantityChange: (cardId: string, quantity: number) => void
  onCardSelect: (index: number) => void
}

export default function CardList({ 
  cards, 
  selectedIndex, 
  quantities, 
  onQuantityChange,
  onCardSelect 
}: CardListProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        検索結果がありません
      </div>
    )
  }

  return (
    <div>
      <div className="hidden md:flex items-center px-4 py-2 text-sm font-semibold text-gray-600 border-b bg-gray-50">
        <div className="flex-1">商品タイトル</div>
        <div className="w-24">商品型番</div>
        <div className="w-20 text-center">レアリティ</div>
        <div className="w-24 text-right">買取価格</div>
        <div className="w-32 text-center">数量</div>
        <div className="w-32 text-center">操作</div>
      </div>
      <div className="divide-y divide-gray-100">
        {cards.map((card, index) => (
          <CardListItem
            key={card.cardId}
            card={card}
            isSelected={index === selectedIndex}
            quantity={quantities[card.cardId] || 0}
            onQuantityChange={onQuantityChange}
            onClick={() => onCardSelect(index)}
          />
        ))}
      </div>
    </div>
  )
}