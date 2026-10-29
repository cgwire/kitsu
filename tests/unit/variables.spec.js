// @vitest-environment node
import { fileURLToPath } from 'node:url'

import { compile } from 'sass'
import { describe, expect, it } from 'vitest'

// vite.config.js injects variables.scss into every <style lang="scss"> block,
// so a CSS rule written there ships once per component, in nearly every CSS
// chunk. The theme custom properties live in src/styles/theme.scss.
describe('variables.scss', () => {
  it('declares Sass variables only', () => {
    const path = fileURLToPath(new URL('../../src/variables.scss', import.meta.url))
    expect(compile(path).css).toBe('')
  })
})
