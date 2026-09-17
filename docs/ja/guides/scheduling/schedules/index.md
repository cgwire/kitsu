---
path: "/ja/guides/scheduling/schedules"
slug: "schedules"
published_at: 2026-09-10
---

# スケジュール

<!-- #region body -->

## スタジオスケジュール

プロダクションマネージャーは、すべてのプロダクションスケジュールを1か所に集約したスタジオスケジュールにアクセスできます。これにより、プロダクションの準備をより適切に行えます。

スタジオスケジュールにアクセスするには、メインメニュー（![メインメニューボタン](/ja/img/getting-started/main_button.png)）を開き、**Studio** セクションの **Main Schedule** をクリックします。

![メインメニューのスケジュール](/ja/img/getting-started/main_menu_schedule.png)

ここでは、すべてのプロダクションが各行に一覧表示され、開始日と終了日も確認できます。また、指定した期間内で各プロダクションに予定されている日数も確認できます。さらに、各プロダクションに定義したマイルストーンも表示されます。

![メインメニューのスケジュール](/ja/img/getting-started/main_schedule_fold.png)

プロダクション名をクリックすると、表示を展開して各タスクタイプの詳細を確認できます。色分けはグローバルページの列に対応しています。

複数のプロダクションを展開すると、どのチームが同時に利用されているかを確認できます。

![メインメニューのスケジュール](/ja/img/getting-started/main_schedule_unfold.png)

このページからプロダクションスケジュールを直接変更することはできません。調整するには、変更したい特定のプロダクションスケジュールページに戻る必要があります。

このページにアクセスできるのは **Studio Manager** のみです。

## プロダクションスケジュール

Studio Manager は、グローバルスケジュールをプロダクションの参照用として使用できます。このスケジュールの主な目的は、契約に紐づくマイルストーンを追跡することです。これは **Reference Schedule** と呼ばれます。

グローバルスケジュールへの入力を開始するには、プロダクションにアセットとショットを追加し、タスクタイプを定義する必要があります。

ドロップダウンメニューから **SCHEDULE** を選択します。

![メニュースケジュール](/ja/img/getting-started/menu_schedule.png)

### ガントスケジュール

スケジュールの上部には、プロダクションの作成時に定義したプロジェクトの開始日（1）と終了日（2）が表示されます。ボックスをクリックしてカレンダーを開き、日付を選択することで、これらの日付を変更できます。

![プロダクションスケジュール](/ja/img/getting-started/production_schedule.png)

ガントスケジュール上で、各タスクタイプの開始日と終了日を変更する方法は2つあります。1つ目はバーを直接移動する方法で、2つ目はタスクタイプセクションの設定ページで日付を入力する方法です。

前者の場合は、開始日または終了日にカーソルを合わせます。カーソルが両矢印に変わったら、目的の日付までドラッグして移動します。このクリック＆ドラッグ操作は Kitsu のガントチャート全体で使用されるため、個々のタスクをスケジュールするときにも再び登場します。

![プロダクションスケジュールのガント](/ja/img/getting-started/schedule_production_task_type.png)

タスクタイプの開始日と終了日を設定すると、プロダクションの進行状況を一目で確認できるようになります。

::: tip
すべてのガントチャートバーを選択し、**CTRL / CMD** + **左クリック** で同時に移動できます。
:::

![入力済みのプロダクションスケジュールのガント](/ja/img/getting-started/production_schedule_task_type_complete.png)

これが完了したら、次のステップは各タスクタイプを展開し、関連するショットシーケンス / アセットタイプを表示することです。

![タスクタイプを展開したプロダクションスケジュール](/ja/img/getting-started/production_schedule_unfold.png)

タスクタイプの場合と同じ方法で、開始日と終了日を設定できます。また、すべてのアセットタイプの作業期間を定義することもできます。

![アセットを含むプロダクションスケジュールのタスクタイプ](/ja/img/getting-started/production_schedule_task_type_detail.png)

