import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

vi.mock('@/composables/modal', () => ({ useModal: () => {} }))

import EditBudgetEntryModal from '@/components/modals/EditBudgetEntryModal.vue'

const store = createStore({
  getters: {
    activePeople: () => [],
    currentProduction: () => ({
      id: 'production-1',
      start_date: '2026-01-01',
      end_date: '2026-12-31'
    }),
    personMap: () => new Map()
  }
})

// The modal focuses its department field on opening.
const focusable = (name, emits) => ({
  name,
  emits,
  methods: { focus() {} },
  template: '<input />'
})

const mountModal = () =>
  shallowMount(EditBudgetEntryModal, {
    global: {
      plugins: [store],
      mocks: { $t: key => key },
      renderStubDefaultSlot: true,
      stubs: {
        ComboboxDepartment: focusable('ComboboxDepartment', [
          'update:modelValue'
        ]),
        TextField: focusable('TextField', ['enter', 'update:modelValue'])
      }
    },
    props: {
      active: true,
      salaryScale: { d1: { artist: { junior: { salary: 300 } } } }
    }
  })

const pressEnterInDuration = wrapper =>
  wrapper.findAllComponents({ name: 'TextField' })[0].vm.$emit('enter')

describe('modals/EditBudgetEntryModal', () => {
  // The fields confirm on Enter, past the grayed confirm button.
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('does not confirm on Enter without a department', () => {
    const wrapper = mountModal()

    pressEnterInDuration(wrapper)

    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  it('confirms on Enter once a department is picked', async () => {
    const wrapper = mountModal()

    await wrapper
      .findComponent({ name: 'ComboboxDepartment' })
      .vm.$emit('update:modelValue', 'd1')
    pressEnterInDuration(wrapper)

    expect(wrapper.emitted('confirm')[0][0]).toMatchObject({
      department_id: 'd1',
      salary: 6000
    })
  })
})
