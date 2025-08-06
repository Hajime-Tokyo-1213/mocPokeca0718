import { ImageData, fetchAllImageData } from './imageSpreadsheetAlt';
import { ImageFetchStrategy } from './imageDataFetcher';
import axios from 'axios';
import { staticImageData } from './staticImageData';
import { getImageSizeFromEnv } from './imageConfig';
import { NetworkMonitorStrategy } from './networkMonitorStrategy';

/**
 * 静的TypeScriptファイルから画像データを読み込む戦略
 * 最も確実な方法（SSR/CSR両対応）
 */
export class StaticDataStrategy implements ImageFetchStrategy {
  name = 'Static TypeScript Data';

  async fetch(): Promise<ImageData[]> {
    console.log('Loading static image data from TypeScript file...');
    console.log(`Successfully loaded ${staticImageData.length} images from static data`);
    return staticImageData;
  }
}

/**
 * JSONファイルから画像データを読み込む戦略（クライアントサイド専用）
 * Next.jsのpublicフォルダからJSONを取得
 */
export class JSONFileStrategy implements ImageFetchStrategy {
  name = 'JSON File';
  private readonly url: string;

  constructor(url?: string) {
    // クライアントサイドでのみ動作
    this.url = url || '/data/imageData.json';
  }

  async fetch(): Promise<ImageData[]> {
    try {
      // サーバーサイドでは動作しない
      if (typeof window === 'undefined') {
        console.log('JSONFileStrategy: Skipping on server side');
        return [];
      }
      
      console.log(`Fetching image data from JSON: ${this.url}`);
      
      const response = await axios.get(this.url);
      const data = response.data;
      
      if (!data.images || !Array.isArray(data.images)) {
        console.error('Invalid JSON format: missing images array');
        return [];
      }
      
      console.log(`Successfully loaded ${data.images.length} images from JSON`);
      console.log(`Last updated: ${data.lastUpdated || 'unknown'}`);
      
      return data.images;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          console.error(`JSON file not found: ${this.url}`);
        } else {
          console.error('Error fetching JSON:', error.message);
        }
      } else {
        console.error('Error reading JSON:', error);
      }
      return [];
    }
  }
}

/**
 * imageSpreadsheetAlt.tsの実装を使用する戦略
 * ウェブに公開されたスプレッドシートから画像データを取得
 */
export class AltSpreadsheetStrategy implements ImageFetchStrategy {
  name = 'Alt Spreadsheet (Web Published)';

  async fetch(): Promise<ImageData[]> {
    console.log('Fetching from published spreadsheet using alt implementation...');
    try {
      const imageSizeConfig = getImageSizeFromEnv();
      const data = await fetchAllImageData(imageSizeConfig);
      console.log(`Successfully fetched ${data.length} images from published spreadsheet`);
      return data;
    } catch (error) {
      console.error('Error fetching from alt spreadsheet:', error);
      return [];
    }
  }
}

/**
 * ハードコードされたサンプルデータを返す戦略
 * 開発・テスト用
 */
export class SampleDataStrategy implements ImageFetchStrategy {
  name = 'Sample Data';

  async fetch(): Promise<ImageData[]> {
    console.log('Using sample image data...');
    
    // サンプルデータ
    const sampleData: ImageData[] = [
      {
        title: "ピカチュウ sv11b 100/086",
        imageUrl: "/images/sv11b-100-086.jpg",
        characterName: "ピカチュウ",
        modelNumber: "sv11b 100/086"
      },
      {
        title: "リザードン sv11b 101/086",
        imageUrl: "/images/sv11b-101-086.jpg",
        characterName: "リザードン",
        modelNumber: "sv11b 101/086"
      },
      {
        title: "フシギバナ sv11b 102/086",
        imageUrl: "/images/sv11b-102-086.jpg",
        characterName: "フシギバナ",
        modelNumber: "sv11b 102/086"
      },
      {
        title: "イーブイ sv11w 101/086",
        imageUrl: "/images/sv11w-101-086.jpg",
        characterName: "イーブイ",
        modelNumber: "sv11w 101/086"
      }
    ];
    
    return sampleData;
  }
}

// NetworkMonitorStrategyのエクスポート
export { NetworkMonitorStrategy };