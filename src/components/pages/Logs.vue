<template>
  <div class="logs fixed-page">
    <div class="tabs logs-tabs">
      <ul>
        <li :class="{ 'is-active': isActiveTab('events') }">
          <a @click="activeTab = 'events'">
            {{ $t('logs.audit.title') }}
          </a>
        </li>
        <li :class="{ 'is-active': isActiveTab('logins') }">
          <a @click="activeTab = 'logins'">
            {{ $t('logs.logins.title') }}
          </a>
        </li>
        <li :class="{ 'is-active': isActiveTab('preview_files') }">
          <a @click="activeTab = 'preview_files'">
            {{ $t('logs.preview_files.title') }}
          </a>
        </li>
      </ul>
    </div>
    <event-logs v-if="isActiveTab('events')" />
    <login-logs v-else-if="isActiveTab('logins')" />
    <preview-files v-else-if="isActiveTab('preview_files')" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import EventLogs from '@/components/pages/logs/EventLogs.vue'
import LoginLogs from '@/components/pages/logs/LoginLogs.vue'
import PreviewFiles from '@/components/pages/logs/PreviewFiles.vue'

const route = useRoute()
const router = useRouter()

const activeTab = ref(route.query.tab || 'events')

function isActiveTab(tab) {
  return activeTab.value === tab
}

watch(activeTab, tab => {
  if (route.query.tab !== tab) {
    router.push({ query: { tab } })
  }
})
</script>

<style lang="scss" scoped>
.fixed-page {
  margin-top: 60px;
  padding: 2em;
  overflow: scroll;
}

.tabs.logs-tabs {
  overflow: visible;
  ul {
    margin-left: 0;
  }
}
</style>
