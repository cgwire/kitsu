import fs from "node:fs/promises";
import path from "node:path";

const LIST_FILE = "./to-translate.md";

const LANGUAGES = [
  { code: "fr", name: "French", outputFile: "./requests-fr.jsonl" },
  { code: "ja", name: "Japanese", outputFile: "./requests-ja.jsonl" },
];

function buildFullFilePrompt(fullMarkdownFile, languageName) {
  return `
Translate the following Markdown file to ${languageName}.

STRICT RULES:
- Preserve YAML frontmatter structure.
- Do NOT translate YAML keys and values
- Preserve all formatting, including HTML tags and Vue components
- Do NOT translate code blocks.
- Do NOT modify URLs.
- Output the COMPLETE translated markdown file.
- Do NOT wrap output in backticks.
- Do NOT add explanations.

FILE CONTENT:
${fullMarkdownFile}
`;
}

async function readFileList(listFile) {
  const content = await fs.readFile(listFile, "utf8");

  const paths = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    // ignore blank lines and comments
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    // tolerate markdown list syntax: "- path" or "* path"
    .map((line) => line.replace(/^[-*]\s+/, ""))
    // tolerate inline code: `path`
    .map((line) => line.replace(/^`(.*)`$/, "$1"))
    .map((line) => path.normalize(line));

  return [...new Set(paths)];
}

/**
 * Extracts the value of the `path` property from a file's YAML frontmatter.
 * Uses a lightweight, dependency-free parser rather than a full YAML lib,
 * since frontmatter here is a flat key/value block.
 */
function extractFrontmatterPath(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const frontmatter = match[1];

  // Match a top-level "path:" key (not indented, so we don't grab nested keys)
  const pathLine = frontmatter
    .split(/\r?\n/)
    .find((line) => /^path\s*:/.test(line));

  if (!pathLine) return null;

  let value = pathLine.slice(pathLine.indexOf(":") + 1).trim();

  // Strip surrounding quotes, single or double
  const quoted = value.match(/^["'](.*)["']$/);
  if (quoted) value = quoted[1];

  return value.length > 0 ? value : null;
}

async function loadFiles(filePaths) {
  const files = [];
  for (const filePath of filePaths) {
    try {
      const content = await fs.readFile(filePath, "utf8");
      const relativePath = path.relative(process.cwd(), path.resolve(filePath));
      const frontmatterPath = extractFrontmatterPath(content);

      if (!frontmatterPath) {
        console.warn(
          `⚠️  No "path" found in frontmatter of ${filePath}, falling back to file path as custom_id`
        );
      }

      files.push({
        customId: frontmatterPath ?? relativePath,
        content,
      });
    } catch (error) {
      console.warn(`⚠️  Skipping ${filePath}: ${error.message}`);
    }
  }
  return files;
}

async function buildJsonlForLanguage(files, language) {
  const lines = files.map((file) => {
    const request = {
      custom_id: file.customId,
      method: "POST",
      url: "/v1/responses",
      body: {
        model: "gpt-5.4-nano",
        input: buildFullFilePrompt(file.content, language.name),
      },
    };
    return JSON.stringify(request);
  });

  await fs.writeFile(language.outputFile, lines.join("\n") + "\n", "utf8");
  console.log(`✅ Batch file created at ${language.outputFile} (${lines.length} files)`);
}

async function main() {
  const filePaths = await readFileList(LIST_FILE);
  if (filePaths.length === 0) {
    throw new Error(`No paths found in ${LIST_FILE}`);
  }

  const files = await loadFiles(filePaths);
  if (files.length === 0) {
    throw new Error("None of the listed files could be read");
  }

  // custom_id must be unique per batch — warn on collisions rather than
  // silently overwriting requests later in the file.
  for (const language of LANGUAGES) {
    const seen = new Set();
    for (const file of files) {
      if (seen.has(file.customId)) {
        console.warn(`⚠️  Duplicate custom_id "${file.customId}" detected`);
      }
      seen.add(file.customId);
    }
    await buildJsonlForLanguage(files, language);
  }
}

main().catch(console.error);