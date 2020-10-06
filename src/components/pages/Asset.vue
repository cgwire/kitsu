<template>
<div class="columns fixed-page asset">
  <div class="column main-column">
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
          v-if="isCurrentUserManager"
        />
      </div>
    </div>

    <div class="flexrow infos">
      <div class="flexrow-item">
        <page-subtitle :text="$t('assets.tasks')" />
        <entity-task-list
          class="task-list"
          :entries="currentAsset ? currentAsset.tasks : []"
          :is-loading="!currentAsset"
          :is-error="false"
          @task-selected="onTaskSelected"
        />
      </div>
      <div class="flexrow-item">
        <page-subtitle :text="$t('main.info')" />
        <div class="table-body">
          <table class="datatable" v-if="currentAsset">
            <tbody class="table-body">
              <tr
                class="datatable-row"
              >
                <td class="field-label">{{ $t('assets.fields.description') }}</td>
                <description-cell
                  :entry="currentAsset"
                  :full="true"
                />
              </tr>
              <tr
                :key="descriptor.id"
                class="datatable-row"
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
      <page-subtitle :text="$t('assets.cast_in')" />
      <div v-if="currentAsset">
        <div
          v-if="currentAsset.castInShotsBySequence &&
                currentAsset.castInShotsBySequence[0].length > 0"
        >
          <div
            class="sequence-shots"
            :key="sequenceShots.length > 0 ? sequenceShots[0].sequence_name : ''"
            v-if="sequenceShots[0].sequence_name"
            v-for="sequenceShots in currentAsset.castInShotsBySequence"
          >
            <div class="shot-sequence">
              {{ sequenceShots.length > 0 ? sequenceShots[0].sequence_name : '' }}
            </div>
            <div class="shot-list">
              <router-link
                class="shot-link"
                :key="shot.shot_id"
                :to="shotPath(shot)"
                v-for="shot in sequenceShots"
              >
                <entity-thumbnail
                  :entity="shot"
                  :square="true"
                  :empty-width="103"
                  :empty-height="103"
                  :with-link="false"
                />
                <div>
                  <span>{{ shot.shot_name }}</span>
                  <span v-if="shot.nb_occurences > 1">
                    ({{ shot.nb_occurences }})
                  </span>
                </div>
              </router-link>
            </div>
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

      <div v-if="currentAsset && currentAsset.castingAssetsByType &&
          currentAsset.castingAssetsByType[0].length > 0">
        <page-subtitle text="Linked" />
        <div
            v-if="currentAsset.castingAssetsByType && currentAsset.castingAssetsByType[0].length > 0"
        >
          <div
            class="type-assets"
            :key="typeAssets.length > 0 ? typeAssets[0].asset_type_name : ''"
            v-for="typeAssets in currentAsset.castingAssetsByType"
          >
            <div class="asset-type">
              {{ typeAssets.length > 0 ? typeAssets[0].asset_type_name : '' }}
              ({{ typeAssets.length }})
            </div>
            <div class="asset-list">
              <router-link
                class="asset-link"
                :key="asset.id"
                :to="{
                  name: 'asset',
                  params: {
                    production_id: currentProduction.id,
                    asset_id: asset.asset_id
                  }
                }"
                v-for="asset in typeAssets"
              >
                <entity-thumbnail
                  :entity="asset"
                  :square="true"
                  :empty-width="103"
                  :empty-height="103"
                  :with-link="false"
                />
                <div>
                  <span>{{ asset.asset_name }}</span>
                  <span v-if="asset.nb_occurences > 1">
                    ({{ asset.nb_occurences }})
                  </span>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    class="column side-column"
    v-if="currentTask"
  >
    <task-info
      :task="currentTask"
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
import TaskInfo from '../sides/TaskInfo'

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
    TableInfo,
    TaskInfo
  },

  data () {
    return {
      currentAsset: null,
      currentTask: null,
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

  mounted () {
    this.clearSelectedTasks()
    this.currentAsset = this.getCurrentAsset()

    this.castIn.isLoading = true
    this.castIn.isError = false
    if (this.currentAsset) {
      this.loadAssetCastIn(this.currentAsset)
        .then(() => this.loadAssetCasting(this.currentAsset))
        .then(() => {
          this.castIn.isLoading = false
        })
        .catch((err) => {
          this.castIn.isError = true
          console.error(err)
        })
    } else {
      this.resetData()
    }
  },

  computed: {
    ...mapGetters([
      'assetMap',
      'assetMetadataDescriptors',
      'assetsPath',
      'currentEpisode',
      'currentProduction',
      'isTVShow',
      'isCurrentUserManager',
      'route',
      'shotId'
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
      'clearSelectedTasks',
      'editAsset',
      'loadAssets',
      'loadAssetCastIn',
      'loadAssetCasting',
      'loadShots',
      'setCurrentEpisode'
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
      this.editAsset(form)
        .then(() => {
          this.loading.edit = false
          this.modals.edit = false
        })
        .catch((err) => {
          console.error(err)
          this.loading.edit = false
          this.errors.edit = true
        })
    },

    onTaskSelected (task) {
      this.currentTask = task
    },

    resetData () {
      if (this.$route.params.episode_id === 'main') {
        this.setCurrentEpisode('main')
      }
      this.loadAssets()
        .then(() => {
          this.currentAsset = this.getCurrentAsset()
          return this.loadAssetCastIn(this.currentAsset)
        })
        .then(() => this.loadAssetCasting(this.currentAsset))
        .then(() => {
          this.castIn.isLoading = false
        })
        .catch((err) => {
          this.castIn.isError = true
          console.error(err)
        })
    },

    shotPath (shot) {
      return {
        name: shot.episode_id ? 'episode-shot' : 'shot',
        params: {
          production_id: this.currentProduction.id,
          shot_id: shot.shot_id,
          episode_id: shot.episode_id ? shot.episode_id : undefined
        }
      }
    }
  },

  watch: {
    currentProduction () {
      if (!this.isTVShow) this.resetData()
    },

    currentEpisode () {
      if (this.isTVShow && this.currentEpisode.id !== 'main') this.resetData()
    }
  },

  metaInfo () {
    return {
      title: `${this.title} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .page {
    background: $dark-grey-light;
    padding-bottom: 1em;
  }

  .page-header,
  .asset-casted-in,
  .infos,
  .column {
    background: #46494F;
    border-color: $dark-grey;
    box-shadow: 0px 0px 6px #333;
  }

  .task-list,
  .table-body {
    border: 1px solid $dark-grey;
  }
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

.infos {
  padding: 1em 1em 1em 1em;
  background: white;
  box-shadow: 0px 0px 6px #E0E0E0;
  margin-bottom: 1.5em;
  margin-left: 1em;
  margin-right: 1em;

  .flexrow-item {
    align-self: flex-start;
    flex: 1;
  }
}

.asset-casting,
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

.sequence-shots {
  margin-bottom: 3em;
}

.asset-type,
.shot-sequence {
  text-transform: uppercase;
  font-size: 1.2em;
  color: var(--text);
  margin-top: 2em;
  margin-bottom: 0.4em;
}

.asset-list,
.shot-list {
  color: var(--text);
  display: flex;
  flex-wrap: wrap;
}

.asset-link,
.shot-link {
  color: inherit;
  margin-right: 1em;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.8em;
}

.asset-link div,
.shot-link div {
  max-width: 100px;
}

.asset-link span,
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

.task-list {
  max-width: 100%;
}

.datatable-row {
  user-select: text;
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
