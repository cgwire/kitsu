<template>
  <div class="messages">
    <div
      class="day-messages"
      v-for="day in messageList"
    >
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
              {{ personMap.get(chatMessage.data.person_id).name }}
            </div>
            <div class="message-date">
              {{ renderDate(chatMessage.data.created_at) }}
            </div>
          </div>
          <div
            class="message-text"
            v-for="text in chatMessage.texts"
          >
            <div
              v-html="
                renderComment(
                  text,
                  [],
                  [],
                  personMap,
                  departmentMap,
                  ''
                )
              "
            >
            </div>
            <div
              class="delete-message-button"
              @click="$emit('delete-message', chatMessage.data.id)"
              v-if="chatMessage.data.person_id === user.id"
            >
              <x-icon class="" size="0.8x" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment-timezone'
import { XIcon } from 'vue-feather-icons'

import { renderComment } from '@/lib/render'
import { parseDate } from '@/lib/time'
import { domMixin } from '@/components/mixins/dom'

import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'


export default {
  name: 'entity-chat-days',
  mixins: [domMixin],

  components: {
    PeopleAvatar,
    XIcon
  },

  data() {
    return {
    }
  },

  props: {
    messages: {
      type: Array,
      default: () => []
    }
  },

  mounted() {
  },

  computed: {
    ...mapGetters([
      'departmentMap',
      'personMap',
      'user'
    ]),

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
    ]),

    renderComment,

    renderDate(date) {
      date = moment(parseDate(date)).tz(this.user.timezone)
      return date.tz(this.user.timezone).format('HH:mm')
    }
  },

  watch: {
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
        margin-right: .2rem;
      }
    }

    .message-header-wrapper {
      align-items: flex-end;
      display: flex;
      margin-left: .5rem;
      margin-top: .2rem;

      .message-date {
        font-size: 10px;
        line-height: 20px;
      }
    }

    .message-sender {
      font-weight: bold;
    }

    .message-content {
      margin-left: .2rem;
      width: 100%;
    }

    .message-text {
      border-radius: 4px;
      margin-right: 10px;
      padding: .1em .5em;
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
