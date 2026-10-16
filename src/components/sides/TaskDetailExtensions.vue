<template>
  <div class="task-detail-extensions">
    <nav
      class="task-detail-tabs"
      role="tablist"
      :aria-label="$t('comments.title')"
    >
      <button
        class="task-detail-tab"
        :class="{ active: !activePluginId }"
        type="button"
        role="tab"
        :aria-selected="!activePluginId"
        @click="activePluginId = ''"
      >
        {{ $t('comments.title') }}
      </button>
      <button
        v-for="plugin in projectPlugins"
        :key="plugin.plugin_id"
        class="task-detail-tab"
        :class="{ active: activePluginId === plugin.plugin_id }"
        type="button"
        role="tab"
        :aria-selected="activePluginId === plugin.plugin_id"
        @click="activePluginId = plugin.plugin_id"
      >
        {{ plugin.name }}
      </button>
    </nav>

    <slot v-if="!activePlugin" />
    <iframe
      v-else-if="pluginUrl"
      :key="`${activePlugin.plugin_id}:${task.project_id}:${task.id}`"
      class="task-detail-plugin-frame"
      :src="pluginUrl"
      :title="activePlugin.name"
      frameborder="0"
      allowfullscreen
      referrerpolicy="same-origin"
    ></iframe>
    <div v-else class="task-detail-plugin-unavailable" role="status">
      {{ $t('main.loading_error') }}
    </div>
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { buildTaskPluginUrl } from '@/components/sides/taskPluginContext'

const props = defineProps({
  entityType: { type: String, default: 'Asset' },
  task: { type: Object, default: null }
})

const store = useStore()
const activePluginId = ref('')
const projectPlugins = computed(() => store.getters.projectPlugins || [])
const activePlugin = computed(() =>
  projectPlugins.value.find(plugin => plugin.plugin_id === activePluginId.value)
)
const locale = computed(() => store.state.user.user?.locale || 'en')
const pluginUrl = computed(() =>
  buildTaskPluginUrl(activePlugin.value, props.task, {
    darkTheme: store.getters.isDarkTheme,
    entityType: props.entityType,
    locale: locale.value
  })
)

watch(
  () => [props.task?.id, props.task?.project_id],
  () => {
    activePluginId.value = ''
  }
)
watch(projectPlugins, plugins => {
  if (!plugins.some(plugin => plugin.plugin_id === activePluginId.value)) {
    activePluginId.value = ''
  }
})
</script>

<style lang="scss" scoped>
.task-detail-tabs {
  display: flex;
  gap: 0.25em;
  overflow-x: auto;
  border-bottom: 1px solid var(--border-alt);
}

.task-detail-tab {
  flex: 0 0 auto;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--text-alt);
  cursor: pointer;
  padding: 0.6em 0.8em;
}

.task-detail-tab.active {
  border-bottom-color: var(--text-selected);
  color: var(--text);
}

.task-detail-plugin-frame {
  display: block;
  width: 100%;
  min-height: 680px;
  border: 0;
  background: var(--background-page);
}

.task-detail-plugin-unavailable {
  padding: 1em;
  color: var(--text-alt);
}
</style>
