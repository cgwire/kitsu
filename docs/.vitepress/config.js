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
          { text: "Getting Started", link: "/start-here/getting-started",},
          { text: "Create a New Production", link: "/start-here/new-production"},
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
            collapsed: false,
            items: [
              { text: "Preparing Your Team", link: "/guides/team-management/team-preparation" },
              { text: "Managing Departments", link: "/guides/team-management/managing-departments" },
              { text: "Managing Teams", link: "/guides/team-management/managing-teams" },
              { text: "Team Roles", link: "/guides/team-management/team-roles" },
              { text: "Import Team", link: "/guides/team-management/import-team" },
              { text: "User Profile Settings", link: "/guides/team-management/profile-settings" },
            ],
          },
          {
            text: "Task Management",
            collapsed: false,
            items: [
              { text: "Manage Episodes", link: "/guides/task-management/manage-episodes" },
              { text: "Manage Sequences", link: "/guides/task-management/manage-sequences" },
              { text: "Manage Shots", link: "/guides/task-management/manage-shots" },
              { text: "Manage Asset Types", link: "/guides/task-management/manage-asset-types" },
              { text: "Manage Task Types", link: "/guides/task-management/manage-task-types" },
              { text: "Manage Task Statuses", link: "/guides/task-management/manage-task-statuses" },
            ],
          },
          {
            text: "Pre-Production",
            collapsed: false,
            items: [
              { text: "Meta-Columns", link: "/guides/pre-production/meta-column"},
              { text: "Production Settings", link: "/guides/pre-production/production-settings" },
              { text: "Breakdown & Casting", link: "/guides/pre-production/breakdown-casting" },
              { text: "Manage Concepts", link: "/guides/pre-production/manage-concepts" },
              { text: "Manage Assets", link: "/guides/pre-production/manage-assets" },
            ],
          },
          {
            text: "Scheduling",
            collapsed: false,
            items: [
              { text: "Assign Tasks", link: "/guides/scheduling/assign-tasks" },
              { text: "Find Assignments", link: "/guides/scheduling/find-assignments" },
              { text: "Manage Edits", link: "/guides/scheduling/manage-edits" },
              { text: "Schedules", link: "/guides/scheduling/schedules/" },
              { text: "Estimates", link: "/guides/scheduling/estimates/" },
              { text: "Quotas", link: "/guides/scheduling/quotas/" },
            ],
          },
          {
            text: "Review & Publishing",
            collapsed: false,
            items: [
              { text: "Publish", link: "/guides/review-publishing/publish/" },
              { text: "Share Concepts", link: "/guides/review-publishing/share-concepts/" },
              { text: "Review", link: "/guides/review-publishing/review/" },
              { text: "Request Review", link: "/guides/review-publishing/request-review/" },
              { text: "Playlist", link: "/guides/review-publishing/playlist/" },
              { text: "Client Playlist", link: "/guides/review-publishing/playlist-client/" },
              { text: "Update Task Progress", link: "/guides/review-publishing/update-task-progress/" },
            ],
          },
          {
            text: "Tracking & Reporting",
            collapsed: false,
            items: [
                { text: "Durations vs Estimates", link: "/guides/tracking-reporting/Durations-vs-Estimates" },
                { text: "Ensure Tasks are On-Time", link: "/guides/tracking-reporting/Ensure-Tasks-are-On-Time" },
                { text: "Understand Why a Task Is Late", link: "/guides/tracking-reporting/Understand-Why-a-Task-Is-Late" },
                { text: "Production Overview", link: "/guides/tracking-reporting/Production-Overview" },
                { text: "Studio Occupancy", link: "/guides/tracking-reporting/Studio-Occupancy" },
                { text: "Studio Overview", link: "/guides/tracking-reporting/Studio-Overview" },
                { text: "Advanced Search & Filters", link: "/guides/tracking-reporting/filter" },
                { text: "Timesheets", link: "/guides/tracking-reporting/timesheets" },
                { text: "Main Schedule", link: "/guides/tracking-reporting/main-schedule" },
                { text: "Budget", link: "/guides/tracking-reporting/budget" },
                { text: "Thumbnails", link: "/guides/tracking-reporting/thumbnails/" },
            ],
          },
          {
            text: "File Management",
            collapsed: false,
            items: [
                { text: "File Storage", link: "/" },
                { text: "Asset Library", link: "/" },
            ],
          },
          {
            text: "Privacy & Security",
            collapsed: false,
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
          { text: "For TV Shows", link: "/recipes/for-tvshows/" },
          { text: "For Feature Films", link: "/recipes/for-feature-films/" },
          { text: "For Shorts", link: "/recipes/for-shorts/" },
          { text: "For Video Games", link: "/recipes/for-videogames/" },
          { text: "For NFTs", link: "/recipes/for-nfts/" },
          { text: "Shots-Only Productions", link: "/recipes/shots-only-production/" },
          { text: "Assets-Only Productions", link: "/recipes/assets-only-production/" },
          { text: "Status Automation", link: "/recipes/status-automation/" },
          { text: "3D Background", link: "/recipes/3d-background/" },
        ],
      },
      {
        text: "Resources",
        collapsed: false,
        items: [
          {
            text: "Frequently Asked Questions",
            link: "/resources/faq/"
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