import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

// Importing the card transitively pulls in the root store
// (assets module → lib/models → timezone → @/store); stub it so no Vuex
// store is built.
vi.mock('@/store', () => ({ default: {} }))

import ConceptCard from '@/components/widgets/ConceptCard.vue'
import EntityPreview from '@/components/widgets/EntityPreview.vue'

const mountCard = (props = {}) =>
  shallowMount(ConceptCard, {
    props: {
      ...props,
      concept: {
        id: 'concept-1',
        created_by: 'person-1',
        entity_concept_links: [],
        tasks: [{ id: 'task-1', task_status_id: 'status-todo' }]
      }
    },
    global: {
      plugins: [
        createStore({
          getters: {
            currentProduction: () => ({ id: 'production-1' }),
            isTVShow: () => false,
            personMap: () => new Map(),
            taskStatusMap: () =>
              new Map([['status-todo', { color: '#999', short_name: 'todo' }]])
          }
        })
      ]
    }
  })

describe('ConceptCard', () => {
  // The concepts page reads the modifier keys to extend the selection.
  test('hands the click event over to its parent', async () => {
    const wrapper = mountCard()

    await wrapper.trigger('click', { ctrlKey: true })

    expect(wrapper.emitted('click')[0][0].ctrlKey).toBe(true)
  })

  test('halves its preview when compact', () => {
    const preview = mountCard({ compact: true }).findComponent(EntityPreview)

    expect([preview.props('width'), preview.props('height')]).toEqual([
      150, 100
    ])
  })
})
