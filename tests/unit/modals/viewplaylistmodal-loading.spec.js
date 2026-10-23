// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { describe, expect, it } from 'vitest'

// The playlist modal brings the playlist player with it, the heaviest code of
// a page: it loads when it opens, never with the component that shows it.
describe('ViewPlaylistModal', () => {
  it('is imported on demand only', () => {
    const src = path.resolve(process.cwd(), 'src')
    const staticImporters = fs
      .readdirSync(src, { recursive: true })
      .filter(file => /\.(js|vue)$/.test(file))
      .filter(file =>
        /^import ViewPlaylistModal from /m.test(
          fs.readFileSync(path.join(src, file), 'utf8')
        )
      )

    expect(staticImporters).toEqual([])
  })
})
