<template>
  <div class="breakdown page">
    <div class="breakdown-columns">
      <div class="breakdown-column casting-column">
        <div class="flexrow mb1 casting-toolbar">
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
          <show-infos-button class="flexrow-item desktop-only" />
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
            class="flexrow-item desktop-only"
            :title="$t('main.csv.import_file')"
            icon="import"
            :is-responsive="true"
            @click="showImportModal"
            v-if="isCurrentUserManager"
          />
          <button-simple
            class="flexrow-item desktop-only"
            icon="export"
            :is-responsive="true"
            :title="$t('main.csv.export_current_view')"
            @click="exportViewToCsv"
          />
          <button-href-link
            class="flexrow-item desktop-only"
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
            :production-id="currentProduction?.id"
            v-model="metadataDisplayHeaders"
            v-model:is-open="columnSelectorDisplayed"
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
            :style="{ 'min-width': nameHeaderMinWidth }"
          >
            <div>
              {{ $t('shots.fields.name') }}
            </div>
            <div class="filler"></div>
            <div
              class="resizable-knob"
              @mousedown.prevent="initResize($event)"
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
            :style="{
              'min-width': columnWidth[descriptor.id]
                ? columnWidth[descriptor.id] + 'px'
                : '110px'
            }"
            v-for="descriptor in visibleMetadataDescriptors"
            v-show="isShowInfosBreakdown"
          >
            <span
              class="descriptor-departments mr05"
              v-if="descriptorCurrentDepartments(descriptor).length"
            >
              <department-name
                :key="department.id"
                :department="department"
                no-padding
                only-dot
                v-for="department in descriptorCurrentDepartments(descriptor)"
              />
            </span>
            <span
              class="ellipsis nowrap descriptor-name filler"
              :title="descriptor.name"
            >
              {{ descriptor.name }}
            </span>
            <div
              class="resizable-knob"
              @mousedown.prevent="initResize($event, descriptor.id)"
            ></div>
          </div>
          <div
            :key="assetType"
            class="asset-type-header"
            v-for="assetType in castingAssetTypes"
          >
            <span class="ellipsis nowrap" :title="assetType">
              {{ assetType }}
            </span>
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
              :selection="selection"
              :name="getEntityName(entity)"
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
              @edit-label="onEditLabelClicked"
              @field-changed="onFieldChanged"
              @metadata-changed="onMetadataChanged"
              @remove-one="removeOneAssetFromSelection"
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
            :production-id="currentProduction?.id"
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
                :active="hasSelection"
                :text-mode="isTextMode"
                :big-mode="isBigMode"
                @add-one="addOneAsset"
                @add-ten="addTenAssets"
                v-for="asset in typeAssets"
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
      :active="modals.isEditLabelDisplayed"
      :is-loading="loading.editLabel"
      :is-error="errors.editLabel"
      :asset="editedAsset"
      :label="editedAssetLinkLabel"
      @cancel="modals.isEditLabelDisplayed = false"
      @confirm="confirmEditLabel"
    />

    <build-filter-modal
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
      :is-error="errors.remove"
      :text="$t('breakdown.remove.text')"
      @confirm="confirmAssetRemoval"
      @cancel="modals.isRemoveConfirmationDisplayed = false"
    />
  </div>
</template>

<script setup>
/* eslint-disable no-unused-vars */
import { useHead } from '@unhead/vue'
import moment from 'moment'
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  useTemplateRef,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import clipboard from '@/lib/clipboard'
import csv from '@/lib/csv'
import preferences from '@/lib/preferences'
import stringHelpers from '@/lib/string'
import { range } from '@/lib/time'

import BuildFilterModal from '@/components/modals/BuildFilterModal.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditAssetModal from '@/components/modals/EditAssetModal.vue'
import EditLabelModal from '@/components/modals/EditLabelModal.vue'
import ImportModal from '@/components/modals/ImportModal.vue'
import ImportRenderModal from '@/components/modals/ImportRenderModal.vue'
import AvailableAssetBlock from '@/components/pages/breakdown/AvailableAssetBlock.vue'
import ShotLine from '@/components/pages/breakdown/ShotLine.vue'
import ButtonHrefLink from '@/components/widgets/ButtonHrefLink.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import DepartmentName from '@/components/widgets/DepartmentName.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import SearchQueryList from '@/components/widgets/SearchQueryList.vue'
import ShowInfosButton from '@/components/widgets/ShowInfosButton.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import TableMetadataSelectorMenu from '@/components/widgets/TableMetadataSelectorMenu.vue'
/* eslint-enable no-unused-vars */

