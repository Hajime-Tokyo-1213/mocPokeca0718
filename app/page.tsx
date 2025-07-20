import { CardData, fetchCardDataFromSpreadsheet } from '@/lib/spreadsheet'
import { fallbackCardData } from '@/lib/fallbackData'
import HomeClient from './home-client'

export default async function Home() {
  let cardData: CardData
  
  try {
    cardData = await fetchCardDataFromSpreadsheet()
    
    // データが空の場合はフォールバックを使用
    if (Object.keys(cardData).length === 0) {
      console.warn('No data from spreadsheet, using fallback data')
      cardData = fallbackCardData
    }
  } catch (error) {
    console.error('Error in Home page:', error)
    // エラー時はフォールバックデータを使用
    cardData = fallbackCardData
  }
  
  return <HomeClient cardData={cardData} />
}