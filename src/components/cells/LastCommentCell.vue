<template>
  <td @click="$emit('click')">
    <div class="flexrow">
      <people-avatar
        class="flexrow-item avatar-wrapper"
        :size="25"
        :font-size="14"
        :person="task.last_comment.person"
        :is-link="false"
        v-if="task.last_comment.person"
      >
      </people-avatar>

      <span
        class="flexrow-item last-comment pointer"
        v-if="commentText && commentText.length > 0"
        v-html="renderMarkdown(commentText)"
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
import { renderMarkdown } from '@/lib/render'

import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'

export default {
  name: 'last-comment-cell',

  emits: ['click'],

  components: {
    PeopleAvatar
  },

  data() {
    return {
      timeout: null
    }
  },

  props: {
    task: {
      type: Object,
      required: true
    }
  },

  computed: {
    commentText() {
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
    renderMarkdown
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
