<template>
<div class="page">

  <div class="page-header">
    <router-link
      :to="shotsPath"
      class="flexrow-item has-text-centered"
    >
      {{ $t('tasks.back_to_list')}}
    </router-link>

    <div class="flexrow">
      <div class="flexrow-item">
        <entity-thumbnail
          class="shot-thumbnail"
          :entity="currentShot"
          :empty-width="100"
          :empty-height="66.66"
          v-if="currentShot"
        />
      </div>
      <div class="flexrow-item">
        <page-title class="entity-title" :text="title" />
     </div>
    </div>
  </div>

  <div class="columns">
    <div class="column task-column">
    <page-subtitle :text="$t('shots.tasks')" />
    <entity-task-list
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
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="shot-casting">
    <page-subtitle :text="$t('shots.casting')" />
    <div v-if="currentShot">
      <div
        class="type-assets"
        :key="typeAssets.length > 0 ? typeAssets[0].asset_type_name : ''"
        v-for="typeAssets in currentShot.castingAssetsByType"
        v-if="currentShot.castingAssetsByType[0].length > 0"
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
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import DescriptionCell from './cells/DescriptionCell'
import PageTitle from './widgets/PageTitle'
import PageSubtitle from './widgets/PageSubtitle'
import EntityThumbnail from './widgets/EntityThumbnail'
import EntityTaskList from './lists/EntityTaskList'
import TableInfo from './widgets/TableInfo'

export default {
  name: 'shot',
  components: {
    DescriptionCell,
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
      }
    }
  },

  created () {
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
      'loadShot',
      'loadShotCasting',
      'clearSelectedTasks'
    ]),
    changeTab (tab) {
      this.selectedTab = tab
    },
    getCurrentShot () {
      return this.shotMap[this.route.params.shot_id] || null
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

<style scoped>
.dark .page {
  background: #3D4048;
  height: 100%;
  padding-bottom: 1em;
}

.dark .page-header,
.dark .shot-casting,
.dark .column {
  background: #46494F;
  border-color: #25282E;
  box-shadow: 0px 0px 6px #333;
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
  color: #999;
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
