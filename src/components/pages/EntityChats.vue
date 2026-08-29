<template>
  <page-left-side-layout>
    <template #side>
      <div class="chat-column">
        <spinner class="mt1" v-if="isListLoading" />
        <div class="chat-list" v-else>
          <div
            :key="chat.id"
            class="chat-item"
            :class="{ selected: entity?.id === chat.object_id }"
            role="button"
            tabindex="0"
            @click="selectChat(chat)"
            @keydown.enter.prevent="selectChat(chat)"
            v-for="chat in chatList"
          >
            <div class="flexrow">
              <entity-thumbnail
                class="flexrow-item mr1"
                :height="40"
                :empty-height="40"
                :empty-width="60"
                :entity="{
                  id: chat.object_id,
                  preview_file_id: chat.preview_file_id
                }"
              />
              <div class="flexcolumn flexrow-item ml1">
                <div class="chat-item-project-name">
                  {{ getChatProjectName(chat) }}
                </div>
                <div class="chat-item-title">
                  {{ chat.entity_name }}
                </div>
                <div class="chat-item-subtitle">
                  {{ getChatDate(chat) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #main>
      <div class="selected-entity-chat">
        <entity-chat
          ref="entityChat"
          :entity="entity"
          :name="selectedChatName"
        />
      </div>
    </template>
  </page-left-side-layout>
</template>

<script setup>
// Imports
import { useHead } from '@unhead/vue'
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { useFormat } from '@/composables/format'

import PageLeftSideLayout from '@/components/layouts/PageLeftSideLayout.vue'
import EntityChat from '@/components/pages/entities/EntityChat.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import Spinner from '@/components/widgets/Spinner.vue'

// Composables
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()
const socket = getCurrentInstance().appContext.config.globalProperties.$socket
const { formatDate } = useFormat()

// State
// --------------------------------------------------------------------------
const chats = ref([])
const entity = ref(null)
const isListLoading = ref(false)

const entityChatRef = useTemplateRef('entityChat')

// Computed
// --------------------------------------------------------------------------
const productionMap = computed(() => store.getters.productionMap)
const user = computed(() => store.getters.user)

// newest message first, chats without any message last; ISO timestamps
// compare fine as strings
const chatList = computed(() =>
  [...chats.value].sort((a, b) => {
    if (!a.last_message) return 1
    if (!b.last_message) return -1
    return (
      b.last_message.localeCompare(a.last_message) ||
      a.entity_name.localeCompare(b.entity_name)
    )
  })
)

const selectedChatName = computed(
  () =>
    chatList.value.find(chat => chat.object_id === entity.value?.id)
      ?.entity_name
)

// Functions
// --------------------------------------------------------------------------
const selectFirstChat = () => {
  const [chat] = chatList.value
  if (chat) {
    entity.value = { id: chat.object_id }
  }
}

// falls back to the first chat when the query has no (known) entity id
const selectFromQuery = () => {
  const chat = chats.value.find(
    chat => chat.object_id === route.query.entity_id
  )
  if (chat) {
    entity.value = { id: chat.object_id }
  } else {
    selectFirstChat()
  }
}

const selectChat = async chat => {
  entity.value = { id: chat.object_id }
  await nextTick()
  entityChatRef.value.focusMessageBox()
  router.push({ query: { entity_id: chat.object_id } })
}

const getChatProjectName = chat =>
  productionMap.value.get(chat.project_id)?.name

const getChatDate = chat =>
  chat.last_message ? formatDate(chat.last_message) : t('chats.no_message_yet')

const onChatJoined = async eventData => {
  if (
    !chats.value.some(chat => chat.id === eventData.chat_id) &&
    user.value.id === eventData.person_id
  ) {
    chats.value = await store.dispatch('getEntityChats')
  }
}

const onChatLeft = eventData => {
  if (
    chats.value.some(chat => chat.id === eventData.chat_id) &&
    user.value.id === eventData.person_id
  ) {
    chats.value = chats.value.filter(chat => chat.id !== eventData.chat_id)
  }
}

const onChatNewMessage = eventData => {
  const chat = chats.value.find(chat => chat.id === eventData.chat_id)
  if (chat) {
    chat.last_message = eventData.last_message
  }
}

// Watchers
// --------------------------------------------------------------------------
watch(() => route.query.entity_id, selectFromQuery)

// Lifecycle
// --------------------------------------------------------------------------
onMounted(async () => {
  socket.on('chat:joined', onChatJoined)
  socket.on('chat:left', onChatLeft)
  socket.on('chat:new-message', onChatNewMessage)
  isListLoading.value = true
  chats.value = await store.dispatch('getEntityChats')
  selectFromQuery()
  isListLoading.value = false
})

onBeforeUnmount(() => {
  socket.off('chat:joined', onChatJoined)
  socket.off('chat:left', onChatLeft)
  socket.off('chat:new-message', onChatNewMessage)
})

// Head
// --------------------------------------------------------------------------
useHead({ title: computed(() => `${t('chats.title')} - Kitsu`) })
</script>

<style lang="scss" scoped>
.chat-column {
  border: 1px solid var(--border);
  height: 100%;
  overflow-y: auto;
  padding-top: 60px;
}

.selected-entity-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  padding: 1em;
  padding-top: 60px;
}

.chat-item {
  border: 2px solid transparent;
  border-bottom: 2px solid var(--border-alt);
  color: var(--text);
  cursor: pointer;
  padding: 1em;

  &:hover {
    border-color: var(--background-selectable);
  }

  &.selected {
    border-color: var(--background-selected);
  }

  .chat-item-project-name {
    color: $grey;
    font-size: 0.7em;
    font-weight: bold;
    text-transform: uppercase;
  }

  .chat-item-title {
    font-weight: bold;
  }

  .chat-item-subtitle {
    color: $grey;
    font-size: 0.8em;
  }
}
</style>
