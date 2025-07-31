import { NextResponse } from 'next/server'
import { CardData, fetchCardDataFromSpreadsheet } from '@/lib/spreadsheet'
import { ImageData } from '@/lib/imageSpreadsheetAlt'
import { createDefaultImageFetcher } from '@/lib/imageDataFetcher'
import { fallbackCardData } from '@/lib/fallbackData'

function mergeData(baseData: CardData, imageData: ImageData[]): CardData {
  const mergedData: CardData = {}
  const modelNumberPattern = /([a-zA-Z0-9-]+\s+\d{1,3}\/\d{1,3})/
  
  console.log(`Merging ${Object.values(baseData).flat().length} cards with ${imageData.length} images`)

  for (const priceKey in baseData) {
    mergedData[priceKey] = baseData[priceKey].map(card => {
      let finalImageUrl = '/no-image.svg'

      // タイトルからタグを除去
      const cleanedTitle = card.商品タイトル.replace(/【[^】]+】/g, '').trim()
      const cardTitleMatch = cleanedTitle.match(modelNumberPattern)
      const cardModelNumber = cardTitleMatch ? cardTitleMatch[0] : null

      if (cardModelNumber) {
        // キャラクター名を抽出
        const namePartWithoutModel = cleanedTitle.substring(0, cleanedTitle.lastIndexOf(cardModelNumber)).trim()
        const nameMatch = namePartWithoutModel.match(/^([^\s]+(?:[ぁ-んァ-ヶー]*)?)/)
        const cardCharacterName = nameMatch ? nameMatch[1] : namePartWithoutModel.split(' ')[0]
        
        // まず厳密なマッチングを試みる
        let foundImage = imageData.find(img => {
          return img.characterName === cardCharacterName && img.modelNumber === cardModelNumber
        })
        
        // 見つからない場合、型番のみでマッチング
        if (!foundImage) {
          foundImage = imageData.find(img => img.modelNumber === cardModelNumber)
        }
        
        // それでも見つからない場合、キャラクター名の部分一致
        if (!foundImage && cardCharacterName) {
          foundImage = imageData.find(img => {
            return img.characterName.includes(cardCharacterName) || cardCharacterName.includes(img.characterName)
          })
        }

        if (foundImage) {
          finalImageUrl = foundImage.imageUrl
          console.log(`Matched: "${card.商品タイトル}" -> "${foundImage.title}"`)
        } else {
          console.log(`No match found for: "${card.商品タイトル}" (char: "${cardCharacterName}", model: "${cardModelNumber}")`)
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
      createDefaultImageFetcher().fetchWithFallback().catch((error) => {
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