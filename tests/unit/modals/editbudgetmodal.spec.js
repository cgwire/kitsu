import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'

vi.mock('@/composables/modal', () => ({ useModal: () => {} }))

import EditBudgetModal from '@/components/modals/EditBudgetModal.vue'
import TextField from '@/components/widgets/TextField.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {},
  missingWarn: false,
  fallbackWarn: false
})

const openModal = async () => {
  const wrapper = mount(EditBudgetModal, { global: { plugins: [i18n] } })
  await wrapper.setProps({ active: true })
  return wrapper
}

const pressEnterInName = wrapper =>
  wrapper.findComponent(TextField).vm.$emit('enter')

describe('modals/EditBudgetModal', () => {
  // The name field confirms on Enter, past the grayed confirm button.
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('does not confirm on Enter without a name', async () => {
    const wrapper = await openModal()

    pressEnterInName(wrapper)

    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  it('confirms on Enter once named', async () => {
    const wrapper = await openModal()

    await wrapper.find('input').setValue('Season 2')
    pressEnterInName(wrapper)

    expect(wrapper.emitted('confirm')[0][0]).toMatchObject({
      name: 'Season 2'
    })
  })
})
