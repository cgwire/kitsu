<template>
<td>
  <div class="flexrow">
    <people-avatar
      class="flexrow-item avatar-wrapper"
      :size="25"
      :font-size="14"
      :person="task.last_comment.person"
      v-if="task.last_comment.person"
    >
    </people-avatar>
    <span class="no-avatar" v-else>
      &nbsp;
    </span>

    <span
      class="flexrow-item last-comment"
      v-if="commentText && commentText.length > 0"
      v-html="compileMarkdown(commentText)"
    >
    </span>
    <span
      class="flexrow-item last-comment no-comment"
      v-else-if="task.last_comment.person"
    >
      {{ $t('main.empty_comment') }}
    </span>
  </div>
</td>
</template>

<script>
import marked from 'marked'
import { mapGetters, mapActions } from 'vuex'
import PeopleAvatar from './../widgets/PeopleAvatar'

export default {
  name: 'last-comment-cell',
  components: {
    PeopleAvatar
  },
  props: [
    'task'
  ],
  computed: {
    ...mapGetters([
    ]),

    commentText () {
      const text = this.task.last_comment.text
      const maxLength = 140
      let result = text || ''
      if (text !== undefined && text.length > maxLength) {
        result = text.slice(0, maxLength) + '...'
      }

      return result
    }
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
