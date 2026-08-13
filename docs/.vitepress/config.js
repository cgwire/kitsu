import fs from 'node:fs'
import path from 'node:path'
import MermaidExample from "./mermaid-markdown-all.js";

const INCLUDE_RE = /<!--\s*@include:\s*(.+?)\s*-->/g
const RANGE_RE = /\{(\d*),(\d*)\}$/
const REGION_RE = /#([\w-]+)$/

// matches region markers across common comment styles:
// // #region foo | # region foo | <!-- #region foo --> | /* #region foo */ etc.
function regionMarker(name, tag) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(
    `^\\s*(?:\\/\\/|#|<!--|\\/\\*|;;|%)\\s*#${tag}\\s+${escaped}\\b`
  )
}

function parseIncludePath(raw) {
  let src = raw
  let range = null
  let region = null

  const rangeMatch = src.match(RANGE_RE)
  if (rangeMatch) {
    range = { start: rangeMatch[1] ? +rangeMatch[1] : 1, end: rangeMatch[2] ? +rangeMatch[2] : Infinity }
    src = src.slice(0, -rangeMatch[0].length)
  }

  const regionMatch = src.match(REGION_RE)
  if (regionMatch) {
    region = regionMatch[1]
    src = src.slice(0, -regionMatch[0].length)
  }

  return { filepath: src.trim(), region, range }
}

function extractRegion(lines, region) {
  const startRE = regionMarker(region, 'region')
  const endRE = regionMarker(region, 'endregion')

  const startIdx = lines.findIndex((l) => startRE.test(l))
  if (startIdx === -1) return lines // region not found: fall back to whole file

  const endIdx = lines.findIndex((l, i) => i > startIdx && endRE.test(l))
  const sliceEnd = endIdx === -1 ? lines.length : endIdx

  return lines.slice(startIdx + 1, sliceEnd)
}

function applyRange(lines, range) {
  if (!range) return lines
  const start = Math.max(range.start - 1, 0)
  const end = range.end === Infinity ? lines.length : range.end
  return lines.slice(start, end)
}

function resolveIncludes(content, baseDir, seen = new Set()) {
  return content.replace(INCLUDE_RE, (_, rawPath) => {
    const { filepath, region, range } = parseIncludePath(rawPath)
    const fullPath = path.resolve(baseDir, filepath)

    if (seen.has(fullPath) || !fs.existsSync(fullPath)) return ''
    seen.add(fullPath)

    let lines = fs.readFileSync(fullPath, 'utf-8').split(/\r?\n/)
    if (region) lines = extractRegion(lines, region)
    lines = applyRange(lines, range)

    const included = lines.join('\n')
    // includes can themselves include other files (recurse before returning)
    return resolveIncludes(included, path.dirname(fullPath), new Set(seen))
  })
}

