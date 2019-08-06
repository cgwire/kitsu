<template>
<article
  :class="{
    comment: true,
    pinned: comment.pinned,
    highlighted: highlighted
  }"
  :style="{
    'border-left': '6px solid ' + comment.task_status.color
  }"
>
  <div class="media">
  <figure class="media-left">
    <people-avatar class="level-item" :person="comment.person" />
  </figure>

  <div class="media-content">
    <div class="content">
      <div class="comment-person flexrow">
        <div class="flexrow-item">
          <strong class="">
            <people-name class="" :person="comment.person" />
          </strong>
          <span class="comment-date">
            {{ formatDate(comment.created_at) }}
          </span>
          <router-link
            :to="previewRoute"
            class="revision"
            v-if="!light && comment.previews.length > 0"
          >
            {{ $t('comments.revision') }} {{ comment.previews[0].revision }}
          </router-link>
        </div>
        <span class="filler"></span>
        <div class="flexrow-item menu-wrapper">
          <chevron-down-icon
            class="menu-icon"
            @click="toggleCommentMenu"
          />
          <comment-menu
            :is-pinned="comment.pinned"
            :is-editable="editable"
            @pin-clicked="$emit('pin-comment', comment)"
            @edit-clicked="$emit('edit-comment', comment); toggleCommentMenu()"
            @delete-clicked="$emit('delete-comment', comment); toggleCommentMenu()"
            ref="menu"
          />
        </div>
      </div>
      <div>
        <router-link
          :to="previewRoute"
          class="revision"
          v-if="light && comment.previews.length > 0"
        >
          {{ $t('comments.revision') }} {{ comment.previews[0].revision }}
        </router-link>
      </div>

      <p v-if="comment.task_status.name === 'Done'">
        <span :style="{'color': comment.task_status.color}">
          {{ $t('comments.validated') }}
        </span>
      </p>
      <p v-if="taskStatus.is_done && isLast">
        <img src="../../assets/illustrations/validated.png" />
      </p>
      <p
        v-html="renderComment(comment.text, comment.mentions, personMap)"
        class="comment-text"
        v-if="comment.text"
      >
      </p>
      <p class="comment-text empty word-break" v-else>
        {{ $t('comments.empty_text') }}
      </p>
      <div
        v-if="checklist.length > 0"
      >
        <div
          :class="{
            'checklist-entry': true,
            flexrow: true,
            checked: entry.checked
          }"
          :key="'comment-checklist-' + comment.id + '-' + index"
          v-for="(entry, index) in checklist"
        >
          <span
            class="flexrow-item"
            @click="toggleEntryChecked(entry)"
          >
            <check-square-icon class="icon" v-if="entry.checked" />
            <square-icon class="icon" v-else />
          </span>
          <textarea-autosize
            type="text"
            class="checklist-text flexrow-item"
            :ref="`checklist-entry-${index}`"
            rows="1"
            @keypress.enter.prevent.native="addChecklistEntry(index, $event)"
            @keyup.backspace.native="removeChecklistEntry(index)"
            @keyup.up.native="focusPrevious(index)"
            @keyup.down.native="focusNext(index)"
            @keyup.native="emitChangeEvent($event)"
            :disabled="!isChangeChecklistAllowed"
            v-model="entry.text"
          ></textarea-autosize>
        </div>
      </div>

      <p class="pinned-text" v-if="comment.pinned">
        {{ $t('comments.pinned') }}
      </p>
    </div>
  </div>
  </div>
  <div
    class="has-text-centered add-checklist"
    @click="addChecklistEntry(-1)"
    v-if="isAddChecklistAllowed"
  >
    {{ $t('comments.add_checklist') }}
  </div>
</article>
</template>

<script>
import { mapGetters } from 'vuex'
import { formatDate, renderComment, remove } from '../../lib/helpers'

import {
  CheckSquareIcon,
  ChevronDownIcon,
  SquareIcon
} from 'vue-feather-icons'
import CommentMenu from './CommentMenu.vue'
import PeopleAvatar from './PeopleAvatar.vue'
import PeopleName from './PeopleName.vue'

