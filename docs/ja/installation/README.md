# オープンソースのセットアップ

## クラウドホスティング

KitsuのバージョンがCGWireによってホスティングおよび管理されている場合は、インストールする必要はありません。 ご提供するURLに接続するだけで、Kitsuの使用を開始できます。

## セルフホスティング

Kitsuを適切に実行するには、ZouというデータベースAPIが必要です。 両方のモジュールのインストールに関する情報は、Zouのインストールドキュメントに記載されています。

* [Zouのデプロイ](https://zou.cg-wire.com/)
* [Kitsuのデプロイ](https://zou.cg-wire.com/#deploying-kitsu)

技術的なスキルをお持ちの場合は、DockerでKitsu/Zouを実行して試すことができます。

```shell
docker run -d -p 80:80 --name cgwire cgwire/cgwire
```

その後、[http://localhost](http://localhost) から Kitsu にアクセスできます。

## 開発環境

### 前提条件

Kitsu の開発環境をセットアップする前に、以下の要素がインストールされていることを確認してください。

* [Node.js](https://nodejs.org/en/) 18.12 以上
* [Zou 開発インスタンス](https://zou.cg-wire.com/development/) がポート 5000 で稼働している
* [Zou Events 開発インスタンス](https://zou.cg-wire.com/development/) がポート 5001 で稼働している（オプション）

### Docker イメージの使用

弊社が提供する [Docker イメージ](https://hub.docker.com/r/cgwire/cgwire) を使用することもできますが、その場合は以下の2つの環境変数を設定する必要があります。

* `KITSU_API_TARGET` (デフォルト: http://localhost:5000): API にアクセスできる URL。
* `KITSU_EVENT_TARGET` (デフォルト: http://localhost:5001): イベントストリームにアクセスできる URL。

その場合は、次のコマンドで開発環境を実行します。

```shell
KITSU_API_TARGET=http://localhost/api KITSU_EVENT_TARGET=http://localhost npm run dev
```

Docker イメージの認証情報は次のとおりです。admin@example.com / mysecretpassword

## 開発

Kitsu の変更を開始するには、リポジトリをクローンします。

```shell
git clone https://github.com/cgwire/kitsu.git
```

次に、依存関係をダウンロードします。

```shell
cd kitsu
npm install
```

最後に、開発環境を起動し、`http://localhost:8080` で結果を表示します。

```shell
npm run dev
```

変更があれば、ページが自動的に更新されます。

## ビルド

コードをビルドするには、次のコマンドを実行します。

```shell
npm run build
```

## テスト

次のコマンドでテストを実行します。

```shell
npm run test:unit
```

## アーキテクチャ

Kitsu は [Vue.js](https://v2.vuejs.org/v2/guide/) フレームワークをベースとしています。Vue.js のドキュメントは網羅的で非常にわかりやすいです。コードに大幅な変更を加える前に、ぜひ一読されることをお勧めします。

アーキテクチャは [Vuex](https://v3.vuex.vuejs.org/) と [vue-router](https://v3.router.vuejs.org/) をベースとしています。 これらのドキュメントも非常に充実しており、ぜひお読みください。 主な考え方は以下の通りです。

* URL ルートが主なコンテキストを提供します。
* ビューは、HTML、CSS、および少量の JavaScript からなるコンポーネントで記述されます。
* 共有状態はストア内に保存され、状態変更を要求するイベントバス（一種）であるミューテーション（mutation）とアクション（action）によって変更されます。
* アクションはミューテーションに似ていますが、非同期処理が可能です。主に、アクションはミューテーションを実行し、サーバーにリクエストを送信します。
* ストアは、コンポーネントから状態プロパティにアクセスするためのゲッターを提供します。
* ローカルの変更ロジックはコンポーネント内に保持されます。
* ゲッター、アクション、およびミューテーションは、ブラウザなしでもテスト可能でなければなりません。
