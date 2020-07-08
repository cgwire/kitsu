<template>
<div>
  <article
    :class="{
      comment: true,
      pinned: comment.pinned,
      highlighted: highlighted
    }"
    :style="{
      'box-shadow': boxShadowStyle,
    }"
    v-if="!isEmpty"
  >
    <div class="content-wrapper full">
      <div class="flexrow">
        <span
          class="round-task-status-name"
          :style="{
            'background-color': comment.task_status.color,
            color: 'white'
          }"
          v-if="comment.task_status.short_name !== 'todo'"
        >
          {{ comment.task_status.short_name }}
        </span>
        <people-avatar
          class="flexrow-item"
          :size="25"
          :font-size="12"
          :person="comment.person"
        />
        <strong class="flexrow-item">
          <people-name
            class=""
            :person="comment.person"
          />
        </strong>
        <div class="filler"></div>
        <span
          class="flexrow-item date"
          :title="fullDate"
        >
          {{ shortDate }}
        </span>
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
      <div class="flexrow-item comment-content">
        <div class="content">
          <p
            class="client-comment"
            v-if="personMap[comment.person_id].role === 'client'"
          >
            <span>
              {{ $t('comments.comment_from_client') }}
              <copy-icon
                class="copy-icon"
                size="1.1x"
                @click="$emit('duplicate-comment', comment)"
              />
            </span>
          </p>
          <p
            v-html="renderComment(comment.text, comment.mentions, personMap)"
            class="comment-text"
            v-if="comment.text"
          >
          </p>
          <checklist
            class="checklist"
            :checklist="checklist"
            @remove-task="removeTask"
            @keyup.native="emitChangeEvent($event)"
            @emit-change="emitChangeEvent"
            :disabled="!isChangeChecklistAllowed"
            v-if="checklist.length > 0"
          />
          <p v-if="taskStatus.is_done && isLast">
            <img src="../../assets/illustrations/validated.png" />
          </p>
          <p v-if="comment.attachment_files.length > 0">
            <a
              :href="getAttachmentPath(attachment)"
              :key="attachment.id"
              :title="attachment.name"
              target="_blank"
              v-for="attachment in pictureAttachments"
            >
              <img
                class="attachment"
                :src="getAttachmentPath(attachment)"
              />
            </a>
            <a
              :href="getAttachmentPath(attachment)"
              :key="attachment.id"
              :title="attachment.name"
              class="flexrow"
              target="_blank"
              v-for="attachment in fileAttachments"
            >
              <paperclip-icon size="1x" class="flexrow-item attachment-icon"/>
              <span class="flexrow-item">
              {{ attachment.name }}
              </span>
            </a>
          </p>
          <div
            class="comment-like"
            :title="isLikedBy"
            @click="acknowledgeComment(comment)"
            v-if="comment.text.length > 0"
          >
            <button
              :class="{
                'like-button': true,
                'like-button--empty': comment.like === undefined ? true : false
              }"
              type="button"
              disabled="comment.person_id !== user.id"
            >
              <thumbs-up-icon size="1x"/>
              <span>{{ comment.acknowledgements.length }}</span>
            </button>
          </div>
          <p class="pinned-text" v-if="comment.pinned">
            {{ $t('comments.pinned') }}
          </p>
        </div>
      </div>
    </div>
    <div
      class="flexrow content-wrapper preview-info"
      v-if="comment.previews.length > 0"
    >
      <router-link
        class="flexrow-item round-task-status-name revision"
        :to="previewRoute"
      >
        Revision {{ comment.previews[0].revision }}
      </router-link>
    </div>

    <div
      class="has-text-centered add-checklist"
      @click="addChecklistEntry()"
      v-if="isAddChecklistAllowed"
    >
      {{ $t('comments.add_checklist') }}
    </div>
  </article>
  <div class="empty-comment" v-else>
    <div class="flexrow content-wrapper">
      <span
        class="round-task-status-name flexrow-item"
        :style="{
          'border': '1px solid' + comment.task_status.color,
          color: comment.task_status.color
        }"
        v-if="comment.task_status.short_name !== 'todo'"
      >
        {{ comment.task_status.short_name }}
      </span>
      <people-avatar
        class="flexrow-item"
        :person="comment.person"
        :size="25"
        :font-size="12"
      />
      <people-name class="flexrow-item" :person="comment.person" />
      <span class="filler">
      </span>
      <span class="flexrow-item date" :title="fullDate">
        {{ shortDate }}
      </span>
      <div class="flexrow-item menu-wrapper">
        <chevron-down-icon
          class="menu-icon"
          @click="toggleCommentMenu"
        />
        <comment-menu
          :is-editable="editable"
          :is-empty="true"
          @pin-clicked="$emit('pin-comment', comment)"
          @edit-clicked="$emit('edit-comment', comment); toggleCommentMenu()"
          @delete-clicked="$emit('delete-comment', comment); toggleCommentMenu()"
          ref="menu"
        />
      </div>
    </div>
  </div>
</div>
</template>

<script>

import moment from 'moment'
import { mapGetters } from 'vuex'
import { remove } from '../../lib/models'
import { renderComment } from '../../lib/render'
import { sortByName } from '../../lib/sorting'
import { formatDate, parseDate } from '../../lib/time'

import {
  ChevronDownIcon,
  CopyIcon,
  PaperclipIcon,
  ThumbsUpIcon
} from 'vue-feather-icons'
import CommentMenu from './CommentMenu.vue'
import PeopleAvatar from './PeopleAvatar.vue'
import PeopleName from './PeopleName.vue'
import Checklist from './Checklist'

