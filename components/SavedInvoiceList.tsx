'use client'

import { useInvoice } from '@/contexts/InvoiceContext'

export default function SavedInvoiceList() {
  const { 
    savedInvoices, 
    loadInvoice, 
    deleteInvoice, 
    duplicateInvoice,
    printInvoice,
    editingInvoiceId 
  } = useInvoice()
  
  const formatInvoiceNumber = (num: number | undefined) => {
    if (typeof num !== 'number') return '----';
    return num.toString().padStart(4, '0');
  }

  if (savedInvoices.length === 0) {
    return (
      <div className="mt-8 bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">保存された納品書はありません。</p>
      </div>
    )
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">保存済み納品書一覧</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No#
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                保存日時
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                合計金額
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {savedInvoices.sort((a, b) => (b.invoiceNumber || 0) - (a.invoiceNumber || 0)).map((invoice) => (
              <tr key={invoice.id} className={editingInvoiceId === invoice.id ? 'bg-blue-50' : ''}>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                  {formatInvoiceNumber(invoice.invoiceNumber)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(invoice.savedAt).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">
                  ¥{invoice.totalValue.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                  <button
                    onClick={() => printInvoice(invoice.id)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    title="PDF"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteInvoice(invoice.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title="削除"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => loadInvoice(invoice.id)}
                    className="text-green-600 hover:text-green-800 transition-colors"
                    title="編集"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                      <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => duplicateInvoice(invoice.id)}
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                    title="複製"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                      <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h6a2 2 0 00-2-2H5z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 