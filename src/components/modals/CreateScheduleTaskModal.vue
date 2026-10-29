<template>
  <base-modal
    active
    :title="$t('schedule.create_task.title')"
    @cancel="$emit('cancel')"
  >
    <form @submit.prevent>
      <combobox
        :label="$t('schedule.create_task.kind')"
        :options="kindOptions"
        v-model="form.kind"
      />

      <combobox
        :label="$t('schedule.create_task.asset_type')"
        :options="productionAssetTypeOptions"
        v-model="form.assetTypeId"
        v-if="form.kind === 'Asset'"
      />
      <template v-if="form.kind === 'Shot'">
        <combobox
          :label="$t('schedule.create_task.sequence')"
          :options="shotSequenceOptions"
          v-model="form.sequenceId"
        />
        <text-field
          :label="$t('schedule.create_task.new_sequence_name')"
          :maxlength="160"
          v-model.trim="form.newSequenceName"
          v-if="isNewSequence"
        />
      </template>

      <text-field
        ref="nameField"
        :label="$t('schedule.create_task.name')"
        :maxlength="160"
        @enter="confirm"
        v-model.trim="form.name"
      />

      <template v-if="form.kind === 'Untracked'">
        <p class="hint">{{ $t('schedule.create_task.untracked_hint') }}</p>
        <text-field
          :label="$t('schedule.create_task.description')"
          v-model.trim="form.description"
        />
        <combobox
          :label="$t('schedule.create_task.link')"
          :options="linkOptions"
          v-model="form.linkId"
        />
        <combobox
          :label="$t('schedule.create_task.shot')"
          :options="shotOptions"
          v-model="form.shotId"
          v-if="isSequenceLink"
        />
        <combobox-department
          class="field"
          :label="$t('schedule.create_task.department')"
          v-model="form.departmentId"
        />
        <color-field
          :label="$t('schedule.create_task.color')"
          v-model="form.color"
        />
      </template>

      <div class="field" v-else>
        <label class="label">
          {{ $t('schedule.create_task.task_types') }}
        </label>
        <p class="hint" v-if="!availableTaskTypes.length">
          {{ $t('schedule.create_task.no_task_types') }}
        </p>
        <checkbox
          class="task-type-checkbox"
          :key="taskType.id"
          :label="taskType.name"
          :model-value="form.taskTypeIds.includes(taskType.id)"
          @update:model-value="toggleTaskType(taskType.id, $event)"
          v-for="taskType in availableTaskTypes"
        />
      </div>

      <div class="flexrow dates">
        <date-field
          class="flexrow-item"
          :can-delete="false"
          :label="$t('schedule.create_task.start_date')"
          model-type="yyyy-MM-dd"
          v-model="form.startDate"
        />
        <date-field
          class="flexrow-item"
          :label="$t('schedule.create_task.due_date')"
          :min-date="form.startDate"
          model-type="yyyy-MM-dd"
          v-model="form.dueDate"
        />
      </div>
    </form>
    <modal-footer
      :error-text="$t('schedule.create_task.error')"
      :is-error="isError"
      :is-loading="isLoading"
      :is-disabled="!isValidForm"
      @confirm="confirm"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script setup>
/*
 * Modal to create, from the production schedule, a new asset, shot or edit
 * with the tasks of the chosen task types, or an untracked item: work that
 * only lives in the schedule (sound design, a department planned before its
 * shots exist...). The page does the creation from the emitted form.
 */
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { sortByName } from '@/lib/sorting'
import sequenceStore from '@/store/modules/sequences'
import shotStore from '@/store/modules/shots'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import Checkbox from '@/components/widgets/Checkbox.vue'
import ColorField from '@/components/widgets/ColorField.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import DateField from '@/components/widgets/DateField.vue'
import TextField from '@/components/widgets/TextField.vue'

// Composables
// --------------------------------------------------------------------------
const { t } = useI18n()
const store = useStore()

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  // Concrete episode the schedule is scoped to, null otherwise.
  episodeId: {
    default: null,
    type: String
  },
  isError: {
    default: false,
    type: Boolean
  },
  // The main pack of a TV show plans the assets of no episode: shots,
  // sequences and edits all belong to one.
  isMainPack: {
    default: false,
    type: Boolean
  },
  isLoading: {
    default: false,
    type: Boolean
  },
  // Day the dates start at (YYYY-MM-DD).
  startDate: {
    required: true,
    type: String
  }
})

const emit = defineEmits(['cancel', 'confirm'])

// Value of the sequence choice that creates a new sequence along the shot.
const NEW_SEQUENCE = 'new-sequence'

// State
// --------------------------------------------------------------------------
const nameField = useTemplateRef('nameField')
const form = ref({
  kind: 'Asset',
  assetTypeId: null,
  sequenceId: null,
  newSequenceName: '',
  name: '',
  description: '',
  linkId: null,
  shotId: null,
  departmentId: null,
  // none picked: the server takes the colour of the department, else a
  // random one
  color: null,
  taskTypeIds: [],
  startDate: props.startDate,
  dueDate: null
})
// Bumped once the sequences and shots are loaded: their store maps are not
// reactive.
const entitiesVersion = ref(0)

// Computed
// --------------------------------------------------------------------------
const currentEpisode = computed(() => store.getters.currentEpisode)
const productionAssetTypeOptions = computed(
  () => store.getters.productionAssetTypeOptions
)
const productionTaskTypes = computed(() => store.getters.productionTaskTypes)
const departmentMap = computed(() => store.getters.departmentMap)

