# チャットの統合

## Discordの統合

### ボットアカウントの作成

1. [Discordウェブサイト](https://discord.com/)にログインしていることを確認してください。
2. [アプリケーションページ](https://discord.com/developers/applications)に移動します。
3. 「新規アプリケーション」ボタンをクリックします。
4. アプリケーションに名前を付け（例：「Kitsu」）、「作成」をクリックします。

![アプリケーションの作成](../img/discord/create_application.png)

5. 「Bot」タブに移動し、「Add Bot」をクリックして、Botユーザーを作成します。
「Yes, do it!」をクリックして続行します。

![ボットの作成](../img/discord/create_bot_user.png)

6. 「Username」の隣にあるアイコンをクリックすると、ボットのアイコンを追加できます。このアイコンはボットがチャットを行う際に使用されます。

7. 他のユーザーにボットを招待してもらいたい場合は、「Public Bot」にチェックが入っていることを確認してください。

![Public Botにチェックが入っている](../img/discord/public_bot.png)

8. ボットが他のメンバーを確認できるようにするには、「Server Members Intent」にチェックが入っていることを確認してください。

![Server Members Intent ticked](../img/discord/server_members_intent.png)

9. 「Copy」ボタンをクリックしてトークンをコピーします。 

10. Kitsuの「設定」画面で、テキストフィールド「Discord token (optional)」にトークンを貼り付け、「Save settings」をクリックします。

![Add discord token to settings](../img/discord/add_discord_token_settings.png)

### ボットの招待

ボットユーザーを作成したら、それをサーバーに追加する必要があります。以下の手順に従ってください。

1. [Discord ウェブサイト](https://discord.com/) にログインしていることを確認してください。
2. [アプリケーションページ](https://discord.com/developers/applications) に移動します。
3. ボットのページをクリックします。
4. 「OAuth2」タブから「URL Generator」に進みます。
5. 「Scopes」で「bot」のみにチェックを入れます。

![URL Generator Scopes](../img/discord/url_generator_scopes.png)

6. 「Bot Permissions」で「Send Messages」のみにチェックを入れます。

![URL Generator Bot permissions](../img/discord/bot_permissions.png)

7. 生成されたURLを使用して、サーバーにボットを追加します。URLをブラウザにコピー＆ペーストし、ボットを招待するサーバーを選択して、「Authorize（認証）」をクリックします。

> **_注意：_** ボットを追加するには、そのユーザーに「Manage Server（サーバー管理）」権限が必要です。

> **_注意：_** 通知を有効にするには、ユーザーはボットと同じサーバー上にいる必要があります。

### Discord 通知を有効にする

各ユーザーは、プロフィールで Discord にプッシュ通知を設定できます。「Discord 通知を有効にする」を「はい」に切り替え、「Discord ユーザー名」（フォーマットは username#number）を入力する必要があります。

![プロフィールに discord ユーザー名を追加](../img/discord/add_discord_username_profile.png)

完了です！

## Slack 統合

Slack との連携には、Slack スペースに専用のアプリケーションを作成する必要があります。以下の手順で設定を進めてください。

### Slack に Kitsu アプリケーションを作成

まず、[https://api.slack.com/apps](https://api.slack.com/apps) に接続します。

「新しいアプリを作成」ボタンをクリックします。

![新しいアプリを作成](../img/slack/slack_create_app_01.png)

名前に「Kitsu」と入力し、Kitsuインスタンスとリンクするワークスペースを選択します。

![ワークスペースの選択](../img/slack/slack_create_app_02.png)


適切な権限を設定する

アプリを作成したら、リストからアプリの名前をクリックしてアプリのページに移動します。「基本情報」セクションに移動し、右下の「権限」ボタンをクリックします。

![権限ボタン](../img/slack/slack_create_app_03.png)

スコープセクションで、必要な権限を追加します。

![スコープの追加](../img/slack/slack_create_app_04.png)

必要な権限のスコープは `chat:write:bot` です。

![権限スコープ](../img/slack/slack_create_app_05.png)


### ワークスペースにアプリをインストール

ワークスペースにアプリをインストールします。「アプリのインストール」セクションに移動し、「ワークスペースにアプリをインストール」ボタンをクリックしてインストールします。

![アプリのインストール](../img/slack/slack_create_app_06.png)

インストールを確認します。

![インストール確認](../img/slack/slack_create_app_07.png)

これで、Kitsu Slack アプリが稼働しました。あとは、Slack ワークスペースに送信される通知に Kitsu をリンクするだけです。

### トークンの取得

*アプリのインストール*セクションに戻ります。Kitsu インスタンスを Slack にリンクするために必要なトークンが表示されます。

![トークンの取得](../img/slack/slack_create_app_08.png)

### Kitsuを新しいSlackアプリケーションにリンク

有効なトークンを使って、Kitsuの設定ページに移動し、トークンを入力します。

![設定にトークンを追加](../img/slack/slack_kitsu_settings.png)

### プロフィールでSlack通知を有効にする

最後に、プロフィールセクションでSlack通知をオンにします。Slackのプロフィールで「その他」をクリックすると表示される、Slackで使用しているメンバーIDを入力します。

![メンバーIDの確認](../img/slack/slack_display_name1.png)

![メンバーID](../img/slack/slack_display_name2.png)

Kitsuのプロフィールで、Slack通知を「オン」に設定し、Slackのニックネームを入力します。

![Slack通知の設定](../img/slack/slack_configuration.png)

これで、Slackワークスペースで直接通知を受け取ることができます！

![Slack通知](../img/slack/slack_kitsu_notifications.png)

## Mattermost 統合

### 受信 Webhook、カスタムユーザー名、Webhook 用プロフィール画像を有効にする

1. Mattermost サーバーにシステム管理アカウントでログインしていることを確認してください。
2. Mattermost インストールで受信 Webhook を受信でき、Webhook 用にカスタムユーザー名とプロフィール画像を設定できるか確認してください。
1. 「システムコンソール」 --> 「統合」 --> 「統合管理」に進みます。

![Integration management](../img/mattermost/integration-management.png)

2. パラメータ「Enable incoming Webhooks」、「Enable integrations to override usernames」、および「Enable integrations to override profile picture icons」が「true」に設定されていることを確認します。

![Enable incoming webhooks](../img/mattermost/enable-incoming-webhooks.png)

### MattermostでWebhookを設定する

1. Mattermostサーバーにシステム管理アカウントでログインしていることを確認してください。
2. 「Integrations」 --> 「Incoming Webhooks」 --> 「Add incoming Webhook」の順にアクセスします。

![Add incoming webhook](../img/mattermost/add-incoming-webhook.png)

3. 受信Webhookを作成します。

![Create incoming webhook](../img/mattermost/create-incoming-webhook.png)

* **Title**: Kitsu
* **Description**: Kitsu
* **Channel**: メッセージはユーザーに送信されるので、新しいチャンネルを作成するか、既存のチャンネルを使用します。
* **Lock to this channel**: False に設定します。
* **Username**: Kitsu (これは Kitsu によって上書きされます)。
* **プロフィール画像**: 重要ではありません。Kitsuによって上書きされます。

4. 「保存」をクリックすると、Mattermostが新しいURLを生成します。このURLをコピーします。

5. Kitsuの「設定」で、テキストフィールド「Mattermost Webhooks (オプション)」にURLを貼り付け、「設定を保存」をクリックします。

![Mattermost ウェブフック設定の追加](../img/mattermost/add_mattermost_webhook_settings.png)

> **_注意:_** 通知を有効にしたいユーザーは、これらの手順で使用したのと同じ Mattermost サーバー上に存在していなければなりません。

### Mattermost 通知を有効にする

各ユーザーは、プロフィールで Mattermost にプッシュ通知を行うように設定できます。「Mattermost 通知を有効にする」を「はい」に切り替え、「Mattermost ユーザー名」を入力する必要があります。

![プロフィールに Mattermost ユーザー名を追加](../img/mattermost/add_mattermost_username_profile.png)

完了です！
