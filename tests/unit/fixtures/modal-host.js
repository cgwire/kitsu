import { createApp, h, nextTick, ref } from 'vue'

import { useModal } from '@/composables/modal'

// An open modal, without a second VTU mount: that one would swap the stubs of a
// shallowMount made before it. Resolves to the function that closes the modal.
export const openModalHost = async () => {
  const element = document.body.appendChild(document.createElement('div'))
  const app = createApp({
    setup: () => {
      useModal(ref(true), () => {})
      return () => h('div')
    }
  })
  app.mount(element)
  await nextTick()
  return () => {
    app.unmount()
    element.remove()
  }
}
