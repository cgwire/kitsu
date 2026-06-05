import { ref } from 'vue'

export const useCombobox = emit => {
  const showList = ref(false)

  const toggle = () => {
    showList.value = !showList.value
  }

  const select = item => {
    emit('update:model-value', item.id)
    showList.value = false
  }

  return { showList, toggle, select }
}
