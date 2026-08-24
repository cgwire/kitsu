import {
  createRunner,
  parse,
  PuppeteerRunnerExtension,
} from "@puppeteer/replay";
import fs from "fs/promises";
import path from "path";
import os from "os";
import puppeteer, { Locator } from "puppeteer";

const replayPath = process.argv[2];
if (!replayPath) {
  console.error("Usage: node ./scripts/screenshots.js <path-to-replay.json>");
  process.exit(1);
}

const LOGIN_URL = "http://localhost/login";
// A route that requires auth. Hitting this is a better probe than /login:
// we check whether the app bounces us *to* login, rather than trusting that
// it bounces us off it.
const AUTH_CHECK_URL = "http://localhost/";
const COOKIE_FILE = path.join(os.homedir(), ".cache", "replay-cookies.json");
const PERSIST_DAYS = 30;

const browser = await puppeteer.launch({ headless: false });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 4 });

// ---------------------------------------------------------------------------
// Cookie persistence
// ---------------------------------------------------------------------------

const nowSeconds = () => Math.floor(Date.now() / 1000);

async function saveCookies() {
  const cookies = await browser.cookies();
  if (!cookies.length) {
    console.warn("No cookies to save.");
    return;
  }

  await fs.mkdir(path.dirname(COOKIE_FILE), { recursive: true });
  await fs.writeFile(COOKIE_FILE, JSON.stringify(cookies, null, 2), {
    mode: 0o600, // session tokens — don't leave these world-readable
  });

  console.log(`Saved ${cookies.length} cookie(s) to ${COOKIE_FILE}`);
}

async function restoreCookies() {
  let saved;
  try {
    saved = JSON.parse(await fs.readFile(COOKIE_FILE, "utf8"));
  } catch (e) {
    if (e.code !== "ENOENT") console.warn(`Could not read cookie file: ${e.message}`);
    return;
  }

  const now = nowSeconds();
  const live = saved.filter(
    (c) => c.session || c.expires === -1 || c.expires > now,
  );
  if (!live.length) {
    console.log("Stored cookies have all expired — logging in fresh.");
    return;
  }

  const scheme = new URL(LOGIN_URL).protocol; // "http:"
  const futureExpiry = now + 60 * 60 * 24 * PERSIST_DAYS;

  // Set one at a time: a single cookie Chrome dislikes shouldn't take the
  // whole restore down with it.
  let restored = 0;
  for (const cookie of live) {
    const { session, size, domain, expires, ...rest } = cookie;

    const scoped = domain.startsWith(".")
      ? { ...rest, domain } // genuine domain cookie — keep the leading dot
      : { ...rest, url: `${scheme}//${domain}` }; // host-only — scope by URL

    try {
      await browser.setCookie({
        ...scoped,
        expires: session || expires === -1 ? futureExpiry : expires,
      });
      restored++;
    } catch (e) {
      console.warn(`Skipped cookie "${cookie.name}": ${e.message}`);
    }
  }

  console.log(`Restored ${restored}/${live.length} cookie(s).`);
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

function isLoginPage() {
  try {
    return new URL(page.url()).pathname.startsWith("/login");
  } catch {
    return false; // about:blank and friends
  }
}

async function ensureLoggedIn() {
  await page.goto(AUTH_CHECK_URL, { waitUntil: "networkidle2" });

  // If the session is valid we stay put; otherwise the app redirects to /login.
  if (!isLoginPage()) {
    console.log("Already signed in — continuing.");
    return;
  }

  console.log(`\nPlease log in at ${LOGIN_URL} in the browser window.`);
  console.log("The replay will start automatically once you're through.\n");

  if (page.url() !== LOGIN_URL) {
    await page.goto(LOGIN_URL, { waitUntil: "networkidle2" });
  }

  while (isLoginPage()) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  await page.waitForNetworkIdle({ idleTime: 500 }).catch(() => {});
  console.log("Signed in — starting replay.");
}

await restoreCookies();
await ensureLoggedIn();

// ---------------------------------------------------------------------------
// Replay setup
// ---------------------------------------------------------------------------

// Output to <replay-dir>/images/<replay-basename>/
const replayDir = path.dirname(replayPath);
const replayBasename = path.basename(replayPath, path.extname(replayPath));
const screenshotsDir = path.join(replayDir, "images", replayBasename);

await fs.mkdir(screenshotsDir, { recursive: true });
let stepIndex = 0;

const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQADhQGAWjR9awAAAABJRU5ErkJggg==";

const tmpUploadFile = path.join(os.tmpdir(), "test-upload.png");
await fs.writeFile(tmpUploadFile, Buffer.from(PNG_BASE64, "base64"));
console.log(`Temporary upload file created at: ${tmpUploadFile}`);

// Step types @puppeteer/replay's parse() won't accept
const UNSUPPORTED_TYPES = new Set(["uploadFile"]);

class Extension extends PuppeteerRunnerExtension {
  async runStep(step, flow) {
    if (step.type === "uploadFile") {
      await this.handleFileUpload(step);
      return;
    }
    await super.runStep(step, flow);
  }

  async handleFileUpload(step) {
    const element = await Locator.race([
      page.locator(
        "::-p-aria(Select files from your hard drive: Screenshot from 2026-05-21 18-15-13.png)",
      ),
      page.locator("div.is-active input"),
      page.locator(
        '::-p-xpath(//*[@id="modal-content"]/div[1]/form/div/label/input)',
      ),
      page.locator(":scope >>> div.is-active input"),
    ])
      .setTimeout(10000)
      .waitHandle();

    await element.uploadFile(tmpUploadFile);
  }

  async afterEachStep(step, flow) {
    await super.afterEachStep(step, flow);
    await Promise.race([
      page.waitForNetworkIdle({ idleTime: 500 }),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]);

    const filename = path.join(
      screenshotsDir,
      `${String(stepIndex).padStart(3, "0")}.png`,
    );
    await page.screenshot({ path: filename, fullPage: false });
    console.log(`Screenshot saved: ${filename}`);

    stepIndex++;
  }
}

const recordingText = await fs.readFile(replayPath, "utf8");
const rawRecording = JSON.parse(recordingText);

// Stash upload steps with their original index BEFORE removing them
const uploadSteps = {};
rawRecording.steps = rawRecording.steps.map((step, i) => {
  if (UNSUPPORTED_TYPES.has(step.type)) {
    uploadSteps[i] = step; // save for runStep to pick up
    // Replace with a no-op step that parse() accepts
    return { type: "waitForElement", selectors: ["body"], timeout: 100 };
  }
  return step;
});

// Now parse() won't choke on unknown types
const recording = parse(rawRecording);

// Patch the parsed steps back so runStep sees the real uploadFile objects
recording.steps = recording.steps.map((step, i) => uploadSteps[i] ?? step);

const runner = await createRunner(
  recording,
  new Extension(browser, page, 7000),
);

try {
  await runner.run();
} finally {
  await saveCookies().catch((e) => console.error("save failed:", e.message));
  await browser.close();
}