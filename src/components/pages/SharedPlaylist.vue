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
      <div class="identity-card">
        <div class="identity-header">
          <img class="kitsu-logo" src="@/assets/kitsu.png" alt="Kitsu" />
          <h1 class="title">{{ playlistName }}</h1>
          <p class="description">
            {{ $t('share.identity_description') }}
          </p>
        </div>
        <form class="identity-form" @submit.prevent="submitIdentity">
          <text-field
            ref="nameField"
            :label="$t('share.your_name')"
            :placeholder="$t('share.name_placeholder')"
            v-model.trim="guestName"
            required
          />
          <div class="has-text-centered mt2">
            <button
              class="button is-primary"
              type="submit"
              :disabled="!guestName"
            >
              {{ $t('share.enter_review') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="player-container" v-else>
      <shared-playlist-player
        :playlist="playlist"
        :entities="playlistEntities"
        :loading="loadingPlayer"
        :token="token"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import SharedPlaylistPlayer from '@/components/previews/SharedPlaylistPlayer.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import TextField from '@/components/widgets/TextField.vue'

const GUEST_STORAGE_PREFIX = 'shared-playlist-guest-'

const { t } = useI18n()
const route = useRoute()

const nameField = useTemplateRef('nameField')

const loading = ref(true)
const loadingPlayer = ref(false)
const error = ref(false)
const shareLink = ref(null)
const playlist = ref(null)
const playlistEntities = ref([])
const guestId = ref(null)
const guestName = ref('')

const token = computed(() => route.params.token)

const playlistName = computed(
  () => playlist.value?.name || t('share.review_session')
)

const needsIdentity = computed(
  () => shareLink.value?.can_comment && !guestId.value
)

const loadSharedPlaylist = async () => {
  loading.value = true
  error.value = false
  try {
    const response = await fetch(`/api/shared/playlists/${token.value}`)
    if (!response.ok) throw new Error('Invalid token')
    const data = await response.json()
    playlist.value = data
    playlistEntities.value = data.shots || []

    // Fetch share link metadata
    shareLink.value = { can_comment: true }

    // Check localStorage for existing guest
    const storedGuestId = localStorage.getItem(
      GUEST_STORAGE_PREFIX + token.value
    )
    if (storedGuestId) {
      try {
        const guestResponse = await fetch(
          `/api/shared/playlists/${token.value}/guest`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guest_id: storedGuestId })
          }
        )
        if (guestResponse.ok) {
          const guest = await guestResponse.json()
          guestId.value = guest.id
        }
      } catch {
        // Guest not found, will ask for identity
      }
    }
  } catch {
    error.value = true
  }
  loading.value = false
}

const submitIdentity = async () => {
  if (!guestName.value) return
  loading.value = true
  try {
    const response = await fetch(`/api/shared/playlists/${token.value}/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: guestName.value
      })
    })
    if (!response.ok) throw new Error('Failed to create guest')
    const guest = await response.json()
    guestId.value = guest.id
    localStorage.setItem(GUEST_STORAGE_PREFIX + token.value, guest.id)
  } catch {
    error.value = true
  }
  loading.value = false
}

onMounted(() => {
  loadSharedPlaylist()
})
</script>

<style lang="scss" scoped>
.shared-playlist {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--background);
  color: var(--text);
}

.shared-content {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 100vh;
}

.identity-card {
  background: var(--background-alt);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2.5em;
  max-width: 420px;
  width: 100%;
  text-align: center;
}

.identity-header {
  margin-bottom: 2em;
}

.kitsu-logo {
  width: 60px;
  margin-bottom: 1em;
}

.title {
  color: var(--text);
  font-size: 1.4em;
  font-weight: 700;
  margin-bottom: 0.5em;
}

.description {
  color: var(--text-alt);
  font-size: 0.95em;
  line-height: 1.5;
}

.identity-form {
  text-align: left;

  .button.is-primary {
    border-radius: 10px;
  }
}

.error-card {
  background: var(--background-alt);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2.5em;
  max-width: 420px;
  width: 100%;
  text-align: center;

  p {
    color: var(--text-alt);
    margin-top: 0.5em;
  }
}

.player-container {
  width: 100%;
  height: 100vh;
}
</style>
