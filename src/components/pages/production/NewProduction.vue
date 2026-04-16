<template>
  <div class="new-production page">
    <div class="columns">
      <div class="column is-offset-one-quarter is-half">
        <section class="hero">
          <div class="hero-body">
            <h2 class="subtitle">
              {{ $t('productions.creation.new_project') }}
            </h2>
            <h1 class="title">
              {{ $t('productions.creation.create_production') }}
            </h1>
          </div>
        </section>
        <timeline-item
          :title="$t('productions.creation.give_a_name')"
          :subtitle="$t('productions.creation.give_a_name_description')"
          :step="1"
          :is-completed="hasValidName"
        >
          <text-field
            ref="nameField"
            input-class=" is-inline"
            :placeholder="$t('productions.creation.placeholder_name')"
            v-model="productionToCreate.name"
          />
        </timeline-item>
        <timeline-item
          :title="$t('productions.creation.choose_template')"
          :subtitle="$t('productions.creation.choose_template_description')"
          :step="2"
          :is-completed="!!productionToCreate.project_template_id"
          :optional="true"
        >
          <combobox-styled
            :options="projectTemplateOptions"
            :label="$t('project_templates.title')"
            v-model="productionToCreate.project_template_id"
            thin
            is-inline
          />
        </timeline-item>
        <template v-if="!productionToCreate.project_template_id">
          <timeline-item
            :title="$t('productions.creation.production_settings')"
            :subtitle="
              $t('productions.creation.production_settings_description')
            "
            :step="3"
            :is-completed="hasValidSettings"
          >
            <div class="flexrow">
              <combobox-styled
                class="flexrow-item"
                :options="productionTypeOptions"
                :label="$t('productions.fields.type')"
                locale-key-prefix="productions.type."
                v-model="productionToCreate.settings.type"
                thin
                is-inline
              />
              <combobox-styled
                class="flexrow-item"
                :options="productionStyleOptions"
                :label="$t('productions.fields.style')"
                locale-key-prefix="productions.style."
                v-model="productionToCreate.settings.style"
                thin
                is-inline
              />
            </div>
            <div class="mb1 explaination">
              {{ $t('productions.creation.explaination_type') }}
            </div>
            <div class="flexrow">
              <text-field
                class="flexrow-item"
                input-class=" is-small is-size-4"
                :label="$t('productions.fields.fps')"
                type="number"
                :max="60"
                :step="0.001"
                :placeholder="$t('productions.creation.placeholder_fps')"
                :errored="!hasValidFPS"
                v-model="productionToCreate.settings.fps"
                thin
              />
              <span class="input-separator flexrow-item mr1"></span>
              <text-field
                class="flexrow-item mr0"
                input-class=" is-small is-size-3"
                :label="$t('productions.fields.ratio')"
                type="number"
                :step="0.01"
                :placeholder="$t('productions.creation.placeholder_ratio1')"
                v-model="productionToCreate.settings.ratio[0]"
                thin
              />
              <span class="input-separator flexrow-item mt15 mr0">:</span>
              <text-field
                class="flexrow-item"
                input-class=" is-small is-size-2"
                type="number"
                :step="1"
                :placeholder="$t('productions.creation.placeholder_ratio2')"
                :empty-label="true"
                v-model="productionToCreate.settings.ratio[1]"
                thin
              />
              <span class="input-separator flexrow-item mr1"></span>
              <text-field
                class="flexrow-item mr0 ml2"
                input-class=" is-small is-size-4"
                :label="$t('productions.fields.resolution')"
                type="number"
                :step="1"
                :placeholder="
                  $t('productions.creation.placeholder_resolution1')
                "
                v-model="productionToCreate.settings.resolution[0]"
                thin
              />
              <span class="input-separator flexrow-item mt15 mr05">x</span>
              <text-field
                class="flexrow-item"
                input-class=" is-small is-size-4"
                type="number"
                :placeholder="
                  $t('productions.creation.placeholder_resolution2')
                "
                :step="1"
                :empty-label="true"
                v-model="productionToCreate.settings.resolution[1]"
                thin
              />
            </div>
            <div class="mb1 explaination">
              {{ $t('productions.creation.explaination_video') }}
            </div>
            <div>
              <label class="label">
                {{ $t('productions.creation.start_and_end_dates') }}
              </label>
              <div class="date-picker-wrapper">
                <date-field
                  :can-delete="false"
                  :label="$t('main.start_date')"
                  :max-date="productionToCreate.settings.dateEnd"
                  :placeholder="startDatePlaceholder"
                  v-model="productionToCreate.settings.dateStart"
                />
                <span class="input-separator">-</span>
                <date-field
                  :can-delete="false"
                  :label="$t('main.end_date')"
                  :min-date="productionToCreate.settings.dateStart"
                  :placeholder="endDatePlaceholder"
                  v-model="productionToCreate.settings.dateEnd"
                />
              </div>
            </div>
            <div class="mb1 explaination">
              {{ $t('productions.creation.explaination_date') }}
            </div>
          </timeline-item>
          <timeline-item
            :title="$t('productions.creation.select_asset_task_type')"
            :subtitle="
              $t('productions.creation.select_asset_task_type_description')
            "
            :step="4"
            :is-completed="hasValidAssetTaskTypes"
            v-if="!isShotsOnly"
          >
            <draggable
              item-key="id"
              v-model="productionToCreate.assetTaskTypes"
            >
              <template #item="{ element: taskType }">
                <task-type-name
                  class="task-type"
                  deletable
                  :task-type="taskType"
                  @delete="deleteFromList(taskType, 'assetTaskTypes')"
                />
              </template>
              <template #header>
                <div class="flexrow mb1">
                  <combobox-task-type
                    class="is-inline inline-task-type-combo flexrow-item mb0"
                    :task-type-list="availableAssetTaskTypes"
                    add-placeholder
                    @update:model-value="
                      id =>
                        productionToCreate.assetTaskTypes.push(
                          taskTypeMap.get(id)
                        )
                    "
                    v-if="availableAssetTaskTypes.length"
                  />
                  <button
                    class="button is-link flexrow-item"
                    @click="onAddLibraryAssetTaskTypeClicked"
                  >
                    {{ $t('task_types.add_task_type_to_library') }}
                  </button>
                </div>
              </template>
            </draggable>
          </timeline-item>
          <timeline-item
            :title="$t('productions.creation.select_shot_task_type')"
            :subtitle="
              $t('productions.creation.select_shot_task_type_description')
            "
            :step="isShotsOnly ? 4 : 5"
            :is-completed="hasValidShotTaskTypes"
            v-if="!isAssetsOnly"
          >
            <draggable item-key="id" v-model="productionToCreate.shotTaskTypes">
              <template #item="{ element: taskType }">
                <task-type-name
                  class="task-type"
                  deletable
                  :task-type="taskType"
                  @delete="deleteFromList(taskType, 'shotTaskTypes')"
                />
              </template>
              <template #header>
                <div class="flexrow mb1">
                  <combobox-task-type
                    class="is-inline inline-task-type-combo flexrow-item mb0"
                    :task-type-list="availableShotTaskTypes"
                    add-placeholder
                    @update:model-value="
                      id =>
                        productionToCreate.shotTaskTypes.push(
                          taskTypeMap.get(id)
                        )
                    "
                    v-if="availableShotTaskTypes.length"
                  />
                  <button
                    class="button is-link flexrow-item"
                    @click="onAddLibraryShotTaskTypeClicked"
                  >
                    {{ $t('task_types.add_task_type_to_library') }}
                  </button>
                </div>
              </template>
            </draggable>
          </timeline-item>
          <timeline-item
            :title="$t('productions.creation.select_task_status')"
            :subtitle="
              $t('productions.creation.select_task_status_description')
            "
            :step="isShotsOnly || isAssetsOnly ? 5 : 6"
            :is-completed="hasValidTaskStatuses"
          >
            <div class="flexrow">
              <combobox-status
                class="flexrow-item"
                :task-status-list="availableTaskStatuses"
                :with-margin="false"
                add-placeholder
                @update:model-value="
                  id =>
                    productionToCreate.taskStatuses.push(taskStatusMap.get(id))
                "
                v-if="availableTaskStatuses.length > 0"
              />
              <button
                class="button is-link flexrow-item"
                @click="modals.isAddTaskStatusDisplayed = true"
              >
                {{ $t('task_status.add_task_status_to_library') }}
              </button>
            </div>
            <div class="flexrow mt1">
              <validation-tag
                class="task-status flexrow-item"
                :task="{ task_status_id: taskStatus.id }"
                :key="taskStatus.id"
                pointer
                is-static
                @click="deleteFromList(taskStatus, 'taskStatuses')"
                v-for="taskStatus in productionToCreate.taskStatuses"
              />
            </div>
          </timeline-item>
          <timeline-item
            :title="$t('productions.creation.add_asset_types')"
            :subtitle="$t('productions.creation.add_asset_types_description')"
            :step="isAssetsOnly ? 6 : 7"
            :is-completed="hasValidAssetTypes"
            v-if="!isShotsOnly"
          >
            <div class="flexrow asset-types mb1">
              <combobox
                class="flexrow-item"
                :options="availableAssetTypes"
                :with-margin="false"
                @update:model-value="
                  id => {
                    assetTypeMap.get(id) &&
                      productionToCreate.assetTypes.push(assetTypeMap.get(id))
                  }
                "
                v-if="availableAssetTypes.length > 1"
              />
              <button
                class="button is-link flexrow-item"
                @click="modals.isAddAssetTypeDisplayed = true"
              >
                {{ $t('asset_types.add_asset_type_to_library') }}
              </button>
            </div>
            <div class="flexrow mt1">
              <span
                :key="assetType.id"
                class="asset-type-name flexrow-item"
                @click="deleteFromList(assetType, 'assetTypes')"
                v-for="assetType in productionToCreate.assetTypes"
              >
                {{ assetType.name }}
              </span>
            </div>
          </timeline-item>
        </template>
        <timeline-item
          :title="$t('productions.creation.add_assets')"
          :subtitle="$t('productions.creation.add_assets_description')"
          :step="
            productionToCreate.project_template_id ? 3 : isAssetsOnly ? 7 : 8
          "
          :is-completed="hasValidAssets"
          :optional="true"
          :is-last="isAssetsOnly"
          v-if="!isShotsOnly"
        >
          <div class="import-content">
            <span class="tag mr1" v-if="nbAssetsToImport > 0">
              {{ nbAssetsToImport }}
              {{ $t('productions.creation.assets_to_import') }}
            </span>
            <button
              class="button import-button"
              @click="toggleModal('isAssetsImportDisplayed')"
            >
              {{ $t('productions.creation.import_assets_button') }}
            </button>
          </div>
        </timeline-item>
        <timeline-item
          :title="$t('productions.creation.add_shots')"
          :subtitle="$t('productions.creation.add_shots_description')"
          :step="
            productionToCreate.project_template_id ? 4 : isShotsOnly ? 6 : 9
          "
          :is-completed="hasValidShots"
          :optional="true"
          is-last
          v-if="!isAssetsOnly"
        >
          <div class="import-content">
            <span class="tag mr1" v-if="nbShotsToImport > 0">
              {{ nbShotsToImport }}
              {{ $t('productions.creation.shots_to_import') }}
            </span>
            <button
              class="button import-button"
              @click="toggleModal('isShotsImportDisplayed')"
            >
              {{ $t('productions.creation.import_shots_button') }}
            </button>
          </div>
        </timeline-item>
        <section class="has-text-centered mt2">
          <p v-if="errors.importingAssets" class="error">
            {{ $t('productions.creation.errorImportingAssets') }}
            <br />
            {{ errors.importingAssetsError }}
          </p>
          <p v-if="errors.importingShots" class="error">
            {{ $t('productions.creation.errorImportingShots') }}
            <br />
            {{ errors.importingShotsError }}
          </p>
          <p v-if="errors.creatingProduction" class="error">
            {{ $t('productions.creation.error') }}
            {{ errors.creatingProductionError }}
          </p>
          <button
            class="button big-button"
            v-if="hasAllDataCorrect"
            @click="createProduction"
          >
            <spinner
              class="mr05 mt05"
              :size="20"
              is-white
              v-if="loading.createProduction"
            />
            {{ $t('productions.creation.create_button') }}
          </button>
          <button class="button big-button" v-else>
            {{ $t('productions.creation.create_button_disabled') }}
          </button>
        </section>
      </div>
    </div>

    <edit-task-type-modal
      :active="modals.isAddTaskTypeDisplayed"
      :is-loading="loading.creatingTaskType"
      :is-error="errors.creatingTaskType"
      :for-entity="taskTypeForEntity"
      @cancel="modals.isAddTaskTypeDisplayed = false"
      @confirm="createTaskType"
    />

    <edit-task-status-modal
      :active="modals.isAddTaskStatusDisplayed"
      :is-loading="loading.creatingTaskStatus"
      :is-error="errors.creatingTaskStatus"
      @cancel="modals.isAddTaskStatusDisplayed = false"
      @confirm="createTaskStatus"
    />

    <edit-asset-type-modal
      :active="modals.isAddAssetTypeDisplayed"
      :is-loading="loading.creatingAssetType"
      :is-error="errors.creatingAssetType"
      @cancel="modals.isAddAssetTypeDisplayed = false"
      @confirm="createAssetType"
    />

    <import-render-modal
      :active="modals.isAssetsImportRenderDisplayed"
      :is-loading="loading.importingAssets"
      :is-error="errors.importingAssets"
      :import-error="errors.importingAssetsError"
      :parsed-csv="parsedAssetsCSV"
      :form-data="assetsCsvFormData"
      :columns="assetsRenderColumns"
      :data-matchers="assetsDataMatchers"
      :database="{}"
      :disable-update="true"
      @reupload="resetAssetsImport"
      @confirm="uploadAssetsImportFile"
      @cancel="toggleModal('isAssetsImportRenderDisplayed')"
    />

    <import-modal
      ref="import-assets-modal"
      :active="modals.isAssetsImportDisplayed"
      :is-loading="loading.importingAssets"
      :is-error="errors.importingAssets"
      :form-data="assetsCsvFormData"
      :columns="assetsDataMatchers"
      :optional-columns="assetsOptionalColumns"
      :generic-columns="genericColumns"
      @confirm="renderAssetsImport"
      @cancel="toggleModal('isAssetsImportDisplayed')"
    />

    <import-render-modal
      :active="modals.isShotsImportRenderDisplayed"
      :is-loading="loading.importingShots"
      :is-error="errors.importingShots"
      :import-error="errors.importingShotsError"
      :parsed-csv="parsedShotsCSV"
      :form-data="shotsCsvFormData"
      :columns="shotsRenderColumns"
      :data-matchers="shotsDataMatchers"
      :database="{}"
      :disable-update="true"
      @reupload="resetShotsImport"
      @confirm="uploadShotsImportFile"
      @cancel="toggleModal('isShotsImportRenderDisplayed')"
    />

    <import-modal
      ref="import-shots-modal"
      :active="modals.isShotsImportDisplayed"
      :is-loading="loading.importingShots"
      :is-error="errors.importingShots"
      :form-data="shotsCsvFormData"
      :columns="shotsDataMatchers"
      :optional-columns="shotsOptionalColumns"
      :generic-columns="genericColumns"
      @confirm="renderShotsImport"
      @cancel="toggleModal('isShotsImportDisplayed')"
    />

    <manage-shots-modal
      :active="modals.isAddShotsDisplayed"
      @add-episode="addEpisode"
      @add-sequence="addSequence"
      @add-shot="addShot"
      @cancel="toggleModal('isAddShotsDisplayed')"
    />
  </div>
