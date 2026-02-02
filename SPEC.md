# SPEC

## Freee CSV columns (import)
- 収支区分
- 管理番号
- 発生日
- 決済期日
- 取引先
- 取引先コード
- 勘定科目
- 税区分
- 金額
- 税計算区分
- 税額
- 備考
- 品目
- 部門
- メモタグ（複数指定可、カンマ区切り）
- 決済日
- 決済口座
- 決済金額
- セグメント1
- セグメント2
- セグメント3

## Amazon data sources
- Primary input: `~/Downloads/Amazon 注文データ/Retail.OrderHistory.3/Retail.OrderHistory.3.csv`
- Returns/refunds: `Retail.OrdersReturned.3.csv`, `Retail.OrdersReturned.Payments.3.csv`, `Retail.Returns.Receivable.3.csv`
- Receipts/invoices: likely in `Retail.TransactionalInvoicing.*/*.pdf` (not in OrderHistory CSV)

## Proposed mapping (draft)
- 収支区分: `支出` (固定)
- 管理番号: `Order ID`
- 発生日: `Order Date` (UTC -> Asia/Tokyo, date only)
- 決済期日: 空欄 or `Order Date` (freeeの要件に合わせて後決定)
- 取引先: 固定で `Amazon.co.jp`
- 取引先コード: 空欄
- 勘定科目: UIで一括設定
- 税区分: UIで一括設定
- 金額: `Total Owed` (行ごとの税込金額として扱う)
- 税計算区分: `内税` (固定)
- 税額: `Shipment Item Subtotal Tax` もしくは `Unit Price Tax * Quantity`（どちらが実態に近いか要確認）
- 備考: `Product Name` + `ASIN` + `Quantity` などを連結
- 品目: `Product Name`（長い場合はカット）
- 部門: 固定値 or 空欄
- メモタグ: 固定値 or 空欄（例: `amazon`）
- 決済日: デフォルト `Order Date`、UIで `Ship Date` に変更可能
- 決済口座: 固定値（例: クレカ口座名）※アプリで選択式にする
- 決済金額: `Total Owed`
- セグメント1/2/3: 空欄

## Assumptions / to confirm
- `Retail.OrderHistory.3.csv` は商品行単位で、`Total Owed` はその行の税込支払額として使える前提。
- `Order Date` はUTC表記なのでJSTに変換して日付のみを使用。
- 税額は `Shipment Item Subtotal Tax` を優先したいが、空欄や不整合がある場合は `Unit Price Tax * Quantity` で代替する。
- 勘定科目、税区分はUIで一括設定できるようにする。
- 決済日はデフォルト `Order Date`、UIで `Ship Date` に切替可能。

## UI (SPA only, no backend)
- SPAとしてビルドする（サーバー保存なし）
- UIライブラリ: shadcn/ui
- 画面: CSVアップロード + 一覧テーブル + 絞り込み/一括設定
- CSVアップロード: ドラッグ&ドロップ / クリック選択の両方
- アップロード対象: `Retail.OrderHistory.3.csv` を説明文で案内
- アップロード後にテーブル表示
- 行クリックで出力対象をチェック/解除できる
- チェック状態は保存（ブラウザ保存）される
- 一括チェック/解除ができる
- 表示年の切替: 年単位、CSV内の年のみを選択肢として表示
- 一括設定: 勘定科目/税区分をUIで指定
- 決済日: デフォルト `Order Date`、UIで `Ship Date` に切替