const SHOT_DISPLAY_HEADERS = {
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

const ASSET_DISPLAY_HEADERS = {
  estimation: false,
  readyFor: false,
  timeSpent: false
}

const optionalCsvColumns = ['Label']

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()
const socket = getCurrentInstance().appContext.config.globalProperties.$socket

// State
// --------------------------------------------------------------------------

const assetListRef = useTemplateRef('asset-list')
const castingHeaderRef = useTemplateRef('casting-header')
const castingListRef = useTemplateRef('casting-list')
const editAssetModalRef = useTemplateRef('edit-asset-modal')
const importModalRef = useTemplateRef('import-modal')
const searchFieldRef = useTemplateRef('search-field')

const assetTypeId = ref('')
const castingType = ref('shot')
const columnSelectorDisplayed = ref(false)
const columnWidth = ref({})
const editedAsset = ref(null)
const editedAssetLinkLabel = ref(null)
const editedEntityId = ref(null)
const episodeId = ref('')
const importCsvFormData = ref({})
const isBigMode = ref(false)
const isLoading = ref(false)
const isOnlyCurrentEpisode = ref(false)
const isTextMode = ref(false)
const libraryDisplayed = ref(false)
const metadataDisplayHeaders = ref({ ...SHOT_DISPLAY_HEADERS })
const parsedCSV = ref([])
const removalData = ref({})
const saveErrors = ref({})
const selection = ref({})
const sequenceId = ref('all')

const errors = reactive({
  edit: false,
  editLabel: false,
  importing: false,
  importingError: null,
  remove: false
})

const loading = reactive({
  edit: false,
  editLabel: false,
  importing: false,
  remove: false,
  savingSearch: false,
  stay: false
})

const modals = reactive({
  isBuildFilterDisplayed: false,
  isEditLabelDisplayed: false,
  isNewDisplayed: false,
  isImportRenderDisplayed: false,
  isRemoveConfirmationDisplayed: false,
  importing: false
})

const success = reactive({
  edit: false
})

let appliedSearch = ''
let hasScopeMoved = false
let isUnmounted = false
let previousEntityId = null
let resizing = null
let wasDisconnected = false

// Computed
// --------------------------------------------------------------------------

const assetMetadataDescriptors = computed(
  () => store.getters.assetMetadataDescriptors
)
const assetTypeMap = computed(() => store.getters.assetTypeMap)
const assetsByType = computed(() => store.getters.assetsByType)
const breakdownSearchFilterGroups = computed(
  () => store.getters.breakdownSearchFilterGroups
)
const breakdownSearchQueries = computed(
  () => store.getters.breakdownSearchQueries
)
const casting = computed(() => store.getters.casting)
const castingAssetTypeAssets = computed(
  () => store.getters.castingAssetTypeAssets
)
const castingAssetTypesOptions = computed(
  () => store.getters.castingAssetTypesOptions
)
const castingByType = computed(() => store.getters.castingByType)
const castingEpisodes = computed(() => store.getters.castingEpisodes)
const castingSequenceShots = computed(() => store.getters.castingSequenceShots)
const castingSequencesOptions = computed(
  () => store.getters.castingSequencesOptions
)
const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const departmentMap = computed(() => store.getters.departmentMap)
const displayedAssets = computed(() => store.getters.displayedAssets)
const displayedSequences = computed(() => store.getters.displayedSequences)
const episodes = computed(() => store.getters.episodes)
const isAssetsLoading = computed(() => store.getters.isAssetsLoading)
const isCurrentUserManager = computed(
  () => store.getters.isCurrentUserProductionManager
)
const isFrameIn = computed(() => store.getters.isFrameIn)
const isFrameOut = computed(() => store.getters.isFrameOut)
const isFrames = computed(() => store.getters.isFrames)
const isShowInfosBreakdown = computed(() => store.getters.isShowInfosBreakdown)
const isTVShow = computed(() => store.getters.isTVShow)
const sequenceMap = computed(() => store.getters.sequenceMap)
const shotMetadataDescriptors = computed(
  () => store.getters.shotMetadataDescriptors
)

const isEpisodeCasting = computed(() => currentEpisode.value?.id === 'all')

const isAssetCasting = computed(
  () => !isEpisodeCasting.value && castingType.value === 'asset'
)

const isShotCasting = computed(
  () => !isEpisodeCasting.value && castingType.value === 'shot'
)

const castingTypeOptions = computed(() => {
  const productionType = currentProduction.value.production_type
  const hasShots =
    productionType !== 'assets' &&
    (!isTVShow.value ||
      (currentEpisode.value && currentEpisode.value.id !== 'main'))
  return [
    ...(hasShots ? [{ label: t('shots.title'), value: 'shot' }] : []),
    ...(productionType !== 'shots'
      ? [{ label: t('assets.title'), value: 'asset' }]
      : [])
  ]
})

const isInCurrentEpisode = asset =>
  asset.episode_id === currentEpisode.value.id ||
  asset.casting_episode_ids?.includes(currentEpisode.value.id)

const availableAssetsByType = computed(() =>
  assetsByType.value
    .map(typeGroup =>
      isTVShow.value && isOnlyCurrentEpisode.value
        ? typeGroup.filter(isInCurrentEpisode)
        : typeGroup.filter(
            asset =>
              !asset.canceled && (!asset.shared || libraryDisplayed.value)
          )
    )
    .filter(typeGroup => typeGroup.length > 0)
)

const exportUrlPath = computed(() => {
  const params = [
    currentEpisode.value && `episode_id=${currentEpisode.value.id}`,
    isShotCasting.value && 'is_shot_casting=true'
  ].filter(Boolean)
  const path = `/api/export/csv/projects/${currentProduction.value.id}/casting.csv`
  return params.length > 0 ? `${path}?${params.join('&')}` : path
})

const castingEntities = computed(() => {
  if (isEpisodeCasting.value) return castingEpisodes.value
  if (isShotCasting.value) return castingSequenceShots.value
  if (!isTVShow.value) return castingAssetTypeAssets.value
  if (currentEpisode.value && currentEpisode.value.id !== 'main') {
    return castingAssetTypeAssets.value.filter(isInCurrentEpisode)
  }
  if (currentEpisode.value?.id === 'main') {
    return castingAssetTypeAssets.value.filter(asset => !asset.episode_id)
  }
  return castingAssetTypeAssets.value
})

// Asset lists of the displayed entities, one per asset type and entity.
const castingEntityTypeGroups = computed(() =>
  castingEntities.value.flatMap(entity => castingByType.value[entity.id] || [])
)

// Every line takes this list as a prop: hand back the previous array while
// the types are the same, or casting one asset renders all the lines again.
const castingAssetTypes = computed(previousTypes => {
  const types = [
    ...new Set(
      castingEntityTypeGroups.value
        .filter(typeGroup => typeGroup[0])
        .map(typeGroup => typeGroup[0].asset_type_name)
    )
  ].sort()
  const isUnchanged =
    previousTypes?.length === types.length &&
    types.every((type, index) => type === previousTypes[index])
  return isUnchanged ? previousTypes : types
})

// Only the import preview reads it: while it is closed, a casting change must
// not rebuild the index of every casted asset of the page.
const filteredCasting = computed(() =>
  modals.isImportRenderDisplayed
    ? Object.fromEntries(
        castingEntityTypeGroups.value
          .flat()
          .map(item => [
            `${item.asset_name}${item.asset_type_name}${item.name}`,
            true
          ])
      )
    : {}
)

const isDescription = computed(() =>
  castingEntities.value.some(e => e.description && e.description.length > 0)
)

const csvColumns = computed(() =>
  isTVShow.value && currentEpisode.value?.id !== 'all'
    ? ['Episode', 'Parent', 'Name', 'Asset Type', 'Asset', 'Occurences']
    : ['Parent', 'Name', 'Asset Type', 'Asset', 'Occurences']
)

const renderColumns = computed(() => [
  ...csvColumns.value,
  ...optionalCsvColumns
])

const dataMatchers = computed(() =>
  isTVShow.value
    ? ['Episode', 'Name', 'Asset Type', 'Asset']
    : ['Name', 'Asset Type', 'Asset']
)

const metadataDescriptors = computed(() => {
  if (isEpisodeCasting.value) return []
  return isShotCasting.value
    ? shotMetadataDescriptors.value
    : assetMetadataDescriptors.value
})

const visibleMetadataDescriptors = computed(() =>
  metadataDescriptors.value.filter(descriptor => {
    const header = metadataDisplayHeaders.value[descriptor.field_name]
    return header === undefined || header
  })
)

const nameHeaderMinWidth = computed(() =>
  columnWidth.value.name
    ? parseInt(columnWidth.value.name, 10) + 1 + 'px'
    : '251px'
)

const selectedEntityIds = computed(() =>
  Object.keys(selection.value).filter(key => selection.value[key])
)

// The template reads this flag, not the list: the page must not render again
// on every click, only the lines whose selection changed do.
const hasSelection = computed(() => selectedEntityIds.value.length > 0)

// Functions
// --------------------------------------------------------------------------

const reset = () => {
  if (!isTVShow.value && route.params?.episode_id) {
    router.push({
      name: 'breakdown',
      params: { production_id: route.params.production_id },
      query: route.query
    })
  }
  isLoading.value = true
  setTimeout(reloadEntities, 100)
}

const reloadEntities = async () => {
  if (isUnmounted) return
  isLoading.value = true
  const production = currentProduction.value
  let episode = currentEpisode.value
  hasScopeMoved = false
  try {
    // Resolve the episode first: starting on a direct link before the
    // topbar has it costs a full production-wide second pass. Inside the
    // try, so a failed fetch releases the loading flag like any other.
    // Only the episode is rebound: a production switched during the
    // fetch must still reset the column widths in the finally block.
    if (isTVShow.value && !currentEpisode.value) {
      await store.dispatch('loadEpisodes')
      if (isUnmounted) return
      episode = currentEpisode.value
      // The watcher flagged the episode this run just resolved: nothing
      // was loaded under another scope yet, the loads start from it.
      hasScopeMoved = false
    }
    // 'all' is episode casting here: it reads neither sequences nor shots.
    if (
      !isTVShow.value ||
      !['main', 'all'].includes(currentEpisode.value?.id)
    ) {
      await store.dispatch('loadSequences')
      if (isUnmounted) return
      await store.dispatch('loadShots')
      // Leaving the page during a load must stop the chain: the
      // production-wide assets load would land under the page shown next.
      if (isUnmounted) return
    }
    if (isTVShow.value) {
      if (currentEpisode.value) episodeId.value = currentEpisode.value.id
      store.dispatch('setCastingEpisode', episodeId.value)
      store.dispatch('setCastingForProductionEpisodes')
    } else {
      store.dispatch('setCastingEpisode', null)
    }
    await store.dispatch('loadAssets', { all: true, withTasks: true })
    if (isUnmounted) return
    store.dispatch('displayMoreAssets')
    fillAssetList()
    store.dispatch('setCastingAssetTypes')
    if (assetTypeId.value) {
      store.dispatch('setCastingAssetType', assetTypeId.value)
    } else if (
      !isTVShow.value ||
      (episodeId.value && !['main', 'all'].includes(episodeId.value))
    ) {
      store.dispatch('setCastingSequence', sequenceId.value || 'all')
    }
    resetSequenceOption()
    resetSelection()
    if (
      currentEpisode.value?.id === 'main' ||
      currentProduction.value.production_type === 'assets'
    ) {
      castingType.value = 'asset'
    }
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
    // The production and episode watchers ignore a change made while
    // the page loads: pick it up here or the casting of the scope left
    // behind stays displayed under a topbar that shows the new one. Not
    // after unmount: the ghost reload would push a production-wide
    // dataset under the page displayed next.
    // hasScopeMoved catches a switch that came back to the scope the run
    // started with: the loads in between served the other one.
    const isScopeChanged =
      hasScopeMoved ||
      currentProduction.value !== production ||
      currentEpisode.value?.id !== episode?.id
    if (isScopeChanged && !isUnmounted) {
      reset()
      if (currentProduction.value !== production) resetColumnWidth()
    }
  }
}

const resetSequenceOption = () => {
  if (
    currentProduction.value?.production_style === 'nft' &&
    castingSequencesOptions.value[1]
  ) {
    sequenceId.value = castingSequencesOptions.value[1].value
  }
}

const resetSelection = () => {
  let entities = castingAssetTypeAssets.value
  if (isEpisodeCasting.value) entities = castingEpisodes.value
  else if (isShotCasting.value) entities = castingSequenceShots.value
  selection.value = Object.fromEntries(
    entities.map(entity => [entity.id, false])
  )
}

const setSearchInUrl = query => {
  const searchQuery = query || searchFieldRef.value?.getValue()
  router.push({ query: { ...route.query, search: searchQuery || undefined } })
}

// The store keeps the number of assets displayed across searches: no page is
// added here or the list grows with every keystroke. fillAssetList tops it up
// when the result does not overflow the column.
const onSearchChange = searchQuery => {
  appliedSearch = searchQuery || ''
  store.dispatch('setAssetSearch', searchQuery)
  setSearchInUrl(searchQuery)
  fillAssetList()
}

const confirmBuildFilter = query => {
  modals.isBuildFilterDisplayed = false
  searchFieldRef.value.setValue(query)
  onSearchChange(query)
}

const clearSelection = () => {
  selectedEntityIds.value.forEach(entityId => {
    selection.value[entityId] = false
  })
}

const selectRange = (fromEntityId, toEntityId) => {
  const keys = Object.keys(selection.value)
  const fromIndex = keys.indexOf(fromEntityId)
  const toIndex = keys.indexOf(toEntityId)
  range(Math.min(fromIndex, toIndex), Math.max(fromIndex, toIndex))
    .filter(index => index >= 0)
    .forEach(index => {
      selection.value[keys[index]] = true
    })
}

const selectEntity = (entityId, event) => {
  const isMultiSelect = event.ctrlKey || event.metaKey
  const wasSelected = selection.value[entityId]
  const nbElementsSelected = selectedEntityIds.value.length
  if (!isMultiSelect) clearSelection()
  if (previousEntityId && event.shiftKey) {
    selectRange(previousEntityId, entityId)
  }
  if (!previousEntityId || !event.shiftKey) previousEntityId = entityId
  if (!wasSelected || (nbElementsSelected > 1 && !isMultiSelect)) {
    selection.value[entityId] = true
  } else if (isMultiSelect) {
    selection.value[entityId] = false
  }
}

const reloadCasting = () => {
  if (isEpisodeCasting.value) {
    store.dispatch('setCastingForProductionEpisodes')
  } else if (assetTypeId.value) {
    store.dispatch('setCastingAssetType', assetTypeId.value)
  } else {
    store.dispatch('setCastingSequence', sequenceId.value || 'all')
  }
}

const setSaveErrors = (entityIds, isError) => {
  entityIds.forEach(entityId => {
    if (isError) saveErrors.value[entityId] = true
    else delete saveErrors.value[entityId]
  })
}

const addOneAsset = async (assetId, amount = 1) => {
  const entityIds = selectedEntityIds.value
  entityIds.forEach(entityId => {
    store.dispatch('addAssetToCasting', {
      entityId,
      assetId,
      nbOccurences: amount,
      label: castingType.value === 'shot' ? 'animate' : 'fixed'
    })
  })
  setSaveErrors(entityIds, false)
  try {
    await store.dispatch('castAsset', { entityIds, assetId })
  } catch (err) {
    setSaveErrors(entityIds, true)
    console.error(err)
  }
}

const addTenAssets = assetId => addOneAsset(assetId, 10)

// Returns whether the removal was saved.
const saveAssetRemovals = async (entityIds, assetId, nbOccurences) => {
  loading.remove = true
  errors.remove = false
  entityIds.forEach(entityId => {
    store.dispatch('removeAssetFromCasting', {
      entityId,
      assetId,
      nbOccurences
    })
  })
  setSaveErrors(entityIds, false)
  try {
    await store.dispatch('castAsset', { entityIds, assetId })
    return true
  } catch (err) {
    setSaveErrors(entityIds, true)
    errors.remove = true
    console.error(err)
    return false
  } finally {
    loading.remove = false
  }
}

const confirmAssetRemoval = async () => {
  const { entityId, assetId, nbOccurences } = removalData.value
  const isSaved = await saveAssetRemovals([entityId], assetId, nbOccurences)
  if (isSaved) modals.isRemoveConfirmationDisplayed = false
}

const removeOneAssetFromSelection = async assetId => {
  const castings = selectedEntityIds.value
    .map(entityId => ({
      entityId,
      asset: casting.value[entityId]?.find(a => a.asset_id === assetId)
    }))
    .filter(({ asset }) => asset)
  // The last occurence on an episode asks for a confirmation: the modal flow
  // handles that entity on its own.
  const isToConfirm = ({ asset }) =>
    isEpisodeCasting.value && asset.nb_occurences === 1
  const toConfirm = castings.filter(isToConfirm).pop()
  if (toConfirm) {
    removalData.value = {
      assetId,
      entityId: toConfirm.entityId,
      nbOccurences: 1
    }
    modals.isRemoveConfirmationDisplayed = true
  }
  const removals = castings
    .filter(item => !isToConfirm(item))
    .map(({ entityId }) => entityId)
  if (removals.length > 0) await saveAssetRemovals(removals, assetId, 1)
}

const onAssetListScroll = event => {
  const assetList = assetListRef.value
  const maxHeight = assetList.scrollHeight - assetList.offsetHeight
  if (maxHeight < event.target.scrollTop + 100) {
    store.dispatch('displayMoreAssets')
  }
}

// On tall screens the first pages may not overflow the container, so
// scrolling can never trigger the next page: keep loading until the
// scrollbar shows up or every asset is displayed.
const fillAssetList = async () => {
  await nextTick()
  const assetList = assetListRef.value
  if (assetList && assetList.scrollHeight <= assetList.clientHeight) {
    const displayedCountBefore = displayedAssets.value.length
    store.dispatch('displayMoreAssets')
    await nextTick()
    if (displayedAssets.value.length > displayedCountBefore) fillAssetList()
  }
}

const showImportModal = () => {
  modals.importing = true
}

const hideImportModal = () => {
  modals.importing = false
}

const hideImportRenderModal = () => {
  modals.isImportRenderDisplayed = false
}

const renderImport = async (data, mode) => {
  loading.importing = true
  errors.importing = false
  try {
    parsedCSV.value = await csv.processCSV(
      mode === 'file' ? data.get('file') : data
    )
    hideImportModal()
    modals.isImportRenderDisplayed = true
  } catch (err) {
    console.error(err)
    errors.importing = true
  }
  loading.importing = false
}

const uploadImportFile = async data => {
  const formData = new FormData()
  const csvContent = csv.turnEntriesToCsvString(data)
  formData.append(
    'file',
    new File([csvContent], 'import.csv', { type: 'text/csv' })
  )
  loading.importing = true
  errors.importing = false
  errors.importingError = null
  importCsvFormData.value = formData
  try {
    await store.dispatch('uploadCastingFile', formData)
    hideImportRenderModal()
    if (sequenceId.value) {
      store.dispatch('setCastingSequence', sequenceId.value)
    }
  } catch (err) {
    errors.importingError = err
    errors.importing = true
  }
  loading.importing = false
}

const resetImport = () => {
  errors.importing = false
  errors.importingError = null
  hideImportRenderModal()
  importCsvFormData.value = undefined
  importModalRef.value?.reset()
  showImportModal()
}

// Route of the scope the page shows, null when the URL already names it.
const getScopeRoute = () => {
  const productionId = currentProduction.value.id
  if (isEpisodeCasting.value) {
    return route.params.episode_id !== episodeId.value
      ? {
          name: 'breakdown-episode',
          params: { production_id: productionId, episode_id: episodeId.value }
        }
      : null
  }
  if (isAssetCasting.value) {
    return (route.params.asset_type_id || '') !== assetTypeId.value
      ? {
          name: 'breakdown-asset-type',
          params: {
            production_id: productionId,
            asset_type_id: assetTypeId.value
          }
        }
      : null
  }
  return (route.params.sequence_id || 'all') !== sequenceId.value
    ? {
        name: 'breakdown-sequence',
        params: {
          production_id: productionId,
          sequence_id: sequenceId.value || 'all'
        }
      }
    : null
}

const updateUrl = () => {
  const scopeRoute = getScopeRoute()
  if (scopeRoute) {
    const routeEpisodeId = route.params.episode_id || currentEpisode.value?.id
    router.push(
      routeEpisodeId
        ? {
            name: `episode-${scopeRoute.name}`,
            params: {
              ...scopeRoute.params,
              episode_id: routeEpisodeId,
              ...(routeEpisodeId === 'all' ? { sequence_id: 'all' } : {})
            }
          }
        : scopeRoute
    )
  }
}

const onEditLabelClicked = (asset, label, entityId) => {
  editedAsset.value = asset
  editedEntityId.value = entityId
  editedAssetLinkLabel.value = label
  modals.isEditLabelDisplayed = true
}

const confirmEditLabel = async (form = {}) => {
  loading.editLabel = true
  errors.editLabel = false
  try {
    await store.dispatch('setAssetLinkLabel', {
      label: form.label,
      asset: editedAsset.value,
      targetEntityId: editedEntityId.value
    })
    modals.isEditLabelDisplayed = false
  } catch (err) {
    console.error(err)
    errors.editLabel = true
  }
  loading.editLabel = false
}

const toggleTextMode = () => {
  isTextMode.value = !isTextMode.value
  preferences.setBoolPreference('breakdown:text-mode', isTextMode.value)
}

const toggleColumnSelector = () => {
  columnSelectorDisplayed.value = !columnSelectorDisplayed.value
}

const confirmNewAssetStay = async form => {
  loading.stay = true
  success.edit = false
  try {
    await store.dispatch('newAsset', form)
    editAssetModalRef.value.focusName()
    success.edit = true
  } catch (err) {
    console.error(err)
    errors.edit = true
  }
  loading.stay = false
  loading.edit = false
}

const confirmNewAsset = async form => {
  loading.edit = true
  errors.edit = false
  try {
    await store.dispatch('newAsset', form)
    modals.isNewDisplayed = false
  } catch (err) {
    console.error(err)
    errors.edit = true
  }
  loading.edit = false
}

const copyCasting = () => {
  clipboard.copyCasting(casting.value[selectedEntityIds.value[0]])
}

const pasteCasting = async () => {
  const castingToPaste = clipboard.pasteCasting()
  if (!castingToPaste || castingToPaste.length === 0) return
  const entityIds = selectedEntityIds.value
  entityIds.forEach(entityId => {
    store.dispatch('setEntityCasting', { entityId, casting: castingToPaste })
  })
  setSaveErrors(entityIds, false)
  try {
    await store.dispatch('saveCastings', entityIds)
  } catch (err) {
    setSaveErrors(entityIds, true)
    console.error(err)
  }
}

const onKeyDown = event => {
  const isShortcut =
    (event.ctrlKey || event.metaKey) &&
    !['INPUT', 'TEXTAREA'].includes(event.target.tagName)
  if (isShortcut && event.keyCode === 67) {
    copyCasting() // ctrl + c
  } else if (isShortcut && event.keyCode === 86) {
    pasteCasting() // ctrl + v
  }
}

const editEntity = data => {
  if (isEpisodeCasting.value) return store.dispatch('editEpisode', data)
  if (isShotCasting.value) return store.dispatch('editShot', data)
  return store.dispatch('editAsset', data)
}

const onFieldChanged = ({ entry, fieldName, value }) =>
  editEntity({ id: entry.id, [fieldName]: value })

const onMetadataChanged = ({ entry, descriptor, value }) =>
  editEntity({ id: entry.id, data: { [descriptor.field_name]: value } })

const descriptorCurrentDepartments = descriptor =>
  (descriptor.departments || []).map(departmentId =>
    departmentMap.value.get(departmentId)
  )

const getEntityName = entity =>
  sequenceId.value === 'all' &&
  (!isTVShow.value || currentEpisode.value?.id !== 'all')
    ? entity.sequence_name + ' / ' + entity.name
    : entity.name

const getCsvFileName = () => {
  const head = [
    moment().format('YYYY-MM-DD'),
    'kitsu',
    castingType.value + 's',
    currentProduction.value.name
  ]
  const title = t('breakdown.title')
  const sequenceName =
    castingType.value === 'shot' && sequenceId.value !== 'all'
      ? [sequenceMap.value.get(sequenceId.value)?.name || '']
      : []
  const assetTypeName =
    castingType.value === 'asset' && assetTypeId.value !== 'all'
      ? [assetTypeMap.value.get(assetTypeId.value)?.name || '']
      : []
  const episode = isTVShow.value ? currentEpisode.value : null
  const episodeName = { all: 'all', main: 'main pack' }[episode?.id]
  const hasScope = isTVShow.value ? episode && episode.id !== 'all' : true
  const nameData = [
    ...head,
    ...(episode ? [episodeName || episode.name] : []),
    ...(hasScope ? [...sequenceName, ...assetTypeName] : []),
    title
  ]
  return stringHelpers.slugify(nameData.join('_'))
}

const getCsvFileHeaders = () => [
  t('shots.fields.name'),
  t('breakdown.fields.standby'),
  ...(isFrames.value ? [t('main.frames')] : []),
  ...(isFrameIn.value ? [t('main.frame_in')] : []),
  ...(isFrameOut.value ? [t('main.frame_out')] : []),
  ...metadataDescriptors.value.map(descriptor => descriptor.name),
  ...castingAssetTypes.value
]

const getCsvCastingCell = typeAssets => {
  const nbAssets = typeAssets.reduce((acc, a) => acc + a.nb_occurences, 0)
  if (nbAssets === 0) return ''
  const assetNames = typeAssets
    .map(asset => `${asset.asset_name} (${asset.nb_occurences})`)
    .join(', ')
  return `${nbAssets} assets: ${assetNames}`
}

const getCsvEntries = () =>
  castingEntities.value.map(entity => {
    const typeGroups = castingByType.value[entity.id] || []
    return [
      entity.name,
      entity.is_casting_standby ? 'X' : '',
      ...(isFrames.value ? [entity.nb_frames] : []),
      ...(isFrameIn.value ? [entity.data.frame_in] : []),
      ...(isFrameOut.value ? [entity.data.frame_out] : []),
      ...metadataDescriptors.value.map(
        descriptor => entity.data[descriptor.field_name] || ''
      ),
      ...castingAssetTypes.value.map(assetTypeName =>
        getCsvCastingCell(
          typeGroups.find(
            typeAssets => typeAssets[0]?.asset_type_name === assetTypeName
          ) || []
        )
      )
    ]
  })

const exportViewToCsv = () => {
  csv.buildCsvFile(getCsvFileName(), [getCsvFileHeaders(), ...getCsvEntries()])
}

const removeSearchQuery = searchQuery => {
  store.dispatch('removeBreakdownSearch', searchQuery).catch(console.error)
}

const saveSearchQuery = async searchQuery => {
  if (loading.savingSearch) return
  loading.savingSearch = true
  try {
    await store.dispatch('saveBreakdownSearch', searchQuery)
  } catch (err) {
    console.error(err)
  }
  loading.savingSearch = false
}

// The knob is a direct child of the header it resizes.
const initResize = (event, descriptorId) => {
  const knob = event.currentTarget
  resizing = { knob, header: knob.parentElement, descriptorId }
  window.addEventListener('mousemove', onResizing)
  window.addEventListener('mouseup', stopResizing)
}

const onResizing = event => {
  const { knob, header, descriptorId } = resizing
  const diff = event.clientX - knob.getBoundingClientRect().left
  const width = header.getBoundingClientRect().width + diff
  if (descriptorId) {
    const newWidth = Math.max(width, 110)
    columnWidth.value = { ...columnWidth.value, [descriptorId]: newWidth }
    preferences.setPreference(
      `breakdown:column-width-descriptor-${descriptorId}`,
      newWidth
    )
  } else {
    const newWidth = Math.max(width, 160)
    columnWidth.value = { ...columnWidth.value, name: newWidth }
    preferences.setPreference(getNameWidthPreferenceKey(), newWidth)
  }
}

const stopResizing = () => {
  window.removeEventListener('mousemove', onResizing)
  window.removeEventListener('mouseup', stopResizing)
  resizing = null
}

const getNameWidthPreferenceKey = () =>
  'breakdown:column-width-name-' +
  `${castingType.value}-${currentProduction.value.id}`

const resetDisplayHeaders = () => {
  if (isEpisodeCasting.value) {
    metadataDisplayHeaders.value = {}
  } else if (isShotCasting.value) {
    metadataDisplayHeaders.value = { ...SHOT_DISPLAY_HEADERS }
  } else {
    metadataDisplayHeaders.value = { ...ASSET_DISPLAY_HEADERS }
  }
}

const resetColumnWidth = () => {
  const nameWidth = preferences.getPreference(getNameWidthPreferenceKey())
  const descriptorWidths = metadataDescriptors.value
    .map(descriptor => [
      descriptor.id,
      preferences.getPreference(
        `breakdown:column-width-descriptor-${descriptor.id}`
      )
    ])
    .filter(([, width]) => width)
  columnWidth.value = {
    ...columnWidth.value,
    ...(nameWidth ? { name: nameWidth } : {}),
    ...Object.fromEntries(descriptorWidths)
  }
}

const onCastingHeaderScroll = event => {
  castingListRef.value.scrollLeft = event.target.scrollLeft
}

const onCastingScroll = event => {
  castingHeaderRef.value.scrollLeft = event.target.scrollLeft
}

const onEpisodeCastingUpdate = eventData => {
  const episode = store.getters.episodeMap.get(eventData.episode_id)
  if (episode) store.dispatch('loadEpisodeCasting', episode)
}

const onShotCastingUpdate = eventData => {
  const shot = store.getters.shotMap.get(eventData.shot_id)
  if (shot && shot.sequence_id === sequenceId.value) {
    store.dispatch('loadShotCasting', shot)
  }
}

const onAssetCastingUpdate = eventData => {
  const asset = store.getters.assetMap.get(eventData.asset_id)
  if (asset && asset.asset_type_id === assetTypeId.value) {
    store.dispatch('loadAssetCasting', asset)
  }
}

// socket.io replays nothing emitted while the connection was down,
// so the casting on screen may miss changes made in the meantime:
// reload it once the connection is back, and only then (the first
// connect of the page brings nothing new).
const onSocketDisconnect = () => {
  wasDisconnected = true
}

const onSocketConnect = () => {
  if (wasDisconnected) {
    wasDisconnected = false
    reloadCasting()
  }
}

const SOCKET_EVENTS = {
  'episode:casting-update': onEpisodeCastingUpdate,
  'shot:casting-update': onShotCastingUpdate,
  'asset:casting-update': onAssetCastingUpdate,
  disconnect: onSocketDisconnect,
  connect: onSocketConnect
}

// Watchers
// --------------------------------------------------------------------------

watch(castingType, () => {
  if (isShotCasting.value && displayedSequences.value.length > 0) {
    sequenceId.value = displayedSequences.value[0].id
    assetTypeId.value = ''
  }
  if (isAssetCasting.value && castingAssetTypesOptions.value.length > 0) {
    sequenceId.value = 'all'
    assetTypeId.value =
      route.params.asset_type_id || castingAssetTypesOptions.value[0].value
  }
  resetDisplayHeaders()
  resetColumnWidth()
})

watch(sequenceId, () => {
  if (
    sequenceId.value &&
    displayedSequences.value?.length > 0 &&
    !isAssetCasting.value
  ) {
    store.dispatch('setCastingSequence', sequenceId.value)
    updateUrl()
    resetSelection()
  }
})

watch(assetTypeId, () => {
  if (assetTypeId.value && castingAssetTypesOptions.value.length > 0) {
    store.dispatch('setCastingAssetType', assetTypeId.value)
    updateUrl()
    resetSelection()
  }
})

watch(episodeId, () => {
  if (episodeId.value && episodes.value?.length > 0) {
    if (episodeId.value === 'all') {
      store.dispatch('setCastingForProductionEpisodes')
    }
    resetSelection()
  }
})

watch(castingSequencesOptions, () => {
  if (route.path.indexOf('asset-type') < 0) {
    const routeSequenceId = route.params.sequence_id || 'all'
    sequenceId.value = sequenceMap.value.get(routeSequenceId)
      ? routeSequenceId
      : castingSequencesOptions.value[0]?.value || 'all'
  }
})

watch(castingAssetTypesOptions, () => {
  if (route.path.indexOf('asset-type') > 0) {
    castingType.value = 'asset'
    assetTypeId.value =
      route.params.asset_type_id ||
      castingAssetTypesOptions.value[0]?.value ||
      ''
  }
})

watch(currentProduction, () => {
  if (isLoading.value) {
    hasScopeMoved = true
  } else {
    reset()
    resetColumnWidth()
  }
})

watch(currentEpisode, () => {
  if (currentEpisode.value && episodeId.value !== currentEpisode.value.id) {
    if (isLoading.value) {
      hasScopeMoved = true
    } else if (currentEpisode.value.id === 'all') {
      episodeId.value = 'all'
    } else {
      reset()
    }
  }
})

watch(displayedSequences, () => {
  store.commit('CASTING_SET_SEQUENCES', displayedSequences.value)
})

// Searches coming from elsewhere (saved queries, back button). The page
// writes its own search in the URL too: that one is already applied, running
// it again would filter and sort every asset twice per keystroke.
watch(
  () => route.query.search,
  search => {
    if ((search || '') !== appliedSearch) {
      searchFieldRef.value?.setValue(search)
      onSearchChange(search)
    }
  }
)

// Lifecycle
// --------------------------------------------------------------------------

onMounted(() => {
  reset()
  resetSequenceOption()
  store.dispatch('setLastProductionScreen', 'breakdown')
  isTextMode.value = preferences.getBoolPreference('breakdown:text-mode')
  window.addEventListener('keydown', onKeyDown, false)
  Object.entries(SOCKET_EVENTS).forEach(([eventName, handler]) => {
    socket.on(eventName, handler)
  })
  resetDisplayHeaders()
  resetColumnWidth()
  if (!searchFieldRef.value?.getValue() && route.query.search) {
    searchFieldRef.value?.setValue(route.query.search)
  }
})

onBeforeUnmount(() => {
  isUnmounted = true
  window.removeEventListener('keydown', onKeyDown)
  Object.entries(SOCKET_EVENTS).forEach(([eventName, handler]) => {
    socket.off(eventName, handler)
  })
})

// Head
// --------------------------------------------------------------------------

useHead({
  title: computed(() =>
    isTVShow.value
      ? `${currentProduction.value?.name || ''}` +
        ` - ${currentEpisode.value?.name || ''}` +
        ` | ${t('breakdown.title')} - Kitsu`
      : `${currentProduction.value.name} | ${t('breakdown.title')} - Kitsu`
  )
})
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

// The comboboxes carry a label above their control: the buttons line up with
// the control, not with the middle of label + control.
.casting-toolbar {
  align-items: flex-end;
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
  min-width: 110px;
  max-width: 110px;
}

.descriptor-departments {
  display: inline-flex;
  gap: 2px;
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

// Mobile is read-only: the casting alone, as one card per entity (see
// ShotLine), without the asset picker, the exports and the info columns.
@media screen and (max-width: 768px) {
  .breakdown {
    padding-left: 0.5em;
    padding-right: 0.5em;
    padding-bottom: 0.5em;
  }

  .breakdown-column {
    padding: 0.5em;
  }

  .casting-toolbar {
    flex-wrap: wrap;
    gap: 0.5em;

    // The gap spaces the buttons: the last one displayed is not the last
    // child, so it would keep its right margin.
    .flexrow-item {
      margin-right: 0;
    }
  }

  .assets-column,
  .list-options,
  .desktop-only,
  .casting-header {
    display: none;
  }

  // No selection means no add, remove, label or paste action on the casting.
  .shot-lines {
    pointer-events: none;
  }
}
</style>
