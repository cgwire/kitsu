<template>
  <div class="mt1 entity-chat">
    <template v-if="!entity">
      <p>
        {{ $t('chats.no_chat') }}
      </p>
      <div class="has-text-centered" v-if="mainConfig.indexer_configured">
        <button-simple
          :text="$t('chats.search_entity')"
          @click="$router.push('entity-search')"
        />
      </div>
    </template>
    <template v-else>
      <div class="participants flexrow">
        <people-avatar
          class="flexrow-item"
          :key="participant.id"
          :person="participant"
          :size="20"
          :font-size="10"
          v-for="participant in participantList"
        />
        <span class="filler"></span>
        <button-simple
          class="flexrow-item"
          :text="$t('chats.leave')"
          :is-loading="loading.leave"
          @click="leaveChat"
          v-if="isInChat"
        />
      </div>
      <div class="has-text-centered filler" v-if="loading.chat">
        <spinner class="mt1" />
      </div>
      <entity-chat-days
        ref="messages"
        :messages="messages"
        @delete-message="showConfirmDeleteMessage"
        v-else
      />
      <div class="join-chat" v-if="!isInChat">
        <button class="button" :is-loading="loading.join" @click="joinChat">
          {{ $t('chats.join') }}
        </button>
      </div>
      <div class="message-box" v-else>
        <div>
          <textarea
            id="message-box"
            ref="messageBox"
            :disabled="loading.send"
            @keydown.enter.prevent="sendMessage"
            v-focus
            v-model="currentMessage"
          >
          </textarea>
          <div class="buttons">
            <emoji-button @select="onSelectEmoji" />
            <button-simple
              class="attach-button"
              icon="attach"
              @click="modals.addAttachment = true"
            />
            <div class="filler"></div>
            <button-simple
              class="send-button"
              icon="send"
              :is-loading="loading.send"
              @click="sendMessage"
            />
          </div>
        </div>
        <div class="attachments" v-if="attachments.length > 0">
          <div
            class="attachment-name"
            :key="attachment.name"
            v-for="attachment in attachments"
          >
            {{ attachment.get('file').name }}
            <span @click="removeAttachment(attachment)">
              <x-icon :size="8" />
            </span>
          </div>
        </div>
      </div>
    </template>

    <add-attachment-modal
      ref="add-attachment-modal"
      :active="modals.addAttachment"
      :is-loading="loading.addAttachment"
      :is-error="errors.addAttachment"
      :title="name"
      @cancel="closeAttachmentModal"
      @confirm="addAttachment"
    />

    <confirm-modal
      :active="modals.deleteMessage"
      :confirm-button-text="$t('chats.delete_message_confirm')"
      :text="$t('chats.delete_message')"
      :is-loading="loading.deleteMessage"
      :is-error="errors.deleteMessage"
      @cancel="modals.deleteMessage = false"
      @confirm="deleteMessage"
    />
  </div>
</template>

<script>
import { XIcon } from 'lucide-vue-next'
import { mapGetters, mapActions } from 'vuex'

import { sortPeople } from '@/lib/sorting'
import stringHelpers from '@/lib/string'
import { domMixin } from '@/components/mixins/dom'

import AddAttachmentModal from '@/components/modals/AddAttachmentModal.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import EmojiButton from '@/components/widgets/EmojiButton.vue'
import EntityChatDays from '@/components/pages/entities/EntityChatDays.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import Spinner from '@/components/widgets/Spinner.vue'

