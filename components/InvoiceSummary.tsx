'use client'

import { useInvoice } from '@/contexts/InvoiceContext'
import { isMobileDevice } from '@/utils/deviceDetection'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface InvoiceSummaryProps {
  totalQuantity: number
  totalPrice: number
}

export default function InvoiceSummary({ totalQuantity, totalPrice }: InvoiceSummaryProps) {
  const { clearInvoice, items } = useInvoice()

  const generateMobilePDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // 日本語フォントの設定（デフォルトフォントを使用し、文字をBase64エンコード）
    pdf.setFont('helvetica');
    
    // タイトル
    pdf.setFontSize(20);
    pdf.text('Invoice', pdf.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    
    // 日付
    pdf.setFontSize(10);
    const today = new Date().toLocaleDateString('ja-JP');
    pdf.text(`Date: ${today}`, 20, 35);
    
    // テーブルデータの準備
    const tableData = items.map((item) => {
      const price = parseInt(item.買取価格) || 0;
      return [
        item.商品型番 || '',
        `${price.toLocaleString()}`,
        item.quantity.toString(),
        `${(price * item.quantity).toLocaleString()}`
      ];
    });
    
    // autoTableを使用してテーブルを生成
    autoTable(pdf, {
      head: [['Model No.', 'Unit Price (JPY)', 'Qty', 'Subtotal (JPY)']],
      body: tableData,
      startY: 45,
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 40, halign: 'right' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 40, halign: 'right' },
      },
      foot: [[
        'Total',
        '',
        `${totalQuantity}`,
        `${totalPrice.toLocaleString()}`
      ]],
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
      },
    });
    
    // PDFをダウンロード
    const filename = `invoice_${new Date().getTime()}.pdf`;
    pdf.save(filename);
  };

  const handlePDFExport = () => {
    if (isMobileDevice()) {
      generateMobilePDF();
    } else {
      window.print();
    }
  }

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
          onClick={handlePDFExport}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 transition-colors text-sm"
        >
          {isMobileDevice() ? 'PDFをダウンロード' : 'PDFとして出力'}
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