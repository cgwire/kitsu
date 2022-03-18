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
        <validation-tag
          class="flexrow-item"
          :task="{ task_status_id: comment.task_status.id}"
          :is-static="true"
          :thin="!isChange"
        />
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
            v-if="personMap.get(comment.person_id).role === 'client'"
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
            v-html="renderComment(comment.text, comment.mentions, personMap, uniqueClassName)"
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
            :disabled="true"
            v-if="checklist.length > 0"
          />
          <p class="has-text-centered" v-if="taskStatus.is_done && isLast">
            <img
              class="congrats-picture"
              src="../../assets/illustrations/validated.png"
            />
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
          <div class="replies">
            <div>
              <div
                :key="replyComment.id"
                class="reply-comment"
                v-for="replyComment in (comment.replies || [])"
              >
                <div class="flexrow">
                  <people-avatar
                    class="flexrow-item"
                    :size="18"
                    :font-size="10"
                    :person="personMap.get(replyComment.person_id)"
                  />
                  <strong class="flexrow-item">
                    <people-name
                      class=""
                      :person="personMap.get(replyComment.person_id)"
                    />
                  </strong>
                  <span
                    class="flexrow-item reply-date"
                    :title="replyDate(replyComment.date)"
                  >
                    {{ renderDate(replyComment.date) }}
                  </span>
                  <span class="filler">
                  </span>
                  <span
                    class="flexrow-item reply-delete"
                    :title="$t('main.delete')"
                    @click="onDeleteReplyClicked(replyComment)"
                    v-if="isCurrentUserAdmin || replyComment.person_id === user.id"
                  >
                    x
                  </span>
                </div>
                <p
                  v-html="renderComment(replyComment.text, [], personMap, '')"
                  class="comment-text"
                >
                </p>
              </div>
            </div>
            <textarea
              ref="reply"
              class="reply"
              @keyup.ctrl.enter="onReplyClicked"
              v-model="replyText"
              v-show="showReply"
            />
            <div class="has-text-right">
              <button-simple
                class="reply-button"
                :text="$t('main.reply')"
                :is-loading="isReplyLoading"
                @click="onReplyClicked"
                v-show="showReply"
              />
            </div>
          </div>

          <div
            class="flexrow"
            :title="isLikedBy"
            v-if="comment.text.length > 0"
          >
            <button
              :class="{
                'like-button': true,
                'like-button--empty': comment.like === undefined ? true : false,
                'flexrow-item': true
              }"
              @click="acknowledgeComment(comment)"
              type="button"
            >
              <thumbs-up-icon size="1x" />
              <span>{{ comment.acknowledgements.length }}</span>
            </button>
            <span class="filler">
            </span>
            <span
              class="flexrow-item reply-button"
              @click="showReplyWidget"
              v-if="!showReply"
            >
              {{ $t('main.reply') }}
            </span>
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
        class="flexrow-item round-name revision"
        :to="previewRoute"
      >
        Revision {{ comment.previews[0].revision }}
      </router-link>
      <span
        class="flexrow-item preview-status"
        :title="comment.previews[0].validation_status"
        :style="getPreviewValidationStyle(comment.previews[0])"
        @click="changePreviewValidationStatus(comment.previews[0])"
      >
        &nbsp;
      </span>
    </div>

    <!--div
      class="has-text-centered add-checklist"
      @click="addChecklistEntry()"
      v-if="isAddChecklistAllowed"
    >
      {{ $t('comments.add_checklist') }}
    </div-->
  </article>
  <div class="empty-comment" v-else>
    <div class="flexrow content-wrapper">
      <validation-tag
        class="flexrow-item"
        :task="{ task_status_id: comment.task_status.id}"
        :is-static="true"
        :thin="!isChange"
      />
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
import { mapActions, mapGetters } from 'vuex'
import { remove } from '@/lib/models'
import { renderComment } from '@/lib/render'
import { sortByName } from '@/lib/sorting'
import { formatDate, parseDate } from '@/lib/time'
import colors from '@/lib/colors'
import files from '@/lib/files'

