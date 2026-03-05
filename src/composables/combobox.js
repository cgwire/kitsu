import { ref } from 'vue'

export function useCombobox(emit) {
  const showList = ref(false)

  function toggle() {
    showList.value = !showList.value
  }

  function select(item) {
    emit('update:modelValue', item.id)
    showList.value = false
  }

  return { showList, toggle, select }
}
