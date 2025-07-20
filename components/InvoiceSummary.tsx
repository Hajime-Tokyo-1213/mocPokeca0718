'use client'

import { useInvoice } from '@/contexts/InvoiceContext'
import { isMobileDevice } from '@/utils/deviceDetection'
import jsPDF from 'jspdf'

interface InvoiceSummaryProps {
  totalQuantity: number
  totalPrice: number
}

export default function InvoiceSummary({ totalQuantity, totalPrice }: InvoiceSummaryProps) {
  const { clearInvoice, items } = useInvoice()

  const generateMobilePDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;
    
    // タイトル
    pdf.setFontSize(20);
    pdf.text('納品書', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
    
    // 日付
    pdf.setFontSize(10);
    const today = new Date().toLocaleDateString('ja-JP');
    pdf.text(`発行日: ${today}`, 20, yPosition);
    yPosition += 10;
    
    // ヘッダー
    pdf.setFontSize(8);
    pdf.text('商品タイトル', 20, yPosition);
    pdf.text('単価', 120, yPosition);
    pdf.text('数量', 150, yPosition);
    pdf.text('小計', 170, yPosition);
    yPosition += 5;
    
    // 線
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 5;
    
    // 商品リスト
    items.forEach((item) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // 商品名を短縮（長すぎる場合）
      const title = item.商品タイトル.length > 40 ? item.商品タイトル.substring(0, 40) + '...' : item.商品タイトル;
      pdf.text(title, 20, yPosition);
      const price = parseInt(item.買取価格) || 0;
      pdf.text(`¥${price.toLocaleString()}`, 120, yPosition);
      pdf.text(item.quantity.toString(), 155, yPosition);
      pdf.text(`¥${(price * item.quantity).toLocaleString()}`, 170, yPosition);
      yPosition += 7;
    });
    
    // 合計
    yPosition += 5;
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 7;
    
    pdf.setFontSize(10);
    pdf.text(`合計数量: ${totalQuantity}点`, 120, yPosition);
    yPosition += 7;
    pdf.setFontSize(12);
    pdf.text(`合計金額: ¥${totalPrice.toLocaleString()}`, 120, yPosition);
    
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