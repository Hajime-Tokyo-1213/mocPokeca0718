'use client'

import { useInvoice } from '@/contexts/InvoiceContext'

interface InvoiceSummaryProps {
  totalQuantity: number
  totalPrice: number
}

export default function InvoiceSummary({ totalQuantity, totalPrice }: InvoiceSummaryProps) {
  const { clearInvoice } = useInvoice()

  const handlePDFExport = () => {
    window.print()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">合計</h2>
        <div className="text-right">
          <div className="text-sm text-gray-600">合計数量: {totalQuantity}点</div>
          <div className="text-2xl font-bold text-green-600">¥{totalPrice.toLocaleString()}</div>
        </div>
      </div>
      
      <div className="flex gap-4 print:hidden">
        <button
          onClick={handlePDFExport}
          className="flex-1 px-6 py-3 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 transition-colors"
        >
          PDFとして出力
        </button>
        <button
          onClick={clearInvoice}
          className="px-6 py-3 bg-gray-500 text-white rounded font-medium hover:bg-gray-600 transition-colors"
        >
          クリア
        </button>
      </div>
    </div>
  )
}