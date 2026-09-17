---
path: "/ja/guides/review-publishing/manage-edits"
slug: "manage-edits"
published_at: 2026-09-10
---

# 編集の管理

<!-- #region body -->

Edit は、ビデオ編集を表す追跡可能なエンティティタイプです（Asset や Shot など）。たとえば、映画全体、複数のトレーラー、First Edit、Fine Edit、Mix などの異なるカットバージョンを表します。

用途：

- 複数の編集をいくつかの検証ステップ（例：First Edit → Fine Edit → Mix）に進める必要がある場合に、Edit レベルでタスクを追跡する
- アセットやショットと同様に、各 Edit にタスクを割り当て、レビューを行い、ステータスを変更する
- カスタムメタデータ列と説明を追加する
- 納品要件に応じて、Edit ごとに解像度を設定・変更する

## Edit を作成する

<!-- #region setup -->


::: warning
デフォルトでは、**Production Library**（設定ページ）に Edit 用のタスクタイプが登録されるまで、**Edit** ページは表示されません
:::

このページを使用するには、まず **Edit** 属性を持つ専用のタスクタイプを **Global Library** に作成する必要があります。

新しい **Task Type** を作成するには、[新しいタスクタイプを作成する](/ja/guides/task-configuration/managing-task-types/#creating-a-new-task-type)セクションを参照してください。

**Global Library** に **Task Types**  を作成したら、それらを **Production Library** に追加します。ナビゲーションのドロップダウンメニューに **Edit** が表示されます。

![ナビゲーション Edit](/ja/img/getting-started/drop_down_menu_edit.png)

この新しいページは、アセットとショットのグローバルページと同じように動作します。`+ New edit` ボタンで編集を追加できます。

タスクの割り当て、レビュー、ステータスの変更などを行えます。

メタデータ列の追加、説明の入力なども可能です。

::: tip
納品内容に応じて、**Edit** ごとに解像度を変更することもできます。
:::

::: warning
詳細ページは、他のエンティティとは異なります。

**Edit** は特定の長いビデオに焦点を当てているため、詳細ページはコメント詳細ページに近い見た目になっています。
:::

このページでは、アセットおよびショットエンティティと同様に、Edit エンティティの**名前変更**と**削除**を行えます。

<!-- #endregion setup -->

## Edit を更新する

TODO

## Edit を削除する

TODO

<!-- #endregion body -->

