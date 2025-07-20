'use client'

import { useInvoice } from '@/contexts/InvoiceContext'
import InvoiceListItem from './InvoiceListItem'

export default function InvoiceList() {
  const { items } = useInvoice()

  return (
    <div>
      <div className="flex items-center px-2 py-1 text-xs font-semibold text-gray-600 border-b bg-gray-50 print:text-[10px] print:py-0.5">
        <div className="flex-1">商品タイトル</div>
        <div className="w-20 text-right print:w-16">買取単価</div>
        <div className="w-12 text-center print:w-10">数量</div>
        <div className="w-20 text-right print:w-16">小計</div>
        <div className="w-16 text-center print:hidden">操作</div>
      </div>
      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <InvoiceListItem key={item.cardId} item={item} />
        ))}
      </div>
    </div>
  )
}