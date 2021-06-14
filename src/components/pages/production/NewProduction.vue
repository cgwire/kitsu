<template>
  <div class="new-production page">
    <div class="columns">
      <div class="column is-offset-one-quarter is-half">
        <section class="hero">
          <div class="hero-body">
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
            input-class=" is-small is-inline"
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
          <combobox
            :options="productionTypeOptions"
            localeKeyPrefix="productions.type."
            v-model="productionToCreate.settings.type"
            is-inline
            thin
          />
          <span class="input-separator">&gt;</span>
          <text-field
            input-class=" is-small is-inline is-size-3"
            type="number"
            :step="1"
            :placeholder="$t('productions.creation.placeholder_fps')"
            is-inline
            v-model="productionToCreate.settings.fps"
          />
          <span class="input-separator">fps &gt;</span>
          <text-field
            input-class=" is-small is-inline is-size-2"
            type="number"
            :step="1"
            :placeholder="$t('productions.creation.placeholder_ratio1')"
            is-inline
            v-model="productionToCreate.settings.ratio[0]"
          />
          <span class="input-separator">:</span>
          <text-field
            input-class=" is-small is-inline is-size-2"
            type="number"
            :step="1"
            :placeholder="$t('productions.creation.placeholder_ratio2')"
            is-inline
            v-model="productionToCreate.settings.ratio[1]"
          />
          <span class="input-separator">&gt;</span>
          <text-field
            input-class=" is-small is-inline is-size-4"
            type="number"
            :step="1"
            :placeholder="$t('productions.creation.placeholder_resolution1')"
            is-inline
            v-model="productionToCreate.settings.resolution[0]"
          />
          <span class="input-separator">x</span>
          <text-field
            input-class=" is-small is-inline is-size-4"
            type="number"
            :step="1"
            :placeholder="$t('productions.creation.placeholder_resolution2')"
            is-inline
            v-model="productionToCreate.settings.resolution[1]"
          />
          <div class="date-picker-wrapper">
            <calendar-icon />
            <datepicker
              wrapper-class="datepicker"
              input-class="is-small date-input input"
              :placeholder="$t('productions.creation.placeholder_date_start')"
              :language="locale"
              :disabled-dates="{ days: [6, 0] }"
              :monday-first="true"
              format="yyyy-MM-dd"
              v-model="productionToCreate.settings.dateStart"
            />
            <span class="input-separator">-</span>
            <datepicker
              wrapper-class="datepicker"
              input-class="is-small date-input input"
              :language="locale"
              :disabled-dates="{ days: [6, 0] }"
              :placeholder="$t('productions.creation.placeholder_date_end')"
              :monday-first="true"
              :disabledDates="{ to: productionToCreate.settings.dateStart }"
              format="yyyy-MM-dd"
              v-model="productionToCreate.settings.dateEnd"
            />
          </div>
        </timeline-item>
        <timeline-item
          :title="$t('productions.creation.select_asset_task_type')"
          :subtitle="$t(
            'productions.creation.select_asset_task_type_description'
           )"
          :step="3"
          :is-completed="hasValidAssetTaskTypes"
        >
          <draggable
            v-model="productionToCreate.assetTaskTypes"
            draggable=".task-type"
          >
            <task-type-name
              class="task-type"
              :task-type="taskType"
              :key="taskType.id"
              @delete="deleteFromList(taskType, 'assetTaskTypes')"
              deletable
              v-for="taskType in productionToCreate.assetTaskTypes"
            />
            <combobox-task-type
              slot="footer"
              class="is-inline"
              :task-type-list="availableAssetTaskTypes"
              @input="id => productionToCreate.assetTaskTypes.push(
                taskTypeMap.get(id)
              )"
              v-if="availableAssetTaskTypes.length > 0"
            />
          </draggable>
        </timeline-item>
        <timeline-item
          :title="$t('productions.creation.select_shot_task_type')"
          :subtitle="$t(
            'productions.creation.select_shot_task_type_description'
          )"
          :step="4"
          :is-completed="hasValidShotTaskTypes"
        >
          <draggable
            v-model="productionToCreate.shotTaskTypes"
            draggable=".task-type"
          >
            <task-type-name
              class="task-type"
              :task-type="taskType"
              :key="taskType.id"
              @delete="deleteFromList(taskType, 'shotTaskTypes')"
              deletable
              v-for="taskType in productionToCreate.shotTaskTypes"
            />
            <combobox-task-type
              slot="footer"
              class="is-inline"
              :task-type-list="availableShotTaskTypes"
              @input="id => productionToCreate.shotTaskTypes.push(
                taskTypeMap.get(id)
              )"
              v-if="availableShotTaskTypes.length > 0"
            />
          </draggable>
        </timeline-item>
        <timeline-item
          :title="$t('productions.creation.select_task_status')"
          :subtitle="$t('productions.creation.select_task_status_description')"
          :step="5"
          :is-completed="hasValidTaskStatuses"
        >
          <draggable
            v-model="productionToCreate.taskStatuses"
            draggable=".task-type"
          >
            <task-type-name
              class="task-type"
              :task-type="taskStatus"
              :key="taskStatus.id"
              @delete="deleteFromList(taskStatus, 'taskStatuses')"
              :deletable="taskStatus.short_name !== 'todo'"
              v-for="taskStatus in productionToCreate.taskStatuses"
            />
            <combobox-task-type
              slot="footer"
              class="is-inline"
              :task-type-list="availableTaskStatuses"
              @input="id => productionToCreate.taskStatuses.push(
                taskStatusMap.get(id)
              )"
              v-if="availableTaskStatuses.length > 0"
            />
          </draggable>
        </timeline-item>
        <timeline-item
          :title="$t('productions.creation.add_asset_types')"
          :subtitle="$t('productions.creation.add_asset_types_description')"
          :step="6"
          :is-completed="hasValidAssetTypes"
        >
          <div class="mb1">
            <task-type-name
              :task-type="{ ...assetType, color: '#000000' }"
              :key="assetType.id"
              @delete="deleteFromList(assetType, 'assetTypes')"
              deletable
              v-for="assetType in productionToCreate.assetTypes"
            />
          </div>
          <combobox
            class="is-inline"
            :options="availableAssetTypes"
            @input="id => {
              assetTypeMap.get(id) && productionToCreate.assetTypes.push(
                assetTypeMap.get(id)
              )
            }"
            v-if="availableAssetTypes.length > 0"
          />
        </timeline-item>
        <timeline-item
          :title="$t('productions.creation.add_assets')"
          :subtitle="$t('productions.creation.add_assets_description')"
          :step="7"
          :is-completed="hasValidAssets"
        >
          <div class="import-content">
            <span class="tag" v-if="nbAssetsToImport > 0">
              {{ nbAssetsToImport }}
              {{ $t('productions.creation.assets_to_import') }}
            </span>
            <button
              class="button ml1"
              @click="toggleModal('isAssetsImportDisplayed')"
            >
              + {{ $t('productions.creation.import_assets_button') }}
            </button>
          </div>
        </timeline-item>
        <timeline-item
          :title="$t('productions.creation.add_shots')"
          :subtitle="$t('productions.creation.add_shots_description')"
          :step="8"
          :is-completed="hasValidShots"
          is-last
        >
          <div class="import-content">
            <span class="tag" v-if="nbShotsToImport > 0">
              {{ nbShotsToImport }}
              {{ $t('productions.creation.shots_to_import') }}
            </span>
            <button
              class="button ml1"
              @click="toggleModal('isShotsImportDisplayed')"
            >
              + {{ $t('productions.creation.import_shots_button') }}
            </button>