</template>

<script setup>
import draggable from 'vuedraggable'
import moment from 'moment'
import { computed, onMounted, reactive, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

import csv from '@/lib/csv'
import func from '@/lib/func'
import { removeModelFromList } from '@/lib/models'
import { formatSimpleDate } from '@/lib/time'
import { sortByName } from '@/lib/sorting'
import {
  PRODUCTION_STYLE_OPTIONS,
  PRODUCTION_TYPE_OPTIONS
} from '@/lib/productions'

import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import DateField from '@/components/widgets/DateField.vue'
import EditAssetTypeModal from '@/components/modals/EditAssetTypeModal.vue'
import EditTaskStatusModal from '@/components/modals/EditTaskStatusModal.vue'
import EditTaskTypeModal from '@/components/modals/EditTaskTypeModal.vue'
import ImportModal from '@/components/modals/ImportModal.vue'
import ImportRenderModal from '@/components/modals/ImportRenderModal.vue'
import ManageShotsModal from '@/components/modals/ManageShotsModal.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'
import TextField from '@/components/widgets/TextField.vue'
import TimelineItem from '@/components/pages/production/TimelineItem.vue'
import ValidationTag from '@/components/widgets/ValidationTag.vue'

import assetTypeStore from '@/store/modules/assettypes'
import taskStatusStore from '@/store/modules/taskstatus.js'
import taskTypeStore from '@/store/modules/tasktypes'

const { t } = useI18n()
const router = useRouter()
const store = useStore()

const nameField = useTemplateRef('nameField')
const importAssetsModal = useTemplateRef('import-assets-modal')
const importShotsModal = useTemplateRef('import-shots-modal')

const errors = reactive({
  creatingProduction: false,
  creatingProductionError: '',
  creatingTaskType: false,
  creatingTaskStatus: false,
  creatingAssetType: false,
  importingAssets: false,
  importingAssetsError: null,
  importingShots: false,
  importingShotsError: null
})
const loading = reactive({
  createProduction: false,
  importingAssets: false,
  importingShots: false,
  creatingTaskType: false,
  creatingTaskStatus: false,
  creatingAssetType: false
})
const modals = reactive({
  isAddAssetsDisplayed: false,
  isAddAssetTypeDisplayed: false,
  isAddShotsDisplayed: false,
  isAddTaskStatusDisplayed: false,
  isAddTaskTypeDisplayed: false,
  isAssetsImportDisplayed: false,
  isAssetsImportRenderDisplayed: false,
  isShotsImportDisplayed: false,
  isShotsImportRenderDisplayed: false
})
const parsedAssetsCSV = ref([])
const parsedShotsCSV = ref([])
const productionToCreate = reactive({
  assetsToAdd: null,
  assetTypes: [],
  assetTaskTypes: [],
  episodesToCreate: [],
  name: null,
  project_template_id: null,
  sequencesToCreate: [],
  settings: {
    dateStart: null,
    dateEnd: null,
    fps: 25,
    ratio: [16, 9],
    resolution: [1920, 1080],
    style: PRODUCTION_STYLE_OPTIONS[0].value,
    type: PRODUCTION_TYPE_OPTIONS[0].value
  },
  shotsToAdd: null,
  shotTaskTypes: [],
  shotsToCreate: [],
  taskStatuses: []
})
const assetsOptionalColumns = ['Description', 'Ready for', 'Resolution']
const shotsOptionalColumns = [
  'Description',
  'Nb Frames',
  'Frame In',
  'Frame Out',
  'FPS',
  'Resolution'
]
const taskTypeForEntity = ref('Asset')
const genericColumns = [
  'metadata_column_name => text value',
  'task_type_name => task_status_name',
  'task_type_name comment => comment text'
]
const productionStyleOptions = PRODUCTION_STYLE_OPTIONS
const productionTypeOptions = PRODUCTION_TYPE_OPTIONS

const assetsCsvFormData = computed(() => store.getters.assetsCsvFormData)
const assetTaskTypes = computed(() => store.getters.assetTaskTypes)
const assetTypes = computed(() => store.getters.assetTypes)
const productionStatus = computed(() => store.getters.productionStatus)
const projectTemplates = computed(() => store.getters.projectTemplates)
const shotsCsvFormData = computed(() => store.getters.shotsCsvFormData)
const shotTaskTypes = computed(() => store.getters.shotTaskTypes)
const taskStatus = computed(() => store.getters.taskStatus)

const projectTemplateOptions = computed(() => [
  { label: t('productions.creation.no_template'), value: null },
  ...projectTemplates.value.map(template => ({
    label: template.name,
    value: template.id
  }))
])

const assetTypeMap = computed(() => assetTypeStore.cache.assetTypeMap)
const taskStatusMap = computed(() => taskStatusStore.cache.taskStatusMap)
const taskTypeMap = computed(() => taskTypeStore.cache.taskTypeMap)

const isTVShow = computed(() => productionToCreate.settings.type === 'tvshow')
const isAssetsOnly = computed(
  () => productionToCreate.settings.type === 'assets'
)
const isShotsOnly = computed(() => productionToCreate.settings.type === 'shots')

const assetsDataMatchers = computed(() =>
  isTVShow.value ? ['Episode', 'Type', 'Name'] : ['Type', 'Name']
)

const shotsDataMatchers = computed(() =>
  isTVShow.value ? ['Episode', 'Sequence', 'Name'] : ['Sequence', 'Name']
)

const assetsRenderColumns = computed(() => {
  const collection = [...assetsDataMatchers.value, ...assetsOptionalColumns]
  productionToCreate.assetTaskTypes.forEach(item => {
    collection.push(item.name)
    collection.push(item.name + ' comment')
  })
  return collection
})

const shotsRenderColumns = computed(() => {
  const collection = [...shotsDataMatchers.value, ...shotsOptionalColumns]
  productionToCreate.shotTaskTypes.forEach(item => {
    collection.push(item.name)
    collection.push(item.name + ' comment')
  })
  return collection
})

const allowedProductionTypes = computed(() =>
  PRODUCTION_TYPE_OPTIONS.map(option => option.value)
)

const isEmpty = value =>
  value === null ||
  value === undefined ||
  value === '' ||
  value === [] ||
  value === {}

const isFloat = value => !isEmpty(value) && /^[(\d)*,(\d)+]|(\d)+$/.test(value)

const isInteger = value => !isEmpty(value) && /^\d+$/.test(value)

const hasValidName = computed(() => !isEmpty(productionToCreate.name))
const hasValidStartDate = computed(
  () => !isEmpty(productionToCreate.settings.dateStart)
)
const hasValidEndDate = computed(
  () => !isEmpty(productionToCreate.settings.dateEnd)
)
const hasValidAssets = computed(() => nbAssetsToImport.value > 0)
const hasValidAssetTypes = computed(
  () => productionToCreate.assetTypes.length > 0
)
const hasValidShots = computed(() => nbShotsToImport.value > 0)

const hasValidFPS = computed(() => {
  const fps = parseInt(productionToCreate.settings.fps)
  return fps > 0 && fps <= 60
})

const hasValidRatio = computed(() => {
  if (isEmpty(productionToCreate.settings.ratio)) return false
  return (
    productionToCreate.settings.ratio.length === 2 &&
    isFloat(productionToCreate.settings.ratio[0]) &&
    isInteger(productionToCreate.settings.ratio[1])
  )
})

const hasValidResolution = computed(() => {
  if (isEmpty(productionToCreate.settings.resolution)) return false
  return (
    productionToCreate.settings.resolution.length === 2 &&
    isInteger(productionToCreate.settings.resolution[0]) &&
    isInteger(productionToCreate.settings.resolution[1])
  )
})

const hasValidType = computed(() =>
  allowedProductionTypes.value.includes(productionToCreate.settings.type)
)

const hasValidSettings = computed(
  () =>
    hasValidType.value &&
    hasValidFPS.value &&
    hasValidRatio.value &&
    hasValidResolution.value &&
    hasValidStartDate.value &&
    hasValidEndDate.value
)

const hasValidAssetTaskTypes = computed(
  () => productionToCreate.assetTaskTypes.length > 0
)
const hasValidShotTaskTypes = computed(
  () => productionToCreate.shotTaskTypes.length > 0
)
const hasValidTaskStatuses = computed(
  () => productionToCreate.taskStatuses.length > 0
)

const hasAllDataCorrect = computed(() => {
  if (productionToCreate.project_template_id) return hasValidName.value
  return (
    hasValidName.value &&
    hasValidSettings.value &&
    (hasValidAssetTaskTypes.value || isShotsOnly.value) &&
    (hasValidShotTaskTypes.value || isAssetsOnly.value) &&
    hasValidTaskStatuses.value &&
    (hasValidAssetTypes.value || isShotsOnly.value)
  )
})

const availableAssetTaskTypes = computed(() =>
  assetTaskTypes.value.filter(
    att => !productionToCreate.assetTaskTypes.includes(att) && !att.archived
  )
)

const availableAssetTypes = computed(() => {
  const sorted = sortByName(
    assetTypes.value.filter(at => !productionToCreate.assetTypes.includes(at))
  )
  return [
    { name: t('asset_types.add_asset_type_placeholder'), id: '-' },
    ...sorted
  ].map(at => ({ label: at.name, value: at.id }))
})

const availableShotTaskTypes = computed(() =>
  shotTaskTypes.value.filter(
    stt => !productionToCreate.shotTaskTypes.includes(stt) && !stt.archived
  )
)

const availableTaskStatuses = computed(() =>
  taskStatus.value.filter(
    status =>
      !productionToCreate.taskStatuses.includes(status) &&
      !status.is_default &&
      !status.for_concept
  )
)

const nbAssetsToImport = computed(() => {
  if (productionToCreate.assetsToAdd) {
    const lines = productionToCreate.assetsToAdd.filter(l => l.length > 1)
    return lines.length - 1
  }
  return 0
})

const nbShotsToImport = computed(() => {
  let nb = productionToCreate.shotsToCreate.length
  if (productionToCreate.shotsToAdd) {
    const lines = productionToCreate.shotsToAdd.filter(l => l.length > 1)
    nb += lines.length - 1
  }
  return nb
})

const startDatePlaceholder = computed(() => formatSimpleDate(moment()))
const endDatePlaceholder = computed(() =>
  formatSimpleDate(moment().add(3, 'month'))
)

const deleteFromList = (object, listName) => {
  productionToCreate[listName] = removeModelFromList(
    productionToCreate[listName],
    object
  )
}

const createTaskTypesAndStatuses = async () => {
  await func.runPromiseAsSeries(
    productionToCreate.assetTaskTypes
      .concat(productionToCreate.shotTaskTypes)
      .map(async (taskType, index) => {
        const finalIndex =
          taskType.for_entity === 'Shot'
            ? index - productionToCreate.assetTaskTypes.length
            : index
        return await store.dispatch('addTaskTypeToProduction', {
          taskTypeId: taskType.id,
          priority: finalIndex + 1
        })
      })
      .concat(
        productionToCreate.taskStatuses.map(async taskStatus => {
          return await store.dispatch(
            'addTaskStatusToProduction',
            taskStatus.id
          )
        })
      )
  )
}

const createAssets = async () => {
  if (productionToCreate.assetsToAdd !== null) {
    loading.importingAssets = true
    errors.importingAssets = false
    try {
      await store.dispatch('uploadAssetFile', false)
    } catch (err) {
      errors.importingAssets = true
      errors.importingAssetsError = err
    }
    loading.importingAssets = false
  }
}

const createAssetTypes = () => {
  productionToCreate.assetTypes.map(async at =>
    store.dispatch('addAssetTypeToProduction', at.id)
  )
}

const createShots = async () => {
  if (productionToCreate.shotsToAdd !== null) {
    loading.importingShots = true
    errors.importingShots = false
    try {
      await store.dispatch('uploadShotFile', false)
    } catch (err) {
      errors.importingShots = true
      errors.importingShotsError = err
    }
    loading.importingShots = false
  }
}

const createTaskType = taskType => {
  loading.creatingTaskType = true
  errors.creatingTaskType = false
  store
    .dispatch('newTaskType', taskType)
    .then(() => {
      loading.creatingTaskType = false
      modals.isAddTaskTypeDisplayed = false
    })
    .catch(err => {
      console.error(err)
      loading.creatingTaskType = false
      errors.creatingTaskType = true
    })
}

const createTaskStatus = taskStatus => {
  loading.creatingTaskStatus = true
  errors.creatingTaskStatus = false
  store
    .dispatch('newTaskStatus', taskStatus)
    .then(() => {
      loading.creatingTaskStatus = false
      modals.isAddTaskStatusDisplayed = false
    })
    .catch(err => {
      console.error(err)
      loading.creatingTaskStatus = false
      errors.creatingTaskStatus = true
    })
}

const createAssetType = assetType => {
  loading.creatingAssetType = true
  errors.creatingAssetType = false
  store
    .dispatch('newAssetType', assetType)
    .then(() => {
      loading.creatingAssetType = false
      modals.isAddAssetTypeDisplayed = false
    })
    .catch(err => {
      console.error(err)
      loading.creatingAssetType = false
      errors.creatingAssetType = true
    })
}

const createProductionRoute = createdProduction => {
  const params = { production_id: createdProduction.id }
  let routeName = 'assets'
  if (isTVShow.value) {
    params.episode_id = 'all'
    routeName = 'episode-assets'
  } else if (isShotsOnly.value) {
    routeName = 'shots'
  }
  return { name: routeName, params }
}

const createProduction = async () => {
  if (loading.createProduction) return
  loading.createProduction = true
  errors.creatingProduction = false
  errors.creatingProductionError = ''
  try {
    const hasTemplate = !!productionToCreate.project_template_id
    const payload = {
      name: productionToCreate.name,
      project_status_id: productionStatus.value[0].id
    }
    if (hasTemplate) {
      payload.project_template_id = productionToCreate.project_template_id
    } else {
      Object.assign(payload, {
        fps: productionToCreate.settings.fps,
        ratio: productionToCreate.settings.ratio.join(':'),
        resolution: productionToCreate.settings.resolution.join('x'),
        production_type: productionToCreate.settings.type,
        production_style: productionToCreate.settings.style,
        start_date: productionToCreate.settings.dateStart,
        end_date: productionToCreate.settings.dateEnd
      })
    }
    const createdProduction = await store.dispatch('newProduction', payload)
    await store.dispatch('setProduction', createdProduction.id)
    if (!hasTemplate) {
      await createTaskTypesAndStatuses()
      await createAssetTypes()
    }
    await createAssets()
    if (productionToCreate.production_type !== 'assets') {
      await createShots()
    }
    await store.dispatch('loadContext')
    await router.push(createProductionRoute(createdProduction))
  } catch (err) {
    console.error(err)
    errors.creatingProduction = true
    errors.creatingProductionError = err.body?.message?.substring(0, 165) ?? ''
  }
  loading.createProduction = false
}

const toggleModal = modalName => {
  modals[modalName] = !modals[modalName]
}

const renderAssetsImport = (data, mode) => {
  loading.importingAssets = true
  errors.importingAssets = false
  if (mode === 'file') {
    data = data.get('file')
  }
  csv.processCSV(data).then(results => {
    parsedAssetsCSV.value = results
    toggleModal('isAssetsImportDisplayed')
    loading.importingAssets = false
    toggleModal('isAssetsImportRenderDisplayed')
  })
}

const resetAssetsImport = () => {
  errors.importingAssets = false
  toggleModal('isAssetsImportRenderDisplayed')
  store.commit('ASSET_CSV_FILE_SELECTED', null)
  productionToCreate.assetsToAdd = null
  importAssetsModal.value?.reset()
  toggleModal('isAssetsImportDisplayed')
}

const uploadAssetsImportFile = data => {
  const formData = new FormData()
  const file = new File([csv.turnEntriesToCsvString(data)], 'import.csv', {
    type: 'text/csv'
  })
  formData.append('file', file)
  store.commit('ASSET_CSV_FILE_SELECTED', formData)
  productionToCreate.assetsToAdd = data
  toggleModal('isAssetsImportRenderDisplayed')
}

const renderShotsImport = (data, mode) => {
  loading.importingShots = true
  errors.importingShots = false
  if (mode === 'file') {
    data = data.get('file')
  }
  csv.processCSV(data).then(results => {
    parsedShotsCSV.value = results
    toggleModal('isShotsImportDisplayed')
    loading.importingShots = false
    toggleModal('isShotsImportRenderDisplayed')
  })
}

const resetShotsImport = () => {
  errors.importingShots = false
  toggleModal('isShotsImportRenderDisplayed')
  store.commit('SHOT_CSV_FILE_SELECTED', null)
  productionToCreate.shotsToAdd = null
  importShotsModal.value?.reset()
  toggleModal('isShotsImportDisplayed')
}

const uploadShotsImportFile = data => {
  const formData = new FormData()
  const file = new File([csv.turnEntriesToCsvString(data)], 'import.csv', {
    type: 'text/csv'
  })
  formData.append('file', file)
  store.commit('SHOT_CSV_FILE_SELECTED', formData)
  productionToCreate.shotsToAdd = data
  toggleModal('isShotsImportRenderDisplayed')
}

const addEpisode = (episode, callback) => {
  productionToCreate.episodesToCreate.push(episode)
  episode.id = productionToCreate.episodesToCreate.length - 1
  callback(episode)
}

const addSequence = (sequence, callback) => {
  productionToCreate.sequencesToCreate.push(sequence)
  sequence.id = productionToCreate.sequencesToCreate.length - 1
  callback(sequence)
}

const addShot = (shot, callback) => {
  productionToCreate.shotsToCreate.push(shot)
  shot.id = productionToCreate.shotsToCreate.length - 1
  callback(shot)
}

const onAddLibraryAssetTaskTypeClicked = () => {
  taskTypeForEntity.value = 'Asset'
  modals.isAddTaskTypeDisplayed = true
}

const onAddLibraryShotTaskTypeClicked = () => {
  taskTypeForEntity.value = 'Shot'
  modals.isAddTaskTypeDisplayed = true
}

onMounted(() => {
  nameField.value?.focus()
  store.dispatch('loadProjectTemplates')
})
</script>

<style lang="scss" scoped>
.new-production {
  font-family: Lato;
}

.hero {
  background-color: inherit;
}

h2 {
  color: var(--text);
  font-size: 20px;
  letter-spacing: 5px;
  line-height: 24px;
  font-weight: 700;
  padding-bottom: 0.7em;
  text-transform: uppercase;
}

h1.title {
  color: var(--text);
  font-weight: 700;
  font-size: 48px;
  line-height: 56px;
  text-transform: capitalize;
}

h2.subtitle {
  border-bottom: 0;
}

.new-production > .columns {
  padding-bottom: 3rem;
}

span.input-separator {
  display: inline-block;
  padding: 3px;

  &.mr0 {
    margin-right: 0;
  }
}

.date-picker-wrapper {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
}

.task-type {
  margin-top: 4px;
}

.task-type.task-type-name:hover {
  cursor: grab;
}

.task-type.task-type-name {
  margin-right: 5px;
  margin-bottom: 5px;
  height: 2.3rem;
}

.inline-task-type-combo {
  display: inline-flex;
  width: auto;
  min-width: auto;
  border: 0;
}

.import-content {
  display: flex;
  align-items: center;
}

.w600 {
  max-width: 600px;
}

.flexrow-item {
  margin-right: 1em;
}

.flexrow-item.mr0 {
  margin-right: 0;
}

.flexrow-item.mr05 {
  margin-right: 0.25em;
}

.asset-type-name {
  border: 1px solid var(--text);
  border-radius: 5px;
  padding: 10px;
}

.asset-types {
  align-items: center;
}

.explaination {
  font-style: italic;
  margin-top: 0.2em;
}

.big-button {
  max-width: 100%;
  padding-left: 1.5em;
  padding-right: 1.5em;

  &:active,
  &:focus {
    color: white;
  }
}

@media screen and (max-width: 1000px) {
  .new-production.page {
    padding: 0.5em 1.5em;
    padding-top: 60px;
  }

  .column.is-offset-one-quarter.is-half {
    margin-left: 0;
    width: 100%;
    max-width: 100%;
    flex: 1 1 100%;
  }

  h1.title {
    font-size: 36px;
    line-height: 40px;
  }
}

@media screen and (max-width: 768px) {
  .new-production.page {
    padding: 0.5em 1em;
    padding-top: 50px;
  }

  .hero .hero-body {
    padding: 1em 0;
  }

  h2 {
    font-size: 16px;
    letter-spacing: 3px;
    line-height: 20px;
    padding-bottom: 0.4em;
  }

  h1.title {
    font-size: 28px;
    line-height: 32px;
  }

  .flexrow {
    flex-wrap: wrap;
  }

  .flexrow-item {
    margin-right: 0.5em;
  }

  .date-picker-wrapper {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5em;

    .input-separator {
      display: none;
    }
  }

  .import-content {
    flex-wrap: wrap;
    gap: 0.5em;
  }

  /* Deep: shrink the timeline bubble gap on mobile */
  :deep(.wrapper .timeline) {
    margin-right: 1rem;
  }

  :deep(.wrapper .step),
  :deep(.wrapper .check) {
    height: 28px;
    width: 28px;
    font-size: 14px;
    padding: 7px;
    padding-top: 0.1rem;
  }

  :deep(.wrapper h3.title) {
    font-size: 18px;
  }
}
</style>
