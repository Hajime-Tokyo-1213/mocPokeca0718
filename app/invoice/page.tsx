'use client'

import Link from 'next/link'
import { useInvoice } from '@/contexts/InvoiceContext'
import InvoiceList from '@/components/InvoiceList'
import InvoiceSummary from '@/components/InvoiceSummary'
import SavedInvoiceList from '@/components/SavedInvoiceList'

export default function InvoicePage() {
  const { 
    items, 
    getTotalQuantity, 
    getTotalPrice, 
    saveOrUpdateInvoice, 
    editingInvoiceId, 
    savedInvoices,
    clearInvoice 
  } = useInvoice()

  const editingInvoice = editingInvoiceId 
    ? savedInvoices.find(inv => inv.id === editingInvoiceId) 
    : null;

  const formatInvoiceNumber = (num: number | undefined) => {
    if (typeof num !== 'number') return '';
    return num.toString().padStart(4, '0');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6 print:mb-4">
          <div className="flex items-baseline gap-4">
            <h1 className="text-3xl font-bold text-gray-900 print:text-xl">
              納品書
            </h1>
            {editingInvoice && (
              <span className="text-lg font-semibold text-blue-600">
                編集中: #{formatInvoiceNumber(editingInvoice.invoiceNumber)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 print:hidden">
            {editingInvoiceId && (
              <button
                onClick={clearInvoice}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                新規作成へ
              </button>
            )}
            <button
              onClick={saveOrUpdateInvoice}
              disabled={items.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-gray-300"
            >
              {editingInvoiceId ? '更新する' : '保存する'}
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors"
            >
              検索へ
            </Link>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">納品書に商品が追加されていません</p>
            <p className="mt-2 text-sm text-gray-400">検索画面から商品を追加するか、下の一覧から納品書を編集してください。</p>
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

        <SavedInvoiceList />

      </div>
    </div>
  )
}