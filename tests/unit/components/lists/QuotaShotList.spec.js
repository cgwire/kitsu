import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

import QuotaShotList from '@/components/lists/QuotaShotList.vue'

const productions = [
  { id: 'prod-24', fps: '24' },
  { id: 'prod-25', fps: '25' }
]

const mountList = (shots, currentProduction) =>
  shallowMount(QuotaShotList, {
    props: { countMode: 'seconds', shots },
    global: {
      plugins: [
        createStore({
          getters: {
            currentProduction: () => currentProduction,
            productionMap: () => new Map(productions.map(p => [p.id, p]))
          }
        })
      ]
    }
  })

const secondsCells = wrapper =>
  wrapper.findAll('tbody tr').map(row => row.findAll('td')[1].text())

describe('lists/QuotaShotList', () => {
  test('counts the seconds at the fps of the shot production', () => {
    const wrapper = mountList(
      [
        { id: 'shot-1', project_id: 'prod-24', nb_frames: 48 },
        { id: 'shot-2', project_id: 'prod-25', nb_frames: 50 }
      ],
      productions[0]
    )
    expect(secondsCells(wrapper)).toEqual(['2', '2'])
  })

  test('falls back to the current production, then to the shot fps', () => {
    const wrapper = mountList(
      [
        { id: 'shot-1', project_id: 'unknown', nb_frames: 50 },
        { id: 'shot-2', nb_frames: 50, fps: '50' }
      ],
      productions[1]
    )
    expect(secondsCells(wrapper)).toEqual(['2', '2'])
    const withoutProduction = mountList(
      [{ id: 'shot-2', nb_frames: 50, fps: '50' }],
      null
    )
    expect(secondsCells(withoutProduction)).toEqual(['1'])
  })
})
