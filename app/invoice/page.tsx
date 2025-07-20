'use client'

import Link from 'next/link'
import { useInvoice } from '@/contexts/InvoiceContext'
import InvoiceList from '@/components/InvoiceList'
import InvoiceSummary from '@/components/InvoiceSummary'

export default function InvoicePage() {
  const { items, getTotalQuantity, getTotalPrice } = useInvoice()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6 print:mb-4">
          <h1 className="text-3xl font-bold text-gray-900 print:text-xl">
            納品書
          </h1>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors print:hidden"
          >
            検索画面へ戻る
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">納品書に商品が追加されていません</p>
            <Link
              href="/"
              className="inline-block mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors print:hidden"
            >
              商品を追加する
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <InvoiceList />
            </div>
            <div className="text-sm text-gray-600 mb-2 print:hidden text-right">
              ※買取単価をクリックすると金額を変更できます
            </div>
            <InvoiceSummary
              totalQuantity={getTotalQuantity()}
              totalPrice={getTotalPrice()}
            />
          </>
        )}
      </div>
    </div>
  )
}