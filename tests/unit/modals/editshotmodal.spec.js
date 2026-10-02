import { shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

import EditShotModal from '@/components/modals/EditShotModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import TextField from '@/components/widgets/TextField.vue'

// Minimal i18n in non-legacy mode so `useI18n()` works next to the global
// `$t` mock of tests/unit.setup.js: labels render as their locale keys.
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {},
  missingWarn: false,
  fallbackWarn: false
})

const store = createStore({
  getters: {
    currentProduction: () => ({ id: 'p1' }),
    isPaperProduction: () => false,
    openProductions: () => [{ id: 'p1' }],
    sequenceOptions: () => [],
    sequences: () => [{ id: 'sq-1', name: 'SQ01' }],
    shotMetadataDescriptors: () => []
  }
})

// A shot starting at frame 0 is a real case: the frame in must survive the
// edit form instead of reading as an empty field.
const shot = {
  id: 'sh-1',
  name: 'SH01',
  sequence_id: 'sq-1',
  project_id: 'p1',
  nb_frames: 100,
  data: { frame_in: 0, frame_out: 99 }
}

const mountModal = (shotToEdit = shot) =>
  shallowMount(EditShotModal, {
    global: { plugins: [store, i18n], renderStubDefaultSlot: true },
    props: { active: true, shotToEdit }
  })

const confirmForm = wrapper => {
  wrapper.findComponent(ModalFooter).vm.$emit('confirm')
  return wrapper.emitted('confirm').at(-1)[0]
}

const findField = (wrapper, labelKey) =>
  wrapper
    .findAllComponents(TextField)
    .find(field => field.props('label') === labelKey)

describe('modals/EditShotModal', () => {
  it('keeps a frame in of 0', async () => {
    const wrapper = mountModal()
    await nextTick()
    expect(confirmForm(wrapper)).toMatchObject({ frameIn: 0, frameOut: 99 })
  })

  it('counts the frames of a range starting at 0', async () => {
    const wrapper = mountModal()
    await nextTick()
    findField(wrapper, 'shots.fields.frame_out').vm.$emit(
      'update:model-value',
      109
    )
    await nextTick()
    expect(confirmForm(wrapper).nb_frames).toBe(110)
  })

  it('keeps the frame count while a bound is empty', async () => {
    const wrapper = mountModal({ ...shot, nb_frames: 24, data: {} })
    await nextTick()
    findField(wrapper, 'shots.fields.frame_out').vm.$emit(
      'update:model-value',
      99
    )
    await nextTick()
    expect(confirmForm(wrapper).nb_frames).toBe(24)
  })
})
