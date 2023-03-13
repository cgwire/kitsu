<template>
  <div class="question-mark">
    <help-circle-icon :size="small ? '0.5x' : '1x'" />
    <div class="question-text" v-html="renderMarkdown(text)"></div>
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
      type: String,
      required: true
    },
    small: {
      type: Boolean,
      default: false
    }
  },

  computed: {},

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
    font-size: 1em;
    font-weight: normal;
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
