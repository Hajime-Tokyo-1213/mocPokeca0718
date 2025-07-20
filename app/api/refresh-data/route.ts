import { NextResponse } from 'next/server'
import { CardData, fetchCardDataFromSpreadsheet } from '@/lib/spreadsheet'
import { ImageData, fetchAllImageData } from '@/lib/imageSpreadsheet'
import { fallbackCardData } from '@/lib/fallbackData'

function mergeData(baseData: CardData, imageData: ImageData[]): CardData {
  const mergedData: CardData = {}
  const modelNumberPattern = /([a-zA-Z0-9-]+\s+\d{1,3}\/\d{1,3})/

  for (const priceKey in baseData) {
    mergedData[priceKey] = baseData[priceKey].map(card => {
      let finalImageUrl = '/no-image.svg'

      const cardTitleMatch = card.商品タイトル.match(modelNumberPattern)
      const cardModelNumber = cardTitleMatch ? cardTitleMatch[0] : null

      if (cardModelNumber) {
        const foundImage = imageData.find(img => {
          const characterMatch = card.商品タイトル.split(' ')[0] === img.characterName
          const modelMatch = img.modelNumber === cardModelNumber
          return characterMatch && modelMatch
        })

        if (foundImage) {
          finalImageUrl = foundImage.imageUrl
        }
      }

      return { ...card, imageUrl: finalImageUrl }
    })
  }
  return mergedData
}

export async function GET() {
  try {
    // スプレッドシートデータとイメージデータを並行して取得
    const [baseCardData, allImageData] = await Promise.all([
      fetchCardDataFromSpreadsheet().catch((error) => {
        console.error('Failed to fetch card data:', error)
        return fallbackCardData
      }),
      fetchAllImageData().catch((error) => {
        console.error('Failed to fetch image data:', error)
        return []
      })
    ])

    // データをマージ
    const mergedData = mergeData(baseCardData, allImageData)

    return NextResponse.json({
      success: true,
      data: mergedData,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to refresh data:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to refresh data',
      data: fallbackCardData
    }, { status: 500 })
  }
}