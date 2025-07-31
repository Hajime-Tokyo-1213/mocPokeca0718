import { CardData, fetchCardDataFromSpreadsheet } from '@/lib/spreadsheet'
import { fallbackCardData } from '@/lib/fallbackData'
import { ImageData } from '@/lib/imageSpreadsheetAlt'
import { createDefaultImageFetcher } from '@/lib/imageDataFetcher'
import HomeClient from './home-client'

function mergeData(baseData: CardData, imageData: ImageData[]): CardData {
  const mergedData: CardData = {}
  // 型番を抽出する正規表現（imageSpreadsheet.tsと共通化を推奨）
  const modelNumberPattern = /([a-zA-Z0-9-]+\s+\d{1,3}\/\d{1,3})/

  for (const priceKey in baseData) {
    mergedData[priceKey] = baseData[priceKey].map(card => {
      let finalImageUrl = '/no-image.svg'

      // 商品タイトルから【状態B】などを削除
      const cleanedTitle = card.商品タイトル.replace(/【.*?】/g, '')
      // 価格データの商品タイトルから型番を抽出
      const cardTitleMatch = cleanedTitle.match(modelNumberPattern)
      const cardModelNumber = cardTitleMatch ? cardTitleMatch[0] : null

      if (cardModelNumber) {
        // 画像データの中から、キャラクター名と完全な型番が一致するものを探す
        const foundImage = imageData.find(img => {
          // 1. キャラクター名が画像データのキャラクター名に含まれるか（前方一致の代わり）
          const characterMatch =
            card.商品タイトル.split(' ')[0] === img.characterName
          // 2. 型番が完全に一致するか
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


export default async function Home() {
  let cardData: CardData
  
  try {
    const [baseCardData, allImageData] = await Promise.all([
      fetchCardDataFromSpreadsheet(),
      createDefaultImageFetcher().fetchWithFallback()
    ]);
    
    if (Object.keys(baseCardData).length === 0) {
      cardData = fallbackCardData
    } else {
      cardData = mergeData(baseCardData, allImageData)
    }
  } catch (error) {
    console.error('Error in Home page:', error)
    cardData = fallbackCardData
  }
  
  return <HomeClient cardData={cardData} />
}