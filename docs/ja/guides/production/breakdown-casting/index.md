---
path: "/ja/guides/production/breakdown-casting"
slug: "breakdown-casting"
published_at: 2026-09-10
---

# ブレークダウンとキャスティング

<!-- #region body -->

ブレークダウンを記入すると、ショットの組み立てに役立ちます。
ブレークダウンには、ショットを作成するために追加する必要があるアセットの詳細がすべて含まれるため、抜け漏れを防ぐことができます。

ドロップダウンメニューから **BREAKDOWN** を選択します。

![ブレークダウンのドロップダウンメニュー](/ja/img/getting-started/drop_down_menu_breakdown.png)

## ブレークダウンリストを作成する

<!-- #region setup -->

ブレークダウンページの左側には、エピソード／シーケンス／ショットのメニュー（1）があります。作成した項目から選択できます。画面の右側には、このプロダクション（メインパックとエピソード）で作成されたすべてのアセットがあります（3）。さらに、中央のセクションには、ショットに対する選択内容が表示されます（2）。

![ブレークダウンページ](/ja/img/getting-started/breakdown_general_empty.png)

ここで、キャスティングするショットを選択します。

まだサムネイルがない場合はアセットをテキストで表示したり、サムネイルのサイズを大きくしたりできます。

![テキスト表示のブレークダウンページ](/ja/img/getting-started/breakdown_text_display.png)

ブレークダウン中に、リストへアセットを追加する必要があることに気づく場合もあります。

ブレークダウンページから直接、新しいアセットを作成できます。**All available assets** の右側にある **+** をクリックします。

![アセット作成用のブレークダウンページ](/ja/img/getting-started/breakdown_create_asset.png)

複数のショットを一度に選択することもできます。最初のショットをクリックし、**Shift** キーを押したまま、選択範囲の最後のショットをクリックします。

![ブレークダウンページの一括選択](/ja/img/getting-started/breakdown_general_bulk_select.png)

次に、右側（3）から割り当てるアセット（キャラクター、背景など）をクリックします。
複数のショットを選択している場合、選択内容が複数のショットに適用されます。

アセットが入力されたショットをコピーし、そのアセット選択を別のショットに貼り付けます。

アセットの上にカーソルを置くと **+1** または **+10** が表示されます。これはそのアセットを追加する回数で、必要な回数だけクリックできます。

![ブレークダウンへのアセット追加](/ja/img/getting-started/breakdown_add_asset.png)

シーケンスやショットを指定せずに、TVショーのすべてのアセットをエピソードにリンクすることもできます。

![エピソードへのブレークダウンアセット](/ja/img/getting-started/breakdown_episode.png)

この方法で、ストーリーボード／アニマティックの段階に入る前に、すべてのアセットを1つまたは複数のエピソードにリンクできます。

これで、画面中央にアセットが表示されます（2）。アセット名の隣には、そのアセットが追加された回数が表示されます。この例では、キャラクターアセットの Llama を2回追加しています。


誤ってアセットを2回追加した場合は、画面中央のセクションに移動して、このショットのアセットを選択します（2）。そこから
**-1** をクリックします。このショットを終えたら、ほかのショットに進みます。
選択内容は自動的に保存されます。

![ブレークダウンからのアセット削除](/ja/img/getting-started/breakdown_remove_asset.png)

ストーリーボード中に新しいアセットを作成した場合は、アセットページ（ドロップダウンメニューを使用）に戻り、必要なアセットを作成します。以前に作成したタスクは、これらの新しいアセットにすぐに適用されます。ただし、割り当ては行う必要があります。その後、ブレークダウンを続けることができます。

これで、**Breakdown** ページは次のようになります。

![アセットを一括追加したブレークダウン](/ja/img/getting-started/breakdown_general_bulk_select_full.png)

アセットを組み立てたり、個別のパーツを管理したりする必要がある場合は、アセット用のブレークダウンリストを作成することもできます。

画面左上で、**FOR** の下にあるドロップダウンメニューから **asset** を選択します。

![ブレークダウンのアセットメニュー](/ja/img/getting-started/breakdown_asset_menu.png)

次に、2つ目のドロップダウンメニューからアセットの種類を選択できます：**Character**、**Environment**、**Props**、**FX** など。

