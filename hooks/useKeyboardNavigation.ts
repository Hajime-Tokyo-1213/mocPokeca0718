'use client'

import { useEffect } from 'react'

interface UseKeyboardNavigationProps {
  cardsLength: number
  selectedIndex: number
  setSelectedIndex: (index: number) => void
  onQuantityChange: (delta: number) => void
  searchValue: string
  onSearchValueChange: (value: string) => void
}

export function useKeyboardNavigation({
  cardsLength,
  selectedIndex,
  setSelectedIndex,
  onQuantityChange,
  searchValue,
  onSearchValueChange,
}: UseKeyboardNavigationProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) {
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          const numValue = parseInt(searchValue) || 0
          if (numValue < 999) {
            onSearchValueChange(String(numValue + 1).padStart(3, '0'))
          }
          return
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          const numValue = parseInt(searchValue) || 0
          if (numValue > 0) {
            onSearchValueChange(String(numValue - 1).padStart(3, '0'))
          }
          return
        }
      }

      if (e.key === 'F1') {
        e.preventDefault()
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
        return
      }

      if (e.key === 'ArrowDown' && !e.shiftKey) {
        e.preventDefault()
        if (selectedIndex < cardsLength - 1) {
          setSelectedIndex(selectedIndex + 1)
        }
      } else if (e.key === 'ArrowUp' && !e.shiftKey) {
        e.preventDefault()
        if (selectedIndex > 0) {
          setSelectedIndex(selectedIndex - 1)
        }
      } else if (e.key === 'ArrowUp' && e.shiftKey) {
        e.preventDefault()
        onQuantityChange(1)
      } else if (e.key === 'ArrowDown' && e.shiftKey) {
        e.preventDefault()
        onQuantityChange(-1)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        onQuantityChange(0)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cardsLength, selectedIndex, setSelectedIndex, onQuantityChange, searchValue, onSearchValueChange])
}