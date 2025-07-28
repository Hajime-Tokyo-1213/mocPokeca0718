'use client'

import { useInvoice } from '@/contexts/InvoiceContext'
import { isMobileDevice } from '@/utils/deviceDetection'

interface InvoiceSummaryProps {
  totalQuantity: number
  totalPrice: number
}

export default function InvoiceSummary({ totalQuantity, totalPrice }: InvoiceSummaryProps) {
  const { clearInvoice, items } = useInvoice()

  const generatePrintableInvoice = () => {
    // 印刷用のHTMLを作成（PC・スマホ共通）
    const printContent = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>納品書 - ${new Date().toLocaleDateString('ja-JP')}</title>
        <style>
          @page {
            size: A4;
            margin: 10mm 15mm 15mm 15mm;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Noto Sans JP', 'Hiragino Sans', 'Meiryo', sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #000;
            background: #fff;
          }
          .invoice-container {
            width: 100%;
            max-width: 180mm;
            margin: 0 auto;
          }
          h1 {
            text-align: center;
            font-size: 18pt;
            margin-bottom: 5mm;
            padding-bottom: 2mm;
            border-bottom: 2px solid #000;
          }
          .header-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5mm;
            font-size: 9pt;
          }
          .company-info {
            text-align: left;
          }
          .date-info {
            text-align: right;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 3mm;
            font-size: 9pt;
          }
          th, td {
            border: 0.5pt solid #666;
            padding: 1.5mm 2mm;
            text-align: left;
          }
          th {
            background-color: #f0f0f0;
            font-weight: bold;
            border-bottom: 1pt solid #000;
          }
          td {
            height: 4.5mm;
          }
          .col-model {
            width: 45%;
          }
          .col-price, .col-qty, .col-subtotal {
            width: 18.33%;
            text-align: right;
          }
          th.col-price, th.col-qty, th.col-subtotal {
            text-align: right;
          }
          .total-row {
            background-color: #f8f8f8;
            font-weight: bold;
            border-top: 1.5pt solid #000;
          }
          .total-label {
            text-align: right;
            padding-right: 4mm;
          }
          .total-amount {
            font-size: 11pt;
            color: #000;
          }
          .footer {
            margin-top: 10mm;
            text-align: center;
            font-size: 8pt;
            color: #666;
          }
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <h1>納品書 / Invoice</h1>
          <div class="header-info">
            <div class="company-info">
              <strong>ポケサーチ</strong><br>
              ポケモンカード買取価格検索
            </div>
            <div class="date-info">
              発行日: ${new Date().toLocaleDateString('ja-JP')}<br>
              No: ${new Date().getTime()}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th class="col-model">型番 / Model No.</th>
                <th class="col-price">単価 / Unit Price</th>
                <th class="col-qty">数量 / Qty</th>
                <th class="col-subtotal">小計 / Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, index) => {
                const price = parseInt(item.買取価格) || 0;
                const subtotal = price * item.quantity;
                return `
                  <tr>
                    <td class="col-model">${item.商品型番 || ''}</td>
                    <td class="col-price">¥${price.toLocaleString()}</td>
                    <td class="col-qty">${item.quantity}</td>
                    <td class="col-subtotal">¥${subtotal.toLocaleString()}</td>
                  </tr>
                `;
              }).join('')}
              ${(() => {
                // 45行になるよう空行を追加
                const emptyRows = Math.max(0, 45 - items.length - 1);
                return Array(emptyRows).fill('').map(() => `
                  <tr>
                    <td class="col-model">&nbsp;</td>
                    <td class="col-price">&nbsp;</td>
                    <td class="col-qty">&nbsp;</td>
                    <td class="col-subtotal">&nbsp;</td>
                  </tr>
                `).join('');
              })()}
              <tr class="total-row">
                <td colspan="2" class="total-label">合計 / Total</td>
                <td class="col-qty">${totalQuantity}</td>
                <td class="col-subtotal total-amount">¥${totalPrice.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            ※この納品書は自動生成されたものです。
          </div>
        </div>
      </body>
      </html>
    `;

    return printContent;
  };

  const handlePDFExport = async () => {
    try {
      // PC・スマホ共通で新しいウィンドウで印刷
      const printContent = generatePrintableInvoice();
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // ページが読み込まれてから印刷ダイアログを表示
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 100);
        };
      }
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert('PDFの生成に失敗しました。');
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