import {
  ChevronDownIcon,
  CopyIcon,
  PaperclipIcon,
  ThumbsUpIcon
} from 'vue-feather-icons'
import ButtonSimple from '@/components/widgets/ButtonSimple'
import CommentMenu from '@/components/widgets/CommentMenu'
import Checklist from '@/components/widgets/Checklist'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import PeopleName from '@/components/widgets/PeopleName'
import ValidationTag from '@/components/widgets/ValidationTag'

export default {
  name: 'comment',
  components: {
    ButtonSimple,
    Checklist,
    ChevronDownIcon,
    CopyIcon,
    CommentMenu,
    PaperclipIcon,
    PeopleAvatar,
    PeopleName,
    ThumbsUpIcon,
    ValidationTag
  },

  data () {
    return {
      checklist: [],
      isReplyLoading: false,
      replyText: '',
      showReply: false,
      uniqueClassName: (Math.random() + 1).toString(36).substring(2)
    }
  },

  props: {
    comment: {
      type: Object,
      default: () => {}
    },
    task: {
      type: Object,
      default: null
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
    },
    isChange: {
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
    Array.from(
      document.getElementsByClassName(this.uniqueClassName)
    ).forEach(element => {
      element.addEventListener('click', this.timeCodeClicked)
    })
  },

  destroyed () {
    Array.from(
      document.getElementsByClassName(this.uniqueClassName)
    ).forEach(element => {
      element.removeEventListener('click', this.timeCodeClicked)
    })
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'isCurrentUserAdmin',
      'isCurrentUserManager',
      'isDarkTheme',
      'user',
      'personMap',
      'taskTypeMap',
      'taskStatusMap'
    ]),

    isEmpty () {
      return (
        this.comment.text.length === 0 && (
          !this.comment.checklist ||
          this.comment.checklist.length === 0
        ) &&
        this.comment.attachment_files.length === 0 &&
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
      if (this.task.episode_id) {
        route.name = `episode-${route.name}`
        route.params.episode_id = this.task.episode_id
      } else if (this.task.entity && this.task.entity.episode_id) {
        route.name = `episode-${route.name}`
        route.params.episode_id = this.task.entity.episode_id
      }
      const taskType = this.taskTypeMap.get(this.task.task_type_id)
      route.params.type = this.$tc(taskType.for_entity.toLowerCase(), 2)
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
      const status = this.taskStatusMap.get(this.comment.task_status.id)
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
        personId => this.personMap.get(personId)
      )
      return sortByName(personList)
        .map(p => p.name)
        .join(', ')
    },

    pictureAttachments () {
      return [...this.comment.attachment_files]
        .sort((a, b) => a.name.localeCompare(b.name))
        .filter(attachment => {
          return files.IMG_EXTENSIONS.includes(
            attachment.extension
          )
        })
    },

    fileAttachments () {
      return this.comment.attachment_files.filter(attachment => {
        return !files.IMG_EXTENSIONS.includes(
          attachment.extension
        )
      })
    },

    commentDate () {
      return parseDate(this.comment.created_at)
    },

    fullDate () {
      return this.commentDate
        .tz(this.user.timezone)
        .format('YYYY-MM-DD HH:mm:ss')
    },

    shortDate () {
      return this.renderDate(this.commentDate)
    },

    boxShadowStyle () {
      return `0 0 3px 2px ${this.comment.task_status.color}1F`
    },

    statusColor () {
      const color = this.comment.task_status.color
      if (this.isDarkTheme && !this.isEmpty) {
        return colors.darkenColor(color)
      } else {
        return color
      }
    }
  },

  methods: {
    ...mapActions([
      'deleteReply',
      'replyToComment',
      'updatePreviewFileValidationStatus'
    ]),

    formatDate (date) {
      return formatDate(date)
    },

    replyDate (date) {
      return moment(date)
        .tz(this.user.timezone)
        .format('YYYY-MM-DD HH:mm:ss')
    },

    renderDate (date) {
      date = moment(date)
      if (moment().diff(date, 'days') > 1) {
        return date.tz(this.user.timezone).format('MM/DD')
      } else {
        return date.tz(this.user.timezone).format('HH:mm')
      }
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
      return `/api/data/attachment-files/${attachment.id}/` +
        `file/${attachment.name}`
    },

    toggleCommentMenu () {
      this.$refs.menu.toggle()
    },

    addChecklistEntry () {
      this.$options.silent = true
      this.checklist.push({
        text: '',
        checked: false
      })
      this.$nextTick()
        .then(() => {
          this.$options.silent = false
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

    timeCodeClicked (event) {
      this.$emit('time-code-clicked', event.target.dataset)
    },

    getPreviewValidationStyle (previewFile) {
      let color = '#AAA'
      if (previewFile.validation_status === 'validated') {
        color = '#67BE48' // green
      } else if (previewFile.validation_status === 'rejected') {
        color = '#FF3860' // red
      }
      return { background: color }
    },

    changePreviewValidationStatus (previewFile) {
      if (!this.isCurrentUserManager) return
      let status = previewFile.status
      if (previewFile.validation_status === 'validated') {
        status = 'rejected'
      } else if (previewFile.validation_status === 'rejected') {
        status = 'neutral'
      } else {
        status = 'validated'
      }
      this.updatePreviewFileValidationStatus({ previewFile, status })
    },

    renderComment,

    showReplyWidget () {
      this.showReply = true
      this.$nextTick(() => {
        this.$refs.reply.focus()
      })
    },

    onReplyClicked () {
      this.isReplyLoading = true
      this.replyToComment({ comment: this.comment, text: this.replyText })
        .then(() => {
          this.isReplyLoading = false
          this.replyText = ''
          this.showReply = false
        })
        .catch(console.error)
    },

    onDeleteReplyClicked (reply) {
      this.deleteReply({ comment: this.comment, reply })
        .then(() => {
          this.isReplyLoading = false
        })
        .catch(console.error)
    }
  },

  watch: {
    'comment.checklist' () {
      this.$options.silent = true
      this.checklist = [...this.comment.checklist]
      this.$nextTick()
        .then(() => {
          this.$options.silent = false
        })
    },

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
  background: lighten($red, 80%);
  color: desaturate(darken($red, 30%), 20%);
  font-size: 0.8em;
  margin-top: 0.4em;
  margin-bottom: 0;
  padding: 0.5em 0.2em;
  text-align: center;
  text-transform: uppercase;
}

.round-name {
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
  z-index: 10;

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

.congrats-picture {
  max-width: 300px;
}

.reply-button {
  color: var(--text);
  cursor: pointer;
  font-size: 0.8em;
  padding-right: 0.5em;
  text-align: right;
  width: 60px;
}

textarea.reply {
  border: 1px solid var(--border);
  border-radius: 5px;
  color: var(--text-strong);
  font-size: 0.9em;
  margin-top: 0.5em;
  margin-left: 0.5em;
  padding: 0.5em;
  width: calc(100% - 0.5em);
}

.replies {
  padding-bottom: 0.5em;
  margin-right: 0.2em;
}

.reply-comment {
  border-left: 3px solid var(--border);
  border-bottom: 1px dashed var(--border);
  font-size: 0.9em;
  margin-left: 0.5em;
  padding-left: 0.8em;
  padding-top: 0.8em;
  padding-bottom: 0.4em;

  &:last-child {
    border-bottom: 1px solid var(--border);
  }

  &:hover {
    .reply-delete {
      opacity: 1;
    }
  }

  .reply-date {
    padding-top: 1px;
    font-size: 0.8em;
    color: var(--text);
  }
}

.reply-button {
  border-radius: 5px;
  color: var(--text);
  padding: 0;
  text-transform: lowercase;
}

.reply-delete {
  color: $grey;
  cursor: pointer;
  margin-top: -2px;
  margin-right: 0px;
  opacity: 0;
}

.preview-status {
  border-radius: 50%;
  border: 2px solid $grey;
  cursor: pointer;
  height: 20px;
  transition: background 0.3s ease;
  width: 20px;
}

@media screen and (max-width: 768px) {
  .flexrow {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
