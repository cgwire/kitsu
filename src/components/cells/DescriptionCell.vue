<template>
<td>
  <span
    class="description"
    v-if="entry.description && entry.description.length > 0 && !full"
    v-html="compileMarkdown(shortenText(entry.description, 20))"
    v-tooltip="tooltipOptions"
    @click="onClick"
  >
  </span>
  <span
    v-html="compileMarkdown(entry.description)"
    v-else
  >
  </span>
</td>
</template>

<script>
import marked from 'marked'
import { mapGetters, mapActions } from 'vuex'
import stringHelpers from '../../lib/string'

export default {
  name: 'description-cell',
  data () {
    return {
      isOpen: false,
      timeout: null
    }
  },

  components: {
  },

  props: {
    entry: {
      type: Object,
      default: () => {}
    },
    full: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters([
    ]),

    tooltipOptions () {
      return {
        content: this.compileMarkdown(this.entry.description),
        show: this.isOpen,
        trigger: 'manual'
      }
    }
  },

  methods: {
    ...mapActions([
    ]),

    compileMarkdown (input) {
      return marked(input || '')
    },

    shortenText: stringHelpers.shortenText,

    onClick () {
      this.isOpen = !this.isOpen
    }
  }
}
</script>

<style lang="scss" scoped>
.no-avatar {
  width: 30px;
}

.last-comment {
  margin-left: 0.6em;
}

.no-comment {
  font-style: italic;
}

.description {
  cursor: pointer;
}
</style>