const kindOptions = computed(() =>
  [
    { label: t('schedule.create_task.kinds.asset'), value: 'Asset' },
    { label: t('schedule.create_task.kinds.shot'), value: 'Shot' },
    { label: t('schedule.create_task.kinds.edit'), value: 'Edit' },
    { label: t('schedule.create_task.kinds.untracked'), value: 'Untracked' }
  ].filter(
    option => !props.isMainPack || ['Asset', 'Untracked'].includes(option.value)
  )
)

const sequences = computed(() => {
  entitiesVersion.value // re-read the map once loaded
  if (props.isMainPack) return []
  return sortByName(
    [...sequenceStore.cache.sequenceMap.values()].filter(
      sequence => !props.episodeId || sequence.episode_id === props.episodeId
    )
  )
})

const sequenceOptions = computed(() =>
  sequences.value.map(sequence => ({
    label: sequence.name,
    value: sequence.id
  }))
)

const shotSequenceOptions = computed(() =>
  sequenceOptions.value.concat({
    label: t('schedule.create_task.new_sequence'),
    value: NEW_SEQUENCE
  })
)

const isNewSequence = computed(() => form.value.sequenceId === NEW_SEQUENCE)

// An untracked item links to nothing (the whole production), to the
// current episode, or to a sequence and then optionally one of its shots.
const linkOptions = computed(() => {
  const options = [{ label: t('schedule.create_task.link_none'), value: null }]
  if (props.episodeId) {
    options.push({
      label: t('schedule.create_task.link_episode', {
        name: currentEpisode.value?.name
      }),
      value: props.episodeId
    })
  }
  return options.concat(sequenceOptions.value)
})

const isSequenceLink = computed(() =>
  sequences.value.some(sequence => sequence.id === form.value.linkId)
)

const shotOptions = computed(() => {
  entitiesVersion.value // re-read the map once loaded
  const shots = [...shotStore.cache.shotMap.values()].filter(
    shot => shot.sequence_id === form.value.linkId && !shot.canceled
  )
  return [{ label: t('schedule.create_task.shot_none'), value: null }].concat(
    sortByName(shots).map(shot => ({ label: shot.name, value: shot.id }))
  )
})

const availableTaskTypes = computed(() => {
  let taskTypes = productionTaskTypes.value.filter(
    taskType => taskType.for_entity === form.value.kind
  )
  if (form.value.kind === 'Asset') {
    // an asset type with a workflow only takes the task types of it
    const workflow = store.getters.getAssetTypeWorkflow(form.value.assetTypeId)
    if (workflow.length) {
      taskTypes = taskTypes.filter(taskType => workflow.includes(taskType.id))
    }
  }
  return taskTypes
})

const isValidForm = computed(() => {
  const value = form.value
  if (!value.name || !value.startDate) return false
  // an untracked item gets the task type of its department from the server
  if (value.kind !== 'Untracked' && !value.taskTypeIds.length) return false
  if (value.dueDate && value.dueDate < value.startDate) return false
  if (value.kind === 'Asset' && !value.assetTypeId) return false
  if (value.kind === 'Shot' && !value.sequenceId) return false
  if (value.kind === 'Shot' && isNewSequence.value && !value.newSequenceName) {
    return false
  }
  return true
})

// Functions
// --------------------------------------------------------------------------
const toggleTaskType = (taskTypeId, checked) => {
  const taskTypeIds = form.value.taskTypeIds.filter(id => id !== taskTypeId)
  if (checked) taskTypeIds.push(taskTypeId)
  form.value.taskTypeIds = taskTypeIds
}

const selectAllTaskTypes = () => {
  form.value.taskTypeIds = availableTaskTypes.value.map(taskType => taskType.id)
}

const confirm = () => {
  if (!isValidForm.value) return
  const value = form.value
  let parentId = null
  if (value.kind === 'Untracked') {
    parentId = (isSequenceLink.value && value.shotId) || value.linkId
  }
  emit('confirm', {
    kind: value.kind,
    name: value.name,
    description: value.description,
    assetTypeId: value.assetTypeId,
    sequenceId: isNewSequence.value ? null : value.sequenceId,
    newSequenceName:
      value.kind === 'Shot' && isNewSequence.value
        ? value.newSequenceName
        : null,
    parentId,
    departmentId: value.kind === 'Untracked' ? value.departmentId : null,
    color: value.kind === 'Untracked' ? value.color : null,
    taskTypeIds: value.kind === 'Untracked' ? [] : [...value.taskTypeIds],
    startDate: value.startDate,
    // without a due date the task takes its start day, to stretch on the
    // schedule
    dueDate: value.dueDate || value.startDate
  })
}

// Watchers
// --------------------------------------------------------------------------
watch(
  () => [form.value.kind, form.value.assetTypeId],
  () => selectAllTaskTypes()
)

watch(
  () => form.value.departmentId,
  departmentId => {
    form.value.color = departmentMap.value.get(departmentId)?.color || null
  }
)

watch(
  () => form.value.linkId,
  () => {
    form.value.shotId = null
  }
)

// Lifecycle
// --------------------------------------------------------------------------
onMounted(async () => {
  form.value.assetTypeId = productionAssetTypeOptions.value[0]?.value || null
  selectAllTaskTypes()
  nameField.value?.focus()
  await Promise.all([
    store.dispatch('loadSequences'),
    store.dispatch('loadShots')
  ]).catch(console.error)
  entitiesVersion.value++
  // without any sequence yet, the shot comes with a new one
  form.value.sequenceId =
    form.value.sequenceId || sequences.value[0]?.id || NEW_SEQUENCE
})
</script>

<style lang="scss" scoped>
.hint {
  color: var(--text-alt);
  font-size: 0.9em;
  margin-bottom: 1em;
}

.task-type-checkbox {
  margin-bottom: 0.3em;
}

.dates {
  align-items: flex-start;
  gap: 1em;
}
</style>
