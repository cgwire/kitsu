import { flushPromises, mount } from '@vue/test-utils'
import { createStore } from 'vuex'

import SalaryScale from '@/components/pages/budget/SalaryScale.vue'

import { useNumberField } from '../../../fixtures/number-input'

const positions = ['supervisor', 'lead', 'artist']
const seniorities = ['senior', 'mid', 'junior']

describe('pages/budget/SalaryScale', () => {
  // Each key typed saves the salary it reads.
  const mountScale = async updateSalaryScale => {
    const scale = Object.fromEntries(
      positions.map(position => [
        position,
        Object.fromEntries(
          seniorities.map(seniority => [
            seniority,
            { id: `${position}-${seniority}`, salary: 350 }
          ])
        )
      ])
    )
    const store = createStore({
      getters: {
        departments: () => [{ id: 'department-1', name: 'Animation' }]
      },
      actions: {
        loadSalaryScale: () => ({ 'department-1': scale }),
        updateSalaryScale: (context, entry) => updateSalaryScale(entry.salary)
      }
    })
    const wrapper = mount(SalaryScale, {
      global: {
        plugins: [store],
        stubs: { DepartmentName: true, Spinner: true }
      }
    })
    await flushPromises()
    return wrapper
  }

  // Read as 0, "120." saved a salary of 0 and showed it: typing 120.5 key by
  // key saved 5.
  test('saves no salary for an entry that is no whole number', async () => {
    const updateSalaryScale = vi.fn()
    const wrapper = await mountScale(updateSalaryScale)
    const field = useNumberField(wrapper.find('table input').element)
    field.select()

    expect(await field.type('120.5')).toEqual([
      '1',
      '12',
      '120',
      '120.',
      '120.5'
    ])
    expect(updateSalaryScale.mock.calls).toEqual([[1], [12], [120]])

    wrapper.unmount()
  })

  test('saves a salary of 0 for an emptied field', async () => {
    const updateSalaryScale = vi.fn()
    const wrapper = await mountScale(updateSalaryScale)
    const field = useNumberField(wrapper.find('table input').element)

    await field.clear()

    expect(updateSalaryScale.mock.calls).toEqual([[0]])
    expect(field.text()).toBe('0')

    wrapper.unmount()
  })
})
