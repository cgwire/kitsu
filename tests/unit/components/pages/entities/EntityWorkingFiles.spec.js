import { flushPromises, shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

import EntityWorkingFiles from '@/components/pages/entities/EntityWorkingFiles.vue'
import EmptySection from '@/components/widgets/EmptySection.vue'

const taskType = { id: 'type-1', name: 'Modeling' }

const mountFiles = async (workingFiles, fileTree) => {
  const loadEntityWorkingFiles = vi.fn(() => Promise.resolve(workingFiles))
  const wrapper = shallowMount(EntityWorkingFiles, {
    global: {
      plugins: [
        createStore({
          getters: {
            currentProduction: () => ({
              id: 'production-1',
              file_tree: fileTree
            }),
            getTaskTypePriority: () => taskTypeId =>
              ({ 'type-1': 1, 'type-2': 2 })[taskTypeId] ?? null,
            personMap: () => new Map([['person-1', { id: 'person-1' }]]),
            taskMap: () =>
              new Map([
                ['task-1', { id: 'task-1', task_type_id: 'type-1' }],
                ['task-3', { id: 'task-3', task_type_id: 'type-2' }]
              ]),
            taskTypeMap: () =>
              new Map([
                ['type-1', taskType],
                ['type-2', { id: 'type-2', name: 'Shading' }]
              ])
          },
          actions: { loadEntityWorkingFiles }
        })
      ],
      mocks: { $t: key => key }
    },
    props: { entity: { id: 'asset-1' } }
  })
  await flushPromises()
  return { loadEntityWorkingFiles, wrapper }
}

describe('pages/entities/EntityWorkingFiles', () => {
  test('lists the working files of its entity, by the type of their task', async () => {
    const { loadEntityWorkingFiles, wrapper } = await mountFiles([
      {
        id: 'file-1',
        name: 'tree_modeling',
        path: '/prod/assets/tree/modeling/tree_modeling_v003.blend',
        person_id: 'person-1',
        revision: 3,
        size: 2048,
        task_id: 'task-1'
      },
      // a file without owner nor path
      { id: 'file-2', name: 'tree_rig', revision: 1, task_id: 'task-1' }
    ])

    expect(loadEntityWorkingFiles.mock.calls[0][1]).toBe('asset-1')
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(3)
    expect(
      rows[0].findComponent({ name: 'TaskTypeCell' }).props('taskType')
    ).toEqual(taskType)
    expect(rows[0].find('td.name').text()).toBe('tree_modeling')
    expect(rows[0].find('td.revision').text()).toBe('3')
    expect(rows[1].find('td.path').text()).toBe(
      '/prod/assets/tree/modeling/tree_modeling_v003.blend'
    )
    // a file without path has no second row
    expect(rows[2].find('td.name').text()).toBe('tree_rig')
    expect(wrapper.findComponent(EmptySection).exists()).toBe(false)
  })

  test('sorts the files by task type, last revision, name, then size', async () => {
    const file = (id, task_id, revision, name, size) => ({
      id,
      name,
      revision,
      size,
      task_id
    })
    const { wrapper } = await mountFiles([
      file('shading-2', 'task-3', 2, 'main', 10),
      file('modeling-1', 'task-1', 1, 'main', 10),
      file('modeling-2-big', 'task-1', 2, 'main', 20),
      file('modeling-2-alt', 'task-1', 2, 'alt', 30),
      file('modeling-2-small', 'task-1', 2, 'main', 10)
    ])

    expect(
      wrapper
        .findAll('tbody tr')
        .filter(row => !row.find('td.path').exists())
        .map(row => [
          row.findComponent({ name: 'TaskTypeCell' }).props('taskType').name,
          row.find('td.revision').text(),
          row.find('td.name').text(),
          row.find('td.size').text()
        ])
    ).toEqual([
      ['Modeling', '2', 'alt', '30'],
      ['Modeling', '2', 'main', '10'],
      ['Modeling', '2', 'main', '20'],
      ['Modeling', '1', 'main', '10'],
      ['Shading', '2', 'main', '10']
    ])
  })

  // zou writes the path from the mount point of the production, a folder of
  // the machine it is mounted on
  test.each([
    ['/home/artist/', '/home/artist//productions/tree/tree_v001'],
    ['/home/artist', '/home/artist/productions/tree/tree_v001']
  ])('shows the path from the mount point %s', async (mountpoint, path) => {
    const { wrapper } = await mountFiles(
      [{ id: 'file-1', name: 'main', path, revision: 1, task_id: 'task-1' }],
      { working: { mountpoint } }
    )

    expect(wrapper.find('td.path').text()).toBe('productions/tree/tree_v001')
  })

  test('keeps the path that lies out of the mount point', async () => {
    const path = '/home/artistic/productions/tree/tree_v001'
    const { wrapper } = await mountFiles(
      [{ id: 'file-1', name: 'main', path, revision: 1, task_id: 'task-1' }],
      { working: { mountpoint: '/home/artist' } }
    )

    expect(wrapper.find('td.path').text()).toBe(path)
  })

  test('tells an entity without working files', async () => {
    const { wrapper } = await mountFiles([])

    expect(wrapper.find('table').exists()).toBe(false)
    expect(wrapper.findComponent(EmptySection).props('text')).toBe(
      'entities.working_files.no_working_files'
    )
  })
})
