'use client'

import { Card } from '@/types/card'
import QuantitySelector from './QuantitySelector'

interface CardListItemProps {
  card: Card
  isSelected: boolean
  quantity: number
  onQuantityChange: (cardId: string, quantity: number) => void
}

export default function CardListItem({ 
  card, 
  isSelected, 
  quantity, 
  onQuantityChange 
}: CardListItemProps) {
  return (
    <div 
      className={`
        flex items-center px-4 py-1.5 
        transition-all duration-200 border-l-4
        ${isSelected 
          ? 'bg-blue-50 border-blue-500' 
          : 'bg-white hover:bg-gray-50 border-transparent'
        }
      `}
    >
      <div className="flex-1 font-medium text-sm truncate pr-2" title={card.商品タイトル}>
        {card.商品タイトル}
      </div>
      <div className="w-24 text-sm text-gray-600">{card.商品型番}</div>
      <div className="w-20 text-sm flex justify-center">
        <span className={`
          px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap
          ${card.レアリティ === 'AR' ? 'bg-purple-100 text-purple-800' : ''}
          ${card.レアリティ === 'SR' ? 'bg-yellow-100 text-yellow-800' : ''}
          ${card.レアリティ === 'R' ? 'bg-blue-100 text-blue-800' : ''}
          ${!['AR', 'SR', 'R'].includes(card.レアリティ) ? 'bg-gray-100 text-gray-800' : ''}
        `}>
          {card.レアリティ}
        </span>
      </div>
      <div className="w-24 font-semibold text-green-600 text-sm text-right">{card.買取価格}</div>
      <div className="w-32 flex justify-center">
        <QuantitySelector
          quantity={quantity}
          onQuantityChange={(newQuantity) => onQuantityChange(card.cardId, newQuantity)}
        />
      </div>
    </div>
  )
}