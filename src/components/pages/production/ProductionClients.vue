<template>
  <div class="production-clients box">
    <p v-if="!isEnabled" class="unavailable">
      {{ $t('productions.clients.unavailable') }}
    </p>
    <template v-else>
      <p class="description">{{ $t('productions.clients.description') }}</p>

      <p v-if="!isLoaded"></p>
      <button-simple
        class="create-button"
        :is-primary="true"
        :is-loading="isWorking"
        :text="$t('productions.clients.create')"
        @click="create"
        v-else-if="!account"
      />
      <div class="account" v-else>
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

      <p v-if="hasError" class="error">
        {{ $t('productions.clients.error') }}
      </p>
    </template>

    <confirm-modal
      :active="isDeleteModalActive"
      :is-danger="true"
      :is-loading="isWorking"
      :text="$t('productions.clients.delete_confirm')"
      @cancel="isDeleteModalActive = false"
      @confirm="remove"
    />
  </div>
</template>

<script setup>
import moment from 'moment-timezone'
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'

import { formatTimeOfDay, parseDate } from '@/lib/time'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'

const store = useStore()

const account = ref(null)
const hasError = ref(false)
const isDeleteModalActive = ref(false)
const isLoaded = ref(false)
const isWorking = ref(false)
const password = ref('')

const currentProduction = computed(() => store.getters.currentProduction)
const isEnabled = computed(
  () => store.getters.mainConfig?.preview_accounts_enabled === true
)
const productionId = computed(() => currentProduction.value?.id)

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
  openUntilDate.value ? formatTimeOfDay(openUntilDate.value.local()) : ''
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
  isDeleteModalActive.value = false
}

const copyPassword = () => navigator.clipboard.writeText(password.value)

onMounted(async () => {
  if (isEnabled.value && productionId.value) {
    await run(() => Promise.resolve())
  }
  isLoaded.value = true
})
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

.error {
  color: var(--danger, red);
  margin-top: 1em;
}
</style>
