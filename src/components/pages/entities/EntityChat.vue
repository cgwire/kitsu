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
        ref="chatDays"
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
            <span
              role="button"
              tabindex="0"
              @click="removeAttachment(attachment)"
              @keydown.enter.prevent="removeAttachment(attachment)"
              @keydown.space.prevent="removeAttachment(attachment)"
            >
              <x-icon :size="8" />
            </span>
          </div>
        </div>
      </div>
    </template>

    <add-attachment-modal
      :active="modals.addAttachment"
      :is-loading="loading.addAttachment"
      :is-error="errors.addAttachment"
      :title="name"
      :name-prefix="attachmentNamePrefix"
      @cancel="closeAttachmentModal"
      @confirm="addAttachment"
    />

    <confirm-modal
      :active="modals.deleteMessage"
      is-danger
      :confirm-button-text="$t('chats.delete_message_confirm')"
      :text="$t('chats.delete_message')"
      :is-loading="loading.deleteMessage"
      :is-error="errors.deleteMessage"
      @cancel="modals.deleteMessage = false"
      @confirm="deleteMessage"
    />
  </div>
</template>

<script setup>
// Imports
import { XIcon } from 'lucide-vue-next'
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  useTemplateRef,
  watch
} from 'vue'
import { useStore } from 'vuex'

import { sortPeople } from '@/lib/sorting'
import stringHelpers from '@/lib/string'

import AddAttachmentModal from '@/components/modals/AddAttachmentModal.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import EntityChatDays from '@/components/pages/entities/EntityChatDays.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import EmojiButton from '@/components/widgets/EmojiButton.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import Spinner from '@/components/widgets/Spinner.vue'

// Composables
const store = useStore()
const socket = getCurrentInstance().appContext.config.globalProperties.$socket

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  entity: {
    type: Object,
    default: null
  },
  name: {
    type: String,
    default: ''
  }
})

// State
// --------------------------------------------------------------------------
const attachments = ref([])
const chat = ref({})
const currentMessage = ref('')
const messages = ref([])
const participants = ref([])

const errors = reactive({
  addAttachment: false,
  chat: false,
  deleteMessage: false,
  join: false,
  leave: false,
  send: false
})
const loading = reactive({
  addAttachment: false,
  chat: false,
  deleteMessage: false,
  join: false,
  leave: false,
  send: false
})
const modals = reactive({
  addAttachment: false,
  deleteMessage: false
})

// dedup index for socket-received messages, never rendered
const messageMap = new Map()
let messageToDeleteId = null

// the ref name must not collide with the messages data ref: a template
// ref sharing a setup ref's name overwrites it with the component instance
const chatDaysRef = useTemplateRef('chatDays')
const messageBoxRef = useTemplateRef('messageBox')

// Computed
// --------------------------------------------------------------------------
const mainConfig = computed(() => store.getters.mainConfig)
const personMap = computed(() => store.getters.personMap)
const user = computed(() => store.getters.user)

const attachmentNamePrefix = computed(() =>
  stringHelpers.attachmentNamePrefix(props.name)
)

const isInChat = computed(() => participants.value.includes(user.value.id))

const participantList = computed(() =>
  sortPeople(participants.value.map(personId => personMap.value.get(personId)))
)

// Functions
// --------------------------------------------------------------------------
const reset = async () => {
  loading.chat = true
  errors.chat = false
  try {
    chat.value = await store.dispatch('getEntityChat', props.entity.id)
    messages.value = await store.dispatch(
      'getEntityChatMessages',
      props.entity.id
    )
    messages.value.forEach(message => messageMap.set(message.id, message))
    participants.value = chat.value.participants || []
  } catch (error) {
    errors.chat = true
    console.error(error)
  } finally {
    loading.chat = false
  }
}

const joinChat = async () => {
  loading.join = true
  errors.join = false
  try {
    await store.dispatch('joinEntityChat', props.entity.id)
  } catch (error) {
    errors.join = true
    console.error(error)
  } finally {
    loading.join = false
  }
}

