<template>
  <component :is="TAB_PAGES[activeTab]">
    <route-tabs class="logs-tabs" :active-tab="activeTab" :tabs="tabs" />
  </component>
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

// each tab is a page in panels, which shows the tabs above its filters
const TAB_PAGES = {
  events: EventLogs,
  logins: LoginLogs,
  preview_files: PreviewFiles
}

// Computed

const tabs = computed(() => [
  { name: 'events', label: t('logs.audit.title') },
  { name: 'logins', label: t('logs.logins.title') },
  { name: 'preview_files', label: t('logs.preview_files.title') }
])

// Fall back to the audit tab when the URL carries an unknown ?tab= value.
const activeTab = computed(() => {
  const tab = route.query.tab || 'events'
  return tabs.value.some(({ name }) => name === tab) ? tab : 'events'
})
</script>

<style lang="scss" scoped>
// Bulma sets the tabs apart from what follows: the panel already does
.tabs.logs-tabs {
  margin-bottom: 0;
}
</style>
