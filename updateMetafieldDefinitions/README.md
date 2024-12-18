# なんだこれは：
大量のメタフィールドを作った後に更新が入ったらめんどくさいから更新もできるようにしたやつ
GASで動作します。

# Spread sheet format：

| No.  | 分類             | Shopify項目名 | プロパティ名                 | Matrixifyヘッダー名（参考）                            | データ例        | タイプ                 | 利用方針               |
|------|------------------|----------------|-----------------------------|-------------------------------------------------------|-----------------|---------------------|-----------------------|
| 1   | Product Metafield | 商品状態       | custom.product_status | Metafield: custom.ec_product_item_status [number_integer] |  | number_integer | 商品状態を把握するため |
| 2   | Variant Metafield | フリーエリア       | custom.free_area | Metafield: custom.free_area [multi_line_text_field] |  | multi_line_text_field | HTMLを描画する |

# 概要：

(更新できていない)

B列の値にて、商品メタフィールドか、バリアンとメタフィールドかを判別

C列をメタフィールド定義の名前とする

D列をメタフィールド定義のネームスペースとキーとする

G列をメタフィールド定義のタイプとする

H列をメタフィールド定義の説明文とする

## 環境構築
https://tsuzucle.com/blogs/tech-blog/requset-shopify-api-from-gas

## 実行方法：
GASに貼り付けて実行ボタンをおす。
エラーが出たら、@Hyuga-Niigakiまで。
