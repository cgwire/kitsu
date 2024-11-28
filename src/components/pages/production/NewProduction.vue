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
          :title="$t('productions.creation.production_settings')"
          :subtitle="$t('productions.creation.production_settings_description')"
          :step="2"
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
              :placeholder="$t('productions.creation.placeholder_resolution1')"
              v-model="productionToCreate.settings.resolution[0]"
              thin
            />
            <span class="input-separator flexrow-item mt15 mr05">x</span>
            <text-field
              class="flexrow-item"
              input-class=" is-small is-size-4"
              type="number"
              :placeholder="$t('productions.creation.placeholder_resolution2')"
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
                :label="$t('main.start_date')"
                :placeholder="startDatePlaceholder"
                :max-date="productionToCreate.settings.dateEnd"
                v-model="productionToCreate.settings.dateStart"
              />
              <span class="input-separator">-</span>
              <date-field
                :label="$t('main.end_date')"
                :placeholder="endDatePlaceholder"
                :min-date="productionToCreate.settings.dateStart"
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
          :step="3"
          :is-completed="hasValidAssetTaskTypes"
          v-if="!isShotsOnly"
        >
          <draggable item-key="id" v-model="productionToCreate.assetTaskTypes">
            <template #item="{ element: taskType }">
              <task-type-name
                class="task-type"
                deletable
                :task-type="taskType"
                @delete="deleteFromList(taskType, 'assetTaskTypes')"
              />
            </template>
            <template #footer>
              <combobox-task-type
                class="is-inline inline-task-type-combo"
                :task-type-list="availableAssetTaskTypes"
                add-placeholder
                @update:model-value="
                  id =>
                    productionToCreate.assetTaskTypes.push(taskTypeMap.get(id))
                "
                v-if="availableAssetTaskTypes.length"
              />
            </template>
          </draggable>
        </timeline-item>
        <timeline-item
          :title="$t('productions.creation.select_shot_task_type')"
          :subtitle="
            $t('productions.creation.select_shot_task_type_description')
          "
          :step="isShotsOnly ? 3 : 4"
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
            <template #footer>
              <combobox-task-type
                class="is-inline inline-task-type-combo"
                :task-type-list="availableShotTaskTypes"
                add-placeholder
                @update:model-value="
                  id =>
                    productionToCreate.shotTaskTypes.push(taskTypeMap.get(id))
                "
                v-if="availableShotTaskTypes.length"
              />
            </template>
          </draggable>
        </timeline-item>
        <timeline-item
          :title="$t('productions.creation.select_task_status')"
          :subtitle="$t('productions.creation.select_task_status_description')"
          :step="isShotsOnly || isAssetsOnly ? 4 : 5"
          :is-completed="hasValidTaskStatuses"
        >
          <div class="flexrow">
            <validation-tag
              class="task-status flexrow-item"
              :task="{ task_status_id: taskStatus.id }"
              :key="taskStatus.id"
              pointer
              is-static
              @click="deleteFromList(taskStatus, 'taskStatuses')"
              v-for="taskStatus in productionToCreate.taskStatuses"
            />
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
          </div>
        </timeline-item>
        <timeline-item
          :title="$t('productions.creation.add_asset_types')"
          :subtitle="$t('productions.creation.add_asset_types_description')"
          :step="isAssetsOnly ? 5 : 6"
          :is-completed="hasValidAssetTypes"
          v-if="!isShotsOnly"
        >
          <div class="flexrow asset-types mb1">
            <span
              :key="assetType.id"
              class="asset-type-name flexrow-item"
              @click="deleteFromList(assetType, 'assetTypes')"
              v-for="assetType in productionToCreate.assetTypes"
            >
              {{ assetType.name }}
            </span>
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
          </div>
        </timeline-item>
        <timeline-item
          :title="$t('productions.creation.add_assets')"
          :subtitle="$t('productions.creation.add_assets_description')"
          :step="isAssetsOnly ? 6 : 7"
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
          :step="isShotsOnly ? 5 : 8"
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

