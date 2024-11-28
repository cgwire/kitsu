<template>
  <div class="question-mark">
    <help-circle-icon class="icon-1x" />
    <div
      class="question-text"
      :class="position"
      v-html="renderMarkdown(text)"
    ></div>
  </div>
</template>

<script>
import { HelpCircleIcon } from 'lucide-vue-next'

import { renderMarkdown } from '@/lib/render'

export default {
  name: 'info-question-mark',

  components: {
    HelpCircleIcon
  },

  props: {
    text: {
      type: String,
      required: true
    },
    position: {
      type: String,
      validator: value => ['left', 'right'].includes(value)
    }
  },

  methods: {
    renderMarkdown
  }
}
</script>

<style lang="scss" scoped>
.question-mark {
  position: relative;

  .question-text {
    background: var(--background-alt);
    border-radius: 5px;
    box-shadow: 0 2px 6px var(--box-shadow);
    display: none;
    font-size: 1em;
    font-weight: normal;
    padding: 0.5em;
    position: absolute;
    width: max-content;
    max-width: 500px;
    z-index: 300;

    &.left {
      left: 0;
    }
    &.right {
      right: 0;
    }
  }

  &:hover {
    .question-text {
      display: block;
    }
  }
}
</style>
