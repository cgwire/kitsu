// @vitest-environment node

import { ref } from 'vue'

import { useTrimmedShot } from '@/composables/players/trimmedShot'

const shotTask = entity => ({
  entity,
  entity_id: entity.id,
  entity_type_name: 'Shot'
})

const setupTrimmedShot = task => {
  const store = {
    dispatch: vi.fn(() => Promise.resolve()),
    getters: { shotMap: new Map(), canEditShotTrim: vi.fn(() => true) }
  }
  const taskRef = ref(task)
  const api = useTrimmedShot({ entityType: ref(''), store, task: taskRef })
  return { ...api, store, task: taskRef }
}

describe('composables/trimmedShot', () => {
  // The task panel on pages without the shots list (news feed, my tasks) only
  // has the shot of the task payload, which nothing refreshes after the save.
  it('keeps the trim saved for a shot missing from the loaded list', () => {
    const { getTrimmedShot, saveTrimmedShot, store } = setupTrimmedShot(
      shotTask({ id: 'sh-1', data: { fps: 24, handle_in: 1 } })
    )

    saveTrimmedShot({ handle_in: 12, handle_out: 80 })

    const data = { fps: 24, handle_in: 12, handle_out: 80 }
    expect(store.dispatch).toHaveBeenCalledWith('editShot', {
      id: 'sh-1',
      data
    })
    expect(getTrimmedShot().data).toEqual(data)
  })

  it('reads the shots list loaded after the save', () => {
    const { getTrimmedShot, saveTrimmedShot, store } = setupTrimmedShot(
      shotTask({ id: 'sh-1', data: {} })
    )
    saveTrimmedShot({ handle_in: 12 })

    const cachedShot = { id: 'sh-1', data: { handle_in: 30 } }
    store.getters.shotMap.set('sh-1', cachedShot)

    expect(getTrimmedShot()).toBe(cachedShot)
  })

  it('reads a task payload reloaded after the save', () => {
    const { getTrimmedShot, saveTrimmedShot, task } = setupTrimmedShot(
      shotTask({ id: 'sh-1', data: {} })
    )
    saveTrimmedShot({ handle_in: 12 })

    task.value = shotTask({ id: 'sh-1', data: { handle_in: 30 } })

    expect(getTrimmedShot().data).toEqual({ handle_in: 30 })
  })

  it('rolls the trim back when its save is rejected', async () => {
    const { getTrimmedShot, saveTrimmedShot, store } = setupTrimmedShot(
      shotTask({ id: 'sh-1', data: { handle_in: 1 } })
    )
    await saveTrimmedShot({ handle_in: 12 })
    store.dispatch.mockRejectedValueOnce(new Error('forbidden'))

    await expect(saveTrimmedShot({ handle_out: 80 })).rejects.toThrow(
      'forbidden'
    )

    expect(getTrimmedShot().data).toEqual({ handle_in: 12 })
  })

  it('forgets the trim when its first save is rejected', async () => {
    const { getTrimmedShot, saveTrimmedShot, store } = setupTrimmedShot(
      shotTask({ id: 'sh-1', data: { handle_in: 1 } })
    )
    store.dispatch.mockRejectedValueOnce(new Error('forbidden'))

    await expect(saveTrimmedShot({ handle_in: 12 })).rejects.toThrow(
      'forbidden'
    )

    expect(getTrimmedShot().data).toEqual({ handle_in: 1 })
  })

  it('keeps a later accepted trim when an earlier save is rejected', async () => {
    const { getTrimmedShot, saveTrimmedShot, store } = setupTrimmedShot(
      shotTask({ id: 'sh-1', data: {} })
    )
    let rejectFirst
    store.dispatch.mockReturnValueOnce(
      new Promise((resolve, reject) => {
        rejectFirst = reject
      })
    )
    const first = saveTrimmedShot({ handle_in: 12 })
    await saveTrimmedShot({ handle_out: 80 })

    rejectFirst(new Error('forbidden'))
    await expect(first).rejects.toThrow('forbidden')

    expect(getTrimmedShot().data).toEqual({ handle_in: 12, handle_out: 80 })
  })

  it('resolves without a save for a task without a shot', async () => {
    const { saveTrimmedShot, store } = setupTrimmedShot({
      entity_type_name: 'Asset'
    })

    await expect(saveTrimmedShot({ handle_in: 12 })).resolves.toBeUndefined()

    expect(store.dispatch).not.toHaveBeenCalled()
  })

  it('lets the store decide who edits the trim', () => {
    const task = shotTask({ id: 'sh-1', data: {} })
    const { canEditTrim, store } = setupTrimmedShot(task)

    expect(canEditTrim.value).toBe(true)
    expect(store.getters.canEditShotTrim).toHaveBeenCalledWith(task)
  })
})