ショットのタスクタイプについても同様に操作し、シーケンスの開始日と終了日を決定できます。

![シーケンスを含むプロダクションスケジュールのタスクタイプ](/ja/img/getting-started/production_schedule_task_type_detail_sequence.png)

### マイルストーン

マイルストーンとは、プロジェクトにおける重要な時点であり、主要なフェーズやタスクの完了を示すとともに、進捗を評価するためのチェックポイントとして機能します。スケジュール上の日付にカーソルを合わせると、![プロダクションスケジュールにマイルストーンを追加するロゴ](/ja/img/getting-started/production_schedule_add_milestone_plus.png) が表示されます。

![プロダクションスケジュールにマイルストーンを追加](/ja/img/getting-started/production_schedule_add_milestone.png)

クリックすると、新しく作成するマイルストーンの名前を入力するよう求められます。

![プロダクションスケジュールのマイルストーン名](/ja/img/getting-started/production_schedule_add_milestone_name.png)

マイルストーンは、日付上の小さな黒い点と、スケジュール上の垂直線で表されます。小さな黒い点にカーソルを合わせると、マイルストーンの名前が表示されます。

これは、プロダクションのスケジュール上で、今後予定されている重要な日付や納品物をすばやく参照するのに便利です。

![マイルストーンを含むプロダクションスケジュールのグローバルビュー](/ja/img/getting-started/production_schedule_milestone.png)

マイルストーンを編集するには、![編集ボタン](/ja/img/getting-started/edit_button.png) またはマイルストーン名の任意の場所をクリックします。そこから、マイルストーンの名前変更や削除ができます。

![プロダクションスケジュールのマイルストーンを編集](/ja/img/getting-started/production_schedule_edit_milestone.png)

プロダクションに割り当てられている全員がグローバルスケジュールページにアクセスできますが、変更できるのは **Studio Manager** のみです。

特定のタスクをより詳しく表示するには、タスクタイプの名前をクリックします。タスクタイプページの **Schedule** タブに移動します。

## チームスケジュール

<!-- #region team-schedule -->

スタジオマネージャーにとって、チームの活動状況を把握しておくことは重要です。Team Schedule では、各部門の活動を包括的に確認できます。

Team Schedule にアクセスするには、メインメニュー（![メインメニューボタン](/ja/img/getting-started/main_button.png)）を開き、**Studio** セクションの **Team Schedule** をクリックします。

![チームメニューのスケジュール](/ja/img/getting-started/main_menu_teamschedule.png)

Team Schedule では、各行にスタジオ内の全スタッフが一覧表示されます。

ページ上部では、**Start Date** と **End Date** を選択して表示期間を調整でき、さらに詳細な表示または広範囲の表示にするために **Zoom Level** を調整できます。

また、特定の **Department** や個人の **Person** に絞り込むこともできます。

![チームスケジュールのグローバルビュー](/ja/img/getting-started/team_schedule_global.png)

アーティストに複数のタスクが同時に割り当てられている場合、わかりやすいようにタスクが上下に積み重ねて表示されます。

各タスクを選択して必要に応じて移動できます。これらのタスクは **task type schedule** に直接リンクされ、両方の場所で編集できます。

### 部門のスケジュールを管理する

Supervisor は、メインメニューの **Studio > Team Schedule** セクションから、同じ方法でチームのスケジュールにアクセスできます。このページでは、現在の部門でプロジェクトに取り組んでいるすべてのアーティストを確認できます。人物のスケジュールを展開すると、そのタスクの詳細を表示できます。

ここでは、次の操作ができます。
- タスクを移動して開始日と期限日を変更する。
- タスクの長さを調整する。
- タスクをドラッグ＆ドロップして、別のチームメンバーに再割り当てする。
- 休暇日を確認する。

![チームスケジュールのグローバルビュー](/ja/img/getting-started/team_schedule_global.png)

<!-- #endregion team-schedule -->

