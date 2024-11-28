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
        :ref="`checklist-entry-${index}`"
        rows="1"
        :placeholder="$t('comments.task_placeholder')"
        @keypress.enter.prevent="addChecklistEntry(index)"
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

<script>
import { CheckSquareIcon, ClockIcon, SquareIcon } from 'lucide-vue-next'

import { formatFrame } from '@/lib/video'

export default {
  name: 'checklist',

  components: {
    CheckSquareIcon,
    ClockIcon,
    SquareIcon
  },

  props: {
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
  },

  emits: [
    'add-item',
    'emit-change',
    'insert-item',
    'remove-task',
    'time-code-clicked'
  ],

  computed: {
    filteredChecklist() {
      return this.checklist.filter(Boolean) // remove empty entries
    }
  },

  methods: {
    addChecklistEntry(index) {
      if (index === -1 || index === this.checklist.length - 1) {
        this.$emit('add-item', {
          index,
          text: '',
          frame: -1,
          revision: -1,
          checked: false
        })
      } else {
        this.$emit('insert-item', {
          index: index + 1,
          text: '',
          frame: -1,
          revision: -1,
          checked: false
        })
      }

      this.$nextTick(() => {
        this.focusNext(index)
      })
    },

    removeChecklistEntry(index) {
      const entry = this.checklist[index]
      if (entry.text.length === 0) {
        this.$emit('remove-task', entry)
        this.focusPrevious(index)
      }
    },

    focusPrevious(index) {
      if (this.checklist.length > 0) {
        if (index === 0) index = this.checklist.length
        index--
        const entryRef = `checklist-entry-${index}`
        this.$refs[entryRef][0].focus()
      }
    },

    formatFrame,

    focusNext(index) {
      if (this.checklist.length > 0) {
        if (index === this.checklist.length - 1) index = -1
        index++
        const entryRef = `checklist-entry-${index}`
        this.$refs[entryRef][0].focus()
      }
    },

    setFrame(item) {
      item.checked = !item.checked
      item.revision = this.revision
      item.frame = this.frame
      item.checked = !item.checked
      this.$emit('emit-change')
    },

    toggleEntryChecked(entry) {
      if (this.isEditable) {
        entry.checked = !entry.checked
        this.$emit('emit-change')
      }
    }
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
