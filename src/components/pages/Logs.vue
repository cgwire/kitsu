<template>
  <div class="logs fixed-page">
    <route-tabs :active-tab="activeTab" :tabs="tabs" />
    <event-logs v-if="activeTab === 'events'" />
    <login-logs v-else-if="activeTab === 'logins'" />
    <preview-files v-else-if="activeTab === 'preview_files'" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import EventLogs from '@/components/pages/logs/EventLogs.vue'
import LoginLogs from '@/components/pages/logs/LoginLogs.vue'
import PreviewFiles from '@/components/pages/logs/PreviewFiles.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'

const { t } = useI18n()
const route = useRoute()

// Computed

const activeTab = computed(() => route.query.tab || 'events')

const tabs = computed(() => [
  { name: 'events', label: t('logs.audit.title') },
  { name: 'logins', label: t('logs.logins.title') },
  { name: 'preview_files', label: t('logs.preview_files.title') }
])
</script>

<style lang="scss" scoped>
.fixed-page {
  margin-top: 60px;
  overflow: scroll;
  padding: 2em;
}

:deep(.tabs) {
  overflow: visible;
}
</style>