export default {
  name: 'entity-chat',

  mixins: [domMixin],

  components: {
    AddAttachmentModal,
    ButtonSimple,
    ConfirmModal,
    EmojiButton,
    EntityChatDays,
    PeopleAvatar,
    Spinner,
    XIcon
  },

  data() {
    return {
      attachments: [],
      chat: {},
      errors: {
        addAttachment: false,
        chat: false,
        deleteMessage: false,
        join: false,
        leave: false,
        send: false
      },
      loading: {
        addAttachment: false,
        chat: false,
        deleteMessage: false,
        join: false,
        leave: false,
        send: false
      },
      modals: {
        addAttachment: false,
        deleteMessage: false
      },
      participants: [],
      currentMessage: '',
      messages: [],
      messageMap: new Map()
    }
  },

  props: {
    entity: {
      type: Object,
      default: () => {}
    },
    name: {
      type: String,
      default: ''
    }
  },

  mounted() {
    if (!this.entity) return
    this.reset()
  },

  computed: {
    ...mapGetters(['mainConfig', 'personMap', 'user']),

    isInChat() {
      return this.participants.includes(this.user.id)
    },

    participantList() {
      return sortPeople(this.participants.map(pid => this.personMap.get(pid)))
    }
  },

  methods: {
    ...mapActions([
      'deleteChatMessage',
      'getChatMessage',
      'getEntityChat',
      'getEntityChatMessages',
      'joinEntityChat',
      'leaveEntityChat',
      'sendChatMessage'
    ]),

    async reset() {
      this.loading.chat = true
      this.errors.chat = false
      try {
        this.chat = await this.getEntityChat(this.entity.id)
        this.messages = await this.getEntityChatMessages(this.entity.id)
        this.messages.forEach(m => this.messageMap.set(m.id, m))
        this.participants = this.chat.participants || []
      } catch (e) {
        this.errors.chat = true
        console.error(e)
      } finally {
        this.loading.chat = false
      }
    },

    async joinChat() {
      this.loading.join = true
      this.errors.join = false
      try {
        await this.joinEntityChat(this.entity.id)
      } catch (e) {
        this.errors.join = true
        console.error(e)
      } finally {
        this.loading.join = false
      }
    },

    async leaveChat() {
      this.loading.leave = true
      this.errors.leave = false
      try {
        await this.leaveEntityChat(this.entity.id)
      } catch (e) {
        this.errors.leave = true
        console.error(e)
      } finally {
        this.loading.leave = false
      }
    },

    async sendMessage(event) {
      if (event && event.keyCode === 13 && event.shiftKey) {
        this.currentMessage += '\n'
        return
      }
      this.errors.send = false
      this.loading.send = true
      try {
        const message = await this.sendChatMessage({
          entityId: this.entity.id,
          message: this.currentMessage,
          attachments: this.attachments
        })
        this.currentMessage = ''
        this.attachments = []
        this.messages.push(message)
        this.messageMap.set(message.id, message)
        this.$refs.messages.scrollToBottom()
        this.$nextTick(() => {
          this.$refs.messageBox.focus()
        })
      } catch (e) {
        this.errors.send = true
        console.error(e)
      } finally {
        this.loading.send = false
      }
    },

    showConfirmDeleteMessage(messageId) {
      this.modals.deleteMessage = true
      this.errors.deleteMessage = false
      this.loading.deleteMessage = false
      this.messageToDeleteId = messageId
    },

    async deleteMessage() {
      const messageId = this.messageToDeleteId
      this.errors.deleteMessage = false
      try {
        this.loading.deleteMessage = true
        this.messages = this.messages.filter(m => m.id !== messageId)
        this.messageMap.delete(messageId)
        await this.deleteChatMessage({
          entityId: this.entity.id,
          messageId
        })
        this.modals.deleteMessage = false
        this.messageToDeleteId = null
      } catch (e) {
        this.errors.deleteMessage = true
        console.error(e)
      } finally {
        this.loading.deleteMessage = false
      }
    },

    focusMessageBox() {
      const messageBox = this.$refs.messageBox
      if (messageBox) messageBox.focus()
    },

    addAttachment(forms) {
      this.attachments = this.attachments.concat(forms)
      this.closeAttachmentModal()
    },

    closeAttachmentModal() {
      this.modals.addAttachment = false
    },

    removeAttachment(form) {
      this.attachments = this.attachments.filter(f => f !== form)
    },

    onSelectEmoji(emoji) {
      this.currentMessage = stringHelpers.insertInTextArea(
        this.$refs.messageBox,
        emoji.i
      )
    }
  },

  socket: {
    events: {
      'chat:joined'(eventData) {
        if (
          eventData.chat_id === this.chat.id &&
          !this.participants.includes(eventData.person_id)
        ) {
          this.participants.push(eventData.person_id)
        }
      },

      'chat:left'(eventData) {
        if (
          eventData.chat_id === this.chat.id &&
          this.participants.includes(eventData.person_id)
        ) {
          this.participants = this.participants.filter(
            pId => pId !== eventData.person_id
          )
        }
      },

      async 'chat:new-message'(eventData) {
        if (eventData.chat_id === this.chat.id) {
          const message = await this.getChatMessage({
            entityId: this.entity.id,
            messageId: eventData.chat_message_id
          })
          if (!this.messageMap.has(eventData.chat_message_id)) {
            this.messageMap.set(message.id, message)
            this.messages.push(message)
            this.focusMessageBox()
          }
        }
      },

      'chat:deleted-message'(eventData) {
        if (eventData.chat_id === this.chat.id) {
          this.messages = this.messages.filter(
            m => m.id !== eventData.message_id
          )
        }
      }
    }
  },

  watch: {
    entity() {
      if (this.entity) this.reset()
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .entity-chat {
    .participants {
      background: var(--background);
    }

    .messages {
      background-color: var(--background-alt);
      .message-box {
        textarea {
          background: var(--background-alt);
        }
      }
    }
  }
}

.entity-chat {
  border-radius: 16px;
  border: 1px solid var(--border-alt);
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  overflow: hidden;

  p {
    color: var(--text);
    padding: 2em;
    text-align: center;
  }

  .participants {
    background: var(--background-alt);
    border-bottom: 2px solid var(--border-alt);
    border-top-left-radius: 17px;
    border-top-right-radius: 17px;
    display: flex;
    justify-content: space-between;
    min-height: 30px;
    padding: 5px 10px;

    .flexrow-item {
      margin-right: 3px;
    }
  }

  .join-chat {
    text-align: center;
    width: 100%;

    .button {
      width: 100%;
    }
  }

  .message-box {
    position: relative;

    textarea {
      background: var(--background);
      box-shadow: inset 0 0 5px 0 rgba(0, 0, 0, 0.1);
      font-size: 14px;
      margin-bottom: -5px;
      height: 60px;
      padding: 10px;
      width: 100%;
    }

    .buttons {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      margin-top: 5px;
      padding-left: 5px;
      padding-right: 5px;
    }
  }
}

.attachments {
  display: flex;
  flex-wrap: wrap;
  margin-top: 5px;
  padding: 5px;

  .attachment-name {
    background: var(--background-alt);
    border-radius: 10px;
    color: var(--text);
    cursor: pointer;
    font-size: 12px;
    margin-right: 5px;
    padding: 5px;
  }
}
</style>
