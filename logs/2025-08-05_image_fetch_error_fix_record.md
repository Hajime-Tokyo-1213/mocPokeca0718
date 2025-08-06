# 画像取得エラー修正記録

**日時**: 2025年8月5日  
**問題**: バオッキー AR SV11W 100/086の画像が正しく表示されない

## 問題の詳細

ユーザーからの報告：
- バオッキー AR SV11W 100/086の画像が「NO IMAGE」と表示される
- 画像データは別のスプレッドシート（ID: 1e1QaldVK3sueAw_t90fuGL8p-GdhLMPuRivPqdFk9lg）のARシート215行目E列に記載
- セル内では`=IMAGE("URL")`関数を使用

## 調査結果

### 1. 実施済みの修正

1. **HTMLParseStrategyの更新**
   - スプレッドシートIDを正しいIDに変更済み
   - extractImageUrlメソッドに`=IMAGE("URL")`形式のパース機能を追加済み
   - 画像サイズを600pxに設定済み

2. **静的データへの追加**
   - staticImageData.tsにバオッキーのデータを追加済み
   - 正しい画像URLで登録済み

3. **戦略優先順位の制御**
   - 環境変数`NEXT_PUBLIC_USE_SPREADSHEET_FIRST`で制御可能に
   - .env.localファイルで設定済み

### 2. 判明した問題

**Googleスプレッドシートの仕様上の制限**：
- `=IMAGE("URL")`関数を使用している場合、エクスポートAPI（HTML/CSV/TSV）では関数の引数が取得できない
- エクスポート時には空白（`&nbsp;`）として返される
- これはGoogleの仕様で、API経由でのみ関数の内容を取得可能

### 3. 解決策

#### 短期的解決策（実装済み）
- 静的データ（staticImageData.ts）にバオッキーを含む主要な画像データを追加
- これにより、スプレッドシートが利用できない場合でも画像が表示される

#### 長期的解決策（推奨）

1. **スプレッドシートの構造変更**
   - E列：画像URLを直接記載（関数なし）
   - F列：`=IMAGE(E2)`で画像を表示（表示用）

2. **Google Sheets API v4の使用**
   - APIキーまたはOAuth認証を使用
   - `valueRenderOption=FORMULA`で関数の内容を取得可能

3. **別の画像データソースの使用**
   - 画像URLを直接含むJSONファイルやデータベース

## 今後のアクション

1. ユーザーにスプレッドシートの構造変更を提案
2. Google Sheets APIの実装を検討（要APIキー）
3. 当面は静的データで対応

## 技術的詳細

### HTMLParseStrategyの実装（imageDataFetcher.ts）
```typescript
private extractImageUrl(cellHtml: string): string {
  // =IMAGE("URL")形式の場合
  let match = cellHtml.match(/=IMAGE\(["']([^"']+)["']\)/);
  if (match) {
    console.log('Found IMAGE formula URL:', match[1]);
    return match[1];
  }
  
  // 通常のimg src="URL"形式の場合
  const srcMatch = cellHtml.match(/src="([^"]+)"/);
  if (srcMatch) {
    console.log('Found img src URL:', srcMatch[1]);
    return srcMatch[1];
  }
  
  // 画像URLが見つからない場合
  console.log('No image URL found in cell:', cellHtml.substring(0, 50));
  return '';
}
```

### 環境変数の設定（.env.local）
```env
NEXT_PUBLIC_USE_SPREADSHEET_FIRST=true
NEXT_PUBLIC_IMAGE_SIZE=LARGE
```

## 結論

技術的な実装は完了しているが、Googleスプレッドシートの仕様上の制限により、`=IMAGE()`関数内のURLは通常のエクスポートAPIでは取得できない。当面は静的データで対応し、長期的にはスプレッドシートの構造変更またはGoogle Sheets APIの導入を検討する。

## 追加調査（2025年8月5日更新）

### 問題の拡大
- バオッキー以外にも094/071など、大半のカードで画像が表示されない
- ユーザーは「ファイル→共有→ウェブに公開」の設定をしていると報告

### 調査結果
1. **全ての戦略が0枚の画像を取得**
   - HTMLParseStrategy: 0枚
   - AltSpreadsheetStrategy: 0枚  
   - 静的データのみが動作（16枚）

2. **考えられる原因**
   - 公開IDが間違っている可能性
   - スプレッドシートの公開設定が正しくない
   - HTMLフォーマットが変更された
   - =IMAGE()関数の制約

### 次のステップ
1. **ユーザーへの確認事項**
   - 画像スプレッドシートの正しい公開URL
   - 公開設定の詳細（全シート公開されているか）
   - サンプルとして数行の実際のデータ構造

2. **技術的対応**
   - 094/071などの頻出カードを静的データに追加
   - Google Sheets APIの実装を本格的に検討
   - 別の画像データソースの検討（JSONファイル等）