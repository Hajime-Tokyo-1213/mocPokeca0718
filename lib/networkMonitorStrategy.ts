import puppeteer, { Browser, Page } from 'puppeteer';
import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ImageData } from './imageSpreadsheetAlt';
import { ImageFetchStrategy } from './imageDataFetcher';

/**
 * ネットワークリクエストを監視して画像を取得する戦略
 * Puppeteerを使用してGoogleスプレッドシートにアクセスし、
 * lh3.googleusercontent.comからの画像を検出・ダウンロードする
 */
export class NetworkMonitorStrategy implements ImageFetchStrategy {
  name = 'Network Monitor';
  private imageDir = 'public/images';
  private browser: Browser | null = null;
  
  // ウェブに公開されたスプレッドシートの公開ID
  private readonly spreadsheetId = '2PACX-1vRHvYoYFzk-sIRNJL3qf-uyxGQg2BFv0dJ147oHC11UPY0Ob1ovEvz3j6GVc-tOQvGY6nIvev1QXF9o';
  private readonly sheetGids = [
    { gid: '615803266', category: 'ar' },
    { gid: '831083568', category: 'sr' },
    { gid: '1856522830', category: 'sar' },
    { gid: '209255296', category: 'ur' },
    { gid: '696239385', category: 'chr' },
    { gid: '811385213', category: 'rr' },
    { gid: '978855825', category: 'rr' },
    { gid: '1429605223', category: 'rr' },
    { gid: '1002981119', category: 'rr' },
  ];

  async fetch(): Promise<ImageData[]> {
    // サーバーサイドでは実行しない
    if (typeof window === 'undefined') {
      console.log('NetworkMonitorStrategy: Skipping on server side - use API route instead');
      return [];
    }
    
    const allImageData: ImageData[] = [];
    
    try {
      // ブラウザインスタンスを起動
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      // 各シートごとに画像を取得
      for (const sheet of this.sheetGids) {
        try {
          console.log(`NetworkMonitorStrategy: Fetching images from sheet ${sheet.gid} (${sheet.category})`);
          const imageData = await this.fetchSheetImages(sheet.gid, sheet.category);
          allImageData.push(...imageData);
          
          // レート制限対策
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Failed to fetch sheet ${sheet.gid}:`, error);
        }
      }
      
      console.log(`NetworkMonitorStrategy: Total ${allImageData.length} images fetched and saved`);
    } catch (error) {
      console.error('NetworkMonitorStrategy failed:', error);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
    
    return allImageData;
  }

  private async fetchSheetImages(gid: string, category: string): Promise<ImageData[]> {
    if (!this.browser) throw new Error('Browser not initialized');
    
    const page = await this.browser.newPage();
    const imageUrls: Map<string, string> = new Map();
    const imageData: ImageData[] = [];
    
    try {
      // ネットワークリクエストの監視を設定
      page.on('response', async (response) => {
        const url = response.url();
        
        // lh3.googleusercontent.comからの画像を検出
        if (url.includes('lh3.googleusercontent.com') && response.status() === 200) {
          const contentType = response.headers()['content-type'];
          if (contentType && contentType.startsWith('image/')) {
            // 高解像度URLに変換
            const hdUrl = this.removeResizeParams(url);
            imageUrls.set(hdUrl, category);
            console.log(`Detected image from ${category}: ${hdUrl}`);
          }
        }
      });
      
      // スプレッドシートのURLを構築してアクセス
      const sheetUrl = `https://docs.google.com/spreadsheets/d/e/${this.spreadsheetId}/pubhtml?gid=${gid}&single=true`;
      console.log(`Navigating to: ${sheetUrl}`);
      
      await page.goto(sheetUrl, {
        waitUntil: 'networkidle0',
        timeout: 60000
      });
      
      // 追加の待機時間（動的コンテンツの読み込み待ち）
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // 検出した画像をダウンロードして保存
      for (const [url, cat] of imageUrls.entries()) {
        try {
          const savedImageData = await this.downloadAndSaveImage(url, cat);
          if (savedImageData) {
            imageData.push(savedImageData);
          }
        } catch (error) {
          console.error(`Failed to download image ${url}:`, error);
        }
      }
      
    } finally {
      await page.close();
    }
    
    return imageData;
  }

  private async downloadAndSaveImage(url: string, category: string): Promise<ImageData | null> {
    try {
      // 画像をダウンロード
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      // ファイル名を生成（URLからハッシュを作成）
      const urlHash = crypto.createHash('md5').update(url).digest('hex');
      const extension = this.getImageExtension(response.headers['content-type'] || 'image/jpeg');
      const filename = `${urlHash}${extension}`;
      const categoryDir = path.join(this.imageDir, 'cards', category);
      const filePath = path.join(categoryDir, filename);
      
      // ディレクトリが存在することを確認
      await fs.mkdir(categoryDir, { recursive: true });
      
      // ファイルを保存
      await fs.writeFile(filePath, response.data);
      
      console.log(`Image saved: ${filePath}`);
      
      // ImageDataオブジェクトを作成
      return {
        title: `${category.toUpperCase()} Card ${urlHash.substring(0, 8)}`,
        imageUrl: `/images/cards/${category}/${filename}`,
        characterName: '',
        modelNumber: ''
      };
      
    } catch (error) {
      console.error(`Error downloading image from ${url}:`, error);
      return null;
    }
  }

  private removeResizeParams(url: string): string {
    // URLからサイズパラメータを削除して高解像度版を取得
    let cleanUrl = url;
    
    // =sXXX, =wXXX-hXXX などのパラメータを削除
    cleanUrl = cleanUrl.replace(/=[swh]\d+(-[wh]\d+)?(&|$)/, '$2');
    
    // URLの末尾に=が残っている場合は削除
    if (cleanUrl.endsWith('=')) {
      cleanUrl = cleanUrl.slice(0, -1);
    }
    
    return cleanUrl;
  }

  private getImageExtension(contentType: string): string {
    const typeMap: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp'
    };
    
    return typeMap[contentType] || '.jpg';
  }
}

// 既存の画像をクリーンアップするユーティリティ関数
export async function cleanupOldImages(): Promise<void> {
  const imageDir = 'public/images/cards';
  const categories = ['ar', 'sr', 'sar', 'ur', 'chr', 'rr'];
  
  for (const category of categories) {
    const categoryDir = path.join(imageDir, category);
    try {
      const files = await fs.readdir(categoryDir);
      for (const file of files) {
        if (file !== '.gitkeep') {
          await fs.unlink(path.join(categoryDir, file));
        }
      }
      console.log(`Cleaned up ${files.length} files in ${category}`);
    } catch (error) {
      console.error(`Error cleaning up ${category}:`, error);
    }
  }
}