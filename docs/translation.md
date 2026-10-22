# Add a translation

Kitsu's interface is translated with
[vue-i18n](https://vue-i18n.intlify.dev/). Check its major version in
`package.json` (`vue-i18n`, currently 11), since the version-specific notes
below (e.g. the removal of `$tc()`) assume it. This guide covers how the locale
files are organized, how to add or change a key, and how to add a whole language.

## How locales are organized

- `src/locales/en.js` — the **source of truth** (a JS module, single-quoted
  values).
- Every other language is a JSON file whose messages are wrapped in a top-level
  `"default"` key (`{ "default": { … } }`) — this wrapper is **required**.
- `src/locales/index.js` imports every locale into the map used by `i18n.js`.
- Missing keys don't error: vue-i18n falls back to English
  (`fallbackLocale: 'en'`), so parity with `en.js` matters.
- `en_nft.js` and `en_video-game.js` are English-only overlays that remap a few
  words for specific production types.

## Add or change a key

1. Add it to `en.js` first (single-quoted; escape apostrophes as `\'`).
2. Add the same path to the other locale files (JSON, double-quoted). Missing
   ones fall back to English, but keeping locales in sync is preferred.
3. If the English value mentions **shot**, **sequence**, or **episode**, update
   the overlays (`en_nft.js`: _shot → NFT_; `en_video-game.js`: _shot → map_,
   _sequence → level_, _episode → chapter_), but only for keys whose wording
   actually differs. When you **rename** a key in `en.js`, rename it in the
   overlays too, or the stale override leaks the English word. Then run
   `node scripts/check-locale-overlays.js` until it prints nothing: it lists
   every missing, dead, or outdated override with the value it expects.
4. When a change alters what an `en.js` sentence says (not only a typo,
   punctuation, or casing), translate it again in every locale in the same
   commit: the tests only check that the keys exist, so a locale left alone
   keeps the old meaning.

Read keys with `$t('key')` / `t('key')`. Pluralize with the pipe format and a
named count, `$t('main.files_selected', { count })` on
`'{count} file selected | {count} files selected'`, never a bare number nor
`$tc()` (removed in vue-i18n 11). Keep the number inside the message, never next
to `$t()` in the template, so that each language can place it and make its words
agree with it.

## Add a language

Five files, mirroring how `it` is wired:

1. **`src/locales/<lang>.json`** — copy an existing JSON locale (keeps the
   required `"default"` wrapper), then translate every value at full key parity
   with `en.js`.
2. **`src/locales/index.js`** — add the import and a `.default` map entry
   (`xx: xx.default`), keeping the map alphabetical. Its key must match what
   `setLocale` resolves to: the two-letter code, or the `LOCALE_MAP` `language`
   for the Chinese variants.
3. **`src/lib/lang.js`** — `import 'moment/locale/<code>'`. Add a `LOCALE_MAP`
   entry only when the vue-i18n key or the moment code differs from the first
   two letters of the profile value (today: only `zh_Hans_CN` / `zh_Hant_TW`).
4. **`src/components/widgets/DateField.vue`** — import the date-fns locale and
   add it to `DATE_FNS_LOCALES` (keyed by two-letter code). The date picker uses
   date-fns; skip this and its calendar stays English.
5. **`src/components/pages/Profile.vue`** — add
   `{ label: 'English name (Native name)', value: 'xx_XX' }` to `localeOptions`,
   alphabetical by English name.

> **The profile `value` must be a valid Babel locale.** It is stored via
> `babel.Locale.parse` in Zou, so it must parse: a language code, an optional
> script, and an optional **valid ISO territory** (`fr_FR`, `zh_Hant_TW`), ≤ 10
> chars. A bad territory (e.g. `da_DA` — Denmark is `da_DK`) makes Zou reject
> the update with HTTP 400. Check `babel.Locale.parse('<value>')` when unsure.

## Translation rules

Preserve the machine-readable parts of each value:

- **Placeholders** (`{name}`, `{nbShots}`) — keep byte-for-byte; never translate
  the word inside the braces.
- **Pipe pluralization** — keep the same number of `|` segments (most keys have
  two; `people.seats_remaining` has three).
- **Russian and Polish plurals**: every locale gets the singular and the plural
  segment only, so where the noun changes after 2, 5, or 21, end the plural
  segment on the number, as a label or in parentheses
  (`Выбрано файлов: {count}`).
- **HTML** (e.g. the `<abbr>` in the 2FA description) — keep the tags, translate
  the visible text.
- **Hard-delete words** — `_hard_lock_text` is the exact word a user types to
  confirm; keep it identical to the `_hard_text` prompt that quotes it.
- **Domain terms** (shot, frame, onion skin, edit, …) — use Blender's official
  translation (`blender/blender-translations` `po/<lang>.po`); when Blender
  keeps a term in English, do the same.

## Validate

- `npm run test:unit` and `npm run build` import every locale, so malformed JSON
  or a broken `en.js` fails fast.
- `tests/unit/locales/parity.spec.js` fails on a key missing from a locale, a
  key `en.js` no longer has, or a different number of `|` segments.
- `node scripts/check-locale-overlays.js` checks the English overlays against
  `en.js`, and prints nothing when they follow it.
- `npm run dev` hot-swaps locale edits so you can review wording in context.
