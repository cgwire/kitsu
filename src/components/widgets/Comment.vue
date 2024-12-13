<template>
  <div>
    <article
      class="comment"
      :class="{
        pinned: comment.pinned
      }"
      :style="{
        'box-shadow': boxShadowStyle
      }"
      v-if="!isEmpty"
    >
      <div class="content-wrapper full">
        <div class="flexrow">
          <validation-tag
            class="flexrow-item"
            :task="{ task_status_id: comment.task_status.id }"
            :is-static="true"
            :thin="!isChange"
          />
          <people-avatar
            class="flexrow-item"
            :size="25"
            :font-size="12"
            :person="comment.person"
            v-if="!isCurrentUserClient || isAuthorClient"
          />
          <strong class="flexrow-item">
            <people-name
              :person="comment.person"
              v-if="!isCurrentUserClient || isAuthorClient"
            />
          </strong>
          <div class="filler"></div>
          <span class="flexrow-item date" :title="fullDate">
            {{ shortDate }}
          </span>
          <div
            class="flexrow-item menu-wrapper"
            v-if="isPinnable || isEditable"
          >
            <chevron-down-icon class="menu-icon" @click="toggleCommentMenu" />
            <comment-menu
              :is-pinnable="isPinnable"
              :is-pinned="comment.pinned"
              :is-editable="isEditable"
              @pin-clicked="
                () => {
                  $emit('pin-comment', comment)
                  toggleCommentMenu()
                }
              "
              @edit-clicked="
                () => {
                  $emit('edit-comment', comment)
                  toggleCommentMenu()
                }
              "
              @delete-clicked="
                () => {
                  $emit('delete-comment', comment)
                  toggleCommentMenu()
                }
              "
              v-if="menuVisible"
            />
          </div>
        </div>
        <div class="flexrow-item comment-content">
          <div class="content">
            <p
              class="client-comment"
              v-if="isAuthorClient && !isCurrentUserClient"
            >
              {{ $t('comments.comment_from_client') }}
              <copy-icon
                class="copy-icon"
                :size="12"
                @click="$emit('duplicate-comment', comment)"
              />
            </p>
            <p
              v-html="
                renderComment(
                  comment.text,
                  comment.mentions,
                  comment.department_mentions || [],
                  personMap,
                  departmentMap,
                  uniqueClassName
                )
              "
              class="comment-text"
              v-if="comment.text"
            ></p>
            <checklist
              class="checklist"
              :checklist="checklist"
              :disabled="true"
              :is-editable="isCheckable"
              @remove-task="removeTask"
              @emit-change="onChecklistChanged"
              @time-code-clicked="onChecklistTimecodeClicked"
              v-if="checklist.length > 0"
            />
            <p v-if="comment.attachment_files.length > 0">
              <a
                :href="getDownloadAttachmentPath(attachment)"
                :key="attachment.id"
                :title="attachment.name"
                target="_blank"
                v-for="attachment in pictureAttachments"
              >
                <img
                  class="attachment"
                  :src="getDownloadAttachmentPath(attachment)"
                />
              </a>
              <a
                :href="getDownloadAttachmentPath(attachment)"
                :key="attachment.id"
                :title="attachment.name"
                class="flexrow"
                target="_blank"
                v-for="attachment in fileAttachments"
              >
                <paperclip-icon class="flexrow-item attachment-icon icon-1x" />
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
                  v-for="replyComment in comment.replies || []"
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
                        :person="personMap.get(replyComment.person_id)"
                      />
                    </strong>
                    <span
                      class="flexrow-item reply-date"
                      :title="replyFullDate(replyComment.date)"
                    >
                      {{ replyShortDate(replyComment.date) }}
                    </span>
                    <span class="filler"> </span>
                    <span
                      class="flexrow-item reply-delete"
                      :title="$t('main.delete')"
                      @click="onDeleteReplyClicked(replyComment)"
                      v-if="
                        isCurrentUserAdmin || replyComment.person_id === user.id
                      "
                    >
                      x
                    </span>
                  </div>
                  <p
                    v-html="
                      renderComment(
                        replyComment.text,
                        replyComment.mentions || [],
                        replyComment.department_mentions || [],
                        personMap,
                        departmentMap,
                        uniqueClassName
                      )
                    "
                    class="comment-text"
                  ></p>
                </div>
              </div>
              <at-ta
                :members="atOptions"
                name-key="full_name"
                :limit="2"
                @update:value="onAtTextChanged"
              >
                <template #item="{ item }">
                  <template v-if="item.isTime"> ⏱️ frame </template>
                  <template v-else-if="item.isDepartment">
                    <span
                      class="mr05"
                      :style="{
                        background: item.color,
                        width: '10px',
                        height: '10px',
                        'border-radius': '50%'
                      }"
                    >
                      &nbsp;
                    </span>
                    {{ item.full_name }}
                  </template>
                  <template v-else>
                    <div class="flexrow">
                      <people-avatar
                        class="flexrow-item"
                        :person="item"
                        :size="20"
                        :font-size="11"
                        :is-lazy="false"
                        :is-link="false"
                      />
                      <span class="flexrow-item">
                        {{ item.full_name }}
                      </span>
                    </div>
                  </template>
                </template>
                <textarea
                  ref="reply"
                  class="reply"
                  @keyup.ctrl.enter="onReplyClicked"
                  v-model="replyText"
                  v-show="showReply"
                />
              </at-ta>
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
              v-if="comment.text.length > 0 || comment.previews.length > 0"
            >
              <button
                class="like-button flexrow-item"
                :class="{
                  'like-button--empty': comment.like === undefined
                }"
                type="button"
                @click="acknowledgeComment(comment)"
              >
                <thumbs-up-icon class="icon-1x" />
                <span>{{ comment.acknowledgements.length }}</span>
              </button>
              <span class="filler"></span>
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
        v-if="comment.previews.length > 0 && !isConcept"
      >
        <router-link
          class="flexrow-item round-name revision"
          :to="previewRoute"
        >
          {{
            comment.pinned
              ? $t('comments.pinned_revision')
              : $t('comments.revision')
          }}
          {{ comment.previews[0].revision }}
        </router-link>
        <a
          class="preview-link button flexrow-item"
          :href="comment.links[0]"
          :title="$t('playlists.actions.open_link')"
          target="_blank"
          v-if="!isCurrentUserArtist && comment.links?.[0]?.length"
        >
          <link-icon class="icon is-small" />
        </a>
        <span
          class="flexrow-item preview-status"
          :title="comment.previews[0].validation_status"
          :style="getPreviewValidationStyle(comment.previews[0])"
          @click="changePreviewValidationStatus(comment.previews[0])"
        >
          &nbsp;
        </span>
      </div>
    </article>
    <div class="empty-comment" v-else>
      <div class="flexrow content-wrapper">
        <validation-tag
          class="flexrow-item"
          :task="{ task_status_id: comment.task_status.id }"
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
        <span class="filler"> </span>
        <span class="flexrow-item date" :title="fullDate">
          {{ shortDate }}
        </span>
        <div class="flexrow-item menu-wrapper" v-if="isPinnable || isEditable">
          <chevron-down-icon class="menu-icon" @click="toggleCommentMenu" />
          <comment-menu
            :is-pinnable="isPinnable"
            :is-editable="isEditable"
            :is-empty="true"
            @pin-clicked="
              () => {
                $emit('pin-comment', comment)
                toggleCommentMenu()
              }
            "
            @edit-clicked="
              () => {
                $emit('edit-comment', comment)
                toggleCommentMenu()
              }
            "
            @delete-clicked="
              () => {
                $emit('delete-comment', comment)
                toggleCommentMenu()
              }
            "
            v-if="menuVisible"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AtTa from 'vue-at/dist/vue-at-textarea'
