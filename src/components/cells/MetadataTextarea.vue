<template>
  <div
    ref="cellRef"
    class="metadata-textarea"
    role="button"
    tabindex="0"
    :title="modelValue"
    @click.stop="onOpen"
    @keydown.enter.stop.prevent="onOpen"
  >
    <span class="preview">{{ modelValue }}</span>
    <teleport to=".theme">
      <template v-if="isOpen">
        <div class="metadata-textarea-mask" @click="onClose"></div>
        <!-- Tab leaves it like a click outside. A click in the padding keeps
             the focus in the editor. -->
        <div
          class="metadata-textarea-popup"
          :style="popupStyle"
          @keydown.esc="onClose"
          @keydown.tab="onClose"
          @mousedown.self.prevent
        >
          <textarea
            ref="editorRef"
            class="metadata-textarea-editor"
            :value="modelValue"
            :readonly="!editable"
          />
        </div>
      </template>
    </teleport>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'

import { getPopupStyle } from '@/lib/popup'

const props = defineProps({
  modelValue: { type: String, default: '' },
  editable: { type: Boolean, default: false }
})

const emit = defineEmits(['update:model-value'])

const isOpen = ref(false)
const cellRef = ref(null)
const editorRef = ref(null)
const popupStyle = ref({})

const WIDTH = 300
// The popup with its editor at the default 8em height.
const HEIGHT = 120

const onOpen = event => {
  popupStyle.value = getPopupStyle(
    event.currentTarget.getBoundingClientRect(),
    { width: WIDTH, height: HEIGHT },
    { width: window.innerWidth, height: window.innerHeight }
  )
  isOpen.value = true
  nextTick(() => {
    // Vue set the value with the caret at its end, where the focus would
    // scroll: the text opens at its start.
    editorRef.value?.setSelectionRange(0, 0)
    editorRef.value?.focus()
  })
}

const onClose = () => {
  if (!isOpen.value) return
  const value = editorRef.value?.value ?? ''
  isOpen.value = false
  // Before Tab moves the focus, so it goes on from the cell. A clipped cell
  // stays where it is.
  cellRef.value?.focus({ preventScroll: true })
  if (props.editable && value !== props.modelValue) {
    emit('update:model-value', value)
  }
}
</script>

<style lang="scss" scoped>
.metadata-textarea {
  align-items: center;
  cursor: pointer;
  display: flex;
  height: 100%;
  width: 100%;
}

.preview {
  overflow: hidden;
  padding: 0.35rem 0.5rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.metadata-textarea-mask {
  inset: 0;
  position: fixed;
  z-index: 1200;
}

.metadata-textarea-popup {
  background: var(--background);
  border: 1px solid $green;
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--box-shadow);
  display: flex;
  flex-direction: column;
  padding: 0.4rem;
  position: fixed;
  z-index: 1201;
}

.metadata-textarea-editor {
  background: transparent;
  border: none;
  box-sizing: border-box;
  color: var(--text);
  font-size: 0.95em;
  height: 8em;
  line-height: 1.5em;
  // Shrinks to the popup max height, the text then scrolls inside.
  min-height: 0;
  resize: vertical;
  width: 100%;

  &:focus {
    outline: none;
  }
}
</style>
