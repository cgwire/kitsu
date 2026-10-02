import { shallowMount } from '@vue/test-utils'
import { CheckIcon } from 'lucide-vue-next'
import { h, nextTick, ref } from 'vue'
import { createStore } from 'vuex'

// Load @/store first (via @/lib/auth) to avoid a circular-import race when
// AddThumbnailsModal transitively imports assets/shots store modules.
import '@/lib/auth'
import assetStore from '@/store/modules/assets'

import AddThumbnailsModal from '@/components/modals/AddThumbnailsModal.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import Spinner from '@/components/widgets/Spinner.vue'

const task = { id: 'task-1' }
const asset = {
  id: 'asset-1',
  name: 'Bob',
  asset_type_name: 'Characters',
  validations: new Map([
    ['task-type-1', 'task-1'],
    ['task-type-2', 'task-3']
  ])
}
const otherAsset = {
  id: 'asset-3',
  name: 'Alice',
  asset_type_name: 'Characters',
  validations: new Map([['task-type-1', 'task-2']])
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
  let isLoading, modal, modalRef, wrapper

  beforeEach(() => {
    assetStore.cache.assets = [asset, otherAsset, assetWithoutTask]
    const store = createStore({
      getters: {
        assetValidationColumns: () => ['task-type-1', 'task-type-2'],
        taskMap: () =>
          new Map([
            ['task-1', task],
            ['task-2', { id: 'task-2' }],
            ['task-3', { id: 'task-3' }]
          ]),
        taskTypeMap: () =>
          new Map([
            ['task-type-1', { id: 'task-type-1', name: 'Modeling' }],
            ['task-type-2', { id: 'task-type-2', name: 'Shading' }]
          ])
      }
    })
    // Mounted through a template ref, like the entities mixin reaches it: a
    // <script setup> component only shows what it passes to defineExpose.
    modalRef = ref(null)
    isLoading = ref(false)
    const Host = {
      setup: () => () =>
        h(AddThumbnailsModal, {
          ref: modalRef,
          entityType: 'Asset',
          isLoading: isLoading.value,
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

  const confirm = () => {
    wrapper.findComponent({ name: 'ModalFooter' }).vm.$emit('confirm')
    return modal.emitted('confirm').at(-1)[0]
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

  // A failed upload stops the loading on the file it was sending.
  it('drops the upload marker once the loading stops', async () => {
    await selectFiles([makeForm('Characters_Bob.mp4')])
    isLoading.value = true
    modalRef.value.markLoading('asset-1')
    await nextTick()
    expect(wrapper.findComponent(Spinner).exists()).toBe(true)

    isLoading.value = false
    await nextTick()
    expect(wrapper.findComponent(Spinner).exists()).toBe(false)
  })

  // Confirming again after a failed upload must not upload a file twice.
  it('confirms again only the files not uploaded yet', async () => {
    const uploadedForm = makeForm('Characters_Bob.mp4')
    const leftForm = makeForm('Characters_Alice.mp4')
    await selectFiles([uploadedForm, leftForm])
    modalRef.value.markUploaded('asset-1')

    expect(confirm()).toEqual([leftForm])
  })

  it('confirms every file again for another task type', async () => {
    const form = makeForm('Characters_Bob.mp4')
    await selectFiles([form])
    modalRef.value.markUploaded('asset-1')

    await wrapper
      .findComponent(ComboboxTaskType)
      .vm.$emit('update:modelValue', 'task-type-2')

    expect(confirm()).toEqual([form])
    expect(form.task).toEqual({ id: 'task-3' })
  })
})
