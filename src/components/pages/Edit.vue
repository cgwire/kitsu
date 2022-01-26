<template>
<div class="columns fixed-page edit">
  <div class="column main-column">
    <div class="page-header flexrow">
      <router-link
        class="flexrow-item has-text-centered back-link"
        :to="getEditsRoute"
      >
        <chevron-left-icon />
      </router-link>
      <entity-thumbnail
        class="edit-thumbnail flexrow-item"
        :entity="currentEdit"
        :with-link="false"
        v-if="currentEdit"
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
      <page-subtitle :text="$t('edits.tasks')" />
      <entity-task-list
        class="task-list"
        :entries="currentTasks.map(t => t.id)"
        :is-loading="!currentEdit"
        :is-error="false"
        @task-selected="onTaskSelected"
      />
      </div>
      <div class="flexrow-item">
        <page-subtitle :text="$t('main.info')" />
        <div class="table-body">
          <table class="datatable" v-if="currentEdit">
            <tbody class="datatable-body">
              <tr
                class="datatable-row"
              >
                <td class="field-label">{{ $t('edits.fields.description') }}</td>
                <description-cell
                  :entry="currentEdit"
                  :full="true"
                />
              </tr>

              <tr
                :key="descriptor.id"
                class="datatable-row"
                v-for="descriptor in editMetadataDescriptors"
              >
                <td class="field-label">{{ descriptor.name }}</td>
                <td>
                  {{ currentEdit.data ? currentEdit.data[descriptor.field_name] : '' }}
                </td>
              </tr>

            </tbody>
        </table>
      </div>
      </div>
    </div>

    <div class="infos schedule" v-if="scheduleItems.length > 0">
      <page-subtitle class="schedule-title" text="Schedule" />
      <div class="wrapper">
        <schedule
          ref="schedule-widget"
          class="schedule-widget"
          :start-date="tasksStartDate"
          :end-date="tasksEndDate"
          :hierarchy="scheduleItems"
          :zoom-level="2"
          :height="385"
          :is-loading="false"
          :is-estimation-linked="true"
          :hide-root="true"
          :with-milestones="false"
        />
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

  <edit-edit-modal
    ref="edit-edit-modal"
    :active="modals.edit"
    :is-loading="loading.edit"
    :is-error="errors.edit"
    :edit-to-edit="currentEdit"
    @cancel="modals.edit = false"
    @confirm="confirmEditEdit"
  />
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { ChevronLeftIcon } from 'vue-feather-icons'

import { episodifyRoute } from '@/lib/path'
import { entityMixin } from '@/components/mixins/entity'
import { formatListMixin } from '@/components/mixins/format'

import ButtonSimple from '@/components/widgets/ButtonSimple'
import DescriptionCell from '@/components/cells/DescriptionCell'
import EditEditModal from '@/components/modals/EditEditModal'
import EntityThumbnail from '@/components/widgets/EntityThumbnail'
import EntityTaskList from '@/components/lists/EntityTaskList'
import PageTitle from '@/components/widgets/PageTitle'
import PageSubtitle from '@/components/widgets/PageSubtitle'
import Schedule from '../pages/schedule/Schedule'
import TaskInfo from '@/components/sides/TaskInfo'

export default {
  name: 'edit',
  mixins: [entityMixin, formatListMixin],
  components: {
    ButtonSimple,
    ChevronLeftIcon,
    DescriptionCell,
    EditEditModal,
    EntityThumbnail,
    EntityTaskList,
    PageSubtitle,
    PageTitle,
    Schedule,
    TaskInfo
  },

  data () {
    return {
      currentEdit: null,
      currentTask: null,
      isLoading: false,
      isError: false,
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
    this.currentEdit = this.getCurrentEdit()

    this.isLoading = true
    this.isError = false

    if (this.currentEdit) {
    } else {
      this.resetData()
    }
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'getTaskTypePriority',
      'isCurrentUserManager',
      'isTVShow',
      'route',
      'editMap',
      'editMetadataDescriptors',
      'taskMap',
      'taskTypeMap'
    ]),

    title () {
      if (this.currentEdit) {
        if (this.currentEdit.episode_name) {
          return `${this.currentEdit.episode_name} / ` +
                 `${this.currentEdit.name}`
        } else {
          return `${this.currentEdit.name}`
        }
      } else {
        return 'Loading...'
      }
    },

    editThumbnailPath () {
      const previewId = this.currentEdit.preview_file_id
      return `/api/pictures/originals/preview-files/${previewId}.png`
    },

    isPreview () {
      return this.currentEdit &&
        this.currentEdit.preview_file_id &&
        this.currentEdit.preview_file_id.length > 0
    },

    getEditsRoute () {
      const route = {
        name: 'edits',
        params: {
          production_id: this.currentProduction.id
        },
        query: {
          search: ''
        }
      }
      if (this.currentEpisode) {
        route.name = 'episode-edits'
        route.params.episode_id = this.currentEpisode.id
      }
      return route
    }
  },

  methods: {
    ...mapActions([
      'clearSelectedTasks',
      'editEdit',
      'loadAssets',
      'loadEdits'
    ]),

    changeTab (tab) {
      this.selectedTab = tab
    },

    getCurrentEdit () {
      return this.editMap.get(this.route.params.edit_id) || null
    },

    onEditClicked () {
      this.modals.edit = true
    },

    confirmEditEdit (form) {
      form.id = this.currentEdit.id
      this.loading.edit = true
      this.errors.edit = false
      this.editEdit(form)
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

    buildAssetRoute (asset) {
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

    resetData () {
      this.$nextTick(() => {
        this.loadEdits(() => {
          this.loadAssets()
            .then(() => {
              this.currentEdit = this.getCurrentEdit()
              this.isLoading = false
            })
        })
      })
    }
  },

  watch: { // Needed when reloading the page with F5
    currentProduction () {
      if (!this.isTVShow) this.resetData()
    },

    currentEpisode () {
      if (this.isTVShow && this.editMap.size === 0) {
        this.resetData()
      }
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
.dark .page {
  background: $dark-grey-light;
  height: 100%;
  padding-bottom: 1em;
}

.dark .page-header,
.dark .infos {
  background: #46494F;
  border-color: $dark-grey;
  box-shadow: 0px 0px 6px #333;
}

.dark .wrapper {
  background: $dark-grey-2;
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

.infos {
  background: white;
  padding: 1em 1em 1em 1em;
  box-shadow: 0px 0px 6px #E0E0E0;
  margin-bottom: 1em;
  margin-left: 1em;
  margin-right: 1em;

  .flexrow-item {
    align-self: flex-start;
    flex: 1;
  }
}

.edit-thumbnail {
  max-width: 100px;
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

.page-header .thumbnail-picture {
  margin: 0 1em 0 0;
  max-width: 80px;
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
  height: 300px;
  padding: 10px;

  .schedule-title {
    margin-bottom: 5px;
  }

  .wrapper {
    height: 230px;
    border-radius: 10px;
  }
}

.column.main-column {
  background: var(--background-page);
  padding-bottom: 1em;
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