<script>
import draggable from 'vuedraggable'
import moment from 'moment'
import { mapActions, mapGetters } from 'vuex'

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
import ImportModal from '@/components/modals/ImportModal.vue'
import ImportRenderModal from '@/components/modals/ImportRenderModal.vue'
import ManageShotsModal from '@/components/modals/ManageShotsModal.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'
import TextField from '@/components/widgets/TextField.vue'
import TimelineItem from '@/components/pages/production/TimelineItem.vue'
import ValidationTag from '@/components/widgets/ValidationTag.vue'

export default {
  name: 'new-production',

  components: {
    draggable,
    Combobox,
    ComboboxStyled,
    ComboboxTaskType,
    ComboboxStatus,
    DateField,
    ImportModal,
    ImportRenderModal,
    ManageShotsModal,
    Spinner,
    TaskTypeName,
    TextField,
    TimelineItem,
    ValidationTag
  },

  data() {
    return {
      errors: {
        creatingProduction: false,
        creatingProductionError: '',
        importingAssets: false,
        importingAssetsError: null,
        importingShots: false,
        importingShotsError: null
      },
      loading: {
        createProduction: false,
        importingAssets: false,
        importingShots: false
      },
      modals: {
        isAddAssetsDisplayed: false,
        isAddShotsDisplayed: false,
        isAssetsImportDisplayed: false,
        isAssetsImportRenderDisplayed: false,
        isShotsImportDisplayed: false,
        isShotsImportRenderDisplayed: false
      },
      parsedAssetsCSV: [],
      parsedShotsCSV: [],
      productionToCreate: {
        assetsToAdd: null,
        assetTypes: [],
        assetTaskTypes: [],
        episodesToCreate: [],
        name: null,
        sequencesToCreate: [],
        settings: {
          dateStart: null,
          dateEnd: null,
          fps: 25, // eg: '24'
          ratio: [16, 9], // eg: [4, 3]
          resolution: [1920, 1080], // eg: [1440, 1080]
          style: PRODUCTION_STYLE_OPTIONS[0].value,
          type: PRODUCTION_TYPE_OPTIONS[0].value
        },
        shotsToAdd: null,
        shotTaskTypes: [],
        shotsToCreate: [],
        taskStatuses: []
      },
      assetsOptionalColumns: ['Description', 'Ready for'],
      shotsOptionalColumns: [
        'Description',
        'Nb Frames',
        'Frame In',
        'Frame Out',
        'FPS'
      ],
      genericColumns: [
        'metadata_column_name => text value',
        'task_type_name => task_status_name',
        'task_type_name comment => comment text'
      ],
      productionStyleOptions: PRODUCTION_STYLE_OPTIONS,
      productionTypeOptions: PRODUCTION_TYPE_OPTIONS
    }
  },

  mounted() {
    this.$refs.nameField.focus()
  },

  computed: {
    ...mapGetters([
      'assetsCsvFormData',
      'assetTaskTypes',
      'assetTypeMap',
      'assetTypes',
      'productions',
      'productionStatus',
      'shotsCsvFormData',
      'shotTaskTypes',
      'taskStatus',
      'taskStatusMap',
      'taskTypeMap',
      'user'
    ]),

    isTVShow() {
      return this.productionToCreate.settings.type === 'tvshow'
    },

    isAssetsOnly() {
      return this.productionToCreate.settings.type === 'assets'
    },

    isShotsOnly() {
      return this.productionToCreate.settings.type === 'shots'
    },

    assetsDataMatchers() {
      return this.isTVShow ? ['Episode', 'Type', 'Name'] : ['Type', 'Name']
    },

    assetsRenderColumns() {
      const collection = [
        ...this.assetsDataMatchers,
        ...this.assetsOptionalColumns
      ]

      this.productionToCreate.assetTaskTypes.forEach(item => {
        collection.push(item.name)
        collection.push(item.name + ' comment')
      })

      return collection
    },

    shotsRenderColumns() {
      const collection = [
        ...this.shotsDataMatchers,
        ...this.shotsOptionalColumns
      ]

      this.productionToCreate.shotTaskTypes.forEach(item => {
        collection.push(item.name)
        collection.push(item.name + ' comment')
      })

      return collection
    },

    shotsDataMatchers() {
      return this.isTVShow
        ? ['Episode', 'Sequence', 'Name']
        : ['Sequence', 'Name']
    },

    allowedProductionTypes() {
      return PRODUCTION_TYPE_OPTIONS.map(option => option.value)
    },

    hasValidName() {
      return !this.isEmpty(this.productionToCreate.name)
    },

    hasValidStartDate() {
      return !this.isEmpty(this.productionToCreate.settings.dateStart)
    },

    hasValidEndDate() {
      return !this.isEmpty(this.productionToCreate.settings.dateEnd)
    },

    hasValidAssets() {
      return this.nbAssetsToImport > 0
    },

    hasValidAssetTypes() {
      return this.productionToCreate.assetTypes.length > 0
    },

    hasValidShots() {
      return this.nbShotsToImport > 0
    },

    hasValidSettings() {
      return (
        this.hasValidType &&
        this.hasValidFPS &&
        this.hasValidRatio &&
        this.hasValidResolution &&
        this.hasValidStartDate &&
        this.hasValidEndDate
      )
    },

    hasValidFPS() {
      const fps = parseInt(this.productionToCreate.settings.fps)
      return fps > 0 && fps <= 60
    },

    hasValidRatio() {
      if (this.isEmpty(this.productionToCreate.settings.ratio)) {
        return false
      }
      return (
        this.productionToCreate.settings.ratio.length === 2 &&
        this.isFloat(this.productionToCreate.settings.ratio[0]) &&
        this.isInteger(this.productionToCreate.settings.ratio[1])
      )
    },

    hasValidResolution() {
      if (this.isEmpty(this.productionToCreate.settings.resolution)) {
        return false
      }
      return (
        this.productionToCreate.settings.resolution.length === 2 &&
        this.isInteger(this.productionToCreate.settings.resolution[0]) &&
        this.isInteger(this.productionToCreate.settings.resolution[1])
      )
    },

    hasValidType() {
      return this.allowedProductionTypes.includes(
        this.productionToCreate.settings.type
      )
    },

    hasValidAssetTaskTypes() {
      return this.productionToCreate.assetTaskTypes.length > 0
    },

    hasValidShotTaskTypes() {
      return this.productionToCreate.shotTaskTypes.length > 0
    },

    hasValidTaskStatuses() {
      return this.productionToCreate.taskStatuses.length > 0
    },

    hasAllDataCorrect() {
      return (
        this.hasValidName &&
        this.hasValidSettings &&
        (this.hasValidAssetTaskTypes || this.isShotsOnly) &&
        (this.hasValidShotTaskTypes || this.isAssetsOnly) &&
        this.hasValidTaskStatuses &&
        (this.hasValidAssetTypes || this.isShotsOnly)
      )
    },

    availableAssetTaskTypes() {
      return this.assetTaskTypes.filter(
        assetTaskType =>
          !this.productionToCreate.assetTaskTypes.includes(assetTaskType) &&
          !assetTaskType.archived
      )
    },

    availableAssetTypes() {
      const assetTypes = sortByName(
        this.assetTypes.filter(
          assetType => !this.productionToCreate.assetTypes.includes(assetType)
        )
      )
      return [
        {
          name: '+ Asset Type',
          id: '-'
        },
        ...assetTypes
      ].map(assetType => {
        return {
          label: assetType.name,
          value: assetType.id
        }
      })
    },

    availableShotTaskTypes() {
      return this.shotTaskTypes.filter(
        shotTaskType =>
          !this.productionToCreate.shotTaskTypes.includes(shotTaskType) &&
          !shotTaskType.archived
      )
    },

    availableTaskStatuses() {
      return this.taskStatus.filter(
        status =>
          !this.productionToCreate.taskStatuses.includes(status) &&
          !status.is_default &&
          !status.for_concept
      )
    },

    nbAssetsToImport() {
      if (this.productionToCreate.assetsToAdd) {
        const assetsLines = this.productionToCreate.assetsToAdd.filter(
          assetLine => assetLine.length > 1
        )
        return assetsLines.length - 1
      }
      return 0
    },

    nbShotsToImport() {
      let nbShots = this.productionToCreate.shotsToCreate.length
      if (this.productionToCreate.shotsToAdd) {
        const shotsLines = this.productionToCreate.shotsToAdd.filter(
          shotLine => shotLine.length > 1
        )
        nbShots += shotsLines.length - 1
      }
      return nbShots
    },

    startDatePlaceholder() {
      return formatSimpleDate(moment())
    },

    endDatePlaceholder() {
      return formatSimpleDate(moment().add(3, 'month'))
    }
  },

  methods: {
    ...mapActions([
      'addAssetTypeToProduction',
      'addTaskStatusToProduction',
      'addTaskTypeToProduction',
      'loadContext',
      'newProduction',
      'setProduction',
      'uploadAssetFile',
      'uploadShotFile'
    ]),

    removeModelFromList,

    deleteFromList(object, listName) {
      this.productionToCreate[listName] = removeModelFromList(
        this.productionToCreate[listName],
        object
      )
    },

    isEmpty(value) {
      return (
        value === null ||
        value === undefined ||
        value === '' ||
        value === [] ||
        value === {}
      )
    },

    isFloat(value) {
      return !this.isEmpty(value) && /^[(\d)*,(\d)+]|(\d)+$/.test(value)
    },

    isInteger(value) {
      return !this.isEmpty(value) && /^\d+$/.test(value)
    },

    async createTaskTypesAndStatuses() {
      await func.runPromiseAsSeries(
        this.productionToCreate.assetTaskTypes
          .concat(this.productionToCreate.shotTaskTypes)
          .map(
            // add task types
            async (taskType, index) => {
              const finalIndex =
                taskType.for_entity === 'Shot'
                  ? index - this.productionToCreate.assetTaskTypes.length
                  : index
              return await this.addTaskTypeToProduction({
                taskTypeId: taskType.id,
                priority: finalIndex + 1
              })
            }
          )
          .concat(
            // add task statuses
            this.productionToCreate.taskStatuses.map(async taskStatus => {
              return await this.addTaskStatusToProduction(taskStatus.id)
            })
          )
      )
    },

    async createAssets() {
      if (this.productionToCreate.assetsToAdd !== null) {
        this.loading.importingAssets = true
        this.errors.importingAssets = false
        await this.uploadAssetFile(false)
          .then(() => {
            this.loading.importingAssets = false
          })
          .catch(err => {
            this.loading.importingAssets = false
            this.errors.importingAssets = true
            this.errors.importingAssetsError = err
          })
      }
    },

    createAssetTypes() {
      this.productionToCreate.assetTypes.map(async assetType => {
        return await this.addAssetTypeToProduction(assetType.id)
      })
    },

    async createShots() {
      if (this.productionToCreate.shotsToAdd !== null) {
        this.loading.importingShots = true
        this.errors.importingShots = false
        await this.uploadShotFile(false)
          .then(() => {
            this.loading.importingShots = false
          })
          .catch(err => {
            this.loading.importingShots = false
            this.errors.importingShots = true
            this.errors.importingShotsError = err
          })
      }
    },

    createProductionRoute(createdProduction) {
      const params = {
        production_id: createdProduction.id
      }
      let routeName = 'assets'
      if (this.isTVShow) {
        params.episode_id = 'all'
        routeName = 'episode-assets'
      } else if (this.isShotsOnly) {
        routeName = 'shots'
      }
      return {
        name: routeName,
        params
      }
    },

    async createProduction() {
      if (this.loading.createProduction) return
      this.loading.createProduction = true
      this.errors.creatingProduction = false
      this.errors.creatingProductionError = ''
      try {
        const createdProduction = await this.newProduction({
          name: this.productionToCreate.name,
          project_status_id: this.productionStatus[0].id,
          fps: this.productionToCreate.settings.fps,
          ratio: this.productionToCreate.settings.ratio.join(':'),
          resolution: this.productionToCreate.settings.resolution.join('x'),
          production_type: this.productionToCreate.settings.type,
          production_style: this.productionToCreate.settings.style,
          start_date: this.productionToCreate.settings.dateStart,
          end_date: this.productionToCreate.settings.dateEnd
        })
        await this.setProduction(createdProduction.id)
        await this.createTaskTypesAndStatuses()
        await this.createAssetTypes()
        await this.createAssets()
        if (this.productionToCreate.production_type !== 'assets') {
          await this.createShots()
        }
        await this.loadContext()
        await this.$router.push(this.createProductionRoute(createdProduction))
      } catch (err) {
        console.error(err)
        this.errors.creatingProduction = true
        this.errors.creatingProductionError =
          err.body?.message?.substring(0, 165) ?? ''
      }
      this.loading.createProduction = false
    },

    toggleModal(modalName) {
      this.modals[modalName] = !this.modals[modalName]
    },

    renderAssetsImport(data, mode) {
      this.loading.importingAssets = true
      this.errors.importingAssets = false
      if (mode === 'file') {
        data = data.get('file')
      }
      csv.processCSV(data).then(results => {
        this.parsedAssetsCSV = results
        this.toggleModal('isAssetsImportDisplayed')
        this.loading.importingAssets = false
        this.toggleModal('isAssetsImportRenderDisplayed')
      })
    },

    resetAssetsImport() {
      this.errors.importingAssets = false
      this.toggleModal('isAssetsImportRenderDisplayed')
      this.$store.commit('ASSET_CSV_FILE_SELECTED', null)
      this.productionToCreate.assetsToAdd = null
      this.$refs['import-assets-modal'].reset()
      this.toggleModal('isAssetsImportDisplayed')
    },

    uploadAssetsImportFile(data, toUpdate) {
      const formData = new FormData()
      const filename = 'import.csv'
      const csvContent = csv.turnEntriesToCsvString(data)
      const file = new File([csvContent], filename, { type: 'text/csv' })

      formData.append('file', file)

      this.$store.commit('ASSET_CSV_FILE_SELECTED', formData)
      this.productionToCreate.assetsToAdd = data
      this.toggleModal('isAssetsImportRenderDisplayed')
    },

    renderShotsImport(data, mode) {
      this.loading.importingShots = true
      this.errors.importingShots = false
      if (mode === 'file') {
        data = data.get('file')
      }
      csv.processCSV(data).then(results => {
        this.parsedShotsCSV = results
        this.toggleModal('isShotsImportDisplayed')
        this.loading.importingShots = false
        this.toggleModal('isShotsImportRenderDisplayed')
      })
    },

    resetShotsImport() {
      this.errors.importingShots = false
      this.toggleModal('isShotsImportRenderDisplayed')
      this.$store.commit('SHOT_CSV_FILE_SELECTED', null)
      this.productionToCreate.shotsToAdd = null
      this.$refs['import-shots-modal'].reset()
      this.toggleModal('isShotsImportDisplayed')
    },

    uploadShotsImportFile(data, toUpdate) {
      const formData = new FormData()
      const filename = 'import.csv'
      const csvContent = csv.turnEntriesToCsvString(data)
      const file = new File([csvContent], filename, { type: 'text/csv' })

      formData.append('file', file)

      this.$store.commit('SHOT_CSV_FILE_SELECTED', formData)
      this.productionToCreate.shotsToAdd = data
      this.toggleModal('isShotsImportRenderDisplayed')
    },

    addEpisode(episode, callback) {
      this.productionToCreate.episodesToCreate.push(episode)
      episode.id = this.productionToCreate.episodesToCreate.length - 1
      callback(episode)
    },

    addSequence(sequence, callback) {
      this.productionToCreate.sequencesToCreate.push(sequence)
      sequence.id = this.productionToCreate.sequencesToCreate.length - 1
      callback(sequence)
    },

    addShot(shot, callback) {
      this.productionToCreate.shotsToCreate.push(shot)
      shot.id = this.productionToCreate.shotsToCreate.length - 1
      callback(shot)
    }
  }
}
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

  &:active,
  &:focus {
    color: white;
  }
}
</style>
