<template>
  <div class="production-clients">
    <div class="box section preview">
      <div class="preview-header">
        <h2 class="subtitle">{{ $t('productions.clients.preview_title') }}</h2>
        <span
          class="state-tag"
          :class="{ 'is-open': isOpen }"
          v-if="isEnabled && account"
        >
          {{
            isOpen
              ? $t('productions.clients.open_until', { time: openUntil })
              : $t('productions.clients.blocked')
          }}
        </span>
      </div>
      <p v-if="!isEnabled" class="unavailable">
        {{ $t('productions.clients.unavailable') }}
      </p>
      <template v-else>
        <p class="description">{{ $t('productions.clients.description') }}</p>

        <button-simple
          class="create-button"
          :is-primary="true"
          :is-loading="isWorking"
          :text="$t('productions.clients.create')"
          @click="create"
          v-if="isLoaded && !account && !hasError"
        />
        <div class="account" v-else-if="account">
          <div class="credentials">
            <div class="credential-row">
              <text-field
                class="email"
                :label="$t('people.fields.email')"
                :model-value="account.email"
                :readonly="true"
              />
              <button
                class="button copy-button copy-email"
                :title="$t('productions.clients.copy')"
                @click="copy(account.email)"
              >
                <copy-icon :size="16" />
              </button>
            </div>

            <template v-if="password">
              <div class="credential-row">
                <text-field
                  class="password-value"
                  :label="$t('productions.clients.password')"
                  :model-value="password"
                  :readonly="true"
                />
                <button
                  class="button copy-button copy-password"
                  :title="$t('productions.clients.copy')"
                  @click="copy(password)"
                >
                  <copy-icon :size="16" />
                </button>
              </div>
              <p class="hint">{{ $t('productions.clients.password_hint') }}</p>
            </template>
          </div>

          <div class="actions">
            <div class="action-group">
              <button-simple
                class="open-button"
                :is-primary="true"
                :disabled="isWorking"
                :text="$t('productions.clients.open_for_hour')"
                @click="setOpen(true)"
              />
              <button-simple
                class="block-button"
                :disabled="isWorking"
                :text="$t('productions.clients.block')"
                @click="setOpen(false)"
                v-if="isOpen"
              />
            </div>
            <div class="action-group">
              <button-simple
                class="regenerate-button"
                :disabled="isWorking"
                :text="$t('productions.clients.regenerate')"
                @click="create"
              />
              <button-simple
                class="delete-button"
                :disabled="isWorking"
                :text="$t('productions.clients.delete')"
                @click="isDeleteModalActive = true"
              />
            </div>
          </div>
        </div>

        <p v-if="hasError && !isDeleteModalActive" class="error">
          {{ $t('productions.clients.error') }}
        </p>
      </template>
    </div>

    <p v-if="saveError" class="error save-error">
      {{ $t('productions.clients.save_error') }}
    </p>

    <client-access-settings
      :key="checkboxKey"
      :settings="currentProduction ?? {}"
      :task-types="clientTaskTypes"
      :task-statuses="clientTaskStatuses"
      :is-saving="isSaving"
      @update-setting="setAccess"
      @set-task-type-visible="setTaskTypeVisible"
      @set-status-client-allowed="setStatusClientAllowed"
    />

    <div class="box section metadata">
      <h2 class="subtitle">{{ $t('productions.clients.metadata_title') }}</h2>
      <p class="description">
        {{ $t('productions.clients.metadata_description') }}
      </p>
      <p class="empty" v-if="!descriptors.length">
        {{ $t('productions.clients.metadata_empty') }}
      </p>
      <div
        class="descriptor"
        v-for="descriptor in descriptors"
        :key="descriptor.id"
      >
        <checkbox
          :key="`${descriptor.id}-${checkboxKey}`"
          :toggle="true"
          :label="getDescriptorLabel(descriptor)"
          :model-value="!!descriptor.for_client"
          @change="value => setForClient(descriptor, value)"
        />
      </div>
    </div>

    <div class="box section team-clients">
      <h2 class="subtitle">{{ $t('productions.clients.team_title') }}</h2>
      <p class="description">
        {{ $t('productions.clients.team_description') }}
      </p>
      <p class="empty" v-if="!teamClients.length">
        {{ $t('productions.clients.team_empty') }}
      </p>
      <ul class="client-list" v-else>
        <li class="team-client" v-for="person in teamClients" :key="person.id">
          <people-avatar :font-size="14" :person="person" :size="30" />
          <people-name :person="person" :with-link="true" />
        </li>
      </ul>
    </div>

    <confirm-modal
      :active="isDeleteModalActive"
      :is-danger="true"
      :is-error="hasError"
      :error-text="$t('productions.clients.error')"
      :is-loading="isWorking"
      :text="$t('productions.clients.delete_confirm')"
      @cancel="isDeleteModalActive = false"
      @confirm="remove"
    />
  </div>
