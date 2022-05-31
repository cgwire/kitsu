<template>
  <div class="breakdown page">
    <div class="breakdown-columns">

      <div class="breakdown-column casting-column">
        <div class="flexrow mb1">
          <div
            class=""
            v-if="isEpisodeCasting"
          >
            <h2 class="subtitle mt05">Episode Casting</h2>
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
            :options="castingSequenceOptions"
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
          <button-simple
            class="flexrow-item"
            :title="isTextMode ? $t('breakdown.picture_mode') : $t('breakdown.text_mode')"
            icon="type"
            :is-on="isTextMode"
            :is-responsive="true"
            @click="toggleTextMode"
          />
          <button-simple
            class="flexrow-item"
            :title="$t('main.csv.import_file')"
            icon="upload"
            :is-responsive="true"
            @click="showImportModal"
            v-if="isCurrentUserManager"
          />
          <button-href-link
            class="flexrow-item"
            :title="$t('main.csv.export_file')"
            icon="download"
            :is-responsive="true"
            :path="exportUrlPath"
            v-if="isCurrentUserManager"
          />
        </div>
        <spinner class="mt1" v-if="isLoading" />
        <div class="mt1" v-else>
          <shot-line
            :key="entity.id"
            :entity-id="entity.id"
            :preview-file-id="entity.preview_file_id"
            :selected="selection[entity.id]"
            :name="entity.name"
            :assets="castingByType[entity.id] || []"
            :read-only="!isCurrentUserManager"
            :text-mode="isTextMode"
            @edit-label="onEditLabelClicked"
            @remove-one="removeOneAsset"
            @remove-ten="removeTenAssets"
            @click="selectEntity"
            v-for="entity in castingEntities"
          />
        </div>
      </div>

      <div
        ref="asset-list"
        v-scroll="onAssetListScroll"
        class="breakdown-column assets-column"
        v-if="isCurrentUserManager"
      >
        <h2 class="subtitle flexrow">
          <span class="flexrow-item">
            {{ $t('breakdown.all_assets') }}
          </span>
          <button-simple
            class="flexrow-item"
            :title="$t('assets.new_asset')"
            icon="plus"
            @click="modals.isNewDisplayed = true"
          />
          <button-simple
            class="flexrow-item"
            :text="$t('assets.only_current_episode')"
            :is-on="isOnlyCurrentEpisode"
            @click="isOnlyCurrentEpisode = !isOnlyCurrentEpisode"
            v-if="isTVShow"
          />
        </h2>

        <div class="filters-area flexrow">
          <search-field
            ref="search-field"
            class="flexrow-item"
            @change="onSearchChange"
          />
          <button-simple
            class="flexrow-item"
            :title="$t('entities.build_filter.title')"
            icon="funnel"
            @click="modals.isBuildFilterDisplayed = true"
          />
        </div>

        <spinner v-if="isAssetsLoading" />
        <div
          class="type-assets"
          :key="typeAssets.length > 0 ? typeAssets[0].asset_type_name : ''"
          v-for="typeAssets in availableAssetsByType"
          v-else
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
              @add-one="addOneAsset"
              @add-ten="addTenAssets"
              v-for="asset in typeAssets"
            />
          </div>
        </div>
      </div>
    </div>

    <import-render-modal
      :active="modals.isImportRenderDisplayed"
      :is-loading="loading.importing"
      :is-error="errors.importing"
      :import-error="errors.importingError"
      :parsed-csv="parsedCSV"
      :form-data="importCsvFormData"
      :columns="csvColumns"
      :dataMatchers="dataMatchers"
      :database="filteredCasting"
      :disable-update=true
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
      @confirmAndStay="confirmNewAssetStay"
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
import { range } from '@/lib/time'
import csv from '@/lib/csv'
import AvailableAssetBlock from '@/components/pages/breakdown/AvailableAssetBlock'
import BuildFilterModal from '@/components/modals/BuildFilterModal'
import ButtonHrefLink from '@/components/widgets/ButtonHrefLink'
import ButtonSimple from '@/components/widgets/ButtonSimple'
import ComboboxStyled from '@/components/widgets/ComboboxStyled'
import DeleteModal from '@/components/modals/DeleteModal'
import EditAssetModal from '@/components/modals/EditAssetModal'
import EditLabelModal from '@/components/modals/EditLabelModal'
import ImportRenderModal from '@/components/modals/ImportRenderModal'
import ImportModal from '@/components/modals/ImportModal'
import SearchField from '@/components/widgets/SearchField'
import ShotLine from './breakdown/ShotLine'
import Spinner from '@/components/widgets/Spinner'

