import { nextTick, ref, useId, watch } from 'vue'

// Shared keyboard behavior for the custom Combobox* dropdowns (the ones that
// render their own trigger + option list instead of a native <select>).
// Follows the collapsible-listbox ARIA pattern: focus stays on the trigger,
// the active option is tracked by index and exposed via aria-activedescendant
// (see optionId), the list itself only carries role="listbox"/"option".
export const useComboboxKeyboard = ({
  isOpen,
  toggle,
  optionsLength,
  onSelect,
  listRef
}) => {
  const uid = useId()
  const activeIndex = ref(-1)

  const length = () =>
    typeof optionsLength === 'function' ? optionsLength() : optionsLength.value

  const optionId = index => `combobox-${uid}-option-${index}`

  const clampIndex = index => {
    const max = length() - 1
    return max < 0 ? -1 : Math.min(Math.max(index, 0), max)
  }

  const open = () => {
    if (!isOpen.value) toggle()
  }

  const close = () => {
    if (isOpen.value) toggle()
  }

  const move = delta => {
    if (length() === 0) return
    if (activeIndex.value === -1) {
      activeIndex.value = delta > 0 ? 0 : length() - 1
    } else {
      activeIndex.value = clampIndex(activeIndex.value + delta)
    }
  }

  const onKeydown = event => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (!isOpen.value) {
          open()
        } else if (activeIndex.value !== -1) {
          onSelect(activeIndex.value)
        } else {
          close()
        }
        break
      case 'ArrowDown':
        event.preventDefault()
        if (isOpen.value) {
          move(1)
        } else {
          open()
        }
        break
      case 'ArrowUp':
        event.preventDefault()
        if (isOpen.value) {
          move(-1)
        } else {
          open()
        }
        break
      case 'Escape':
        if (isOpen.value) {
          event.preventDefault()
          close()
        }
        break
      case 'Tab':
        close()
        break
    }
  }

  watch(isOpen, value => {
    if (!value) activeIndex.value = -1
  })

  if (listRef) {
    watch(activeIndex, index => {
      if (index === -1) return
      // By role: a group title can sit between two options.
      nextTick(() => {
        const options = listRef.value?.querySelectorAll('[role="option"]')
        options?.[index]?.scrollIntoView?.({ block: 'nearest' })
      })
    })
  }

  return { activeIndex, onKeydown, optionId }
}
