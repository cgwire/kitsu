<template>
  <div>
    <div
      class="checklist-entry"
      :class="{
        checked: entry.checked,
        disabled: !isEditable
      }"
      :key="`comment-checklist-${index}`"
      v-for="(entry, index) in filteredChecklist"
    >
      <span
        class="checklist-checkbox"
        role="checkbox"
        :aria-checked="entry.checked"
        :aria-label="entry.text || $t('comments.checklist')"
        :aria-disabled="!isEditable || undefined"
        tabindex="0"
        @click="toggleEntryChecked(entry)"
        @keydown.enter.prevent="toggleEntryChecked(entry)"
        @keydown.space.prevent="toggleEntryChecked(entry)"
      >
        <check-square-icon class="icon" v-if="entry.checked" />
        <square-icon class="icon" v-else />
      </span>
      <span
        class="frame"
        role="button"
        tabindex="0"
        @click="
          $emit('time-code-clicked', {
            frame: entry.frame,
            revision: entry.revision
          })
        "
        @keydown.enter.prevent="
          $emit('time-code-clicked', {
            frame: entry.frame,
            revision: entry.revision
          })
        "
        @keydown.space.prevent="
          $emit('time-code-clicked', {
            frame: entry.frame,
            revision: entry.revision
          })
        "
        v-if="entry.frame >= 0"
      >
        v{{ entry.revision }} - {{ formatFrame(entry.frame) }}
      </span>
      <span
        class="checklist-clock"
        :title="$t('comments.add_frame_to_checklist')"
        role="button"
        tabindex="0"
        @click="setFrame(entry)"
        @keydown.enter.prevent="setFrame(entry)"
        @keydown.space.prevent="setFrame(entry)"
        v-if="isMoviePreview"
      >
        <clock-icon class="icon clock" />
      </span>
      <span class="checklist-label" v-if="disabled">{{ entry.text }}</span>
      <textarea
        class="checklist-text"
        :ref="el => setChecklistEntryRef(el, index)"
        rows="1"
        :placeholder="$t('comments.task_placeholder')"
        @keydown.enter="onEnter(index, $event)"
        @keyup.backspace="removeChecklistEntry(index, $event)"
        @keyup.up="focusPrevious(index, $event)"
        @keyup.down="focusNext(index, $event)"
        v-autosize
        v-model.trim="entry.text"
        v-else
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick } from 'vue'
import { CheckSquareIcon, ClockIcon, SquareIcon } from 'lucide-vue-next'

import { formatFrame } from '@/lib/video'

const props = defineProps({
  checklist: {
    default: () => [],
    type: Array
  },
  disabled: {
    default: false,
    type: Boolean
  },
  frame: {
    default: -1,
    type: Number
  },
  isEditable: {
    type: Boolean,
    default: true
  },
  isMoviePreview: {
    default: false,
    type: Boolean
  },
  revision: {
    default: -1,
    type: Number
  }
})

const emit = defineEmits([
  'add-item',
  'emit-change',
  'insert-item',
  'remove-task',
  'time-code-clicked'
])

const checklistEntryRefs = {}

const setChecklistEntryRef = (el, index) => {
  if (el) {
    checklistEntryRefs[`checklist-entry-${index}`] = el
  }
}

const filteredChecklist = computed(() => {
  return props.checklist.filter(Boolean)
})

// Keys pressed while an IME composes (e.g. Vietnamese Telex) must not
// trigger entry edition or focus moves: Enter confirms the composition,
// the arrows browse the candidate list. Chrome reports them with
// isComposing (or the legacy keyCode 229).
const isComposingEvent = event =>
  Boolean(event && (event.isComposing || event.keyCode === 229))

const onEnter = (index, event) => {
  if (isComposingEvent(event)) return
  event.preventDefault()
  addChecklistEntry(index)
}

const addChecklistEntry = index => {
  if (index === -1 || index === props.checklist.length - 1) {
    emit('add-item', {
      index,
      text: '',
      frame: -1,
      revision: -1,
      checked: false
    })
  } else {
    emit('insert-item', {
      index: index + 1,
      text: '',
      frame: -1,
      revision: -1,
      checked: false
    })
  }

  nextTick(() => {
    focusNext(index)
  })
}

