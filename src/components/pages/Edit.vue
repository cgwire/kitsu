<template>
  <div class="columns fixed-page edit xyz-in" xyz="fade">
    <div class="column main-column">
      <div class="page-header flexrow flexrow-item" ref="page-header-row">
        <div class="flexrow block mb0 main-block">
          <router-link
            class="flexrow-item has-text-centered back-link"
            :to="editsPath"
          >
            <corner-left-up-icon />
          </router-link>
          <span class="flexrow-item">
            <entity-thumbnail
              class="entity-thumbnail"
              :entity="currentEntity"
              :empty-height="60"
              :empty-width="100"
              :height="60"
              :width="100"
              v-if="currentEntity"
            />
          </span>
          <div class="entity-title flexrow-item mr1">
            {{ title }}
          </div>
          <div
            class="flexrow-item has-text-centered"
            :key="currentEntity.id"
            v-if="!isLoading && currentEntity"
          >
            <previews-per-task-type
              ref="previews-per-task-type"
              :entity="currentEntity"
              @preview-changed="onPreviewChanged"
            />
          </div>
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

      <div ref="container" class="edit player block">
        <preview-player
          ref="preview-player"
          v-if="!isLoading && currentEdit"
          canvas-id="edit-annotation-canvas"
          :previews="currentRevisions"
          :task="currentTask"
          :entity-preview-files="previewFiles"
          :task-type-map="taskTypeMap"
          entity-type="Edit"
          :last-preview-files="currentRevisions"
          @annotation-changed="onAnnotationChanged"
          @change-current-preview="onChangeCurrentPreview"
        />
      </div>

      <div class="edit-data block">
        <div class="flexrow">
          <combobox-styled
            class="section-combo flexrow-item"
            :options="entityNavOptions"
            v-model="currentSection"
          />
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

        <div
          ref="info-row"
          class="infos flexrow pa0"
          v-if="currentSection === 'infos'"
        >
          <div class="flexrow-item">
            <div class="flexrow">
              <div class="flexcolumn flexrow-item">
                <page-subtitle class="flerow-item" :text="$t('edits.tasks')" />
                <entity-task-list
                  class="task-list flexrow-item"
                  :entries="currentTasks"
                  :is-loading="!currentEdit"
                  :is-error="false"
                />
              </div>

              <div class="flexcolumn flexrow-item">
                <div class="flexrow">
                  <page-subtitle class="flerow-item" :text="$t('main.info')" />
                  <div class="flexrow-item has-text-right">
                    <button-simple
                      icon="edit"
                      :title="$t('edits.edit_title')"
                      @click="modals.edit = true"
                      v-if="isCurrentUserManager"
                    />
                  </div>
                </div>
                <div class="table-body edit-metadata flexrow-item">
                  <table class="datatable no-header" v-if="currentEdit">
                    <tbody class="datatable-body">
                      <tr class="datatable-row">
                        <td class="field-label">
                          {{ $t('edits.fields.description') }}
                        </td>
                        <description-cell :entry="currentEdit" :full="true" />
                      </tr>
                      <tr
                        :key="descriptor.id"
                        class="datatable-row"
                        v-for="descriptor in editMetadataDescriptors"
                      >
                        <td class="field-label">{{ descriptor.name }}</td>
                        <td>
                          <metadata-value
                            :descriptor="descriptor"
                            :entity="currentEdit"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          ref="schedule-row"
          class="infos schedule"
          v-if="currentSection === 'schedule' && scheduleItems.length > 0"
        >
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
        </div>

        <entity-preview-files
          :entity="currentEdit"
          v-if="currentSection === 'preview-files'"
        />

        <entity-news
          :entity="currentEdit"
          v-if="currentSection === 'activity'"
        />

        <entity-time-logs
          :entity="currentEdit"
          v-if="currentSection === 'time-logs'"
        />
      </div>
    </div>

    <edit-edit-modal
      ref="edit-edit-modal"
      :active="modals.edit"
      :is-loading="isLoading"
      :is-error="errors.edit"
      :edit-to-edit="currentEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditEdit"
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

import editStore from '@/store/modules/edits'

