---
path: "/ja/recipes/tvshows"
slug: "tvshows"
prev: false
next: false
published_at: 2026-09-10
---

<script setup>
import EmbedDocument from '../../../.vitepress/theme/EmbedDocument.vue'
</script>

# TV番組制作向けのKitsu

[[制作タイプごとのパイプラインに特化した機能と、アハ体験に到達するための短いクイックスタートを紹介する制作タイプページのコンセプト https://mercury.com/blog/identifying-product-aha-moment]]

## クイックスタート

### 1. 新しい制作を作成する

<EmbedDocument link="/ja/guides/production-structure/manage-productions/#create-a-new-production">
<!--@include: ../../guides/production-structure/manage-productions/index.md#setup-->
</EmbedDocument>

### 2. アセットを作成する

<EmbedDocument link="/ja/guides/production/manage-assets/#create-an-asset">
<!--@include: ../../guides/production/manage-assets/index.md#setup-->
</EmbedDocument>

### 3. エピソードを作成する

<EmbedDocument link="/ja/guides/production-structure/manage-episodes/">
<!--@include: ../../guides/production-structure/manage-episodes/index.md#setup-->
</EmbedDocument>

### 4. ショットを作成する

<EmbedDocument link="/ja/guides/production-structure/manage-shots/">
<!--@include: ../../guides/production-structure/manage-shots/index.md#setup-->
</EmbedDocument>

### 5. 次のステップ

- [チームを招待する](/ja/guides/team-management/managing-teams/#adding-users-to-a-production-team)
- [最初のタスクを割り当てる](/ja/guides/production/assign-tasks/)

## TV番組向けの機能

### 構造上のエンティティとしてのエピソード

TV番組制作でのみ、独立した組織レイヤーとしてエピソードが使用されます。ショットとアセットはエピソードごとに分けられ、ナビゲーションのドロップダウンから制作、エピソード、またはエンティティを切り替えられます。長編映画制作にはエピソードのレイヤーはなく、シーケンスとショットのみが存在します。

### CSVインポート時のエピソードフィールドの必須化

ショットやアセットを一括インポートする場合、エピソード列が必須になるのはTV番組制作のみです。長編映画のインポートでは必須ではありません。

### エピソード単位の進捗ビューとプレイリスト

進捗ダッシュボードとレビュー用プレイリストは、シーケンスではなくエピソードを単位として表示されます。プロデューサーは全エピソードの進捗状況を把握でき、外部のコラボレーターと1つのプレイリストを使ってエピソード全体のレビューを実施できます。（同等の長編映画向けページでは、同じ仕組みをエピソードではなくシーケンス単位で説明しています。つまり、基盤となるツールは同じで、エピソードを中心に整理されているだけです。）