<template>
  <div class="breakdown page">
    <div class="breakdown-columns">
      <div class="breakdown-column casting-column">
        <div class="flexrow mb1">
          <div v-if="isEpisodeCasting">
            <h2 class="subtitle mt05">
              {{ $t('breakdown.episode_casting') }}
            </h2>
          </div>
          <combobox-styled
            class="mr1"
            :label="$t('main.for')"
            :options="castingTypeOptions"
            v-model="castingType"
            v-if="!isEpisodeCasting"
          />
          <combobox-styled
            :label="$t('shots.fields.sequence')"
            :options="castingSequencesOptions"
            v-model="sequenceId"
            v-if="isShotCasting"
          />
          <combobox-styled
            :label="$t('tasks.fields.asset_type')"
            :options="castingAssetTypesOptions"
            v-model="assetTypeId"
            v-if="isAssetCasting"
          />
          <span class="filler"></span>
          <show-infos-button class="flexrow-item" :is-breakdown="true" />
          <button-simple
            class="flexrow-item"
            :title="
              isTextMode
                ? $t('breakdown.picture_mode')
                : $t('breakdown.text_mode')
            "
            icon="type"
            :is-on="isTextMode"
            :is-responsive="true"
            @click="toggleTextMode"
          />
          <button-simple
            class="flexrow-item"
            icon="big-thumbnail"
            :is-on="isBigMode"
            :title="$t('tasks.big_thumbnails')"
            @click="isBigMode = !isBigMode"
          />
          <button-simple
            class="flexrow-item"
            :title="$t('main.csv.import_file')"
            icon="import"
            :is-responsive="true"
            @click="showImportModal"
            v-if="isCurrentUserManager"
          />
          <button-simple
            class="flexrow-item"
            icon="export"
            :is-responsive="true"
            :title="$t('main.csv.export_current_view')"
            @click="exportViewToCsv"
          />
          <button-href-link
            class="flexrow-item"
            :title="$t('main.csv.export_file')"
            icon="export-lines"
            :is-responsive="true"
            :path="exportUrlPath"
            v-if="isCurrentUserManager"
          />
        </div>

        <spinner class="mt1" v-if="isLoading" />

        <div class="flexrow mb05 list-options">
          <table-metadata-selector-menu
            namespace="breakdown"
            :descriptors="metadataDescriptors"
            :exclude="{
              fps: true,
              estimation: true,
              resolution: true,
              maxRetakes: true,
              timeSpent: true
            }"
            v-model="metadataDisplayHeaders"
            v-show="columnSelectorDisplayed"
            v-if="isShowInfosBreakdown"
          />
          <span class="filler"></span>

          <button-simple
            class="is-small mr05"
            icon="down"
            @click="toggleColumnSelector"
            v-if="isShowInfosBreakdown"
          />
        </div>

        <div
          ref="casting-header"
          class="casting-header flexrow"
          @scroll.passive="onCastingHeaderScroll"
          v-if="!isLoading"
        >
          <div
            class="entity-header"
            ref="name-header"
            :style="{
              'min-width': columnWidth.name ? columnWidth.name + 'px' : '250px'
            }"
          >
            <div>
              {{ $t('shots.fields.name') }}
            </div>
            <div class="filler"></div>
            <div
              ref="resizable-knob-name"
              class="resizable-knob"
              @mousedown.prevent="
                initResize('resizable-knob-name', 'name-header')
              "
            ></div>
          </div>
          <div class="standby-header" v-if="isShowInfosBreakdown">
            {{ $t('breakdown.fields.standby') }}
          </div>
          <div
            class="description-header"
            v-if="isShowInfosBreakdown && isDescription"
          >
            {{ $t('shots.fields.description') }}
          </div>
          <div
            class="frames-header"
            v-if="
              isShotCasting &&
              isFrames &&
              isShowInfosBreakdown &&
              metadataDisplayHeaders.frames
            "
          >
            {{ $t('shots.fields.nb_frames') }}
          </div>
          <div
            class="frames-header"
            v-if="
              isShotCasting &&
              isFrameIn &&
              isShowInfosBreakdown &&
              metadataDisplayHeaders.frameIn
            "
          >
            {{ $t('shots.fields.frame_in') }}
          </div>
          <div
            class="frames-header"
            v-if="
              isShotCasting &&
              isFrameOut &&
              isShowInfosBreakdown &&
              metadataDisplayHeaders.frameOut
            "
          >
            {{ $t('shots.fields.frame_out') }}
          </div>
          <div
            class="descriptor-header"
            :key="'descriptor-header-' + descriptor.id"
            :ref="'descriptor-header-' + descriptor.id"
            :style="{
              'min-width': columnWidth[descriptor.id]
                ? columnWidth[descriptor.id] + 'px'
                : '110px'
            }"
            v-for="descriptor in visibleMetadataDescriptors"
            v-show="isShowInfosBreakdown"
          >
            <div
              class="mr1"
              v-if="descriptorCurrentDepartments(descriptor).length"
            >
              <department-name
                :key="department.id"
                :department="department"
                no-padding
                only-dot
                v-for="department in descriptorCurrentDepartments(descriptor)"
              />
            </div>
            <span
              class="flexrow-item ellipsis descriptor-name filler"
              :title="descriptor.name"
            >
              {{ descriptor.name }}
            </span>
            <div
              :ref="'resizable-knob-descriptor-' + descriptor.id"
              class="resizable-knob"
              @mousedown.prevent="
                initResize(
                  'resizable-knob-descriptor-',
                  'descriptor-header-',
                  descriptor.id
                )
              "
            ></div>
          </div>
          <div
            :key="assetType"
            class="asset-type-header"
            v-for="assetType in castingAssetTypes"
          >
            {{ assetType }}
          </div>

          <div class="actions filler"></div>
        </div>

        <div
          ref="casting-list"
          class="casting-list"
          @scroll.passive="onCastingScroll"
          v-if="!isLoading"
        >
          <div class="shot-lines">
            <shot-line
              :key="entity.id"
              :entity="entity"
              :preview-file-id="entity.preview_file_id"
              :selected="selection[entity.id]"
              :name="getEntityName(entity)"
              :assets="castingByType[entity.id] || []"
              :asset-types="castingAssetTypes"
              :read-only="!isCurrentUserManager"
              :text-mode="isTextMode"
              :metadata-descriptors="metadataDescriptors"
              :metadata-display-headers="metadataDisplayHeaders"
              :big-mode="isBigMode"
              :is-description="isDescription"
              :is-save-error="saveErrors[entity.id]"
              :column-width="columnWidth"
              @add-one="addOneAsset"
              @click="selectEntity"
              @description-changed="onDescriptionChanged"
              @edit-label="onEditLabelClicked"
              @metadata-changed="onMetadataChanged"
              @remove-one="removeOneAssetFromSelection"
              @standby-changed="onStandbyChanged"
              v-for="entity in castingEntities"
            />
          </div>
        </div>
      </div>

      <div
        ref="asset-list"
        @scroll.passive="onAssetListScroll"
        class="breakdown-column assets-column"
        v-if="isCurrentUserManager"
      >
        <h2 class="subtitle">
          {{ $t('breakdown.all_assets') }}
        </h2>
        <div class="flexrow mt1 mb1">
          <button-simple
            class="flexrow-item"
            :title="$t('assets.new_asset')"
            icon="plus"
            @click="modals.isNewDisplayed = true"
            v-if="!isOnlyCurrentEpisode"
          />
          <span class="filler"></span>

          <button-simple
            class="flexrow-item"
            :text="$t('breakdown.show_library')"
            icon="assets"
            :is-on="libraryDisplayed"
            @click="libraryDisplayed = !libraryDisplayed"
            v-if="!isOnlyCurrentEpisode"
          />
          <button-simple
            class="flexrow-item"
            :text="$t('assets.only_current_episode')"
            :is-on="isOnlyCurrentEpisode"
            @click="isOnlyCurrentEpisode = !isOnlyCurrentEpisode"
            v-if="isTVShow && !isEpisodeCasting"
          />
        </div>

        <div class="filters-area flexrow">
          <search-field
            class="flexrow-item"
            ref="search-field"
            :can-save="true"
            @save="saveSearchQuery"
            @change="onSearchChange"
          />
          <button-simple
            class="flexrow-item"
            :title="$t('entities.build_filter.title')"
            icon="filter"
            @click="modals.isBuildFilterDisplayed = true"
          />
        </div>
        <div class="query-list">
          <search-query-list
            :groups="breakdownSearchFilterGroups"
            :is-group-enabled="true"
            :queries="breakdownSearchQueries"
            type="breakdown"
            @remove-search="removeSearchQuery"
          />
        </div>

        <spinner v-if="isAssetsLoading" />
        <template v-else>
          <div
            class="type-assets"
            :key="typeAssets.length > 0 ? typeAssets[0].asset_type_name : ''"
            v-for="typeAssets in availableAssetsByType"
          >
            <div class="asset-type">
              {{ typeAssets.length > 0 ? typeAssets[0].asset_type_name : '' }}
            </div>
            <div class="asset-list">
              <available-asset-block
                :key="asset.id"
                :asset="asset"
                :active="Object.keys(selection).length > 0"
                :text-mode="isTextMode"
                :big-mode="isBigMode"
                @add-one="addOneAsset"
                @add-ten="addTenAssets"
                v-for="asset in typeAssets"
                v-show="libraryDisplayed || !asset.shared"
              />
            </div>
          </div>
        </template>
      </div>
    </div>

    <import-render-modal
      :active="modals.isImportRenderDisplayed"
      :is-loading="loading.importing"
      :is-error="errors.importing"
      :import-error="errors.importingError"
      :parsed-csv="parsedCSV"
      :form-data="importCsvFormData"
      :columns="renderColumns"
      :data-matchers="dataMatchers"
      :database="filteredCasting"
      :disable-update="true"
      @reupload="resetImport"
      @cancel="hideImportRenderModal"
      @confirm="uploadImportFile"
    />

    <import-modal
      ref="import-modal"
      :active="modals.importing"
      :is-loading="loading.importing"
      :is-error="errors.importing"
      :form-data="importCsvFormData"
      :columns="csvColumns"
      :optional-columns="optionalCsvColumns"
      @cancel="hideImportModal"
      @confirm="renderImport"
    />

    <edit-label-modal
      ref="edit-label-modal"
      :active="modals.isEditLabelDisplayed"
      :is-loading="loading.editLabel"
      :is-error="loading.editError"
      :asset="editedAsset"
      :label="editedAssetLinkLabel"
      @cancel="modals.isEditLabelDisplayed = false"
      @confirm="confirmEditLabel"
    />

    <build-filter-modal
      ref="build-filter-modal"
      :active="modals.isBuildFilterDisplayed"
      @confirm="confirmBuildFilter"
      @cancel="modals.isBuildFilterDisplayed = false"
    />

    <edit-asset-modal
      ref="edit-asset-modal"
      :active="modals.isNewDisplayed"
      :asset-to-edit="{}"
      :is-error="errors.edit"
      :is-loading="loading.edit"
      :is-loading-stay="loading.stay"
      :is-success="success.edit"
      @confirm="confirmNewAsset"
      @confirm-and-stay="confirmNewAssetStay"
      @cancel="modals.isNewDisplayed = false"
    />

    <delete-modal
      :active="modals.isRemoveConfirmationDisplayed"
      :delete-button-text="$t('breakdown.remove.confirm')"
      :error-text="$t('breakdown.remove.error')"
      :is-loading="loading.remove"
      :is-error="loading.error"
      :text="$t('breakdown.remove.text')"
      @confirm="confirmAssetRemoval"
      @cancel="modals.isRemoveConfirmationDisplayed = false"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'