import { annotationMixin } from '@/components/mixins/annotation'
import { domMixin } from '@/components/mixins/dom'
import { entityMixin } from '@/components/mixins/entity'
import { fullScreenMixin } from '@/components/mixins/fullscreen'
import { getEntitiesPath } from '@/lib/path'
import { formatListMixin } from '@/components/mixins/format'
import { playerMixin } from '@/components/mixins/player'
import { DEFAULT_NB_FRAMES_PICTURE } from '@/lib/playlist'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'
import DescriptionCell from '@/components/cells/DescriptionCell.vue'
import EditEditModal from '@/components/modals/EditEditModal.vue'
import EntityNews from '@/components/pages/entities/EntityNews.vue'
import EntityPreviewFiles from '@/components/pages/entities/EntityPreviewFiles.vue'
import EntityTaskList from '@/components/lists/EntityTaskList.vue'
import EntityTimeLogs from '@/components/pages/entities/EntityTimeLogs.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import MetadataValue from '@/components/widgets/MetadataValue.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import PageSubtitle from '@/components/widgets/PageSubtitle.vue'
import PreviewPlayer from '@/components/previews/PreviewPlayer.vue'
import PreviewsPerTaskType from '@/components/previews/PreviewsPerTaskType.vue'
import Schedule from '@/components/widgets/Schedule.vue'

