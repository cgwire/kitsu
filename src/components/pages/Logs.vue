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
import { useStore } from 'vuex'

import EventLogs from '@/components/pages/logs/EventLogs.vue'
import LoginLogs from '@/components/pages/logs/LoginLogs.vue'
import PreviewFiles from '@/components/pages/logs/PreviewFiles.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'

const { t } = useI18n()
const route = useRoute()
const store = useStore()

// Computed

const isCurrentUserAdmin = computed(() => store.getters.isCurrentUserAdmin)

// Login logs expose everyone's IP address: the API restricts them to admins.
const tabs = computed(() =>
  [
    { name: 'events', label: t('logs.audit.title') },
    isCurrentUserAdmin.value
      ? { name: 'logins', label: t('logs.logins.title') }
      : null,
    { name: 'preview_files', label: t('logs.preview_files.title') }
  ].filter(Boolean)
)

// A bookmarked or shared ?tab=logins must not 403 a non-admin.
const activeTab = computed(() => {
  const tab = route.query.tab || 'events'
  return tabs.value.some(({ name }) => name === tab) ? tab : 'events'
})
</script>

<style lang="scss" scoped>
.fixed-page {
  color: var(--text);
  margin-top: 60px;
  overflow: scroll;
  padding: 2em;
}

:deep(.tabs) {
  overflow: visible;
}
</style>
