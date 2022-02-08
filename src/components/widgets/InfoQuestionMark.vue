<template>
<div
  class="question-mark"
>
  <help-circle-icon />
  <div
    class="question-text"
    v-html="renderMarkdown(text)"
  >
  </div>
</div>
</template>

<script>
import { HelpCircleIcon } from 'vue-feather-icons'
import { renderMarkdown } from '@/lib/render'

export default {
  name: 'spinner',
  components: {
    HelpCircleIcon
  },

  props: {
    text: {
      type: String
    }
  },

  computed: {
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
    min-width: 300px;
    padding: 0.5em;
    position: absolute;
    z-index: 300;
  }

  &:hover {
    .question-text {
      display: block;
    }
  }
}
</style>
