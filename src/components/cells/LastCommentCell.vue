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
      class="flexrow-item last-comment pointer"
      v-if="commentText && commentText.length > 0"
      v-tooltip="tooltipOptions"
      v-html="compileMarkdown(commentText)"
      @click="onClick"
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

  data () {
    return {
      isOpen: false,
      timeout: null
    }
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
    },

    tooltipOptions () {
      return {
        content: this.compileMarkdown(this.task.last_comment.text),
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

.pointer {
  cursor: pointer;
}

.no-comment {
  font-style: italic;
}

.tooltip {
  width: 500px;
}
</style>
