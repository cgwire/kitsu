import { shallowMount } from '@vue/test-utils'
import { CheckIcon } from 'lucide-vue-next'
import { h, nextTick, ref } from 'vue'
import { createStore } from 'vuex'

// Load @/store first (via @/lib/auth) to avoid a circular-import race when
// AddThumbnailsModal transitively imports assets/shots store modules.
import '@/lib/auth'
import assetStore from '@/store/modules/assets'

import AddThumbnailsModal from '@/components/modals/AddThumbnailsModal.vue'
import Spinner from '@/components/widgets/Spinner.vue'

const task = { id: 'task-1' }
const asset = {
  id: 'asset-1',
  name: 'Bob',
  asset_type_name: 'Characters',
  validations: new Map([['task-type-1', 'task-1']])
}
const assetWithoutTask = {
  id: 'asset-2',
  name: 'Chair',
  asset_type_name: 'Props',
  validations: new Map()
}

const makeForm = name => {
  const form = new FormData()
  form.append('file', new File(['x'], name, { type: 'video/mp4' }))
  return form
}

describe('AddThumbnailsModal', () => {
  let modal, modalRef, wrapper

  beforeEach(() => {
    assetStore.cache.assets = [asset, assetWithoutTask]
    const store = createStore({
      getters: {
        assetValidationColumns: () => ['task-type-1'],
        taskMap: () => new Map([['task-1', task]]),
        taskTypeMap: () =>
          new Map([['task-type-1', { id: 'task-type-1', name: 'Modeling' }]])
      }
    })
    // Mounted through a template ref, like the entities mixin reaches it: a
    // <script setup> component only shows what it passes to defineExpose.
    modalRef = ref(null)
    const Host = {
      setup: () => () =>
        h(AddThumbnailsModal, {
          ref: modalRef,
          entityType: 'Asset',
          parent: 'assets'
        })
    }
    wrapper = shallowMount(Host, {
      global: {
        plugins: [store],
        stubs: {
          AddThumbnailsModal: false,
          BaseModal: { template: '<div><slot /></div>' },
          FileUpload: {
            name: 'FileUpload',
            template: '<div></div>',
            methods: { reset() {} }
          }
        }
      }
    })
    modal = wrapper.findComponent(AddThumbnailsModal)
  })

  afterEach(() => {
    assetStore.cache.assets = []
  })

  const selectFiles = async forms => {
    wrapper.findComponent({ name: 'FileUpload' }).vm.$emit('fileselected', forms)
    await nextTick()
  }

  it('confirms the files named after an asset, with the task to upload to', async () => {
    const matching = makeForm('Characters_Bob.mp4')
    const withoutTask = makeForm('Props_Chair.mp4')
    const unknown = makeForm('Props_Table.mp4')
    await selectFiles([matching, withoutTask, unknown])

    expect(
      wrapper.findAll('.invalid-files li').map(item => item.text())
    ).toEqual(['Props_Chair.mp4', 'Props_Table.mp4'])
    wrapper.findComponent({ name: 'ModalFooter' }).vm.$emit('confirm')

    const [confirmed] = modal.emitted('confirm')[0]
    expect(confirmed).toEqual([matching])
    expect(confirmed[0].task).toBe(task)
  })

  // The entities mixin drives the upload progress through the modal ref.
  it('exposes the upload progress markers to the parent', async () => {
    await selectFiles([makeForm('Characters_Bob.mp4')])
    expect(wrapper.findComponent(Spinner).exists()).toBe(false)
    expect(wrapper.findComponent(CheckIcon).exists()).toBe(false)

    modalRef.value.markLoading('asset-1')
    await nextTick()
    expect(wrapper.findComponent(Spinner).exists()).toBe(true)
    expect(wrapper.findComponent(CheckIcon).exists()).toBe(false)

    modalRef.value.markUploaded('asset-1')
    await nextTick()
    expect(wrapper.findComponent(CheckIcon).exists()).toBe(true)
  })
})
