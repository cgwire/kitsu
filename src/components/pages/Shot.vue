<template>
<div class="page shot">

  <div class="page-header flexrow">
    <router-link
      class="flexrow-item has-text-centered back-link"
      :to="shotsPath"
    >
      <chevron-left-icon />
    </router-link>
    <entity-thumbnail
      class="shot-thumbnail flexrow-item"
      :entity="currentShot"
      :with-link="false"
      v-if="currentShot"
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
    <page-subtitle :text="$t('shots.tasks')" />
    <entity-task-list
      class="task-list"
      :entries="currentShot ? currentShot.tasks : []"
      :is-loading="!currentShot"
      :is-error="false"
    />
    </div>
    <div class="column">
      <page-subtitle :text="$t('main.info')" />
      <div class="table-body">
        <table class="table" v-if="currentShot">
          <tbody>
            <tr v-if="currentShot.data && currentShot.data.fps">
              <td class="field-label">{{ $t('shots.fields.fps') }}</td>
              <td>
                {{ currentShot ? currentShot.data.fps : '' }}
              </td>
            </tr>

            <tr v-if="currentShot.data && currentShot.data.frame_in">
              <td class="field-label">{{ $t('shots.fields.frame_in') }}</td>
              <td>
                {{ currentShot ? currentShot.data.frame_in : '' }}
              </td>
            </tr>

            <tr v-if="currentShot.data && currentShot.data.frame_out">
              <td class="field-label">{{ $t('shots.fields.frame_out') }}</td>
              <td>
                {{ currentShot ? currentShot.data.frame_out : '' }}
              </td>
            </tr>

            <tr>
              <td class="field-label">{{ $t('shots.fields.description') }}</td>
              <description-cell
                :entry="currentShot"
                :full="true"
              />
            </tr>

            <tr>
              <td class="field-label">{{ $t('shots.fields.nb_frames') }}</td>
              <td>
                {{ currentShot ? currentShot.nb_frames : '' }}
              </td>
            </tr>

            <tr
              :key="descriptor.id"
              v-for="descriptor in shotMetadataDescriptors"
            >
              <td class="field-label">{{ descriptor.name }}</td>
              <td>
                {{ currentShot.data ? currentShot.data[descriptor.field_name] : '' }}
              </td>
            </tr>

          </tbody>
      </table>
    </div>
    </div>
  </div>

  <div class="shot-casting">
    <page-subtitle :text="$t('shots.casting')" />
    <div v-if="currentShot">
      <div
          v-if="currentShot.castingAssetsByType[0].length > 0"
      >
        <div
          class="type-assets"
          :key="typeAssets.length > 0 ? typeAssets[0].asset_type_name : ''"
          v-for="typeAssets in currentShot.castingAssetsByType"
        >
          <div class="asset-type">
            {{ typeAssets.length > 0 ? typeAssets[0].asset_type_name : '' }}
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
                :empty-width="100"
                :empty-height="100"
                :with-link="false"
              />
              <div>
                <span>{{ asset.name }}</span>
                <span v-if="asset.nb_occurences > 1">
                  ({{ asset.nb_occurences }})
                </span>
              </div>
            </router-link>
          </div>
        </div>
      </div>
      <div v-else>
        {{ $t('shots.no_casting') }}
      </div>
    </div>
    <table-info
      :is-loading="casting.isLoadin"
      :is-error="casting.isError"
      v-else
    >
    </table-info>
  </div>

  <edit-shot-modal
    ref="edit-shot-modal"
    :active="modals.edit"
    :is-loading="loading.edit"
    :is-error="errors.edit"
    :shot-to-edit="currentShot"
    @cancel="modals.edit = false"
    @confirm="confirmEditShot"
  />
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { ChevronLeftIcon } from 'vue-feather-icons'

import ButtonSimple from '../widgets/ButtonSimple'
import DescriptionCell from '../cells/DescriptionCell'
import EditShotModal from '../modals/EditShotModal'
import EntityThumbnail from '../widgets/EntityThumbnail'
import EntityTaskList from '../lists/EntityTaskList'
import PageTitle from '../widgets/PageTitle'
import PageSubtitle from '../widgets/PageSubtitle'
import TableInfo from '../widgets/TableInfo'

