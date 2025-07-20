'use client'

import { useState } from 'react'
import { useInvoice, InvoiceItem } from '@/contexts/InvoiceContext'

interface InvoiceListItemProps {
  item: InvoiceItem
}

export default function InvoiceListItem({ item }: InvoiceListItemProps) {
  const { updateQuantity, updatePrice, removeItem } = useInvoice()
  const [editingPrice, setEditingPrice] = useState(false)
  const [tempPrice, setTempPrice] = useState(item.買取価格)
  
  const price = parseFloat(item.買取価格.replace(/[¥,]/g, ''))
  const subtotal = price * item.quantity

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value) || 0
    updateQuantity(item.cardId, newQuantity)
  }

  const handlePriceEdit = () => {
    setEditingPrice(true)
    setTempPrice(item.買取価格.replace(/[¥,]/g, ''))
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempPrice(e.target.value)
  }

  const handlePriceSave = () => {
    const numericPrice = parseFloat(tempPrice) || 0
    updatePrice(item.cardId, `¥${numericPrice.toLocaleString()}`)
    setEditingPrice(false)
  }

  const handlePriceCancel = () => {
    setTempPrice(item.買取価格)
    setEditingPrice(false)
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 print:py-0.5">
      <div className="flex-1 font-medium text-xs truncate print:text-[10px]" title={item.商品タイトル}>
        {item.商品タイトル}
      </div>
      <div className="w-20 text-right print:w-16">
        {editingPrice ? (
          <div className="flex items-center justify-end gap-1">
            <span className="text-xs">¥</span>
            <input
              type="number"
              value={tempPrice}
              onChange={handlePriceChange}
              className="w-14 px-1 py-0 text-xs text-right border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 print:hidden"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePriceSave()
                if (e.key === 'Escape') handlePriceCancel()
              }}
            />
            <button
              onClick={handlePriceSave}
              className="text-green-600 hover:text-green-700 text-xs print:hidden"
              title="保存"
            >
              ✓
            </button>
            <button
              onClick={handlePriceCancel}
              className="text-red-600 hover:text-red-700 text-xs print:hidden"
              title="キャンセル"
            >
              ✗
            </button>
          </div>
        ) : (
          <span 
            className="font-semibold text-green-600 text-xs cursor-pointer hover:underline print:text-[10px] print:cursor-auto"
            onClick={handlePriceEdit}
          >
            {item.買取価格}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500 print:hidden">×</span>
        <input
          type="number"
          value={item.quantity}
          onChange={handleQuantityChange}
          className="w-12 px-1 py-0 text-xs text-center border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 print:border-0 print:w-10"
          min="0"
        />
      </div>
      <div className="w-20 font-semibold text-xs text-right print:text-[10px] print:w-16">
        ¥{subtotal.toLocaleString()}
      </div>
      <div className="print:hidden">
        <button
          onClick={() => removeItem(item.cardId)}
          className="px-2 py-0.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
        >
          削除
        </button>
      </div>
    </div>
  )
}