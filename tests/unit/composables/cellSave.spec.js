// @vitest-environment node

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { effectScope, nextTick, reactive } from 'vue'
import { useRoute } from 'vue-router'

vi.mock('vue-router', () => ({ useRoute: vi.fn() }))

// The parameters of a message show in its text.
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key, params) => (params ? `${key} ${JSON.stringify(params)}` : key)
  })
}))

import { buildRefusal } from '../fixtures/refusal'

import { useCellSave } from '@/composables/cellSave'

describe('useCellSave', () => {
  let route
  let scope

  const setup = () => {
    scope = effectScope()
    return scope.run(() => useCellSave(entry => entry.name))
  }
  const refuse = () => Promise.reject(buildRefusal())
  const accept = () => Promise.resolve()
  // A save that goes through once the test says so.
  const heldSave = () => {
    let release
    const held = new Promise(resolve => {
      release = resolve
    })
    return { save: () => held, release }
  }
  const shot1 = { id: 'shot-1', name: 'SH010' }
  const shot2 = { id: 'shot-2', name: 'SH020' }

  beforeEach(() => {
    const path = '/productions/production-1/shots'
    route = reactive({ path, fullPath: path })
    useRoute.mockReturnValue(route)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    scope.stop()
    vi.restoreAllMocks()
  })

  // The rows of a selection save at the same time and settle in any order.
  test('keeps the refusal of a row when another row of its change saves after it', async () => {
    const { cellSaveErrorText, saveCell } = setup()
    const { save, release } = heldSave()
    const refusal = buildRefusal()

    const refused = saveCell(shot1, () => Promise.reject(refusal))
    const saved = saveCell(shot2, save)
    expect(await refused).toBe(false)
    release()
    expect(await saved).toBe(true)

    expect(cellSaveErrorText.value).toBe('main.cell_save_error {"name":"SH010"}')
    expect(console.error).toHaveBeenCalledWith(refusal)
  })

  // Read as a refusal, a bug would blame Zou and never reach Sentry.
  test('leaves a bug unhandled, with no message', async () => {
    const { cellSaveErrorText, saveCell } = setup()
    const bug = new TypeError('No such field')

    await expect(saveCell(shot1, () => Promise.reject(bug))).rejects.toBe(bug)

    expect(cellSaveErrorText.value).toBe('')
    expect(console.error).not.toHaveBeenCalled()
  })

  test('starts a new change after a bug', async () => {
    const { cellSaveErrorText, saveCell } = setup()
    const bug = new TypeError('No such field')

    await saveCell(shot1, () => Promise.reject(bug)).catch(() => {})
    await saveCell(shot2, refuse)
    expect(cellSaveErrorText.value).toBe('main.cell_save_error {"name":"SH020"}')

    await saveCell(shot1, accept)

    expect(cellSaveErrorText.value).toBe('')
  })

  test('tells the rows of a change refused together', async () => {
    const { cellSaveErrorText, saveCell } = setup()

    await Promise.all([saveCell(shot1, refuse), saveCell(shot2, refuse)])

    expect(cellSaveErrorText.value).toBe('main.cells_save_error')
    expect(console.error).toHaveBeenCalledTimes(2)
  })

  // A cell saved at each keystroke: the last value went through.
  test('drops the refusal of a row once a later save of that row goes through', async () => {
    const { cellSaveErrorText, saveCell } = setup()
    const { save, release } = heldSave()

    const refused = saveCell(shot1, refuse)
    const saved = saveCell(shot1, save)
    await refused
    expect(cellSaveErrorText.value).toBe('main.cell_save_error {"name":"SH010"}')

    release()
    await saved

    expect(cellSaveErrorText.value).toBe('')
    expect(console.error).toHaveBeenCalledTimes(1)
  })

  // A change is over once all its saves settled: this one is not.
  test('keeps the refusal of a change still saving', async () => {
    const { cellSaveErrorText, saveCell } = setup()
    const { save, release } = heldSave()
    const shot3 = { id: 'shot-3', name: 'SH030' }

    const refused = saveCell(shot1, refuse)
    const saved = saveCell(shot2, save)
    await refused
    await saveCell(shot3, accept)

    expect(cellSaveErrorText.value).toBe('main.cell_save_error {"name":"SH010"}')
    expect(console.error).toHaveBeenCalledTimes(1)
    release()
    await saved
  })

  // A refusal must not stay above rows it does not concern.
  test('clears the message once a later change goes through, whatever its row', async () => {
    const { cellSaveErrorText, saveCell } = setup()
    const { save, release } = heldSave()

    await saveCell(shot1, refuse)
    const saved = saveCell(shot2, save)
    expect(cellSaveErrorText.value).toBe('main.cell_save_error {"name":"SH010"}')

    release()
    await saved

    expect(cellSaveErrorText.value).toBe('')
    expect(console.error).toHaveBeenCalledTimes(1)
  })

  // The page stays mounted when the topbar changes production or episode.
  test('clears the message when the list moves to another URL path', async () => {
    const { cellSaveErrorText, saveCell } = setup()

    await saveCell(shot1, refuse)
    route.path = '/productions/production-2/shots'
    route.fullPath = route.path
    await nextTick()

    expect(cellSaveErrorText.value).toBe('')
  })

  // A search or a selected task only write the query of the URL.
  test('keeps the message when only the URL query changes', async () => {
    const { cellSaveErrorText, saveCell } = setup()

    await saveCell(shot1, refuse)
    route.fullPath = `${route.path}?search=SH010`
    await nextTick()

    expect(cellSaveErrorText.value).toBe('main.cell_save_error {"name":"SH010"}')
  })

  test('tells a row refused again once', async () => {
    const { cellSaveErrorText, saveCell } = setup()

    await saveCell(shot1, refuse)
    await saveCell(shot1, refuse)

    expect(cellSaveErrorText.value).toBe('main.cell_save_error {"name":"SH010"}')
    expect(console.error).toHaveBeenCalledTimes(2)
  })

  test('tells the refusals of successive changes', async () => {
    const { cellSaveErrorText, saveCell } = setup()

    await saveCell(shot1, refuse)
    await saveCell(shot2, refuse)

    expect(cellSaveErrorText.value).toBe('main.cells_save_error')
    expect(console.error).toHaveBeenCalledTimes(2)
  })
})
