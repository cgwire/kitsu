<template>
  <div class="columns fixed-page shot xyz-in" xyz="fade">
    <div class="column main-column">
      <div class="page-header flexrow">
        <router-link
          class="flexrow-item has-text-centered back-link"
          :to="getShotsRoute"
        >
          <corner-left-up-icon />
        </router-link>
        <span class="flexrow-item ml2">
          <entity-thumbnail
            class="entity-thumbnail"
            :entity="currentShot"
            :empty-width="100"
            :empty-height="60"
            :width="100"
            v-if="currentShot"
          />
        </span>
        <div class="entity-title flexrow-item">
          {{ title }}
        </div>
        <div class="filler"></div>
        <router-link
          class="flexrow-item has-text-centered back-link ml1"
          :to="previousEntityPath"
          v-if="previousEntityPath && entityList.length > 1"
        >
          <chevron-left-icon />
        </router-link>
        <router-link
          class="flexrow-item has-text-centered back-link"
          :to="nextEntityPath"
          v-if="nextEntityPath && entityList.length > 1"
        >
          <chevron-right-icon />
        </router-link>
      </div>

      <div class="entity-data block">
        <route-section-tabs
          class="section-tabs"
          :active-tab="currentSection"
          :route="$route"
          :tabs="entityTabs"
        />

        <div class="flexrow mt1">
          <span v-show="currentSection === 'casting'">
            {{ nbAssets }} {{ $tc('assets.number', nbAssets) }}
          </span>
          <span
            class="tag tag-standby"
            v-show="
              currentSection === 'casting' &&
              currentShot &&
              currentShot.is_casting_standby
            "
          >
            {{ $t('breakdown.fields.standby') }}
          </span>
          <div class="filler"></div>
          <span
            class="flexrow-item mt05"
            v-show="currentSection === 'schedule'"
          >
            {{ $t('schedule.zoom_level') }}:
          </span>
          <combobox-number
            class="zoom-level flexrow-item"
            :options="zoomOptions"
            is-simple
            v-model="zoomLevel"
            v-show="currentSection === 'schedule'"
          />
        </div>

        <div class="flexcolumn infos" v-show="currentSection === 'infos'">
          <page-subtitle :text="$t('shots.tasks')" />
          <entity-task-list
            class="task-list"
            :entries="currentTasks"
            :is-loading="!currentShot"
            :is-error="false"
            @task-selected="onTaskSelected"
          />
          <div class="flexrow">
            <page-subtitle :text="$t('main.info')" />
            <div class="filler"></div>
            <div class="flexrow-item has-text-right">
              <button-simple
                icon="edit"
                :title="$t('shots.edit_title')"
                @click="modals.edit = true"
                v-if="isCurrentUserManager"
              />
            </div>
          </div>
          <div class="table-body">
            <table class="datatable no-header" v-if="currentShot">
              <tbody class="datatable-body">
                <tr class="datatable-row">
                  <td class="field-label">
                    {{ $t('shots.fields.description') }}
                  </td>
                  <description-cell :entry="currentShot" :full="true" />
                </tr>

                <tr class="datatable-row">
                  <td class="field-label">
                    {{ $t('shots.fields.nb_frames') }}
                  </td>
                  <td>
                    {{ currentShot ? currentShot.nb_frames : '' }}
                  </td>
                </tr>

                <tr
                  class="datatable-row"
                  v-if="
                    currentShot &&
                    currentShot.data &&
                    currentShot.data.frame_in != null
                  "
                >
                  <td class="field-label">
                    {{ $t('shots.fields.frame_in') }}
                  </td>
                  <td>
                    {{ currentShot ? currentShot.data.frame_in : '' }}
                  </td>
                </tr>

                <tr
                  class="datatable-row"
                  v-if="
                    currentShot &&
                    currentShot.data &&
                    currentShot.data.frame_out
                  "
                >
                  <td class="field-label">
                    {{ $t('shots.fields.frame_out') }}
                  </td>
                  <td>
                    {{ currentShot ? currentShot.data.frame_out : '' }}
                  </td>
                </tr>

                <tr
                  class="datatable-row"
                  v-if="currentShot && currentShot.data && currentShot.data.fps"
                >
                  <td class="field-label">{{ $t('shots.fields.fps') }}</td>
                  <td>
                    {{ currentShot ? currentShot.data.fps : '' }}
                  </td>
                </tr>

                <tr
                  class="datatable-row"
                  v-if="
                    currentShot &&
                    currentShot.data &&
                    currentShot.data.resolution
                  "
                >
                  <td class="field-label">
                    {{ $t('shots.fields.resolution') }}
                  </td>
                  <td>
                    {{ currentShot ? currentShot.data.resolution : '' }}
                  </td>
                </tr>

                <tr
                  class="datatable-row"
                  v-if="
                    currentShot &&
                    currentShot.data &&
                    currentShot.data.max_retakes
                  "
                >
                  <td class="field-label">
                    {{ $t('shots.fields.max_retakes') }}
                  </td>
                  <td>
                    {{ currentShot ? currentShot.data.max_retakes : '' }}
                  </td>
                </tr>

                <tr
                  :key="descriptor.id"
                  class="datatable-row"
                  v-for="descriptor in shotMetadataDescriptors"
                >
                  <td class="field-label">{{ descriptor.name }}</td>
                  <td>
                    {{
                      currentShot && currentShot.data
                        ? currentShot.data[descriptor.field_name]
                        : ''
                    }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <entity-chat
          :entity="currentShot"
          :name="currentShot ? currentShot.full_name : ''"
          v-if="currentSection === 'chat'"
        />

        <div class="shot-casting" v-show="currentSection === 'casting'">
          <div v-if="currentShot">
            <div
              v-if="
                currentShot &&
                currentShot.castingAssetsByType &&
                currentShot.castingAssetsByType[0].length > 0
              "
            >
              <div
                class="type-assets"
                :key="
                  typeAssets.length > 0 ? typeAssets[0].asset_type_name : ''
                "
                v-for="typeAssets in currentShot.castingAssetsByType"
              >
                <div class="asset-type">
                  {{
                    typeAssets.length > 0 ? typeAssets[0].asset_type_name : ''
                  }}
                  ({{ typeAssets.length }})
                </div>
                <div class="asset-list">
                  <router-link
                    class="asset-link"
                    :key="asset.id"
                    :to="buildAssetRoute(asset)"
                    v-for="asset in typeAssets"
                  >
                    <entity-thumbnail
                      class="entity-thumbnail"
                      :class="{ shared: asset.shared }"
                      :entity="asset"
                      :square="true"
                      :empty-width="103"
                      :empty-height="103"
                      :with-link="false"
                    />
                    <div class="break-word">
                      {{ asset.asset_name }}
                      <template v-if="asset.nb_occurences > 1">
                        ({{ asset.nb_occurences }})
                      </template>
                    </div>
                    <div
                      class="ready-for flexrow"
                      v-if="!asset.shared && asset.ready_for"
                    >
                      <task-type-name
                        class="flexrow-item"
                        :task-type="taskTypeMap.get(asset.ready_for)"
                        :current-production-id="currentProduction.id"
                        :title="
                          'Ready for: ' + taskTypeMap.get(asset.ready_for).name
                        "
                      />
                    </div>
                  </router-link>
                </div>
              </div>
            </div>
            <div class="mt1" v-else>
              {{ $t('shots.no_casting') }}
            </div>
          </div>
          <table-info
            :is-loading="casting.isLoading"
            :is-error="casting.isError"
            v-else
          />
        </div>

        <div
          class="schedule mt1"
          v-if="scheduleItems[0].children.length > 0"
          v-show="currentSection === 'schedule'"
        >
          <div class="wrapper">
            <schedule
              ref="schedule-widget"
              :start-date="tasksStartDate"
              :end-date="tasksEndDate"
              :hierarchy="scheduleItems"
              :zoom-level="zoomLevel"
              :is-loading="false"
              :is-estimation-linked="true"
              :hide-root="true"
              :with-milestones="false"
              @item-changed="saveTaskScheduleItem"
              @estimation-changed="event => saveTaskScheduleItem(event.item)"
            />
          </div>
        </div>

        <entity-preview-files
          :entity="currentShot"
          v-if="currentSection === 'preview-files'"
        />

        <entity-time-logs
          :entity="currentShot"
          v-if="currentSection === 'time-logs'"
        />
      </div>
    </div>

    <div class="column side-column" v-show="currentSection === 'infos'">
      <task-info :task="currentTask" entity-type="Shot" with-actions>
        <entity-news class="news-column" :entity="currentShot" />
      </task-info>
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
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CornerLeftUpIcon
} from 'lucide-vue-next'

