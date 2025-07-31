import axios from 'axios';
import { transformImageUrl, DEFAULT_IMAGE_SIZE, ImageSizeConfig } from './imageUrlTransformer';

export interface ImageData {
  title: string
  imageUrl: string
  characterName: string
  modelNumber: string
}

// 画像URLを含むシートのGoogleスプレッドシートID
const IMAGE_SPREADSHEET_ID = '2PACX-1vRHvYoYFzk-sIRNJL3qf-uyxGQg2BFv0dJ147oHC11UPY0Ob1ovEvz3j6GVc-tOQvGY6nIvev1QXF9o';
const SHEET_GIDS = [
  '615803266', // AR
  '831083568', // SR
  '1856522830', // SAR
  '209255296', // UR
  '696239385', // CHR
  '811385213', // SM10a RR
  '978855825', // SM12a RR
  '1429605223', // SM9 RR
  '1002981119', // SM11 RR
];

// タイトルからキャラクター名と型番を抽出する
export function parseTitle(title: string): { characterName: string; modelNumber: string } {
  // 【状態A】【状態B】などのタグを除去
  const cleanedTitle = title.replace(/【[^】]+】/g, '').trim()

  // 型番パターン: 例 "SM10a 001/052", "sv11b 100/086"
  const modelNumberPattern = /([a-zA-Z0-9-]+\s+\d{1,3}\/\d{1,3})$/
  const match = cleanedTitle.match(modelNumberPattern)

  const result = {
    characterName: '',
    modelNumber: '',
  }

  if (match) {
    result.modelNumber = match[0].trim()
    // 型番を除いた部分からキャラクター名を抽出
    const namePartWithoutModel = cleanedTitle.substring(0, cleanedTitle.lastIndexOf(match[0])).trim()
    // キャラクター名は最初の単語（空白またはひらがな・カタカナの後まで）
    const nameMatch = namePartWithoutModel.match(/^([^\s]+(?:[ぁ-んァ-ヶー]*)?)/);
    result.characterName = nameMatch ? nameMatch[1] : namePartWithoutModel.split(' ')[0]
  } else {
    // マッチしない場合のフォールバック
    const parts = cleanedTitle.split(/\s+/)
    if (parts.length > 0) {
      result.characterName = parts[0]
    }
    if (parts.length >= 3) {
      result.modelNumber = `${parts[parts.length - 2]} ${parts[parts.length - 1]}`
    }
  }

  console.log(`Parsed title: "${title}" -> character: "${result.characterName}", model: "${result.modelNumber}"`);
  return result
}

// HTMLからテーブルデータを抽出する新しいアプローチ
async function fetchImageDataFromHTML(gid: string, imageSizeConfig?: ImageSizeConfig): Promise<ImageData[]> {
  const url = `https://docs.google.com/spreadsheets/d/e/${IMAGE_SPREADSHEET_ID}/pubhtml?gid=${gid}&single=true`;
  
  try {
    console.log(`Fetching from: ${url}`);
    const response = await axios.get(url);
    const html = response.data;

    // テーブルの行を抽出
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
    const imageDataList: ImageData[] = [];
    let rowMatch;
    let rowIndex = 0;
    
    while ((rowMatch = rowRegex.exec(html)) !== null) {
      rowIndex++;
      // 最初の行はヘッダーなのでスキップ
      if (rowIndex === 1) continue;
      
      const row = rowMatch[1];
      
      // 各セルの内容を抽出
      const cells: string[] = [];
      const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
      let cellMatch;
      
      while ((cellMatch = cellRegex.exec(row)) !== null) {
        cells.push(cellMatch[1]);
      }
      
      if (cells.length >= 5) {
        // タイトルは3番目のセル（0-indexed: 2）
        const titleMatch = cells[2].match(/>?([^<]+)<?/);
        const title = titleMatch ? titleMatch[1].trim() : '';
        
        // 画像URLは5番目のセル（0-indexed: 4）から抽出
        const imgMatch = cells[4].match(/src="([^"]+)"/);
        let imageUrl = imgMatch ? imgMatch[1] : '';
        
        // タイトルと画像URLがある場合のみ処理
        if (title && imageUrl && !title.includes('タイトル') && !title.includes('検索ワード')) {
          // 画像URLを高解像度版に変換
          imageUrl = transformImageUrl(imageUrl, imageSizeConfig);
          
          const { characterName, modelNumber } = parseTitle(title);
          imageDataList.push({
            title,
            imageUrl,
            characterName,
            modelNumber,
          });
        }
      }
    }

    console.log(`Extracted ${imageDataList.length} images from sheet gid=${gid}`);
    return imageDataList;
  } catch (error) {
    console.error(`Error fetching or parsing HTML from sheet gid=${gid}:`, error);
    return [];
  }
}

// 全シートから画像データを取得してマージ
export async function fetchAllImageData(imageSizeConfig?: ImageSizeConfig): Promise<ImageData[]> {
  try {
    console.log('Fetching image data from all sheets using HTML parsing...');
    console.log('Image size config:', imageSizeConfig || DEFAULT_IMAGE_SIZE);
    
    const allImageData: ImageData[] = [];
    for (const gid of SHEET_GIDS) {
      try {
        console.log(` -> Fetching from sheet gid=${gid}`);
        const sheetData = await fetchImageDataFromHTML(gid, imageSizeConfig);
        allImageData.push(...sheetData);
        // サーバー負荷軽減のため、リクエスト間隔を設ける
        await new Promise(resolve => setTimeout(resolve, 1000)); 
      } catch (error) {
        console.error(`Failed to fetch or process sheet gid=${gid}, skipping...`, error);
      }
    }
    
    console.log(`Total image data fetched: ${allImageData.length}`);
    return allImageData;
  } catch (error) {
    console.error('Error fetching all image data:', error)
    return []
  }
}