<template>
<div class="page asset">
  <div class="page-header flexrow">
    <router-link
      class="flexrow-item has-text-centered back-link"
      :to="assetsPath"
    >
      <chevron-left-icon />
    </router-link>
    <entity-thumbnail
      class="asset-thumbnail flexrow-item"
      :entity="currentAsset"
      :with-link="false"
      v-if="currentAsset"
    />
    <div class="flexrow-item">
      <page-title :text="title" class="entity-title" />
    </div>
    <div class="flexrow-item">
      <button-simple
        icon="edit"
        @click="modals.edit = true"
      />
    </div>
  </div>

  <div class="columns">
    <div class="column task-column">
      <page-subtitle :text="$t('assets.tasks')"></page-subtitle>
      <entity-task-list
        class="task-list"
        :entries="currentAsset ? currentAsset.tasks : []"
        :is-loading="!currentAsset"
        :is-error="false"
      />
    </div>
    <div class="column">
      <page-subtitle :text="$t('main.info')"></page-subtitle>
      <div class="table-body">
        <table class="table" v-if="currentAsset">
          <tbody>
            <tr>
              <td class="field-label">{{ $t('assets.fields.description') }}</td>
              <description-cell
                :entry="currentAsset"
                :full="true"
              />
            </tr>
            <tr
              :key="descriptor.id"
              v-for="descriptor in assetMetadataDescriptors"
            >
              <td class="field-label">{{ descriptor.name }}</td>
              <td>
                {{ currentAsset.data ? currentAsset.data[descriptor.field_name] : '' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="asset-casted-in">
    <page-subtitle :text="$t('assets.cast_in')"></page-subtitle>
    <div v-if="currentAsset">
      <div
        class="sequence-shots"
        :key="sequenceShots.length > 0 ? sequenceShots[0].sequence_name : ''"
        v-for="sequenceShots in currentAsset.castInShotsBySequence"
        v-if="currentAsset.castInShotsBySequence[0].length > 0"
      >
        <div class="shot-sequence">
          {{ sequenceShots.length > 0 ? sequenceShots[0].sequence_name : '' }}
        </div>
        <div class="shot-list">
          <router-link
            class="shot-link"
            :key="shot.shot_id"
            :to="{
              name: 'shot',
              params: {
                production_id: currentProduction.id,
                shot_id: shot.shot_id
              }
            }"
            v-for="shot in sequenceShots"
          >
            <entity-thumbnail
              :entity="shot"
              :square="true"
              :empty-width="100"
              :empty-height="100"
              :with-link="false"
            />
            <div>
              <span>{{ shot.name }}</span>
              <span v-if="shot.nb_occurences > 1">
                ({{ shot.nb_occurences }})
              </span>
            </div>
          </router-link>
        </div>
      </div>
      <div v-else>
        {{ $t('assets.no_cast_in') }}
      </div>
    </div>
    <table-info
      :is-loading="castIn.isLoadin"
      :is-error="castIn.isError"
      v-else
    />
  </div>

  <edit-asset-modal
    ref="edit-asset-modal"
    :active="modals.edit"
    :is-loading="loading.edit"
    :is-error="errors.edit"
    :asset-to-edit="currentAsset"
    @cancel="modals.edit = false"
    @confirm="confirmEditAsset"
  />
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import { ChevronLeftIcon } from 'vue-feather-icons'
import ButtonSimple from '../widgets/ButtonSimple'
import DescriptionCell from '../cells/DescriptionCell'
import EditAssetModal from '../modals/EditAssetModal'
import EntityTaskList from '../lists/EntityTaskList'
import EntityThumbnail from '../widgets/EntityThumbnail'
import PageTitle from '../widgets/PageTitle'
import PageSubtitle from '../widgets/PageSubtitle'
import TableInfo from '../widgets/TableInfo'

export default {
  name: 'asset',
  components: {
    ButtonSimple,
    ChevronLeftIcon,
    DescriptionCell,
    EditAssetModal,
    EntityThumbnail,
    EntityTaskList,
    PageSubtitle,
    PageTitle,
    TableInfo
  },

  data () {
    return {
      currentAsset: null,
      castIn: {
        isLoading: false,
        isError: false
      },
      errors: {
        edit: false
      },
      loading: {
        edit: false
      },
      modals: {
        edit: false
      }
    }
  },

  created () {
    this.clearSelectedTasks()
    this.currentAsset = this.getCurrentAsset()

    this.castIn.isLoading = true
    this.castIn.isError = false

    if (!this.currentAsset) {
      this.loadAsset({
        assetId: this.route.params.asset_id,
        callback: (err) => {
          if (!err) {
            this.currentAsset = this.getCurrentAsset()
            this.loadAssetCastIn({
              asset: this.currentAsset,
              callback: (err, castIn) => {
                if (err) {
                  this.castIn.isError = true
                } else {
                  this.castIn.isError = false
                }
                this.castIn.isLoading = true
              }
            })
          }
        }
      })
    } else {
      this.loadAssetCastIn({
        asset: this.currentAsset,
        callback: (err, castIn) => {
          if (err) {
            this.castIn.isError = true
          } else {
            this.castIn.isError = false
          }
          this.castIn.isLoading = true
        }
      })
    }
  },

  computed: {
    ...mapGetters([
      'assetMap',
      'assetMetadataDescriptors',
      'assetsPath',
      'currentProduction',
      'route'
    ]),

    title () {
      if (this.currentAsset) {
        return `${this.currentAsset.asset_type_name} / ` +
               `${this.currentAsset.name}`
      } else {
        return 'Loading...'
      }
    },

    assetThumbnailPath () {
      const previewId = this.currentAsset.preview_file_id
      return `/api/pictures/originals/preview-files/${previewId}.png`
    },

    isPreview () {
      return this.currentAsset &&
        this.currentAsset.preview_file_id &&
        this.currentAsset.preview_file_id.length > 0
    }
  },

  methods: {
    ...mapActions([
      'editAsset',
      'loadAsset',
      'loadAssetCastIn',
      'clearSelectedTasks'
    ]),

    changeTab (tab) {
      this.selectedTab = tab
    },

    getCurrentAsset () {
      return this.assetMap[this.route.params.asset_id] || null
    },

    onEditClicked () {
      this.modals.edit = true
    },

    confirmEditAsset (form) {
      form.id = this.currentAsset.id
      this.loading.edit = true
      this.errors.edit = false
      this.editAsset({
        data: form,
        callback: (err) => {
          if (err) {
            this.loading.edit = false
            this.errors.edit = true
          } else {
            this.loading.edit = false
            this.modals.edit = false
          }
        }
      })
    }
  },

  watch: {
    $route () { this.handleModalsDisplay() }
  },

  metaInfo () {
    return {
      title: `${this.title} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.dark .page {
  background: $dark-grey-light;
  padding-bottom: 1em;
}

.dark .page-header,
.dark .asset-casted-in,
.dark .column {
  background: #46494F;
  border-color: $dark-grey;
  box-shadow: 0px 0px 6px #333;
}

.dark .task-list,
.dark .table-body {
  border: 1px solid $dark-grey;
}

h2.subtitle {
  margin-top: 0;
  margin-bottom: 0.5em;
  font-weight: 300;
  font-size: 1.5em;
}

.page {
  background: #F9F9F9;
  padding: 0em;
}

.page-header {
  padding: 1em 1em 1em 1em;
  background: white;
  box-shadow: 0px 0px 6px #E0E0E0;
  margin-top: calc(50px + 2em);
  margin-bottom: 1.5em;
  margin-left: 1em;
  margin-right: 1em;
}

.columns {
  margin-left: 1em;
  margin-right: 1em;
}

.column {
  background: white;
  padding: 1em;
  box-shadow: 0px 0px 6px #E0E0E0;
  margin: 0;
}

.column:first-child {
  margin-right: 1em;
}

.asset-casted-in {
  margin-left: 1em;
  margin-right: 1em;
  background: white;
  padding: 1em;
  box-shadow: 0px 0px 6px #E0E0E0;
}

.thumbnail-picture {
  margin-bottom: 0.5em;
}

.shot-sequence {
  text-transform: uppercase;
  font-size: 1.2em;
  color: $grey;
  margin-top: 2em;
  margin-bottom: 0.4em;
}

.shot-list {
  display: flex;
  flex-wrap: wrap;
}

.shot-link {
  color: inherit;
  margin-right: 1em;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.8em;
}

.shot-link div {
  max-width: 100px;
}

.shot-link span {
  word-wrap: break-word;
}

.field-label {
  font-weight: bold;
  width: 120px;
}

.page-header {
  align-items: center;
}

.page-header .thumbnail-picture {
  margin: 0 1em 0 0;
  max-width: 80px;
}

.back-link {
  padding-top: 3px;
}

.task-list,
.table-body {
  border: 1px solid $light-grey;
}

.task-list {
  width: 100%;
}

@media screen and (max-width: 768px) {
  .task-column {
    margin-bottom: 1em;
  }

  .column:first-child {
    margin-right: 0;
  }

  .entity-title {
    font-size: 1.3em;
    line-height: 1.5em;
  }
}
</style>
