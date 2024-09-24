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
      <div
        class="tooltip"
        @dblclick="onDoubleClick"
        @keyup.esc="onClick"
        v-if="isOpen"
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
    </template>
  </td>
</template>

<script>
import { renderMarkdown } from '@/lib/render'
import stringHelpers from '@/lib/string'

export default {
  name: 'description-cell',

  data() {
    return {
      isEditing: false,
      isOpen: false
    }
  },

  props: {
    editable: {
      type: Boolean,
      default: false
    },
    entry: {
      type: Object,
      default: () => {}
    },
    full: {
      type: Boolean,
      default: false
    }
  },

  emits: ['description-changed'],

  methods: {
    renderMarkdown,

    shortenText: stringHelpers.shortenText,

    onClick(event) {
      if (
        (event.currentTarget.classList.contains('description-cell') &&
          !event.target.closest('.description-cell .tooltip')) ||
        event.keyCode === 27
      ) {
        this.isOpen = !this.isOpen
        if (!this.isOpen && this.isEditing) {
          this.isEditing = false
          const val = this.$refs.text.value
          this.$emit('description-changed', val)
        }
      }
    },

    onDoubleClick() {
      if (this.editable) {
        if (this.isEditing) {
          const val = this.$refs.text.value
          this.$emit('description-changed', val)
        }
        this.isEditing = !this.isEditing
        if (this.isEditing) {
          this.$nextTick(() => {
            this.$refs.text.focus()
          })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .description-cell .tooltip {
    background: $dark-grey-light;
    box-shadow: 0 0 3px 0 $dark-grey-strong;
    &::after {
      border-color: $dark-grey-light transparent transparent;
    }
  }
}

td {
  cursor: pointer;
  position: relative;
}

.description-shorten-text {
  min-height: 30px;
  min-width: 100px;
}

.description-cell .tooltip {
  background-color: $white;
  border-radius: 0.5rem;
  display: block;
  font-size: 0.9em;
  left: 50%;
  min-height: 100px;
  max-height: 200px;
  padding: 0.6rem;
  position: absolute;
  top: -100px;
  transform: translatex(-50%);
  width: 320px;
  box-shadow: 0 0 3px 0 $grey;
  z-index: 100;

  p {
    margin: 1em;
  }

  .tooltip-text {
    padding: 0.5em;
    overflow-y: auto;
    height: 80px;
  }

  textarea {
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

  &:after {
    position: absolute;
    top: 100px;
    left: 50%;
    transform: translatex(-50%);

    height: 0;
    width: 0;

    border: 0.5rem solid;
    border-color: $white transparent transparent;
    content: '';
  }
}

.c-mask {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  overflow: hidden;
  background-color: #000;
  opacity: 0;
}

.c-mask {
  width: 100%;
  height: 100%;
}
</style>
