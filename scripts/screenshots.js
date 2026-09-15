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
const AUTH_CHECK_URL = "http://localhost/";
const COOKIE_FILE = path.join(os.homedir(), ".cache", "replay-cookies.json");
const PERSIST_DAYS = 30;

// --- Timing (all values in ms) ---
const NETWORK_IDLE_TIME = 500; // quiet period that counts as "idle"
const STEP_SETTLE_DELAY = 500; // pause after every step before screenshotting
const NAVIGATE_SETTLE_DELAY = 500; // extra pause after a navigate step

const STEP_TIMEOUT = 7000; // per-step timeout handed to the runner
const LOGIN_POLL_INTERVAL = 500; // how often to re-check the login page
const NETWORK_IDLE_TIMEOUT = 3000; // cap on waiting for that idle period
const UPLOAD_LOCATOR_TIMEOUT = 10000; // waiting for the file input to appear
const NOOP_STEP_TIMEOUT = 100; // placeholder step standing in for unsupported types

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const browser = await puppeteer.launch({ headless: false });
const page = await browser.newPage();

const nowSeconds = () => Math.floor(Date.now() / 1000);

async function saveCookies() {
  const cookies = await browser.cookies();
  if (!cookies.length) {
    console.warn("No cookies to save.");
    return;
  }

  await fs.mkdir(path.dirname(COOKIE_FILE), { recursive: true });
  await fs.writeFile(COOKIE_FILE, JSON.stringify(cookies, null, 2), {
    mode: 0o600,
  });

  console.log(`Saved ${cookies.length} cookie(s) to ${COOKIE_FILE}`);
}

async function restoreCookies() {
  let saved;
  try {
    saved = JSON.parse(await fs.readFile(COOKIE_FILE, "utf8"));
  } catch (e) {
    if (e.code !== "ENOENT")
      console.warn(`Could not read cookie file: ${e.message}`);
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

  const scheme = new URL(LOGIN_URL).protocol;
  const futureExpiry = now + 60 * 60 * 24 * PERSIST_DAYS;

  let restored = 0;
  for (const cookie of live) {
    const { session, size, domain, expires, ...rest } = cookie;

    const scoped = domain.startsWith(".")
      ? { ...rest, domain }
      : { ...rest, url: `${scheme}//${domain}` };

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

function isLoginPage() {
  try {
    return new URL(page.url()).pathname.startsWith("/login");
  } catch {
    return false;
  }
}

async function ensureLoggedIn() {
  await page.goto(AUTH_CHECK_URL, { waitUntil: "networkidle2" });

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
    await sleep(LOGIN_POLL_INTERVAL);
  }

  await page.waitForNetworkIdle({ idleTime: NETWORK_IDLE_TIME }).catch(() => { });

  console.log("Signed in — starting replay.");
}

await restoreCookies();
await ensureLoggedIn();

const LOCAL_STORAGE = {
  "datatable-episode-name": "266px",
  "datatable-sequence-Name": "295px",
  "datatable-shot-Name": "232px",
};

await page.evaluateOnNewDocument((entries) => {
  try {
    for (const [k, v] of Object.entries(entries)) localStorage.setItem(k, v);
  } catch { }
}, LOCAL_STORAGE);

await page.evaluate((entries) => {
  for (const [k, v] of Object.entries(entries)) localStorage.setItem(k, v);
}, LOCAL_STORAGE);
await page.reload({ waitUntil: "networkidle2" });

console.log(
  `Seeded ${Object.keys(LOCAL_STORAGE).length} localStorage entrie(s).`,
);

const replayDir = path.dirname(path.resolve(replayPath));
const screenshotsDir = path.join(replayDir, "screenshots");

await fs.mkdir(screenshotsDir, { recursive: true });

let stepIndex = 0;
let metaIndex = 0;

const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQADhQGAWjR9awAAAABJRU5ErkJggg==";

var tmpUploadFile = path.join(os.tmpdir(), "test-upload.png");
await fs.writeFile(tmpUploadFile, Buffer.from(PNG_BASE64, "base64"));
console.log(`Temporary upload file created at: ${tmpUploadFile}`);

const UNSUPPORTED_TYPES = new Set(["uploadFile", "end"]);

const INERT_TYPES = new Set(["end"]);

const isIgnored = (meta) => meta?.ignore === true;

class Extension extends PuppeteerRunnerExtension {
  currentMeta = null;

  async beforeEachStep(step, flow) {
    await super.beforeEachStep(step, flow);

    if (step.type === "setViewport") return;

    const meta = stepMeta[metaIndex++];
    this.currentMeta = meta;

    if (isIgnored(meta)) {
      console.log(`[step —] ${step.type} (ignored)`);
      return;
    }

    if (INERT_TYPES.has(step.type)) {
      console.log(`[step ${stepIndex}] ${step.type} (inert)`);
      return;
    }

    console.log(`[step ${stepIndex}] ${step.type}`);
  }

  async runStep(step, flow) {
    if (INERT_TYPES.has(step.type)) return;
    if (step.type === "uploadFile") {
      await this.handleFileUpload(step);
      return;
    }
    await super.runStep(step, flow);
  }

  async handleFileUpload(step) {
    const element = await Locator.race([
      page.locator(
        step.selectors[0][0]
      )
    ])
    .setTimeout(UPLOAD_LOCATOR_TIMEOUT)
    .waitHandle();
    
    const filename = step.file
    
    await element.uploadFile(filename);
  }

  async afterEachStep(step, flow) {
    await super.afterEachStep(step, flow);

    if (step.type === "setViewport") return;
    if (INERT_TYPES.has(step.type)) return;
    if (isIgnored(this.currentMeta)) return;

    await Promise.race([
      page.waitForNetworkIdle({ idleTime: NETWORK_IDLE_TIME }),
      sleep(NETWORK_IDLE_TIMEOUT),
    ]);

    await sleep(
      step.type === "navigate" ? NAVIGATE_SETTLE_DELAY : STEP_SETTLE_DELAY,
    );

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

const rawSteps = {};
const stepMeta = [];

rawRecording.steps = rawRecording.steps.map((step, i) => {
  if (step.type === "setViewport") return step;

  stepMeta.push({ ignore: step.ignore === true });

  if (UNSUPPORTED_TYPES.has(step.type)) {
    rawSteps[i] = step;
    return {
      type: "waitForElement",
      selectors: ["body"],
      timeout: NOOP_STEP_TIMEOUT,
    };
  }
  return step;
});

const recording = parse(rawRecording);

recording.steps = recording.steps.map((step, i) => rawSteps[i] ?? step);

const runner = await createRunner(
  recording,
  new Extension(browser, page, STEP_TIMEOUT),
);

try {
  await runner.run();
} finally {
  await saveCookies().catch((e) => console.error("save failed:", e.message));
  await browser.close();
}