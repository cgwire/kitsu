<template>
<div
  class="question-mark"
  :style="sizeStyle"
>
  <help-circle-icon />
  <div class="question-text">
    {{ text }}
  </div>
</div>
</template>

<script>
import { HelpCircleIcon } from 'vue-feather-icons'

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
  }
}
</script>

<style lang="scss" scoped>
.question-mark {
  position: absolute;

  .question-text {
    background: var(--background-alt);
    border-radius: 5px;
    box-shadow: 0 2px 6px var(--box-shadow);
    display: none;
    max-width: 300px;
    padding: 0.5em;
    position: relative;
    z-index: 300;
  }

  &:hover {
    .question-text {
      display: block;
    }
  }
}
</style>
