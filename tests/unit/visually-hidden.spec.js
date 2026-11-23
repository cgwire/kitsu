// @vitest-environment node
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { parse } from '@vue/compiler-sfc'
import { compileString } from 'sass'
import { describe, expect, it } from 'vitest'

const read = path =>
  readFileSync(fileURLToPath(new URL(`../../${path}`, import.meta.url)), 'utf8')

// vite.config.js injects variables.scss before the style block of App.vue.
const appCss = compileString(
  read('src/variables.scss') +
    parse(read('src/App.vue')).descriptor.styles[0].content
).css
const bulmaCss = read('node_modules/bulma/css/bulma.css')

// The declarations of the rule whose selector list holds the selector. Sass
// and bulma.css write one declaration per line.
const declarationsIn = (css, selector) =>
  css
    .match(
      new RegExp(`(?:^|,)\\s*\\${selector}(?![\\w-])[^{]*\\{([^}]*)\\}`, 'm')
    )?.[1]
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

// Each max-width media block: its width, then its rules.
const mediaBlocks = css =>
  css.matchAll(/@media screen and \(max-width: (\d+)px\) \{\n([\s\S]*?)\n\}/g)

// The first max-width media block holding the rule, and its declarations.
const touchRule = (css, selector) =>
  [...mediaBlocks(css)]
    .map(([, maxWidth, block]) => ({
      maxWidth,
      declarations: declarationsIn(block, selector)
    }))
    .find(rule => rule.declarations)

// ButtonSimple, ButtonLink, and ButtonHrefLink hide their responsive text
// with it rather than with the Bulma is-hidden-touch.
describe('visuallyhidden-touch', () => {
  const touch = touchRule(appCss, '.visuallyhidden-touch')

  it('hides the text at the widths of is-hidden-touch', () => {
    expect(touch, 'a max-width media rule').toBeDefined()
    expect(touch?.maxWidth).toBe(
      touchRule(bulmaCss, '.is-hidden-touch').maxWidth
    )
  })

  // display or visibility would take the text from screen readers too.
  it('hides it from sight only, like visuallyhidden', () => {
    const declarations = touch?.declarations ?? []

    expect(declarations).toEqual(declarationsIn(appCss, '.visuallyhidden'))
    expect(declarations).toContain('position: absolute !important;')
    expect(declarations).toContain('clip-path: inset(50%) !important;')
    expect(declarations.join('\n')).not.toMatch(/^(display|visibility):/m)
  })
})
