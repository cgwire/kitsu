<template>
  <base-modal
    :active="active"
    :title="$t('playlists.update_versions_title')"
    @cancel="$emit('cancel')"
  >
    <div class="version-cards">
      <section class="version-card">
        <h3 class="version-card-title">
          {{ $t('playlists.select_task_type') }}
        </h3>
        <p class="version-card-help">
          {{ $t('playlists.apply_task_type_change') }}
        </p>
        <form @submit.prevent>
          <combobox-task-type
            :task-type-list="taskTypeList"
            v-model="taskTypeId"
          />
        </form>
        <p class="has-text-right version-card-action">
          <a
            :class="{
              button: true,
              'is-primary': true,
              'is-loading': isLoading
            }"
            @click="runConfirmation"
          >
            {{ $t('main.apply') }}
          </a>
        </p>
      </section>

      <section class="version-card">
        <h3 class="version-card-title">
          {{ $t('playlists.update_to_latest_version') }}
        </h3>
        <p class="version-card-help">
          {{ $t('playlists.update_to_latest_version_help') }}
        </p>
        <p class="has-text-right version-card-action">
          <a
            :class="{
              button: true,
              'is-primary': true,
              'is-loading': isLoading
            }"
            @click="runUpdateLatest"
          >
            {{ $t('main.apply') }}
          </a>
        </p>
      </section>
    </div>

    <p class="has-text-right mt2">
      <button @click="$emit('cancel')" class="button is-link">
        {{ $t('main.cancel') }}
      </button>
    </p>

    <p class="error has-text-right info-message" v-if="isError">
      {{ $t('playlist.change_task_type_fails') }}
    </p>
  </base-modal>
</template>

<script setup>
import { ref, watch } from 'vue'

import BaseModal from '@/components/modals/BaseModal.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'

const props = defineProps({
  active: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  taskTypeList: { type: Array, default: () => [] }
})

const emit = defineEmits(['cancel', 'confirm', 'update-latest'])

const taskTypeId = ref('')

const runConfirmation = () => {
  emit('confirm', taskTypeId.value)
}

const runUpdateLatest = () => {
  emit('update-latest')
}

watch(
  () => props.active,
  () => {
    taskTypeId.value = props.taskTypeList[0]?.id || ''
  }
)
</script>

<style lang="scss" scoped>
.version-cards {
  display: flex;
  gap: 1em;
  align-items: stretch;
}

.version-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1em;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--background-alt);
}

.version-card-title {
  font-weight: 600;
  margin-bottom: 0.5em;
}

.version-card-help {
  margin-bottom: 1em;
}

// Pin the action to the bottom so both cards' buttons align even though
// the task-type card is taller (it has the combobox).
.version-card-action {
  margin-top: auto;
  margin-bottom: 0;
}

@media screen and (max-width: 768px) {
  .version-cards {
    flex-direction: column;
  }
}
</style>
