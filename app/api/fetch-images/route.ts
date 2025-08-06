import { NextResponse } from 'next/server';
import { NetworkMonitorStrategy } from '@/lib/networkMonitorStrategy';
import { ImageData } from '@/lib/imageSpreadsheetAlt';

/**
 * 画像を取得してローカルに保存するAPIエンドポイント
 * NetworkMonitorStrategyを使用してGoogleスプレッドシートから画像を取得
 */
export async function POST() {
  try {
    console.log('Starting image fetch process...');
    
    // NetworkMonitorStrategyを使用して画像を取得
    const strategy = new NetworkMonitorStrategy();
    const imageData: ImageData[] = await strategy.fetch();
    
    if (imageData.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No images were fetched',
        count: 0
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully fetched and saved ${imageData.length} images`,
      count: imageData.length,
      images: imageData
    });
    
  } catch (error) {
    console.error('Error in fetch-images API:', error);
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      count: 0
    }, { status: 500 });
  }
}

// GETリクエストも許可（開発用）
export async function GET() {
  return NextResponse.json({
    message: 'Use POST request to fetch images',
    endpoint: '/api/fetch-images',
    method: 'POST'
  });
}