---
path: "/ja/start-here/getting-started"
slug: "getting-started"
published_at: 2026-09-10
prev: false
next: false
---

<script setup>
import EmbedCard from '../../../.vitepress/theme/EmbedCard.vue'
</script>

# Kitsu を始める

<iframe width="560" height="315" src="https://www.youtube.com/embed/iP5fp-x_7VA?si=F6Q89meflNHBaBM6" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## はじめに

Kitsu は、2D・3D 制作、VFX、ビデオゲームなどの分野で活動するスタジオ向けに構築された制作進行管理ツールです。1 枚の静止画広告から、3 時間におよぶ長編映画まで、あらゆる規模の制作に柔軟に対応できます。

このページでは、Kitsu でスタジオを立ち上げて運用できる状態にするために必要な手順を、次の順番で説明します。

1. [Kitsu の一般設定](#_1-general-kitsu-settings)：ロゴ、勤務時間、チャット連携など、スタジオ全体に関わる設定を行います
2. [スタジオのワークフロー](#_2-studio-workflows)：スタジオ内での作業の進め方を定義するタスクタイプ、ステータス、ライブラリを設定します
3. [チームの準備](#_3-preparing-your-team)：ユーザーを招待し、部署に割り当て、権限を付与します
4. [新しい制作を作成する](#_5-create-a-new-production)：さまざまな制作タイプ（テレビ番組、長編映画、短編、ビデオゲームなど）向けのクイックスタートガイドと、制作にチームメンバーを追加する方法を紹介します
5. [次のステップ](#_6-next-steps)：スーパーバイザー、プロデューサー、アーティスト、クライアント、開発者をオンボーディングするための役割別ハンドブックを紹介します

このページを終える頃には、設定済みのスタジオ、オンボーディング済みのチーム、そして最初の制作を開始するための明確な道筋が整っているはずです。

## 1. Kitsu の一般設定

まず、スタジオの文化に合うように Kitsu の環境をカスタマイズしましょう。

左上の `Main Menu` ボタンをクリックし、`Admin` セクションから `Settings` ページをクリックします。

![メインメニューボタン](/ja/start-here/getting-started/screenshots/002.png)

このページには、すべての制作に影響するグローバル設定が一覧表示されます。

![Kitsu の設定](/ja/start-here/getting-started/screenshots/003.png)

1. **Set studio logo** ボタンをクリックし、Kitsu のロゴと置き換える画像を選択します
2. Kitsu の環境で使用する **Studio Name** を変更します
3. スケジュール作成とレポートに使用する、1 日あたりの勤務時間を設定します

Preferences セクションは、好みに応じて設定します。

1. ダウンロード時に自動生成された名前ではなく、元のファイル名を使用できます
1. インターネット接続が非常に高速な場合は、デフォルトで画像を HD 品質で表示できます
1. 1 週間より前のタイムシートをアーティストが変更できないように制限することもできます
1. 日によって勤務時間が異なる場合は、期間を日数ではなく時間で表示できます
1. デフォルトでダークテーマまたはライトテーマを有効にできます

最後に、さまざまなチャット連携に関するセクションもあります。設定方法の詳細については、開発者向けドキュメントの [Chat Integration](https://dev.kitsu.cloud/integrations/messaging/slack/) ページを参照してください。

![Kitsu のチャット連携](/ja/start-here/getting-started/screenshots/004.png)

::: warning
完了したら、最後に必ず **Save Settings** をクリックしてください。
:::

## 2. スタジオのワークフロー

次に、スタジオ内で作業がどのように進行するかを定義します。

### スタジオワークフローを理解する

::: info Definition
**ワークフロー**：制作における業務プロセスを構成するタスクを、体系的に調整する仕組みです。たとえば CGI 制作では、アセットはモデリング、リギング、シェーディングなど、一連のタスクを通過します。

制作の **ワークフロー** は、[タスクタイプ](/ja/guides/task-configuration/managing-task-types/) と [タスクステータス](/ja/guides/task-configuration/managing-task-statuses/) の組み合わせです。
:::

::: info Definition
**タスクタイプ**：モデリングやシェーディングなど、プロセスのカテゴリ
:::

::: info Definition
**エンティティ**：アセットやショットなど、個々のオブジェクト
:::

::: info Definition
**タスク**：実行する必要がある具体的なアクションまたは作業。タスクはエンティティに紐付けられ、タスクタイプによって分類されます。その後、各タスクはアーティストに割り当てられます。
:::

タスクのワークフローを定義したら、次は **承認ワークフロー** を設定します。これは、チーム内のコミュニケーションに使用するすべてのタスクステータスを定義するものです。タスクステータスは、制作の進捗を追跡します。

::: info Definition
**タスクステータス**：レビューおよび承認ワークフローの一部として、タスクが通過する特定の段階または状態。例：Ready To Start、Work In Progress、Waiting For Approval、Retake、Done。
:::

アセットのワークフロー（例：モデリング、シェーディング、リギング）を定義できるのと同じように、ショットやシーケンスなどのワークフローも定義できます。

![](/ja/img/getting-started/task_type_empty.png)

ライブラリとは、ワークフローを構成する再利用可能な制作要素の集合です。部署、タスクタイプ、タスクステータス、アセットタイプなどを一度設定しておき、毎回ゼロから作り直すのではなく、プロジェクト全体に適用できます。

### グローバルライブラリと制作ライブラリ

Kitsu には 2 種類のライブラリがあります。

| ライブラリ | アクセス権 | 目的 |
|---|---|---|
| **グローバルライブラリ** | スタジオマネージャーのみ | 部署、タスクタイプ、タスクステータス、アセットタイプ、ステータス自動化のスタジオ全体における共通ソース |
| **制作ライブラリ** | 制作ごと | グローバルライブラリから要素を選択して追加 |

この分離により、必要に応じて制作ごとに独自のワークフローを設定できます。

まず、グローバルライブラリを設定します。

<EmbedCard title="1. 部署の設定" link="/ja/guides/team-management/managing-departments#setup">
<!--@include: ../../guides/team-management/managing-departments/index.md#setup-->
</EmbedCard>

<EmbedCard title="2. タスクタイプの設定">
<!--@include: ../../guides/task-configuration/managing-task-types/index.md#setup-->
</EmbedCard>

<EmbedCard title="3. タスクステータスの設定">
<!--@include: ../../guides/task-configuration/managing-task-statuses/index.md#setup-->
</EmbedCard>

<EmbedCard title="4. アセットタイプの設定">
<!--@include: ../../guides/production/managing-asset-types/index.md#setup-->
</EmbedCard>

<EmbedCard title="5. ステータス自動化の設定">
<!--@include: ../../guides/task-configuration/status-automation/index.md#setup-->
</EmbedCard>

後で最初の制作を作成するときに、**グローバルライブラリ**の要素を使って **制作ライブラリ**を設定します。

## 3. チームの準備

スタジオのワークフローを定義できたので、次はタスクを割り当てるためのチームを整えます。

Kitsu にユーザーを招待し、部署に紐付け、権限を付与する方法を学びます。

<EmbedCard title="ユーザーの追加と招待">
<!--@include: ../../guides/team-management/managing-teams/index.md#setup-->
</EmbedCard>

最初の制作を作成する際には、チームメンバーがタスクに取り組めるよう、制作チームにメンバーを追加する方法も学びます。

## 4. 新しい制作を作成する

グローバルワークフローの設計とメンバーの招待が完了したので、次は制作を作成します。

- [テレビ番組向けクイックスタート](/ja/recipes/for-tvshows/)
- [長編映画向けクイックスタート](/ja/recipes/for-feature-films/)
- [短編向けクイックスタート](/ja/recipes/for-shorts/)
- [ビデオゲーム向けクイックスタート](/ja/recipes/for-videogames/)
- [ショットのみの制作向けクイックスタート](/ja/recipes/shots-only-productions/)
- [アセットのみの制作向けクイックスタート](/ja/recipes/assets-only-productions/)

最後の設定手順は、スタジオのチームメンバーを制作に追加することです。

<EmbedCard title="制作チームへのユーザー追加">
<!--@include: ../../guides/team-management/managing-teams/index.md#addusers-->
</EmbedCard>

## 5. 次のステップ

- [チームの役割について](/ja/guides/team-management/team-roles/) - Kitsu で利用できるさまざまなチームの役割と、それぞれに対応する権限の概要。
- [スーパーバイザー向け Kitsu](/ja/handbooks/for-supervisors/) - スーパーバイザー向けの主なワークフロー一覧。
- [プロデューサー向け Kitsu](/ja/handbooks/for-producers/) - プロデューサー向けの主なワークフロー一覧。
- [アーティスト向け Kitsu](/ja/handbooks/for-artists/) - アーティスト向けの主なワークフロー一覧。
- [クライアント向け Kitsu](/ja/handbooks/for-clients/) - クライアント向けの主なワークフロー一覧。
- [開発者向け Kitsu](https://dev.kitsu.cloud/) - 開発者向けリソース一覧。