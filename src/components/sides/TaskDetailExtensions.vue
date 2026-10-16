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
        :tabindex="!activePluginId ? 0 : -1"
        :aria-selected="!activePluginId"
        @click="activePluginId = ''"
        @keydown="onPluginTabKeydown($event, 0)"
      >
        {{ $t('comments.title') }}
      </button>
      <button
        v-for="(plugin, index) in taskPlugins"
        :key="plugin.plugin_id"
        class="task-detail-tab"
        :class="{ active: activePluginId === plugin.plugin_id }"
        type="button"
        role="tab"
        :tabindex="activePluginId === plugin.plugin_id ? 0 : -1"
        :aria-selected="activePluginId === plugin.plugin_id"
        @click="activePluginId = plugin.plugin_id"
        @keydown="onPluginTabKeydown($event, index + 1)"
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
      :data-task-plugin-id="activePlugin.plugin_id"
      :title="activePlugin.name"
      frameborder="0"
      allowfullscreen
      referrerpolicy="same-origin"
      ref="pluginFrame"
      @load="sendPreferences"
    ></iframe>
    <div v-else class="task-detail-plugin-unavailable" role="status">
      {{ $t('main.loading_error') }}
    </div>
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { computed, nextTick, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { buildTaskPluginUrl } from '@/components/sides/taskPluginContext'
import { sendTaskPluginPreferences } from '@/components/sides/taskPluginPreferences'
import { nextTaskPluginTabIndex } from '@/components/sides/taskPluginTabs'

const props = defineProps({
  entityType: { type: String, default: 'Asset' },
  task: { type: Object, default: null }
})

const store = useStore()
const activePluginId = ref('')
const pluginFrame = ref(null)
const taskPlugins = computed(() => store.getters.taskPlugins || [])
const activePlugin = computed(() =>
  taskPlugins.value.find(plugin => plugin.plugin_id === activePluginId.value)
)
const locale = computed(() => store.state.user.user?.locale || 'en')
const darkTheme = computed(() => Boolean(store.getters.isDarkTheme))
const pluginUrl = computed(() =>
  buildTaskPluginUrl(activePlugin.value, props.task, {
    entityType: props.entityType
  })
)

function sendPreferences() {
  const frame = pluginFrame.value
  const plugin = activePlugin.value
  const url = pluginUrl.value
  if (!plugin?.plugin_id) return
  sendTaskPluginPreferences({
    frame,
    pluginId: plugin.plugin_id,
    url,
    locale: locale.value,
    darkTheme: darkTheme.value
  })
}

function onPluginTabKeydown(event, index) {
  const nextIndex = nextTaskPluginTabIndex(
    index,
    taskPlugins.value.length + 1,
    event.key
  )
  if (nextIndex === null) return
  event.preventDefault()
  const tablist = event.currentTarget?.closest('[role="tablist"]')
  activePluginId.value =
    nextIndex === 0 ? '' : taskPlugins.value[nextIndex - 1]?.plugin_id || ''
  nextTick(() => {
    tablist?.querySelectorAll('[role="tab"]')[nextIndex]?.focus()
  })
}

watch(
  () => [props.task?.id, props.task?.project_id],
  () => {
    activePluginId.value = ''
  }
)
watch(taskPlugins, plugins => {
  if (!plugins.some(plugin => plugin.plugin_id === activePluginId.value)) {
    activePluginId.value = ''
  }
})
watch(
  () => [
    locale.value,
    darkTheme.value,
    activePluginId.value,
    props.task?.id,
    props.task?.project_id
  ],
  async () => {
    await nextTick()
    sendPreferences()
  },
  { flush: 'post' }
)
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
  height: min(72vh, 760px);
  min-height: 360px;
  max-height: 80vh;
  border: 0;
  background: var(--background-page);
}

@media (max-height: 560px) {
  .task-detail-plugin-frame {
    height: calc(100vh - 170px);
    min-height: 300px;
  }
}

.task-detail-plugin-unavailable {
  padding: 1em;
  color: var(--text-alt);
}
</style>
