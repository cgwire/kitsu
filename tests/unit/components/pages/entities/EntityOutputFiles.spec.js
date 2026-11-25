import { flushPromises, shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

import EntityOutputFiles from '@/components/pages/entities/EntityOutputFiles.vue'

const mountFiles = async outputFiles => {
  const wrapper = shallowMount(EntityOutputFiles, {
    global: {
      plugins: [
        createStore({
          getters: {
            currentProduction: () => ({
              id: 'production-1',
              file_tree: { output: { mountpoint: '/home/artist/' } }
            }),
            fileStatusMap: () => new Map([['status-1', { name: 'Ready' }]]),
            outputFileTypeMap: () => new Map([['type-1', { name: 'Cache' }]]),
            personMap: () => new Map([['person-1', { id: 'person-1' }]]),
            taskTypeMap: () => new Map()
          },
          actions: { loadEntityOutputFiles: () => outputFiles }
        })
      ],
      mocks: { $t: key => key }
    },
    props: { entity: { id: 'asset-1' } }
  })
  await flushPromises()
  return wrapper
}

const outputFile = {
  id: 'file-1',
  file_status_id: 'status-1',
  name: 'main',
  output_type_id: 'type-1',
  person_id: 'person-1',
  revision: 2
}

describe('pages/entities/EntityOutputFiles', () => {
  test('shows the path of a file under it, from the mount point', async () => {
    const wrapper = await mountFiles([
      { ...outputFile, path: '/home/artist//productions/export/tree_v002' }
    ])

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(2)
    expect(rows[1].find('td.path').text()).toBe('productions/export/tree_v002')
  })

  test('gives a file without path no second row', async () => {
    const wrapper = await mountFiles([outputFile])

    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
  })
})
