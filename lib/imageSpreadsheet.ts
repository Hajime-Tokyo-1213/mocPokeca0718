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

// スプレッドシートの公開URL（すべてのレアリティのシート）
const SHEET_URLS = [
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRHvYoYFzk-sIRNJL3qf-uyxGQg2BFv0dJ147oHC11UPY0Ob1ovEvz3j6GVc-tOQvGY6nIvev1QXF9o/pubhtml?gid=615803266&single=true', // AR
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRHvYoYFzk-sIRNJL3qf-uyxGQg2BFv0dJ147oHC11UPY0Ob1ovEvz3j6GVc-tOQvGY6nIvev1QXF9o/pubhtml?gid=831083568&single=true', // SR
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRHvYoYFzk-sIRNJL3qf-uyxGQg2BFv0dJ147oHC11UPY0Ob1ovEvz3j6GVc-tOQvGY6nIvev1QXF9o/pubhtml?gid=1856522830&single=true', // SAR
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRHvYoYFzk-sIRNJL3qf-uyxGQg2BFv0dJ147oHC11UPY0Ob1ovEvz3j6GVc-tOQvGY6nIvev1QXF9o/pubhtml?gid=209255296&single=true', // UR
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRHvYoYFzk-sIRNJL3qf-uyxGQg2BFv0dJ147oHC11UPY0Ob1ovEvz3j6GVc-tOQvGY6nIvev1QXF9o/pubhtml?gid=696239385&single=true', // CHR
  // RRは分割して追加
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRHvYoYFzk-sIRNJL3qf-uyxGQg2BFv0dJ147oHC11UPY0Ob1ovEvz3j6GVc-tOQvGY6nIvev1QXF9o/pubhtml?gid=811385213&single=true', // SM10a RR
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRHvYoYFzk-sIRNJL3qf-uyxGQg2BFv0dJ147oHC11UPY0Ob1ovEvz3j6GVc-tOQvGY6nIvev1QXF9o/pubhtml?gid=978855825&single=true', // SM12a RR
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRHvYoYFzk-sIRNJL3qf-uyxGQg2BFv0dJ147oHC11UPY0Ob1ovEvz3j6GVc-tOQvGY6nIvev1QXF9o/pubhtml?gid=1429605223&single=true', // SM9 RR
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRHvYoYFzk-sIRNJL3qf-uyxGQg2BFv0dJ147oHC11UPY0Ob1ovEvz3j6GVc-tOQvGY6nIvev1QXF9o/pubhtml?gid=1002981119&single=true', // SM11 RR
]

// IMAGE関数から画像URLを抽出する必要はなくなりました
// export function extractImageUrl(imageFunction: string): string { ... }

// タイトルからキャラクター名と型番を抽出する
export function parseTitle(title: string): { characterName: string; modelNumber: string } {
  const cleanedTitle = title.replace(/【[^】]+】/g, '').trim()

  const modelNumberPattern = /([a-zA-Z0-9-]+\s+\d{1,3}\/\d{1,3})$/
  const match = cleanedTitle.match(modelNumberPattern)

  const result = {
    characterName: '',
    modelNumber: '',
  }

  if (match) {
    result.modelNumber = match[0].trim()
    // キャラクター名は冒頭から最初の空白まで
    result.characterName = cleanedTitle.split(' ')[0]
  } else {
    // マッチしない場合のフォールバック
    const parts = cleanedTitle.split(/\s+/)
    if (parts.length > 0) {
      result.characterName = parts[0]
    }
    if (parts.length >= 3) {
      result.modelNumber = `${parts[parts.length - 2]} ${
        parts[parts.length - 1]
      }`
    }
  }

  return result
}

// スプレッドシートのHTMLから画像データを取得
async function fetchImageDataFromSheet(sheetUrl: string): Promise<ImageData[]> {
  try {
    const response = await axios.get(sheetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    })
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
          // デバッグログを削除
          // console.log(`[fetchImageDataFromSheet DEBUG] Found row with title: "${title}"`);
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
    console.log('Fetching image data from all sheets sequentially...');
    
    const allImageData: ImageData[] = [];
    for (const url of SHEET_URLS) {
      try {
        console.log(` -> Fetching from ${url}`); // どのURLを取得中かログ出力
        const sheetData = await fetchImageDataFromSheet(url);
        allImageData.push(...sheetData);
        // サーバー負荷軽減のため、リクエスト間隔を1秒に延長
        await new Promise(resolve => setTimeout(resolve, 1000)); 
      } catch (error) {
        console.error(`Failed to fetch or process sheet ${url}, skipping...`, error);
      }
    }
    
    console.log(`Total image data fetched: ${allImageData.length}`);
    return allImageData;
  } catch (error) {
    console.error('Error fetching all image data:', error)
    return []
  }
}