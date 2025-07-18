'use client'

interface QuantitySelectorProps {
  quantity: number
  onQuantityChange: (quantity: number) => void
}

export default function QuantitySelector({ quantity, onQuantityChange }: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (quantity > 0) {
      onQuantityChange(quantity - 1)
    }
  }

  const handleIncrease = () => {
    onQuantityChange(quantity + 1)
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleDecrease}
        className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors text-sm"
        aria-label="数量を減らす"
      >
        <span className="font-bold">−</span>
      </button>
      <span className="w-8 text-center font-semibold text-sm">{quantity}</span>
      <button
        onClick={handleIncrease}
        className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors text-sm"
        aria-label="数量を増やす"
      >
        <span className="font-bold">+</span>
      </button>
    </div>
  )
}