## タスクタイプスケジュール

**Global Schedule** がプロダクション全体のタスクタイプを参照するために使用されるのに対し、**Task Type** ページでは、特定のタスクタイプに含まれるタスクの詳細を確認できます。

![タスクタイプページ](/ja/img/getting-started/global_view_asset_task_export.png)

このページには、**Tasks**、**Schedule**、**Estimation** の3つのタブがあります。

![タスクタイプのスケジュールタブ](/ja/img/getting-started/task_type_tab_schedule.png)

アーティストのスケジュールを設定する方法は2つあります。

1つ目の方法は **Tasks** タブを使用し、**Estimated Time** と **Start Date** を設定する方法です。

前述のとおり、これらを両方設定すると **Due Date** が自動的に入力されます。これらの詳細を入力すると、**Schedule** タブのガントチャートが自動的に生成されます。

::: tip
ガントチャートではクリック＆ドラッグして開始日 / 終了日を変更できますが、タスクの期間は終了日と期間を使用して常に自動計算されます。
:::

2つ目の方法は、ガントチャートから長さを直接（**Estimate**）、**Start Date**、**Due Date** として設定する方法です。

![タスクタイプページのデフォルトスケジュール](/ja/img/getting-started/task_type_schedule_emplty.png)

これまでと同様に、開始日にカーソルを合わせ、両矢印に変わったらドラッグして調整します。**MD** に入力して **Due date** を定義します。

検索バー（1）を使用すると、特定のタスクセットに絞り込めます。たとえば、**status**、**asset type**、**sequence**、**asset name**、**shot name**、**artist name** で検索できます。（すでに特定のタスクタイプページを表示しているため、タスクタイプの名前を追加する必要はありません）

各アーティスト（2）のセクションを展開または折りたたむことで、スケジュールを読みやすくすることもできます。

ガントチャート（3）でバーの色を変更できます。デフォルトでは、色は Status Color に設定されています。

![タスクタイプページのスケジュールの色分け](/ja/img/getting-started/task_type_schedule_coloring.png)

**Status color** は、ステータスに応じてバーの色を変更します。たとえば、青は **WIP**、赤は **RETAKE**、紫は **WAITING FOR APPROVAL**、緑は **DONE** を表します。

![ステータスによるタスクタイプページのスケジュールの色分け](/ja/img/getting-started/task_type_schedule_coloring_status.png)

要素とチームのステータスをすばやく評価できます。このビューでは、スケジュールに遅れがあるタスクを視覚的に特定できます。

**Coloring** ドロップダウンから **late in red** を選択します。このビューでは、期限日を過ぎているものの、まだ承認されていないタスクが強調表示されます。これはスケジュールに遅れがあることを示し、ガントチャート上では赤で表示されます。

![タスクタイプページのスケジュールで遅延を赤色表示](/ja/img/getting-started/task_type_schedule_coloring_late.png)

ガントチャートで行った変更は、Kitsu の他のページにも反映されます。

**Start date** と **Due date** は、タスクタイプページの **Tasks** タブに表示されます。

![タスクタイプページのスケジュールの期限日](/ja/img/getting-started/task_type_schedule_due_date.png)

また、アーティストの **Todo Page** で **Due date** と **Estimation** の日数を確認できます。

![タスクタイプページのスケジュールのアーティストの期限日](/ja/img/getting-started/my_task_page.png)

グローバルスケジュールと同様に、このページは全員が閲覧できますが、変更できるのは **Studio Manager** のみです。

## アセットとショットのスケジュール

アセットまたはショットの詳細ページで、**Schedule** タブにアクセスできます。

![アセット詳細のスケジュール](/ja/img/getting-started/asset_detail_page_schedule.png)

**Task Type** スケジュールで開始日と期限日を入力している場合、ガントバーが表示されます。

このページから、アセットまたはショット内の各タスクの長さ、開始日、終了日を変更できます。

<!-- #endregion body -->