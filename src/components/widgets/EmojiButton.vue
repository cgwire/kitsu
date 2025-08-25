<template>
  <div>
    <div>
      <button-simple
        ref="buttonRef"
        class="emoji-button"
        icon="smile"
        :title="$t('comments.add_emoji')"
        :active="showEmojiPicker"
        @click="toggleEmojiPicker"
      />
    </div>
    <div class="emoji-picker-wrapper" v-if="showEmojiPicker">
      <emoji-picker
        class="emoji-picker"
        :class="{ 'is-up': isPickerUp }"
        :display-recent="true"
        :native="true"
        :theme="isDarkTheme ? 'dark' : 'light'"
        @select="onSelectEmoji"
      />
    </div>
  </div>
  <div
    @click="toggleEmojiPicker"
    :class="{
      'c-mask': true,
      'is-active': showEmojiPicker
    }"
  ></div>
</template>

<script setup>
import {
  computed,
  useTemplateRef,
  ref,
  nextTick,
  onMounted,
  onUnmounted
} from 'vue'
import { useStore } from 'vuex'

import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'

const showEmojiPicker = ref(false)
const buttonRef = useTemplateRef('buttonRef')
const isPickerUp = ref(false)

const emit = defineEmits(['select'])

const isDarkTheme = computed(() => {
  return useStore().getters.isDarkTheme
})

const checkPosition = () => {
  if (!buttonRef.value) return

  const buttonRect = buttonRef.value.$el.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const pickerHeight = 360
  const spaceBelow = viewportHeight - buttonRect.bottom
  const spaceAbove = buttonRect.top

  if (spaceBelow < pickerHeight + 20 && spaceAbove >= pickerHeight + 20) {
    isPickerUp.value = true
  } else {
    isPickerUp.value = false
  }
}

const onSelectEmoji = emoji => {
  emit('select', emoji)
  showEmojiPicker.value = false
}

const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
  if (showEmojiPicker.value) {
    nextTick(() => {
      checkPosition()
    })
  }
}

const handleResize = () => {
  if (showEmojiPicker.value) {
    checkPosition()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="css" scoped>
.emoji-button {
  border: 0;
  margin: 0;
  margin-right: 3px;
  color: var(--text-alt);
  padding: 0 10px;

  &:hover {
    color: var(--text);
  }
}

.emoji-picker-wrapper {
  position: relative;

  .emoji-picker {
    position: absolute;
    top: 6px;
    left: 0px;
    z-index: 1000;

    &.is-up {
      top: -360px;
    }
  }
}
</style>