function stripRegionMarkers(content) {
  // removes #region / #endregion marker lines across common comment styles:
  // // #region foo | # region foo | <!-- #region foo --> | /* #region foo */ etc.
  return content
    .split(/\r?\n/)
    .filter((line) => !/^\s*(?:\/\/|#|<!--|\/\*|;;|%)\s*#(?:end)?region\b/.test(line))
    .join('\n')
}

function stripScripts(content) {
  // removes <script>...</script> and <script setup>...</script> blocks entirely
  return content.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
}

function stripComponents(content) {
  // self-closing custom components, e.g. <SomeWidget foo="bar" />
  content = content.replace(/<([A-Z][\w-]*)\b[^>]*\/>/g, '')

  // paired custom components, e.g. <EmbedCard ...>...</EmbedCard>
  // unwrap them (keep inner markdown, drop the tags themselves)
  const pairedRE = /<([A-Z][\w-]*)\b[^>]*>([\s\S]*?)<\/\1>/g
  let prev
  do {
    prev = content
    content = content.replace(pairedRE, (_, _tag, inner) => inner)
  } while (content !== prev) // repeat to catch components nested inside components

  return content
}

const allMarkdownTransformers = {
  theme: {
    light: "github-light",
    dark: "github-dark",
  },

  config: (md) => {
    MermaidExample(md);
  },
};

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
    theme: {
      light: "github-light",
      dark: "github-dark",
    },
    config(md) {
      md.core.ruler.push('strip_embed_card_headings', (state) => {
        let depth = 0
        for (const token of state.tokens) {
          if (token.type === 'html_block') {
            const t = token.content.trim()
            if (/^<(EmbedCard|EmbedDocument)\b/.test(t)) depth++
            else if (/^<\/(EmbedCard|EmbedDocument)>/.test(t)) depth = Math.max(0, depth - 1)
          }
          if (depth > 0 && (token.type === 'heading_open' || token.type === 'heading_close')) {
            const level = Number(token.tag.slice(1))
            token.tag = 'h' + Math.min(level + 4, 6)
          }
        }
      })

      MermaidExample(md)
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
        text: "Handbooks",
        collapsed: false,
        items: [
          {
            text: "For Supervisors",
            link: "/handbooks/for-supervisors/",
          },
          {
            text: "For Producers",
            link: "/handbooks/for-producers/",
          },
          {
            text: "For Artists",
            link: "/handbooks/for-artists/",
          },
          {
            text: "For Clients",
            link: "/handbooks/for-clients/",
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
            link: "/guides/team-management/",
            items: [
              { text: "Managing Departments", link: "/guides/team-management/managing-departments/" },
              { text: "Managing Teams", link: "/guides/team-management/managing-teams/" },
              { text: "User Permission Roles", link: "/guides/team-management/team-roles/" },
              { text: "Import Team", link: "/guides/team-management/import-team/" },
              { text: "User Profile Settings", link: "/guides/team-management/profile-settings/" },
            ],
          },
          {
            text: "Production Structure",
            collapsed: false,
            link: "/guides/production-structure/",
            items: [
              { text: "Manage Studios", link: "/guides/production-structure/manage-studios/" },
              { text: "Manage Productions", link: "/guides/production-structure/manage-productions/" },
              { text: "Manage Episodes", link: "/guides/production-structure/manage-episodes/" },
              { text: "Manage Sequences", link: "/guides/production-structure/manage-sequences/" },
              { text: "Manage Shots", link: "/guides/production-structure/manage-shots/" },
            ],
          },
          {
            text: "Task Configuration",
            collapsed: false,
            link: "/guides/task-configuration/",
            items: [
              { text: "Manage Asset Types", link: "/guides/task-configuration/managing-asset-types/" },
              { text: "Manage Task Types", link: "/guides/task-configuration/managing-task-types/" },
              { text: "Manage Task Statuses", link: "/guides/task-configuration/managing-task-statuses/" },
            ],
          },
          {
            text: "Pre-Production",
            collapsed: false,
            link: "/guides/pre-production/",
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
            link: "/guides/scheduling/",
            items: [
              { text: "Assign Tasks", link: "/guides/scheduling/assign-tasks/" },
              { text: "Find Assignments", link: "/guides/scheduling/find-assignments/" },
              { text: "Schedules", link: "/guides/scheduling/schedules/" },
              { text: "Estimates", link: "/guides/scheduling/estimates/" },
              { text: "Durations vs Estimates", link: "/guides/scheduling/durations-vs-estimates/" },
            ],
          },
          {
            text: "Review & Publishing",
            collapsed: false,
            link: "/guides/review-publishing/",
            items: [
              { text: "Update Task Progress", link: "/guides/review-publishing/update-task-progress/" },
              { text: "Publish", link: "/guides/review-publishing/publish/" },
              { text: "Review", link: "/guides/review-publishing/review/" },
              { text: "Playlist", link: "/guides/review-publishing/playlist/" },
              { text: "Manage Edits", link: "/guides/review-publishing/manage-edits/" },
            ],
          },
          {
            text: "Tracking & Reporting",
            collapsed: false,
            link: "/guides/tracking-reporting/",
            items: [
                { text: "Timesheets", link: "/guides/tracking-reporting/timesheets/" },
                { text: "Ensure Tasks are On-Time", link: "/guides/tracking-reporting/ensure-tasks-on-time/" },
                { text: "Understand Why a Task Is Late", link: "/guides/tracking-reporting/understand-why-late-task/" },
                { text: "Studio Overview", link: "/guides/tracking-reporting/studio-overview/" },
                { text: "Production Overview", link: "/guides/tracking-reporting/production-overview/" },
                { text: "Quotas", link: "/guides/tracking-reporting/quotas/" },
                { text: "Advanced Search & Filters", link: "/guides/tracking-reporting/filter/" },
                { text: "Budgeting", link: "/guides/tracking-reporting/budget/" },
                { text: "Thumbnails", link: "/guides/tracking-reporting/thumbnails/" },
            ],
          },
          {
            text: "Privacy & Security",
            collapsed: false,
            link: "/guides/privacy-security/",
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
          { text: "(Concept) For TV Shows", link: "/recipes/tvshows/" },
          { text: "(Concept) For 2D", link: "/recipes/2d/" },
          { text: "Quickstart for TV Shows", link: "/recipes/for-tvshows/" },
          { text: "Quickstart for Feature Films", link: "/recipes/for-feature-films/" },
          { text: "Quickstart for Shorts", link: "/recipes/for-shorts/" },
          { text: "Quickstart for Video Games", link: "/recipes/for-videogames/" },
          { text: "Quickstart for Shots-Only Productions", link: "/recipes/shots-only-production/" },
          { text: "Quickstart for Assets-Only Productions", link: "/recipes/assets-only-production/" },
          { text: "3D Background", link: "/recipes/3d-background/" },
        ],
      },
      {
        text: "Resources",
        collapsed: false,
        items: [
          {
            text: "UI Reference",
            link: "/resources/ui/"
          },
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
  transformPageData(pageData, { siteConfig }) {
    if (pageData.filePath) {
      const fullPath = path.join(siteConfig.srcDir, pageData.filePath)
      if (fs.existsSync(fullPath)) {
        const raw = fs.readFileSync(fullPath, 'utf-8')
        let content = resolveIncludes(raw, path.dirname(fullPath))
        content = stripRegionMarkers(content)
        content = stripScripts(content)
        content = stripComponents(content)
        content = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
        
        pageData.rawContent = content
      }
    }
  }
};