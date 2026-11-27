import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'
import { describe, expect, it, vi } from 'vitest'

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

import NewsFilters from '@/components/pages/news/NewsFilters.vue'

const ada = { id: 'person-1', first_name: 'Ada' }
const afterDate = new Date('2026-11-01T00:00:00')

const mountFilters = (props = {}) =>
  shallowMount(NewsFilters, {
    props,
    global: {
      plugins: [
        createStore({
          getters: {
            currentProduction: () => ({ id: 'production-1', team: [] }),
            displayedPeople: () => [],
            isTVShow: () => false,
            personMap: () => new Map(),
            productionTaskStatuses: () => [],
            productionTaskTypes: () => [],
            runningEpisodes: () => [],
            user: () => ({ timezone: 'Europe/Paris' })
          }
        })
      ]
    }
  })

const toggleOf = wrapper => wrapper.findComponent({ name: 'FiltersToggle' })

describe('NewsFilters', () => {
  it('keeps its second row folded and counts the filters set in it', () => {
    const wrapper = mountFilters({
      after: afterDate,
      previewMode: 'previews',
      taskTypeId: 'type-1'
    })

    expect(wrapper.findAll('.filters')).toHaveLength(1)
    expect(toggleOf(wrapper).props('count')).toBe(2)
  })

  it('unfolds its second row from its toggle', async () => {
    const wrapper = mountFilters()
    expect(toggleOf(wrapper).props('count')).toBe(0)

    await toggleOf(wrapper).vm.$emit('update:modelValue', true)

    expect(wrapper.findAll('.filters')).toHaveLength(2)
  })

  it('offers no reset without a filter', () => {
    const wrapper = mountFilters({ episodeId: 'all' })

    expect(toggleOf(wrapper).props('resettable')).toBe(false)
  })

  it('clears the filters set', () => {
    const wrapper = mountFilters({
      after: afterDate,
      person: ada,
      previewMode: 'previews',
      taskStatusId: 'status-1'
    })

    toggleOf(wrapper).vm.$emit('reset')

    expect(wrapper.emitted()).toMatchObject({
      'update:after': [[null]],
      'update:person': [[null]],
      'update:previewMode': [['comments']],
      'update:taskStatusId': [['']]
    })
  })
})
