<template>
  <div class="breakdown page">
    <div class="breakdown-columns">

      <div class="breakdown-column casting-column">
        <div class="flexrow mb1">
          <combobox-styled
            class="mr1"
            :label="$t('main.for')"
            :options="castingTypeOptions"
            v-model="castingType"
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
            :title="$t('main.csv.import_file')"
            icon="upload"
            :is-responsive="true"
            @click="showImportModal"
          />
          <button-href-link
            class="flexrow-item"
            :title="$t('main.csv.export_file')"
            icon="download"
            :is-responsive="true"
            :path="exportUrlPath"
          />
        </div>
        <spinner class="mt1" v-if="isLoading" />
        <div class="mt1" v-else>
          <shot-line
            :key="entity.id"
            :entity-id="entity.id"
            :selected="selection[entity.id]"
            :name="entity.name"
            :assets="castingByType[entity.id] || []"
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
        <h2 class="subtitle">
          {{ $t('breakdown.all_assets') }}
        </h2>

        <div class="filters-area flexrow">
          <search-field
            class="flexrow-item"
            @change="onSearchChange"
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
      :parsed-csv="parsedCSV"
      :form-data="importCsvFormData"
      :columns="csvColumns"
      :dataMatchers="dataMatchers"
      :database="filteredCasting"
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
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { range } from '../../lib/time'
import csv from '../../lib/csv'
import AvailableAssetBlock from './breakdown/AvailableAssetBlock'
import ButtonHrefLink from '../widgets/ButtonHrefLink.vue'
import ButtonSimple from '../widgets/ButtonSimple'
import ComboboxStyled from '../widgets/ComboboxStyled'
import EditLabelModal from '../modals/EditLabelModal'
import ImportRenderModal from '../modals/ImportRenderModal'
import ImportModal from '../modals/ImportModal'
import SearchField from '../widgets/SearchField.vue'
import ShotLine from './breakdown/ShotLine'
import Spinner from '../widgets/Spinner'

