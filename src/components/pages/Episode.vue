<template>
  <div class="columns fixed-page episode xyz-in" xyz="fade">
    <div class="column main-column">
      <div class="page-header flexrow">
        <router-link
          class="flexrow-item has-text-centered back-link"
          :to="getEpisodesRoute"
        >
          <corner-left-up-icon />
        </router-link>
        <span class="flexrow-item ml2">
          <entity-thumbnail
            class="entity-thumbnail"
            :entity="currentEpisode"
            :empty-width="120"
            :empty-height="50"
            :width="120"
            v-if="currentEpisode"
          />
        </span>
        <div class="flexrow-item">
          <page-title :text="title" class="entity-title" />
        </div>
      </div>

      <div class="flexrow infos">
        <div class="flexrow-item block flexcolumn">
          <page-subtitle :text="$t('episodes.tasks')" />
          <entity-task-list
            class="task-list"
            :entries="currentTasks.map(t => t.id)"
            :is-loading="!currentEpisode"
            :is-error="false"
            @task-selected="onTaskSelected"
          />
        </div>
        <div class="flexrow-item block flexcolumn">
          <div class="flexrow">
            <page-subtitle :text="$t('main.info')" />
            <div class="filler"></div>
            <div class="flexrow-item has-text-right">
              <button-simple
                icon="edit"
                @click="modals.edit = true"
                v-if="isCurrentUserManager"
              />
            </div>
          </div>
          <div class="table-body">
            <table class="datatable no-header" v-if="currentEpisode">
              <tbody class="datatable-body">
                <tr class="datatable-row">
                  <td class="field-label">
                    {{ $t('shots.fields.description') }}
                  </td>
                  <description-cell :entry="currentEpisode" :full="true" />
                </tr>

                <tr
                  :key="descriptor.id"
                  class="datatable-row"
                  v-for="descriptor in episodeMetadataDescriptors"
                >
                  <td class="field-label">{{ descriptor.name }}</td>
                  <td>
                    {{
                      currentEpisode && currentEpisode.data
                        ? currentEpisode.data[descriptor.field_name]
                        : ''
                    }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="episode-data block">
        <div class="flexrow">
          <combobox-styled
            class="section-combo flexrow-item"
            :options="entityNavOptions"
            v-model="currentSection"
          />
          <span v-show="currentSection === 'casting'">
            {{ nbAssets }} {{ $tc('assets.number', nbAssets) }}
          </span>
          <span
            class="tag tag-standby"
            v-show="
              currentSection === 'casting' && currentEpisode.is_casting_standby
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

        <div class="episode-casting" v-show="currentSection === 'casting'">
          <div v-if="currentEpisode">
            <div
              v-if="
                currentEpisode &&
                currentEpisode.castingAssetsByType &&
                currentEpisode.castingAssetsByType[0].length > 0
              "
            >
              <div
                class="type-assets"
                :key="
                  typeAssets.length > 0 ? typeAssets[0].asset_type_name : ''
                "
                v-for="typeAssets in currentEpisode.castingAssetsByType"
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
                      :entity="asset"
                      :square="true"
                      :empty-width="103"
                      :empty-height="103"
                      :with-link="false"
                    />
                    <div class="break-word">
                      {{ asset.asset_name }}
                      <span v-if="asset.nb_occurences > 1">
                        ({{ asset.nb_occurences }})
                      </span>
                    </div>
                    <div class="ready-for flexrow">
                      <task-type-name
                        class="flexrow-item"
                        :task-type="taskTypeMap.get(asset.ready_for)"
                        :current-production-id="currentProduction.id"
                        :title="
                          'Ready for: ' + taskTypeMap.get(asset.ready_for).name
                        "
                        v-if="asset.ready_for"
                      />
                    </div>
                  </router-link>
                </div>
              </div>
            </div>
            <div class="mt1" v-else>
              {{ $t('episodes.no_casting') }}
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
            />
          </div>
        </div>
        <div class="mt1" v-else v-show="currentSection === 'schedule'">
          {{ $t('main.empty_schedule') }}
        </div>

        <entity-preview-files
          :entity="currentEpisode"
          v-if="currentSection === 'preview-files'"
        />

        <entity-news
          :entity="currentEpisode"
          v-if="currentSection === 'activity'"
        />

        <entity-time-logs
          :entity="currentEpisode"
          v-if="currentSection === 'time-logs'"
        />
      </div>
    </div>

    <div class="column side-column" v-if="currentTask">
      <task-info :task="currentTask" />
    </div>

    <edit-episode-modal
      ref="edit-episode-modal"
      :active="modals.edit"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :episode-to-edit="currentEpisode"
      @cancel="modals.edit = false"
      @confirm="confirmEditEpisode"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { CornerLeftUpIcon } from 'vue-feather-icons'

import { episodifyRoute } from '@/lib/path'
import { entityMixin } from '@/components/mixins/entity'
import { formatListMixin } from '@/components/mixins/format'

import ButtonSimple from '@/components/widgets/ButtonSimple'
import ComboboxNumber from '@/components/widgets/ComboboxNumber'
import ComboboxStyled from '@/components/widgets/ComboboxStyled'
import DescriptionCell from '@/components/cells/DescriptionCell'
import EditEpisodeModal from '@/components/modals/EditEpisodeModal'
import EntityNews from '@/components/pages/entities/EntityNews'
import EntityPreviewFiles from '@/components/pages/entities/EntityPreviewFiles'
import EntityTaskList from '@/components/lists/EntityTaskList'
import EntityTimeLogs from '@/components/pages/entities/EntityTimeLogs'
import EntityThumbnail from '@/components/widgets/EntityThumbnail'
import PageTitle from '@/components/widgets/PageTitle'
import PageSubtitle from '@/components/widgets/PageSubtitle'
import Schedule from '@/components/pages/schedule/Schedule'
import TableInfo from '@/components/widgets/TableInfo'
import TaskInfo from '@/components/sides/TaskInfo'
import TaskTypeName from '@/components/widgets/TaskTypeName'

export default {
  name: 'episode',
  mixins: [entityMixin, formatListMixin],
  components: {
    ButtonSimple,
    ComboboxNumber,
    ComboboxStyled,
    CornerLeftUpIcon,
    DescriptionCell,
    EditEpisodeModal,
    EntityNews,
    EntityPreviewFiles,
    EntityTaskList,
    EntityTimeLogs,
    EntityThumbnail,
    PageSubtitle,
    PageTitle,
    Schedule,
    TableInfo,
    TaskInfo,
    TaskTypeName
  },

  data() {
    return {
      type: 'episode',
      currentEpisode: null,
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
        edit: false,
        preview: false
      }
    }
  },

  mounted() {
    this.clearSelectedTasks()
    this.loadCurrentEpisode()
      .then(episode => {
        this.currentEpisode = episode
        this.currentSection = this.route.query.section || 'casting'
        this.casting.isLoading = true
        this.casting.isError = false
        if (this.currentEpisode) {
          this.loadEpisodeCasting(this.currentEpisode)
            .then(() => {
              this.casting.isLoading = false
            })
            .catch(err => {
              this.casting.isLoading = false
              this.casting.isError = true
              console.error(err)
            })
        } else {
          this.resetData()
        }
      })
      .catch(console.error)
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'getTaskTypePriority',
      'episodeMap',
      'episodeMetadataDescriptors',
      'episodeSearchText',
      'isCurrentUserManager',
      'route',
      'taskMap',
      'taskTypeMap'
    ]),

    title() {
      if (this.currentEpisode) {
        return `${this.currentEpisode.name}`
      } else {
        return 'Loading...'
      }
    },

    currentEntity() {
      return this.currentEpisode
    },

    getEpisodesRoute() {
      const route = {
        name: 'episodes',
        params: {
          production_id: this.currentProduction.id,
          project_id: this.currentProduction.id
        },
        query: {
          search: this.episodeSearchText
        }
      }
      route.name = 'episodes'
      return route
    },

    nbAssets() {
      let nbAssets = 0
      if (
        this.currentEpisode &&
        this.currentSection === 'casting' &&
        this.currentEpisode.castingAssetsByType
      ) {
        this.currentEpisode.castingAssetsByType.forEach(group => {
          nbAssets += group.length
        })
      }
      return nbAssets
    }
  },

  methods: {
    ...mapActions([
      'clearSelectedTasks',
      'editEpisode',
      'setCurrentEpisode',
      'loadEpisodesWithTasks',
      'loadEpisodeCasting'
    ]),

    loadCurrentEpisode() {
      return new Promise((resolve, reject) => {
        const episodeId = this.route.params.episode_id
        const episode = this.episodeMap.get(episodeId) || null
        if (!episode || !episode.validations) {
          return this.loadEpisodesWithTasks().then(() => {
            const episode = this.episodeMap.get(episodeId) || null
            return resolve(episode)
          })
        } else {
          return resolve(episode)
        }
      })
    },

    confirmEditEpisode(form) {
      form.id = this.currentEpisode.id
      this.loading.edit = true
      this.errors.edit = false
      this.editEpisode(form)
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
      if (!episodeId) episodeId = 'main'
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
        this.getCurrentEpisode()
          .then(episode => {
            this.currentEpisode = episode
            return this.loadEpisodeCasting(this.currentEpisode)
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
    }
  },

  watch: {},

  metaInfo() {
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
    height: 100%;
    padding-bottom: 1em;
  }

  .wrapper {
    background: $dark-grey-2;
  }

  .tag-standby {
    background: $dark-red;
  }
}

.main-column {
  display: flex;
  flex-direction: column;
  background: var(--background-page);
  padding-bottom: 1em;
}

h2.subtitle {
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

.infos {
  height: 350px;
  margin-bottom: 1em;
  margin-left: 1em;
  margin-right: 1em;

  .flexrow-item {
    align-self: flex-start;
    height: 100%;
    flex: 1;
  }
}

.episode-data {
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 0 1em 0 1em;
  max-height: 100%;
  overflow: hidden;
}

.episode-casting {
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

.data-list {
  max-width: 100%;
}

.back-link {
  padding-top: 3px;
}

.task-list {
  width: 100%;
}

.datatable-row {
  user-select: text;
}

.schedule {
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
</style>
