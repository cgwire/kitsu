import { watch, onBeforeUnmount } from 'vue'

export const useModal = (active, emit) => {
  const onKeyDown = event => {
    if (event.key === 'Escape') {
      emit('cancel')
    }
  }

  watch(
    active,
    isActive => {
      if (isActive) {
        window.addEventListener('keydown', onKeyDown, false)
      } else {
        window.removeEventListener('keydown', onKeyDown)
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeyDown)
  })
}
