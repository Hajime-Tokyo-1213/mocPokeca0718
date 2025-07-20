import { CardData, fetchCardDataFromSpreadsheet } from '@/lib/spreadsheet'
import { fallbackCardData } from '@/lib/fallbackData'
import { fetchAllImageData, ImageData } from '@/lib/imageSpreadsheet'
import HomeClient from './home-client'

function mergeData(baseData: CardData, imageData: ImageData[]): CardData {
  const mergedData: CardData = {}
  console.log('\n--- STARTING MERGE PROCESS DEBUG ---');

  // デバッグ用にヒトモシの画像データを先に見つけておく
  const hitomoshiImageData = imageData.find(img => img.title.includes('ヒトモシ'));
  if (hitomoshiImageData) {
    console.log('[DEBUG] Found potential ヒトモシ image data:', hitomoshiImageData);
  } else {
    console.log('[DEBUG] COULD NOT FIND any image data with "ヒトモシ" in title.');
  }

  for (const priceKey in baseData) {
    mergedData[priceKey] = baseData[priceKey].map(card => {
      let finalImageUrl = '/no-image.svg';

      // --- ヒトモシ (100/086) の詳細なデバッグログ ---
      if (card.商品型番 === '100/086' && card.商品タイトル.includes('ヒトモシ')) {
        console.log(`\n[DEBUG] Processing card: "${card.商品タイトル}" (型番: "${card.商品型番}")`);
        
        const potentialImages = imageData.filter(img => {
          const isIncluded = img.modelNumber.includes(card.商品型番);
          if (isIncluded) {
            console.log(`  [MATCH_SUCCESS] Primary match found!`);
            console.log(`    - Base model number: "${card.商品型番}"`);
            console.log(`    - Image model number: "${img.modelNumber}"`);
          }
          return isIncluded;
        });

        if (potentialImages.length === 0) {
          console.log('  [MATCH_FAIL] No primary match found on model number.');
        } else if (potentialImages.length === 1) {
          finalImageUrl = potentialImages[0].imageUrl;
          console.log(`  [SUCCESS] Single match found. URL: ${finalImageUrl}`);
        } else {
           console.log(`  [INFO] Multiple primary matches found (${potentialImages.length}). Starting secondary match...`);
           const foundImage = potentialImages.find(img => {
             const isIncluded = card.商品タイトル.includes(img.characterName);
             if (isIncluded) {
               console.log(`    [MATCH_SUCCESS] Secondary match found!`);
               console.log(`      - Base title: "${card.商品タイトル}"`);
               console.log(`      - Image character name: "${img.characterName}"`);
             }
             return isIncluded;
           });
           if (foundImage) {
             finalImageUrl = foundImage.imageUrl;
             console.log(`  [SUCCESS] Secondary match succeeded. URL: ${finalImageUrl}`);
           } else {
             console.log('  [MATCH_FAIL] Secondary match failed.');
           }
        }
      } else {
        // 通常の（デバッグログなしの）マージ処理
        const potentialImages = imageData.filter(img => img.modelNumber.includes(card.商品型番));
        if (potentialImages.length === 1) {
          finalImageUrl = potentialImages[0].imageUrl;
        } else if (potentialImages.length > 1) {
          const foundImage = potentialImages.find(img => card.商品タイトル.includes(img.characterName));
          if (foundImage) finalImageUrl = foundImage.imageUrl;
        }
      }
      
      return { ...card, imageUrl: finalImageUrl };
    });
  }
  console.log('--- FINISHED MERGE PROCESS DEBUG ---\n');
  return mergedData
}


export default async function Home() {
  let cardData: CardData
  
  try {
    const [baseCardData, allImageData] = await Promise.all([
      fetchCardDataFromSpreadsheet(),
      fetchAllImageData()
    ]);
    
    if (Object.keys(baseCardData).length === 0) {
      cardData = fallbackCardData
    } else {
      cardData = mergeData(baseCardData, allImageData)
    }
  } catch (error) {
    console.error('Error in Home page:', error)
    cardData = fallbackCardData
  }
  
  return <HomeClient cardData={cardData} />
}