const leaveChat = async () => {
  loading.leave = true
  errors.leave = false
  try {
    await store.dispatch('leaveEntityChat', props.entity.id)
  } catch (error) {
    errors.leave = true
    console.error(error)
  } finally {
    loading.leave = false
  }
}

const sendMessage = async event => {
  if (event && event.keyCode === 13 && event.shiftKey) {
    currentMessage.value += '\n'
    return
  }
  errors.send = false
  loading.send = true
  try {
    const message = await store.dispatch('sendChatMessage', {
      entityId: props.entity.id,
      message: currentMessage.value,
      attachments: attachments.value
    })
    currentMessage.value = ''
    attachments.value = []
    messages.value.push(message)
    messageMap.set(message.id, message)
    chatDaysRef.value.scrollToBottom()
    await nextTick()
    messageBoxRef.value.focus()
  } catch (error) {
    errors.send = true
    console.error(error)
  } finally {
    loading.send = false
  }
}

const showConfirmDeleteMessage = messageId => {
  modals.deleteMessage = true
  errors.deleteMessage = false
  loading.deleteMessage = false
  messageToDeleteId = messageId
}

const deleteMessage = async () => {
  const messageId = messageToDeleteId
  errors.deleteMessage = false
  try {
    loading.deleteMessage = true
    messages.value = messages.value.filter(message => message.id !== messageId)
    messageMap.delete(messageId)
    await store.dispatch('deleteChatMessage', {
      entityId: props.entity.id,
      messageId
    })
    modals.deleteMessage = false
    messageToDeleteId = null
  } catch (error) {
    errors.deleteMessage = true
    console.error(error)
  } finally {
    loading.deleteMessage = false
  }
}

const focusMessageBox = () => {
  messageBoxRef.value?.focus()
}

const addAttachment = forms => {
  attachments.value = attachments.value.concat(forms)
  closeAttachmentModal()
}

const closeAttachmentModal = () => {
  modals.addAttachment = false
}

const removeAttachment = form => {
  attachments.value = attachments.value.filter(
    attachment => attachment !== form
  )
}

const onSelectEmoji = emoji => {
  currentMessage.value = stringHelpers.insertInTextArea(
    messageBoxRef.value,
    emoji.i
  )
}

const onChatJoined = eventData => {
  if (
    eventData.chat_id === chat.value.id &&
    !participants.value.includes(eventData.person_id)
  ) {
    participants.value.push(eventData.person_id)
  }
}

const onChatLeft = eventData => {
  if (
    eventData.chat_id === chat.value.id &&
    participants.value.includes(eventData.person_id)
  ) {
    participants.value = participants.value.filter(
      personId => personId !== eventData.person_id
    )
  }
}

const onChatNewMessage = async eventData => {
  if (eventData.chat_id === chat.value.id) {
    const message = await store.dispatch('getChatMessage', {
      entityId: props.entity.id,
      messageId: eventData.chat_message_id
    })
    if (!messageMap.has(eventData.chat_message_id)) {
      messageMap.set(message.id, message)
      messages.value.push(message)
      focusMessageBox()
    }
  }
}

const onChatDeletedMessage = eventData => {
  if (eventData.chat_id === chat.value.id) {
    messages.value = messages.value.filter(
      message => message.id !== eventData.message_id
    )
  }
}

// the parent page focuses the message box through a template ref
defineExpose({ focusMessageBox })

// Watchers
// --------------------------------------------------------------------------
watch(
  () => props.entity,
  () => {
    if (props.entity) reset()
  }
)

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  socket.on('chat:joined', onChatJoined)
  socket.on('chat:left', onChatLeft)
  socket.on('chat:new-message', onChatNewMessage)
  socket.on('chat:deleted-message', onChatDeletedMessage)
  if (props.entity) reset()
})

onBeforeUnmount(() => {
  socket.off('chat:joined', onChatJoined)
  socket.off('chat:left', onChatLeft)
  socket.off('chat:new-message', onChatNewMessage)
  socket.off('chat:deleted-message', onChatDeletedMessage)
})
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
