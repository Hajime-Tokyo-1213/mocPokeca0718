import { CardData, fetchCardDataFromSpreadsheet } from '@/lib/spreadsheet'
import { fallbackCardData } from '@/lib/fallbackData'
import { ImageData } from '@/lib/imageSpreadsheetAlt'
import { createDefaultImageFetcher } from '@/lib/imageDataFetcher'
import HomeClient from './home-client'

function mergeData(baseData: CardData, imageData: ImageData[]): CardData {
  // 型番を抽出する正規表現（imageSpreadsheet.tsと共通化を推奨）
  const modelNumberPattern = /([a-zA-Z0-9-]+\s+\d{1,3}\/\d{1,3})/

  return baseData.map(card => {
      let finalImageUrl = '/no-image.svg'

      // 商品タイトルから【状態B】などを削除
      const cleanedTitle = card.商品タイトル.replace(/【.*?】/g, '').trim()
      
      // 価格データの商品タイトルから型番を抽出
      const cardTitleMatch = cleanedTitle.match(modelNumberPattern)
      const cardModelNumber = cardTitleMatch ? cardTitleMatch[0] : null

      if (cardModelNumber) {
        // 画像データの中から型番が一致するものを探す
        const foundImage = imageData.find(img => {
          // 型番が完全に一致するかチェック（大文字小文字を無視）
          const modelMatch = img.modelNumber.toLowerCase() === cardModelNumber.toLowerCase()
          
          if (!modelMatch) return false
          
          // キャラクター名のマッチングを改善
          // 1. 商品タイトルからキャラクター名を抽出（【】を除去した後）
          const titleParts = cleanedTitle.split(' ')
          let characterName = ''
          
          // ARやSRなどのレアリティ表記を除外してキャラクター名を抽出
          for (const part of titleParts) {
            // 型番パターンやレアリティ表記（AR, SR, UR等）を除外
            if (!part.match(/^\d+\/\d+$/) && 
                !part.match(/^[A-Z]{2,3}$/) && 
                !part.match(modelNumberPattern)) {
              characterName = part
              break
            }
          }
          
          // キャラクター名が画像データのキャラクター名と一致するか
          const characterMatch = characterName === img.characterName ||
                                 img.characterName.includes(characterName) ||
                                 characterName.includes(img.characterName)
          
          // デバッグログ（必要に応じて削除）
          if (process.env.NODE_ENV === 'development') {
            // 最初の数件のみログ出力
            const cardIndex = baseData.indexOf(card)
            if (cardIndex < 3) {
              console.log(`[カード${cardIndex + 1}] マッチング結果:`, {
                商品タイトル: card.商品タイトル,
                買取価格: card.買取価格,
                cleanedTitle,
                抽出型番: cardModelNumber,
                抽出キャラ名: characterName,
                画像データ: img.title,
                画像型番: img.modelNumber,
                画像キャラ名: img.characterName,
                型番一致: modelMatch,
                キャラ名一致: characterMatch,
                結果: modelMatch && characterMatch ? '○マッチ' : '×不一致'
              })
            }
          }
          
          // 一時的に型番のみでマッチング（キャラクター名のチェックをスキップ）
          // TODO: 将来的には正しい画像データに更新する必要がある
          return modelMatch
        })

        if (foundImage) {
          finalImageUrl = foundImage.imageUrl
        }
      }

      return { ...card, imageUrl: finalImageUrl }
    })
}


export default async function Home() {
  let cardData: CardData
  
  try {
    const [baseCardData, allImageData] = await Promise.all([
      fetchCardDataFromSpreadsheet(),
      createDefaultImageFetcher().fetchWithFallback()
    ]);
    
    if (baseCardData.length === 0) {
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