<template>
<td>
  <span
    class="description"
    v-if="entry.description && entry.description.length > 0"
    v-html="compileMarkdown(shortenText(entry.description, 20))"
    v-tooltip="{
      content: compileMarkdown(entry.description),
      trigger: 'click'
    }"
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
  components: {
  },
  props: [
    'entry'
  ],
  computed: {
    ...mapGetters([
    ])
  },

  methods: {
    ...mapActions([
    ]),

    compileMarkdown (input) {
      return marked(input || '')
    },

    shortenText: stringHelpers.shortenText
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