![ブレークダウンのアセットタイプ](/ja/img/getting-started/breakdown_asset_menu_type.png)

ショットの場合と同じ方法で、アセットのブレークダウンページを完成させることができます。まず左側で1つ以上のアセットを選択し、次に右側の要素を追加します。

::: details CSVファイルからブレークダウンリストを作成する

すでにスプレッドシートファイルでブレークダウンリストを用意している場合があります。Kitsuでは、インポートする方法が2つあります。1つ目は .csv ファイルを直接インポートする方法、2つ目はデータをKitsuに直接コピー＆ペーストする方法です。

まず、Kitsuの推奨設定に従って、スプレッドシートを `.csv` ファイルとして保存します。

**import** ボタンをクリックします ![インポートボタン](/ja/img/getting-started/import.png)

**Import data from a CSV** ポップアップウィンドウが開きます。**Browse** をクリックして、`.csv` ファイルを選択します。

![ブレークダウンのCSVファイルインポート](/ja/img/getting-started/import_breakdown_csv_file.png)

結果を確認するには、**Preview** ボタンをクリックします。

データをプレビューして、列名を確認・調整できます。

注：**Episode** 列は、**TV Show** プロダクションの場合のみ必須です。

![ブレークダウンのインポートプレビュー](/ja/img/getting-started/import_breakdown_preview.png)

すべて問題なければ、**Confirm** ボタンをクリックしてデータをKitsuにインポートします。

これで、ブレークダウンがKitsuにインポートされました。

![ブレークダウンのインポートプレビュー](/ja/img/getting-started/breakdown_general_bulk_select_full.png)
:::

::: details スプレッドシートファイルをコピー／ペーストしてブレークダウンリストを作成する

スプレッドシートを開き、データを選択してコピーします。

![インポート用のデータコピー](/ja/img/getting-started/import_copypas_breakdown.png)

次に、Kitsuのブレークダウンページに戻り、**Import** アイコンをクリックします
![インポートアイコン](/ja/img/getting-started/import.png)。

**Import data from a CSV** ポップアップウィンドウが開くので、**Paste a CSV data** タブをクリックします。

![インポートデータのコピー＆ペーストタブ](/ja/img/getting-started//import_breakdown_csv_file.png)
 
先ほど選択したデータを貼り付け、**Preview** ボタンで結果を確認できます。
 
![インポートデータのコピー＆ペースト](/ja/img/getting-started/import_breakdown_preview.png)
 
データをプレビューして、列名を確認・調整できます。
 
注：**Episode** 列は、**TV Show** プロダクションの場合のみ必須です。
 
![インポートデータのコピー＆ペースト](/ja/img/getting-started/import_breakdown_preview.png)

すべて問題なければ、**Confirm** ボタンをクリックしてデータをKitsuにインポートします。

これで、すべてのアセットがKitsuにインポートされました。

![インポートデータのコピー＆ペースト](/ja/img/getting-started/breakdown_general_bulk_select_full.png)
:::

<!-- #endregion setup -->

## アセットライブラリからキャスティングする

グローバルな **Asset Library** からプロダクションにアセットをキャスティングすることもできます。これにより、プロダクションごとにアセットを作り直すことなく、既存のアセットをキャスティングできます。

![アセットライブラリの表示](/ja/img/getting-started/asset_library_display.png)

アセットライブラリから、プロダクション外のアセットを表示するには、**Display Library** ボタン（1）をクリックします。

グローバルアセットライブラリのアセットが表示され、黄色の枠線で強調表示されます（2）。その後、ほかのアセットとまったく同じように、ブレークダウンでキャスティングできます。

![アセットライブラリの表示](/ja/img/getting-started/asset_library_view.png)

プロダクションのアセットページに戻ると、**Display Library** ボタン（1）を切り替えることで、プロダクションにキャスティングされたグローバルアセットを表示できます。これらのアセットは黄色で強調表示され、現在のプロダクションではなくグローバルアセットライブラリに由来することが示されます（2）。

アセットライブラリの詳細については、[専用セクションをご覧ください](/ja/guides/production/manage-assets/#asset-library)。

<!-- #endregion body -->