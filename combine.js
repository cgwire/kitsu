const fs = require("fs");
const path = require("path");

const config = {
  themeConfig: {
    locales: {
      "/": {
        sidebar: [
          {
            title: "Introduction to Kitsu",
            collapsable: false,
            children: [["/", "Introduction"], "/configure-kitsu/", "/team/"],
          },
          {
            title: "Create Your Production",
            collapsable: true,
            children: [
              "/tvshow/",
              "/feature/",
              "/short/",
              "/short-shot/",
              "/short-asset/",
              "/videogame/",
              "/nft/",
            ],
          },
          {
            title: "Meta Columns, Filters and Production Settings",
            collapsable: true,
            children: ["/meta-column/", "/filter/", "/configure-prod/"],
          },
          {
            title: "Assignments, Estimates and Scheduling",
            collapsable: true,
            children: ["/assignation/", "/estimation/", "/schedules/"],
          },
          {
            title: "Statuses, Publishes, and Thumbnails",
            collapsable: true,
            children: ["/status/", "/publish/", "/thumbnails/"],
          },
          {
            title: "Internal Review and Client Playlists",
            collapsable: true,
            children: ["/review/", "/review-weekly/", "/playlist-client/"],
          },
          {
            title: "Supervisor Workflows",
            collapsable: true,
            children: ["/supervisor-team/", "/supervisor-tasks/"],
          },
          {
            title: "Producer Workflows",
            collapsable: true,
            children: ["/production-report/", "/studio-report/"],
          },
          {
            title: "Artist Workflows",
            collapsable: true,
            children: ["/artist/"],
          },
          {
            title: "Developer Workflows",
            collapsable: true,
            children: [
              "/custom-actions/",
              "/bots/",
              "/publisher/",
              "/chat-integration/",
              "/installation/",
            ],
          },
          {
            title: "Frequently Asked Questions",
            collapsable: true,
            children: ["/faq/"],
          },
        ],
      },
    },
  },
};

const ROOT_DOCS = "./docs";
const OUTPUT_FILE = "./combined-documentation.md";

function resolveReadmePath(entry) {
  // Entry can be a string like "/tvshow/" or "/" or an array like ["/", "Introduction"]
  const routePath = Array.isArray(entry) ? entry[0] : entry;

  if (routePath === "/") {
    return path.join(ROOT_DOCS, "README.md");
  }

  // Strip leading/trailing slashes, then build path
  const stripped = routePath.replace(/^\/|\/$/g, "");
  return path.join(ROOT_DOCS, stripped, "README.md");
}

function combineMarkdown() {
  const sidebar = config.themeConfig.locales["/"].sidebar;
  const sections = [];
  const missing = [];

  for (const group of sidebar) {
    // Add a section header for each group
    sections.push(`# ${group.title}\n`);

    for (const child of group.children) {
      const filePath = resolveReadmePath(child);
      const label = Array.isArray(child) ? child[1] : null;

      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8").trim();
        const comment = label
          ? `<!-- Source: ${filePath} (${label}) -->`
          : `<!-- Source: ${filePath} -->`;
        sections.push(`${comment}\n\n${content}\n`);
        console.log(`✓ Included: ${filePath}`);
      } else {
        missing.push(filePath);
        const note = `<!-- MISSING: ${filePath} -->`;
        sections.push(`${note}\n`);
        console.warn(`✗ Missing:  ${filePath}`);
      }
    }
  }

  const combined = sections.join("\n---\n\n");
  fs.writeFileSync(OUTPUT_FILE, combined, "utf-8");

  console.log(`\nDone! Combined file written to: ${OUTPUT_FILE}`);
  if (missing.length > 0) {
    console.log(`\n⚠ ${missing.length} file(s) were missing and skipped:`);
    missing.forEach((f) => console.log(`  - ${f}`));
  }
}

combineMarkdown();
