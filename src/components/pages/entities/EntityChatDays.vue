<template>
  <div class="messages" ref="messages">
    <div class="day-messages" :key="day.title" v-for="day in messageList">
      <div class="day-title">
        <span>
          {{ day.title }}
        </span>
      </div>
      <div
        class="message"
        :key="chatMessage.id"
        v-for="chatMessage in day.messages"
      >
        <people-avatar
          class="message-avatar flexrow-item"
          :person="personMap.get(chatMessage.data.person_id)"
          :size="30"
          :font-size="15"
        />
        <div class="message-content">
          <div class="message-header-wrapper flexrow">
            <div class="message-sender mr05">
              {{ personMap.get(chatMessage.data.person_id)?.name }}
            </div>
            <div class="message-date">
              {{ renderDate(chatMessage.data.created_at) }}
            </div>
          </div>

          <div
            class="message-text"
            :key="'submessage-' + messageText.id"
            v-for="messageText in chatMessage.texts"
          >
            <div
              v-html="
                renderComment(
                  messageText ? messageText.text : '',
                  [],
                  [],
                  personMap,
                  departmentMap
                )
              "
            ></div>
            <div class="attachments" v-if="messageText">
              <img
                class="attachment-thumbnail"
                :key="attachment.id"
                :src="getAttachmentThumbnailPath(attachment)"
                role="button"
                tabindex="0"
                :alt="attachment.name"
                @click="currentAttachment = attachment"
                @keydown.enter.prevent="currentAttachment = attachment"
                v-for="attachment in pictureAttachments(
                  messageText.attachment_files
                )"
              />
              <a
                class="attachment"
                target="_blank"
                :key="attachment.id"
                :href="getDownloadAttachmentPath(attachment)"
                v-for="attachment in fileAttachments(
                  messageText.attachment_files
                )"
              >
                {{ attachment.name }}
              </a>
            </div>
            <div
              class="delete-message-button"
              role="button"
              tabindex="0"
              @click="$emit('delete-message', chatMessage.data.id)"
              @keydown.enter.prevent="
                $emit('delete-message', chatMessage.data.id)
              "
              @keydown.space.prevent="
                $emit('delete-message', chatMessage.data.id)
              "
              v-if="chatMessage.data.person_id === user.id"
            >
              <x-icon :size="12" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <preview-modal
      :active="currentAttachment != null"
      :attachment="currentAttachment"
      @cancel="currentAttachment = null"
    />
  </div>
</template>

<script>
import { XIcon } from 'lucide-vue-next'
import moment from 'moment-timezone'
import { mapGetters } from 'vuex'

import { domMixin } from '@/components/mixins/dom'
import {
  getAttachmentThumbnailPath,
  getDownloadAttachmentPath
} from '@/lib/path'
import { formatTimeOfDay, formatVerboseDate, parseDate } from '@/lib/time'
import { renderComment } from '@/lib/render'
import files from '@/lib/files'

import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PreviewModal from '@/components/modals/PreviewModal.vue'

export default {
  name: 'entity-chat-days',

  mixins: [domMixin],

  components: {
    PeopleAvatar,
    PreviewModal,
    XIcon
  },

  emits: ['delete-message'],

  data() {
    return {
      currentAttachment: null
    }
  },

  props: {
    messages: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    ...mapGetters([
      'dateFormat',
      'departmentMap',
      'personMap',
      'use12HourClock',
      'user'
    ]),

    messageList() {
      const messages = [...this.messages].sort((a, b) =>
        moment(a.created_at).isAfter(moment(b.created_at))
      )
      const dayList = []
      let lastMessage = { data: null }
      let lastDay = null

      messages.forEach(message => {
        const messageDate = moment(message.created_at).tz(this.user.timezone)
        if (lastDay && messageDate.format('YYYY-MM-DD') === lastDay.date) {
          if (
            lastMessage &&
            lastMessage.data &&
            message.person_id === lastMessage.data.person_id &&
            moment(message.created_at).diff(lastMessage.data.created_at, 'm') <
              5
          ) {
            lastMessage.texts.push(message)
          } else {
            const element = {
              data: message,
              texts: [message ? message : '']
            }
            lastMessage = element
            lastDay.messages.push(element)
          }
        } else {
          const element = {
            data: message,
            texts: [message ? message : '']
          }
          lastDay = {
            title: formatVerboseDate(messageDate, this.dateFormat),
            date: messageDate.format('YYYY-MM-DD'),
            messages: [element]
          }
          lastMessage = element
          dayList.push(lastDay)
        }
      })

      return dayList.reverse()
    }
  },

  methods: {
    renderComment,

    renderDate(date) {
      date = moment(parseDate(date)).tz(this.user.timezone)
      return formatTimeOfDay(date, this.use12HourClock)
    },

    getAttachmentThumbnailPath,

    getDownloadAttachmentPath,

    pictureAttachments(attachments) {
      if (!attachments) return []
      return attachments
        .filter(attachment =>
          files.IMG_EXTENSIONS.includes(attachment.extension)
        )
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, {
            numeric: true
          })
        )
    },

    fileAttachments(attachments) {
      if (!attachments) return []
      return attachments
        .filter(
          attachment => !files.IMG_EXTENSIONS.includes(attachment.extension)
        )
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, {
            numeric: true
          })
        )
    },

    scrollToBottom() {
      this.$refs.messages.scrollTop = this.$refs.messages.offsetHeight
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .messages {
    background-color: var(--background-alt);
    .message-box {
      textarea {
        background: var(--background-alt);
      }
    }
  }
}

.day-messages {
  width: 100%;
}

.day-title {
  border-bottom: 1px solid var(--border-alt);
  margin-top: 2em;
  margin-bottom: 2em;
  position: relative;

  span {
    background: var(--background-alt);
    left: 50%;
    padding: 0 1em;
    position: absolute;
    top: -10px;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}

.messages {
  align-items: flex-end;
  color: var(--text);
  display: flex;
  flex: 1;
  flex-direction: column-reverse;
  overflow: auto;
  padding-bottom: 1em;

  .message {
    align-items: flex-start;
    display: flex;
    background: transparent;
    margin-bottom: 0.5rem;
    width: 100%;

    .message-avatar {
      margin-left: 10px;
      margin-top: 6px;

      &.flexrow-item {
        margin-right: 0.2rem;
      }
    }

    .message-header-wrapper {
      align-items: flex-end;
      display: flex;
      margin-left: 0.5rem;
      margin-top: 0.2rem;

      .message-date {
        font-size: 10px;
        line-height: 20px;
      }
    }

    .message-sender {
      font-weight: bold;
    }

    .message-content {
      margin-left: 0.2rem;
      width: 100%;
    }

    .attachment-thumbnail {
      border-radius: 10px;
      cursor: pointer;
      height: 100px;
      margin-right: 5px;
      margin-top: 10px;
      overflow: hidden;
      width: 100px;
    }

    .message-text {
      border-radius: 4px;
      margin-right: 10px;
      padding: 0.1em 0.5em;
      position: relative;

      .delete-message-button {
        cursor: pointer;
        display: none;
        position: absolute;
        right: 5px;
        top: 0;
      }

      &:hover {
        background-color: var(--background-alt);
        .delete-message-button {
          display: block;
        }
      }
    }
  }
}
</style>
