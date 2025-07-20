import { Card } from '@/types/card'
import Papa from 'papaparse'
import { fetchAllImageData, ImageData } from './imageSpreadsheet'

export type CardData = {
  [key: string]: Card[]
}

const SPREADSHEET_ID = '1XhLcAypoY18yQiUWpd0T-9fNpAd3dCf2NEPVRy3iW1E'
const SHEET_NAME = 'ALLData'
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`

export async function fetchCardDataFromSpreadsheet(): Promise<CardData> {
  try {
    console.log('Fetching data from spreadsheet:', CSV_URL)
    
    // カードデータと画像データを並行して取得
    const [cardResponse, imageDataList] = await Promise.all([
      fetch(CSV_URL, {
        next: { revalidate: 300 }, // 5分ごとにキャッシュを更新
        cache: 'no-store' // 開発時はキャッシュを無効化
      }),
      fetchAllImageData()
    ])
    
    if (!cardResponse.ok) {
      console.error(`Failed to fetch data: Status ${cardResponse.status}`)
      throw new Error(`Failed to fetch data: ${cardResponse.status}`)
    }
    
    const csvText = await cardResponse.text()
    console.log('CSV data received, length:', csvText.length)
    console.log('Image data received, count:', imageDataList.length)
    
    const cardData = parseCSVToCardData(csvText, imageDataList)
    console.log('Parsed card data keys:', Object.keys(cardData))
    
    return cardData
  } catch (error) {
    console.error('Error fetching spreadsheet data:', error)
    // エラー時は空のデータを返す（完全なエラーにしない）
    return {}
  }
}

// 画像URLを照合する関数
function matchImageUrl(card: Card, imageDataList: ImageData[]): string {
  // 一次絞り込み: 型番での照合
  const matchingByModelNumber = imageDataList.filter(img => 
    img.modelNumber && card.商品型番.includes(img.modelNumber)
  )
  
  if (matchingByModelNumber.length === 0) {
    return '' // 画像が見つからない
  }
  
  if (matchingByModelNumber.length === 1) {
    return matchingByModelNumber[0].imageUrl
  }
  
  // 二次絞り込み: キャラクター名での照合
  const matchingByCharacter = matchingByModelNumber.filter(img =>
    img.characterName && card.商品タイトル.includes(img.characterName)
  )
  
  if (matchingByCharacter.length > 0) {
    return matchingByCharacter[0].imageUrl
  }
  
  // キャラクター名でマッチしない場合は、最初の画像を使用
  return matchingByModelNumber[0].imageUrl
}

function parseCSVToCardData(csvText: string, imageDataList: ImageData[]): CardData {
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
        imageUrl: '' // 一旦空で作成
      }
      
      // 画像URLを照合
      card.imageUrl = matchImageUrl(card, imageDataList)
      
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