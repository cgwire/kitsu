<template>
  <div class="columns fixed-page asset xyz-in" xyz="fade">
    <div class="page column main-column">
      <div class="page-header flexrow">
        <!--router-link
        class="flexrow-item has-text-centered back-link ml1"
        :to="previousAssetPath"
      >
        <chevron-left-icon />
      </router-link>
      <router-link
        class="flexrow-item has-text-centered back-link"
        :to="nextAssetPath"
      >
        <chevron-right-icon />
      </router-link-->
        <router-link
          class="flexrow-item has-text-centered back-link ml1"
          :to="assetsPath"
        >
          <corner-left-up-icon />
        </router-link>
        <span class="flexrow-item ml2">
          <entity-thumbnail
            class="entity-thumbnail"
            :entity="currentAsset"
            :empty-width="100"
            :empty-height="60"
            :width="100"
            v-if="currentAsset"
          />
        </span>
        <div class="entity-title flexrow-item">
          {{ title }}
        </div>
        <div class="filler"></div>
        <div
          class="ready-for flexrow block mr0"
          v-if="
            currentAsset &&
            currentAsset.ready_for &&
            currentAsset.ready_for !== 'None'
          "
        >
          <span class="flexrow-item">
            {{ $t('assets.fields.ready_for') }}
          </span>
          <task-type-name
            class="flexrow-item"
            :task-type="taskTypeMap.get(currentAsset.ready_for)"
            :current-production-id="currentProduction.id"
          />
        </div>
      </div>

      <div class="asset-data block">
        <route-section-tabs
          class="section-tabs"
          :active-tab="currentSection"
          :route="$route"
          :tabs="assetTabs"
        />

        <div class="flexrow mt1">
          <span
            class="tag tag-standby"
            v-if="
              currentSection === 'casting' && currentAsset?.is_casting_standby
            "
          >
            {{ $t('breakdown.fields.standby') }}
          </span>
          <template v-if="currentSection === 'schedule'">
            <span class="flexrow-item mt05">
              {{ $t('schedule.zoom_level') }}:
            </span>
            <combobox-number
              class="zoom-level flexrow-item"
              is-simple
              :options="zoomOptions"
              v-model="zoomLevel"
            />
          </template>
        </div>

        <div class="flexcolumn infos" v-show="currentSection === 'infos'">
          <page-subtitle :text="$t('main.tasks')" />
          <entity-task-list
            class="task-list"
            :entries="localTasks"
            :is-loading="!currentAsset"
            :is-error="false"
            @task-selected="onTaskSelected"
          />
          <div class="flexrow">
            <page-subtitle :text="$t('main.info')" />
            <div class="filler"></div>
            <div class="flexrow-item has-text-right">
              <button-simple
                icon="edit"
                :title="$t('assets.edit_title')"
                @click="modals.edit = true"
                v-if="isCurrentUserManager"
              />
            </div>
          </div>

          <div class="table-body metadata-infos">
            <table class="datatable no-header" v-if="currentAsset">
              <tbody class="table-body">
                <tr class="datatable-row">
                  <td class="field-label">
                    {{ $t('assets.fields.description') }}
                  </td>
                  <description-cell :entry="currentAsset" :full="true" />
                </tr>
                <tr
                  :key="descriptor.id"
                  class="datatable-row"
                  v-for="descriptor in assetMetadataDescriptors"
                >
                  <td class="field-label">{{ descriptor.name }}</td>
                  <td>
                    {{
                      currentAsset.data
                        ? currentAsset.data[descriptor.field_name]
                        : ''
                    }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <entity-chat
          :entity="currentAsset"
          :name="currentAsset?.full_name"
          v-if="currentSection === 'chat'"
        />

        <div class="asset-casted-in" v-show="currentSection === 'casting'">
          <div v-if="currentAsset">
            <div
              v-if="
                currentAsset.castInShotsBySequence &&
                currentAsset.castInShotsBySequence[0].length > 0
              "
            >
              <em>Casted in {{ nbShotsCastedIn }} shots</em>
              <template
                v-if="
                  currentAsset.castInShotsBySequence.length > 0 &&
                  currentAsset.castInShotsBySequence[0][0].sequence_name
                "
              >
                <div
                  class="sequence-shots"
                  :key="
                    sequenceShots?.length > 0
                      ? sequenceShots[0].sequence_name
                      : ''
                  "
                  v-for="sequenceShots in currentAsset.castInShotsBySequence ||
                  []"
                >
                  <div class="shot-sequence">
                    {{
                      sequenceShots?.length > 0
                        ? sequenceShots[0].sequence_name
                        : ''
                    }}
                  </div>
                  <div class="shot-list">
                    <router-link
                      class="shot-link"
                      :key="shot.shot_id"
                      :to="shotPath(shot)"
                      v-for="shot in sequenceShots"
                    >
                      <entity-thumbnail
                        class="entity-thumbnail"
                        :entity="shot"
                        :square="true"
                        :empty-width="103"
                        :empty-height="103"
                        :with-link="false"
                      />
                      <div>
                        <span class="break-word">{{ shot.shot_name }}</span>
                        <span v-if="shot.nb_occurences > 1">
                          ({{ shot.nb_occurences }})
                        </span>
                      </div>
                    </router-link>
                  </div>
                </div>
              </template>
            </div>
            <div
              class="mt1"
              v-if="
                currentAsset &&
                currentAsset.castingAssetsByType &&
                currentAsset.castingAssetsByType[0]?.length === 0
              "
            >
              {{ $t('assets.no_cast_in') }}
            </div>
          </div>
          <table-info
            :is-loading="castIn.isLoading"
            :is-error="castIn.isError"
            v-else
          />

          <div
            v-if="
              currentAsset &&
              currentAsset.castingAssetsByType &&
              currentAsset.castingAssetsByType[0].length > 0
            "
          >
            <page-subtitle :text="$t('assets.linked')" />
            <div
              v-if="
                currentAsset.castingAssetsByType &&
                currentAsset.castingAssetsByType[0].length > 0
              "
            >
              <div
                class="type-assets"
                :key="
                  typeAssets.length > 0 ? typeAssets[0].asset_type_name : ''
                "
                v-for="typeAssets in currentAsset.castingAssetsByType"
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
                      class="entity-thumbnail"
                      :entity="asset"
                      :square="true"
                      :empty-width="103"
                      :empty-height="103"
                      :with-link="false"
                    />
                    <div>
                      <span class="break-word">{{ asset.asset_name }}</span>
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

        <div
          class="concepts"
          v-show="currentSection === 'concepts'"
          v-if="currentAsset"
        >
          <combobox-status
            :label="$t('main.status')"
            :task-status-list="taskStatusList"
            v-model="currentConceptStatus"
          />
          <div class="concept-list mt1">
            <template v-if="filteredLinkedConcepts.length">
              <concept-card
                class="concept"
                :class="{ selected: currentConcept?.id === concept.id }"
                :key="'concept-' + concept.id"
                :concept="concept"
                @click="selectConcept(concept)"
                v-for="concept in filteredLinkedConcepts"
              />
            </template>
            <div v-else>
              {{ $t('assets.no_concept') }}
            </div>
          </div>
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
          :entity="currentAsset"
          v-if="currentSection === 'preview-files'"
        />

        <entity-time-logs
          :entity="currentAsset"
          v-if="currentSection === 'time-logs'"
        />

        <entity-output-files
          :entity="currentAsset"
          v-if="currentSection === 'output-files'"
        />
      </div>
    </div>

    <div class="column side-column" v-show="currentSection === 'infos'">
      <task-info :task="currentTask" entity-type="Asset" with-actions>
        <entity-news class="news-column" :entity="currentAsset" />
      </task-info>
    </div>

    <div class="column side-column" v-show="currentSection === 'concepts'">
      <task-info entity-type="Concept" :task="currentConceptTask" />
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
import { CornerLeftUpIcon } from 'lucide-vue-next'

import assetStore from '@/store/modules/assets'

import { sortByName } from '@/lib/sorting'
import { entityMixin } from '@/components/mixins/entity'
import { formatListMixin } from '@/components/mixins/format'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ConceptCard from '@/components/widgets/ConceptCard.vue'
import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import DescriptionCell from '@/components/cells/DescriptionCell.vue'
import EditAssetModal from '@/components/modals/EditAssetModal.vue'
import EntityChat from '@/components/pages/entities/EntityChat.vue'
import EntityNews from '@/components/pages/entities/EntityNews.vue'
import EntityOutputFiles from '@/components/pages/entities/EntityOutputFiles.vue'
import EntityPreviewFiles from '@/components/pages/entities/EntityPreviewFiles.vue'
import EntityTimeLogs from '@/components/pages/entities/EntityTimeLogs.vue'
import EntityTaskList from '@/components/lists/EntityTaskList.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import PageSubtitle from '@/components/widgets/PageSubtitle.vue'
import RouteSectionTabs from '@/components/widgets/RouteSectionTabs.vue'
import Schedule from '@/components/widgets/Schedule.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'

export default {
  name: 'asset',

  mixins: [entityMixin, formatListMixin],

  components: {
    ButtonSimple,
    ConceptCard,
    ComboboxNumber,
    CornerLeftUpIcon,
    ComboboxStatus,
    DescriptionCell,
    EditAssetModal,
    EntityChat,
    EntityNews,
    EntityOutputFiles,
    EntityPreviewFiles,
    EntityThumbnail,
    EntityTaskList,
    EntityTimeLogs,
    PageSubtitle,
    RouteSectionTabs,
    Schedule,
    TableInfo,
    TaskInfo,
    TaskTypeName
  },

  data() {
    return {
      type: 'asset',
      currentAsset: null,
      currentConcept: null,
      currentTask: null,
      currentConceptStatus: null,
      currentConceptTask: null,
      localTasks: [],
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

  mounted() {
    this.clearSelectedTasks()
    this.init()
  },

  computed: {
    ...mapGetters([
      'assetMap',
      'assetSearchText',
      'assetMetadataDescriptors',
      'conceptMap',
      'currentEpisode',
      'currentProduction',
      'getTaskTypePriority',
      'isTVShow',
      'isCurrentUserManager',
      'linkedConcepts',
      'route',
      'taskMap',
      'taskStatusMap',
      'taskTypeMap',
      'shotId'
    ]),

    title() {
      if (this.currentAsset) {
        return (
          `${this.currentAsset.asset_type_name} / ` +
          `${this.currentAsset.name}`
        )
      } else {
        return 'Loading...'
      }
    },

    assetThumbnailPath() {
      const previewId = this.currentAsset.preview_file_id
      return `/api/pictures/originals/preview-files/${previewId}.png`
    },

    isPreview() {
      return (
        this.currentAsset &&
        this.currentAsset.preview_file_id &&
        this.currentAsset.preview_file_id.length > 0
      )
    },

    nbShotsCastedIn() {
      const castIn = this.currentAsset?.castInShotsBySequence || []
      return castIn.reduce((acc, shots) => {
        return acc + shots.length
      }, 0)
    },

    previousAssetPath() {
      const assets = Array.from(this.assetMap.values())
      if (assets.length === 0) return { name: 'open-productions' }
      const currentIndex = assets.findIndex(asset => {
        return asset && this.currentAsset && asset.id === this.currentAsset.id
      })
      const index = currentIndex !== 0 ? currentIndex - 1 : assets.length - 1
      const asset = assets[index]
      if (!asset) return { name: 'open-productions' }
      const route = {
        name: 'asset',
        params: {
          production_id: this.currentProduction.id,
          asset_id: asset.id
        },
        query: {
          search: ''
        }
      }
      if (this.currentEpisode) {
        route.name = 'episode-asset'
        route.params.episode_id = this.currentEpisode.id
      }
      return route
    },

    nextAssetPath() {
      const assets = Array.from(this.assetMap.values())
      if (assets.length === 0) return { name: 'open-productions' }
      const currentIndex = assets.findIndex(asset => {
        return asset && this.currentAsset && asset.id === this.currentAsset.id
      })
      const index = currentIndex === assets.length - 1 ? 0 : currentIndex + 1
      const asset = assets[index]
      if (!asset) return { name: 'open-productions' }
      const route = {
        name: 'asset',
        params: {
          production_id: this.currentProduction.id,
          asset_id: asset.id
        },
        query: {
          search: ''
        }
      }
      if (this.currentEpisode) {
        route.name = 'episode-asset'
        route.params.episode_id = this.currentEpisode.id
      }
      return route
    },

    assetsPath() {
      const route = {
        name: 'assets',
        params: {
          production_id: this.currentProduction.id
        },
        query: {
          search: this.assetSearchText || ''
        }
      }
      if (this.currentEpisode) {
        route.name = 'episode-assets'
        route.params.episode_id = this.currentEpisode.id
      }
      return route
    },

    assetNavOptions() {
      return [
        ...this.entityNavOptions.slice(0, 2),
        { label: this.$t('main.label.concepts'), value: 'concepts' },
        ...this.entityNavOptions.slice(2),
        { label: this.$t('main.label.output_files'), value: 'output-files' }
      ]
    },

    assetTabs() {
      return this.assetNavOptions.map(option => {
        return {
          label: option.label,
          name: option.value
        }
      })
    },

    taskStatusList() {
      const allStatusItem = {
        id: null,
        color: '#999',
        name: this.$t('main.all'),
        short_name: this.$t('main.all')
      }
      const conceptTaskStatusList = sortByName(
        Array.from(this.taskStatusMap.values()).filter(
          status => status.for_concept
        )
      )
      return [allStatusItem].concat(conceptTaskStatusList)
    },

    filteredLinkedConcepts() {
      return this.currentConceptStatus
        ? this.linkedConcepts.filter(
            concept =>
              concept.tasks[0].task_status_id === this.currentConceptStatus
          )
        : this.linkedConcepts
    }
  },

  methods: {
    ...mapActions([
      'addSelectedConcepts',
      'clearSelectedTasks',
      'clearSelectedConcepts',
      'editAsset',
      'loadAsset',
      'loadAssets',
      'loadAssetCastIn',
      'loadAssetCasting',
      'loadLinkedConcepts',
      'loadShots',
      'setCurrentEpisode'
    ]),

    changeTab(tab) {
      this.selectedTab = tab
    },

    getCurrentAsset() {
      return new Promise((resolve, reject) => {
        const assetId = this.route.params.asset_id
        if (!assetId) resolve(null)
        let asset = assetStore.cache.assetMap.get(assetId) || null
        if (!asset) {
          if (assetId) {
            return this.loadAsset(assetId).then(() => {
              asset = assetStore.cache.assetMap.get(assetId)
              this.localTasks = asset.tasks.map(taskId =>
                this.taskMap.get(taskId)
              )
              return resolve(asset)
            })
          }
        } else {
          this.localTasks = asset.tasks.map(taskId => this.taskMap.get(taskId))
          return resolve(asset)
        }
      })
    },

    getConceptTaskStatus(concept) {
      return this.taskStatusMap.get(concept.tasks[0].task_status_id)
    },

    onEditClicked() {
      this.modals.edit = true
    },

    confirmEditAsset(form) {
      form.id = this.currentAsset.id
      this.loading.edit = true
      this.errors.edit = false
      this.editAsset(form)
        .then(() => {
          this.loading.edit = false
          this.modals.edit = false
        })
        .catch(err => {
          console.error(err)
          this.loading.edit = false
          this.errors.edit = true
        })
      const asset = assetStore.cache.assetMap.get(form.id)
      this.currentAsset = { ...asset }
    },

    resetData() {
      this.castIn.isLoading = true
      if (this.$route.params.episode_id === 'main') {
        this.setCurrentEpisode('main')
      }
      // Next tick is needed to wait for the episode change.
      this.$nextTick(() => {
        this.getCurrentAsset()
          .then(asset => {
            this.currentAsset = asset
            return this.loadAssetCastIn(this.currentAsset)
          })
          .then(() => this.loadAssetCasting(this.currentAsset))
          .then(() => {
            this.castIn.isLoading = false
          })
          .then(() => this.loadLinkedConcepts(this.currentAsset))
          .catch(err => {
            this.castIn.isError = true
            this.castIn.isLoading = false
            console.error(err)
          })
      })
    },

    conceptPath(concept) {
      return {
        name: 'concepts',
        params: {
          production_id: this.currentProduction.id
        }
      }
    },

    shotPath(shot) {
      return {
        name: shot.episode_id ? 'episode-shot' : 'shot',
        params: {
          production_id: this.currentProduction.id,
          shot_id: shot.shot_id,
          episode_id: shot.episode_id ? shot.episode_id : undefined
        }
      }
    },

    init() {
      return this.getCurrentAsset()
        .then(asset => {
          this.currentAsset = asset
          this.currentSection = this.route.query.section || 'infos'
          this.castIn.isLoading = true
          this.castIn.isError = false
          if (this.currentAsset) {
            this.loadAssetCastIn(this.currentAsset)
              .then(() => this.loadAssetCasting(this.currentAsset))
              .then(() => {
                this.castIn.isLoading = false
              })
              .then(() => this.loadLinkedConcepts(this.currentAsset))
              .catch(err => {
                this.castIn.isLoading = false
                this.castIn.isError = true
                console.error(err)
              })
          } else {
            this.resetData()
          }
        })
        .then(() => {
          setTimeout(() => {
            if (this.$refs['schedule-widget']) {
              this.$refs['schedule-widget'].scrollToDate(
                this.scheduleItems[0].startDate
              )
            }
          }, 100)
        })
        .catch(console.error)
    },

    selectConcept(concept) {
      if (this.currentConcept && this.currentConcept.id === concept.id) {
        this.currentConcept = null
        this.currentConceptTask = null
        this.clearSelectedConcepts()
      } else {
        const selection = new Map()
        selection.set(concept.id, concept)
        this.clearSelectedConcepts()
        this.addSelectedConcepts(selection)
        this.currentConcept = concept
        this.currentConceptTask = concept.tasks[0]
      }
    }
  },

  watch: {
    currentSection() {
      if (this.currentSection === 'schedule' && this.scheduleItems.length > 0) {
        if (this.$refs['schedule-widget']) {
          this.$refs['schedule-widget'].scrollToDate(
            this.scheduleItems[0].startDate
          )
        }
      }
    },

    zoomLevel() {
      if (this.$refs['schedule-widget']) {
        this.$refs['schedule-widget'].scrollToDate(
          this.scheduleItems[0].startDate
        )
      }
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
.dark {
  .page {
    padding-bottom: 1em;
  }

  .table-body {
    border: 1px solid $dark-grey;
  }

  .wrapper {
    background: $dark-grey-2;
  }
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
  margin-left: 1em;
  margin-right: 1em;
  .entity-title {
    font-weight: 500;
  }
}

.asset-data {
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 0 1em 0 1em;
  max-height: 100%;
  overflow: hidden;
}

.asset-casting,
.asset-casted-in,
.concepts {
  overflow-y: auto;
}

.thumbnail-picture {
  margin-bottom: 0.5em;
}

.sequence-shots {
  margin-bottom: 3em;
}

.asset-type,
.concept-type,
.shot-sequence {
  text-transform: uppercase;
  font-size: 1.2em;
  color: var(--text);
  margin-top: 2em;
  margin-bottom: 0.4em;
}

.asset-list,
.shot-list,
.concept-list {
  color: var(--text);
  display: flex;
  flex-wrap: wrap;
}

.concept-list {
  padding-bottom: 1em;
  gap: 10px;
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

.concept-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.field-label {
  font-weight: bold;
  width: 120px;
}

.page-header {
  align-items: center;
}

.back-link {
  padding-top: 3px;
}

.task-list {
  flex: 1;
  margin-bottom: 3em;
  min-width: 100%;
  overflow: hidden;
}

.datatable-row {
  user-select: text;
}

.schedule {
  position: relative;
  height: 100%;
  overflow: hidden;

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

.entity-thumbnail {
  margin-bottom: 0;
  border-radius: 10px;
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

.infos {
  height: 100%;
  margin-top: 1em;
  margin-bottom: 1em;
  max-height: 100%;
  overflow-y: auto;

  .metadata-infos {
    flex: unset;
    overflow: auto;
  }
}

.entity-stats {
  padding: 1em;
  font-size: 1.2em;

  .entry-label {
    display: inline-block;
    width: 120px;
  }
}

.news-column {
  max-height: 85%;
}

.concept {
  border: 5px solid transparent;
  cursor: pointer;
  transition: border 0.2s linear;
  &:hover {
    border: 5px solid var(--background-selectable);
  }
}

.selected {
  border: 5px solid var(--background-selected);
}
</style>
