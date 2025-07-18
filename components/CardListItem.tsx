'use client'

import { Card } from '@/types/card'
import QuantitySelector from './QuantitySelector'
import { useInvoice } from '@/contexts/InvoiceContext'

interface CardListItemProps {
  card: Card
  isSelected: boolean
  quantity: number
  onQuantityChange: (cardId: string, quantity: number) => void
  onClick: () => void
}

export default function CardListItem({ 
  card, 
  isSelected, 
  quantity, 
  onQuantityChange,
  onClick 
}: CardListItemProps) {
  const { addItem } = useInvoice()

  const handleAddToInvoice = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (quantity > 0) {
      addItem(card, quantity)
    }
  }
  return (
    <div 
      className={`
        px-4 py-3 md:py-1.5 
        transition-all duration-200 border-l-4
        cursor-pointer
        ${isSelected 
          ? 'bg-blue-50 border-blue-500' 
          : 'bg-white hover:bg-gray-50 border-transparent'
        }
      `}
      onClick={onClick}
    >
      <div className="md:flex md:items-center">
        <div className="flex-1 font-medium text-sm truncate pr-2 mb-2 md:mb-0" title={card.商品タイトル}>
          {card.商品タイトル}
        </div>
        <div className="md:hidden flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-600">{card.商品型番}</span>
          <span className={`
            px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap
            ${card.レアリティ === 'AR' ? 'bg-purple-100 text-purple-800' : ''}
            ${card.レアリティ === 'SR' ? 'bg-yellow-100 text-yellow-800' : ''}
            ${card.レアリティ === 'R' ? 'bg-blue-100 text-blue-800' : ''}
            ${!['AR', 'SR', 'R'].includes(card.レアリティ) ? 'bg-gray-100 text-gray-800' : ''}
          `}>
            {card.レアリティ}
          </span>
          <span className="font-semibold text-green-600 text-sm">{card.買取価格}</span>
        </div>
        <div className="hidden md:flex md:items-center">
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
        </div>
        <div className="flex items-center gap-2">
          <div className="w-32 flex justify-center">
            <QuantitySelector
              quantity={quantity}
              onQuantityChange={(newQuantity) => onQuantityChange(card.cardId, newQuantity)}
            />
          </div>
          <div className="w-32 flex justify-center">
            <button
              onClick={handleAddToInvoice}
              disabled={quantity === 0}
              className={`
                px-3 py-1 rounded text-sm font-medium transition-colors
                ${quantity === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
                }
              `}
            >
              納品書へ追加
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}