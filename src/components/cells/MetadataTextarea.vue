<template>
  <div
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
        <div class="metadata-textarea-popup" :style="popupStyle">
          <textarea
            ref="editorRef"
            class="metadata-textarea-editor"
            :value="modelValue"
            :readonly="!editable"
            @keyup.esc="onClose"
          />
        </div>
      </template>
    </teleport>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  editable: { type: Boolean, default: false }
})

const emit = defineEmits(['update:model-value'])

const isOpen = ref(false)
const editorRef = ref(null)
const popupStyle = ref({})

const WIDTH = 300

const onOpen = event => {
  const rect = event.currentTarget.getBoundingClientRect()
  const left = Math.min(rect.left, window.innerWidth - WIDTH - 8)
  popupStyle.value = {
    top: `${rect.bottom + 4}px`,
    left: `${Math.max(8, left)}px`,
    width: `${WIDTH}px`
  }
  isOpen.value = true
  nextTick(() => editorRef.value?.focus())
}

const onClose = () => {
  if (!isOpen.value) return
  const value = editorRef.value?.value ?? ''
  isOpen.value = false
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
  line-height: 1.5em;
  min-height: 8em;
  resize: vertical;
  width: 100%;

  &:focus {
    outline: none;
  }
}
</style>