const removeChecklistEntry = (index, event) => {
  if (isComposingEvent(event)) return
  const entry = props.checklist[index]
  if (!entry.text) {
    emit('remove-task', entry)
    focusPrevious(index)
  }
}

const focusPrevious = (index, event) => {
  if (isComposingEvent(event)) return
  if (props.checklist.length > 0) {
    if (index === 0) index = props.checklist.length
    index--
    const entryRef = `checklist-entry-${index}`
    checklistEntryRefs[entryRef]?.focus()
  }
}

const focusNext = (index, event) => {
  if (isComposingEvent(event)) return
  if (props.checklist.length > 0) {
    if (index === props.checklist.length - 1) index = -1
    index++
    const entryRef = `checklist-entry-${index}`
    checklistEntryRefs[entryRef]?.focus()
  }
}

const setFrame = item => {
  item.checked = !item.checked
  item.revision = props.revision
  item.frame = props.frame
  item.checked = !item.checked
  emit('emit-change')
}

const toggleEntryChecked = entry => {
  if (props.isEditable) {
    entry.checked = !entry.checked
    emit('emit-change')
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .checklist-entry {
    .checklist-label,
    .checklist-text {
      color: $light-grey-light;
    }

    .checklist-text {
      background: transparent;

      &:active,
      &:focus,
      &:hover {
        background: $dark-grey;
        border: 1px solid $dark-grey-strong;
      }

      &:disabled {
        background: transparent;
        color: white;

        &:hover {
          border: 1px solid transparent;
        }
      }
    }

    &.checked .checklist-label,
    &.checked .checklist-text {
      color: $grey;
    }

    &.disabled {
      .checklist-checkbox {
        color: $grey;

        .icon {
          fill: rgba($grey, 0.15);
        }
      }
    }
  }
}

.checklist-entry {
  color: $grey;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 0.2em;
  margin-bottom: 0.3em;

  // Single-line clickable columns share one 20px line box so the checkbox,
  // frame badge and clock stay centered on the label's first line. They are
  // never multi-line, so centering them is safe.
  .checklist-checkbox,
  .checklist-clock,
  .frame {
    display: inline-flex;
    align-items: center;
    min-height: 20px;
    cursor: pointer;

    .icon {
      width: 20px;
    }

    .clock {
      width: 16px;
    }
  }

  .frame {
    justify-content: center;
    border: 1px solid var(--border-alt);
    border-radius: 4px;
    width: 70px;
    padding: 0 0.3em;
    font-size: 0.85em;
    white-space: nowrap;

    // The a11y pass made this a focusable button; its own border already
    // signals focus, so darken it instead of stacking the default outline.
    &:focus-visible {
      outline: none;
      border-color: var(--text-alt);
    }
  }

  // Text columns keep a matching 20px line box on their first line, but stay
  // flow-content (not flex) so multi-line values grow downward with their
  // first line still aligned to the checkbox (align-items: flex-start).
  .checklist-label,
  .checklist-text {
    font-size: 0.9em;
    line-height: 20px;
    padding: 0 0.3em;
  }

  .checklist-label {
    color: #333;
    cursor: default;
  }

  .checklist-text {
    width: 100%;
    min-height: 20px;
    margin-right: 0.5em;
    border: 1px solid transparent;
    border-radius: 4px;
    resize: none;

    &:focus,
    &:active,
    &:hover {
      border: 1px solid $light-grey;
    }

    // The focus border is the visible indicator; suppress the default
    // outline the a11y pass left doubled on top of it.
    &:focus {
      outline: none;
    }

    &:disabled {
      background-color: white;
      color: #333;

      &:hover {
        border: 1px solid transparent;
      }
    }
  }

  &.checked .checklist-label,
  &.checked .checklist-text {
    color: $light-grey-2;
  }

  &.disabled {
    .checklist-checkbox {
      cursor: default;
      color: $light-grey-2;

      .icon {
        fill: rgba($light-grey-2, 0.15);
      }
    }
  }
}
</style>
