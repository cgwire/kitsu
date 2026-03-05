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
      <span class="checklist-checkbox" @click="toggleEntryChecked(entry)">
        <check-square-icon class="icon" v-if="entry.checked" />
        <square-icon class="icon" v-else />
      </span>
      <span
        class="frame"
        @click="
          $emit('time-code-clicked', {
            frame: entry.frame,
            revision: entry.revision
          })
        "
        v-if="entry.frame >= 0"
      >
        v{{ entry.revision }} - {{ formatFrame(entry.frame) }}
      </span>
      <span @click="setFrame(entry)" v-if="isMoviePreview">
        <clock-icon class="icon clock" />
      </span>
      <textarea
        class="checklist-text"
        :ref="el => setChecklistEntryRef(el, index)"
        rows="1"
        :placeholder="$t('comments.task_placeholder')"
        @keydown.enter.prevent="addChecklistEntry(index)"
        @keyup.backspace="removeChecklistEntry(index)"
        @keyup.up="focusPrevious(index)"
        @keyup.down="focusNext(index)"
        :disabled="entry.text.length !== 0 && disabled"
        v-autosize
        v-model.trim="entry.text"
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

const addChecklistEntry = (index) => {
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

const removeChecklistEntry = (index) => {
  const entry = props.checklist[index]
  if (entry.text.length === 0) {
    emit('remove-task', entry)
    focusPrevious(index)
  }
}

const focusPrevious = (index) => {
  if (props.checklist.length > 0) {
    if (index === 0) index = props.checklist.length
    index--
    const entryRef = `checklist-entry-${index}`
    checklistEntryRefs[entryRef]?.focus()
  }
}

const focusNext = (index) => {
  if (props.checklist.length > 0) {
    if (index === props.checklist.length - 1) index = -1
    index++
    const entryRef = `checklist-entry-${index}`
    checklistEntryRefs[entryRef]?.focus()
  }
}

const setFrame = (item) => {
  item.checked = !item.checked
  item.revision = props.revision
  item.frame = props.frame
  item.checked = !item.checked
  emit('emit-change')
}

const toggleEntryChecked = (entry) => {
  if (props.isEditable) {
    entry.checked = !entry.checked
    emit('emit-change')
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .checklist-entry {
    .checklist-text {
      color: $light-grey-light;
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
  margin-bottom: 0.3em;

  .checklist-text {
    font-size: 0.9em;
    padding: 0.2em;
    padding-top: 0;
    margin-right: 0.5em;
    margin-top: 4px;
    width: 100%;
    min-height: 20px;
    border: 1px solid transparent;
    resize: none;

    &:focus,
    &:active,
    &:hover {
      border: 1px solid $light-grey;
    }

    &:disabled {
      background-color: white;
      color: #333;

      &:hover {
        border: 1px solid transparent;
      }
    }
  }

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

  span {
    cursor: pointer;
    padding: 0.2em 0 0 0;
    margin-right: 0.2em;
    margin-left: 0;

    .icon {
      width: 20px;
    }

    .clock {
      width: 16px;
    }
  }

  .frame {
    border: 1px solid var(--border-alt);
    border-radius: 4px;
    width: 70px;
    margin-top: 2px;
    padding: 0 0.2em;
    text-align: center;
    white-space: nowrap;
  }
}
</style>
