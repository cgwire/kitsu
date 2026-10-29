// Check the English production-type overlays against en.js:
//   node scripts/check-locale-overlays.js
// Lists, per overlay, the en.js keys the remap changes with no override, the
// overrides en.js lacks or repeats as is, and the overrides that no longer
// read like en.js once remapped, with the expected value.
// Prints nothing and exits 0 when the overlays follow en.js.
import process from 'node:process'

import en from '../src/locales/en.js'
import enNft from '../src/locales/en_nft.js'
import enVideoGame from '../src/locales/en_video-game.js'

const flatten = (messages, prefix = '') =>
  Object.entries(messages).flatMap(([key, value]) =>
    value && typeof value === 'object'
      ? flatten(value, `${prefix}${key}.`)
      : [[`${prefix}${key}`, value]]
  )

// The code patterns (SH01, SQ01, E01) take no word boundary: "_" is a word
// character, so \b would miss SQ01_SH01. E01 only refuses a letter before
// it, as in SE01.
const overlays = {
  en_nft: {
    messages: enNft,
    remap: [
      [/\b([Aa]) [Ss]hot\b/g, '$1n NFT'],
      [/\bshots\b/gi, 'NFTs'],
      [/\bshot\b/gi, 'NFT'],
      [/SH(\d+)/g, 'NFT$1'],
      [/ShotName/g, 'NFTName']
    ],
    exceptions: ['shots.title']
  },
  'en_video-game': {
    messages: enVideoGame,
    remap: [
      [/\bshot(s?)\b/g, 'map$1'],
      [/\bShot(s?)\b/g, 'Map$1'],
      [/\bsequence(s?)\b/g, 'level$1'],
      [/\bSequence(s?)\b/g, 'Level$1'],
      [/\b([Aa])n episode\b/g, '$1 chapter'],
      [/\b([Aa])n Episode\b/g, '$1 Chapter'],
      [/\bepisode(s?)\b/g, 'chapter$1'],
      [/\bEpisode(s?)\b/g, 'Chapter$1'],
      [/SQ(\d+)/g, 'LV$1'],
      [/SH(\d+)/g, 'MP$1'],
      [/(?<![A-Za-z])E(\d+)/g, 'CH$1'],
      [/SequenceName/g, 'LevelName'],
      [/ShotName/g, 'MapName'],
      [/EpisodeName/g, 'ChapterName']
    ],
    exceptions: ['assets.fields.episode', 'edits.fields.episode']
  }
}

const base = new Map(flatten(en))

const report = Object.entries(overlays).flatMap(
  ([name, { messages, remap, exceptions }]) => {
    const overrides = new Map(flatten(messages))
    const expected = key =>
      remap.reduce(
        (text, [pattern, word]) => text.replace(pattern, word),
        base.get(key)
      )
    // A code such as SH01 needs an override as much as the word "shot"
    const missing = [...base]
      .filter(
        ([key, value]) =>
          typeof value === 'string' &&
          expected(key) !== value &&
          !overrides.has(key)
      )
      .map(([key]) => `missing ${key}: ${JSON.stringify(expected(key))}`)
    const dead = [...overrides.keys()]
      .filter(key => !base.has(key))
      .map(key => `not in en.js ${key}`)
    const identical = [...overrides]
      .filter(([key, value]) => base.get(key) === value)
      .map(([key]) => `same as en.js ${key}`)
    const drifted = [...overrides]
      .filter(
        ([key, value]) =>
          base.has(key) &&
          base.get(key) !== value &&
          !exceptions.includes(key) &&
          expected(key) !== value
      )
      .map(([key]) => `drifted ${key}: ${JSON.stringify(expected(key))}`)
    const lines = [...missing, ...dead, ...identical, ...drifted]
    return lines.length ? [`${name}.js`, ...lines.map(line => `  ${line}`)] : []
  }
)

if (report.length) {
  process.stdout.write(`${report.join('\n')}\n`)
  process.exitCode = 1
}
