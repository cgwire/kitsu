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
              class="button flexrow-item invite-button"
              :class="{ active: openInviteToken === link.token }"
              :title="$t('playlists.share_modal.invite')"
              @click="toggleInvite(link.token)"
            >
              <send-icon :size="16" />
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
          <div class="invite-section" v-if="openInviteToken === link.token">
            <label class="label">
              {{ $t('playlists.share_modal.invite_recipients') }}
            </label>
            <multiselect
              class="invite-multiselect"
              :allow-empty="true"
              :hide-selected="false"
              :internal-search="true"
              :multiple="true"
              :options="recipientOptions"
              :placeholder="$t('playlists.share_modal.invite_placeholder')"
              :show-labels="false"
              :show-no-options="false"
              :show-no-results="false"
              :tag-placeholder="$t('playlists.share_modal.invite_add_email')"
              :taggable="true"
              label="label"
              track-by="id"
              @tag="onAddFreeEmail(link.token, $event)"
              v-model="inviteState[link.token].selected"
            />
            <label class="label mt1">
              {{ $t('playlists.share_modal.invite_message_label') }}
            </label>
            <textarea
              class="textarea"
              rows="3"
              :placeholder="
                $t('playlists.share_modal.invite_message_placeholder')
              "
              v-model="inviteState[link.token].message"
            ></textarea>
            <div class="invite-actions flexrow">
              <p
                class="invite-feedback flexrow-item filler"
                :class="{
                  success: inviteState[link.token].success,
                  error: inviteState[link.token].error
                }"
              >
                {{ inviteState[link.token].feedback }}
              </p>
              <button-simple
                class="flexrow-item"
                :is-loading="inviteState[link.token].loading"
                :is-disabled="!hasRecipients(link.token)"
                :text="$t('playlists.share_modal.invite_send')"
                @click="sendInvite(link.token)"
              />
            </div>
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
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { CopyIcon, SendIcon, XIcon } from 'lucide-vue-next'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import DateField from '@/components/widgets/DateField.vue'

import playlistsApi from '@/store/api/playlists'

const { t } = useI18n()
const store = useStore()

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

const openInviteToken = ref(null)
const inviteState = reactive({})

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const currentProduction = computed(() => store.getters.currentProduction)
const personMap = computed(() => store.getters.personMap)

const recipientOptions = computed(() => {
  const team = currentProduction.value?.team || []
  return team
    .map(personId => personMap.value.get(personId))
    .filter(person => person?.role === 'client' && person.email)
    .map(person => ({
      id: person.id,
      type: 'person',
      email: person.email,
      label: `${person.full_name} <${person.email}>`
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
})

const ensureInviteState = token => {
  if (!inviteState[token]) {
    inviteState[token] = {
      selected: [],
      message: '',
      loading: false,
      success: false,
      error: false,
      feedback: ''
    }
  }
}

const toggleInvite = token => {
  ensureInviteState(token)
  openInviteToken.value = openInviteToken.value === token ? null : token
}

const hasRecipients = token => {
  ensureInviteState(token)
  return inviteState[token].selected.length > 0
}

const onAddFreeEmail = (token, raw) => {
  ensureInviteState(token)
  const email = (raw || '').trim()
  if (!email) return
  if (!EMAIL_REGEX.test(email)) {
    inviteState[token].feedback = t(
      'playlists.share_modal.invite_invalid_email'
    )
    inviteState[token].error = true
    inviteState[token].success = false
    return
  }
  const exists = inviteState[token].selected.some(
    item =>
      item.type === 'email' && item.email.toLowerCase() === email.toLowerCase()
  )
  if (exists) return
  inviteState[token].selected.push({
    id: `email:${email}`,
    type: 'email',
    email,
    label: email
  })
  inviteState[token].feedback = ''
  inviteState[token].error = false
}

const sendInvite = async token => {
  ensureInviteState(token)
  const state = inviteState[token]
  const data = {
    emails: state.selected
      .filter(item => item.type === 'email')
      .map(item => item.email),
    person_ids: state.selected
      .filter(item => item.type === 'person')
      .map(item => item.id),
    message: state.message?.trim() || null
  }
  state.loading = true
  state.error = false
  state.success = false
  state.feedback = ''
  try {
    const response = await playlistsApi.sendShareInvitations(
      props.playlist.id,
      token,
      data
    )
    state.success = true
    state.feedback = t('playlists.share_modal.invite_sent', {
      count: response?.sent?.length || 0
    })
    state.selected = []
    state.message = ''
  } catch (err) {
    state.error = true
    state.feedback =
      err?.body?.error ||
      err?.message ||
      t('playlists.share_modal.invite_error')
  }
  state.loading = false
}

const buildShareUrl = token => {
  return `${window.location.origin}/playlists/shared/${token}`
}

const loadLinks = async () => {
  try {
    const links = await playlistsApi.getShareLinks(props.playlist.id)
    shareLinks.value = links
    links.forEach(link => ensureInviteState(link.token))
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

  .copy-button,
  .invite-button {
    flex: 0 0 auto;
    border-radius: 10px;
    margin-left: -1px;
  }

  .invite-button {
    margin-left: 0.5em;

    &.active {
      background: var(--background-selectable);
    }
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

.invite-section {
  background: var(--background-alt);
  border: 1px solid var(--border);
  border-radius: 10px;
  margin-top: 0.6em;
  padding: 0.8em;

  .label {
    color: var(--text);
    font-weight: 600;
    margin-bottom: 0.4em;
  }

  .label.mt1 {
    margin-top: 0.8em;
  }

  .textarea {
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    font-family: inherit;
    font-size: 0.9em;
    padding: 0.5em 0.7em;
    resize: vertical;
    width: 100%;
  }
}

.invite-multiselect {
  font-size: 0.9em;

  // Theme the chips, the "Add this email" hint and the option hover with
  // Kitsu's selectable accent so the picker matches the rest of the UI
  // rather than vue-multiselect's default red/orange.
  :deep(.multiselect__tag) {
    background: var(--background-selectable);
    color: var(--text);
  }

  :deep(.multiselect__tag-icon) {
    background: transparent;

    &::after {
      color: var(--text);
    }

    &:focus,
    &:hover {
      background: rgba(0, 0, 0, 0.1);

      &::after {
        color: var(--text);
      }
    }
  }

  :deep(.multiselect__option--highlight) {
    background: var(--background-selectable);
    color: var(--text);
  }

  :deep(.multiselect__option--highlight::after) {
    background: var(--background-selectable);
    color: var(--text);
  }
}

.invite-actions {
  align-items: center;
  gap: 0.6em;
  margin-top: 0.7em;
}

.invite-feedback {
  color: var(--text-alt);
  font-size: 0.85em;
  margin: 0;

  &.success {
    color: $green;
  }

  &.error {
    color: $red;
  }
}

.error {
  color: $red;
}
</style>
