<template>
  <div class="production-clients">
    <div class="box section preview">
      <h2 class="subtitle">{{ $t('productions.clients.preview_title') }}</h2>
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
          v-if="isLoaded && !account"
        />
        <div class="account" v-else-if="account">
          <p class="email">{{ account.email }}</p>
          <p class="status">
            <template v-if="isOpen">
              {{ $t('productions.clients.open_until', { time: openUntil }) }}
            </template>
            <template v-else>
              {{ $t('productions.clients.blocked') }}
            </template>
          </p>

          <div class="password" v-if="password">
            <label>{{ $t('productions.clients.password') }}</label>
            <code class="password-value">{{ password }}</code>
            <button-simple
              class="copy-button"
              :text="$t('productions.clients.copy')"
              @click="copyPassword"
            />
            <p class="hint">{{ $t('productions.clients.password_hint') }}</p>
          </div>

          <div class="actions">
            <button-simple
              class="open-button"
              :is-primary="true"
              :disabled="isWorking"
              :text="$t('productions.clients.open_for_hour')"
              @click="setOpen(true)"
            />
            <button-simple
              class="block-button"
              :disabled="isWorking || !isOpen"
              :text="$t('productions.clients.block')"
              @click="setOpen(false)"
            />
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

        <p v-if="hasError && !isDeleteModalActive" class="error">
          {{ $t('productions.clients.error') }}
        </p>
      </template>
    </div>

    <p v-if="saveError" class="error save-error">
      {{ $t('productions.clients.save_error') }}
    </p>

    <div class="box section isolation-section">
      <h2 class="subtitle">{{ $t('productions.clients.isolation_title') }}</h2>
      <checkbox
        class="isolation"
        :key="`isolation-${checkboxKey}`"
        :toggle="true"
        :disabled="isSaving"
        :label="$t('productions.fields.is_clients_isolated')"
        :model-value="!!currentProduction?.is_clients_isolated"
        @change="setIsolated"
      />
    </div>

    <div class="box section statuses">
      <h2 class="subtitle">{{ $t('productions.clients.statuses_title') }}</h2>
      <p class="description">
        {{ $t('productions.clients.statuses_description') }}
        <router-link v-if="isAdmin" :to="{ name: 'task-status' }">
          {{ $t('productions.clients.statuses_link') }}
        </router-link>
      </p>
      <p class="empty" v-if="!clientStatuses.length">
        {{ $t('productions.clients.statuses_empty') }}
      </p>
      <ul v-else>
        <li
          class="status-item"
          v-for="status in clientStatuses"
          :key="status.id"
        >
          {{ status.name }}
        </li>
      </ul>
    </div>

    <div class="box section metadata">
      <h2 class="subtitle">{{ $t('productions.clients.metadata_title') }}</h2>
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
          :disabled="isSaving"
          :label="getDescriptorLabel(descriptor)"
          :model-value="!!descriptor.for_client"
          @change="value => setForClient(descriptor, value)"
        />
      </div>
    </div>

    <div class="box section team-clients">
      <h2 class="subtitle">{{ $t('productions.clients.team_title') }}</h2>
      <p class="empty" v-if="!teamClients.length">
        {{ $t('productions.clients.team_empty') }}
      </p>
      <ul v-else>
        <li class="team-client" v-for="person in teamClients" :key="person.id">
          {{ person.full_name }}
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
import moment from 'moment-timezone'
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { useTime } from '@/composables/time'
import { formatTimeOfDay, parseDate } from '@/lib/time'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Checkbox from '@/components/widgets/Checkbox.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'

const store = useStore()
const { timezone, use12HourClock } = useTime()

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

const currentProduction = computed(() => store.getters.currentProduction)
const isEnabled = computed(
  () => store.getters.mainConfig?.preview_accounts_enabled === true
)
const productionId = computed(() => currentProduction.value?.id)
const isAdmin = computed(() => store.getters.isCurrentUserAdmin)
const personMap = computed(() => store.getters.personMap)
const productionTaskStatuses = computed(
  () => store.getters.productionTaskStatuses ?? []
)
const taskTypeMap = computed(() => store.getters.taskTypeMap)
const teamRoles = computed(() => store.getters.productionTeamRoles ?? {})

const clientStatuses = computed(() =>
  productionTaskStatuses.value.filter(status => status.is_client_allowed)
)

const descriptors = computed(() =>
  [
    'assetMetadataDescriptors',
    'shotMetadataDescriptors',
    'sequenceMetadataDescriptors',
    'episodeMetadataDescriptors',
    'editMetadataDescriptors',
    'taskMetadataDescriptors'
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
  () => !!openUntilDate.value && openUntilDate.value.isAfter(moment())
)
const openUntil = computed(() =>
  openUntilDate.value
    ? formatTimeOfDay(
        openUntilDate.value.tz(timezone.value),
        use12HourClock.value
      )
    : ''
)

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

const copyPassword = async () => {
  try {
    await navigator.clipboard.writeText(password.value)
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

const setIsolated = value =>
  save(() =>
    store.dispatch('editProduction', {
      id: productionId.value,
      is_clients_isolated: value
    })
  )

const getDescriptorLabel = descriptor => {
  const taskType = taskTypeMap.value?.get(descriptor.task_type_id)
  const type = taskType
    ? `${descriptor.entity_type}, ${taskType.name}`
    : descriptor.entity_type
  return `${descriptor.name} (${type})`
}

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

watch(productionId, load)
onMounted(load)
</script>

<style lang="scss" scoped>
.production-clients {
  max-width: 600px;
}

.description,
.unavailable {
  color: var(--text-alt);
  margin-bottom: 1em;
}

.status,
.email {
  margin-bottom: 0.5em;
}

.password {
  margin: 1em 0;

  .password-value {
    margin: 0 0.5em;
    user-select: all;
  }

  .hint {
    color: var(--text-alt);
    margin-top: 0.5em;
  }
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
}

.section {
  margin-bottom: 1em;
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
