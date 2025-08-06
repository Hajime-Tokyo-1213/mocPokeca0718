import { CardData } from './spreadsheet'

// フォールバック用のサンプルデータ
export const fallbackCardData: CardData = [
  {
    cardId: "sample-100-001",
    商品タイトル: "サンプルカード1",
    商品型番: "100/001",
    レアリティ: "AR",
    買取価格: "100",
    imageUrl: ""
  },
  {
    cardId: "sample-200-001",
    商品タイトル: "サンプルカード2",
    商品型番: "200/001",
    レアリティ: "SR",
      買取価格: "200",
    imageUrl: ""
  },
  {
    cardId: "sample-min-001",
    商品タイトル: "サンプルカード（最低保証）",
    商品型番: "MIN/001",
    レアリティ: "N",
    買取価格: "最低保証",
    imageUrl: ""
  }
]