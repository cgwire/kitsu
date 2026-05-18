<template>
  <base-modal :active="active" :title="modalTitle" @cancel="$emit('cancel')">
    <form @submit.prevent>
      <text-field
        ref="nameField"
        :label="$t('playlists.fields.name')"
        :maxlength="80"
        @enter="runConfirmation"
        v-model.trim="form.name"
        v-focus
      />
      <combobox-simple
        :label="$t('playlists.fields.for_client')"
        :options="forClientOptions"
        v-model="forClient"
      />
      <combobox-simple
        :label="$t('playlists.fields.for_entity')"
        :options="forEntityOptions"
        :disabled="typeDisabled"
        v-model="form.for_entity"
        v-if="!isEditing"
      />
      <combobox-task-type
        class="flexrow-item selector"
        :label="$t('news.task_type')"
        :task-type-list="taskTypeList"
        :up="true"
        v-model="form.task_type_id"
      />
    </form>

    <modal-footer
      :error-text="$t('playlists.edit_error')"
      :is-error="isError"
      :is-loading="isLoading"
      @confirm="runConfirmation"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { sortByName } from '@/lib/sorting'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import ComboboxSimple from '@/components/widgets/ComboboxSimple.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import TextField from '@/components/widgets/TextField.vue'

const { t } = useI18n()
const store = useStore()

const props = defineProps({
  active: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  playlistToEdit: { type: Object, default: () => ({}) },
  taskTypeId: { type: String, default: '' },
  typeDisabled: { type: Boolean, default: false }
})

const emit = defineEmits(['cancel', 'confirm'])

const form = ref({
  name: props.playlistToEdit.name,
  for_entity: props.playlistToEdit.for_entity,
  for_client: props.playlistToEdit.for_client,
  is_for_all: false,
  task_type_id: props.taskTypeId
})
const forClient = ref('false')
const nameField = ref(null)

const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const productionTaskTypes = computed(() => store.getters.productionTaskTypes)

const isEditing = computed(() => Boolean(props.playlistToEdit?.id))

const modalTitle = computed(() =>
  isEditing.value ? t('playlists.edit_title') : t('playlists.create_title')
)

const forClientOptions = computed(() => [
  { label: t('playlists.for_client'), value: 'true' },
  { label: t('playlists.for_studio'), value: 'false' }
])

const forEntityOptions = computed(() => {
  if (
    ['main', 'all'].includes(currentEpisode.value?.id) ||
    currentProduction.value?.production_type === 'assets'
  ) {
    return [{ label: t('assets.title'), value: 'asset' }]
  }
  if (currentProduction.value?.production_type === 'shots') {
    return [
      { label: t('shots.title'), value: 'shot' },
      { label: t('sequences.title'), value: 'sequence' },
      { label: t('edits.title'), value: 'edit' },
      { label: t('episodes.title'), value: 'episode' }
    ]
  }
  return [
    { label: t('assets.title'), value: 'asset' },
    { label: t('shots.title'), value: 'shot' },
    { label: t('sequences.title'), value: 'sequence' },
    { label: t('edits.title'), value: 'edit' },
    { label: t('episodes.title'), value: 'episode' }
  ]
})

const defaultForEntity = computed(() => {
  const productionType = currentProduction.value?.production_type
  const isOnlyAssets = productionType === 'assets'
  const isOnlyShots = productionType === 'shots'
  const isAssetEpisode = ['all', 'main'].includes(currentEpisode.value?.id)
  return (isAssetEpisode || isOnlyAssets) && !isOnlyShots ? 'asset' : 'shot'
})

const taskTypeList = computed(() => {
  const taskTypes = productionTaskTypes.value.filter(
    taskType => taskType.for_entity.toLowerCase() === form.value.for_entity
  )
  return [
    { id: '', color: '#999', name: t('news.all') },
    ...sortByName([...taskTypes])
  ]
})

const runConfirmation = () => {
  if (!form.value.name) {
    nameField.value?.focus()
    return
  }
  form.value.for_client = forClient.value === 'true'
  emit('confirm', form.value)
}

const resetForm = () => {
  const isAll = currentEpisode.value?.id === 'all'
  if (isEditing.value) {
    form.value.name = props.playlistToEdit.name
    form.value.for_entity = props.playlistToEdit.for_entity
    form.value.for_client = props.playlistToEdit.for_client
    form.value.is_for_all = isAll
    form.value.task_type_id = props.playlistToEdit.task_type_id
  } else {
    form.value = {
      name: props.playlistToEdit.name,
      for_entity: props.playlistToEdit.for_entity || defaultForEntity.value,
      for_client: 'false',
      is_for_all: isAll,
      task_type_id: props.taskTypeId
    }
  }
}

watch(() => props.playlistToEdit, resetForm)

watch(
  () => props.active,
  active => {
    if (active) {
      forClient.value = props.playlistToEdit.for_client ? 'true' : 'false'
      resetForm()
      setTimeout(() => {
        nameField.value?.focus()
      }, 100)
    }
  }
)
</script>
