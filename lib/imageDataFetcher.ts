import axios from 'axios';
import { ImageData } from './imageSpreadsheetAlt';
import { getImageSizeFromEnv } from './imageConfig';
import { ImageSizeConfig } from './imageUrlTransformer';

/**
 * 画像データ取得のための統合インターフェース
 * 複数の取得方法をサポートし、フォールバック機能を提供
 */

export interface ImageFetchStrategy {
  name: string;
  fetch: () => Promise<ImageData[]>;
}

// HTMLパース戦略
export class HTMLParseStrategy implements ImageFetchStrategy {
  name = 'HTML Parse';
  
  private readonly spreadsheetId = '2PACX-1vRHvYoYFzk-sIRNJL3qf-uyxGQg2BFv0dJ147oHC11UPY0Ob1ovEvz3j6GVc-tOQvGY6nIvev1QXF9o';
  private readonly sheetGids = [
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

  async fetch(): Promise<ImageData[]> {
    const allData: ImageData[] = [];
    
    for (const gid of this.sheetGids) {
      try {
        const data = await this.fetchSheetData(gid, getImageSizeFromEnv());
        allData.push(...data);
        // レート制限対策
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to fetch sheet ${gid}:`, error);
      }
    }
    
    return allData;
  }

  private async fetchSheetData(gid: string, imageSizeConfig?: ImageSizeConfig): Promise<ImageData[]> {
    const url = `https://docs.google.com/spreadsheets/d/e/${this.spreadsheetId}/pubhtml?gid=${gid}&single=true`;
    const response = await axios.get(url);
    return this.parseHTML(response.data, imageSizeConfig);
  }

  private parseHTML(html: string, imageSizeConfig?: ImageSizeConfig): ImageData[] {
    const data: ImageData[] = [];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
    let rowMatch;
    let rowIndex = 0;
    
    while ((rowMatch = rowRegex.exec(html)) !== null) {
      rowIndex++;
      if (rowIndex === 1) continue; // ヘッダー行をスキップ
      
      const cells = this.extractCells(rowMatch[1]);
      if (cells.length >= 5) {
        const title = this.cleanText(cells[2]);
        const imageUrl = this.extractImageUrl(cells[4]);
        
        if (title && imageUrl && this.isValidTitle(title)) {
          // 画像URLを高解像度版に変換
          const transformedUrl = this.transformImageUrl(imageUrl, imageSizeConfig);
          const { characterName, modelNumber } = this.parseTitle(title);
          data.push({ title, imageUrl: transformedUrl, characterName, modelNumber });
        }
      }
    }
    
    return data;
  }

  private extractCells(rowHtml: string): string[] {
    const cells: string[] = [];
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
    let cellMatch;
    
    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      cells.push(cellMatch[1]);
    }
    
    return cells;
  }

  private cleanText(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  private extractImageUrl(cellHtml: string): string {
    const match = cellHtml.match(/src="([^"]+)"/);
    const originalUrl = match ? match[1] : '';
    
    // 画像URLを高解像度版に変換
    return originalUrl;
  }

  private isValidTitle(title: string): boolean {
    const invalidKeywords = ['タイトル', '検索ワード', '抽出条件', '価格', '画像URL'];
    return !invalidKeywords.some(keyword => title.includes(keyword));
  }

  private parseTitle(title: string): { characterName: string; modelNumber: string } {
    const cleanedTitle = title.replace(/【[^】]+】/g, '').trim();
    const modelNumberPattern = /([a-zA-Z0-9-]+\s+\d{1,3}\/\d{1,3})$/;
    const match = cleanedTitle.match(modelNumberPattern);

    if (match) {
      const modelNumber = match[0].trim();
      const namePartWithoutModel = cleanedTitle.substring(0, cleanedTitle.lastIndexOf(match[0])).trim();
      const nameMatch = namePartWithoutModel.match(/^([^\s]+(?:[ぁ-んァ-ヶー]*)?)/);
      const characterName = nameMatch ? nameMatch[1] : namePartWithoutModel.split(' ')[0];
      
      return { characterName, modelNumber };
    }

    const parts = cleanedTitle.split(/\s+/);
    return {
      characterName: parts[0] || '',
      modelNumber: parts.length >= 3 ? `${parts[parts.length - 2]} ${parts[parts.length - 1]}` : ''
    };
  }

  private transformImageUrl(originalUrl: string, sizeConfig?: ImageSizeConfig): string {
    if (!originalUrl.includes('googleusercontent.com')) {
      return originalUrl;
    }

    let transformedUrl = originalUrl;
    // 既存のサイズパラメータを削除
    transformedUrl = transformedUrl.replace(/=s\d+(-w\d+)?(-h\d+)?(?=(&|$))/, '');
    
    // 新しいサイズを追加
    const size = sizeConfig?.size || 800;
    const separator = transformedUrl.includes('?') ? '&' : '?';
    transformedUrl += `${separator}s${size}`;
    
    return transformedUrl;
  }
}

// 画像データフェッチャー（戦略パターン使用）
export class ImageDataFetcher {
  private strategies: ImageFetchStrategy[] = [];

  addStrategy(strategy: ImageFetchStrategy): void {
    this.strategies.push(strategy);
  }

  async fetchWithFallback(): Promise<ImageData[]> {
    for (const strategy of this.strategies) {
      try {
        console.log(`Attempting to fetch images using ${strategy.name} strategy...`);
        const data = await strategy.fetch();
        
        if (data.length > 0) {
          console.log(`Successfully fetched ${data.length} images using ${strategy.name}`);
          return data;
        }
      } catch (error) {
        console.error(`${strategy.name} strategy failed:`, error);
      }
    }
    
    console.error('All image fetch strategies failed');
    return [];
  }
}

// デフォルトのフェッチャーを作成
export function createDefaultImageFetcher(): ImageDataFetcher {
  const fetcher = new ImageDataFetcher();
  fetcher.addStrategy(new HTMLParseStrategy());
  return fetcher;
}