export default {
  name: 'breakdown',

  components: {
    AvailableAssetBlock,
    ButtonHrefLink,
    ButtonSimple,
    ComboboxStyled,
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
      csvColumns: [
        'Episode',
        'Parent',
        'Name',
        'Asset Type',
        'Asset',
        'Occurences',
        'Label'
      ],
      dataMatchers: [
        'Episode',
        'Name',
        'Asset Type',
        'Asset'
      ],
      editedAsset: null,
      editedEntityId: null,
      editedAssetLinkLabel: null,
      episodeId: '',
      importCsvFormData: {},
      isLoading: false,
      selection: {},
      sequenceId: '',
      errors: {
        editLabel: false,
        importing: false
      },
      loading: {
        editLabel: false,
        importing: false
      },
      modals: {
        isEditLabelDisplayed: false,
        isImportRenderDisplayed: false,
        importing: false
      },
      parsedCSV: []
    }
  },

  mounted () {
    if (!this.isLoading) {
      this.reset()
    }
    this.setLastProductionScreen('breakdown')
  },

  computed: {
    ...mapGetters([
      'assetMap',
      'assetsByType',
      'casting',
      'castingAssetTypeAssets',
      'castingAssetTypesOptions',
      'castingByType',
      'castingCurrentShot',
      'castingSequenceId',
      'castingSequenceOptions',
      'castingSequenceShots',
      'currentEpisode',
      'currentProduction',
      'displayedShots',
      'getEpisodeOptions',
      'isCastingSaveActive',
      'isCurrentUserManager',
      'isAssetsLoading',
      'isShotsLoading',
      'isTVShow',
      'sequences',
      'sequenceMap',
      'shots',
      'shotMap'
    ]),

    availableAssetsByType () {
      const result = []
      this.assetsByType.forEach((typeGroup) => {
        const newGroup = typeGroup.filter((asset) => !asset.canceled)
        if (newGroup.length > 0) result.push(newGroup)
      })
      return result
    },

    exportUrlPath () {
      return (
        `/api/export/csv/projects/${this.currentProduction.id}/casting.csv`
      )
    },

    isAssetCasting () {
      return this.castingType === 'asset'
    },

    isShotCasting () {
      return this.castingType === 'shot'
    },

    castingEntities () {
      return this.isShotCasting ? this.castingSequenceShots : this.castingAssetTypeAssets
    },

    editLabelModal () {
      return this.$refs['edit-label-modal']
    },

    filteredCasting () {
      const casting = []
      this.castingEntities.forEach(entity => {
        this.castingByType[entity.id].forEach(type => {
          type.forEach(item => {
            let cast = ''
            cast += item.asset_name
            cast += item.asset_type_name
            cast += item.name
            casting.push(cast)
          })
        })
      })
      return casting
    }
  },

  methods: {
    ...mapActions([
      'addAssetToCasting',
      'displayMoreAssets',
      'loadShots',
      'loadAssets',
      'removeAssetFromCasting',
      'saveCasting',
      'setAssetSearch',
      'setCastingAssetType',
      'setCastingAssetTypes',
      'setCastingEpisode',
      'setCastingSequence',
      'setCastingShot',
      'setAssetLinkLabel',
      'setLastProductionScreen',
      'uploadCastingFile'
    ]),

    reset () {
      this.isLoading = true
      setTimeout(() => {
        this.reloadShots()
      }, 100)
    },

    reloadShots () {
      this.isLoading = true
      this.loadShots(() => {
        if (this.isTVShow) {
          if (this.currentEpisode) {
            this.episodeId = this.currentEpisode.id
          }
          this.setCastingEpisode(this.episodeId)
        } else {
          this.setCastingEpisode(null)
        }
        this.loadAssets(() => {
          this.isLoading = false
          this.displayMoreAssets()
          this.setCastingAssetTypes()
          this.resetSelection()
        })
      })
    },

    resetSelection () {
      const selection = {}
      if (this.isShotCasting) {
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

    onSearchChange (searchQuery) {
      this.setAssetSearch(searchQuery)
    },

    selectEntity (entityId, event) {
      if (!event.ctrlKey && !event.shitKey) {
        this.clearSelection()
      }

      if (this.previousEntityId && event.shiftKey) {
        this.selectRange(this.previousEntityId, entityId)
      }

      if (!this.previousEntityId || !event.shiftKey) this.previousEntityId = entityId
      this.selection[entityId] = true
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

    addOneAsset (assetId) {
      Object.keys(this.selection)
        .filter(key => this.selection[key])
        .forEach((entityId) => {
          this.addAssetToCasting({ entityId, assetId, nbOccurences: 1 })
          this.saveCasting(entityId)
            .catch(console.error)
        })
    },

    addTenAssets (assetId) {
      Object.keys(this.selection)
        .filter(key => this.selection[key])
        .forEach((entityId) => {
          this.addAssetToCasting({ entityId, assetId, nbOccurences: 10 })
          this.saveCasting(entityId)
            .catch(console.error)
        })
    },

    removeOneAsset (assetId, entityId) {
      this.removeAssetFromCasting({ entityId, assetId, nbOccurences: 1 })
      this.saveCasting(entityId)
        .catch(console.error)
    },

    removeTenAssets (assetId, entityId) {
      this.removeAssetFromCasting({ entityId, assetId, nbOccurences: 10 })
      this.saveCasting(entityId)
        .catch(console.error)
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

    cleanUpCsv (data) {
      data.forEach(item => {
        item.forEach((item, index, data) => {
          data[index] = item.trim()
        })
      })
      data[0].forEach((item, index, data) => {
        data[index] = item[0].toUpperCase() + item.slice(1)
      })
      return data
    },

    renderImport (data, mode) {
      this.loading.importing = true
      this.errors.importing = false
      if (mode === 'file') {
        data = data.get('file')
      }
      csv.processCSV(data)
        .then((results) => {
          this.cleanUpCsv(results)
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
      this.importCsvFormData = formData

      this.uploadCastingFile(this.importCsvFormData)
        .then(() => {
          this.loading.importing = false
          this.hideImportRenderModal()
          this.reloadShots()
        })
        .catch(() => {
          this.loading.importing = false
          this.errors.importing = true
        })
    },

    resetImport () {
      this.errors.importing = false
      this.hideImportRenderModal()
      this.importCsvFormData = undefined
      this.$refs['import-modal'].reset()
      this.showImportModal()
    },

    updateUrl () {
      let isChange = false
      let route = {}
      if (this.isAssetCasting) {
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
        if (this.currentEpisode) {
          route.name = `episode-${route.name}`
          route.params.episode_id = this.currentEpisode.id
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

    confirmEditLabel (form) {
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
        this.castingType = 'asset'
        if (assetTypeId) {
          this.assetTypeId = assetTypeId
        } else if (this.castingAssetTypesOptions.length > 0) {
          this.assetTypeId = this.castingAssetTypesOptions[0].value
        }
      }
    },

    sequenceId () {
      if (this.sequences && this.sequences.length > 0) {
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

    episodeId () {},

    castingSequenceOptions () {
      if (this.$route.path.indexOf('asset-type') < 0) {
        const sequenceId = this.$route.params.sequence_id
        if (
          sequenceId &&
          this.sequenceMap[sequenceId]
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
      this.reset()
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

.filters-area {
  margin-bottom: 2em;
}
</style>
