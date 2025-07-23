const fs = require('fs');
const path = require('path');

// フォントファイルを読み込み
const fontPath = path.join(__dirname, '../public/fonts/NotoSansJP-Regular.otf');
const fontData = fs.readFileSync(fontPath);

// Base64に変換
const base64Font = fontData.toString('base64');

// TypeScriptファイルとして出力
const outputPath = path.join(__dirname, '../lib/notoJpFont.ts');
const outputContent = `// Noto Sans JP Regular フォントのBase64データ
export const notoSansJpNormal = '${base64Font}';
`;

fs.writeFileSync(outputPath, outputContent);
console.log('フォントのBase64変換が完了しました:', outputPath);