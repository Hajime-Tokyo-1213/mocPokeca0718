'use client'

import Image from 'next/image'
import { Card } from '@/types/card'
import { useState, useEffect } from 'react'

interface CardDetailViewProps {
  card: Card | null
}

export default function CardDetailView({ card }: CardDetailViewProps) {
  const [imageError, setImageError] = useState(false)
  
  // カードが変更されたらエラー状態をリセット
  useEffect(() => {
    setImageError(false)
  }, [card?.cardId])
  
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

  // 画像URLの妥当性をチェック
  const getValidImageUrl = (url: string | undefined) => {
    if (!url) return '/no-image.svg'
    
    // 既にエラーが発生している場合はフォールバック画像を使用
    if (imageError) return '/no-image.svg'
    
    return url
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <div className="relative w-full max-w-md aspect-[2.5/3.5] mb-4">
        <Image
          src={getValidImageUrl(card.imageUrl)}
          alt={card.商品タイトル}
          fill
          className="object-contain rounded-lg shadow-xl"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={100}
          priority
          onError={() => setImageError(true)}
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