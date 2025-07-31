/**
 * 画像サイズの設定を管理するための定数と型定義
 */

import { ImageSizeConfig } from './imageUrlTransformer';

/**
 * プリセットされた画像サイズ設定
 */
export const IMAGE_SIZE_PRESETS = {
  /** サムネイル表示用（150x150） */
  THUMBNAIL: {
    size: 150,
  } as ImageSizeConfig,
  
  /** 小サイズ（250x250） */
  SMALL: {
    size: 250,
  } as ImageSizeConfig,
  
  /** 中サイズ（400x400）- デフォルト */
  MEDIUM: {
    size: 400,
  } as ImageSizeConfig,
  
  /** 大サイズ（600x600） */
  LARGE: {
    size: 600,
  } as ImageSizeConfig,
  
  /** 特大サイズ（800x800） */
  EXTRA_LARGE: {
    size: 800,
  } as ImageSizeConfig,
  
  /** フルサイズ（1200x1200） */
  FULL: {
    size: 1200,
  } as ImageSizeConfig,
  
  /** オリジナルサイズ（変換なし） */
  ORIGINAL: {
    size: 0,
  } as ImageSizeConfig,
} as const;

/**
 * 環境変数または設定から画像サイズを取得
 * @returns 画像サイズ設定
 */
export function getImageSizeFromEnv(): ImageSizeConfig {
  const envSize = process.env.NEXT_PUBLIC_IMAGE_SIZE;
  
  if (!envSize) {
    return IMAGE_SIZE_PRESETS.MEDIUM;
  }
  
  // プリセット名で指定されている場合
  const presetName = envSize.toUpperCase() as keyof typeof IMAGE_SIZE_PRESETS;
  if (presetName in IMAGE_SIZE_PRESETS) {
    return IMAGE_SIZE_PRESETS[presetName];
  }
  
  // 数値で指定されている場合
  const size = parseInt(envSize);
  if (!isNaN(size) && size > 0) {
    return { size };
  }
  
  // デフォルトに戻る
  return IMAGE_SIZE_PRESETS.MEDIUM;
}

/**
 * 画像品質設定
 */
export const IMAGE_QUALITY_SETTINGS = {
  /** 低品質（データ節約） */
  LOW: {
    size: 200,
    quality: 70,
  },
  
  /** 通常品質 */
  NORMAL: {
    size: 400,
    quality: 85,
  },
  
  /** 高品質 */
  HIGH: {
    size: 800,
    quality: 95,
  },
} as const;

/**
 * デバイスタイプに応じた推奨サイズ
 */
export const DEVICE_RECOMMENDED_SIZES = {
  /** モバイル端末向け */
  MOBILE: IMAGE_SIZE_PRESETS.SMALL,
  
  /** タブレット端末向け */
  TABLET: IMAGE_SIZE_PRESETS.MEDIUM,
  
  /** デスクトップ向け */
  DESKTOP: IMAGE_SIZE_PRESETS.LARGE,
  
  /** 4Kディスプレイ向け */
  ULTRA_HD: IMAGE_SIZE_PRESETS.FULL,
} as const;