export default {
  lang: "en-US",
  title: "Kitsu Documentation",
  description:
    "The documentation for Kitsu, the collaboration platform for creative teams",
  head: [
    ["link", { rel: "icon", href: "/kitsu.png" }],
    ['script', {}, `var _paq = window._paq = window._paq || [];
  /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  (function() {
    var u="https://cgwire.innocraft.cloud/";
    _paq.push(['setTrackerUrl', u+'matomo.php']);
    _paq.push(['setSiteId', '1']);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.async=true; g.src='https://cdn.matomo.cloud/cgwire.innocraft.cloud/matomo.js'; s.parentNode.insertBefore(g,s);
  })();`]
  ],
  locales: {
    root: {
      lang: "en-US",
      label: "English",
    },
    ja: {
      lang: "ja-JP",
      label: "日本語",
      title: "Kitsu ドキュメント",
      description:
        "クリエイティブチームのコラボレーションプラットフォーム、Kitsuのドキュメント",
      themeConfig: {
        sidebar: [
          {
            text: "Kitsuの紹介",
            collapsed: false,
            items: [
              { text: "Introduction", link: "/ja/" },
              { text: "Configure Kitsu", link: "/ja/configure-kitsu/" },
              { text: "Team", link: "/ja/team/" },
            ],
          },
          {
            text: "制作物の作成",
            collapsed: true,
            items: [
              { text: "TV Show", link: "/ja/tvshow/" },
              { text: "Feature", link: "/ja/feature/" },
              { text: "Short", link: "/ja/short/" },
              { text: "Short Shot", link: "/ja/short-shot/" },
              { text: "Short Asset", link: "/ja/short-asset/" },
              { text: "Video Game", link: "/ja/videogame/" },
              { text: "NFT", link: "/ja/nft/" },
            ],
          },
          {
            text: "メタカラム、フィルター、および制作設定",
            collapsed: true,
            items: [
              { text: "Meta Column", link: "/ja/meta-column/" },
              { text: "Filter", link: "/ja/filter/" },
              { text: "Configure Production", link: "/ja/configure-prod/" },
            ],
          },
          {
            text: "割り当て、見積もり、およびスケジュール",
            collapsed: true,
            items: [
              { text: "Assignation", link: "/ja/assignation/" },
              { text: "Estimation", link: "/ja/estimation/" },
              { text: "Schedules", link: "/ja/schedules/" },
            ],
          },
          {
            text: "ステータス、公開、サムネイル",
            collapsed: true,
            items: [
              { text: "Status", link: "/ja/status/" },
              { text: "Publish", link: "/ja/publish/" },
              { text: "Thumbnails", link: "/ja/thumbnails/" },
            ],
          },
          {
            text: "社内レビューおよびクライアント用プレイリスト",
            collapsed: true,
            items: [
              { text: "Review", link: "/ja/review/" },
              { text: "Weekly Review", link: "/ja/review-weekly/" },
              { text: "Client Playlist", link: "/ja/playlist-client/" },
            ],
          },
          {
            text: "スーパーバイザーのワークフロー",
            collapsed: true,
            items: [
              { text: "Supervisor Team", link: "/ja/supervisor-team/" },
              { text: "Supervisor Tasks", link: "/ja/supervisor-tasks/" },
            ],
          },
          {
            text: "プロデューサーのワークフロー",
            collapsed: true,
            items: [
              { text: "Production Report", link: "/ja/production-report/" },
              { text: "Studio Report", link: "/ja/studio-report/" },
            ],
          },
          {
            text: "アーティストのワークフロー",
            collapsed: true,
            items: [{ text: "Artist", link: "/ja/artist/" }],
          },
          {
            text: "開発者向けワークフロー",
            collapsed: true,
            items: [
              { text: "Custom Actions", link: "/ja/custom-actions/" },
              { text: "Bots", link: "/ja/bots/" },
              { text: "Publisher", link: "/ja/publisher/" },
              { text: "Chat Integration", link: "/ja/chat-integration/" },
              { text: "Installation", link: "/ja/installation/" },
            ],
          },
          {
            text: "よくある質問",
            collapsed: true,
            items: [{ text: "FAQ", link: "/ja/faq/" }],
          },
        ],
      },
    },
  },
  themeConfig: {
    logo: "/kitsu.png",
    search: {
      provider: "local",
    },
    sidebar: [
      {
        text: "Introduction to Kitsu",
        collapsed: false,
        items: [
          { text: "Introduction", link: "/" },
          { text: "Configure Kitsu", link: "/configure-kitsu/" },
          { text: "Team", link: "/team/" },
        ],
      },
      {
        text: "Create Your Production",
        collapsed: true,
        items: [
          { text: "TV Show", link: "/tvshow/" },
          { text: "Feature", link: "/feature/" },
          { text: "Short", link: "/short/" },
          { text: "Short Shot", link: "/short-shot/" },
          { text: "Short Asset", link: "/short-asset/" },
          { text: "Video Game", link: "/videogame/" },
          { text: "NFT", link: "/nft/" },
        ],
      },
      {
        text: "Meta Columns, Filters and Production Settings",
        collapsed: true,
        items: [
          { text: "Meta Column", link: "/meta-column/" },
          { text: "Filter", link: "/filter/" },
          { text: "Configure Production", link: "/configure-prod/" },
        ],
      },
      {
        text: "Assignments, Estimates and Scheduling",
        collapsed: true,
        items: [
          { text: "Assignation", link: "/assignation/" },
          { text: "Estimation", link: "/estimation/" },
          { text: "Schedules", link: "/schedules/" },
        ],
      },
      {
        text: "Statuses, Publishes, and Thumbnails",
        collapsed: true,
        items: [
          { text: "Status", link: "/status/" },
          { text: "Publish", link: "/publish/" },
          { text: "Thumbnails", link: "/thumbnails/" },
        ],
      },
      {
        text: "Internal Review and Client Playlists",
        collapsed: true,
        items: [
          { text: "Review", link: "/review/" },
          { text: "Weekly Review", link: "/review-weekly/" },
          { text: "Client Playlist", link: "/playlist-client/" },
        ],
      },
      {
        text: "Supervisor Workflows",
        collapsed: true,
        items: [
          { text: "Supervisor Team", link: "/supervisor-team/" },
          { text: "Supervisor Tasks", link: "/supervisor-tasks/" },
        ],
      },
      {
        text: "Producer Workflows",
        collapsed: true,
        items: [
          { text: "Production Report", link: "/production-report/" },
          { text: "Studio Report", link: "/studio-report/" },
        ],
      },
      {
        text: "Artist Workflows",
        collapsed: true,
        items: [{ text: "Artist", link: "/artist/" }],
      },
      {
        text: "Developer Workflows",
        collapsed: true,
        items: [
          { text: "Custom Actions", link: "/custom-actions/" },
          { text: "Bots", link: "/bots/" },
          { text: "Publisher", link: "/publisher/" },
          { text: "Chat Integration", link: "/chat-integration/" },
          { text: "Installation", link: "/installation/" },
        ],
      },
      {
        text: "Frequently Asked Questions",
        collapsed: true,
        items: [{ text: "FAQ", link: "/faq/" }],
      },
    ],
  },
};