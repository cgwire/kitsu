<template>
<td>
  <span
    v-if="entry.description && entry.description.length > 0"
    v-html="compileMarkdown(entry.description)"
  >
  </span>
</td>
</template>

<script>
import marked from 'marked'
import { mapGetters, mapActions } from 'vuex'

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
</style>