export default {
  name: 'edit',

  mixins: [
    annotationMixin,
    domMixin,
    entityMixin,
    formatListMixin,
    fullScreenMixin,
    playerMixin
  ],

  components: {
    ButtonSimple,
    ChevronLeftIcon,
    ChevronRightIcon,
    CornerLeftUpIcon,
    ComboboxStyled,
    ComboboxNumber,
    DescriptionCell,
    EditEditModal,
    EntityNews,
    EntityPreviewFiles,
    EntityTaskList,
    EntityTimeLogs,
    EntityThumbnail,
    MetadataValue,
    PageSubtitle,
    PreviewPlayer,
    PreviewsPerTaskType,
    Schedule
  },

  data() {
    return {
      type: 'edit',
      currentEdit: null,
      currentSection: 'infos',
      isAnnotationsDisplayed: true,
      isLoading: true,
      isError: false,
      movieDimensions: { width: 0, height: 0 },
      previewFileMap: new Map(),
      tempMode: false,
      errors: {
        edit: false
      },
      entityNavOptions: [
        { label: this.$t('main.label.info'), value: 'infos' },
        { label: this.$t('main.label.schedule'), value: 'schedule' },
        { label: this.$t('main.label.preview_files'), value: 'preview-files' },
        { label: this.$t('main.activity'), value: 'activity' },
        { label: this.$t('main.label.timelog'), value: 'time-logs' }
      ],
      modals: {
        edit: false
      }
    }
  },

  mounted() {
    this.init()
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'getTaskPreviews',
      'getTaskTypePriority',
      'isCurrentUserManager',
      'isTVShow',
      'route',
      'editMetadataDescriptors',
      'taskMap',
      'taskTypeMap',
      'user'
    ]),

    title() {
      if (this.currentEdit) {
        if (this.currentEdit.episode_name) {
          return `${this.currentEdit.episode_name} / ${this.currentEdit.name}`
        } else {
          return `${this.currentEdit.name}`
        }
      } else {
        return this.$t('main.loading')
      }
    },

    editsPath() {
      return getEntitiesPath(
        this.currentProduction.id,
        'edits',
        this.currentEpisode ? this.currentEpisode.id : this.currentEpisode
      )
    },

    currentTaskTypeId() {
      return this.currentPreview?.task_type_id || null
    },

    currentTask() {
      const taskTypeId = this.currentTaskTypeId
      if (!taskTypeId || !this.currentEdit) return undefined
      const editId = this.currentEdit.id
      for (const t of this.taskMap.values()) {
        if (t.entity_id === editId && t.task_type_id === taskTypeId) return t
      }
      return undefined
    },

    currentRevisions() {
      return this.previewFiles[this.currentTaskTypeId] || []
    }
  },

  methods: {
    ...mapActions([
      'editEdit',
      'loadEdits',
      'loadTaskEntityPreviewFiles',
      'updatePreviewAnnotation'
    ]),

    init() {
      this.resetData()
      this.$options.scrubbing = false
      this.isHd = Boolean(this.organisation.hd_by_default)
      if (this.picturePlayer) {
        this.picturePlayer.addEventListener('load', async () => {
          const wasPlaying = this.isPlaying
          await this.resetPictureCanvas()
          this.isPlaying = wasPlaying
        })
      }
      this.$nextTick(() => {
        this.configureEvents()
        this.setupFabricCanvas()
        this.setPlayerSpeed(1)
        this.onFrameUpdate(1)
      })
    },

    resetPreviewFileMap() {
      this.previewFileMap.clear()
      if (this.previewFiles) {
        Object.values(this.previewFiles).forEach(previewFiles => {
          previewFiles.forEach(previewFile => {
            this.previewFileMap.set(previewFile.id, previewFile)
          })
        })
      }
    },

    resetHeight() {
      this.$nextTick(() => {
        let height = window.innerHeight
        height -= this.$refs.header ? this.$refs.header.offsetHeight : 0
        if (this.$refs['button-bar']) {
          height -= this.$refs['button-bar'].offsetHeight
        }
        if (this.$refs['video-progress']) {
          height -= this.$refs['video-progress'].$el.offsetHeight
        }
        if (this.$refs['info-row']) {
          height -= this.$refs['info-row'].offsetHeight
        }
        if (this.$refs['schedule-row']) {
          height -= this.$refs['schedule-row'].offsetHeight
        }
        if (this.$refs['page-header-row']) {
          height -= this.$refs['page-header-row'].offsetHeight
        }
        height = Math.min(window.innerHeight * 0.4, Math.max(480, height))
        if (this.$refs['video-container']) {
          this.$refs['video-container'].style.height = `${height}px`
        }
        if (!this.isCommentsHidden && this.$refs['task-info']) {
          this.$refs['task-info'].$el.style.height = `${height + 66}px`
        }
        if (this.rawPlayer) this.rawPlayer.resetHeight(height)
        this.$nextTick(() => {
          this.resetCanvas()
          this.updateProgressBar()
        })
      })
    },

    initPlayer() {
      if (!this.currentEdit) return

      this.currentPreviewIndex = 0
      // There's only one entity in this player, which is current Edit entity,
      // so playingEntityIndex is always 0
      this.playingEntityIndex = 0
      this.entityList = [
        {
          ...this.currentEdit,
          preview_file_id: null,
          preview_files: this.previewFiles
        }
      ]
      this.framesPerImage[0] =
        this.currentEdit.preview_nb_frames || DEFAULT_NB_FRAMES_PICTURE
      this.pause()
      this.rawPlayer?.setCurrentFrame(1)
      this.currentTimeRaw = 0
      this.updateProgressBar()
      this.updateTaskPanel()
      this.clearCanvas()
      this.annotations = []
      this.resetHeight()
      this.resetCanvas().then(() => {
        if (this.isCurrentPreview) {
          this.annotations = this.currentEntity.preview_file_annotations
          this.loadAnnotation(this.getAnnotation(0))
        }
      })
    },

    getCurrentEdit() {
      return editStore.cache.editMap.get(this.route.params.edit_id) || null
    },

    confirmEditEdit(form) {
      form.id = this.currentEdit.id
      this.isLoading = true
      this.errors.edit = false
      this.editEdit(form)
        .then(() => {
          this.isLoading = false
          this.modals.edit = false
        })
        .catch(err => {
          console.error(err)
          this.isLoading = false
          this.errors.edit = true
        })
    },

    setPreviewFile(previewFile) {
      this.playingPreviewFileId = previewFile.id

      this.currentEntity.preview_file_id = previewFile.id
      this.currentEntity.preview_file_task_id = previewFile.task_id
      this.currentEntity.preview_file_extension = previewFile.extension
      this.currentEntity.preview_file_annotations =
        previewFile.annotations || []
      this.currentEntity.preview_file_previews = previewFile.previews

      this.annotations = this.currentEntity.preview_file_annotations

      if (this.rawPlayer) this.rawPlayer.reloadCurrentEntity()
      this.clearCanvas()
      this.updateTaskPanel()
      this.updateProgressBar()
    },

    onPreviousPreviewClicked() {
      const index = this.currentPreviewIndex - 1
      this.currentPreviewIndex =
        index < 0 ? this.currentEntityPreviewLength - 1 : index
    },

    onNextPreviewClicked() {
      const index = this.currentPreviewIndex + 1
      this.currentPreviewIndex =
        index > this.currentEntityPreviewLength - 1 ? 0 : index
    },

    onPreviewChanged(entity, previewFile) {
      this.pause()
      if (!previewFile) {
        // TODO: handle the situation when now preview file is selected
        // (e.g. if selected task has none)
      }
      this.setPreviewFile(previewFile)
    },

    onChangeCurrentPreview(previewFile) {
      // PreviewPlayer emits change-current-preview when the user picks a
      // different revision. Route it through onPreviewChanged so the
      // PreviewsPerTaskType combo stays in sync via the shared state.
      if (previewFile) this.onPreviewChanged(this.currentEntity, previewFile)
    },

    async onAnnotationChanged({ preview, additions, deletions, updates }) {
      const taskId = preview.task_id
      try {
        await this.updatePreviewAnnotation({
          taskId,
          preview,
          additions,
          deletions,
          updates
        })
        this.confirmAnnotationsSaved()
      } catch {
        this.restoreFailedAnnotations()
      }
    },

    onVideoLoaded() {
      this.movieDimensions = {
        width: this.currentPreview.width,
        height: this.currentPreview.height
      }
    },

    scrollToEntity() {
      // This method in unused here, required by PlaylistPlayer that shares
      // playerMixin.
    },

    resetData() {
      this.$nextTick(() => {
        this.loadEdits().then(() => {
          this.currentEdit = this.getCurrentEdit()
          if (!this.currentEdit) {
            return
          }
          this.loadTaskEntityPreviewFiles(this.currentEdit.id).then(
            previewFiles => {
              this.previewFiles = previewFiles
              this.resetPreviewFileMap()
              this.initPlayer()
              this.isLoading = false
            }
          )
        })
      })
    },

    onPreviewFilesUpdate() {
      this.loadTaskEntityPreviewFiles(this.currentEdit.id).then(
        previewFiles => {
          this.previewFiles = previewFiles
          this.currentEntity.preview_files = previewFiles
          this.resetPreviewFileMap()
          // FIXME: combo should continue displaying currently selected task preview
          // unless it's no longer available (e.g. was deleted along with the comment)
          if (
            this.currentEntity &&
            this.currentEntity.preview_file_id &&
            !this.previewFileMap.has(this.currentEntity.preview_file_id)
          ) {
            // TODO: handle deletion of currently displayed preview file
          }
        }
      )
    },

    resetPanZoom() {
      if (this.isCurrentPreviewMovie) {
        this.rawPlayer?.resetPanZoom()
      } else if (this.isCurrentPreviewPicture) {
        this.picturePlayer?.resetPanZoom()
      }
    }
  },

  watch: {
    // Needed when reloading the page with F5
    currentProduction() {
      if (!this.isTVShow) this.resetData()
    },

    currentEpisode() {
      if (this.isTVShow && editStore.cache.editMap.size === 0) {
        this.resetData()
      }
    },

    playingPreviewFileId() {
      // In case preview was switched by someone else in the room,
      // make sure that comboboxes reflect this change too.
      if (!this.currentEntity || !this.playingPreviewFileId) return

      const previewsCombo = this.$refs['previews-per-task-type']
      if (!previewsCombo) return

      const previews = this.currentEntity.preview_files
      for (const taskTypeId in previews) {
        const previewFile = previews[taskTypeId].find(
          p => p.id === this.playingPreviewFileId
        )
        if (previewFile) {
          this.setPreviewFile(previewFile)
          if (
            previewsCombo.taskTypeId !== taskTypeId ||
            previewsCombo.previewFileId !== this.playingPreviewFileId
          ) {
            previewsCombo.taskTypeId = taskTypeId
            previewsCombo.previewFileId = this.playingPreviewFileId
          }
          break
        }
      }
    }
  },

  socket: {
    events: {
      ...playerMixin.socket.events,

      'preview-file:add-file'(eventData) {
        if (eventData.project_id !== this.task.project_id) return
        const taskId = eventData.task_id

        const previews = this.currentEntity.preview_files
        for (const taskTypeId in previews) {
          const previewFile = previews[taskTypeId].find(
            p => p.task_id === taskId
          )
          if (previewFile) {
            // Added preview affects one of the tasks, preview files must be refreshed
            this.onPreviewFilesUpdate()
            break
          }
        }
      },

      'comment:delete'(eventData) {
        // Deleting a comment might remove a task preview, preview files must be refreshed
        if (eventData.project_id !== this.task.project_id) return
        this.onPreviewFilesUpdate()
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
.dark .page {
  background: $dark-grey-light;
  height: 100%;
  padding-bottom: 1em;
}

.dark .wrapper {
  background: $dark-grey-2;
}

.block {
  margin: 0;
}

.entity-title {
  font-weight: bold;
}

.entity-thumbnail {
  margin-bottom: 0;
}

.main-block {
  padding: 0.5em 1.5em;
}

.edit-data {
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 0 1em 0 1em;
  overflow: hidden;
  min-height: 300px;
}

.edit-metadata {
  width: 100%;
}

h2.subtitle {
  border-bottom: 0;
  margin-top: 0;
  margin-bottom: 0.5em;
  font-size: 1.5em;
}

.page {
  background: #f9f9f9;
  padding: 0;
}

.page-header {
  margin-top: calc(50px + 2em);
  margin-left: 1em;
  margin-right: 1em;
}

.infos {
  margin-top: 1em;

  .flexrow-item {
    align-self: flex-start;
    flex: 1;
  }
}

.edit-thumbnail {
  max-width: 100px;
}

.field-label {
  font-weight: bold;
  width: 140px;
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

/* Player styles */

.full-height {
  height: 100%;
}

.player {
  margin: 1em;

  .player-button {
    background: $white-grey;
    margin: 0;
    border: 0;
    border-radius: 0;

    &.active {
      color: $green;
    }

    &.topbar-button {
      border-radius: 10px;
      margin-right: 0.5em;
    }
  }
}

.dark .player {
  background: $dark-grey;

  .player-button {
    background: $dark-grey-light;
    color: $white-grey;

    &:hover {
      background: $dark-grey-lighter;
    }

    &.active {
      color: $green;
    }

    &.topbar-button {
      border: 1px solid $dark-grey-strong;
    }
  }
}

.player-footer {
  background: $white-grey;
}

.dark .player-footer {
  background: $dark-grey-light;
  color: $white-grey;
}

.loading-background {
  width: 100%;
  height: 100%;
  background: black;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.spinner {
  margin: auto;
}

.task-info-column {
  min-width: 450px;
  max-width: 450px;
  overflow-y: auto;
}

.smaller {
  height: 16px;
}

.right {
  margin-left: auto;
}

.video-player {
  display: flex;
  flex-direction: column;
  align-content: flex-end;
  height: 100%;
}

.video-wrapper {
  flex: 1;
  display: flex;
  background: black;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin: auto;
  width: 100%;
}

.annotation-movie {
  margin: auto;
  width: 100%;
}

.dark .time-indicator {
  color: $light-grey;
  padding-left: 0.8em;
  margin-right: 0;
}

.video-container {
  position: relative;
  margin: auto;
  min-height: 480px;
}

.canvas-wrapper {
  margin: auto;
  position: absolute;
  top: 0;
  left: 0;
}

.buttons {
  height: 32px;
}

progress::-moz-progress-bar {
  background-color: #43b581;
}

progress::-webkit-progress-value {
  background-color: #43b581;
}

progress {
  width: 100%;
  border-radius: 0;
  margin: 0;
  padding: 0;
  border: 0;
  background: $grey;
  height: 8px;
  display: block;
}

.progress span#progress-bar {
  width: 100%;
  border-radius: 0;
  margin: 0;
  padding: 0;
  background-color: #43b581;
}

.mr1 {
  margin-right: 1em;
}

.mr0 {
  margin-right: 0;
}

.video-progress {
  transition: opacity 0.5s ease;
}

.spinner {
  margin-top: 80px;
  margin-left: 1em;
}

.annotation-tools {
  display: flex;
  align-items: stretch;
  height: 100%;
}

.slide-enter-active {
  transition: all 0.3s ease;
}
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter,
.slide-leave-to {
  transform: translateX(100%);
}

.for-client {
  background: $dark-purple-strong;
  border: 2px solid $dark-purple-strong;
  color: $white;
  padding: 0.3em;
  margin-left: 1em;
  margin-right: 0;
  border-radius: 5px;
}

#edit-annotation-canvas {
  margin: auto;
}

.picture-preview-wrapper {
  display: flex;
  height: inherit;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.picture-preview {
  max-height: 100%;
  max-width: 100%;
  color: var(--text);
}

.raw-player {
  margin: auto;
}

.disabled {
  color: $grey-strong;
}

.loading-wrapper {
  width: 100%;
}

.disabled {
  color: $grey;
}

.dark .frame-per-image-input {
  padding: 2px;
  margin-left: 3px;
  background-color: $dark-grey-2;
  border: 1px solid $dark-grey-stronger;
  color: white;
  width: 3rem;
}
</style>
