<template>
  <td class="description-cell" @keyup.esc="onClick" @click="onClick">
    <template v-if="full">
      <div
        class="description-shorten-text"
        v-html="renderMarkdown(entry.description)"
      ></div>
    </template>
    <template v-else>
      <div class="c-mask" v-if="isOpen"></div>
      <span
        class="description-shorten-text selectable"
        v-html="
          renderMarkdown(shortenText(entry.description, 20), {
            allowedLinkTag: false
          })
        "
      >
      </span>
      <teleport to="body">
        <div
          class="tooltip"
          :class="{ dark: isDarkTheme }"
          @dblclick="onDoubleClick"
          @keyup.esc="onClick"
          v-if="isOpen"
          :style="tooltipStyle"
        >
          <div
            class="tooltip-text"
            @keyup.esc="onClick"
            v-html="renderMarkdown(entry.description)"
            v-if="!isEditing"
          ></div>
          <textarea
            class="tooltip-editor"
            ref="text"
            :value="entry.description"
            @keyup.esc="onClick"
            @keyup.ctrl.enter="onDoubleClick"
            v-else
          >
          </textarea>
        </div>
      </teleport>
    </template>
  </td>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'
import { useStore } from 'vuex'

import { renderMarkdown } from '@/lib/render'
import stringHelpers from '@/lib/string'

const store = useStore()

const props = defineProps({
  editable: { type: Boolean, default: false },
  entry: { type: Object, default: () => ({}) },
  full: { type: Boolean, default: false }
})

const emit = defineEmits(['description-changed'])

const isDarkTheme = computed(() => store.getters.isDarkTheme)

const isEditing = ref(false)
const isOpen = ref(false)
const text = ref(null)
const tooltipPosition = ref({ top: 0, left: 0 })

const tooltipStyle = computed(() => ({
  top: tooltipPosition.value.top + 'px',
  left: tooltipPosition.value.left + 'px'
}))

const shortenText = stringHelpers.shortenText

const onClick = event => {
  if (
    (event.currentTarget.classList.contains('description-cell') &&
      !event.target.closest('.description-cell .tooltip')) ||
    event.keyCode === 27
  ) {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      const td = event.currentTarget
      const rect = td.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft
      tooltipPosition.value = {
        top: rect.top + scrollTop - 105,
        left: rect.left + scrollLeft + rect.width / 2 - 160
      }
    } else if (isEditing.value) {
      isEditing.value = false
      emit('description-changed', text.value.value)
    }
  }
}

const onDoubleClick = () => {
  if (!props.editable) return
  if (isEditing.value) {
    emit('description-changed', text.value.value)
  }
  isEditing.value = !isEditing.value
  if (isEditing.value) {
    nextTick(() => {
      text.value.focus()
    })
  }
}
</script>

<style lang="scss" scoped>
.dark.tooltip {
  background: $dark-grey-light;
  box-shadow: 0 0 3px 0 $dark-grey-strong;

  &::after {
    border-top-color: $dark-grey-light;
  }
}

.description-cell {
  cursor: pointer;
  position: relative;
}

.description-shorten-text {
  min-height: 30px;
  min-width: 100px;
}

.tooltip {
  background-color: $white;
  border-radius: 0.5rem;
  display: block;
  font-size: 0.9em;
  min-height: 100px;
  max-height: 200px;
  padding: 0.6rem;
  position: absolute;
  width: 320px;
  box-shadow: 0 0 3px 0 $grey;
  z-index: 1000;

  p {
    margin: 1em;
  }

  .tooltip-text {
    padding: 0.5em;
    overflow-y: auto;
    height: 80px;
  }

  .tooltip-editor {
    box-shadow: inset 0 0 3px 0 $grey;
    padding: 0.5em;
    color: inherit;
    font-size: 0.95em;
    height: 100%;
    line-height: 1.7em;
    min-height: 80px;
    width: 100%;

    &:focus {
      outline: none;
    }
  }

  &::after {
    position: absolute;
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
    height: 0;
    width: 0;
    border: 0.5rem solid transparent;
    border-top-color: $white;
    content: '';
  }
}

.c-mask {
  width: 100%;
  height: 100%;
}
</style>
