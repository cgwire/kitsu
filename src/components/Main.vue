<template>
  <XyzTransition appear xyz="fade">
    <div class="main">
      <a class="skip-link" href="#main-content">{{
        $t('main.skip_to_content')
      }}</a>
      <topbar />
      <sidebar />
      <div v-if="isPreviewAccount" class="preview-banner" role="status">
        {{ $t('main.preview_account_banner') }}
      </div>
      <main id="main-content">
        <router-view />
      </main>
    </div>
  </XyzTransition>
</template>

<script setup>
import { computed, getCurrentInstance, onBeforeUnmount, onMounted } from 'vue'
import { useStore } from 'vuex'

import Sidebar from '@/components/sides/Sidebar.vue'
import Topbar from '@/components/tops/Topbar.vue'

// Composables
// --------------------------------------------------------------------------

const store = useStore()
const isPreviewAccount = computed(
  () => !!store.getters.user?.preview_project_id
)
const socket = getCurrentInstance().appContext.config.globalProperties.$socket

// Lifecycle
// --------------------------------------------------------------------------

let playlistPlayerTimer = null

onMounted(() => {
  socket.connect()
  // Pages load the playlist player when a playlist opens, but a deploy
  // removes its chunks from under an open tab: fetch it once the first page
  // had time to show. Not offline: Chromium keeps a failed import failed
  // until the page reloads.
  playlistPlayerTimer = setTimeout(() => {
    if (navigator.onLine) {
      import('@/components/modals/ViewPlaylistModal.vue').catch(() => {})
    }
  }, 5000)
})

onBeforeUnmount(() => {
  clearTimeout(playlistPlayerTimer)
})
</script>

<style>
.main {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-banner {
  position: fixed;
  bottom: 1em;
  left: 1em;
  z-index: 300;
  padding: 0.4em 1em;
  border-radius: 1em;
  background: var(--background-selected);
  color: var(--text-strong);
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
  pointer-events: none;
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  z-index: 100;
  padding: 0.5em 1em;
  background: var(--background);
  color: var(--text);
}

.skip-link:focus {
  top: 0;
}
</style>
