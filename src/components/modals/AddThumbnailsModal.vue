<template>
  <base-modal
    :active="active"
    :title="$t('entities.thumbnails.title')"
    @cancel="$emit('cancel')"
  >
    <p>
      {{ $t('entities.thumbnails.explanation') }}
    </p>

    <combobox-task-type
      :label="$t('entities.thumbnails.select_task_type')"
      :task-type-list="taskTypeList"
      v-model="taskTypeId"
    />

    <p>
      {{ $t('entities.thumbnails.explanation_two') }}
      {{ $t(`entities.thumbnails.${parent}_pattern`) }}
    </p>

    <label class="label">
      {{ $t('entities.thumbnails.select_files') }}
    </label>

    <file-upload
      ref="previewField"
      :label="$t('main.csv.upload_file')"
      :accept="extensions"
      @fileselected="onFileSelected"
      :multiple="true"
    />

    <div class="warning" v-if="invalidForms.length">
      <label class="label mt2">
        {{ $t('entities.thumbnails.invalid_files') }}
      </label>
      <ul class="invalid-files">
        <li v-for="(form, index) in invalidForms" :key="index">
          {{ form.get('file').name }}
        </li>
      </ul>
    </div>

    <label class="label mt2" v-if="thumbnailList.length">
      {{ $t('entities.thumbnails.selected_files') }}
    </label>
    <div
      class="thumbnail-line flexrow"
      :key="thumbnailInfo.id"
      v-for="thumbnailInfo in thumbnailList"
    >
      <img
        class="flexrow-item"
        src="@/assets/icons/movie-thumbnail.png"
        width="150"
        height="100"
        v-if="!thumbnailInfo.src"
      />
      <img
        class="flexrow-item"
        :src="thumbnailInfo.src"
        width="150"
        height="100"
        v-if="thumbnailInfo.src"
      />
      <span class="flexrow-item">
        <template v-if="thumbnailInfo.parentName">
          {{ thumbnailInfo.parentName }} /
        </template>
        {{ thumbnailInfo.name }}
      </span>
      <spinner v-if="loading[thumbnailInfo.id]" :size="10" />
      <check-icon v-if="uploaded[thumbnailInfo.id]" />
    </div>

    <modal-footer
      :error-text="$t('entities.thumbnails.error')"
      :is-error="isError"
      :is-loading="isLoading"
      :is-disabled="!isFormFilled"
      @confirm="confirm"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script setup>
import { CheckIcon } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import stringHelpers from '@/lib/string'
import assetStore from '@/store/modules/assets'
import editStore from '@/store/modules/edits'
import shotStore from '@/store/modules/shots'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
// eslint-disable-next-line no-unused-vars
import FileUpload from '@/components/widgets/FileUpload.vue'
import Spinner from '@/components/widgets/Spinner.vue'

const store = useStore()

const props = defineProps({
  active: { type: Boolean, default: false },
  entityType: {
    type: String,
    required: true,
    validator: value => ['Asset', 'Edit', 'Shot'].includes(value)
  },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  parent: { type: String, required: true }
})

const emit = defineEmits(['cancel', 'confirm'])

const extensions = '.png,.jpg,.jpeg,.mp4,.mov'

const entityMap = ref({})
const forms = ref([])
const loading = ref({})
const previewField = ref(null)
const taskTypeId = ref(null)
const uploaded = ref({})

const assetValidationColumns = computed(
  () => store.getters.assetValidationColumns
)
const editValidationColumns = computed(
  () => store.getters.editValidationColumns
)
const shotValidationColumns = computed(
  () => store.getters.shotValidationColumns
)
const taskTypeMap = computed(() => store.getters.taskTypeMap)
const taskMap = computed(() => store.getters.taskMap)

const isAssets = computed(() => props.entityType === 'Asset')
const isEdits = computed(() => props.entityType === 'Edit')
const isShots = computed(() => props.entityType === 'Shot')

const taskTypeList = computed(() => {
  let validationColumns = []
  if (isAssets.value) validationColumns = assetValidationColumns.value || []
  else if (isEdits.value) validationColumns = editValidationColumns.value || []
  else if (isShots.value) validationColumns = shotValidationColumns.value || []
  return validationColumns.map(id => taskTypeMap.value.get(id))
})

const slugifyFilename = form =>
  stringHelpers.slugify(
    stringHelpers.filenameWithoutExtension(form.get('file').name)
  )

const validForms = computed(() =>
  forms.value.filter(form => {
    const asset = entityMap.value[slugifyFilename(form)]
    return asset && asset.validations.get(taskTypeId.value)
  })
)

const invalidForms = computed(() =>
  forms.value.filter(form => !validForms.value.includes(form))
)

const prepareImagePreview = form =>
  form.get('file').type.startsWith('image')
    ? window.URL.createObjectURL(form.get('file'))
    : ''

const thumbnailList = computed(() =>
  validForms.value.map(form => {
    const asset = entityMap.value[slugifyFilename(form)]
    const url = prepareImagePreview(form)
    let parentName = ''
    if (isAssets.value) parentName = asset.asset_type_name
    else if (isEdits.value) parentName = asset.episode_name
    else if (isShots.value) parentName = asset.sequence_name
    form.asset = asset
    return { parentName, name: asset.name, id: asset.id, src: url }
  })
)

const isFormFilled = computed(() => thumbnailList.value.length > 0)

const reset = () => {
  if (taskTypeList.value.length > 0) {
    taskTypeId.value = taskTypeList.value[0].id
  }
  previewField.value?.reset()
  forms.value = []
  loading.value = {}
  uploaded.value = {}
}

const addTaskInformation = form => {
  const entity = entityMap.value[slugifyFilename(form)]
  form.task = taskMap.value.get(entity.validations.get(taskTypeId.value))
  return form
}

const confirm = () => {
  emit('confirm', validForms.value.map(addTaskInformation))
}

const addEntityToEntityMap = entity => {
  let fullName = ''
  if (isAssets.value) {
    fullName = stringHelpers.slugify(`${entity.asset_type_name}_${entity.name}`)
  } else if (isEdits.value) {
    fullName = stringHelpers.slugify(
      entity.episode_name
        ? `${entity.episode_name}_${entity.name}`
        : entity.name
    )
  } else if (isShots.value) {
    fullName = stringHelpers.slugify(`${entity.sequence_name}_${entity.name}`)
  }
  entityMap.value[fullName] = entity
}

const onFileSelected = newForms => {
  entityMap.value = {}
  uploaded.value = {}
  let cachedEntities = []
  if (isAssets.value) cachedEntities = assetStore.cache.assets
  else if (isEdits.value) cachedEntities = editStore.cache.edits
  else if (isShots.value) cachedEntities = shotStore.cache.shots
  cachedEntities.forEach(addEntityToEntityMap)
  forms.value = newForms
}

watch(
  () => props.active,
  active => {
    if (active) reset()
  }
)

onMounted(reset)

defineExpose({
  markLoading: assetId => {
    loading.value = { [assetId]: true }
  },
  markUploaded: assetId => {
    uploaded.value[assetId] = true
  }
})
</script>

<style lang="scss" scoped>
.invalid-files {
  margin-left: 1.5em;
}

.thumbnail-line {
  margin-top: 1em;
  img {
    max-height: 33px;
    max-width: 50px;
  }
}

.modal-content {
  max-height: calc(100vh - 7rem);
  margin-top: 3rem;
}
</style>
