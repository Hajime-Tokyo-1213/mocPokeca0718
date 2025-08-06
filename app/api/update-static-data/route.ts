import { NextRequest, NextResponse } from 'next/server';
import { fetchCardDataFromSpreadsheet } from '@/lib/spreadsheet';
import { 
  loadStaticData, 
  saveStaticData, 
  detectChanges, 
  generateUpdateReport,
  addCardToStaticData,
  generateTypeScriptFile
} from '@/lib/staticDataManager';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting static data update process...');

    // 1. 現在のスプレッドシートデータを取得
    const spreadsheetData = await fetchCardDataFromSpreadsheet();
    const allCards = Array.isArray(spreadsheetData) ? spreadsheetData : [];

    if (allCards.length === 0) {
      return NextResponse.json(
        { error: 'No data from spreadsheet' },
        { status: 400 }
      );
    }

    // 2. 現在の静的データを読み込む
    const staticData = await loadStaticData();
    
    // 3. 差分を検出
    const { newCards, missingImages, existingCards } = detectChanges(
      allCards,
      staticData
    );

    console.log(`Total cards: ${allCards.length}`);
    console.log(`Existing cards: ${existingCards}`);
    console.log(`New cards: ${newCards.length}`);
    console.log(`Missing images: ${missingImages.length}`);

    // 4. 新しいカードを静的データに追加
    let imagesAdded = 0;
    let imagesFailed = 0;
    const errors: string[] = [];
    const missingImageTitles: string[] = [];

    // 新しいカードを追加（画像URLは後で取得する想定）
    for (const card of newCards) {
      try {
        addCardToStaticData(staticData, card);
        imagesAdded++;
      } catch (error) {
        imagesFailed++;
        errors.push(`Failed to add card: ${card.商品タイトル}`);
      }
    }

    // 画像がないカードの情報を記録
    for (const card of missingImages) {
      missingImageTitles.push(card.商品タイトル);
    }

    // 5. 更新日時とバージョンを更新
    staticData.lastUpdated = new Date().toISOString();
    staticData.version = (staticData.version || 1) + 1;

    // 6. 静的データを保存
    await saveStaticData(staticData);

    // 7. 開発環境ではTypeScriptファイルも生成
    if (process.env.NODE_ENV === 'development') {
      try {
        await generateTypeScriptFile(staticData);
      } catch (error) {
        console.error('Failed to generate TypeScript file:', error);
        errors.push('Failed to generate TypeScript file');
      }
    }

    // 8. レポートを生成
    const report = generateUpdateReport(
      allCards.length,
      existingCards,
      newCards.length,
      imagesAdded,
      imagesFailed,
      missingImageTitles,
      errors
    );

    return NextResponse.json({
      success: true,
      report
    });

  } catch (error) {
    console.error('Error updating static data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update static data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// 現在の静的データの状態を取得
export async function GET(request: NextRequest) {
  try {
    const staticData = await loadStaticData();
    const totalCards = Object.keys(staticData.cards).length;
    const cardsWithImages = Object.values(staticData.cards).filter(
      card => card.imageUrl && card.imageUrl !== '/no-image.svg'
    ).length;

    return NextResponse.json({
      totalCards,
      cardsWithImages,
      cardsWithoutImages: totalCards - cardsWithImages,
      lastUpdated: staticData.lastUpdated,
      version: staticData.version
    });

  } catch (error) {
    console.error('Error getting static data status:', error);
    return NextResponse.json(
      { error: 'Failed to get static data status' },
      { status: 500 }
    );
  }
}