</template>

<script setup>
import { CopyIcon } from 'lucide-vue-next'
import moment from 'moment-timezone'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { useTime } from '@/composables/time'
import { sortTaskStatuses, sortTaskTypes } from '@/lib/sorting'
import { parseDate } from '@/lib/time'

import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import ClientAccessSettings from '@/components/pages/production/ClientAccessSettings.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Checkbox from '@/components/widgets/Checkbox.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'
import TextField from '@/components/widgets/TextField.vue'

// Composables
// --------------------------------------------------------------------------
const store = useStore()
const { formatTime } = useTime()

// State
// --------------------------------------------------------------------------
const account = ref(null)
const hasError = ref(false)
const isDeleteModalActive = ref(false)
const isLoaded = ref(false)
const isSaving = ref(false)
const isWorking = ref(false)
const password = ref('')
const saveError = ref(false)
// Bumped on a failed save to reset the checkbox DOM state to the store value
const checkboxKey = ref(0)
// Ticked every minute so the open state flips once the window expires
const now = ref(moment())
let clock = null

// Computed
// --------------------------------------------------------------------------
const currentProduction = computed(() => store.getters.currentProduction)
const isEnabled = computed(
  () => store.getters.mainConfig?.preview_accounts_enabled === true
)
const productionId = computed(() => currentProduction.value?.id)
const personMap = computed(() => store.getters.personMap)
const productionTaskStatuses = computed(
  () => store.getters.productionTaskStatuses ?? []
)
const teamRoles = computed(() => store.getters.productionTeamRoles ?? {})

const sortedTaskTypes = computed(() =>
  sortTaskTypes(
    store.getters.productionTaskTypes ?? [],
    currentProduction.value
  )
)

const clientTaskTypes = computed(() =>
  sortedTaskTypes.value.map(taskType => ({
    ...taskType,
    is_client_visible:
      currentProduction.value?.task_type_links?.[taskType.id]?.is_client_visible
  }))
)

const clientTaskStatuses = computed(() =>
  sortTaskStatuses(
    [...productionTaskStatuses.value],
    currentProduction.value
  ).map(status => ({
    ...status,
    link_is_client_allowed:
      currentProduction.value?.task_statuses_link?.[status.id]
        ?.is_client_allowed
  }))
)

const descriptors = computed(() =>
  [
    'assetMetadataDescriptors',
    'shotMetadataDescriptors',
    'sequenceMetadataDescriptors',
    'episodeMetadataDescriptors',
    'editMetadataDescriptors'
  ].flatMap(getter => store.getters[getter] ?? [])
)

// The preview account is in the team but hidden from personMap
const teamClients = computed(() =>
  (currentProduction.value?.team ?? [])
    .map(personId => personMap.value?.get(personId))
    .filter(
      person =>
        person && (teamRoles.value[person.id] || person.role) === 'client'
    )
    .sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''))
)

// preview_open_until is a naive UTC string
const openUntilDate = computed(() =>
  account.value?.preview_open_until
    ? parseDate(account.value.preview_open_until)
    : null
)
const isOpen = computed(
  () => !!openUntilDate.value && openUntilDate.value.isAfter(now.value)
)
const openUntil = computed(() =>
  account.value?.preview_open_until
    ? formatTime(account.value.preview_open_until)
    : ''
)

// Functions
// --------------------------------------------------------------------------
// The password lives only in this component: any other action or a remount
// drops it, as zou never returns it again.
const run = async (action, { keepPassword = false } = {}) => {
  isWorking.value = true
  hasError.value = false
  try {
    const result = await action()
    if (!keepPassword) password.value = ''
    account.value = await store.dispatch(
      'getPreviewAccount',
      productionId.value
    )
    return result
  } catch (err) {
    console.error(err)
    hasError.value = true
  } finally {
    isWorking.value = false
  }
}

const create = async () => {
  const created = await run(
    () => store.dispatch('createPreviewAccount', productionId.value),
    { keepPassword: true }
  )
  if (created?.password) password.value = created.password
}