<!--            <button-->
<!--              class="button ml1"-->
<!--              @click="toggleModal('isAddShotsDisplayed')"-->
<!--            >-->
<!--              + {{ $t('productions.creation.add_shots_button') }}-->
<!--            </button>-->
          </div>
        </timeline-item>
        <section class="has-text-centered mt2">
          <p v-if="errors.importingAssets" class="error">
            {{ $t('productions.creation.errorImportingAssets') }}
            <br>
            {{ errors.importingAssetsError }}
          </p>
          <p v-if="errors.importingShots" class="error">
            {{ $t('productions.creation.errorImportingShots') }}
            <br>
            {{ errors.importingShotsError }}
          </p>
          <p v-if="errors.creatingProduction" class="error">
            {{ $t('productions.creation.error') }}
            {{ errors.creatingProductionError }}
          </p>
          <button
            class="button big-button"
            v-if="hasAllDataCorrect"
            :disabled="loading.createProduction"
            @click="createProduction"
          >
            <spinner v-if="loading.createProduction" :size="20" class="mr1" />
            {{ $t('productions.creation.create_button') }}
          </button>
          <button class="button big-button" disabled v-else>
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
      :columns="assetsColumns"
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
      :columns="assetsColumns"
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
      :columns="shotsColumns"
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
      :columns="shotsColumns"
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
import Datepicker from 'vuejs-datepicker'
import { CalendarIcon } from 'vue-feather-icons'
import { en, fr } from 'vuejs-datepicker/dist/locale'
import { mapActions, mapGetters } from 'vuex'

