---
path: "/ja/guides/review-publishing/publish"
slug: "publish"
published_at: 2026-09-10
---

# パブリッシュ

<!-- #region body -->

パイプラインにおいて、パブリッシュとは、特定のタスクに紐付いた、追跡可能な成果物として作業のバージョンを提出することを意味します。これにより、パイプラインの他の部分からレビュー、バージョン管理、参照が可能になります。

Kitsuでは、リビジョンをパブリッシュすることは、タスクのステータスを更新するもう一つの方法です。コメントとの違いは、パブリケーションがバージョン管理されたプレビューファイルに紐付いていることです。

## コンセプトのパブリッシュ

**Concepts**ページを開くには、プロジェクトのナビゲーションメニューから移動します。

![Concept Menu](/ja/img/getting-started/menu_concept.png)

コンセプトをアップロードするには、**Add a new reference to concepts**ボタンをクリックします。1つまたは複数のコンセプトを同時にアップロードできます。

![Concept empty page](/ja/img/getting-started/concept_empty_prod.png)

アップロードが完了すると、プレビューが生成され、コンセプトページから確認できるようになります。

![Concept filled page](/ja/img/getting-started/concept_filled_prod.png)

サムネイルをクリックするとコンセプトの拡大プレビューを表示できます。また、ステータスをクリックすると右側に**Comment Panel**が開きます。

コメントパネルを開くと、次の2つの操作ができます。

1) コンセプトを既存のアセットにリンクする／既存のリンクを削除する。
2) コンセプトにコメントし、ステータスを変更する。

**Concept**ごとに1つのバージョンだけを保持することをおすすめします。コンセプトが承認されず、追加の変更が必要な場合は、そのコンセプトのバージョンを更新する方がよいでしょう。

![Concept options](/ja/img/getting-started/concept_options.png)

## プレビューをバージョンとしてパブリッシュする

プレビュー、画像、または動画をパブリッシュするには、タスクのコメントパネルを開き、**PUBLISH REVISION**タブを選択します。

**IS FEEDBACK REQUEST**オプションが有効なステータス（**WFA**ステータスなど）を使用すると、Kitsuは自動的に**Publish Revision**タブに切り替わります。

![Publish Revision](/ja/img/getting-started/publish_revision.png)

コメントには1つまたは複数のプレビューを追加できます。画像（`.png`、`.jpg`、`.jpeg`、`.gif`）、動画（`.mp4`、`.mov`、`.wmv`）、または`.glb`ファイルを追加できます。また、ブラウザからすべてのプレビューを確認したり、すべてを組み合わせたりすることもできます。

`.glb`ファイルをワイヤーフレームとして確認したり、ライティングを確認するために`.HDR`ファイルを追加したりすることもできます。詳しくは**Customization**セクションを参照してください。

[Pipeline Customization](../../../configure-kitsu/index.md#3d-backgrounds)

`.pdf`、`.zip`、`.rar`、`.ma`、`.mb`などのその他のファイルはブラウザで表示できないため、レビューするにはダウンロードする必要があります。

次に、**Add preview revision to publish**ボタンをクリックします。エクスプローラーが開き、ファイルまたは複数のファイルを選択できます。

![Attach Preview](/ja/img/getting-started/attach_preview.png)

また、最初にダウンロードする必要なく、クリップボードから**スクリーンショットをコピー＆ペースト**して、このアップロードダイアログに貼り付けることもできます。ファイルを選択すると、**Add files to publish**ボタンの近くにファイル名が表示されます。

![Attach Preview Filled](/ja/img/getting-started/attach_preview_filled.png)

アップロードしたいファイルをコメントセクションに**ドラッグ＆ドロップ**すると、自動的にアップロードを開始することもできます。

![Attach Preview Drag Drop](/ja/img/getting-started/drag_drop_preview.png)

プレビューに**Comment**を追加できます。**Leave a Comment**ボタンをクリックすると、コメントセクションが展開されます。

![Add a comment to a Publish](/ja/img/getting-started/publish_revision_comment.png)

その後、ステータスを選択し、**Post**ボタンでプレビューをパブリッシュできます。

パブリッシュをサムネイルとして使用する方法について詳しくは、[サムネイルに関するこちらのセクション](../../../thumbnails/index.md)を参照してください。

## プレビューを1つのバージョンにまとめる

複数の画像を同時に追加できます。また、画像をアップロードした後で別の画像を追加することもできます。

![Upload Several Pictures](/ja/img/getting-started/upload_several_pictures.png)

**Add preview**ポップアップでファイルを選択します。アップロードした画像を移動して確認できます。

数字をクリックしてからドラッグ＆ドロップすると、プレビューの順序を変更できます。

![Preview Drag Drop](/ja/img/getting-started/multiple_preview.png)

追加したプレビューを削除するには、コメントパネルを拡大し、バージョン数をクリックしてから、![Delete Button](/ja/img/getting-started/delete_button.png)をクリックします。

![Enlarge Comment Section Delete](/ja/img/getting-started/enlarge_comment_delete.png)

## プレビューを削除する

プレビューを削除するには、関連付けられたコメントを削除します。

<!-- #endregion body -->

