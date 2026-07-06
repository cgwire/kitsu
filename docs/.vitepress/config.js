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
        text: "Start Here",
        collapsed: false,
        items: [
          { text: "Getting Started", link: "/start-here/getting-started" },
          { text: "Main Concepts", link: "/start-here/main-concepts" },
          { text: "Self-Hosting", link: "https://dev.kitsu.cloud/self-hosting/vs-cloud-hosting" },
        ],
      },
      {
        text: "Workflows",
        collapsed: false,
        items: [
          {
            text: "For Supervisors",
            link: "/workflows/for-supervisors",
          },
          {
            text: "For Producers",
            link: "/workflows/for-producers",
          },
          {
            text: "For Artists",
            link: "/workflows/for-artists",
          },
          {
            text: "For Developers",
            collapsed: true,
            link: "https://dev.kitsu.cloud/",
          },
          {
            text: "For Clients",
            link: "/workflows/for-clients",
          },
        ]
      },
      {
        text: "Guides",
        collapsed: false,
        items: [
          {
            text: "Team Management",
            collapsed: true,
            items: [
              { text: "Preparing Your Team", link: "/guides/team-management/team-preparation" },
              { text: "Managing Departments", link: "/guides/team-management/managing-departments" },
              { text: "Managing Teams", link: "/guides/team-management/managing-teams" },
              { text: "Team Roles", link: "/guides/team-management/team-roles" },
            ],
          },
          {
            text: "Pre-Production",
            collapsed: true,
            items: [
              { text: "Creating A New Production", link: "/", items: [
              { text: "Meta Column", link: "/meta-column/" },
              { text: "Filter", link: "/filter/" },
              { text: "Configure Production", link: "/configure-prod/" },
            ] },
              { text: "Production Structure", link: "/" },
              { text: "Managing Asset Types", link: "/" },
              { text: "Managing Task Types", link: "/" },
              { text: "Managing Task Statuses", link: "/" },
              { text: "Importing CSV Data", link: "/" },
              { text: "Breakdown & Casting", link: "/" },
              { text: "Concepts", link: "/" },
            ],
          },
          {
            text: "Scheduling",
            collapsed: true,
            items: [
              { text: "Managing Tasks", link: "/assignation/" },
              { text: "Schedules", link: "/schedules/" },
              { text: "Estimates", link: "/estimation/" },
            ],
          },
          {
            text: "Review & Publishing",
            collapsed: true,
            items: [
              { text: "Status", link: "/status/" },
              { text: "Publish", link: "/publish/" },
              { text: "Thumbnails", link: "/thumbnails/" },
              { text: "Review", link: "/review/" },
              { text: "Weekly Review", link: "/review-weekly/" },
              { text: "Client Playlist", link: "/playlist-client/" },
            ],
          },
          {
            text: "Tracking & Reporting",
            collapsed: true,
            items: [
                { text: "Advanced Search", link: "/" },
                { text: "Timesheets", link: "/" },
                { text: "News Feed", link: "/" },
                { text: "Stats", link: "/" },
                { text: "Budget", link: "/" },
            ],
          },
          {
            text: "File Management",
            collapsed: true,
            items: [
                { text: "File Storage", link: "/" },
                { text: "Asset Library", link: "/" },
            ],
          },
          {
            text: "Privacy & Security",
            collapsed: true,
            items: [
                { text: "IP Protection", link: "/" },
                { text: "Authentication", link: "/" },
                { text: "Authorization", link: "/" },
            ],
          },
        ]
      },
      {
        text: "Recipes",
        collapsed: false,
        items: [
          { text: "For TV Shows", link: "/tvshow/" },
          { text: "For Feature Films", link: "/feature/" },
          { text: "For Shorts", link: "/short/" },
          { text: "Short Shot", link: "/short-shot/" },
          { text: "Short Asset", link: "/short-asset/" },
          { text: "For Video Games", link: "/videogame/" },
          { text: "For NFTs", link: "/nft/" },
          { text: "Shots-Only Productions", link: "/nft/" },
          { text: "Assets-Only Productions", link: "/nft/" },
        ],
      },
      {
        text: "Resources",
        collapsed: false,
        items: [
          {
            text: "Frequently Asked Questions",
            collapsed: true,
            items: [{ text: "FAQ", link: "/faq/" }],
          },
          {
            text: "Changelog",
            collapsed: true,
            "link": "https://cgwire.canny.io/changelog"
          }
        ],
      },
    ],
  },
};