<template>
<td>
  <span
    class="description"
    v-if="entry.description && entry.description.length > 0"
    v-html="compileMarkdown(shortenText(entry.description, 20))"
    v-tooltip="tooltipOptions"
    @click="onClick"
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
    }
  },

  computed: {
    ...mapGetters([
    ]),

    tooltipOptions () {
      return {
        content: this.compileMarkdown(this.entry.description),
        show: this.isOpen,
        trigger: 'manual',
        delay: {
          hide: 5000
        }
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
      if (this.isOpen) {
        this.timeout = setTimeout(() => {
          this.isOpen = false
        }, 3000)
      } else {
        clearTimeout(this.timeout)
      }
    }
  }
}
</script>

<style scoped>
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
