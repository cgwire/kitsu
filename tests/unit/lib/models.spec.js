// @vitest-environment node

import {
  addToIdList,
  arrayMove,
  removeFromIdList,
  getFilledColumns,
  groupEntitiesByParents,
  populateTask,
  remove,
  setTasksEntityPreview,
  trackEdit,
  updateModelFromList,
  removeModelFromList
} from '@/lib/models'

describe('lib/helpers', () => {
  it('populateTask', () => {
    let task = {
      entity_name: 'Agent 327',
      entity_type_name: 'Characters'
    }
    populateTask(task)
    expect(task.full_entity_name).toEqual('Characters / Agent 327')

    task = {
      entity_name: 'SH01',
      entity_type_name: 'Shot',
      sequence_name: 'SQ01',
      episode_name: 'E01'
    }
    populateTask(task)
    expect(task.full_entity_name).toEqual('E01 / SQ01 / SH01')

    task = {
      entity_name: 'SH01',
      entity_type_name: 'Shot',
      sequence_name: 'SQ01'
    }
    populateTask(task)
    expect(task.full_entity_name).toEqual('SQ01 / SH01')
  })

  it('getFilledColumns', () => {
    const assets = [
      {
        id: 'asset-1',
        validations: new Map(Object.entries({
          'task-type-1': 'task-1'
        }))
      },
      {
        id: 'asset-2',
        validations: new Map(Object.entries({
          'task-type-2': 'task-2'
        }))
      },
      {
        id: 'asset-3',
        tasks: [{
          id: 'task-3',
          task_type_id: 'task-type-3'
        }]
      }
    ]
    const filledColumns = getFilledColumns(assets)
    expect(filledColumns['task-type-1']).toBeTruthy()
    expect(filledColumns['task-type-2']).toBeTruthy()
    expect(filledColumns['task-type-3']).toBeTruthy()
  })

  it('groupEntitiesByParents', () => {
    const assets = [
      {
        id: 'asset-1',
        asset_type_id: 'asset-type-1'
      },
      {
        id: 'asset-2',
        asset_type_id: 'asset-type-2'
      },
      {
        id: 'asset-3',
        asset_type_id: 'asset-type-2'
      }
    ]
    const groups = groupEntitiesByParents(assets, 'asset_type_id')
    expect(groups).toEqual([
      [
        {
          id: 'asset-1',
          asset_type_id: 'asset-type-1'
        }
      ],
      [
        {
          id: 'asset-2',
          asset_type_id: 'asset-type-2'
        },
        {
          id: 'asset-3',
          asset_type_id: 'asset-type-2'
        }
      ]
    ])
  })

  it('updateModeFromList', () => {
    const items = [
      { id: '1', name: 'item-1' },
      { id: '2', name: 'item-2' },
      { id: '3', name: 'item-3' }
    ]
    const model = { id: '2', name: 'item-changed' }
    updateModelFromList(items, model)
    expect(items[1].name).toEqual('item-changed')
  })

  it('removeModelFromList', () => {
    let items = [
      { id: '1', name: 'item-1' },
      { id: '2', name: 'item-2' },
      { id: '3', name: 'item-3' }
    ]
    const model = { id: '2', name: 'item-2' }
    items = removeModelFromList(items, model)
    expect(items).toHaveLength(2)
    expect(items[1].name).toEqual('item-3')
  })

  it('addToIdList', () => {
    const production = { id: '1', name: 'Caminandes' }
    addToIdList(production, 'asset_types', 'type-1')
    expect(production.asset_types).toEqual(['type-1'])
    addToIdList(production, 'asset_types', 'type-2')
    expect(production.asset_types).toEqual(['type-1', 'type-2'])
    addToIdList(production, 'asset_types', 'type-2')
    expect(production.asset_types).toEqual(['type-1', 'type-2'])
  })

  it('removeFromIdList', () => {
    const production = {
      id: '1',
      name: 'Caminandes',
      asset_types: ['type-1', 'type-2', 'type-3']
    }
    removeFromIdList(production, 'asset_types', 'type-2')
    expect(production.asset_types).toEqual(['type-1', 'type-3'])
  })

  it('populateTask - Episode', () => {
    const task = {
      entity_name: 'E01',
      entity_type_name: 'Episode',
      project_id: 'prod-1',
      entity_id: 'ep-1'
    }
    populateTask(task)
    expect(task.full_entity_name).toEqual('E01')
  })

  it('populateTask - Sequence with episode', () => {
    const task = {
      entity_name: 'SQ01',
      entity_type_name: 'Sequence',
      episode_name: 'E01',
      project_id: 'prod-1',
      entity_id: 'seq-1'
    }
    populateTask(task)
    expect(task.full_entity_name).toEqual('E01 / SQ01')
  })

  it('populateTask - Edit without episode', () => {
    const task = {
      entity_name: 'ED01',
      entity_type_name: 'Edit',
      project_id: 'prod-1',
      entity_id: 'edit-1'
    }
    populateTask(task)
    expect(task.full_entity_name).toEqual('ED01')
  })

  it('removeFromIdList - id not found', () => {
    const production = {
      id: '1',
      asset_types: ['type-1', 'type-2']
    }
    removeFromIdList(production, 'asset_types', 'type-999')
    expect(production.asset_types).toEqual(['type-1', 'type-2'])
  })

  it('arrayMove', () => {
    const arr = ['a', 'b', 'c', 'd']
    expect(arrayMove(arr, 0, 2)).toEqual(['b', 'c', 'a', 'd'])
    expect(arr).toEqual(['a', 'b', 'c', 'd']) // original unchanged
  })

  describe('setTasksEntityPreview', () => {
    const buildTasks = () => [
      {
        id: 'task-1',
        entity_id: 'entity-1',
        entity_preview_file_id: 'old',
        entity: { id: 'entity-1', preview_file_id: 'old' }
      },
      // Same entity, another task type: its row must follow too.
      { id: 'task-2', entity_id: 'entity-1', entity_preview_file_id: 'old' },
      { id: 'task-3', entity_id: 'entity-2', entity_preview_file_id: 'old' }
    ]

    it('refreshes both preview fields of every task of the entity', () => {
      const tasks = buildTasks()
      setTasksEntityPreview(tasks, 'entity-1', 'preview-1')
      expect(tasks[0].entity_preview_file_id).toEqual('preview-1')
      expect(tasks[0].entity.preview_file_id).toEqual('preview-1')
      expect(tasks[1].entity_preview_file_id).toEqual('preview-1')
      expect(tasks[2].entity_preview_file_id).toEqual('old')
    })

    it('leaves the tasks alone without an entity id', () => {
      const tasks = buildTasks()
      setTasksEntityPreview(tasks, undefined, 'preview-1')
      expect(tasks.map(t => t.entity_preview_file_id)).toEqual([
        'old',
        'old',
        'old'
      ])
    })
  })

  it('remove drops the given object, not the ones equal to it', () => {
    const attachment = { id: 'attachment-1', name: 'notes.pdf' }
    const twin = { id: 'attachment-1', name: 'notes.pdf' }
    const other = { id: 'attachment-2', name: 'ref.png' }

    expect(remove([attachment, other, twin], attachment)).toEqual([other, twin])
    expect(remove([other], attachment)).toEqual([other])
  })
})