import csv from '@/lib/csv'
import { removeModelFromList } from '@/lib/models'
import { PRODUCTION_TYPE_OPTIONS } from '@/lib/productions'

import Combobox from '@/components/widgets/Combobox'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType'
import ImportModal from '@/components/modals/ImportModal'
import ImportRenderModal from '@/components/modals/ImportRenderModal'
import ManageShotsModal from '@/components/modals/ManageShotsModal'
import Spinner from '@/components/widgets/Spinner'
import TaskTypeName from '@/components/widgets/TaskTypeName'
import TextField from '@/components/widgets/TextField'
import TimelineItem from '@/components/pages/production/TimelineItem'

export default {
  name: 'NewProduction',
  components: {
    draggable,
    CalendarIcon,
    Combobox,
    ComboboxTaskType,
    Datepicker,
    ImportModal,
    ImportRenderModal,
    ManageShotsModal,
    Spinner,
    TaskTypeName,
    TextField,
    TimelineItem
  },
  data () {
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
          type: PRODUCTION_TYPE_OPTIONS[0].value,
          fps: null, // eg: '24'
          ratio: [], // eg: [4, 3]
          resolution: [], // eg: [1440, 1080]
          dateStart: null,
          dateEnd: null
        },
        shotsToAdd: null,
        shotTaskTypes: [],
        shotsToCreate: [],
        taskStatuses: []
      },
      productionTypeOptions: PRODUCTION_TYPE_OPTIONS
    }
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

    isTVShow () {
      return this.productionToCreate.settings.type === 'tvshow'
    },
    assetsDataMatchers () {
      return this.isTVShow
        ? ['Episode', 'Type', 'Name']
        : ['Type', 'Name']
    },
    shotsDataMatchers () {
      return this.isTVShow
        ? ['Episode', 'Sequence', 'Name']
        : ['Sequence', 'Name']
    },
    assetsColumns () {
      return this.isTVShow
        ? ['Episode', 'Type', 'Name', 'Description']
        : ['Type', 'Name', 'Description']
    },
    shotsColumns () {
      const collection = [
        'Sequence',
        'Name',
        'Description',
        'Nb Frames',
        'FPS',
        'Frame In',
        'Frame Out'
      ]
      if (this.isTVShow) {
        collection.unshift('Episode')
      }
      return collection
    },
    locale () {
      if (this.user.locale === 'fr_FR') {
        return fr
      } else {
        return en
      }
    },
    allowedProductionTypes () {
      return PRODUCTION_TYPE_OPTIONS.map(
        option => option.value
      )
    },
    hasValidName () {
      return !this.isEmpty(this.productionToCreate.name)
    },
    hasValidStartDate () {
      return !this.isEmpty(this.productionToCreate.settings.dateStart)
    },
    hasValidEndDate () {
      return !this.isEmpty(this.productionToCreate.settings.dateEnd)
    },
    hasValidAssets () {
      return this.nbAssetsToImport > 0
    },
    hasValidAssetTypes () {
      return this.productionToCreate.assetTypes.length > 0
    },
    hasValidShots () {
      return this.nbShotsToImport > 0
    },
    hasValidSettings () {
      return (
        this.hasValidType &&
        this.hasValidFPS &&
        this.hasValidRatio &&
        this.hasValidResolution &&
        this.hasValidStartDate &&
        this.hasValidEndDate
      )
    },
    hasValidFPS () {
      return this.isInteger(this.productionToCreate.settings.fps)
    },
    hasValidRatio () {
      if (this.isEmpty(this.productionToCreate.settings.ratio)) {
        return false
      }
      return (
        this.productionToCreate.settings.ratio.length === 2 &&
        this.isInteger(this.productionToCreate.settings.ratio[0]) &&
        this.isInteger(this.productionToCreate.settings.ratio[1])
      )
    },
    hasValidResolution () {
      if (this.isEmpty(this.productionToCreate.settings.resolution)) {
        return false
      }
      return (
        this.productionToCreate.settings.resolution.length === 2 &&
        this.isInteger(this.productionToCreate.settings.resolution[0]) &&
        this.isInteger(this.productionToCreate.settings.resolution[1])
      )
    },
    hasValidType () {
      return this.allowedProductionTypes.indexOf(
        this.productionToCreate.settings.type
      ) !== -1
    },
    hasValidAssetTaskTypes () {
      return this.productionToCreate.assetTaskTypes.length > 0
    },
    hasValidShotTaskTypes () {
      return this.productionToCreate.shotTaskTypes.length > 0
    },
    hasValidTaskStatuses () {
      return this.productionToCreate.taskStatuses.length > 0
    },
    hasAllDataCorrect () {
      return (
        this.hasValidName &&
        this.hasValidSettings &&
        this.hasValidAssetTaskTypes &&
        this.hasValidShotTaskTypes &&
        this.hasValidTaskStatuses &&
        this.hasValidAssetTypes
      )
    },
    availableAssetTaskTypes () {
      return this.assetTaskTypes.filter(
        assetTaskType => this.productionToCreate.assetTaskTypes.indexOf(
          assetTaskType
        ) === -1
      )
    },
    availableAssetTypes () {
      return [
        { label: '-', value: '-' },
        ...this.assetTypes.filter(
          assetType => this.productionToCreate.assetTypes.indexOf(
            assetType
          ) === -1
        ).map((assetType) => {
          return {
            label: assetType.name,
            value: assetType.id
          }
        })
      ]
    },
    availableShotTaskTypes () {
      return this.shotTaskTypes.filter(
        shotTaskType => this.productionToCreate.shotTaskTypes.indexOf(
          shotTaskType
        ) === -1
      )
    },
    availableTaskStatuses () {
      return this.taskStatus.filter(
        status => this.productionToCreate.taskStatuses.indexOf(status) === -1
      )
    },
    nbAssetsToImport () {
      if (this.productionToCreate.assetsToAdd) {
        const assetsLines = this.productionToCreate.assetsToAdd.filter(
          assetLine => assetLine.length > 1
        )
        return assetsLines.length - 1
      }
      return 0
    },
    nbShotsToImport () {
      let nbShots = this.productionToCreate.shotsToCreate.length
      if (this.productionToCreate.shotsToAdd) {
        const shotsLines = this.productionToCreate.shotsToAdd.filter(
          shotLine => shotLine.length > 1
        )
        nbShots += shotsLines.length - 1
      }
      return nbShots
    }
  },
  methods: {
    ...mapActions([
      'addAssetTypeToProduction',
      'addTaskStatusToProduction',
      'addTaskTypeToProduction',
      'newProduction',
      'setProduction',
      'uploadAssetFile',
      'uploadShotFile'
    ]),
    removeModelFromList,
    deleteFromList (object, listName) {
      this.productionToCreate[listName] = removeModelFromList(
        this.productionToCreate[listName], object
      )
    },
    isEmpty (value) {
      return (
        value === null ||
        value === undefined ||
        value === '' ||
        value === [] ||
        value === {}
      )
    },
    isInteger (value) {
      return !this.isEmpty(value) && /^\d+$/.test(value)
    },
    async createTaskTypesAndStatuses () {
      await Promise.all(this.productionToCreate.assetTaskTypes.concat(
        this.productionToCreate.shotTaskTypes
      ).map(
        // add task types
        async (taskType) => {
          return await this.addTaskTypeToProduction(taskType.id)
        }
      ).concat(
        // add task statuses
        this.productionToCreate.taskStatuses.map(
          async (taskStatus) => {
            return await this.addTaskStatusToProduction(taskStatus.id)
          }
        )
      ))
    },
    async createAssets () {
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
    createAssetTypes () {
      this.productionToCreate.assetTypes.map(
        async (assetType) => {
          return await this.addAssetTypeToProduction(assetType.id)
        }
      )
    },
    async createShots () {
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
    createProductionRoute (createdProduction) {
      const params = {
        production_id: createdProduction.id
      }
      let routeName = 'assets'
      if (this.isTVShow) {
        params.episode_id = 'all'
        routeName = 'episode-assets'
      }
      return {
        name: routeName,
        params
      }
    },
    async createProduction () {
      this.loading.createProduction = true
      this.errors.creatingProduction = false
      this.errors.creatingProductionError = ''
      try {
        await this.newProduction({
          name: this.productionToCreate.name,
          project_status_id: this.productionStatus[0].id,
          fps: this.productionToCreate.settings.fps,
          ratio: this.productionToCreate.settings.ratio.join(':'),
          resolution: this.productionToCreate.settings.resolution.join('x'),
          production_type: this.productionToCreate.settings.type,
          start_date: this.productionToCreate.settings.dateStart,
          end_date: this.productionToCreate.settings.dateEnd
        })
        const createdProduction = this.productions[this.productions.length - 1]
        await this.setProduction(createdProduction.id)
        await this.createTaskTypesAndStatuses()
        await this.createAssetTypes()
        await this.createAssets()
        await this.createShots()
        await this.$router.push(this.createProductionRoute(createdProduction))
      } catch (error) {
        console.error(error, error.response)
        this.errors.creatingProduction = true
        this.errors.creatingProductionError = error.response
          ? ': ' + error.response.body.message.substring(0, 165)
          : ''
      }
      this.loading.createProduction = false
    },
    toggleModal (modalName) {
      this.modals[modalName] = !this.modals[modalName]
    },
    renderAssetsImport (data, mode) {
      this.loading.importingAssets = true
      this.errors.importingAssets = false
      if (mode === 'file') {
        data = data.get('file')
      }
      csv.processCSV(data)
        .then((results) => {
          this.parsedAssetsCSV = results
          this.toggleModal('isAssetsImportDisplayed')
          this.loading.importingAssets = false
          this.toggleModal('isAssetsImportRenderDisplayed')
        })
    },
    resetAssetsImport () {
      this.errors.importingAssets = false
      this.toggleModal('isAssetsImportRenderDisplayed')
      this.$store.commit('ASSET_CSV_FILE_SELECTED', null)
      this.productionToCreate.assetsToAdd = null
      this.$refs['import-assets-modal'].reset()
      this.toggleModal('isAssetsImportDisplayed')
    },
    uploadAssetsImportFile (data, toUpdate) {
      const formData = new FormData()
      const filename = 'import.csv'
      const csvContent = csv.turnEntriesToCsvString(data)
      const file = new File(
        [csvContent], filename, { type: 'text/csv' }
      )

      formData.append('file', file)

      this.$store.commit('ASSET_CSV_FILE_SELECTED', formData)
      this.productionToCreate.assetsToAdd = data
      this.toggleModal('isAssetsImportRenderDisplayed')
    },
    renderShotsImport (data, mode) {
      this.loading.importingShots = true
      this.errors.importingShots = false
      if (mode === 'file') {
        data = data.get('file')
      }
      csv.processCSV(data)
        .then((results) => {
          this.parsedShotsCSV = results
          this.toggleModal('isShotsImportDisplayed')
          this.loading.importingShots = false
          this.toggleModal('isShotsImportRenderDisplayed')
        })
    },
    resetShotsImport () {
      this.errors.importingShots = false
      this.toggleModal('isShotsImportRenderDisplayed')
      this.$store.commit('SHOT_CSV_FILE_SELECTED', null)
      this.productionToCreate.shotsToAdd = null
      this.$refs['import-shots-modal'].reset()
      this.toggleModal('isShotsImportDisplayed')
    },
    uploadShotsImportFile (data, toUpdate) {
      const formData = new FormData()
      const filename = 'import.csv'
      const csvContent = csv.turnEntriesToCsvString(data)
      const file = new File(
        [csvContent], filename, { type: 'text/csv' }
      )

      formData.append('file', file)

      this.$store.commit('SHOT_CSV_FILE_SELECTED', formData)
      this.productionToCreate.shotsToAdd = data
      this.toggleModal('isShotsImportRenderDisplayed')
    },
    addEpisode (episode, callback) {
      this.productionToCreate.episodesToCreate.push(episode)
      episode.id = this.productionToCreate.episodesToCreate.length - 1
      callback(episode)
    },
    addSequence (sequence, callback) {
      this.productionToCreate.sequencesToCreate.push(sequence)
      sequence.id = this.productionToCreate.sequencesToCreate.length - 1
      callback(sequence)
    },
    addShot (shot, callback) {
      this.productionToCreate.shotsToCreate.push(shot)
      shot.id = this.productionToCreate.shotsToCreate.length - 1
      callback(shot)
    }
  }
}
</script>

<style scoped>
.dark .tag {
  color: #EEE;
  background: #5E6169;
}

.hero {
  background-color: inherit;
}

h1.title {
  font-weight: bold;
}

.new-production > .columns {
  padding-bottom: 3rem
}

span.input-separator {
  display: inline-block;
  padding: 3px;
}

>>> .input.is-small {
  height: 2rem;
  font-size: 1rem;
  padding: 0 0.5rem;
}

>>> .input.is-size-2 {
  width: 3.5rem;
}

>>> .input.is-size-3 {
  width: 4rem;
}

>>> .input.is-size-4 {
  width: 4.5rem;
}

>>> .datepicker {
  display: inline-flex;
}

.date-picker-wrapper {
  margin-top: .5rem;
  display: flex;
  align-items: center;
}

>>> .datepicker input.date-input {
  width: 6.5rem;
}

>>> .task-type.task-type-name:hover {
  cursor: grab;
}
>>> .task-type.task-type-name {
  margin-right: 5px;
  margin-bottom: 5px;
  height: 2.3rem;
}
>>> .task-type-combo {
  display: inline-flex;
  width: auto;
  min-width: auto;
}
>>> .selected-task-type-line {
  padding: 0;
  margin-right: 0;
}

.import-content {
  display: flex;
  align-items: center;
}
</style>
