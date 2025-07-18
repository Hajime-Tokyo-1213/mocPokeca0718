'use client'

import Image from 'next/image'
import { Card } from '@/types/card'

interface CardDetailViewProps {
  card: Card | null
}

export default function CardDetailView({ card }: CardDetailViewProps) {
  if (!card) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-lg">カードを選択してください</p>
          <p className="text-sm mt-2">↑↓キーで選択できます</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <div className="relative w-full max-w-md aspect-[2.5/3.5] mb-4">
        <Image
          src={card.imageUrl}
          alt={card.商品タイトル}
          fill
          className="object-contain rounded-lg shadow-xl"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
      </div>
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">{card.商品タイトル}</h3>
        <p className="text-gray-600">型番: {card.商品型番}</p>
        <p className="text-lg font-semibold text-green-600 mt-2">{card.買取価格}</p>
      </div>
    </div>
  )
}