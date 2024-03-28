<template>
  <div class="mt1 entity-chat">
    <template v-if="!entity">
      <p>
        {{ $t('chat.no_chats') }}
      </p>
      <div class="has-text-centered">
        <button-simple text="Search for entity" @click="$router.push('entity-search')"/>
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
        <div class="has-text-centered" v-if="loading.chat">
          <spinner class="mt1" />
        </div>
        <entity-chat-days
          :messages="messages"
          @delete-message="deleteMessage"
          v-else
        />
        <div class="join-chat" v-if="!isInChat">
          <button
            class="button"
            :is-loading="loading.join"
            @click="joinChat"
          >
            {{ $t('chats.join') }}
          </button>
        </div>
        <div class="message-box" v-else>
          <textarea
            ref="messageBox"
            @keyup.enter="sendMessage"
            v-focus
            v-model="currentMessage"
          >
          </textarea>
          <button-simple
            class="send-button"
            icon="send"
            @click="sendMessage"
          />
        </div>
      </template>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'
import { XIcon } from 'vue-feather-icons'

import { sortPeople } from '@/lib/sorting'
import { domMixin } from '@/components/mixins/dom'

import ButtonSimple from '@/components/widgets/ButtonSimple'
import EntityChatDays from '@/components/pages/entities/EntityChatDays'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import Spinner from '@/components/widgets/Spinner'

export default {
  name: 'entity-chat',
  mixins: [domMixin],

  components: {
    ButtonSimple,
    EntityChatDays,
    PeopleAvatar,
    Spinner,
    XIcon
  },

  data() {
    return {
      chat: {},
      loading: {
        chat: false,
        join: false,
        leave: false,
        send: false
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
    }
  },

  mounted() {
    if (!this.entity) return
    this.reset()
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'departmentMap',
      'personMap',
      'taskStatusMap',
      'taskTypeMap',
      'user'
    ]),

    isInChat() {
      return this.participants.includes(this.user.id)
    },

    participantList() {
      return sortPeople(this.participants.map(
        pid => this.personMap.get(pid)
      ))
    },

    messageList() {
      const messages = [...this.messages]
        .sort((a, b) => moment(a.created_at).isAfter(moment(b.created_at)))
      const dayList = []
      let lastMessage = { data: null }
      let lastDay = null

      messages.forEach(message => {
        const messageDate = moment(message.created_at)
          .tz(this.user.timezone)
        if (
          lastDay
          && messageDate.format('YYYY-MM-DD') === lastDay.date
        ){
          if (
            lastMessage && lastMessage.data &&
            message.person_id === lastMessage.data.person_id &&
            moment(message.created_at).diff(lastMessage.data.created_at, 'm') < 60
          ) {
            lastMessage.texts.push(message.text)
          } else {
            const element = {
              data: message,
              texts: [message.text]
            }
            lastMessage = element
            lastDay.messages.push(element)
          }
        } else {
          const element = {
            data: message,
            texts: [message.text]
          }
          lastDay = {
            title: messageDate.format('LL'),
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
      try {
        this.chat = await this.getEntityChat(this.entity.id)
        this.messages = await this.getEntityChatMessages(this.entity.id)
        this.messages.forEach(m => this.messageMap.set(m.id, m))
        this.participants = this.chat.participants || []
      } catch (e) {
        console.error(e)
      } finally {
        this.loading.chat = false
      }
    },

    async joinChat() {
      this.loading.join = true
      try {
        await this.joinEntityChat(this.entity.id)
      } catch (e) {
        console.error(e)
      } finally {
        this.loading.join = false
      }
    },

    async leaveChat() {
      this.loading.leave = true
      try {
        await this.leaveEntityChat(this.entity.id)
      } catch (e) {
        console.error(e)
      } finally {
        this.loading.leave = false
      }
    },

    async sendMessage(event) {
      if (event) event.preventDefault()
      this.pauseEvent(event)
      this.loading.send = true
      try {
        const message = await this.sendChatMessage({
          entityId: this.entity.id,
          message: this.currentMessage
        })
        this.currentMessage = ''
        this.messages.push(message)
        this.messageMap.set(message.id, message)
      } catch (e) {
        console.error(e)
      } finally {
        this.loading.send = false
      }
    },

    async deleteMessage(messageId) {
      try {
        this.messages = this.messages.filter(m => m.id !== messageId)
        await this.deleteChatMessage({
          entityId: this.entity.id,
          messageId
        })
        this.messageMap.delete(messageId)
      } catch (e) {
        console.error(e)
      }
    },

    focusMessageBox() {
      this.$refs.messageBox.focus()
    }
  },

  socket: {
    events: {
      async 'chat:joined' (eventData) {
        if (
          eventData.chat_id === this.chat.id &&
          !this.participants.includes(eventData.person_id)
        ) {
          this.participants.push(eventData.person_id)
        }
      },

      async 'chat:left' (eventData) {
        if (
          eventData.chat_id === this.chat.id &&
          this.participants.includes(eventData.person_id)
        ) {
          this.participants = this.participants.filter(
            pId => pId !== eventData.person_id
          )
        }
      },

      async 'chat:new-message' (eventData) {
        if (
          eventData.chat_id === this.chat.id
        ) {
          const message = await this.getChatMessage({
            entityId: this.entity.id,
            messageId: eventData.chat_message_id
          })
          if (!this.messageMap.has(eventData.chat_message_id)) {
            this.messageMap.set(message.id, message)
            this.messages.push(message)
          }
        }
      },

      async 'chat:deleted-message' (eventData) {
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
      box-shadow: inset 0px 0px 5px 0 rgba(0, 0, 0, 0.1);
      border: 1px solid var(--border-alt);
      border-bottom-left-radius: 10px;
      border-bottom-right-radius: 10px;
      font-size: 14px;
      margin-bottom: -5px;
      height: 60px;
      padding: 10px;
      width: 100%;
    }

    .send-button {
      bottom: 0px;
      position: absolute;
      right: 3px;
    }
  }
}
</style>
