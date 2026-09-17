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
        logo: "/kitsu.png",
        search: {
          provider: "local",
        },
        outline: {
          level: [2, 3]
        },
        sidebar: [
          {
            text: "はじめに",
            collapsed: false,
            items: [
              { text: "入門", link: "/ja/start-here/getting-started/",},
            ],
          },
          {
            text: "ガイド",
            collapsed: false,
            items: [
              {
                text: "チーム管理",
                collapsed: false,
                link: "/ja/guides/team-management/",
                items: [
                  { text: "部門の管理", link: "/ja/guides/team-management/managing-departments/" },
                  { text: "チームの管理", link: "/ja/guides/team-management/managing-teams/" },
                  { text: "ユーザー権限ロール", link: "/ja/guides/team-management/team-roles/" },
                  { text: "チームのインポート", link: "/ja/guides/team-management/import-team/" },
                  { text: "ユーザープロフィール設定", link: "/ja/guides/team-management/profile-settings/" },
                ],
              },
              {
                text: "タスク設定",
                collapsed: false,
                link: "/ja/guides/task-configuration/",
                items: [
                  { text: "タスクタイプの管理", link: "/ja/guides/task-configuration/managing-task-types/" },
                  { text: "タスクステータスの管理", link: "/ja/guides/task-configuration/managing-task-statuses/" },
                  { text: "ステータスの自動化", link: "/ja/guides/task-configuration/status-automation/" },
                ],
              },
              {
                text: "プロダクション構成",
                collapsed: false,
                link: "/ja/guides/production-structure/",
                items: [
                  { text: "プロダクションの管理", link: "/ja/guides/production-structure/manage-productions/" },
                  { text: "エピソードの管理", link: "/ja/guides/production-structure/manage-episodes/" },
                  { text: "シーケンスの管理", link: "/ja/guides/production-structure/manage-sequences/" },
                  { text: "ショットの管理", link: "/ja/guides/production-structure/manage-shots/" },
                  { text: "スタジオラベルの管理", link: "/ja/guides/production-structure/manage-studios/" },
                ],
              },
              {
                text: "プロダクション",
                collapsed: false,
                link: "/ja/guides/production/",
                items: [
                  { text: "コンセプトの管理", link: "/ja/guides/production/manage-concepts/" },
                  { text: "アセットタイプの管理", link: "/ja/guides/production/managing-asset-types/" },
                  { text: "アセットの管理", link: "/ja/guides/production/manage-assets/" },
                  { text: "タスクの割り当て", link: "/ja/guides/production/assign-tasks/" },
                  { text: "担当タスクの確認", link: "/ja/guides/production/find-assignments/" },
                  { text: "ブレイクダウンとキャスティング", link: "/ja/guides/production/breakdown-casting/" },
                  { text: "メタカラム", link: "/ja/guides/production/meta-column/"},
                  { text: "3D背景", link: "/ja/guides/production/3d-background/" },
                ],
              },
              {
                text: "スケジューリング",
                collapsed: false,
                link: "/ja/guides/scheduling/",
                items: [
                  { text: "スケジュール", link: "/ja/guides/scheduling/schedules/" },
                  { text: "見積もり", link: "/ja/guides/scheduling/estimates/" },
                  { text: "実績時間と見積もりの比較", link: "/ja/guides/scheduling/durations-vs-estimates/" },
                ],
              },
              {
                text: "レビューとパブリッシュ",
                collapsed: false,
                link: "/ja/guides/review-publishing/",
                items: [
                  { text: "タスク進捗の更新", link: "/ja/guides/review-publishing/update-task-progress/" },
                  { text: "パブリッシュ", link: "/ja/guides/review-publishing/publish/" },
                  { text: "レビュー", link: "/ja/guides/review-publishing/review/" },
                  { text: "プレイリスト", link: "/ja/guides/review-publishing/playlist/" },
                  { text: "エディットの管理", link: "/ja/guides/review-publishing/manage-edits/" },
                ],
              },
              {
                text: "トラッキングとレポート",
                collapsed: false,
                link: "/ja/guides/tracking-reporting/",
                items: [
                    { text: "タイムシート", link: "/ja/guides/tracking-reporting/timesheets/" },
                    { text: "タスクを期限内に完了させる", link: "/ja/guides/tracking-reporting/ensure-tasks-on-time/" },
                    { text: "タスク遅延の原因を把握する", link: "/ja/guides/tracking-reporting/understand-why-late-task/" },
                    { text: "スタジオ概要", link: "/ja/guides/tracking-reporting/studio-overview/" },
                    { text: "プロダクション概要", link: "/ja/guides/tracking-reporting/production-overview/" },
                    { text: "ノルマ", link: "/ja/guides/tracking-reporting/quotas/" },
                    { text: "高度な検索とフィルター", link: "/ja/guides/tracking-reporting/filter/" },
                    { text: "予算管理", link: "/ja/guides/tracking-reporting/budget/" },
                    { text: "サムネイル", link: "/ja/guides/tracking-reporting/thumbnails/" },
                ],
              },
              {
                text: "プライバシーとセキュリティ",
                collapsed: false,
                link: "/ja/guides/privacy-security/",
                items: [
                  { text: "認証", link: "/ja/guides/privacy-security/authentication/" },
                  { text: "ログ", link: "/ja/guides/privacy-security/logs/" },
                    // { text: "知的財産保護", link: "/ja/" },
                    // { text: "認可", link: "/ja/" },
                ],
              },
            ]
          },
          {
            text: "ハンドブック",
            collapsed: false,
            items: [
              {
                text: "スーパーバイザー向け",
                link: "/ja/handbooks/for-supervisors/",
              },
              {
                text: "プロデューサー向け",
                link: "/ja/handbooks/for-producers/",
              },
              {
                text: "アーティスト向け",
                link: "/ja/handbooks/for-artists/",
              },
              {
                text: "クライアント向け",
                link: "/ja/handbooks/for-clients/",
              },
              {
                text: "開発者向け",
                collapsed: true,
                link: "https://dev.kitsu.cloud/",
              },
            ]
          },
          {
            text: "レシピ",
            collapsed: false,
            items: [
              { text: "TVシリーズ向けクイックスタート", link: "/ja/recipes/for-tvshows/" },
              { text: "長編映画向けクイックスタート", link: "/ja/recipes/for-feature-films/" },
              { text: "短編向けクイックスタート", link: "/ja/recipes/for-shorts/" },
              { text: "ビデオゲーム向けクイックスタート", link: "/ja/recipes/for-videogames/" },
              { text: "ショットのみのプロダクション向けクイックスタート", link: "/ja/recipes/shots-only-production/" },
              { text: "アセットのみのプロダクション向けクイックスタート", link: "/ja/recipes/assets-only-production/" },
            ],
          },
          {
            text: "リソース",
            collapsed: false,
            items: [
              {
                text: "UIリファレンス",
                link: "/ja/resources/ui/"
              },
              {
                text: "変更履歴",
                collapsed: true,
                "link": "https://cgwire.canny.io/changelog"
              }
            ],
          },
          {
              text: "よくある質問",
              link: "/ja/resources/faq/"
          },
        ],
      }
    },
    fr: {
      lang: "fr-FR",
      label: "Français",
      title: "Documentation Kitsu",
      description:
        "La documentation de Kitsu, la plateforme de collaboration pour les équipes créatives",
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
            text: "Commencer ici",
            collapsed: false,
            items: [
              { text: "Premiers pas", link: "/fr/start-here/getting-started/",},
            ],
          },
          {
            text: "Guides",
            collapsed: false,
            items: [
              {
                text: "Gestion d'équipe",
                collapsed: false,
                link: "/fr/guides/team-management/",
                items: [
                  { text: "Gérer les départements", link: "/fr/guides/team-management/managing-departments/" },
                  { text: "Gérer les équipes", link: "/fr/guides/team-management/managing-teams/" },
                  { text: "Rôles et permissions des utilisateurs", link: "/fr/guides/team-management/team-roles/" },
                  { text: "Importer une équipe", link: "/fr/guides/team-management/import-team/" },
                  { text: "Paramètres du profil utilisateur", link: "/fr/guides/team-management/profile-settings/" },
                ],
              },
              {
                text: "Configuration des tâches",
                collapsed: false,
                link: "/fr/guides/task-configuration/",
                items: [
                  { text: "Gérer les types de tâches", link: "/fr/guides/task-configuration/managing-task-types/" },
                  { text: "Gérer les statuts de tâches", link: "/fr/guides/task-configuration/managing-task-statuses/" },
                  { text: "Automatisation des statuts", link: "/fr/guides/task-configuration/status-automation/" },
                ],
              },
              {
                text: "Structure de production",
                collapsed: false,
                link: "/fr/guides/production-structure/",
                items: [
                  { text: "Gérer les productions", link: "/fr/guides/production-structure/manage-productions/" },
                  { text: "Gérer les épisodes", link: "/fr/guides/production-structure/manage-episodes/" },
                  { text: "Gérer les séquences", link: "/fr/guides/production-structure/manage-sequences/" },
                  { text: "Gérer les plans", link: "/fr/guides/production-structure/manage-shots/" },
                  { text: "Gérer les labels de studio", link: "/fr/guides/production-structure/manage-studios/" },
                ],
              },
              {
                text: "Production",
                collapsed: false,
                link: "/fr/guides/production/",
                items: [
                  { text: "Gérer les concepts", link: "/fr/guides/production/manage-concepts/" },
                  { text: "Gérer les types d'assets", link: "/fr/guides/production/managing-asset-types/" },
                  { text: "Gérer les assets", link: "/fr/guides/production/manage-assets/" },
                  { text: "Assigner des tâches", link: "/fr/guides/production/assign-tasks/" },
                  { text: "Trouver les assignations", link: "/fr/guides/production/find-assignments/" },
                  { text: "Breakdown et casting", link: "/fr/guides/production/breakdown-casting/" },
                  { text: "Méta-colonnes", link: "/fr/guides/production/meta-column/"},
                  { text: "Arrière-plan 3D", link: "/fr/guides/production/3d-background/" },
                ],
              },
              {
                text: "Planification",
                collapsed: false,
                link: "/fr/guides/scheduling/",
                items: [
                  { text: "Plannings", link: "/fr/guides/scheduling/schedules/" },
                  { text: "Estimations", link: "/fr/guides/scheduling/estimates/" },
                  { text: "Durées vs estimations", link: "/fr/guides/scheduling/durations-vs-estimates/" },
                ],
              },
              {
                text: "Review et publication",
                collapsed: false,
                link: "/fr/guides/review-publishing/",
                items: [
                  { text: "Mettre à jour l'avancement des tâches", link: "/fr/guides/review-publishing/update-task-progress/" },
                  { text: "Publier", link: "/fr/guides/review-publishing/publish/" },
                  { text: "Review", link: "/fr/guides/review-publishing/review/" },
                  { text: "Playlist", link: "/fr/guides/review-publishing/playlist/" },
                  { text: "Gérer les montages", link: "/fr/guides/review-publishing/manage-edits/" },
                ],
              },
              {
                text: "Suivi et rapports",
                collapsed: false,
                link: "/fr/guides/tracking-reporting/",
                items: [
                    { text: "Feuilles de temps", link: "/fr/guides/tracking-reporting/timesheets/" },
                    { text: "Garantir le respect des délais", link: "/fr/guides/tracking-reporting/ensure-tasks-on-time/" },
                    { text: "Comprendre le retard d'une tâche", link: "/fr/guides/tracking-reporting/understand-why-late-task/" },
                    { text: "Vue d'ensemble du studio", link: "/fr/guides/tracking-reporting/studio-overview/" },
                    { text: "Vue d'ensemble de la production", link: "/fr/guides/tracking-reporting/production-overview/" },
                    { text: "Quotas", link: "/fr/guides/tracking-reporting/quotas/" },
                    { text: "Recherche avancée et filtres", link: "/fr/guides/tracking-reporting/filter/" },
                    { text: "Budget", link: "/fr/guides/tracking-reporting/budget/" },
                    { text: "Vignettes", link: "/fr/guides/tracking-reporting/thumbnails/" },
                ],
              },
              {
                text: "Confidentialité et sécurité",
                collapsed: false,
                link: "/fr/guides/privacy-security/",
                items: [
                  { text: "Authentification", link: "/fr/guides/privacy-security/authentication/" },
                  { text: "Journaux", link: "/fr/guides/privacy-security/logs/" },
                    // { text: "Protection de la propriété intellectuelle", link: "/fr/" },
                    // { text: "Autorisation", link: "/fr/" },
                ],
              },
            ]
          },
          {
            text: "Manuels",
            collapsed: false,
            items: [
              {
                text: "Pour les superviseurs",
                link: "/fr/handbooks/for-supervisors/",
              },
              {
                text: "Pour les producteurs",
                link: "/fr/handbooks/for-producers/",
              },
              {
                text: "Pour les artistes",
                link: "/fr/handbooks/for-artists/",
              },
              {
                text: "Pour les clients",
                link: "/fr/handbooks/for-clients/",
              },
              {
                text: "Pour les développeurs",
                collapsed: true,
                link: "https://dev.kitsu.cloud/",
              },
            ]
          },
          {
            text: "Recettes",
            collapsed: false,
            items: [
              { text: "Démarrage rapide pour les séries TV", link: "/fr/recipes/for-tvshows/" },
              { text: "Démarrage rapide pour les longs métrages", link: "/fr/recipes/for-feature-films/" },
              { text: "Démarrage rapide pour les courts métrages", link: "/fr/recipes/for-shorts/" },
              { text: "Démarrage rapide pour les jeux vidéo", link: "/fr/recipes/for-videogames/" },
              { text: "Démarrage rapide pour les productions de plans uniquement", link: "/fr/recipes/shots-only-production/" },
              { text: "Démarrage rapide pour les productions d'assets uniquement", link: "/fr/recipes/assets-only-production/" },
            ],
          },
          {
            text: "Ressources",
            collapsed: false,
            items: [
              {
                text: "Référence de l'interface",
                link: "/fr/resources/ui/"
              },
              {
                text: "Journal des modifications",
                collapsed: true,
                "link": "https://cgwire.canny.io/changelog"
              }
            ],
          },
          {
              text: "Foire aux questions",
              link: "/fr/resources/faq/"
          },
        ],
      }
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
            text: "Task Configuration",
            collapsed: false,
            link: "/guides/task-configuration/",
            items: [
              { text: "Manage Task Types", link: "/guides/task-configuration/managing-task-types/" },
              { text: "Manage Task Statuses", link: "/guides/task-configuration/managing-task-statuses/" },
              { text: "Status Automation", link: "/guides/task-configuration/status-automation/" },
            ],
          },
          {
            text: "Production Structure",
            collapsed: false,
            link: "/guides/production-structure/",
            items: [
              { text: "Manage Productions", link: "/guides/production-structure/manage-productions/" },
              { text: "Manage Episodes", link: "/guides/production-structure/manage-episodes/" },
              { text: "Manage Sequences", link: "/guides/production-structure/manage-sequences/" },
              { text: "Manage Shots", link: "/guides/production-structure/manage-shots/" },
              { text: "Manage Studio Labels", link: "/guides/production-structure/manage-studios/" },
            ],
          },
          {
            text: "Production",
            collapsed: false,
            link: "/guides/production/",
            items: [
              { text: "Manage Concepts", link: "/guides/production/manage-concepts/" },
              { text: "Manage Asset Types", link: "/guides/production/managing-asset-types/" },
              { text: "Manage Assets", link: "/guides/production/manage-assets/" },
              { text: "Assign Tasks", link: "/guides/production/assign-tasks/" },
              { text: "Find Assignments", link: "/guides/production/find-assignments/" },
              { text: "Breakdown & Casting", link: "/guides/production/breakdown-casting/" },
              { text: "Meta-Columns", link: "/guides/production/meta-column/"},
              { text: "3D Background", link: "/guides/production/3d-background/" },
            ],
          },
          {
            text: "Scheduling",
            collapsed: false,
            link: "/guides/scheduling/",
            items: [
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
        text: "Recipes",
        collapsed: false,
        items: [
          { text: "Quickstart for TV Shows", link: "/recipes/for-tvshows/" },
          { text: "Quickstart for Feature Films", link: "/recipes/for-feature-films/" },
          { text: "Quickstart for Shorts", link: "/recipes/for-shorts/" },
          { text: "Quickstart for Video Games", link: "/recipes/for-videogames/" },
          { text: "Quickstart for Shots-Only Productions", link: "/recipes/shots-only-production/" },
          { text: "Quickstart for Assets-Only Productions", link: "/recipes/assets-only-production/" },
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
            text: "Changelog",
            collapsed: true,
            "link": "https://cgwire.canny.io/changelog"
          }
        ],
      },
      {
          text: "Frequently Asked Questions",
          link: "/resources/faq/"
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