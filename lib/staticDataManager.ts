import { ImageData } from './imageSpreadsheetAlt';
import { staticImageData } from './staticImageData';
import { Card } from './spreadsheet';
// サーバーサイドでのみfs/pathを使用
const isServer = typeof window === 'undefined';
let fs: any;
let path: any;

if (isServer) {
  fs = require('fs/promises');
  path = require('path');
}

// 静的データストアの型定義
export interface StaticDataStore {
  cards: {
    [modelNumber: string]: ImageData;
  };
  lastUpdated: string;
  version: number;
}

// 更新レポートの型定義
export interface UpdateReport {
  totalCards: number;
  existingCards: number;
  newCards: number;
  imagesAdded: number;
  imagesFailed: number;
  missingImages: string[];
  errors: string[];
  timestamp: string;
}

// 静的データファイルのパス
const STATIC_DATA_PATH = isServer ? path.join(process.cwd(), 'lib', 'staticImageData.json') : '';

/**
 * 静的データを読み込む
 */
export async function loadStaticData(): Promise<StaticDataStore> {
  try {
    // まずTypeScriptファイルから初期データを取得
    const initialData: StaticDataStore = {
      cards: {},
      lastUpdated: new Date().toISOString(),
      version: 1
    };

    // staticImageDataの配列をオブジェクトに変換
    for (const imageData of staticImageData) {
      if (imageData.modelNumber) {
        initialData.cards[imageData.modelNumber.toLowerCase()] = imageData;
      }
    }

    // サーバーサイドでのみJSONファイルを読み込む
    if (isServer && fs) {
      try {
        const jsonData = await fs.readFile(STATIC_DATA_PATH, 'utf-8');
        const savedData = JSON.parse(jsonData) as StaticDataStore;
        
        // 既存のデータとマージ
        return {
          ...savedData,
          cards: {
            ...initialData.cards,
            ...savedData.cards
          }
        };
      } catch (error) {
        // JSONファイルが存在しない場合は初期データを返す
        return initialData;
      }
    }
    
    return initialData;
  } catch (error) {
    console.error('Error loading static data:', error);
    throw error;
  }
}

/**
 * 静的データを保存する
 */
export async function saveStaticData(data: StaticDataStore): Promise<void> {
  if (!isServer || !fs) {
    console.warn('Cannot save static data on client side');
    return;
  }
  
  try {
    const jsonData = JSON.stringify(data, null, 2);
    await fs.writeFile(STATIC_DATA_PATH, jsonData, 'utf-8');
    console.log('Static data saved successfully');
  } catch (error) {
    console.error('Error saving static data:', error);
    throw error;
  }
}

/**
 * タイトルから型番を抽出
 */
export function extractModelNumber(title: string): string {
  // 【状態A】【状態B】などのタグを除去
  const cleanedTitle = title.replace(/【[^】]+】/g, '').trim();
  
  // 型番パターン: 例 "SM10a 001/052", "sv11b 100/086"
  const modelNumberPattern = /([a-zA-Z0-9-]+\s+\d{1,3}\/\d{1,3})$/;
  const match = cleanedTitle.match(modelNumberPattern);
  
  if (match) {
    return match[0].toLowerCase().trim();
  }
  
  // マッチしない場合のフォールバック
  const parts = cleanedTitle.split(/\s+/);
  if (parts.length >= 3) {
    return `${parts[parts.length - 2]} ${parts[parts.length - 1]}`.toLowerCase();
  }
  
  return '';
}

/**
 * カードデータと静的データの差分を検出
 */
export function detectChanges(
  spreadsheetCards: Card[],
  staticData: StaticDataStore
): {
  newCards: Card[];
  missingImages: Card[];
  existingCards: number;
} {
  const newCards: Card[] = [];
  const missingImages: Card[] = [];
  let existingCards = 0;

  for (const card of spreadsheetCards) {
    const modelNumber = extractModelNumber(card.商品タイトル);
    
    if (!modelNumber) {
      continue;
    }

    const staticCard = staticData.cards[modelNumber];
    
    if (!staticCard) {
      // 静的データに存在しないカード
      newCards.push(card);
    } else if (!staticCard.imageUrl || staticCard.imageUrl === '/no-image.svg') {
      // 画像URLが設定されていないカード
      missingImages.push(card);
    } else {
      // 既存のカード
      existingCards++;
    }
  }

  return { newCards, missingImages, existingCards };
}

/**
 * 更新レポートを生成
 */
export function generateUpdateReport(
  totalCards: number,
  existingCards: number,
  newCards: number,
  imagesAdded: number,
  imagesFailed: number,
  missingImages: string[],
  errors: string[]
): UpdateReport {
  return {
    totalCards,
    existingCards,
    newCards,
    imagesAdded,
    imagesFailed,
    missingImages,
    errors,
    timestamp: new Date().toISOString()
  };
}

/**
 * 静的データに新しいカードを追加
 */
export function addCardToStaticData(
  staticData: StaticDataStore,
  card: Card,
  imageUrl: string = '/no-image.svg'
): void {
  const modelNumber = extractModelNumber(card.商品タイトル);
  
  if (!modelNumber) {
    return;
  }

  // タイトルからキャラクター名を抽出
  const cleanedTitle = card.商品タイトル.replace(/【[^】]+】/g, '').trim();
  const characterName = cleanedTitle.split(/\s+/)[0] || '';

  staticData.cards[modelNumber] = {
    title: card.商品タイトル,
    imageUrl,
    characterName,
    modelNumber
  };
}

/**
 * TypeScriptファイルを生成（開発用）
 */
export async function generateTypeScriptFile(staticData: StaticDataStore): Promise<void> {
  if (!isServer || !fs || !path) {
    console.warn('Cannot generate TypeScript file on client side');
    return;
  }
  
  const imports = `import { ImageData } from './imageSpreadsheetAlt';

/**
 * 静的な画像データ
 * Google Spreadsheetsが利用できない場合の確実なフォールバックデータ
 */
`;

  const dataArray = Object.values(staticData.cards).map(card => {
    return `  {
    title: "${card.title}",
    imageUrl: "${card.imageUrl}",
    characterName: "${card.characterName}",
    modelNumber: "${card.modelNumber}"
  }`;
  });

  const content = `${imports}export const staticImageData: ImageData[] = [
${dataArray.join(',\n')}
];

export const lastUpdated = "${staticData.lastUpdated}";
export const description = "ポケモンカードの画像データ。Google Spreadsheetsが利用できない場合のフォールバックデータです。";
`;

  const tsPath = path.join(process.cwd(), 'lib', 'staticImageData.ts');
  await fs.writeFile(tsPath, content, 'utf-8');
  console.log('TypeScript file generated successfully');
}