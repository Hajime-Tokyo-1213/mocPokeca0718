'use client'

import { useInvoice, InvoiceItem } from '@/contexts/InvoiceContext'

interface InvoiceListItemProps {
  item: InvoiceItem
}

export default function InvoiceListItem({ item }: InvoiceListItemProps) {
  const { updateQuantity, removeItem } = useInvoice()
  
  const price = parseFloat(item.買取価格.replace(/[¥,]/g, ''))
  const subtotal = price * item.quantity

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value) || 0
    updateQuantity(item.cardId, newQuantity)
  }

  return (
    <div className="px-4 py-3 md:py-2 hover:bg-gray-50">
      <div className="md:flex md:items-center">
        <div className="flex-1 font-medium text-sm truncate pr-2 mb-2 md:mb-0" title={item.商品タイトル}>
          {item.商品タイトル}
        </div>
        <div className="md:hidden grid grid-cols-2 gap-2 mb-2">
          <div>
            <span className="text-xs text-gray-500">型番: </span>
            <span className="text-sm">{item.商品型番}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500">レア: </span>
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap
              ${item.レアリティ === 'AR' ? 'bg-purple-100 text-purple-800' : ''}
              ${item.レアリティ === 'SR' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${item.レアリティ === 'R' ? 'bg-blue-100 text-blue-800' : ''}
              ${!['AR', 'SR', 'R'].includes(item.レアリティ) ? 'bg-gray-100 text-gray-800' : ''}
            `}>
              {item.レアリティ}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-500">単価: </span>
            <span className="font-semibold text-green-600 text-sm">{item.買取価格}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500">小計: </span>
            <span className="font-semibold text-sm">¥{subtotal.toLocaleString()}</span>
          </div>
        </div>
        <div className="hidden md:flex md:items-center">
          <div className="w-24 text-sm text-gray-600">{item.商品型番}</div>
          <div className="w-20 text-sm flex justify-center">
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap
              ${item.レアリティ === 'AR' ? 'bg-purple-100 text-purple-800' : ''}
              ${item.レアリティ === 'SR' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${item.レアリティ === 'R' ? 'bg-blue-100 text-blue-800' : ''}
              ${!['AR', 'SR', 'R'].includes(item.レアリティ) ? 'bg-gray-100 text-gray-800' : ''}
            `}>
              {item.レアリティ}
            </span>
          </div>
          <div className="w-24 font-semibold text-green-600 text-sm text-right">{item.買取価格}</div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 md:hidden">数量:</span>
            <input
              type="number"
              value={item.quantity}
              onChange={handleQuantityChange}
              className="w-16 px-2 py-1 text-center border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>
          <div className="hidden md:block w-24 font-semibold text-sm text-right">
            ¥{subtotal.toLocaleString()}
          </div>
          <div className="print:hidden">
            <button
              onClick={() => removeItem(item.cardId)}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
            >
              削除
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}