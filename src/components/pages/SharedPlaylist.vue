<template>
  <div class="shared-playlist">
    <div class="shared-content" v-if="error">
      <div class="error-card">
        <h1 class="title">{{ $t('share.error_title') }}</h1>
        <p>{{ $t('share.error_text') }}</p>
      </div>
    </div>

    <div class="shared-content" v-else-if="loading">
      <spinner />
    </div>

    <div class="shared-content" v-else-if="needsIdentity">
      <shared-playlist-identity-card
        v-model:guest-name="guestName"
        :error-message="identityError"
        :playlist-name="playlistName"
        @submit="submitIdentity"
      />
    </div>

    <div class="player-container" v-else>
      <shared-playlist-player
        :playlist="playlist"
        :entities="playlistEntities"
        :loading="loadingPlayer"
        :token="token"
        :guest-id="guestId || ''"
        :can-comment="shareLink?.can_comment || false"
        @logout="logoutGuest"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import {
  TOGGLE_DARK_THEME,
  USER_LOGIN,
  USER_LOGOUT
} from '@/store/mutation-types'

import crisp from '@/lib/crisp'

import SharedPlaylistIdentityCard from '@/components/pages/SharedPlaylistIdentityCard.vue'
import SharedPlaylistPlayer from '@/components/previews/SharedPlaylistPlayer.vue'
import Spinner from '@/components/widgets/Spinner.vue'

const GUEST_STORAGE_PREFIX = 'shared-playlist-guest-'

const { t } = useI18n()
const route = useRoute()
const store = useStore()

const loading = ref(true)
const loadingPlayer = ref(false)
const error = ref(false)
const shareLink = ref(null)
const playlist = ref(null)
const playlistEntities = ref([])
const guestId = ref(null)
const guestName = ref('')
const identityError = ref('')

const token = computed(() => route.params.token)

const playlistName = computed(
  () => playlist.value?.name || t('share.review_session')
)

const needsIdentity = computed(
  () => shareLink.value?.can_comment && !guestId.value
)

watch(guestName, () => {
  identityError.value = ''
})

const loginAsGuest = guest => {
  if (!guest) return
  store.commit(USER_LOGIN, {
    id: guest.id,
    first_name: guest.first_name || 'Guest',
    last_name: guest.last_name || '',
    email: guest.email || '',
    role: 'client',
    is_guest: true,
    has_avatar: false,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  })
}

const restoreStoredGuest = async () => {
  const storedGuestId = localStorage.getItem(GUEST_STORAGE_PREFIX + token.value)
  if (!storedGuestId) return
  try {
    const guest = await store.dispatch('postSharedPlaylistGuest', {
      shareToken: token.value,
      data: { guest_id: storedGuestId }
    })
    guestId.value = guest.id
    // If the server replaced the stored guest (e.g. it was created from
    // another share link before the per-link binding rollout), persist
    // the new id so subsequent reloads don't loop through the fallback.
    if (guest.id !== storedGuestId) {
      localStorage.setItem(GUEST_STORAGE_PREFIX + token.value, guest.id)
    }
    loginAsGuest(guest)
  } catch {
    // Guest not found, will ask for identity
  }
}

const loadSharedPlaylist = async () => {
  loading.value = true
  error.value = false
  try {
    const data = await store.dispatch('loadSharedPlaylist', token.value)
    playlist.value = data
    playlistEntities.value = data.shots || []
    await store.dispatch('loadSharedPlaylistContext', token.value)
    shareLink.value = { can_comment: true }
    await restoreStoredGuest()
  } catch {
    error.value = true
  }
  loading.value = false
}

const submitIdentity = async () => {
  if (!guestName.value) return
  identityError.value = ''
  loading.value = true
  try {
    const guest = await store.dispatch('postSharedPlaylistGuest', {
      shareToken: token.value,
      data: { first_name: guestName.value }
    })
    guestId.value = guest.id
    localStorage.setItem(GUEST_STORAGE_PREFIX + token.value, guest.id)
    loginAsGuest(guest)
  } catch (err) {
    identityError.value = err?.message || t('share.guest_error')
  }
  loading.value = false
}

const logoutGuest = () => {
  localStorage.removeItem(GUEST_STORAGE_PREFIX + token.value)
  guestId.value = null
  guestName.value = ''
  store.commit(USER_LOGOUT)
}

onMounted(() => {
  store.commit(TOGGLE_DARK_THEME, true)
  crisp.setChatVisibility(false)
  loadSharedPlaylist()
})

onBeforeUnmount(() => {
  crisp.setChatVisibility(true)
})
</script>

<style lang="scss" scoped>
.error-card {
  backdrop-filter: blur(20px);
  background: rgba(29, 29, 38, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  max-width: 420px;
  padding: 2.5em;
  text-align: center;
  width: 100%;

  p {
    color: rgba(244, 245, 250, 0.6);
    margin-top: 0.5em;
  }

  .title {
    color: #f4f5fa;
  }
}

.player-container {
  height: 100%;
  min-height: 0;
  width: 100%;
}

.shared-content {
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
}

.shared-playlist {
  align-items: stretch;
  background:
    radial-gradient(
      80% 80% at 15% 0%,
      rgba(124, 92, 255, 0.18) 0%,
      transparent 55%
    ),
    radial-gradient(
      70% 70% at 85% 100%,
      rgba(255, 120, 180, 0.12) 0%,
      transparent 55%
    ),
    #14141a;
  color: #f4f5fa;
  display: flex;
  height: 100vh;
  height: 100dvh;
  justify-content: center;
  overflow: hidden;
}
</style>
