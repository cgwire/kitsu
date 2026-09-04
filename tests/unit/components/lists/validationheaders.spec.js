// @vitest-environment node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

// Every list renders its validation headers twice, once for the pinned
// columns and once for the scrolling ones, and the two blocks are copies of
// each other. The `type` they pass becomes the section segment of the task
// type URL, which is what the topbar reads to know where an episode switch
// must land: a wrong value there sends the user to the production homepage
// instead of back to the list.
const sections = {
  'AssetList.vue': 'assets',
  'EditList.vue': 'edits',
  'EpisodeList.vue': 'episodes',
  'SequenceList.vue': 'sequences',
  'ShotList.vue': 'shots'
}

const readList = file =>
  fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/lists', file),
    'utf8'
  )

describe('list validation headers', () => {
  test.each(Object.entries(sections))(
    '%s points its task type links at the %s section',
    (file, section) => {
      const headers = readList(file)
        .split('<validation-header')
        .slice(1)
        .map(block => block.slice(0, block.indexOf('/>')))

      expect(headers.length).toBeGreaterThan(1)
      headers.forEach(header => expect(header).toContain(`type="${section}"`))
    }
  )
})