export default {
  name: 'breakdown',

  components: {
    AvailableAssetBlock,
    BuildFilterModal,
    ButtonHrefLink,
    ButtonSimple,
    ComboboxStyled,
    DeleteModal,
    EditAssetModal,
    EditLabelModal,
    ImportModal,
    ImportRenderModal,
    SearchField,
    ShotLine,
    Spinner
  },

  data () {
    return {
      assetTypeId: '',
      castingType: 'shot',
      castingTypeOptions: [
        {
          label: this.$t('shots.title'),
          value: 'shot'
        },
        {
          label: this.$t('assets.title'),
          value: 'asset'
        }
      ],
      editedAsset: null,
      editedEntityId: null,
      editedAssetLinkLabel: null,
      episodeId: '',
      importCsvFormData: {},
      isLocked: false,
      isLoading: false,
      isOnlyCurrentEpisode: false,
      isTextMode: false,
      removalData: {},
      selection: {},
      sequenceId: '',
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
      parsedCSV: []
    }
  },

  mounted () {
    if (!this.isLoading) {
      this.reset()
    }
    this.setLastProductionScreen('breakdown')
    this.isTextMode = localStorage.getItem('breakdown:text-mode') === 'true'
  },

  computed: {
    ...mapGetters([
      'assetMap',
      'assetsByType',
      'casting',
      'castingEpisodes',
      'castingAssetTypeAssets',
      'castingAssetTypesOptions',
      'castingByType',
      'castingCurrentShot',
      'castingSequenceOptions',
      'castingSequenceShots',
      'currentEpisode',
      'currentProduction',
      'displayedShots',
      'getEpisodeOptions',
      'isCurrentUserManager',
      'isAssetsLoading',
      'isShotsLoading',
      'isTVShow',
      'episodeMap',
      'sequences',
      'sequenceMap',
      'shotMap'
    ]),

    availableAssetsByType () {
      const result = []
      this.assetsByType.forEach((typeGroup) => {
        let newGroup = typeGroup.filter(asset => !asset.canceled)
        if (this.isTVShow && this.isOnlyCurrentEpisode) {
          newGroup = typeGroup.filter(
            asset => asset.episode_id === this.currentEpisode.id
          )
        }
        if (newGroup.length > 0) result.push(newGroup)
      })
      return result
    },

    exportUrlPath () {
      let path =
        `/api/export/csv/projects/${this.currentProduction.id}/casting.csv`
      if (this.currentEpisode) {
        path += `?episode_id=${this.currentEpisode.id}`
      }
      return path
    },

    isEpisodeCasting () {
      return this.currentEpisode && this.currentEpisode.id === 'all'
    },

    isAssetCasting () {
      return !this.isEpisodeCasting && this.castingType === 'asset'
    },

    isShotCasting () {
      return !this.isEpisodeCasting && this.castingType === 'shot'
    },

    castingEntities () {
      if (this.isEpisodeCasting) {
        return this.castingEpisodes
      } else if (this.isShotCasting) {
        return this.castingSequenceShots
      } else {
        if (this.isTVShow && this.currentEpisode.id !== 'main') {
          return this.castingAssetTypeAssets.filter(
            asset => (
              asset.episode_id === this.currentEpisode.id ||
              asset.casting_episode_ids.includes(this.currentEpisode.id)
            )
          )
        } else if (this.currentEpisode.id === 'main') {
          return this.castingAssetTypeAssets.filter(
            asset => !asset.episode_id)
        } else {
          return this.castingAssetTypeAssets
        }
      }
    },

    editLabelModal () {
      return this.$refs['edit-label-modal']
    },

    filteredCasting () {
      const casting = {}
      this.castingEntities.forEach(entity => {
        if (this.castingByType[entity.id]) {
          this.castingByType[entity.id].forEach(type => {
            type.forEach(item => {
              const castKey =
                `${item.asset_name}${item.asset_type_name}${item.name}`
              casting[castKey] = true
            })
          })
        }
      })
      return casting
    },

    csvColumns () {
      return this.isTVShow
        ? [
          'Episode',
          'Parent',
          'Name',
          'Asset Type',
          'Asset',
          'Occurences',
          'Label'
        ] : [
          'Parent',
          'Name',
          'Asset Type',
          'Asset',
          'Occurences',
          'Label'
        ]
    },

    dataMatchers () {
      return this.isTVShow
        ? [
          'Episode',
          'Name',
          'Asset Type',
          'Asset'
        ] : ['Name',
          'Asset Type',
          'Asset'
        ]
    }
  },

  methods: {
    ...mapActions([
      'addAssetToCasting',
      'displayMoreAssets',
      'loadEpisodeCasting',
      'loadEpisodes',
      'loadAssetCasting',
      'loadAssets',
      'loadShotCasting',
      'loadShots',
      'newAsset',
      'removeAssetFromCasting',
      'saveCasting',
      'setAssetSearch',
      'setCastingEpisodes',
      'setCastingAssetType',
      'setCastingAssetTypes',
      'setCastingEpisode',
      'setCastingForProductionEpisodes',
      'setCastingSequence',
      'setCurrentEpisode',
      'setAssetLinkLabel',
      'setLastProductionScreen',
      'uploadCastingFile'
    ]),

    reset () {
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
        this.reloadShots()
      }, 100)
    },

    reloadShots () { // TODO shouldn't it be renamed reloadEntities?
      this.isLoading = true
      this.loadShots(() => {
        if (this.isTVShow) {
          if (this.currentEpisode) {
            this.episodeId = this.currentEpisode.id
          }
          this.setCastingEpisode(this.episodeId)
          this.setCastingForProductionEpisodes()
        } else {
          this.setCastingEpisode(null)
        }
        this.loadAssets(true)
          .then(() => {
            this.isLoading = false
            this.displayMoreAssets()
            this.setCastingAssetTypes()
            if (this.assetTypeId) {
              this.setCastingAssetType(this.assetTypeId)
            }
            this.resetSelection()
          })
      })
    },

    resetSelection () {
      const selection = {}
      if (this.isEpisodeCasting) {
        this.castingEpisodes.forEach((episode) => {
          selection[episode.id] = false
        })
      } else if (this.isShotCasting) {
        this.castingSequenceShots.forEach((shot) => {
          selection[shot.id] = false
        })
      } else {
        this.castingAssetTypeAssets.forEach((asset) => {
          selection[asset.id] = false
        })
      }
      this.selection = selection
    },

    confirmBuildFilter (query) {
      this.modals.isBuildFilterDisplayed = false
      this.$refs['search-field'].setValue(query)
      this.onSearchChange(query)
    },

    onSearchChange (searchQuery) {
      this.setAssetSearch(searchQuery)
      this.displayMoreAssets()
      this.displayMoreAssets()
    },

    selectEntity (entityId, event) {
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

      const nbElementsSelected = Object.keys(previousSelection)
        .filter(k => previousSelection[k])
        .length
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

    clearSelection () {
      Object.keys(this.selection)
        .filter(k => this.selection[k])
        .forEach((shotId) => {
          this.selection[shotId] = false
        })
    },

    selectRange (previousEntityId, entityId) {
      const keys = Object.keys(this.selection)
      const previousIndex = keys.findIndex(k => k === previousEntityId)
      const index = keys.findIndex(k => k === entityId)

      let indexRange = []
      if (previousIndex < index) indexRange = range(previousIndex, index)
      else indexRange = range(index, previousIndex)

      indexRange.forEach((i) => {
        if (i >= 0) this.selection[keys[i]] = true
      })
    },

    setLock () {
      if (!this.$options.lockTimeout) {
        this.$options.lockTimeout = setTimeout(() => {
          this.isLocked = false
        }, 3000)
      }
    },

    addOneAsset (assetId) {
      this.isLocked = true
      Object.keys(this.selection)
        .filter(key => this.selection[key])
        .forEach((entityId) => {
          this.addAssetToCasting({
            entityId,
            assetId,
            nbOccurences: 1,
            label: this.castingType === 'shot' ? 'animate' : 'fixed'
          })
          this.saveCasting(entityId)
            .then(this.setLock)
            .catch(console.error)
        })
    },

    addTenAssets (assetId) {
      this.isLocked = true
      Object.keys(this.selection)
        .filter(key => this.selection[key])
        .forEach((entityId) => {
          this.addAssetToCasting({ entityId, assetId, nbOccurences: 10 })
          this.saveCasting(entityId)
            .then(this.setLock)
            .catch(console.error)
        })
    },

    confirmAssetRemoval () {
      this.saveAssetRemoval(
        this.removalData.entityId,
        this.removalData.assetId,
        this.removalData.nbOccurences
      )
    },

    saveAssetRemoval (entityId, assetId, nbOccurences) {
      this.loading.remove = true
      this.removeAssetFromCasting({ entityId, assetId, nbOccurences })
      this.saveCasting(entityId)
        .then(this.setLock)
        .then(() => {
          this.loading.remove = false
          this.modals.isRemoveConfirmationDisplayed = false
        })
        .catch(err => {
          this.errors.remove = true
          this.loading.remove = false
          console.error(err)
        })
    },

    removeOneAsset (assetId, entityId, nbOccurences) {
      this.isLocked = true
      if (this.isEpisodeCasting && nbOccurences === 1) {
        this.removalData = { assetId, entityId, nbOccurences }
        this.modals.isRemoveConfirmationDisplayed = true
      } else {
        this.saveAssetRemoval(entityId, assetId, 1)
      }
    },

    removeTenAssets (assetId, entityId, nbOccurences) {
      this.isLocked = true
      if (this.isEpisodeCasting && nbOccurences < 10) {
        this.removalData = { assetId, entityId, nbOccurences }
        this.modals.isRemoveConfirmationDisplayed = true
      } else {
        this.saveAssetRemoval(entityId, assetId, 10)
      }
    },

    onAssetListScroll (event, position) {
      const assetList = this.$refs['asset-list']
      const maxHeight = assetList.scrollHeight - assetList.offsetHeight
      if (maxHeight < (position.scrollTop + 100)) {
        this.displayMoreAssets()
      }
    },

    showImportModal () {
      this.modals.importing = true
    },

    hideImportModal () {
      this.modals.importing = false
    },

    showImportRenderModal () {
      this.modals.isImportRenderDisplayed = true
    },

    hideImportRenderModal () {
      this.modals.isImportRenderDisplayed = false
    },

    renderImport (data, mode) {
      this.loading.importing = true
      this.errors.importing = false
      if (mode === 'file') {
        data = data.get('file')
      }
      csv.processCSV(data)
        .then((results) => {
          this.parsedCSV = results
          this.hideImportModal()
          this.loading.importing = false
          this.showImportRenderModal()
        })
    },

    uploadImportFile (data) {
      const formData = new FormData()
      const filename = 'import.csv'
      const file = new File([data.join('\n')], filename, { type: 'text/csv' })

      formData.append('file', file)

      this.loading.importing = true
      this.errors.importing = false
      this.errors.importingError = null
      this.importCsvFormData = formData

      this.uploadCastingFile(this.importCsvFormData)
        .then(() => {
          this.loading.importing = false
          this.hideImportRenderModal()
          if (this.sequenceId) {
            this.setCastingSequence(this.sequenceId)
          }
        })
        .catch(err => {
          this.loading.importing = false
          this.errors.importingError = err
          this.errors.importing = true
        })
    },

    resetImport () {
      this.errors.importing = false
      this.errors.importingError = null
      this.hideImportRenderModal()
      this.importCsvFormData = undefined
      this.$refs['import-modal'].reset()
      this.showImportModal()
    },

    updateUrl () {
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
        const assetTypeId = this.$route.params.asset_type_id
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
        const sequenceId = this.$route.params.sequence_id
        if (sequenceId !== this.sequenceId) {
          isChange = true
          route = {
            name: 'breakdown-sequence',
            params: {
              production_id: this.currentProduction.id,
              sequence_id: this.sequenceId
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

    onEditLabelClicked (asset, label, entityId) {
      this.editedAsset = asset
      this.editedEntityId = entityId
      this.editedAssetLinkLabel = label
      this.modals.isEditLabelDisplayed = true
    },

    confirmEditLabel (form = {}) {
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
        .catch((err) => {
          console.error(err)
          this.errors.editLabel = true
          this.loading.editLabel = false
        })
    },

    toggleTextMode () {
      this.isTextMode = !this.isTextMode
      localStorage.setItem('breakdown:text-mode', this.isTextMode)
    },

    confirmNewAssetStay (form) {
      this.loading.stay = true
      this.success.edit = false
      this.newAsset(form)
        .then((asset) => {
          this.loading.stay = false
          this.loading.edit = false
          this.resetLightEditModal(asset)
          this.$refs['edit-asset-modal'].focusName()
          this.success.edit = true
        })
        .catch((err) => {
          console.error(err)
          this.loading.stay = false
          this.loading.edit = false
          this.success.edit = false
          this.errors.edit = true
        })
    },

    confirmNewAsset (form) {
      this.loading.edit = true
      this.errors.edit = false
      this.newAsset(form)
        .then((form) => {
          this.loading.edit = false
          this.modals.isNewDisplayed = false
        })
        .catch((err) => {
          console.error(err)
          this.loading.edit = false
          this.errors.edit = true
        })
    },

    resetLightEditModal (asset) {
      const form = {
        name: '',
        entity_type_id: asset.entit_type_id,
        production_id: this.currentProduction.id
      }
      this.assetToEdit = form
    }
  },

  watch: {
    $route () {},

    castingType () {
      if (this.isShotCasting && this.sequences.length > 0) {
        this.sequenceId = this.sequences[0].id
      }
      if (this.isAssetCasting && this.castingAssetTypesOptions.length > 0) {
        const assetTypeId = this.$route.params.asset_type_id
        this.sequenceId = ''
        this.castingType = 'asset'
        if (assetTypeId) {
          this.assetTypeId = assetTypeId
        } else if (this.castingAssetTypesOptions.length > 0) {
          this.assetTypeId = this.castingAssetTypesOptions[0].value
        }
      }
    },

    sequenceId () {
      if (this.sequenceId && this.sequences && this.sequences.length > 0) {
        this.setCastingSequence(this.sequenceId)
        this.updateUrl()
        this.resetSelection()
      }
    },

    assetTypeId () {
      if (this.castingAssetTypesOptions) {
        this.setCastingAssetType(this.assetTypeId)
        this.updateUrl()
        this.resetSelection()
      }
    },

    episodeId () {
      if (this.episodeId && this.episodes && this.episodes.length > 0) {
        this.setCastingForProductionEpisodes(this.episodeId)
        this.updateUrl()
        this.resetSelection()
      }
    },

    castingSequenceOptions () { // TODO should be put to plural castingSequencesOptions
      if (this.$route.path.indexOf('asset-type') < 0) {
        const sequenceId = this.$route.params.sequence_id
        if (
          sequenceId &&
          this.sequenceMap.get(sequenceId)
        ) {
          this.sequenceId = sequenceId
        } else if (this.castingSequenceOptions.length > 0) {
          this.sequenceId = this.castingSequenceOptions[0].value
        } else {
          this.sequenceId = ''
        }
      }
    },

    castingAssetTypesOptions () {
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

    currentProduction () {
      if (!this.isLoading) {
        this.reset()
      }
    },

    currentEpisode () {
      if (
        this.currentEpisode &&
        this.episodeId !== this.currentEpisode.id &&
        !this.isLoading
      ) {
        this.reset()
      }
    },

    sequences () {
      this.$store.commit('CASTING_SET_SEQUENCES', this.sequences)
    }
  },

  socket: {
    events: {
      'episode:casting-update' (eventData) {
        const episode = this.episodeMap.get(eventData.episode_id)
        if (
          episode &&
          !this.isLocked
        ) {
          this.loadEpisodeCasting(episode)
        }
      },

      'shot:casting-update' (eventData) {
        const shot = this.shotMap.get(eventData.shot_id)
        if (
          shot &&
          shot.sequence_id === this.sequenceId &&
          !this.isLocked
        ) {
          this.loadShotCasting(shot)
        }
      },

      'asset:casting-update' (eventData) {
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

  metaInfo () {
    const pageTitle = this.$t('breakdown.title')
    return {
      title: `${this.currentProduction.name} ${pageTitle} - Kitsu`
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
    box-shadow: 0px 0px 6px #222;
  }
}

.breakdown {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: #FAFAFA;
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
  overflow-y: auto;
  padding: 1em;
  background: white;
  border: 1px solid #EEE;
  box-shadow: 0px 0px 6px #E0E0E0;
  border-radius: 1em;

  &:not(:first-child) {
    margin-left: 0.5em;
  }
}

.casting-column {
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

.level-right {
  display-flex: row;
}

.shots-title {
  font-weight: bold;
}

.subtitle {
  font-size: 1.5em;
}

.filters-area {
  margin-bottom: 2em;

  .search-field-wrapper {
    margin-right: 0.5em;
  }
}
</style>
