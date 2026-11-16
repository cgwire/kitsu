// @vitest-environment node
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { compileString } from 'sass'
import { describe, expect, it } from 'vitest'

const read = path =>
  readFileSync(
    fileURLToPath(new URL(`../../src/${path}`, import.meta.url)),
    'utf8'
  )

// vite.config.js injects variables.scss before theme.scss too.
const css = compileString(
  read('variables.scss') + read('styles/theme.scss')
).css

// The custom properties of the first block that starts with the selector.
const tokensOf = selector => {
  const block = css.slice(css.indexOf(selector)).split('}')[0]
  return Object.fromEntries(
    [...block.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [
      name,
      value.trim()
    ])
  )
}

const luminance = hex => {
  const digits = hex.replace('#', '')
  const full =
    digits.length === 3 ? [...digits].map(digit => digit + digit).join('') : digits
  const [r, g, b] = [0, 2, 4]
    .map(index => parseInt(full.slice(index, index + 2), 16) / 255)
    .map(channel =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    )
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const contrast = (first, second) => {
  const [lighter, darker] = [luminance(first), luminance(second)].sort(
    (a, b) => b - a
  )
  return (lighter + 0.05) / (darker + 0.05)
}

describe('theme.scss', () => {
  it('reads the dark theme text at 4.5:1 on a hovered or selected item', () => {
    const dark = tokensOf('.dark')
    const pairs = ['--background-selectable', '--background-selected'].flatMap(
      background => ['--text', '--text-strong'].map(text => [text, background])
    )
    pairs.forEach(([text, background]) => {
      expect(
        contrast(dark[text], dark[background]),
        `${text} on ${background}`
      ).toBeGreaterThanOrEqual(4.5)
    })
  })
})
