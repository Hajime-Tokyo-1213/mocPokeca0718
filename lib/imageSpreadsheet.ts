import { load } from 'cheerio'
import axios from 'axios'

export interface ImageData {
  title: string
  imageUrl: string
  characterName: string
  modelNumber: string
}

/**
 * Google User Contentの画像URLからサイズ指定パラメータを書き換え、
 * 高解像度の画像URLを取得する。
 * @param url 元の画像URL (例: ...=s100-w100-h20)
 * @returns 高解像度の画像URL (例: ...=s500)
 */
function getHighResImageUrl(url: string | undefined): string {
  if (!url) return '';
  // URLの末尾にある "=s..." や "=w..." "=h..." のサイズ指定を "=s500" に置き換える
  return url.replace(/=[swh]\d+(-[swh]\d+)*$/, '=s500');
}

// スプレッドシートの公開URL
const SHEET_URLS = [
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRHvYoYFzk-sIRNJL3qf-uyxGQg2BFv0dJ147oHC11UPY0Ob1ovEvz3j6GVc-tOQvGY6nIvev1QXF9o/pubhtml?gid=615803266&single=true'
]

// IMAGE関数から画像URLを抽出する必要はなくなりました
// export function extractImageUrl(imageFunction: string): string { ... }

// タイトルからキャラクター名と型番を抽出する
export function parseTitle(title: string): { characterName: string; modelNumber: string } {
  const cleanedTitle = title.replace(/【[^】]+】/g, '').trim()

  // レアリティを正規表現のアンカーとして使用し、名前と型番を分離する
  const rarityCodes = ['SR', 'AR', 'SAR', 'SSR', 'UR', 'HR', 'CHR', 'CSR', 'PR', 'RRR', 'RR', 'R', 'U', 'C', 'TR', 'N']
  const pattern = new RegExp(`^(.+?)\\s+(${rarityCodes.join('|')})\\s+(.*)$`)
  
  const match = cleanedTitle.match(pattern)

  if (match) {
    // 例: "ロケット団のヘルガー AR SV10 100/098"
    // match[1] -> "ロケット団のヘルガー" (キャラクター名)
    // match[2] -> "AR" (レアリティ)
    // match[3] -> "SV10 100/098" (型番)
    return {
      characterName: match[1].trim(),
      modelNumber: match[3].trim(),
    }
  }
  
  // マッチしない場合のフォールバック
  const parts = cleanedTitle.split(/\s+/)
  return {
    characterName: parts[0] || '',
    modelNumber: parts.slice(2).join(' ') || '',
  }
}

// スプレッドシートのHTMLから画像データを取得
async function fetchImageDataFromSheet(sheetUrl: string): Promise<ImageData[]> {
  try {
    const response = await axios.get(sheetUrl)
    const html = response.data
    const $ = load(html)
    const imageDataList: ImageData[] = []

    // HTMLのテーブルの各行をループ
    $('tbody tr').each((_i, row) => {
      const tds = $(row).find('td')
      // タイトル(C列=インデックス2)と画像(E列=インデックス4)がある行のみ処理
      if (tds.length > 4) {
        const title = $(tds[2]).text().trim()
        const imageUrl = $(tds[4]).find('img').attr('src')
        const highResUrl = getHighResImageUrl(imageUrl)
        
        if (title && highResUrl) {
          const { characterName, modelNumber } = parseTitle(title)
          imageDataList.push({
            title,
            imageUrl: highResUrl,
            characterName,
            modelNumber
          })
        }
      }
    })
    
    return imageDataList
  } catch (error) {
    console.error(`Error fetching data from sheet ${sheetUrl}:`, error)
    return []
  }
}

// 全シートから画像データを取得してマージ
export async function fetchAllImageData(): Promise<ImageData[]> {
  try {
    console.log('Fetching image data from all sheets using public URLs...')
    
    // 全シートから並行してデータを取得
    const promises = SHEET_URLS.map(url => fetchImageDataFromSheet(url))
    
    const allSheetData = await Promise.all(promises)
    const mergedData = allSheetData.flat()
    
    console.log(`Total image data fetched: ${mergedData.length}`)
    return mergedData
  } catch (error) {
    console.error('Error fetching all image data:', error)
    return []
  }
}