// @vitest-environment node

import { ref } from 'vue'

import { useTrimmedEntity } from '@/composables/players/trimmedEntity'

const shotTask = entity => ({
  entity,
  entity_id: entity.id,
  entity_type_name: 'Shot'
})

// The entity type of an asset task is its asset type.
const assetTask = entity => ({
  entity,
  entity_id: entity.id,
  entity_type_name: 'Character',
  task_type_id: 'task-type-modeling'
})

const setupTrimmedEntity = task => {
  const store = {
    dispatch: vi.fn(() => Promise.resolve()),
    getters: {
      assetMap: new Map(),
      canEditTrim: vi.fn(() => true),
      shotMap: new Map(),
      taskTypeMap: new Map([
        ['task-type-modeling', { id: 'task-type-modeling', for_entity: 'Asset' }]
      ])
    }
  }
  const taskRef = ref(task)
  const api = useTrimmedEntity({ entityType: ref(''), store, task: taskRef })
  return { ...api, store, task: taskRef }
}

describe('composables/trimmedEntity', () => {
  // The task panel on pages without the shots list (news feed, my tasks) only
  // has the shot of the task payload, which nothing refreshes after the save.
  it('keeps the trim saved for a shot missing from the loaded list', () => {
    const { getTrimmedEntity, saveTrimmedEntity, store } = setupTrimmedEntity(
      shotTask({ id: 'sh-1', data: { fps: 24, handle_in: 1 } })
    )

    saveTrimmedEntity({ handle_in: 12, handle_out: 80 })

    const data = { fps: 24, handle_in: 12, handle_out: 80 }
    expect(store.dispatch).toHaveBeenCalledWith('editShot', {
      id: 'sh-1',
      data
    })
    expect(getTrimmedEntity().data).toEqual(data)
  })

  it('reads the shots list loaded after the save', () => {
    const { getTrimmedEntity, saveTrimmedEntity, store } = setupTrimmedEntity(
      shotTask({ id: 'sh-1', data: {} })
    )
    saveTrimmedEntity({ handle_in: 12 })

    const cachedShot = { id: 'sh-1', data: { handle_in: 30 } }
    store.getters.shotMap.set('sh-1', cachedShot)

    expect(getTrimmedEntity()).toBe(cachedShot)
  })

  it('reads a task payload reloaded after the save', () => {
    const { getTrimmedEntity, saveTrimmedEntity, task } = setupTrimmedEntity(
      shotTask({ id: 'sh-1', data: {} })
    )
    saveTrimmedEntity({ handle_in: 12 })

    task.value = shotTask({ id: 'sh-1', data: { handle_in: 30 } })

    expect(getTrimmedEntity().data).toEqual({ handle_in: 30 })
  })

  it('rolls the trim back when its save is rejected', async () => {
    const { getTrimmedEntity, saveTrimmedEntity, store } = setupTrimmedEntity(
      shotTask({ id: 'sh-1', data: { handle_in: 1 } })
    )
    await saveTrimmedEntity({ handle_in: 12 })
    store.dispatch.mockRejectedValueOnce(new Error('forbidden'))

    await expect(saveTrimmedEntity({ handle_out: 80 })).rejects.toThrow(
      'forbidden'
    )

    expect(getTrimmedEntity().data).toEqual({ handle_in: 12 })
  })

  it('forgets the trim when its first save is rejected', async () => {
    const { getTrimmedEntity, saveTrimmedEntity, store } = setupTrimmedEntity(
      shotTask({ id: 'sh-1', data: { handle_in: 1 } })
    )
    store.dispatch.mockRejectedValueOnce(new Error('forbidden'))

    await expect(saveTrimmedEntity({ handle_in: 12 })).rejects.toThrow(
      'forbidden'
    )

    expect(getTrimmedEntity().data).toEqual({ handle_in: 1 })
  })

  it('keeps a later accepted trim when an earlier save is rejected', async () => {
    const { getTrimmedEntity, saveTrimmedEntity, store } = setupTrimmedEntity(
      shotTask({ id: 'sh-1', data: {} })
    )
    let rejectFirst
    store.dispatch.mockReturnValueOnce(
      new Promise((resolve, reject) => {
        rejectFirst = reject
      })
    )
    const first = saveTrimmedEntity({ handle_in: 12 })
    await saveTrimmedEntity({ handle_out: 80 })

    rejectFirst(new Error('forbidden'))
    await expect(first).rejects.toThrow('forbidden')

    expect(getTrimmedEntity().data).toEqual({ handle_in: 12, handle_out: 80 })
  })

  it('saves the trim of an asset on an asset task', async () => {
    const { getTrimmedEntity, saveTrimmedEntity, store } = setupTrimmedEntity(
      assetTask({ id: 'as-1', data: {} })
    )
    const cachedAsset = { id: 'as-1', data: { color: 'red' } }
    store.getters.assetMap.set('as-1', cachedAsset)

    await saveTrimmedEntity({ handle_in: 3 })

    expect(getTrimmedEntity()).toBe(cachedAsset)
    expect(store.dispatch).toHaveBeenCalledWith('editAsset', {
      id: 'as-1',
      data: { color: 'red', handle_in: 3 }
    })
  })

  it('keeps the trim saved for an asset missing from the loaded list', () => {
    const { getTrimmedEntity, saveTrimmedEntity, store } = setupTrimmedEntity(
      assetTask({ id: 'as-1', data: { handle_out: 40 } })
    )

    saveTrimmedEntity({ handle_in: 3 })

    const data = { handle_in: 3, handle_out: 40 }
    expect(store.dispatch).toHaveBeenCalledWith('editAsset', {
      id: 'as-1',
      data
    })
    expect(getTrimmedEntity().data).toEqual(data)
  })

  it('resolves without a save for a task neither on a shot nor an asset', async () => {
    const { getTrimmedEntity, saveTrimmedEntity, store } = setupTrimmedEntity({
      entity: { id: 'ed-1', data: {} },
      entity_id: 'ed-1',
      entity_type_name: 'Edit'
    })

    expect(getTrimmedEntity()).toBeNull()

    await expect(saveTrimmedEntity({ handle_in: 12 })).resolves.toBeUndefined()

    expect(store.dispatch).not.toHaveBeenCalled()
  })

  it('lets the store decide who edits the trim', () => {
    const task = shotTask({ id: 'sh-1', data: {} })
    const { canEditTrim, store } = setupTrimmedEntity(task)

    expect(canEditTrim.value).toBe(true)
    expect(store.getters.canEditTrim).toHaveBeenCalledWith(task)
  })
})
