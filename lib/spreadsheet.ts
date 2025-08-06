import { Card } from '@/types/card'
import Papa from 'papaparse'

export type CardData = Card[]

const SPREADSHEET_ID = '1XhLcAypoY18yQiUWpd0T-9fNpAd3dCf2NEPVRy3iW1E'
const SHEET_NAME = 'ALLData'
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`

export async function fetchCardDataFromSpreadsheet(): Promise<CardData> {
  try {
    console.log('Fetching card base data from spreadsheet:', CSV_URL)
    
    const cardResponse = await fetch(CSV_URL, {
        cache: 'no-store' // キャッシュを無効化して常に最新データを取得
      })
    
    if (!cardResponse.ok) {
      console.error(`Failed to fetch data: Status ${cardResponse.status}`)
      throw new Error(`Failed to fetch data: ${cardResponse.status}`)
    }
    
    const csvText = await cardResponse.text()
    console.log('CSV data received, length:', csvText.length)
    
    const cardData = parseCSVToCardData(csvText)
    console.log('Parsed card data keys:', Object.keys(cardData))
    
    return cardData
  } catch (error) {
    console.error('Error fetching spreadsheet data:', error)
    return []
  }
}

function parseCSVToCardData(csvText: string): CardData {
  const cardData: CardData = []

  const parsed = Papa.parse(csvText, {
    header: false,
  })

  if (parsed.data.length < 2) {
    return []
  }

  for (let i = 1; i < parsed.data.length; i++) {
    const row = parsed.data[i] as string[]
    
    if (row.length >= 4) {
      const card: Card = {
        cardId: `${row[1]}-${row[0]}`.replace(/\//g, '-'),
        商品タイトル: row[0],
        商品型番: row[1],
        レアリティ: row[2],
        買取価格: row[3],
        imageUrl: '/no-image.svg' // デフォルト画像を設定
      }
      
      cardData.push(card)
    }
  }

  return cardData
}