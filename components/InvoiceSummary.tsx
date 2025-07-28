'use client'

import { useInvoice } from '@/contexts/InvoiceContext'

interface InvoiceSummaryProps {
  totalQuantity: number
  totalPrice: number
}

export default function InvoiceSummary({ totalQuantity, totalPrice }: InvoiceSummaryProps) {
  const { clearInvoice, printInvoice } = useInvoice()

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 print:p-2">
      <div className="flex justify-between items-center mb-4 print:mb-2">
        <h2 className="text-lg font-semibold print:text-sm">合計</h2>
        <div className="text-right">
          <div className="text-xs text-gray-600 print:text-[10px]">合計数量: {totalQuantity}点</div>
          <div className="text-xl font-bold text-green-600 print:text-sm">¥{totalPrice.toLocaleString()}</div>
        </div>
      </div>
      
      <div className="flex gap-4 print:hidden">
        <button
          onClick={() => printInvoice()}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 transition-colors text-sm"
        >
          PDF出力
        </button>
        <button
          onClick={clearInvoice}
          className="px-4 py-2 bg-gray-500 text-white rounded font-medium hover:bg-gray-600 transition-colors text-sm"
        >
          クリア
        </button>
      </div>
    </div>
  )
}