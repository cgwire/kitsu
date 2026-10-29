import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { afterEach, describe, expect, it, vi } from 'vitest'

// index.html paints the dark theme before the app loads: its rule must match
// the theme App.vue starts with (the dark theme tests of app.spec.js).
const html = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8')
const bootScript = html.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? ''

const paintsDark = () => {
  document.documentElement.classList.remove('dark-boot')
  new Function(bootScript)()
  return document.documentElement.classList.contains('dark-boot')
}

describe('index.html', () => {
  afterEach(() => {
    localStorage.removeItem('dark-theme')
    localStorage.removeItem('dark-theme-default')
    window.history.replaceState(null, '', '/')
    document.documentElement.classList.remove('dark-boot')
    vi.restoreAllMocks()
  })

  it('paints the dark theme the user chose before the app loads', () => {
    localStorage.setItem('dark-theme', 'true')

    expect(paintsDark()).toBe(true)
  })

  it('paints the studio default the last config left', () => {
    localStorage.setItem('dark-theme-default', 'true')

    expect(paintsDark()).toBe(true)
  })

  it('keeps the light theme the user chose over the studio default', () => {
    localStorage.setItem('dark-theme', 'false')
    localStorage.setItem('dark-theme-default', 'true')

    expect(paintsDark()).toBe(false)
  })

  it('paints the shared playlists dark', () => {
    localStorage.setItem('dark-theme', 'false')
    window.history.replaceState(null, '', '/playlists/shared/token-1')

    expect(paintsDark()).toBe(true)
  })

  it('stays light without a choice or a studio default', () => {
    expect(paintsDark()).toBe(false)
  })

  it('stays light when the browser blocks the storage', () => {
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('The operation is insecure.')
    })

    expect(paintsDark()).toBe(false)
  })

  it('paints the page in the dark background of the app', () => {
    expect(html).toMatch(
      /\.dark-boot,\s*\.dark-boot body\s*\{\s*background: #36393f;/
    )
  })
})
