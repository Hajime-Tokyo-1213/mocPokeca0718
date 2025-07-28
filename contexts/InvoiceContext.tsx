'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Card } from '@/types/card'

export interface InvoiceItem extends Card {
  quantity: number
}

export interface SavedInvoice {
  id: string; 
  invoiceNumber: number; 
  savedAt: string;
  totalValue: number;
  items: InvoiceItem[];
}

interface InvoiceContextType {
  items: InvoiceItem[]
  setItems: React.Dispatch<React.SetStateAction<InvoiceItem[]>>
  addItem: (card: Card, quantity: number) => void
  updateQuantity: (cardId: string, quantity: number) => void
  updatePrice: (cardId: string, price: string) => void
  removeItem: (cardId: string) => void
  clearInvoice: () => void
  getTotalQuantity: () => number
  getTotalPrice: () => number
  
  savedInvoices: SavedInvoice[]
  saveOrUpdateInvoice: () => void
  loadInvoice: (invoiceId: string) => void
  deleteInvoice: (invoiceId: string) => void
  duplicateInvoice: (invoiceId: string) => void;
  printInvoice: (invoiceId?: string) => void;
  editingInvoiceId: string | null;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined)

const formatInvoiceNumber = (num: number) => num.toString().padStart(4, '0');

const generatePrintableHTML = (invoiceData: {items: InvoiceItem[], totalValue: number, invoiceNumber: string}) => {
  const { items, totalValue, invoiceNumber } = invoiceData;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>納品書 - ${new Date().toLocaleDateString('ja-JP')}</title>
      <style>
        @page { size: A4; margin: 10mm 15mm; }
        body { font-family: 'Hiragino Sans', 'Meiryo', sans-serif; font-size: 10pt; }
        .invoice-container { width: 100%; max-width: 180mm; margin: 0 auto; }
        h1 { text-align: center; font-size: 18pt; margin-bottom: 5mm; padding-bottom: 2mm; border-bottom: 2px solid #000; }
        .header-info { display: flex; justify-content: space-between; margin-bottom: 5mm; font-size: 9pt; }
        table { width: 100%; border-collapse: collapse; margin-top: 3mm; font-size: 9pt; }
        th, td { border: 0.5pt solid #666; padding: 1.5mm 2mm; text-align: left; }
        th { background-color: #f0f0f0; }
        .col-model { width: 45%; }
        .col-price, .col-qty, .col-subtotal { width: 18.33%; text-align: right; }
        .total-row { font-weight: bold; border-top: 1.5pt solid #000; }
        .total-label { text-align: right; padding-right: 4mm; }
        .total-amount { font-size: 11pt; }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <h1>納品書 / Invoice</h1>
        <div class="header-info">
          <div class="company-info"><strong>ポケサーチ</strong><br>ポケモンカード買取価格検索</div>
          <div class="date-info">発行日: ${new Date().toLocaleDateString('ja-JP')}<br>No: ${invoiceNumber}</div>
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
            ${items.map(item => {
              const price = parseInt(item.買取価格) || 0;
              return `
                <tr>
                  <td class="col-model">${item.商品型番 || ''}</td>
                  <td class="col-price">¥${price.toLocaleString()}</td>
                  <td class="col-qty">${item.quantity}</td>
                  <td class="col-subtotal">¥${(price * item.quantity).toLocaleString()}</td>
                </tr>
              `}).join('')}
            ${Array(Math.max(0, 45 - items.length - 1)).fill('<tr><td colspan="4">&nbsp;</td></tr>').join('')}
            <tr class="total-row">
              <td colspan="2" class="total-label">合計 / Total</td>
              <td class="col-qty">${totalQuantity}</td>
              <td class="col-subtotal total-amount">¥${totalValue.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;
};


export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>([])
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedInvoices = localStorage.getItem('savedInvoices')
      if (storedInvoices) {
        setSavedInvoices(JSON.parse(storedInvoices))
      }
    } catch (error) {
      console.error("Failed to load invoices from localStorage", error);
    }
  }, [])

  const updateLocalStorage = (invoices: SavedInvoice[]) => {
    try {
      localStorage.setItem('savedInvoices', JSON.stringify(invoices));
    } catch (error) {
      console.error("Failed to save invoices to localStorage", error);
    }
  }

  const printInvoice = (invoiceId?: string) => {
    let invoiceData;
    if (invoiceId) {
      const saved = savedInvoices.find(inv => inv.id === invoiceId);
      if (saved) {
        invoiceData = { ...saved, invoiceNumber: formatInvoiceNumber(saved.invoiceNumber) };
      }
    } else {
      let invNumberStr: string;
      if (editingInvoiceId) {
        const editing = savedInvoices.find(inv => inv.id === editingInvoiceId);
        invNumberStr = editing ? formatInvoiceNumber(editing.invoiceNumber) : 'N/A';
      } else {
        const maxNum = savedInvoices.reduce((max, inv) => Math.max(max, inv.invoiceNumber || 0), 0);
        invNumberStr = `${formatInvoiceNumber(maxNum + 1)} (新規)`;
      }
      invoiceData = { items, totalValue: getTotalPrice(), invoiceNumber: invNumberStr };
    }

    if (!invoiceData || invoiceData.items.length === 0) {
      alert('印刷するアイテムがありません。');
      return;
    }
    const htmlContent = generatePrintableHTML(invoiceData);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => { setTimeout(() => printWindow.print(), 100); };
    }
  };

  const addItem = (card: Card, quantity: number) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(item => item.cardId === card.cardId)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex].quantity += quantity
        return updated
      }
      return [...prev, { ...card, quantity }]
    })
  }

  const updateQuantity = (cardId: string, quantity: number) => {
    setItems(prev => 
      prev.map(item => 
        item.cardId === cardId 
          ? { ...item, quantity: Math.max(0, quantity) }
          : item
      ).filter(item => item.quantity > 0)
    )
  }

  const updatePrice = (cardId: string, price: string) => {
    setItems(prev => 
      prev.map(item => 
        item.cardId === cardId 
          ? { ...item, 買取価格: price }
          : item
      )
    )
  }

  const removeItem = (cardId: string) => {
    setItems(prev => prev.filter(item => item.cardId !== cardId))
  }

  const clearInvoice = () => {
    setItems([])
    setEditingInvoiceId(null);
  }

  const getTotalQuantity = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = parseFloat(item.買取価格.replace(/[¥,]/g, '')) || 0;
      return total + (price * item.quantity)
    }, 0)
  }

  const saveOrUpdateInvoice = () => {
    if (items.length === 0) return;

    let updatedInvoices;

    if (editingInvoiceId) {
      updatedInvoices = savedInvoices.map(inv =>
        inv.id === editingInvoiceId
          ? {
              ...inv,
              items: [...items],
              totalValue: getTotalPrice(),
              savedAt: new Date().toISOString(),
            }
          : inv
      );
    } else {
      const maxInvoiceNumber = savedInvoices.reduce((max, inv) => Math.max(max, inv.invoiceNumber || 0), 0);
      const newInvoice: SavedInvoice = {
        id: `inv_${new Date().getTime()}`,
        invoiceNumber: maxInvoiceNumber + 1,
        savedAt: new Date().toISOString(),
        totalValue: getTotalPrice(),
        items: [...items]
      };
      updatedInvoices = [...savedInvoices, newInvoice];
    }
    
    setSavedInvoices(updatedInvoices);
    updateLocalStorage(updatedInvoices);
    setEditingInvoiceId(null); 
    alert(editingInvoiceId ? '納品書を更新しました。' : '納品書を保存しました。');
  };

  const loadInvoice = (invoiceId: string) => {
    const invoiceToLoad = savedInvoices.find(inv => inv.id === invoiceId);
    if (invoiceToLoad) {
      setItems([...invoiceToLoad.items]);
      setEditingInvoiceId(invoiceId);
    }
  };

  const duplicateInvoice = (invoiceId: string) => {
    const invoiceToDuplicate = savedInvoices.find(inv => inv.id === invoiceId);
    if (invoiceToDuplicate) {
      setItems([...invoiceToDuplicate.items]);
      setEditingInvoiceId(null); // Not in editing mode
    }
  };

  const deleteInvoice = (invoiceId: string) => {
    if (!window.confirm('この納品書を削除してもよろしいですか？')) return;
    const updatedInvoices = savedInvoices.filter(inv => inv.id !== invoiceId);
    setSavedInvoices(updatedInvoices);
    updateLocalStorage(updatedInvoices);
    if (editingInvoiceId === invoiceId) {
      clearInvoice();
    }
  };

  return (
    <InvoiceContext.Provider value={{
      items,
      setItems,
      addItem,
      updateQuantity,
      updatePrice,
      removeItem,
      clearInvoice,
      getTotalQuantity,
      getTotalPrice,
      savedInvoices,
      saveOrUpdateInvoice,
      loadInvoice,
      deleteInvoice,
      duplicateInvoice,
      printInvoice,
      editingInvoiceId
    }}>
      {children}
    </InvoiceContext.Provider>
  )
}

export function useInvoice() {
  const context = useContext(InvoiceContext)
  if (!context) {
    throw new Error('useInvoice must be used within an InvoiceProvider')
  }
  return context
}