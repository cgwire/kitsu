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
    <span
      class="flexrow-item last-comment"
    >
      {{ commentText }}
    </span>
  </div>
</td>
</template>

<script>
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
    ])
  }
}
</script>

<style scoped>
.last-comment {
  margin-left: 0.6em;
}
</style>
