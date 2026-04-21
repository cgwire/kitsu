<template>
  <base-modal
    :active="active"
    :title="$t('playlists.share_modal.title')"
    @cancel="$emit('cancel')"
  >
    <div class="share-content">
      <p class="description">
        {{ $t('playlists.share_modal.description') }}
      </p>
      <div v-if="shareLinks.length > 0" class="existing-links">
        <h3 class="subtitle">
          {{ $t('playlists.share_modal.active_links') }}
        </h3>
        <div class="share-link-item" v-for="link in shareLinks" :key="link.id">
          <div class="share-link-row flexrow">
            <input
              class="input flexrow-item"
              :value="buildShareUrl(link.token)"
              readonly
              @click="$event.target.select()"
            />
            <button
              class="button flexrow-item copy-button"
              :title="$t('playlists.share_modal.copy')"
              @click="copyLink(link.token)"
            >
              <copy-icon :size="16" />
            </button>
            <button
              class="button flexrow-item revoke-button"
              :title="$t('playlists.share_modal.revoke')"
              @click="revokeLink(link.token)"
            >
              <x-icon :size="16" />
            </button>
          </div>
          <div class="share-link-info">
            <span class="info-tag" v-if="link.expiration_date">
              {{ $t('playlists.share_modal.expires') }}
              {{ formatDate(link.expiration_date) }}
            </span>
            <span class="info-tag" v-else>
              {{ $t('playlists.share_modal.no_expiration') }}
            </span>
            <span class="info-tag" :class="{ disabled: !link.can_comment }">
              {{
                link.can_comment
                  ? $t('playlists.share_modal.comments_enabled')
                  : $t('playlists.share_modal.comments_disabled')
              }}
            </span>
          </div>
        </div>
      </div>

      <div class="create-section">
        <h3 class="subtitle" v-if="shareLinks.length > 0">
          {{ $t('playlists.share_modal.create_new') }}
        </h3>
        <div class="field">
          <label class="label">
            {{ $t('playlists.share_modal.expiration') }}
          </label>
          <date-field :can-delete="true" v-model="expirationDate" />
        </div>
        <div class="field">
          <combobox-boolean
            :label="$t('playlists.share_modal.can_comment')"
            v-model="canComment"
          />
        </div>
      </div>

      <modal-footer
        :confirm-label="$t('playlists.share_modal.generate')"
        :cancel-label="$t('main.close')"
        :is-loading="loading.create"
        :is-error="errors.create"
        :error-text="$t('playlists.share_modal.error')"
        @confirm="createLink"
        @cancel="$emit('cancel')"
      />
    </div>
  </base-modal>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'

import { CopyIcon, XIcon } from 'lucide-vue-next'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import DateField from '@/components/widgets/DateField.vue'

import playlistsApi from '@/store/api/playlists'

const props = defineProps({
  active: { type: Boolean, default: false },
  playlist: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['cancel', 'links-updated'])

const shareLinks = ref([])
const expirationDate = ref(null)
const canComment = ref('true')
const loading = reactive({ create: false })
const errors = reactive({ create: false })

const buildShareUrl = token => {
  return `${window.location.origin}/playlists/shared/${token}`
}

const loadLinks = async () => {
  try {
    const links = await playlistsApi.getShareLinks(props.playlist.id)
    shareLinks.value = links
    emit('links-updated', links.length)
  } catch (err) {
    console.error(err)
  }
}

const createLink = async () => {
  loading.create = true
  errors.create = false
  try {
    let expDate
    if (expirationDate.value) {
      const d = new Date(expirationDate.value)
      expDate = d.toISOString().slice(0, 10)
    }
    await playlistsApi.createShareLink(props.playlist.id, {
      expiration_date: expDate,
      can_comment: canComment.value === 'true'
    })
    await loadLinks()
  } catch (err) {
    console.error(err)
    errors.create = true
  }
  loading.create = false
}

const revokeLink = async token => {
  try {
    await playlistsApi.revokeShareLink(props.playlist.id, token)
    await loadLinks()
  } catch (err) {
    console.error(err)
  }
}

const copyLink = token => {
  navigator.clipboard.writeText(buildShareUrl(token))
}

const formatDate = dateStr => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString()
}

onMounted(() => {
  loadLinks()
})
</script>

<style lang="scss" scoped>
:deep(h1.title) {
  margin-bottom: 0em !important;
}

.share-content {
  min-width: 500px;
}

.description {
  color: var(--text-alt);
  font-size: 1em;
  margin-bottom: 1.5em;
  line-height: 1.5;
}

.subtitle {
  color: var(--text);
  font-size: 1em;
  font-weight: bold;
  margin-bottom: 0.5em;
  border-bottom: none;
}

.existing-links {
  margin-bottom: 2em;
}

.share-link-item {
  margin-bottom: 1em;
}

.share-link-row {
  gap: 0;

  .input {
    font-size: 0.85em;
    background: var(--background-alt);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 10px;
    cursor: text;
    padding-left: 1em;
  }

  .copy-button {
    flex: 0 0 auto;
    border-radius: 10px;
    margin-left: -1px;
  }

  .revoke-button {
    flex: 0 0 auto;
    margin-left: 0.5em;
    opacity: 0;
    transition: opacity 0.15s;
  }

  &:hover .revoke-button {
    opacity: 1;
  }
}

.create-section {
  .subtitle {
    margin-bottom: 1em;
  }

  .field {
    margin-bottom: 1em;
  }
}

.share-link-info {
  display: flex;
  gap: 0.5em;
  margin-top: 0.3em;
}

.info-tag {
  font-size: 0.8em;
  color: var(--text-alt);
  background: var(--background-alt);
  padding: 0.15em 0.5em;
  border-radius: 4px;

  &.disabled {
    opacity: 0.6;
  }
}

.error {
  color: $red;
}
</style>