const setOpen = isOpenValue =>
  run(() =>
    store.dispatch('setPreviewAccountOpen', {
      productionId: productionId.value,
      isOpen: isOpenValue
    })
  )

const remove = async () => {
  await run(() => store.dispatch('deletePreviewAccount', productionId.value))
  if (!hasError.value) isDeleteModalActive.value = false
}

const copy = async text => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error(err)
  }
}

const save = async action => {
  isSaving.value = true
  saveError.value = false
  try {
    await action()
  } catch (err) {
    console.error(err)
    saveError.value = true
    checkboxKey.value++
  } finally {
    isSaving.value = false
  }
}

const setAccess = (flag, value) =>
  save(() =>
    store.dispatch('editProduction', { id: productionId.value, [flag]: value })
  )

const setTaskTypeVisible = (taskTypeId, value) =>
  save(() =>
    store.dispatch('setTaskTypeClientVisibility', {
      taskTypeId,
      isClientVisible: value
    })
  )

// ClientAccessSettings sends null when the value goes back to the studio one
const setStatusClientAllowed = (taskStatusId, isClientAllowed) =>
  save(() =>
    store.dispatch('setTaskStatusClientAllowed', {
      taskStatusId,
      isClientAllowed
    })
  )

const getDescriptorLabel = descriptor =>
  `${descriptor.name} (${descriptor.entity_type})`

// zou's update schema resets the fields missing from the payload
const setForClient = (descriptor, value) =>
  save(() =>
    store.dispatch('addMetadataDescriptor', {
      ...descriptor,
      values: descriptor.choices,
      for_client: value
    })
  )

const loadAccount = async () => {
  try {
    account.value = await store.dispatch(
      'getPreviewAccount',
      productionId.value
    )
  } catch (err) {
    console.error(err)
    hasError.value = true
  }
}

const load = async () => {
  password.value = ''
  account.value = null
  isLoaded.value = false
  if (!productionId.value) return
  store.dispatch('loadProductionTeam').catch(console.error)
  if (isEnabled.value) await loadAccount()
  isLoaded.value = true
}

// Watchers
// --------------------------------------------------------------------------
watch(productionId, load)

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  load()
  clock = setInterval(() => {
    now.value = moment()
  }, 60 * 1000)
})

onBeforeUnmount(() => clearInterval(clock))
</script>

<style lang="scss" scoped>
.description,
.unavailable {
  color: var(--text-alt);
  margin-bottom: 1em;
}

.preview-header {
  align-items: center;
  display: flex;
  gap: 1em;
  justify-content: space-between;
  margin-bottom: 1.5em;

  .subtitle {
    border-bottom: 0;
    margin: 0;
  }
}

.state-tag {
  background: var(--background-alt);
  border-radius: 1em;
  color: var(--text-alt);
  font-size: 0.85em;
  padding: 0.2em 0.8em;
  white-space: nowrap;

  &.is-open {
    background: $green;
    color: $white;
  }
}

.credentials {
  margin-bottom: 1.5em;

  .credential-row {
    align-items: flex-end;
    display: flex;
    gap: 0.5em;
    margin-bottom: 1em;

    .field {
      flex: 1 1 auto;
      margin-bottom: 0;
    }
  }

  // Matches the 3em height of the Kitsu text inputs
  .copy-button {
    align-items: center;
    border-radius: 8px;
    display: inline-flex;
    flex: 0 0 3em;
    height: 3em;
    justify-content: center;
    margin: 0;
  }

  .hint {
    color: var(--text-alt);
    font-size: 0.9em;
    margin-top: -0.5em;
  }
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
  justify-content: space-between;
}

.action-group {
  display: flex;
  gap: 0.5em;
}

.client-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.team-client {
  align-items: center;
  display: flex;
  gap: 0.5em;
  margin-bottom: 0.8em;
}

.hint {
  color: var(--text-alt);
  font-size: 0.9em;
  margin: 0.3em 0 0;
}

// Every toggle line of the tab shares one height and one spacing
.descriptor {
  align-items: center;
  display: flex;
  margin: 0 0 0.4em;
  min-height: 2.5em;

  // The field and tag margins break the vertical centring
  > * {
    margin-bottom: 0;
    margin-top: 0;
  }
}

.empty {
  color: var(--text-alt);
}

.error {
  margin: 0 0 1em;
}

.preview .error {
  margin: 1em 0 0;
}
</style>
