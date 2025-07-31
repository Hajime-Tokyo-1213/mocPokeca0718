/**
 * Google画像URLのサイズパラメータを変換して高解像度版を取得する
 */

export interface ImageSizeConfig {
  size?: number;      // 正方形サイズ (sパラメータ)
  width?: number;     // 幅 (wパラメータ)
  height?: number;    // 高さ (hパラメータ)
}

// デフォルトの画像サイズ設定
export const DEFAULT_IMAGE_SIZE: ImageSizeConfig = {
  size: 800,  // 800x800の正方形（高解像度）
};

/**
 * Google画像URLを高解像度版に変換する
 * @param originalUrl 元の画像URL
 * @param sizeConfig サイズ設定（省略時はデフォルト設定を使用）
 * @returns 変換された画像URL
 */
export function transformImageUrl(originalUrl: string, sizeConfig: ImageSizeConfig = DEFAULT_IMAGE_SIZE): string {
  // GoogleのCDN URLでない場合はそのまま返す
  if (!originalUrl.includes('googleusercontent.com') && !originalUrl.includes('drive.google.com')) {
    return originalUrl;
  }

  let transformedUrl = originalUrl;

  // 既存のサイズパラメータを削除
  // パターン1: =s100-w100-h20 のような形式
  transformedUrl = transformedUrl.replace(/=s\d+(-w\d+)?(-h\d+)?(?=(&|$))/, '');
  
  // パターン2: =w100-h100 のような形式
  transformedUrl = transformedUrl.replace(/=w\d+(-h\d+)?(?=(&|$))/, '');
  
  // パターン3: =h100 のような形式
  transformedUrl = transformedUrl.replace(/=h\d+(?=(&|$))/, '');

  // 新しいサイズパラメータを追加
  const separator = transformedUrl.includes('?') ? '&' : '?';
  
  if (sizeConfig.size) {
    // 正方形サイズを指定
    transformedUrl += `${separator}s${sizeConfig.size}`;
  } else if (sizeConfig.width || sizeConfig.height) {
    // 幅と高さを個別に指定
    const params = [];
    if (sizeConfig.width) params.push(`w${sizeConfig.width}`);
    if (sizeConfig.height) params.push(`h${sizeConfig.height}`);
    transformedUrl += `${separator}${params.join('-')}`;
  } else {
    // デフォルトサイズを使用
    transformedUrl += `${separator}s${DEFAULT_IMAGE_SIZE.size}`;
  }

  return transformedUrl;
}

/**
 * 複数の画像URLを一括で変換する
 * @param urls 画像URLの配列
 * @param sizeConfig サイズ設定
 * @returns 変換された画像URLの配列
 */
export function transformImageUrls(urls: string[], sizeConfig: ImageSizeConfig = DEFAULT_IMAGE_SIZE): string[] {
  return urls.map(url => transformImageUrl(url, sizeConfig));
}

/**
 * サムネイル用の小さいサイズ設定
 */
export const THUMBNAIL_SIZE: ImageSizeConfig = {
  size: 150,
};

/**
 * 詳細表示用の大きいサイズ設定
 */
export const DETAIL_SIZE: ImageSizeConfig = {
  size: 600,
};

/**
 * オリジナルサイズ（最大解像度）設定
 * 注意: 非常に大きい画像になる可能性があります
 */
export const ORIGINAL_SIZE: ImageSizeConfig = {
  size: 0,  // s0 は元のサイズを意味する
};