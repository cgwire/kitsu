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
  ignoreDeadLinks: true,
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
  markdown: {
    config(md) {
      md.core.ruler.push('strip_embed_card_headings', (state) => {
        let depth = 0
        for (const token of state.tokens) {
          if (token.type === 'html_block') {
            const t = token.content.trim()
            if (/^<EmbedCard\b/.test(t)) depth++
            else if (/^<\/EmbedCard>/.test(t)) depth = Math.max(0, depth - 1)
          }
          if (depth > 0 && (token.type === 'heading_open' || token.type === 'heading_close')) {
            const level = Number(token.tag.slice(1))
            token.tag = 'h' + Math.min(level + 4, 6)
          }
        }
      })
    }
  },
  themeConfig: {
    logo: "/kitsu.png",
    search: {
      provider: "local",
    },
    outline: {
      level: [2, 3]
    },
    sidebar: [
      {
        text: "Start Here",
        collapsed: false,
        items: [
          { text: "Getting Started", link: "/start-here/getting-started/",},
        ],
      },
      {
        text: "Workflows",
        collapsed: false,
        items: [
          {
            text: "For Supervisors",
            link: "/workflows/for-supervisors/",
          },
          {
            text: "For Producers",
            link: "/workflows/for-producers/",
          },
          {
            text: "For Artists",
            link: "/workflows/for-artists/",
          },
          {
            text: "For Clients",
            link: "/workflows/for-clients/",
          },
          {
            text: "For Developers",
            collapsed: true,
            link: "https://dev.kitsu.cloud/",
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
              { text: "Managing Departments", link: "/guides/team-management/managing-departments/" },
              { text: "Managing Teams", link: "/guides/team-management/managing-teams/" },
              { text: "User Permission Roles", link: "/guides/team-management/team-roles/" },
              { text: "Import Team", link: "/guides/team-management/import-team/" },
              { text: "User Profile Settings", link: "/guides/team-management/profile-settings/" },
            ],
          },
          {
            text: "Task Management",
            collapsed: false,
            items: [
              { text: "Manage Studios", link: "/guides/task-management/manage-studios/" },
              { text: "Manage Productions", link: "/guides/task-management/manage-productions/" },
              { text: "Manage Episodes", link: "/guides/task-management/manage-episodes/" },
              { text: "Manage Sequences", link: "/guides/task-management/manage-sequences/" },
              { text: "Manage Shots", link: "/guides/task-management/manage-shots/" },
              { text: "Manage Asset Types", link: "/guides/task-management/managing-asset-types/" },
              { text: "Manage Task Types", link: "/guides/task-management/managing-task-types/" },
              { text: "Manage Task Statuses", link: "/guides/task-management/managing-task-statuses/" },
            ],
          },
          {
            text: "Pre-Production",
            collapsed: false,
            items: [
              { text: "Manage Concepts", link: "/guides/pre-production/manage-concepts/" },
              { text: "Manage Assets", link: "/guides/pre-production/manage-assets/" },
              { text: "Breakdown & Casting", link: "/guides/pre-production/breakdown-casting/" },
              { text: "Meta-Columns", link: "/guides/pre-production/meta-column/"},
            ],
          },
          {
            text: "Scheduling",
            collapsed: false,
            items: [
              { text: "Assign Tasks", link: "/guides/scheduling/assign-tasks/" },
              { text: "Find Assignments", link: "/guides/scheduling/find-assignments/" },
              { text: "Schedules", link: "/guides/scheduling/schedules/" },
              { text: "Estimates", link: "/guides/scheduling/estimates/" },
              { text: "Quotas", link: "/guides/scheduling/quotas/" },
              { text: "Manage Edits", link: "/guides/scheduling/manage-edits/" },
            ],
          },
          {
            text: "Review & Publishing",
            collapsed: false,
            items: [
              { text: "Update Task Progress", link: "/guides/review-publishing/update-task-progress/" },
              { text: "Publish", link: "/guides/review-publishing/publish/" },
              { text: "Request Review", link: "/guides/review-publishing/request-review/" },
              { text: "Review", link: "/guides/review-publishing/review/" },
              { text: "Playlist", link: "/guides/review-publishing/playlist/" },
              { text: "Client Playlist", link: "/guides/review-publishing/client-playlist/" },
            ],
          },
          {
            text: "Tracking & Reporting",
            collapsed: false,
            items: [
                { text: "Ensure Tasks are On-Time", link: "/guides/tracking-reporting/ensure-tasks-on-time/" },
                { text: "Understand Why a Task Is Late", link: "/guides/tracking-reporting/understand-why-late-task/" },
                { text: "Studio Overview", link: "/guides/tracking-reporting/studio-overview/" },
                { text: "Studio Occupancy", link: "/guides/tracking-reporting/studio-occupancy/" },
                { text: "Production Overview", link: "/guides/tracking-reporting/production-overview/" },
                { text: "Timesheets", link: "/guides/tracking-reporting/timesheets/" },
                { text: "Durations vs Estimates", link: "/guides/tracking-reporting/durations-vs-estimates/" },
                { text: "Advanced Search & Filters", link: "/guides/tracking-reporting/filter/" },
                { text: "Main Schedule", link: "/guides/tracking-reporting/main-schedule/" },
                { text: "Budget", link: "/guides/tracking-reporting/budget/" },
                { text: "Thumbnails", link: "/guides/tracking-reporting/thumbnails/" },
            ],
          },
          {
            text: "File Management",
            collapsed: false,
            items: [
                { text: "File Storage", link: "/guides/file-management/file-storage/" },
                { text: "Asset Library", link: "/guides/file-management/asset-library/" },
            ],
          },
          {
            text: "Privacy & Security",
            collapsed: false,
            items: [
              { text: "Authentication", link: "/guides/privacy-security/authentication/" },
              { text: "Logs", link: "/guides/privacy-security/logs/" },
                // { text: "IP Protection", link: "/" },
                // { text: "Authorization", link: "/" },
            ],
          },
        ]
      },
      {
        text: "Recipes",
        collapsed: false,
        items: [
          { text: "Quickstart for TV Shows", link: "/recipes/for-tvshows/" },
          { text: "Quickstart for Feature Films", link: "/recipes/for-feature-films/" },
          { text: "Quickstart for Shorts", link: "/recipes/for-shorts/" },
          { text: "Quickstart for Video Games", link: "/recipes/for-videogames/" },
          { text: "Quickstart for NFTs", link: "/recipes/for-nfts/" },
          { text: "Quickstart for Shots-Only Productions", link: "/recipes/shots-only-production/" },
          { text: "Quickstart for Assets-Only Productions", link: "/recipes/assets-only-production/" },
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