export default {
  name: 'comment',
  components: {
    CheckSquareIcon,
    ChevronDownIcon,
    CommentMenu,
    PeopleAvatar,
    PeopleName,
    SquareIcon
  },

  data () {
    return {
      checklist: []
    }
  },

  props: {
    comment: {
      type: Object,
      default: () => {}
    },
    highlighted: {
      type: Boolean,
      default: false
    },
    editable: {
      type: Boolean,
      default: false
    },
    light: {
      type: Boolean,
      default: false
    },
    isLast: {
      type: Boolean,
      default: false
    }
  },

  mounted () {
    if (this.comment.checklist) this.checklist = [...this.comment.checklist]
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'user',
      'personMap',
      'taskMap',
      'taskTypeMap',
      'taskStatusMap'
    ]),

    previewRoute () {
      let route = {
        name: 'task',
        params: {
          task_id: this.comment.object_id,
          production_id: this.currentProduction.id
        }
      }
      if (this.comment.previews.length > 0) {
        route = {
          name: 'task-preview',
          params: {
            task_id: this.comment.object_id,
            preview_id: this.comment.previews[0].id,
            production_id: this.currentProduction.id
          }
        }
      }
      if (this.$route.params.episode_id) {
        route.name = `episode-${route.name}`
        route.params.episode_id = this.$route.params.episode_id
      }
      const task = this.taskMap[this.comment.object_id]
      const taskType = this.taskTypeMap[task.task_type_id]
      route.params.type = taskType.for_shots ? 'shots' : 'assets'
      return route
    },

    deleteCommentPath () {
      return this.getPath('task-delete-comment')
    },

    editCommentPath () {
      return this.getPath('task-edit-comment')
    },

    addPreviewPath () {
      return this.getPath('task-add-preview')
    },

    taskStatus () {
      const status = this.taskStatusMap[this.comment.task_status.id]
      return status || this.comment.task_status
    },

    isAddChecklistAllowed () {
      return this.taskStatus.is_retake &&
        this.checklist.length === 0 &&
        this.user.id === this.comment.person_id
    },

    isChangeChecklistAllowed () {
      return this.taskStatus.is_retake &&
        this.user.id === this.comment.person_id
    }
  },

  methods: {
    formatDate (date) {
      return formatDate(date)
    },

    getPath (name) {
      let route = {
        name: name,
        params: {
          task_id: this.comment.object_id,
          comment_id: this.comment.id
        }
      }
      if (this.$route.params.episode_id) {
        route.name = `episode-${route.name}`
        route.params.episode_id = this.$route.params.episode_id
      }
      return route
    },

    toggleCommentMenu () {
      this.$refs.menu.toggle()
    },

    addChecklistEntry (index, event) {
      if (event) {
        this.checklist[index].text = this.checklist[index].text.trim()
      }
      if (index === -1 || index === this.checklist.length - 1) {
        this.checklist.push({
          text: '',
          checked: false
        })
      }

      this.$nextTick(() => {
        this.focusNext(index)
      })
    },

    removeChecklistEntry (index) {
      const entry = this.checklist[index]
      if (entry.text.length === 0) {
        this.checklist = remove(this.checklist, entry)
        this.focusPrevious(index)
      }
    },

    toggleEntryChecked (entry) {
      entry.checked = !entry.checked
      this.emitChangeEvent()
    },

    focusPrevious (index) {
      if (this.checklist.length > 0) {
        if (index === 0) index = this.checklist.length
        index--
        const entryRef = `checklist-entry-${index}`
        this.$refs[entryRef][0].$el.focus()
      }
    },

    focusNext (index) {
      if (this.checklist.length > 0) {
        if (index === this.checklist.length - 1) index = -1
        index++
        const entryRef = `checklist-entry-${index}`
        this.$refs[entryRef][0].$el.focus()
      }
    },

    emitChangeEvent (event) {
      const now = (new Date().getTime())
      this.lastCall = this.lastCall || 0
      if (now - this.lastCall > 1000) {
        this.lastCall = now
        this.$emit(
          'checklist-updated',
          this.comment,
          this.checklist.filter(item => item.text && item.text.length > 0)
        )
      }
    },

    renderComment
  },

  watch: {
    checklist () {
      this.emitChangeEvent()
    }
  }
}
</script>

<style lang="scss" scoped>
.dark .comment-text {
  color: $white-grey;
}

.comment {
  background: white;
  border-left: 6px solid $light-grey;
  border-radius: 0 5px 5px 0;
  padding: 0;
  word-wrap: anywhere;
  hyphens: auto;
}

.media {
  padding: 0.6em;
}

.comment.highlighted {
  background: #F1EEFF;
}

.content .comment-person {
  margin-bottom: 0.3em;
}

.comment-date {
  color: $grey;
  margin-left: 0.5em;
  flex: 1;
}

a.revision {
  color: $grey;
  font-size: 0.8em;
  font-style: italic;
  margin: 0 1em 0 0;
}

a.revision:hover {
  text-decoration: underline;
}

.comment-text {
  margin-top: 1em;
}

.comment-text.empty {
  font-style: italic;
  color: #AAA;
}

.menu-icon {
  width: 20px;
  cursor: pointer;
  color: $light-grey;
}

.menu-wrapper {
  position: relative;
}

.pinned {
  transform: scale(1.03)
}

.pinned-text {
  font-size: 0.8em;
  margin: 0;
  text-align: right;
  color: $light-grey;
}

.add-checklist {
  background: $white-grey-light;
  color: $grey;
  text-transform: uppercase;
  cursor: pointer;
  font-size: 0.8em;
  padding: 0.5em;
}

.dark {
  .add-checklist {
    background: $dark-grey-lighter;
  }

  .checklist-entry {

    .checklist-text {
      color: $light-grey-light;
      background: transparent;

      &:active,
      &:focus,
      &:hover {
        background: $dark-grey;
        border: 1px solid $dark-grey-strong;
      }

      &:disabled {
        background: transparent;
        color: white;

        &:hover {
          border: 1px solid transparent;
        }
      }
    }
  }
}

.checklist-entry {
  color: $grey;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 0.3em;

  .checklist-text {
    font-size: 0.9em;
    padding: 0.2em;
    padding-top: 0em;
    margin-right: 0.5em;
    margin-top: 4px;
    width: 100%;
    border: 1px solid transparent;

    &:focus,
    &:active,
    &:hover {
      border: 1px solid $light-grey;
    }

    &:disabled {
      background-color: white;
      color: #333;

      &:hover {
        border: 1px solid transparent;
      }
    }
  }

  &.checked .checklist-text {
    text-decoration: line-through;
  }

  span {
    cursor: pointer;
    padding: 0.2em 0 0 0;
    margin-right: 0.2em;
    margin-left: 0;

    .icon {
      width: 20px;
    }
  }
}

@media screen and (max-width: 768px) {
  .flexrow {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