// The stores show an edit before Zou answers: a refused save is undone.
describe('trackEdit', () => {
  const buildShot = () => ({
    id: 'shot-1',
    name: 'SH01',
    description: '',
    nb_frames: 24,
    lock: 1,
    data: { fps: 24 }
  })

  // As the edit mutations of the stores do.
  const commitEdit = (shot, { data, ...fields }) => {
    Object.assign(shot, fields)
    if (data) shot.data = { ...shot.data, ...data }
  }

  it('gives back what the edit changed', () => {
    const shot = buildShot()

    const edit = trackEdit(
      () => shot,
      () =>
        commitEdit(shot, {
          name: 'SH02',
          description: 'Wide',
          nb_frames: 24,
          data: { fps: 25, frame_in: 1 }
        })
    )

    expect(shot).toMatchObject({ name: 'SH02', data: { fps: 25, frame_in: 1 } })
    expect(edit.undo()).toEqual({
      id: 'shot-1',
      name: 'SH01',
      description: '',
      data: { fps: 24, frame_in: undefined }
    })
  })

  it('leaves out a field changed again since', () => {
    const shot = buildShot()
    const edit = trackEdit(
      () => shot,
      () => commitEdit(shot, { name: 'SH02', description: 'Wide' })
    )

    shot.description = 'Close'

    expect(edit.undo()).toEqual({ id: 'shot-1', name: 'SH01' })
  })

  it('gives nothing once every change was changed again', () => {
    const shot = buildShot()
    const edit = trackEdit(
      () => shot,
      () => commitEdit(shot, { data: { fps: 25 } })
    )

    commitEdit(shot, { data: { fps: 30 } })

    expect(edit.undo()).toBeNull()
  })

  // Typed in a cell, each character is an edit with its own request.
  it('gives back the first value once edits of a field are refused in turn', () => {
    const shot = buildShot()
    const edits = ['W', 'Wi', 'Wid'].map(description =>
      trackEdit(
        () => shot,
        () => commitEdit(shot, { description })
      )
    )

    expect(edits[0].undo()).toBeNull()
    expect(edits[1].undo()).toBeNull()
    expect(edits[2].undo()).toEqual({ id: 'shot-1', description: '' })
  })

  it('gives back a saved value to the edits refused after it', () => {
    const shot = buildShot()
    const edits = ['W', 'Wi', 'Wid'].map(description =>
      trackEdit(
        () => shot,
        () => commitEdit(shot, { description })
      )
    )

    expect(edits[0].undo()).toBeNull()
    edits[1].keep()

    expect(edits[2].undo()).toEqual({ id: 'shot-1', description: 'Wi' })
  })

  it('gives nothing for an entity the cache no longer holds', () => {
    const shot = buildShot()
    let cached = shot
    const replaced = trackEdit(
      () => cached,
      () => commitEdit(shot, { name: 'SH02' })
    )
    const removed = trackEdit(
      () => cached,
      () => commitEdit(shot, { name: 'SH03' })
    )

    cached = { ...buildShot(), name: 'SH03' }
    expect(replaced.undo()).toBeNull()
    cached = undefined
    expect(removed.undo()).toBeNull()
  })

  it('applies the edit of an entity out of the cache, with nothing to undo', () => {
    const applyEdit = vi.fn()

    const edit = trackEdit(() => undefined, applyEdit)

    expect(applyEdit).toHaveBeenCalledTimes(1)
    expect(edit.undo()).toBeNull()
  })
})
