<template>
  <page-left-side-layout>
    <template #side>
      <div class="chat-column">
        <spinner class="mt1" v-if="loading.list" />
        <div class="chat-list" v-else>
          <div
            :key="chat.id"
            :class="chatClass(chat)"
            @click="selectChat(chat)"
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
          :name="chatList.find(c => c.object_id === entity.id)?.entity_name"
        />
      </div>
    </template>
  </page-left-side-layout>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import { formatListMixin } from '@/components/mixins/format'

import EntityChat from '@/components/pages/entities/EntityChat.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import PageLeftSideLayout from '@/components/layouts/PageLeftSideLayout.vue'
import Spinner from '@/components/widgets/Spinner.vue'

export default {
  name: 'entity-chats',

  mixins: [formatListMixin],

  components: {
    EntityChat,
    EntityThumbnail,
    PageLeftSideLayout,
    Spinner
  },

  data() {
    return {
      chats: [],
      entity: null,
      loading: {
        list: false
      }
    }
  },

  async mounted() {
    this.loading.list = true
    this.chats = await this.getEntityChats()
    if (this.$route.query.entity_id) {
      this.selectFromQuery()
    } else {
      this.selectFirstChat()
    }
    this.loading.list = false
  },

  computed: {
    ...mapGetters(['productionMap', 'user']),

    chatList() {
      return [...this.chats].sort((a, b) => {
        if (!a.last_message) return 1
        if (!b.last_message) return -1
        if (a.last_message === b.last_message) {
          return a.entity_name.localeCompare(b.entity_name)
        }
        return a.last_message < b.last_message
      })
    }
  },

  methods: {
    ...mapActions(['getEntityChats']),

    selectFirstChat() {
      if (this.chats.length > 0) {
        const chat = this.chats[this.chats.length - 1]
        this.entity = { id: chat.object_id }
      }
    },

    selectFromQuery() {
      const chat = this.chats.find(
        c => c.object_id === this.$route.query.entity_id
      )
      if (chat) {
        this.entity = { id: chat.object_id }
      } else {
        this.selectFirstChat()
      }
    },

    selectChat(chat) {
      this.entity = { id: chat.object_id }
      this.$nextTick(() => {
        this.$refs.entityChat.focusMessageBox()
      })
      this.$router.push({ query: { entity_id: chat.object_id } })
    },

    chatClass(chat) {
      return {
        'chat-item': true,
        selected: this.entity && this.entity.id === chat.object_id
      }
    },

    getChatProjectName(chat) {
      return this.productionMap.get(chat.project_id).name
    },

    getChatDate(chat) {
      if (!chat.last_message) return this.$t('chats.no_message_yet')
      return this.formatDate(chat.last_message)
    }
  },

  watch: {
    '$route.query.entity_id'() {
      this.selectFromQuery()
    }
  },

  socket: {
    events: {
      async 'chat:joined'(eventData) {
        if (
          !this.chats.some(c => c.id === eventData.chat_id) &&
          this.user.id === eventData.person_id
        ) {
          this.chats = await this.getEntityChats()
        }
      },

      'chat:left'(eventData) {
        if (
          this.chats.some(c => c.id === eventData.chat_id) &&
          this.user.id === eventData.person_id
        ) {
          this.chats = this.chats.filter(c => c.id !== eventData.chat_id)
        }
      },

      'chat:new-message'(eventData) {
        const chat = this.chats.find(c => c.id === eventData.chat_id)
        if (chat) {
          chat.last_message = eventData.last_message
        }
      }
    }
  },

  head() {
    return {
      title: `${this.$t('chats.title')} - Kitsu`
    }
  }
}
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
