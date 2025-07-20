import { Card } from '@/types/card'
import Papa from 'papaparse'

export type CardData = {
  [key: string]: Card[]
}

const SPREADSHEET_ID = '1XhLcAypoY18yQiUWpd0T-9fNpAd3dCf2NEPVRy3iW1E'
const SHEET_NAME = 'ALLData'
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`

export async function fetchCardDataFromSpreadsheet(): Promise<CardData> {
  try {
    console.log('Fetching data from spreadsheet:', CSV_URL)
    
    const response = await fetch(CSV_URL, {
      next: { revalidate: 300 }, // 5分ごとにキャッシュを更新
      cache: 'no-store' // 開発時はキャッシュを無効化
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch data: Status ${response.status}`)
      throw new Error(`Failed to fetch data: ${response.status}`)
    }
    
    const csvText = await response.text()
    console.log('CSV data received, length:', csvText.length)
    
    const cardData = parseCSVToCardData(csvText)
    console.log('Parsed card data keys:', Object.keys(cardData))
    
    return cardData
  } catch (error) {
    console.error('Error fetching spreadsheet data:', error)
    // エラー時は空のデータを返す（完全なエラーにしない）
    return {}
  }
}

function parseCSVToCardData(csvText: string): CardData {
  const cardData: CardData = {}

  // Papa.parseを使用してCSVをパース
  const parsed = Papa.parse(csvText, {
    header: false, // 1行目はヘッダーではない
  })

  // 3行目からデータを処理 (インデックスは2から)
  if (parsed.data.length < 3) {
    return {}
  }

  for (let i = 2; i < parsed.data.length; i++) {
    const row = parsed.data[i] as string[]
    
    if (row.length >= 4) {
      const card: Card = {
        cardId: `${row[1]}-${row[0]}`.replace(/\//g, '-'), // 型番と商品タイトルからIDを生成
        商品タイトル: row[0],
        商品型番: row[1],
        レアリティ: row[2],
        買取価格: row[3],
        imageUrl: '' // 画像URLは改修範囲外のため空文字
      }
      
      // 買取価格をキーとしてグループ化
      const priceKey = row[3]
      if (!cardData[priceKey]) {
        cardData[priceKey] = []
      }
      cardData[priceKey].push(card)
    }
  }

  return cardData
}