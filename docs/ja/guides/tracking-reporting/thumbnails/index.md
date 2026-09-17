---
path: "/ja/guides/tracking-reporting/thumbnails"
slug: "thumbnails"
published_at: 2026-09-10
---

# サムネイル

<!-- #region body -->

サムネイルとは、ショットやアセットなどのエンティティに添付される小さなプレビュー画像です。

完全なファイルを開かなくても、アーティストや制作スタッフがエンティティをひと目で識別できるよう、視覚的な参照をすばやく提供します。

## サムネイルを手動で追加する

プレビューをサムネイルとして設定するには、プレビューがリビジョンとしてアップロードされている必要があります。

リストページで目的のステータスをクリックし、右側のパネルにある **Preview** ボタン（1）をクリックします。

![サムネイルボタン](/ja/img/getting-started/pannel_history.png)

ボタンをクリックすると、最初のフレームまたは任意のフレームを選択できます。フレームを選択するとサムネイルが表示され、ボタンが灰色になります。

![サムネイル適用後](/ja/img/getting-started/pannel_history_thumbnail.png)


## サムネイルを自動的に追加する

サムネイルを自動的に設定したい場合は、ナビゲーションメニューから制作の設定ページに移動します。

![設定メニュー](/ja/img/getting-started/drop_down_menu_setting.png)

**Parameters** タブで、**set new preview as entity thumbnail automatically** を選択します。

![プレビューの自動設定](/ja/img/getting-started/setting_preview_auto.png)

完了したら、変更を **Save** することを忘れないでください。これで、プレビューをアップロードするとすぐに、自動的にサムネイルとして使用されます。

## プレビューを一括アップロードする（サムネイルとして）

グローバルページにある **Add Thumbnails** ボタン ![サムネイル追加ボタン](/ja/img/getting-started/add_thumbnails.png) を使用して、サムネイルを一括でインポートします。

![履歴](/ja/img/getting-started/add_thumbnails_menu.png)

新しいポップアップが開き、サムネイルを紐付けるタスクタイプを選択するよう求められます。

**サムネイルの一括インポートでは、画像ファイルと動画ファイルを使用できます**。動画ファイルの場合、サムネイルには最初のフレームのみが使用されます。

サムネイルを正しいショットに自動的に紐付けるには、サムネイルの名前を sequence_shot の形式にする必要があります。

たとえば、シーケンス名が `SEQ_001` でショット名が `SH_001` の場合、サムネイルのファイル名は `SEQ_001_SH_001` にします。

<!-- #endregion body -->