import shotStore from '@/store/modules/shots'

import { episodifyRoute } from '@/lib/path'
import { entityMixin } from '@/components/mixins/entity'
import { formatListMixin } from '@/components/mixins/format'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'
import DescriptionCell from '@/components/cells/DescriptionCell.vue'
import EditShotModal from '@/components/modals/EditShotModal.vue'
import EntityChat from '@/components/pages/entities/EntityChat.vue'
import EntityNews from '@/components/pages/entities/EntityNews.vue'
import EntityPreviewFiles from '@/components/pages/entities/EntityPreviewFiles.vue'
import EntityTaskList from '@/components/lists/EntityTaskList.vue'
import EntityTimeLogs from '@/components/pages/entities/EntityTimeLogs.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import PageSubtitle from '@/components/widgets/PageSubtitle.vue'
import RouteSectionTabs from '@/components/widgets/RouteSectionTabs.vue'
import Schedule from '@/components/widgets/Schedule.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

export default {
  name: 'shot',

  mixins: [entityMixin, formatListMixin],

  components: {
    ButtonSimple,
    ComboboxNumber,
    ChevronLeftIcon,
    ChevronRightIcon,
    CornerLeftUpIcon,
    DescriptionCell,
    EditShotModal,
    EntityChat,
    EntityNews,
    EntityPreviewFiles,
    EntityTaskList,
    EntityTimeLogs,
    EntityThumbnail,
    PageSubtitle,
    RouteSectionTabs,
    Schedule,
    TableInfo,
    TaskInfo,
    TaskTypeName
  },

  data() {
    return {
      type: 'shot',
      currentShot: null,
      currentTask: null,
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

  mounted() {
    this.clearSelectedTasks()
    this.init()
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'getTaskTypePriority',
      'isCurrentUserManager',
      'isTVShow',
      'route',
      'shotMap',
      'shotMetadataDescriptors',
      'shotSearchText',
      'shotsPath',
      'taskMap',
      'taskTypeMap'
    ]),

    title() {
      if (this.currentShot) {
        if (this.currentShot.episode_name) {
          return (
            `${this.currentShot.episode_name} / ` +
            `${this.currentShot.sequence_name} / ` +
            `${this.currentShot.name}`
          )
        } else {
          return `${this.currentShot.sequence_name} / ${this.currentShot.name}`
        }
      } else {
        return 'Loading...'
      }
    },

    shotThumbnailPath() {
      const previewId = this.currentShot.preview_file_id
      return `/api/pictures/originals/preview-files/${previewId}.png`
    },

    isPreview() {
      return (
        this.currentShot &&
        this.currentShot.preview_file_id &&
        this.currentShot.preview_file_id.length > 0
      )
    },

    getShotsRoute() {
      const route = {
        name: 'shots',
        params: {
          production_id: this.currentProduction.id
        },
        query: {
          search: this.shotSearchText
        }
      }
      if (this.currentEpisode) {
        route.name = 'episode-shots'
        route.params.episode_id = this.currentEpisode.id
      }
      return route
    },

    nbAssets() {
      let nbAssets = 0
      if (
        this.currentShot &&
        this.currentSection === 'casting' &&
        this.currentShot.castingAssetsByType
      ) {
        this.currentShot.castingAssetsByType.forEach(group => {
          nbAssets += group.length
        })
      }
      return nbAssets
    }
  },

  methods: {
    ...mapActions([
      'clearSelectedTasks',
      'editShot',
      'loadShot',
      'loadShotCasting'
    ]),

    changeTab(tab) {
      this.selectedTab = tab
    },

    getCurrentShot() {
      return new Promise((resolve, reject) => {
        const shotId = this.route.params.shot_id
        const shot = shotStore.cache.shotMap.get(shotId) || null
        if (!shot) {
          return this.loadShot(shotId).then(resolve)
        } else {
          return resolve(shot)
        }
      })
    },

    onEditClicked() {
      this.modals.edit = true
    },

    confirmEditShot(form) {
      form.id = this.currentShot.id
      form.data.resolution = form.resolution
      form.data.max_retakes = form.max_retakes
      form.data.frame_in = form.frameIn
      form.data.frame_out = form.frameOut
      form.data.fps = form.fps
      this.loading.edit = true
      this.errors.edit = false
      this.editShot(form)
        .then(() => {
          this.loading.edit = false
          this.modals.edit = false
        })
        .catch(err => {
          console.error(err)
          this.loading.edit = false
          this.errors.edit = true
        })
    },

    buildAssetRoute(asset) {
      let episodeId = asset.episode_id
      if (this.isTVShow && !episodeId) episodeId = 'main'
      const route = {
        name: 'asset',
        params: {
          production_id: this.currentProduction.id,
          asset_id: asset.asset_id
        }
      }
      return episodifyRoute(route, episodeId)
    },

    resetData() {
      this.casting.isLoading = true

      // Next tick is needed to wait for the episode change.
      this.$nextTick(() => {
        this.getCurrentShot()
          .then(shot => {
            this.currentShot = shot
            return this.loadShotCasting(this.currentShot)
          })
          .then(() => {
            this.casting.isLoading = false
          })
          .catch(err => {
            this.casting.isError = true
            this.casting.isLoading = false
            console.error(err)
          })
      })
    },

    init() {
      this.getCurrentShot()
        .then(shot => {
          this.currentShot = shot
          this.currentSection = this.route.query.section || 'infos'
          this.casting.isLoading = true
          this.casting.isError = false
          if (this.currentShot) {
            this.loadShotCasting(this.currentShot)
              .then(() => {
                this.casting.isLoading = false
                setTimeout(this.initSchedule, 100)
              })
              .catch(err => {
                this.casting.isLoading = false
                this.casting.isError = true
                console.error(err)
              })
          } else {
            this.resetData()
            setTimeout(this.initSchedule, 100)
          }
        })
        .catch(console.error)
    },

    initSchedule() {
      this.$refs['schedule-widget']?.scrollToDate(
        this.scheduleItems[0].startDate
      )
    }
  },

  watch: {
    $route() {
      const shotId = this.route.params.shot_id
      if (this.currentAsset && this.currentShot.id !== shotId) {
        this.init()
      }
      this.currentSection = this.route.query.section || 'infos'
    }
  },

  head() {
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

.dark .wrapper {
  background: $dark-grey-2;
}

.main-column {
  display: flex;
  flex-direction: column;
  background: var(--background-page);
  padding-bottom: 1em;
}

h2.subtitle {
  border-bottom: 0;
  margin-top: 0;
  margin-bottom: 0.5em;
  font-size: 1.5em;
}

.page-header {
  margin-top: calc(50px + 2em);
  margin-bottom: 0.8em;
  margin-left: 2em;
  margin-right: 1em;

  .entity-title {
    font-weight: 500;
  }
}
.shot-data {
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 0 1em 0 1em;
  max-height: 100%;
  overflow: hidden;
}

.shot-casting {
  overflow-y: auto;
}

.asset-link .thumbnail-picture {
  margin-bottom: 0.5em;
}

.asset-type {
  text-transform: uppercase;
  font-size: 1.2em;
  color: var(--text);
  margin-top: 2em;
  margin-bottom: 0.4em;
}

.asset-list {
  color: var(--text);
  display: flex;
  flex-wrap: wrap;
}

.asset-link {
  color: inherit;
  margin-left: 0.5em;
  margin-right: 0.5em;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.8em;

  .entity-thumbnail.shared {
    box-shadow: 0 0 3px 2px var(--shared-color);
  }

  .ready-for .no-link {
    cursor: inherit;
  }
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

.data-list {
  max-width: 100%;
}

.back-link {
  padding-top: 3px;
}

.task-list {
  width: 100%;
  flex: none;
  margin-bottom: 2em;
}

.datatable-row {
  user-select: text;
}

.schedule {
  overflow: hidden;
  position: relative;
  height: 100%;

  .timelien-wrapper,
  .timeline {
    height: 100%;
  }

  .schedule-title {
    margin-bottom: 5px;
  }

  .wrapper {
    height: 100%;
    border-radius: 10px;
  }
}

.section-combo {
  width: 150px;

  .option-line {
    width: 150px;
  }
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

.tag-standby {
  background: $red;
  color: $white;
  margin-left: 1em;
  cursor: default;
  text-transform: uppercase;
}

.dark .tag-standby {
  background: $dark-red;
}

.section-tabs {
  min-height: 36px;
  margin-bottom: 0;
}

.flexcolumn {
  flex-direction: column;
  overflow-y: auto;
}

.news-column {
  max-height: 85%;
}

.infos {
  flex: 1;
  margin-top: 1em;
  overflow-y: auto;

  .entity-infos {
    align-self: flex-start;
    flex: 1;
  }
}

.entity-data {
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 0 1em 0 1em;
  max-height: 100%;
  overflow: hidden;
}

.news-column {
  max-height: 85%;
}
</style>
