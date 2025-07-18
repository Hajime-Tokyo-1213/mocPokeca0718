'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Card } from '@/types/card'

export interface InvoiceItem extends Card {
  quantity: number
}

interface InvoiceContextType {
  items: InvoiceItem[]
  addItem: (card: Card, quantity: number) => void
  updateQuantity: (cardId: string, quantity: number) => void
  removeItem: (cardId: string) => void
  clearInvoice: () => void
  getTotalQuantity: () => number
  getTotalPrice: () => number
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined)

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InvoiceItem[]>([])

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

  const removeItem = (cardId: string) => {
    setItems(prev => prev.filter(item => item.cardId !== cardId))
  }

  const clearInvoice = () => {
    setItems([])
  }

  const getTotalQuantity = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = parseFloat(item.買取価格.replace(/[¥,]/g, ''))
      return total + (price * item.quantity)
    }, 0)
  }

  return (
    <InvoiceContext.Provider value={{
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearInvoice,
      getTotalQuantity,
      getTotalPrice
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