import moment from 'moment'
import { mapActions, mapGetters } from 'vuex'
import {
  ChevronDownIcon,
  CopyIcon,
  LinkIcon,
  PaperclipIcon,
  ThumbsUpIcon
} from 'lucide-vue-next'

import files from '@/lib/files'
import { remove } from '@/lib/models'
import { getDownloadAttachmentPath, pluralizeEntityType } from '@/lib/path'
import { renderComment, replaceTimeWithTimecode } from '@/lib/render'
import { sortByName } from '@/lib/sorting'
import { formatDate, parseDate } from '@/lib/time'

import { domMixin } from '@/components/mixins/dom'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import CommentMenu from '@/components/widgets/CommentMenu.vue'
import Checklist from '@/components/widgets/Checklist.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'
import ValidationTag from '@/components/widgets/ValidationTag.vue'

export default {
  name: 'comment',

  mixins: [domMixin],

  components: {
    AtTa,
    ButtonSimple,
    Checklist,
    ChevronDownIcon,
    CopyIcon,
    CommentMenu,
    LinkIcon,
    PaperclipIcon,
    PeopleAvatar,
    PeopleName,
    ThumbsUpIcon,
    ValidationTag
  },

  data() {
    return {
      atOptions: [],
      checklist: [],
      isReplyLoading: false,
      menuVisible: false,
      replyText: '',
      showReply: false,
      uniqueClassName: (Math.random() + 1).toString(36).substring(2)
    }
  },

  emits: [
    'ack-comment',
    'checklist-updated',
    'delete-comment',
    'duplicate-comment',
    'edit-comment',
    'pin-comment',
    'time-code-clicked'
  ],

  props: {
    comment: {
      type: Object,
      default: () => {}
    },
    frame: {
      type: Number,
      default: 0
    },
    fps: {
      type: Number,
      default: 25
    },
    isChange: {
      type: Boolean,
      default: false
    },
    isCheckable: {
      type: Boolean,
      default: false
    },
    isEditable: {
      type: Boolean,
      default: false
    },
    isPinnable: {
      type: Boolean,
      default: false
    },
    team: {
      type: Array,
      default: () => []
    },
    task: {
      type: Object,
      default: null
    },
    revision: {
      type: Number,
      default: 1
    }
  },

  mounted() {
    if (this.comment.checklist) {
      this.$options.silent = true
      this.checklist = [...this.comment.checklist]
      this.$nextTick().then(() => {
        this.$options.silent = false
      })
    }
    Array.from(document.getElementsByClassName(this.uniqueClassName)).forEach(
      element => {
        element.addEventListener('click', this.timeCodeClicked)
      }
    )
  },

  beforeUnmount() {
    Array.from(document.getElementsByClassName(this.uniqueClassName)).forEach(
      element => {
        element.removeEventListener('click', this.timeCodeClicked)
      }
    )
  },

  computed: {
    ...mapGetters([
      'departmentMap',
      'isCurrentUserAdmin',
      'isCurrentUserArtist',
      'isCurrentUserClient',
      'isCurrentUserManager',
      'personMap',
      'productionDepartmentIds',
      'taskTypeMap',
      'user'
    ]),

    isConcept() {
      return this.$route.path.includes('concept')
    },

    isEmpty() {
      return (
        this.comment.text.length === 0 &&
        (!this.comment.checklist || this.comment.checklist.length === 0) &&
        this.comment.attachment_files.length === 0 &&
        this.comment.previews.length === 0
      )
    },

    previewRoute() {
      let route = {
        name: 'task',
        params: {
          task_id: this.comment.object_id,
          production_id: this.task.project_id
        }
      }
      if (this.comment.previews.length > 0) {
        route = {
          name: 'task-preview',
          params: {
            task_id: this.comment.object_id,
            preview_id: this.comment.previews[0].id,
            production_id: this.task.project_id
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
      route.params.type = pluralizeEntityType(taskType.for_entity)
      return route
    },

    isLikedBy() {
      const personList = this.comment.acknowledgements.map(personId =>
        this.personMap.get(personId)
      )
      return sortByName(personList)
        .map(p => p.name)
        .join(', ')
    },

    pictureAttachments() {
      return this.comment.attachment_files
        .filter(attachment =>
          files.IMG_EXTENSIONS.includes(attachment.extension)
        )
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, {
            numeric: true
          })
        )
    },

    fileAttachments() {
      return this.comment.attachment_files.filter(
        attachment => !files.IMG_EXTENSIONS.includes(attachment.extension)
      )
    },

    commentDate() {
      return parseDate(this.comment.created_at)
    },

    fullDate() {
      return this.commentDate
        .tz(this.user.timezone)
        .format('YYYY-MM-DD HH:mm:ss')
    },

    shortDate() {
      return this.renderDate(this.commentDate)
    },

    boxShadowStyle() {
      const status = this.comment.task_status
      return `0 0 3px 2px ${status.color}1F`
    },

    isAuthorClient() {
      return this.personMap.get(this.comment.person_id)?.role === 'client'
    }
  },

  methods: {
    ...mapActions([
      'deleteReply',
      'replyToComment',
      'updatePreviewFileValidationStatus'
    ]),

    formatDate(date) {
      return formatDate(date)
    },

    replyFullDate(date) {
      return moment(parseDate(date))
        .tz(this.user.timezone)
        .format('YYYY-MM-DD HH:mm:ss')
    },

    replyShortDate(date) {
      return this.renderDate(parseDate(date))
    },

    renderDate(date) {
      date = moment(date)
      if (moment().isSame(date, 'd')) {
        return date.tz(this.user.timezone).format('HH:mm')
      } else {
        return date.tz(this.user.timezone).format('MM/DD')
      }
    },

    getPath(name) {
      const route = {
        name,
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

    getDownloadAttachmentPath,

    toggleCommentMenu() {
      this.menuVisible = !this.menuVisible
    },

    addChecklistEntry() {
      this.$options.silent = true
      this.checklist.push({
        text: '',
        checked: false
      })
      this.$nextTick().then(() => {
        this.$options.silent = false
      })
    },

    removeTask(entry) {
      this.checklist = remove(this.checklist, entry)
    },

    onChecklistChanged() {
      const now = new Date().getTime()
      this.lastCall = this.lastCall || 0
      if (now - this.lastCall > 1000) {
        this.lastCall = now
        const comment = {
          id: this.comment.id,
          checklist: this.checklist.filter(item => item.text?.length)
        }
        this.$emit('checklist-updated', comment)
      }
    },

    acknowledgeComment(comment) {
      this.$emit('ack-comment', comment)
    },

    timeCodeClicked(event) {
      const data = { ...event.target.dataset }
      data.frame = data.frame - 1
      this.pauseEvent(event)
      this.$emit('time-code-clicked', data)
    },

    onChecklistTimecodeClicked(data) {
      this.$emit('time-code-clicked', {
        versionRevision: data.revision,
        frame: data.frame - 1
      })
    },

    setFrame(data) {
      this.$emit('time-code-clicked', {
        versionRevision: data.revision,
        frame: data.frame - 1
      })
    },

    getPreviewValidationStyle(previewFile) {
      let color = '#AAA'
      if (previewFile.validation_status === 'validated') {
        color = '#67BE48' // green
      } else if (previewFile.validation_status === 'rejected') {
        color = '#FF3860' // red
      }
      return { background: color }
    },

    changePreviewValidationStatus(previewFile) {
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

    showReplyWidget() {
      this.showReply = true
      this.$nextTick(() => {
        this.$refs.reply.focus()
      })
    },

    onReplyClicked() {
      this.isReplyLoading = true
      this.replyToComment({ comment: this.comment, text: this.replyText })
        .then(() => {
          this.isReplyLoading = false
          this.replyText = ''
          this.showReply = false
        })
        .catch(console.error)
    },

    onDeleteReplyClicked(reply) {
      this.deleteReply({ comment: this.comment, reply })
        .then(() => {
          this.isReplyLoading = false
        })
        .catch(console.error)
    },

    onAtTextChanged(input) {
      if (input.includes('@frame')) {
        this.replyText = replaceTimeWithTimecode(
          input,
          this.revision,
          this.frame + 1,
          this.fps
        )
      }
    }
  },

  watch: {
    'comment.checklist'() {
      this.$options.silent = true
      this.checklist = [...this.comment.checklist]
      this.$nextTick().then(() => {
        this.$options.silent = false
      })
    },

    checklist() {
      if (!this.$options.silent) {
        this.onChecklistChanged()
      }
    },

    team: {
      deep: true,
      immediate: true,
      handler() {
        if (this.isCurrentUserClient) {
          this.atOptions = this.team.filter(person =>
            ['admin', 'manager', 'supervisor', 'client'].includes(person.role)
          )
        } else {
          this.atOptions = [...this.team]
        }
        this.atOptions = this.atOptions.concat(
          this.productionDepartmentIds.map(departmentId => {
            const department = this.departmentMap.get(departmentId)
            return {
              isDepartment: true,
              full_name: department.name,
              color: department.color,
              id: departmentId
            }
          })
        )
        this.atOptions.push({
          isTime: true,
          full_name: 'frame'
        })
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
    background: #c4677b;
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
  border-radius: 10px;
  padding: 0;
  margin: 1em 0;
  word-wrap: anywhere;
  hyphens: auto;
}

.media {
  padding: 0.6em;
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
    margin-top: 0.5rem;
    margin-bottom: 0;
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
  border: 2px solid var(--border-alt);
  transform: scale(1.02);
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
  border-radius: 0.5rem;
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  margin: 0;
  padding: 0.3rem 0;
  width: 100%;
  z-index: 10;

  span {
    margin-left: 0.3em;
  }
}

.like-button--empty {
  opacity: 0.5;

  &:hover,
  &:focus {
    opacity: 1;
  }
}

.comment-content {
  padding: 0;
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
  white-space: nowrap;
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
  margin-left: 0.5em;
}

.congrats-picture {
  max-width: 300px;
  max-height: 300px;
}

.reply-button {
  border-radius: 5px;
  color: var(--text);
  cursor: pointer;
  font-size: 0.8em;
  padding: 0;
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

.reply-delete {
  color: $grey;
  cursor: pointer;
  margin-top: -2px;
  margin-right: 0;
  opacity: 0;
}

.preview-link {
  border: 0;
  margin: 0;
  margin-right: 0.5em;
  color: var(--text-alt);
  padding: 0 10px;

  &:hover {
    color: var(--text);
  }
}

.preview-status {
  border-radius: 50%;
  border: 2px solid $grey;
  cursor: pointer;
  height: 20px;
  transition: background 0.3s ease;
  width: 20px;
  min-width: 20px;
}

@media screen and (max-width: 768px) {
  .flexrow {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
