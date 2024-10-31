module.exports = {
  title: 'Kitsu Documentation',
  description: 'The documentation for Kitsu, the collaboration platform for creative teams',
  head: [
    ['link', { rel: 'shortcut icon', type: 'image/x-icon', href: `./img/favicon.ico` }]
  ],
  locales: {
    '/': {
      lang: 'en-US',
    },
    '/ja/': {
      lang: 'ja-JP',
    }
  },
  themeConfig: {
    locales: {
      '/': {
        lang: 'en-US',
        label: 'English',
        title: 'Kitsu Documentation',
        description: 'The documentation for Kitsu, the collaboration platform for creative teams',
        sidebar: [
          {
            title: 'Introduction to Kitsu',
            collapsable: false,
            children: [['/', 'Introduction'],
             '/configure-kitsu/',
              '/team/'
            ]
          },
          {
            title: 'Create Your Production',
            collapsable: true,
            children: [
              '/tvshow/',
              '/feature/',
              '/short/',
              '/short-shot/',
              '/short-asset/',
              '/videogame/',
              '/nft/'
            ]
          },
          {
            title: 'Meta Columns, Filters and Production Settings',
            collapsable: true,
            children: [
              '/meta-column/',
              '/filter/',
              '/configure-prod/'
            ]
          },
          {
            title: 'Assignments, Estimates and Scheduling',
            collapsable: true,
            children: [
              '/assignation/',
              '/estimation/',
              '/schedules/'
            ]
          },
          {
            title: 'Statuses, Publishes, and Thumbnails',
            collapsable: true,
            children: [
              '/status/',
              '/publish/',
              '/thumbnails/'
              ]
          },
          {
            title: 'Internal Review and Client Playlists',
            collapsable: true,
            children: [
             '/review/',
             '/review-weekly/',
             '/playlist-client/'
              ]
           },
          {
            title: 'Supervisor Workflows',
            collapsable: true,
            children: [
              '/supervisor-team/',
              '/supervisor-tasks/'
               ]
           },
          {
            title: 'Producer Workflows',
            collapsable: true,
            children: [
              '/production-report/',
              '/studio-report/'
            ]
          },
          {
            title: 'Developer Workflows',
            collapsable: true,
            children: [
              '/custom-actions/',
              '/bots/',
              '/publisher/',
              '/chat-integration/',
              '/installation/'
            ]
          }
        ]
      },
      '/ja/': {
        lang: 'ja-JP',
        label: '日本語',
        title: 'Kitsu ドキュメント',
        description: 'クリエイティブチームのコラボレーションプラットフォーム、Kitsuのドキュメント',
        sidebar: [
          {
            title: 'Kitsuの紹介',
            collapsable: false,
            children: [
              ['/ja/', 'Introduction'],
              '/ja/configure-kitsu/',
              '/ja/team/'
            ]
          },
          {
            title: '制作物の作成',
            collapsable: true,
            children: [
              '/ja/tvshow/',
              '/ja/feature/',
              '/ja/short/',
              '/ja/short-shot/',
              '/ja/short-asset/',
              '/ja/videogame/',
              '/ja/nft/'
            ]
          },
          {
            title: 'メタカラム、フィルター、および制作設定',
            collapsable: true,
            children: [
              '/ja/meta-column/',
              '/ja/filter/',
              '/ja/configure-prod/'
            ]
          },
          {
            title: '割り当て、見積もり、およびスケジュール',
            collapsable: true,
            children: [
              '/ja/assignation/',
              '/ja/estimation/',
              '/ja/schedules/'
            ]
          },
          {
            title: 'ステータス、公開、サムネイル',
            collapsable: true,
            children: [
              '/ja/status/',
              '/ja/publish/',
              '/ja/thumbnails/'
            ]
          },
          {
            title: '社内レビューおよびクライアント用プレイリスト',
            collapsable: true,
            children: [
              '/ja/review/',
              '/ja/review-weekly/',
              '/ja/playlist-client/'
            ]
          },
          {
            title: 'スーパーバイザーのワークフロー',
            collapsable: true,
            children: [
              '/ja/supervisor-team/',
              '/ja/supervisor-tasks/'
            ]
          },
          {
            title: 'プロデューサーのワークフロー',
            collapsable: true,
            children: [
              '/ja/production-report/',
              '/ja/studio-report/'
            ]
          },
          {
            title: '開発者向けワークフロー',
            collapsable: true,
            children: [
              '/ja/custom-actions/',
              '/ja/bots/',
              '/ja/publisher/',
              '/ja/chat-integration/',
              '/ja/installation/'
            ]
          }
        ]
      }
    }
  }
}
