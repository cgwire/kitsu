<template>
  <div>
    <div
      :class="{
        'checklist-entry': true,
        flexrow: true,
        checked: entry.checked
      }"
      :key="'comment-checklist-' + '-' + index"
      v-for="(entry, index) in checklist"
    >
      <span class="flexrow-item" @click="toggleEntryChecked(entry)">
        <check-square-icon class="icon" v-if="entry.checked" />
        <square-icon class="icon" v-else />
      </span>
      <span
        class="flexrow-item frame pointer"
        @click="
          $emit('time-code-clicked', {
            frame: entry.frame,
            revision: entry.revision
          })
        "
        v-show="entry.frame >= 0"
      >
        v{{ entry.revision }} - {{ formatFrame(entry.frame) }}
      </span>
      <span
        class="flexrow-item"
        @click="setFrame(entry)"
        v-show="isMoviePreview"
      >
        <clock-icon class="icon clock" />
      </span>
      <textarea-autosize
        type="text"
        class="checklist-text flexrow-item"
        :ref="`checklist-entry-${index}`"
        rows="1"
        :placeholder="$t('comments.task_placeholder')"
        @keypress.enter.prevent.native="addChecklistEntry(index, $event)"
        @keyup.backspace.native="removeChecklistEntry(index)"
        @keyup.up.native="focusPrevious(index)"
        @keyup.down.native="focusNext(index)"
        :disabled="entry.text.length !== 0 && disabled"
        v-model.trim="entry.text"
      ></textarea-autosize>
    </div>
  </div>
</template>

<script>
import { CheckSquareIcon, ClockIcon, SquareIcon } from 'vue-feather-icons'
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
    isMoviePreview: {
      default: false,
      type: Boolean
    },
    revision: {
      default: -1,
      type: Number
    }
  },

  methods: {
    addChecklistEntry(index, event) {
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
        this.$refs[entryRef][0].$el.focus()
      }
    },

    formatFrame,

    focusNext(index) {
      if (this.checklist.length > 0) {
        if (index === this.checklist.length - 1) index = -1
        index++
        const entryRef = `checklist-entry-${index}`
        this.$refs[entryRef][0].$el.focus()
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
      entry.checked = !entry.checked
      this.$emit('emit-change')
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
      color: #999;
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
    padding-top: 0em;
    margin-right: 0.5em;
    margin-top: 4px;
    width: 100%;
    min-height: 20px;
    border: 1px solid transparent;

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
    color: #bbb;
    text-decoration: line-through;
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
  }
}
</style>
