// @vitest-environment node

import { vi } from 'vitest'

// The entity modules transitively pull in the root store: stub it so no
// Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

import assetsStore from '@/store/modules/assets'
import editsStore from '@/store/modules/edits'
import episodesStore from '@/store/modules/episodes'
import sequencesStore from '@/store/modules/sequences'
import shotsStore from '@/store/modules/shots'
import {
  ADD_SELECTED_TASK,
  ADD_SELECTED_TASKS
} from '@/store/mutation-types'

const cell = { x: 0, y: 0 }

describe.each([
  ['assets', assetsStore, 'Asset'],
  ['edits', editsStore, 'Edit'],
  ['episodes', episodesStore, 'Episode'],
  ['sequences', sequencesStore, 'Sequence'],
  ['shots', shotsStore, 'Shot']
])('%s store, line selection on a cell selection', (_, module, type) => {
  const lines = `selected${type}s`
  const buildState = selectedLines => ({
    [lines]: selectedLines,
    [`${type.toLowerCase()}SelectionGrid`]: new Set()
  })

  // The lists read the line selection in every row: a new Map at each cell
  // click rendered them all.
  test.each([
    [ADD_SELECTED_TASK, cell],
    [ADD_SELECTED_TASKS, [cell]],
    [`CLEAR_SELECTED_${type.toUpperCase()}S`]
  ])('%s keeps an empty line selection as it is', (mutation, payload) => {
    const selectedLines = new Map()
    const state = buildState(selectedLines)

    module.mutations[mutation](state, payload)

    expect(state[lines]).toBe(selectedLines)
  })

  test.each([
    [ADD_SELECTED_TASK, cell],
    [ADD_SELECTED_TASKS, [cell]],
    [`CLEAR_SELECTED_${type.toUpperCase()}S`]
  ])('%s unselects the selected lines', (mutation, payload) => {
    const state = buildState(new Map([['line-1', { id: 'line-1' }]]))

    module.mutations[mutation](state, payload)

    expect(state[lines].size).toBe(0)
  })
})