import csv from '@/lib/csv'
import clipboard from '@/lib/clipboard'
import preferences from '@/lib/preferences'
import stringHelpers from '@/lib/string'
import { range } from '@/lib/time'
import { searchMixin } from '@/components/mixins/search'
import { entityListMixin } from '@/components/mixins/entity_list'

import AvailableAssetBlock from '@/components/pages/breakdown/AvailableAssetBlock.vue'
import BuildFilterModal from '@/components/modals/BuildFilterModal.vue'
import ButtonHrefLink from '@/components/widgets/ButtonHrefLink.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import DepartmentName from '@/components/widgets/DepartmentName.vue'
import EditAssetModal from '@/components/modals/EditAssetModal.vue'
import EditLabelModal from '@/components/modals/EditLabelModal.vue'
import ImportRenderModal from '@/components/modals/ImportRenderModal.vue'
import ImportModal from '@/components/modals/ImportModal.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import SearchQueryList from '@/components/widgets/SearchQueryList.vue'
import ShotLine from '@/components/pages/breakdown/ShotLine.vue'
import ShowInfosButton from '@/components/widgets/ShowInfosButton.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import TableMetadataSelectorMenu from '@/components/widgets/TableMetadataSelectorMenu.vue'

export default {
  name: 'breakdown',

  mixins: [entityListMixin, searchMixin],

  components: {
    AvailableAssetBlock,
    BuildFilterModal,
    ButtonHrefLink,
    ButtonSimple,
    ComboboxStyled,
    DeleteModal,
    DepartmentName,
    EditAssetModal,
    EditLabelModal,
    ImportModal,
    ImportRenderModal,
    SearchField,
    SearchQueryList,
    ShotLine,
    ShowInfosButton,
    Spinner,
    TableMetadataSelectorMenu
  },

  data() {
    return {
      assetTypeId: '',
      castingType: 'shot',
      columnSelectorDisplayed: false,
      editedAsset: null,
      editedEntityId: null,
      editedAssetLinkLabel: null,
      episodeId: '',
      importCsvFormData: {},
      isBigMode: false,
      isLocked: false,
      isLoading: false,
      isOnlyCurrentEpisode: false,
      isTextMode: false,
      libraryDisplayed: false,
      optionalCsvColumns: ['Label'],
      parsedCSV: [],
      removalData: {},
      saveErrors: {},
      selection: {},
      sequenceId: 'all',
      errors: {
        edit: false,
        editLabel: false,
        importing: false,
        importingError: null,
        remove: false,
        stay: false
      },
      loading: {
        edit: false,
        editLabel: false,
        importing: false,
        remove: false,
        stay: false
      },
      metadataDisplayHeaders: {
        stdby: true,
        fps: false,
        frameIn: true,
        frameOut: true,
        frames: true,
        estimation: false,
        maxRetakes: false,
        resolution: false,
        timeSpent: false
      },
      modals: {
        isBuildFilterDisplayed: false,
        isEditLabelDisplayed: false,
        isNewDisplayed: false,
        isImportRenderDisplayed: false,
        isRemoveConfirmationDisplayed: false,
        importing: false
      },
      success: {
        edit: false
      },
      columnWidth: {}
    }
  },

  mounted() {
    if (!this.isLoading) {
      this.reset()
    }
    this.resetSequenceOption()
    this.setLastProductionScreen('breakdown')
    this.isTextMode = preferences.getBoolPreference('breakdown:text-mode')
    window.addEventListener('keydown', this.onKeyDown, false)

    this.resetDisplayHeaders()
    this.resetColumnWidth()
    this.setSearchFromUrl()
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeyDown)
  },

  computed: {
    ...mapGetters([
      'assetMap',
      'assetMetadataDescriptors',
      'assetTypeMap',
      'assetsByType',
      'breakdownSearchQueries',
      'breakdownSearchFilterGroups',
      'casting',
      'castingAssetTypeAssets',
      'castingAssetTypesOptions',
      'castingByType',
      'castingCurrentShot',
      'castingEpisodes',
      'castingSequenceShots',
      'castingSequencesOptions',
      'currentEpisode',
      'currentProduction',
      'departmentMap',
      'displayedSequences',
      'displayedShots',
      'episodeMap',
      'episodes',
      'isAssetsLoading',
      'isCurrentUserManager',
      'isFrameIn',
      'isFrameOut',
      'isFrames',
      'isShotsLoading',
      'isShowInfosBreakdown',
      'isTVShow',
      'sequenceMap',
      'shotMap',
      'shotMetadataDescriptors'
    ]),

    searchField() {
      return this.$refs['search-field']
    },

    castingTypeOptions() {
      const isAssetsOnly = this.currentProduction.production_type === 'assets'
      const isShotsOnly = this.currentProduction.production_type === 'shots'
      const options = []
      if (!isShotsOnly) {
        options.push({
          label: this.$t('assets.title'),
          value: 'asset'
        })
      }
      if (
        !isAssetsOnly &&
        (!this.isTVShow ||
          (this.currentEpisode && this.currentEpisode.id !== 'main'))
      ) {
        options.unshift({
          label: this.$t('shots.title'),
          value: 'shot'
        })
      }
      return options
    },

    availableAssetsByType() {
      const result = []
      this.assetsByType.forEach(typeGroup => {
        let newGroup = typeGroup.filter(
          asset =>
            !asset.canceled && (!asset.is_shared || this.libraryDisplayed)
        )
        if (this.isTVShow && this.isOnlyCurrentEpisode) {
          newGroup = typeGroup.filter(asset => {
            return (
              asset.episode_id === this.currentEpisode.id ||
              asset.casting_episode_ids?.includes(this.currentEpisode.id)
            )
          })
        }
        if (newGroup.length > 0) result.push(newGroup)
      })
      return result
    },

    exportUrlPath() {
      let path = `/api/export/csv/projects/${this.currentProduction.id}/casting.csv`
      let paramAdded = false
      if (this.currentEpisode) {
        path += `?episode_id=${this.currentEpisode.id}`
        paramAdded = true
      }
      if (this.isShotCasting) {
        path += `${paramAdded ? '&' : '?'}is_shot_casting=${this.isShotCasting}`
      }
      return path
    },

    isEpisodeCasting() {
      return this.currentEpisode && this.currentEpisode.id === 'all'
    },

    isAssetCasting() {
      return !this.isEpisodeCasting && this.castingType === 'asset'
    },

    isShotCasting() {
      return !this.isEpisodeCasting && this.castingType === 'shot'
    },

    castingEntities() {
      if (this.isEpisodeCasting) {
        return this.castingEpisodes
      } else if (this.isShotCasting) {
        return this.castingSequenceShots
      } else {
        if (
          this.isTVShow &&
          this.currentEpisode &&
          this.currentEpisode.id !== 'main'
        ) {
          return this.castingAssetTypeAssets.filter(
            asset =>
              asset.episode_id === this.currentEpisode.id ||
              asset.casting_episode_ids?.includes(this.currentEpisode.id)
          )
        } else if (this.isTVShow && this.currentEpisode.id === 'main') {
          return this.castingAssetTypeAssets.filter(asset => !asset.episode_id)
        } else {
          return this.castingAssetTypeAssets
        }
      }
    },

    castingAssetTypes() {
      const castingAssetTypes = []
      const assetTypeNameMap = {}
      this.castingEntities.forEach(entity => {
        if (this.castingByType[entity.id]) {
          this.castingByType[entity.id].forEach(type => {
            if (type[0] && !assetTypeNameMap[type[0].asset_type_name]) {
              assetTypeNameMap[type[0].asset_type_name] = true
              castingAssetTypes.push(type[0].asset_type_name)
            }
          })
        }
      })
      return castingAssetTypes.sort()
    },

    editLabelModal() {
      return this.$refs['edit-label-modal']
    },

    filteredCasting() {
      const casting = {}
      this.castingEntities.forEach(entity => {
        if (this.castingByType[entity.id]) {
          this.castingByType[entity.id].forEach(type => {
            type.forEach(item => {
              const castKey = `${item.asset_name}${item.asset_type_name}${item.name}`
              casting[castKey] = true
            })
          })
        }
      })
      return casting
    },

    isDescription() {
      return this.castingEntities.some(
        e => e.description && e.description.length > 0
      )
    },

    csvColumns() {
      return this.isTVShow && this.currentEpisode?.id !== 'all'
        ? ['Episode', 'Parent', 'Name', 'Asset Type', 'Asset', 'Occurences']
        : ['Parent', 'Name', 'Asset Type', 'Asset', 'Occurences']
    },

    renderColumns() {
      return [...this.csvColumns, ...this.optionalCsvColumns]
    },

    dataMatchers() {
      return this.isTVShow
        ? ['Episode', 'Name', 'Asset Type', 'Asset']
        : ['Name', 'Asset Type', 'Asset']
    },

    metadataDescriptors() {
      if (this.isEpisodeCasting) {
        return []
      } else if (this.isShotCasting) {
        return this.shotMetadataDescriptors
      } else {
        return this.assetMetadataDescriptors
      }
    }
  },

  methods: {
    ...mapActions([
      'addAssetToCasting',
      'editEpisode',
      'editShot',
      'editAsset',
      'displayMoreAssets',
      'loadEpisodeCasting',
      'loadEpisodes',
      'loadAssetCasting',
      'loadAssets',
      'loadShotCasting',
      'loadShots',
      'newAsset',
      'removeAssetFromCasting',
      'removeBreakdownSearch',
      'saveBreakdownSearch',
      'loadSequences',
      'saveBreakdownSearchFilterGroup',
      'saveCasting',
      'setAssetLinkLabel',
      'setAssetSearch',
      'setCastingEpisodes',
      'setCastingAssetType',
      'setCastingAssetTypes',
      'setCastingEpisode',
      'setCastingForProductionEpisodes',
      'setCastingSequence',
      'setCurrentEpisode',
      'setEntityCasting',
      'setLastProductionScreen',
      'uploadCastingFile'
    ]),

    reset() {
      if (!this.isTVShow) {
        const route = { ...this.$route }
        if (route && route.params && route.params.episode_id) {
          route.name = 'breakdown'
          route.params.episode_id = null
          this.$router.push(route)
        }
      }
      this.isLoading = true
      setTimeout(() => {
        this.reloadEntities()
      }, 100)
    },

    async reloadEntities() {
      this.isLoading = true
      await this.loadSequences()
      await this.loadShots()
      if (this.isTVShow) {
        if (this.currentEpisode) {
          this.episodeId = this.currentEpisode.id
        }
        this.setCastingEpisode(this.episodeId)
        this.setCastingForProductionEpisodes()
      } else {
        this.setCastingEpisode(null)
      }
      this.loadAssets({ all: true, withTasks: true }).then(() => {
        this.isLoading = false
        this.displayMoreAssets()
        this.setCastingAssetTypes()
        if (this.assetTypeId) {
          this.setCastingAssetType(this.assetTypeId)
        } else {
          this.setCastingSequence(this.sequenceId || 'all')
        }
        this.resetSequenceOption()
        this.resetSelection()
        if (
          (this.currentEpisode && this.currentEpisode.id === 'main') ||
          this.currentProduction.production_type === 'assets'
        ) {
          this.castingType = 'asset'
        }
      })
    },

    resetSequenceOption() {
      if (
        this.currentProduction.production_style === 'nft' &&
        this.castingSequencesOptions[1]
      ) {
        this.sequenceId = this.castingSequencesOptions[1].value
      }
    },

    resetSelection() {
      const selection = {}
      if (this.isEpisodeCasting) {
        this.castingEpisodes.forEach(episode => {
          selection[episode.id] = false
        })
      } else if (this.isShotCasting) {
        this.castingSequenceShots.forEach(shot => {
          selection[shot.id] = false
        })
      } else {
        this.castingAssetTypeAssets.forEach(asset => {
          selection[asset.id] = false
        })
      }
      this.selection = selection
    },

    confirmBuildFilter(query) {
      this.modals.isBuildFilterDisplayed = false
      this.searchField.setValue(query)
      this.onSearchChange(query)
    },

    onSearchChange(searchQuery) {
      this.setAssetSearch(searchQuery)
      this.setSearchInUrl(searchQuery)
      this.displayMoreAssets()
      this.displayMoreAssets()
    },

    selectEntity(entityId, event) {
      const previousSelection = { ...this.selection }
      if (!(event.ctrlKey || event.metaKey) && !event.shitKey) {
        this.clearSelection()
      }

      if (this.previousEntityId && event.shiftKey) {
        this.selectRange(this.previousEntityId, entityId)
      }

      if (!this.previousEntityId || !event.shiftKey) {
        this.previousEntityId = entityId
      }

      const nbElementsSelected = Object.keys(previousSelection).filter(
        k => previousSelection[k]
      ).length
      if (
        !previousSelection[entityId] ||
        (nbElementsSelected > 1 && !(event.ctrlKey || event.metaKey))
      ) {
        this.selection[entityId] = true
      } else if (
        previousSelection[entityId] &&
        (event.ctrlKey || event.metaKey)
      ) {
        this.selection[entityId] = false
      }
    },

    clearSelection() {
      Object.keys(this.selection)
        .filter(k => this.selection[k])
        .forEach(shotId => {
          this.selection[shotId] = false
        })
    },

    selectRange(previousEntityId, entityId) {
      const keys = Object.keys(this.selection)
      const previousIndex = keys.findIndex(k => k === previousEntityId)
      const index = keys.findIndex(k => k === entityId)

      let indexRange = []
      if (previousIndex < index) indexRange = range(previousIndex, index)
      else indexRange = range(index, previousIndex)

      indexRange.forEach(i => {
        if (i >= 0) this.selection[keys[i]] = true
      })
    },

    setLock() {
      if (!this.$options.lockTimeout) {
        this.$options.lockTimeout = setTimeout(() => {
          this.isLocked = false
        }, 3000)
      }
    },

    async addOneAsset(assetId, amount = 1) {
      this.isLocked = true
      const entityIds = Object.keys(this.selection).filter(
        key => this.selection[key]
      )

      for (const entityId of entityIds) {
        this.addAssetToCasting({
          entityId,
          assetId,
          nbOccurences: amount,
          label: this.castingType === 'shot' ? 'animate' : 'fixed'
        })

        delete this.saveErrors[entityId]

        try {
          await this.saveCasting(entityId)
          this.setLock()
        } catch (err) {
          this.saveErrors[entityId] = true
          console.error(err)
        }
      }
    },

    async addTenAssets(assetId) {
      this.addOneAsset(assetId, 10)
    },

    confirmAssetRemoval() {
      this.saveAssetRemoval(
        this.removalData.entityId,
        this.removalData.assetId,
        this.removalData.nbOccurences
      )
    },

    saveAssetRemoval(entityId, assetId, nbOccurences) {
      this.loading.remove = true
      this.removeAssetFromCasting({ entityId, assetId, nbOccurences })
      delete this.saveErrors[entityId]
      return this.saveCasting(entityId)
        .then(() => {
          this.setLock()
          this.modals.isRemoveConfirmationDisplayed = false
        })
        .catch(err => {
          this.saveErrors[entityId] = true
          this.errors.remove = true
          console.error(err)
        })
        .finally(() => {
          this.loading.remove = false
        })
    },

    async removeOneAssetFromSelection(assetId) {
      const entityIds = Object.keys(this.selection).filter(
        key => this.selection[key]
      )
      for (const entityId of entityIds) {
        const asset = this.casting[entityId].find(
          asset => asset.asset_id === assetId
        )
        if (asset) {
          await this.removeOneAsset(assetId, entityId, asset.nb_occurences)
        }
      }
    },

    removeOneAsset(assetId, entityId, nbOccurences) {
      this.isLocked = true
      if (this.isEpisodeCasting && nbOccurences === 1) {
        this.removalData = { assetId, entityId, nbOccurences }
        this.modals.isRemoveConfirmationDisplayed = true
        return Promise.resolve()
      } else {
        return this.saveAssetRemoval(entityId, assetId, 1)
      }
    },

    onAssetListScroll(event) {
      const assetList = this.$refs['asset-list']
      const maxHeight = assetList.scrollHeight - assetList.offsetHeight
      const position = event.target
      if (maxHeight < position.scrollTop + 100) {
        this.displayMoreAssets()
      }
    },

    showImportModal() {
      this.modals.importing = true
    },

    hideImportModal() {
      this.modals.importing = false
    },

    showImportRenderModal() {
      this.modals.isImportRenderDisplayed = true
    },

    hideImportRenderModal() {
      this.modals.isImportRenderDisplayed = false
    },

    renderImport(data, mode) {
      this.loading.importing = true
      this.errors.importing = false
      if (mode === 'file') {
        data = data.get('file')
      }
      csv.processCSV(data).then(results => {
        this.parsedCSV = results
        this.hideImportModal()
        this.loading.importing = false
        this.showImportRenderModal()
      })
    },

    uploadImportFile(data) {
      const formData = new FormData()
      const filename = 'import.csv'
      const csvContent = csv.turnEntriesToCsvString(data)
      const file = new File([csvContent], filename, { type: 'text/csv' })

      formData.append('file', file)

      this.loading.importing = true
      this.errors.importing = false
      this.errors.importingError = null
      this.importCsvFormData = formData

      this.uploadCastingFile(this.importCsvFormData)
        .then(() => {
          this.hideImportRenderModal()
          if (this.sequenceId) {
            this.setCastingSequence(this.sequenceId || 'all')
          }
        })
        .catch(err => {
          this.errors.importingError = err
          this.errors.importing = true
        })
        .finally(() => {
          this.loading.importing = false
        })
    },

    resetImport() {
      this.errors.importing = false
      this.errors.importingError = null
      this.hideImportRenderModal()
      this.importCsvFormData = undefined
      this.$refs['import-modal'].reset()
      this.showImportModal()
    },

    updateUrl() {
      let isChange = false
      let route = {}
      if (this.isEpisodeCasting) {
        const episodeId = this.$route.params.episode_id
        if (episodeId !== this.episodeId) {
          isChange = true
          route = {
            name: 'breakdown-episode',
            params: {
              production_id: this.currentProduction.id,
              episode_id: this.episodeId
            }
          }
        }
      } else if (this.isAssetCasting) {
        const assetTypeId = this.$route.params.asset_type_id || ''
        if (assetTypeId !== this.assetTypeId) {
          isChange = true
          route = {
            name: 'breakdown-asset-type',
            params: {
              production_id: this.currentProduction.id,
              asset_type_id: this.assetTypeId
            }
          }
        }
      } else {
        const sequenceId = this.$route.params.sequence_id || 'all'
        if (sequenceId !== this.sequenceId) {
          isChange = true
          route = {
            name: 'breakdown-sequence',
            params: {
              production_id: this.currentProduction.id,
              sequence_id: this.sequenceId || 'all'
            }
          }
        }
      }
      if (isChange) {
        let episodeId = this.$route.params.episode_id
        if (!episodeId && this.currentEpisode) {
          episodeId = this.currentEpisode.id
        }
        if (episodeId) {
          route.name = `episode-${route.name}`
          route.params.episode_id = episodeId
          if (episodeId === 'all') route.params.sequence_id = 'all'
        }
        this.$router.push(route)
      }
    },

    onEditLabelClicked(asset, label, entityId) {
      this.editedAsset = asset
      this.editedEntityId = entityId
      this.editedAssetLinkLabel = label
      this.modals.isEditLabelDisplayed = true
    },

    confirmEditLabel(form = {}) {
      const label = form.label
      this.loading.editLabel = true
      this.setAssetLinkLabel({
        label: label,
        asset: this.editedAsset,
        targetEntityId: this.editedEntityId
      })
        .then(() => {
          this.modals.isEditLabelDisplayed = false
          this.loading.editLabel = false
        })
        .catch(err => {
          console.error(err)
          this.errors.editLabel = true
          this.loading.editLabel = false
        })
    },

    toggleTextMode() {
      this.isTextMode = !this.isTextMode
      localStorage.setItem('breakdown:text-mode', this.isTextMode)
    },

    toggleColumnSelector() {
      this.columnSelectorDisplayed = !this.columnSelectorDisplayed
    },

    confirmNewAssetStay(form) {
      this.loading.stay = true
      this.success.edit = false
      this.newAsset(form)
        .then(asset => {
          this.loading.stay = false
          this.loading.edit = false
          this.resetLightEditModal(asset)
          this.$refs['edit-asset-modal'].focusName()
          this.success.edit = true
        })
        .catch(err => {
          console.error(err)
          this.loading.stay = false
          this.loading.edit = false
          this.success.edit = false
          this.errors.edit = true
        })
    },

    confirmNewAsset(form) {
      this.loading.edit = true
      this.errors.edit = false
      this.newAsset(form)
        .then(() => {
          this.loading.edit = false
          this.modals.isNewDisplayed = false
        })
        .catch(err => {
          console.error(err)
          this.loading.edit = false
          this.errors.edit = true
        })
    },

    resetLightEditModal(asset) {
      const form = {
        name: '',
        entity_type_id: asset.entit_type_id,
        production_id: this.currentProduction.id
      }
      this.assetToEdit = form
    },

    onKeyDown(event) {
      if (!['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
        if ((event.ctrlKey || event.metaKey) && event.keyCode === 67) {
          // ctrl + c
          this.copyCasting()
        } else if ((event.ctrlKey || event.metaKey) && event.keyCode === 86) {
          // ctrl + v
          this.pasteCasting()
        }
      }
    },

    copyCasting() {
      const selectedElementId = Object.keys(this.selection).find(
        key => this.selection[key]
      )
      const selectedCasting = this.casting[selectedElementId]
      clipboard.copyCasting(selectedCasting)
    },

    async pasteCasting() {
      const castingToPaste = clipboard.pasteCasting()
      if (!castingToPaste || castingToPaste.length === 0) return
      const selectedElements = Object.keys(this.selection).filter(
        key => this.selection[key]
      )
      for (const entityId of selectedElements) {
        this.setEntityCasting({
          entityId,
          casting: castingToPaste
        })
        delete this.saveErrors[entityId]
        await this.saveCasting(entityId)
          .then(this.setLock)
          .catch(err => {
            this.saveErrors[entityId] = true
            console.error(err)
          })
      }
      return castingToPaste
    },

    onMetadataChanged({ entry, descriptor, value }) {
      const metadata = {}
      metadata[descriptor.field_name] = value
      const data = {
        id: entry.id,
        data: metadata
      }
      if (this.isEpisodeCasting) {
        this.editEpisode(data)
      } else if (this.isShotCasting) {
        this.editShot(data)
      } else {
        this.editAsset(data)
      }
    },

    onDescriptionChanged(entity, value) {
      const data = {
        id: entity.id,
        description: value
      }
      if (this.isEpisodeCasting) {
        this.editEpisode(data)
      } else if (this.isShotCasting) {
        this.editShot(data)
      } else {
        this.editAsset(data)
      }
    },

    onStandbyChanged(entity, value) {
      const data = {
        id: entity.id,
        is_casting_standby: value
      }
      if (this.isEpisodeCasting) {
        this.editEpisode(data)
      } else if (this.isShotCasting) {
        this.editShot(data)
      } else {
        this.editAsset(data)
      }
    },

    descriptorCurrentDepartments(descriptor) {
      const departemts = descriptor.departments || []
      return departemts.map(departmentId =>
        this.departmentMap.get(departmentId)
      )
    },

    getEntityName(entity) {
      return this.sequenceId === 'all' &&
        (!this.isTVShow || (this.isTVShow && this.currentEpisode.id !== 'all'))
        ? entity.sequence_name + ' / ' + entity.name
        : entity.name
    },

    getCsvFileName() {
      const nameData = [
        moment().format('YYYY-MM-DD'),
        'kitsu',
        this.castingType + 's',
        this.currentProduction.name,
        this.$t('breakdown.title')
      ]
      if (this.isTVShow) {
        if (this.currentEpisode) {
          if (this.currentEpisode.id === 'all') {
            nameData.splice(4, 0, 'all')
          } else if (this.currentEpisode.id === 'main') {
            nameData.splice(4, 0, 'main pack')
            if (this.assetTypeId !== 'all' && this.castingType === 'asset') {
              nameData.splice(
                5,
                0,
                this.assetTypeMap.get(this.assetTypeId).name
              )
            }
          } else {
            nameData.splice(4, 0, this.currentEpisode.name)
            if (this.sequenceId !== 'all' && this.castingType === 'shot') {
              nameData.splice(5, 0, this.sequenceMap.get(this.sequenceId).name)
            }
            if (this.assetTypeId !== 'all' && this.castingType === 'asset') {
              nameData.splice(
                5,
                0,
                this.assetTypeMap.get(this.assetTypeId).name
              )
            }
          }
        }
      } else {
        if (this.sequenceId !== 'all' && this.castingType === 'shot') {
          nameData.splice(5, 0, this.sequenceMap.get(this.sequenceId).name)
        }
        if (this.assetTypeId !== 'all' && this.castingType === 'asset') {
          nameData.splice(5, 0, this.assetTypeMap.get(this.assetTypeId).name)
        }
      }
      return stringHelpers.slugify(nameData.join('_'))
    },

    getCsvFileHeaders() {
      const headers = [
        this.$t('shots.fields.name'),
        this.$t('breakdown.fields.standby')
      ]
      if (this.isFrames) {
        headers.push(this.$t('main.frames'))
      }
      if (this.isFrameIn) {
        headers.push(this.$t('main.frame_in'))
      }
      if (this.isFrameOut) {
        headers.push(this.$t('main.frame_out'))
      }
      this.metadataDescriptors.forEach(descriptor => {
        headers.push(descriptor.name)
      })
      return headers.concat(this.castingAssetTypes)
    },

    getCsvEntries() {
      const entries = this.castingEntities.map(entity => {
        const entry = [entity.name, entity.is_casting_standby ? 'X' : '']
        if (this.isFrames) {
          entry.push(entity.nb_frames)
        }
        if (this.isFrameIn) {
          entry.push(entity.data.frame_in)
        }
        if (this.isFrameOut) {
          entry.push(entity.data.frame_out)
        }
        this.metadataDescriptors.forEach(descriptor => {
          entry.push(entity.data[descriptor.field_name] || '')
        })

        const assets = this.castingByType[entity.id] || []
        const assetsByAssetTypesMap = {}
        assets.forEach(assetTypeAssets => {
          assetsByAssetTypesMap[assetTypeAssets[0].asset_type_name] =
            assetTypeAssets
        })
        this.castingAssetTypes.forEach(assetTypeName => {
          const typeAssets = assetsByAssetTypesMap[assetTypeName] || []
          const nbAssetsForType = typeAssets.reduce(
            (acc, a) => acc + a.nb_occurences,
            0
          )
          if (nbAssetsForType > 0) {
            let casting = nbAssetsForType + ' assets: '
            casting += typeAssets
              .map(asset => {
                return asset.asset_name + ' (' + asset.nb_occurences + ')'
              })
              .join(', ')
            entry.push(casting)
          } else {
            entry.push('')
          }
        })
        return entry
      })
      return entries
    },

    exportViewToCsv() {
      const entries = this.getCsvEntries()
      const name = this.getCsvFileName()
      const headers = this.getCsvFileHeaders()
      csv.buildCsvFile(name, [headers].concat(entries))
    },

    removeSearchQuery(searchQuery) {
      this.removeBreakdownSearch(searchQuery).catch(console.error)
    },

    saveSearchQuery(searchQuery) {
      if (this.loading.savingSearch) {
        return
      }
      this.loading.savingSearch = true
      this.saveBreakdownSearch(searchQuery)
        .catch(console.error)
        .finally(() => {
          this.loading.savingSearch = false
        })
    },

    initResize(knobRefName, refName, descriptorId) {
      this.resizedKnobRefName = knobRefName + (descriptorId ? descriptorId : '')
      this.resizedRefName = refName + (descriptorId ? descriptorId : '')
      this.resizedDescriptorId = descriptorId
      window.addEventListener('mousemove', this.startResizing)
      window.addEventListener('mouseup', this.stopResizing)
    },

    startResizing(event) {
      const knobRef = this.resizedKnobRefName
      const headerRef = this.resizedRefName
      const knob = this.$refs[knobRef][0]
        ? this.$refs[knobRef][0]
        : this.$refs[knobRef]
      const header = this.$refs[headerRef][0]
        ? this.$refs[headerRef][0]
        : this.$refs[headerRef]
      const diff = event.clientX - knob.getBoundingClientRect().left
      const actualWidth = header.getBoundingClientRect().width
      this.columnWidth = { ...this.columnWidth }
      if (this.resizedDescriptorId) {
        const newWidth = Math.max(actualWidth + diff, 110)
        this.columnWidth[this.resizedDescriptorId] = newWidth
        const preferenceKey = `breakdown:column-width-descriptor-${this.resizedDescriptorId}`
        preferences.setPreference(preferenceKey, newWidth)
      } else {
        const newWidth = Math.max(actualWidth + diff, 160)
        this.columnWidth.name = newWidth
        const preferenceKey =
          'breakdown:column-width-name-' +
          `${this.castingType}-${this.currentProduction.id}`
        preferences.setPreference(preferenceKey, newWidth)
      }
    },

    stopResizing() {
      window.removeEventListener('mousemove', this.startResizing)
      window.removeEventListener('mouseup', this.stopResizing)
      this.resizedKnobRefName = null
      this.resizedRefName = null
      this.resizedDescriptorId = null
    },

    resetDisplayHeaders() {
      if (this.isEpisodeCasting) {
        this.metadataDisplayHeaders = {}
      } else if (this.isShotCasting) {
        this.metadataDisplayHeaders = {
          stdby: true,
          fps: false,
          frameIn: true,
          frameOut: true,
          frames: true,
          estimation: false,
          maxRetakes: false,
          resolution: false,
          timeSpent: false
        }
      } else {
        this.metadataDisplayHeaders = {
          estimation: false,
          readyFor: false,
          timeSpent: false
        }
      }
    },

    resetColumnWidth() {
      const namePreferenceKey =
        'breakdown:column-width-name-' +
        `${this.castingType}-${this.currentProduction.id}`
      const nameColumnWidth = preferences.getPreference(namePreferenceKey)
      if (nameColumnWidth) {
        this.columnWidth.name = nameColumnWidth
      }

      this.metadataDescriptors.forEach(descriptor => {
        const descriptorColumnWidth = preferences.getPreference(
          `breakdown:column-width-descriptor-${descriptor.id}`
        )
        if (descriptorColumnWidth) {
          this.columnWidth[descriptor.id] = descriptorColumnWidth
        }
      })
    },

    onCastingHeaderScroll(event) {
      const position = event.target
      this.$refs['casting-list'].scrollLeft = position.scrollLeft
    },

    onCastingScroll(event) {
      const position = event.target
      this.$refs['casting-header'].scrollLeft = position.scrollLeft
    }
  },

  watch: {
    castingType() {
      if (this.isShotCasting && this.displayedSequences.length > 0) {
        this.sequenceId = this.displayedSequences[0].id
        this.assetTypeId = ''
      }
      if (this.isAssetCasting && this.castingAssetTypesOptions.length > 0) {
        const assetTypeId = this.$route.params.asset_type_id
        this.sequenceId = 'all'
        this.castingType = 'asset'
        if (assetTypeId) {
          this.assetTypeId = assetTypeId
        } else if (this.castingAssetTypesOptions.length > 0) {
          this.assetTypeId = this.castingAssetTypesOptions[0].value
        }
      }
      this.resetDisplayHeaders()
      this.resetColumnWidth()
    },

    sequenceId() {
      if (
        this.sequenceId &&
        this.displayedSequences &&
        this.displayedSequences.length > 0 &&
        !this.isAssetCasting
      ) {
        this.setCastingSequence(this.sequenceId)
        this.updateUrl()
        this.resetSelection()
      }
    },

    assetTypeId() {
      if (this.assetTypeId && this.castingAssetTypesOptions.length > 0) {
        this.setCastingAssetType(this.assetTypeId)
        this.updateUrl()
        this.resetSelection()
      }
    },

    episodeId() {
      if (this.episodeId && this.episodes && this.episodes.length > 0) {
        if (this.episodeId === 'all') {
          this.setCastingForProductionEpisodes(this.episodeId)
        }
        this.resetSelection()
      }
    },

    castingSequencesOptions() {
      if (this.$route.path.indexOf('asset-type') < 0) {
        const sequenceId = this.$route.params.sequence_id || 'all'
        if (sequenceId && this.sequenceMap.get(sequenceId)) {
          this.sequenceId = sequenceId
        } else if (this.castingSequencesOptions.length > 0) {
          this.sequenceId = this.castingSequencesOptions[0].value
        } else {
          this.sequenceId = 'all'
        }
      }
    },

    castingAssetTypesOptions() {
      if (this.$route.path.indexOf('asset-type') > 0) {
        const assetTypeId = this.$route.params.asset_type_id
        this.castingType = 'asset'
        if (assetTypeId) {
          this.assetTypeId = assetTypeId
        } else if (this.castingAssetTypesOptions.length > 0) {
          this.assetTypeId = this.castingAssetTypesOptions[0].value
        } else {
          this.assetTypeId = ''
        }
      }
    },

    currentProduction() {
      if (!this.isLoading) {
        this.reset()
        this.resetColumnWidth()
      }
    },

    currentEpisode() {
      if (
        this.currentEpisode &&
        this.episodeId !== this.currentEpisode.id &&
        !this.isLoading
      ) {
        if (this.currentEpisode.id === 'all') {
          this.episodeId = 'all'
        } else {
          this.reset()
        }
      }
    },

    displayedSequences() {
      this.$store.commit('CASTING_SET_SEQUENCES', this.displayedSequences)
    },

    '$route.query.search'() {
      this.setSearchFromUrl()
      const search = this.searchField.getValue()
      this.onSearchChange(search)
    }
  },

  socket: {
    events: {
      'episode:casting-update'(eventData) {
        const episode = this.episodeMap.get(eventData.episode_id)
        if (episode && !this.isLocked) {
          this.loadEpisodeCasting(episode)
        }
      },

      'shot:casting-update'(eventData) {
        const shot = this.shotMap.get(eventData.shot_id)
        if (shot && shot.sequence_id === this.sequenceId && !this.isLocked) {
          this.loadShotCasting(shot)
        }
      },

      'asset:casting-update'(eventData) {
        const asset = this.assetMap.get(eventData.asset_id)
        if (
          asset &&
          asset.asset_type_id === this.assetTypeId &&
          !this.isLocked
        ) {
          this.loadAssetCasting(asset)
        }
      }
    }
  },

  head() {
    if (this.isTVShow) {
      return {
        title:
          `${this.currentProduction?.name || ''}` +
          ` - ${this.currentEpisode?.name || ''}` +
          ` | ${this.$t('breakdown.title')} - Kitsu`
      }
    }
    return {
      title: `${this.currentProduction.name} | ${this.$t('breakdown.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .breakdown {
    background: $dark-grey-2;
  }
  .breakdown-column {
    background: $dark-grey-light;
    border: 1px solid #222;
    box-shadow: 0 0 6px #222;
  }
}

.breakdown {
  color: var(--text);
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: #fafafa;
  padding-left: 1em;
  padding-right: 1em;
  padding-bottom: 1em;
}

.breakdown-columns {
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow-y: auto;
  margin-top: 0.5em;
}

.breakdown-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 1em;
  background: white;
  border: 1px solid #eee;
  box-shadow: 0 0 6px #e0e0e0;
  border-radius: 1em;

  &:not(:first-child) {
    margin-left: 0.5em;
  }
}

.casting-column {
  overflow: hidden;
  flex: 1;
}

.assets-column {
  max-width: 460px;
}

.asset-type,
.sequence {
  text-transform: uppercase;
  color: $grey;
  border-bottom: 1px solid $light-grey;
  font-size: 1.2em;
  margin-bottom: 1em;
}

.asset-type {
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.asset-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.shots-title {
  font-weight: bold;
}

.subtitle {
  border-bottom: 0;
  margin-top: 0.1em;
  margin-bottom: 0;
}

.filters-area {
  margin-bottom: 0.5em;

  .search-field-wrapper {
    margin-right: 0.5em;
  }
}

.entity-header,
.description-header,
.descriptor-header,
.frames-header,
.asset-type-header,
.standby-header {
  border-right: 1px solid $light-grey;
  padding-left: 10px;
  align-self: stretch;
  display: flex;
  align-items: center;
}

.description-header {
  min-width: 250px;
  max-width: 250px;
}

.descriptor-header {
  min-width: 119px;
  max-width: 119px;
}

.frames-header {
  min-width: 81px;
  max-width: 81px;
  justify-content: right;
  padding-right: 0.6em;
}

.asset-type-header {
  padding-left: 1em;
  min-width: 150px;
  max-width: 150px;
}

.standby-header {
  max-width: 60px;
  min-width: 60px;
  text-align: center;
  justify-content: center;
  padding-left: 0;
}

.entity-header {
  border-top-left-radius: 10px;
  border-right: 2px solid $light-grey;
  margin: 0;
  max-width: 301px;
  min-width: 301px;
  padding-left: 0.5em;
  left: 0;
  position: sticky;
}

.actions {
  border-top-right-radius: 10px;
  height: 45px;
  text-align: right;
}

.casting-header {
  background: white;
  border-bottom: 2px solid $light-grey;
  font-size: 1.1em;
  color: var(--text-alt);
  font-size: 0.9em;
  font-weight: 600;
  letter-spacing: 1px;
  min-height: 40px;
  overflow-y: hidden;
  padding: 0;
  position: sticky;
  top: 0;
  text-transform: uppercase;
  z-index: 20;

  div {
    background: var(--background);
    padding-top: 0.5em;
    padding-bottom: 0.5em;
  }

  .actions {
    height: 100%;
  }

  .dark & {
    background: $dark-grey-light;
  }
}

.list-options {
  position: relative;
}

.casting-header div.resizable-knob {
  cursor: col-resize;
  height: 142%;
  width: 5px;

  &:hover {
    background: $grey;
  }
}

.casting-list {
  overflow: auto;
  display: flex;

  .shot-lines {
    flex: 1;
  }

  .actions {
    width: 100%;
    text-align: right;
  }
}

.query-list {
  margin-bottom: 0.5em;
}
</style>
