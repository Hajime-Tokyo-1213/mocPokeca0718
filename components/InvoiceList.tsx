'use client'

import { useInvoice } from '@/contexts/InvoiceContext'
import InvoiceListItem from './InvoiceListItem'

export default function InvoiceList() {
  const { items } = useInvoice()

  return (
    <div>
      <div className="hidden md:flex items-center px-4 py-2 text-sm font-semibold text-gray-600 border-b bg-gray-50">
        <div className="flex-1">商品タイトル</div>
        <div className="w-24">商品型番</div>
        <div className="w-20 text-center">レアリティ</div>
        <div className="w-24 text-right">買取単価</div>
        <div className="w-20 text-center">数量</div>
        <div className="w-24 text-right">小計</div>
        <div className="w-20 text-center print:hidden">操作</div>
      </div>
      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <InvoiceListItem key={item.cardId} item={item} />
        ))}
      </div>
    </div>
  )
}