export default {
  name: 'shot',
  components: {
    ButtonSimple,
    ChevronLeftIcon,
    DescriptionCell,
    EditShotModal,
    EntityThumbnail,
    EntityTaskList,
    PageSubtitle,
    PageTitle,
    TableInfo
  },

  data () {
    return {
      currentShot: null,
      casting: {
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
    if (!this.currentProduction) {
      this.setProduction(this.$route.params.production_id)
    } else {
      const options = { productionId: this.currentProduction.id }
      if (this.currentEpisode) options.episodeId = this.currentEpisode.id
      this.$store.commit('RESET_PRODUCTION_PATH', options)
    }

    this.clearSelectedTasks()

    this.currentShot = this.getCurrentShot()

    this.casting.isLoading = true
    this.casting.isError = false

    if (!this.currentShot) {
      this.loadShot({
        shotId: this.route.params.shot_id,
        callback: (err) => {
          if (!err) {
            this.currentShot = this.getCurrentShot()
            this.loadShotCasting({
              shot: this.currentShot,
              callback: (err, casting) => {
                if (err) {
                  this.casting.isError = true
                } else {
                  this.casting.isError = false
                }
                this.casting.isLoading = true
              }
            })
          }
        }
      })
    } else {
      this.loadShotCasting({
        shot: this.currentShot,
        callback: (err, casting) => {
          if (err) {
            this.casting.isError = true
          } else {
            this.casting.isError = false
          }
          this.casting.isLoading = true
        }
      })
    }
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'route',
      'shotMap',
      'shotMetadataDescriptors',
      'shotsPath'
    ]),

    title () {
      if (this.currentShot) {
        if (this.currentShot.episode_name) {
          return `${this.currentShot.episode_name} / ` +
                 `${this.currentShot.sequence_name} / ` +
                 `${this.currentShot.name}`
        } else {
          return `${this.currentShot.sequence_name} / ` +
                 `${this.currentShot.name}`
        }
      } else {
        return 'Loading...'
      }
    },

    shotThumbnailPath () {
      const previewId = this.currentShot.preview_file_id
      return `/api/pictures/originals/preview-files/${previewId}.png`
    },

    isPreview () {
      return this.currentShot &&
        this.currentShot.preview_file_id &&
        this.currentShot.preview_file_id.length > 0
    }
  },

  methods: {
    ...mapActions([
      'editShot',
      'loadShot',
      'loadShotCasting',
      'clearSelectedTasks'
    ]),

    changeTab (tab) {
      this.selectedTab = tab
    },

    getCurrentShot () {
      return this.shotMap[this.route.params.shot_id] || null
    },

    onEditClicked () {
      this.modals.edit = true
    },

    confirmEditShot (form) {
      form.id = this.currentShot.id
      this.loading.edit = true
      this.errors.edit = false
      this.editShot({
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
  height: 100%;
  padding-bottom: 1em;
}

.dark .page-header,
.dark .shot-casting,
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
  margin-bottom: 2em;
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

.shot-casting {
  margin-left: 1em;
  margin-right: 1em;
  background: white;
  padding: 1em;
  box-shadow: 0px 0px 6px #E0E0E0;
}

.shot-thumbnail {
  max-width: 100px;
}

.asset-link .thumbnail-picture {
  margin-bottom: 0.5em;
}

.asset-type {
  text-transform: uppercase;
  font-size: 1.2em;
  color: $grey;
  margin-top: 2em;
  margin-bottom: 0.4em;
}

.asset-list {
  display: flex;
  flex-wrap: wrap;
}

.asset-link {
  color: inherit;
  margin-right: 1em;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.8em;
}

.asset-link div {
  max-width: 100px;
}

.asset-link span {
  word-wrap: break-word;
}

.field-label {
  font-weight: bold;
  width: 140px;
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
