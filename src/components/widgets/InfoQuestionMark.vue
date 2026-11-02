<template>
  <div
    ref="markRef"
    class="question-mark"
    @mouseenter="showText"
    @mouseleave="onLeave"
  >
    <help-circle-icon class="icon-1x" />
    <!-- Out of the tables and blocks, which clip their overflow. -->
    <teleport to="#theme-popups" v-if="isTextShown">
      <div
        ref="textRef"
        class="question-text"
        :style="textStyle"
        @mouseleave="onLeave"
        v-html="renderMarkdown(text)"
      ></div>
    </teleport>
  </div>
</template>

<script setup>
import { HelpCircleIcon } from 'lucide-vue-next'
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

import { getPopupStyle } from '@/lib/popup'
import { renderMarkdown } from '@/lib/render'

// Props
// --------------------------------------------------------------------------
const props = defineProps({
  text: {
    type: String,
    required: true
  },
  position: {
    type: String,
    default: 'left',
    validator: value => ['left', 'right'].includes(value)
  }
})

// State
// --------------------------------------------------------------------------
const isTextShown = ref(false)
const markRef = ref(null)
const textRef = ref(null)
const textStyle = ref({})

// Functions
// --------------------------------------------------------------------------
// Placed once rendered: its size depends on its text. It touches the icon,
// so the pointer can reach its links.
const placeText = () => {
  if (!markRef.value || !textRef.value) return
  const mark = markRef.value.getBoundingClientRect()
  const { width, height } = textRef.value.getBoundingClientRect()
  // A right text ends at the right edge of the icon.
  const left = props.position === 'right' ? mark.right - width : mark.left
  textStyle.value = getPopupStyle(
    { top: mark.top, bottom: mark.bottom, left },
    { width, height },
    { width: window.innerWidth, height: window.innerHeight },
    0
  )
}

const showText = () => {
  if (isTextShown.value) return
  textStyle.value = {}
  isTextShown.value = true
  nextTick(placeText)
}

const hideText = () => {
  isTextShown.value = false
}

const onLeave = event => {
  const target = event.relatedTarget
  const isOnMarkOrText =
    markRef.value?.contains(target) || textRef.value?.contains(target)
  if (!isOnMarkOrText) hideText()
}

// Drawn over the page, the text does not follow the icon: it hides when the
// page under it scrolls or resizes.
const onWindowScroll = event => {
  if (event.target.contains?.(markRef.value)) hideText()
}

const listenToWindow = isListening => {
  const method = isListening ? 'addEventListener' : 'removeEventListener'
  window[method]('resize', hideText)
  // Captured: the scroll of an element does not bubble.
  window[method]('scroll', onWindowScroll, true)
}

// Watchers
// --------------------------------------------------------------------------
watch(isTextShown, listenToWindow)

// Lifecycle
// --------------------------------------------------------------------------
onBeforeUnmount(() => listenToWindow(false))
</script>

<style lang="scss" scoped>
.question-text {
  background: var(--background-alt);
  border-radius: 5px;
  box-shadow: 0 2px 6px var(--box-shadow);
  color: var(--text);
  // On a phone too: getPopupStyle keeps 8 px between it and the window edges.
  max-width: min(500px, calc(100vw - 16px));
  overflow-y: auto;
  padding: 0.5em;
  position: fixed;
  width: max-content;
  z-index: $z-tooltip;
}
</style>
