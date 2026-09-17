---
path: "/ja/guides/team-management/managing-teams"
slug: "managing-teams"
published_at: 2026-09-10
---

# チームの管理

<iframe width="560" height="315" src="https://www.youtube.com/embed/sUs-wPbpYF8?si=yjbC8MGdrA2-a1QJ" title="YouTube動画プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<!-- #region body -->

ユーザー向けのライブラリには、次の2種類があります。
- **Peopleページ**（グローバルライブラリ）は、ユーザーの権限、契約、所属部署を決定するために使用します。
- **Teamページ**（プロダクションライブラリ）は、プロジェクトで作業するユーザーを定義し、プロダクションへのアクセス権を付与するために使用します。

## ユーザーの作成

<!-- #region setup -->

タスクをユーザーに割り当てるには、まずKitsuでユーザーのアカウントを作成する必要があります。

**メインナビゲーションメニュー**に移動し、**STUDIO**セクションの下にある**People**ページを選択します。

![Peopleメニュー](/ja/guides/team-management/managing-teams/screenshots/001.png)

Peopleページが表示されます。ここでチームを管理できます。

![Peopleページ](/ja/guides/team-management/managing-teams/screenshots/002.png)

次に、右上隅にある`Add a new user`ボタンをクリックして、作成モーダルを開きます。

![新しいユーザーを作成](/ja/guides/team-management/managing-teams/screenshots/003.png)

次の情報を入力するよう求められます（ユーザーを作成するには、一部のフィールドが必須であることに注意してください）。
- 1) 名（**必須**）
- 2) 姓
- 3) メールアドレス（**必須**）
- 4) 電話番号

::: danger 重要！
アカウントを作成するには、メールアドレスが**必須**であり、一意でなければなりません。
:::

![新しいユーザーを作成](/ja/guides/team-management/managing-teams/screenshots/010.png)

- 5) ユーザーを紐付ける**部署**を1つまたは複数指定できます。

部署に割り当てられると、**My Checks**ページに表示される内容にも影響し、自分の部署に関連するタスクのみが表示されます。

最後に、タイムシートページにも自分の部署内のタスクのみが表示されるようになります。

ユーザーを部署に紐付けると、そのユーザーが利用できるさまざまなオプションが表示されます。たとえば、グローバルホームページから所属部署のビューに直接アクセスできるようになります。

部署のスーパーバイザーは、その部署内のすべてのタスクにコメントでき、同じ部署に所属するユーザーにのみタスクを割り当てられるようになります。

![部署でフィルタリングされたビュー](/ja/img/getting-started/department_filtered_view.png)

- 6) Role：ここでは、ユーザーの権限ロールを定義します。さまざまなロールの詳細については、[ユーザー権限ロールのドキュメント](/ja/guides/team-management/team-roles/)を参照してください。

- 7) Active

このセクションでは、ユーザーをすぐに有効化するかどうかを選択できます。ユーザーにKitsuへの即時アクセスを許可する必要がある場合は、これを**yes**に設定します。ただし、ユーザーを作成しても、Kitsuへのアクセスをまだ許可する準備ができていない場合があります（たとえば、2週間後に作業を開始する予定のアーティストにタスクをスケジュールしたい場合など）。この場合は、ユーザーを作成してスケジュールを設定し、作業開始時に有効化するだけで済みます。

::: danger 重要！
Kitsuにログインするには、ユーザーごとに個別のアカウントが必要です。
:::

<!-- #endregion setup -->

## プロダクションチームへのユーザーの追加

<!-- #region addusers -->

プロダクションを作成したら、ユーザーがアクセスできるように、プロダクションのチームにユーザーを追加する必要があります。

チームに所属すると、タスクを割り当ててもらうこともできます。

::: tip
Studio Managerロールに読み取り権限を付与するために、そのロールをチームに追加する必要はありません（このロールはもともとアクセス権を持っているため）。ただし、そのユーザーにタスクを割り当てたい場合は、チームに追加する必要があります。
:::

チームにユーザーを追加するには、プロジェクト内でページ上部にある**ナビゲーション**ドロップダウンメニューを使用し、**TEAM**ページを選択します。

![チームのドロップダウンメニュー](/ja/guides/team-management/managing-teams/screenshots/017.png)

**Team**ページでは、このプロジェクトに割り当てられているすべてのユーザーを確認できます。新しくプロジェクトを作成したばかりの場合、このページは空になります。ページ上部のドロップダウンメニューでプロジェクト名を選択すると、別のプロジェクトのチームページにすばやく切り替えることもできます。

![Teamページ](/ja/guides/team-management/managing-teams/screenshots/018.png)

::: warning
権限と部署は**Studioレベル**で設定されます。プロダクションレベルでは変更できません。
:::

<!-- #endregion addusers -->

## チームからのユーザーの削除

プロダクションからユーザーを削除するには、`Production Menu > Team`に移動し、該当するユーザーの行にカーソルを合わせて、`Remove`ボタンをクリックします。

![チームからユーザーを削除](/ja/guides/team-management/managing-teams/screenshots/020.png)

ユーザーを部署から削除するには、`Main Menu > Studio > People`ページを使用します。対象ユーザーの`Edit`ボタンをクリックし、部署セクションでユーザーを削除したい部署をクリックします。

## ユーザーの削除

ユーザーを削除するには、まずStudioの`People`ページでステータスを`Inactive`に変更する必要があります。

![非アクティブなユーザーに変更](/ja/guides/team-management/managing-teams/screenshots/028.png)

次に、`Inactive`タブに移動し、削除するユーザーにカーソルを合わせて、`Delete`アイコンをクリックします。

![非アクティブなユーザーを削除](/ja/guides/team-management/managing-teams/screenshots/031.png)

<!-- #endregion body -->