import { shallowMount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { createStore } from 'vuex'

import PlaylistedEntity from '@/components/players/players/PlaylistedEntity.vue'
import Combobox from '@/components/widgets/Combobox.vue'

const taskTypes = [
  { id: 'tt-anim', name: 'Animation', priority: 1 },
  { id: 'tt-compo', name: 'Compositing', priority: 2 }
]

const entity = {
  id: 's1',
  name: 'SH01',
  parent_name: 'SQ01',
  preview_file_id: 'pf-anim',
  preview_files: {
    'tt-anim': [{ id: 'pf-anim', revision: 1 }],
    'tt-compo': [
      { id: 'pf-compo-2', revision: 2 },
      { id: 'pf-compo-1', revision: 1 }
    ]
  }
}

// Another entry of the shot holds its latest compositing revision.
const mountEntity = () => {
  const store = createStore({
    getters: {
      currentProduction: () => ({ id: 'production-1' }),
      isCurrentUserManager: () => true,
      isCurrentUserSupervisor: () => false,
      playlistEntryMap: () => new Map([['s1-pf-compo-2', {}]]),
      taskMap: () => new Map(),
      taskStatusMap: () => new Map(),
      taskTypeMap: () => new Map(taskTypes.map(t => [t.id, t]))
    }
  })
  return shallowMount(PlaylistedEntity, {
    props: { entity },
    global: { plugins: [store], mocks: { $t: key => key } }
  })
}

describe('PlaylistedEntity.vue', () => {
  // The playlist would hold the same revision of the shot twice.
  it('switches to a revision no other entry of the shot holds', async () => {
    const wrapper = mountEntity()
    await nextTick()

    wrapper
      .findAllComponents(Combobox)[0]
      .vm.$emit('update:modelValue', 'tt-compo')
    await nextTick()

    const [{ previewFile }] = wrapper.emitted('preview-changed').at(-1)
    expect(previewFile.id).toBe('pf-compo-1')
  })

  // An entry without preview drags its unset id as a string, while the
  // shots dragged from the addition panel carry none.
  it.each([
    ['an entry without preview', 'null', null],
    ['an entry whose row has no preview key', 'undefined', undefined],
    ['a shot from the addition panel', '', '']
  ])('reads the preview of %s dropped on it', (_, dragged, expected) => {
    const wrapper = mountEntity()
    const data = { entityId: 's2', previewFileId: dragged }

    wrapper.find('.drop-area').trigger('drop', {
      dataTransfer: { getData: key => data[key] }
    })

    const [{ after }] = wrapper.emitted('entity-dropped')[0]
    expect(after).toEqual({ entity_id: 's2', preview_file_id: expected })
  })
})