export default {
  name: 'comment',
  components: {
    Checklist,
    ChevronDownIcon,
    CopyIcon,
    CommentMenu,
    PaperclipIcon,
    PeopleAvatar,
    PeopleName,
    ThumbsUpIcon
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
    isFirst: {
      type: Boolean,
      default: false
    },
    isLast: {
      type: Boolean,
      default: false
    }
  },

  mounted () {
    if (this.comment.checklist) {
      this.$options.silent = true
      this.checklist = [...this.comment.checklist]
      this.$nextTick()
        .then(() => {
          this.$options.silent = false
        })
    }
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

    isEmpty () {
      return (
        this.comment.text.length === 0 && (
          !this.comment.checklist ||
          this.comment.checklist.length === 0
        ) &&
        this.comment.previews.length === 0 && !(
          this.isFirst && this.taskStatus.is_done
        )
      )
    },

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
    },

    isLikedBy () {
      const personList = this.comment.acknowledgements.map(
        personId => this.personMap[personId]
      )
      return sortByName(personList)
        .map(p => p.name)
        .join(', ')
    },

    pictureAttachments () {
      return this.comment.attachment_files.filter(attachment => {
        return ['png', 'jpg', 'gif'].includes(attachment.extension)
      })
    },

    fileAttachments () {
      return this.comment.attachment_files.filter(attachment => {
        return !['png', 'jpg', 'gif'].includes(attachment.extension)
      })
    },

    commentDate () {
      return parseDate(this.comment.created_at)
    },

    fullDate () {
      return this.commentDate.format('YYYY-MM-DD HH:mm:ss')
    },

    shortDate () {
      if (moment().diff(this.commentDate, 'days') > 1) {
        return this.commentDate.format('MM/DD')
      } else {
        return this.commentDate.tz(this.user.timezone).format('HH:mm')
      }
    },

    boxShadowStyle () {
      return `0 0 3px 2px ${this.comment.task_status.color}1F`
    }
  },

  methods: {
    formatDate (date) {
      return formatDate(date)
    },

    getPath (name) {
      const route = {
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

    getAttachmentPath (attachment) {
      return `/api/data/attachment-files/${attachment.id}/file`
    },

    toggleCommentMenu () {
      this.$refs.menu.toggle()
    },

    addChecklistEntry () {
      this.checklist.push({
        text: '',
        checked: false
      })
    },

    removeTask (entry) {
      this.checklist = remove(this.checklist, entry)
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

    acknowledgeComment (comment) {
      this.$emit('ack-comment', comment)
    },

    renderComment
  },

  watch: {
    checklist () {
      if (!this.$options.silent) {
        this.emitChangeEvent()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .comment-text {
    color: $white-grey;
  }

  .content .client-comment {
    background: #C4677B;
    color: white;
  }

  .add-checklist {
    background: $dark-grey-lighter;
  }

  .comment {
    background: $dark-grey-lightmore;
  }

  .like-button {
    color: white;
  }
}

article.comment {
  background: white;
  border-radius: 5px;
  padding: 0;
  margin: 1em 0;
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
  min-height: 40px;
  margin-bottom: 0;
}

.comment-date {
  color: $grey;
  margin-left: 0.5em;
  flex: 1;
}

.content {
  .comment-text {
    margin-top: .5rem;
    margin-bottom: 0rem;
    padding: 0.2em 0.1em;
    word-break: break-word;
    hyphens: auto;
    hyphenate-limit-chars: 8 6 2;
  }
}

.checklist {
  margin-top: 0.5em;
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
  transform: scale(1.02)
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

.content .client-comment {
  border-radius: 4px;
  background: $red + 190%;
  color: desaturate($red - 30%, 20%);
  font-size: 0.8em;
  margin-top: 0.4em;
  margin-bottom: 0;
  padding: 0.5em 0.2em;
  text-align: center;
  text-transform: uppercase;
}

.task-status-name {
  margin-top: auto;
  font-size: 0.8em;
  text-transform: uppercase;
}

.round-task-status-name {
  border-radius: 1em;
  font-size: 0.8em;
  margin: 0;
  margin-right: 0.5em;
  min-width: 55px;
  padding: 0.4em;
  text-transform: uppercase;
  text-align: center;

  &.revision {
    width: 100%;
    font-weight: bold;
    border: 1px solid $purple-strong;
    color: $purple-strong;
  }
}

.flexrow {
  align-items: center;
}

.comment-left {
  display: flex;
  flex-direction: column;
  padding: 0.5em 0 0.5em 0.5em;
}

.like-button {
  align-items: center;
  background-color: transparent;
  border: 0;
  border-radius: .5rem;
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  margin: 0;
  padding: .3rem 0;
  width: 100%;

  &:hover,
  &:focus {
    background-color: $dark-grey-lightest;
  }

  &[disabled] {
    pointer-events: none;
  }

  span {
    margin-left: 0.3em;
  }
}

.like-button--empty {
  opacity: .5;

  &:hover,
  &:focus {
    opacity: 1;
  }
}

.comment-content {
  padding: 0em;
}

.comment-like {
  cursor: pointer;
}

.infos {
  display: flex;
  align-items: center;
}

.content-wrapper {
  padding: 0.5em;

  &.full {
    border-left: 1px solid transparent;
  }
}

.date {
  font-size: 0.8em;
  margin-right: 0.5em;
}

.preview-info {
  margin-top: 0;
  padding-top: 0;

  .date {
    margin-right: 26px;
  }
}

p {
  margin: 0;
}

.attachment {
  display: block;
  text-align: center;
  margin: 0.4em auto;
}

.attachment-icon {
  margin: 0.6em;
}

.copy-icon {
  cursor: pointer;
  margin-left: .5em;
}

@media screen and (max-width: 768px) {
  .flexrow {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
