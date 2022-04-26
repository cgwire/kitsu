<template>
<div class="columns fixed-page edit">
  <div class="column main-column">
    <div class="page-header level" ref="page-header-row">
      <div class="level-left">
        <router-link
          class="flexrow-item has-text-centered back-link"
          :to="editsPath"
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
        <div
          class="flexrow-item has-text-centered"
          :key="currentEntity.id"
          v-if="!isLoading && currentEntity"
        >
          <previews-per-task-type
            ref="previews-per-task-type"
            :entity="currentEntity"
            :entity-map="editMap"
            @preview-changed="onPreviewChanged"
          />
        </div>
      </div>

      <div class="level-right">
        <div class="flexrow-item">
          <preview-room
            :ref="previewRoomRef"
            :roomId="(currentEdit && isValidRoomId(currentEdit.id)) ? currentEdit.id : ''"
            :joinRoom="joinRoom"
            :leaveRoom="leaveRoom"
            v-if="currentEdit && isValidRoomId(currentEdit.id) && currentPreview && currentPreview.id"
          />
        </div>
        <div class="flexrow-item">
          <button-simple
            icon="edit"
            @click="modals.edit = true"
            v-if="isCurrentUserManager"
          />
        </div>
      </div>
    </div>

    <div
      ref="container"
      class="edit player"
    >
      <div
        class="flexrow filler"
        v-show="!isLoading"
      >
        <div
          class="flexrow filler video-container"
          ref="video-container"
        >
          <raw-video-player
            ref="raw-player"
            class="raw-player"
            :style="{
              position: 'static',
              opacity: overlayOpacity
            }"
            :entities="entityList"
            :full-screen="fullScreen"
            :is-hd="isHd"
            :is-repeating="isRepeating"
            :current-preview-index="currentPreviewIndex"
            :muted="isMuted"
            @max-duration-update="onMaxDurationUpdate"
            @metadata-loaded="onMetadataLoaded"
            @repeat="onVideoRepeated"
            @frame-update="onFrameUpdate"
            v-show="isCurrentPreviewMovie && !isLoading"
          />

          <object-viewer
            ref="object-player"
            class="object-player"
            :preview-url="currentPreviewDlPath"
            :style="{
              position: 'static',
              opacity: overlayOpacity
            }"
            :full-screen="fullScreen"
            v-if="isCurrentPreviewModel && !isLoading"
          />

          <sound-viewer
            ref="sound-player"
            class="sound-player"
            :preview-url="currentPreviewDlPath"
            :full-screen="fullScreen"
            @play-ended="pause"
            v-if="isCurrentPreviewSound && !isLoading"
          />

          <p
            :style="{width: '100%'}"
            class="preview-standard-file has-text-centered"
            v-show="isCurrentPreviewFile && !isLoading"
          >
            <a
              class="button"
              ref="preview-file"
              :href="currentPreviewDlPath"
              v-if="extension && extension.length > 0"
            >
              <download-icon class="icon" />
              <span class="text">
                {{ $t('tasks.download_pdf_file', {extension: extension}) }}
              </span>
            </a>
          </p>

          <div
            class="picture-preview-wrapper flexrow"
            ref="picture-player-wrapper"
            :style="{
              position: 'static',
              opacity: overlayOpacity,
              left: 0,
              right: 0
            }"
            v-show="isCurrentPreviewPicture && !isLoading"
          >
             <img
               ref="picture-player"
               id="picture-player"
               class="picture-preview"
               :src="isCurrentPreviewPicture ? currentPreviewPath : null"
               v-show="isCurrentPreviewPicture"
             />
          </div>

          <div class="loading-wrapper" v-if="isLoading">
            <spinner />
          </div>

          <div
            class="canvas-wrapper"
            ref="canvas-wrapper"
            oncontextmenu="return false;"
            v-show="!isCurrentPreviewFile"
          >
            <canvas
              id="edit-annotation-canvas"
              ref="annotation-canvas"
              class="canvas"
            >
            </canvas>
          </div>
        </div>
        <task-info
          ref="task-info"
          :class="{
            'flexrow-item': true,
            'task-info-column': true,
            'hidden': isCommentsHidden
          }"
          :task="task"
          :is-preview="false"
          :silent="isCommentsHidden"
          :current-time-raw="currentTimeRaw - frameDuration"
          :current-parent-preview="currentPreview"
          @time-code-clicked="onTimeCodeClicked"
        />

      </div>

      <video-progress
        ref="video-progress"
        class="video-progress pull-bottom"
        :annotations="annotations"
        :frame-duration="frameDuration"
        :nb-frames="nbFrames"
        @start-scrub="onScrubStart"
        @end-scrub="onScrubEnd"
        @progress-changed="onProgressChanged"
        v-show="isCurrentPreviewMovie && currentPreview.id"
      />

      <div
        class="player-footer flexrow"
        ref="button-bar"
        v-if="currentEntity && currentEntity.id"
      >
        <div
          class="flexrow flexrow-item mr0"
          v-if="
            isCurrentPreviewMovie ||
            isCurrentPreviewPicture ||
            isCurrentPreviewSound"
        >
          <button-simple
            class="button player-button flexrow-item"
            @click="playClicked"
            :title="$t('playlists.actions.play')"
            icon="play"
            v-if="!isPlaying"
          />
          <button-simple
            class="button player-button flexrow-item"
            @click="pauseClicked"
            :title="$t('playlists.actions.pause')"
            icon="pause"
            v-else
          />
        </div>
        <div class="separator"></div>

        <template v-if="isCurrentPreviewPicture">
          {{ framesSeenOfPicture }} /
          <input
            type="number"
            min="0"
            class="frame-per-image-input"
            :title="$t('playlists.actions.frames_per_picture')"
            v-model="framesPerImage[playingEntityIndex]"
          >
        </template>
        <div class="separator" v-if="isCurrentPreviewPicture"></div>

        <div
          class="flexrow flexrow-item"
          v-if="currentEntityPreviewLength > 1"
        >
          <button-simple
            class="button player-button flexrow-item"
            icon="left"
            :title="$t('playlists.actions.files_previous')"
            :disabled="isPlaying"
            @click="onPreviousPreviewClicked"
          />
          <span
            class="ml05 mr05"
            :title="$t('playlists.actions.files_position')"
          >
            {{ currentPreviewIndex + 1 }} / {{ currentEntityPreviewLength }}
          </span>
          <button-simple
            class="button player-button flexrow-item"
            icon="right"
            :title="$t('playlists.actions.files_next')"
            :disabled="isPlaying"
            @click="onNextPreviewClicked"
          />
          <a
            class="button player-button flexrow-item"
            :href="currentPreviewPath"
            :title="$t('playlists.actions.see_original_file')"
            target="blank"
          >
            <arrow-up-right-icon class="icon is-small" />
          </a>
        </div>

        <div
          class="flexrow flexrow-item"
          v-if="isCurrentPreviewMovie"
        >
          <button-simple
            class="button player-button flexrow-item"
            @click="onSpeedClicked"
            :title="$t('playlists.actions.speed')"
            text="x1.00"
            v-if="speed === 3"
          />
          <button-simple
            class="button player-button flexrow-item"
            @click="onSpeedClicked"
            :title="$t('playlists.actions.speed')"
            text="x0.50"
            v-else-if="speed === 2"
          />
          <button-simple
            class="button player-button flexrow-item"
            @click="onSpeedClicked"
            :title="$t('playlists.actions.speed')"
            text="x0.25"
            v-else
          />

          <button-simple
            class="flexrow-item player-button"
            :title="$t('playlists.actions.unmute')"
            icon="soundoff"
            @click="onToggleSoundClicked"
            v-if="isMuted"
          />
          <button-simple
            class="flexrow-item player-button"
            :title="$t('playlists.actions.mute')"
            icon="soundon"
            @click="onToggleSoundClicked"
            v-else
          />

          <button-simple
            class="button player-button flexrow-item"
            :active="isRepeating"
            :title="$t('playlists.actions.looping')"
            icon="repeat"
            @click="onRepeatClicked"
          />

          <span
            class="flexrow-item time-indicator"
            :title="$t('playlists.actions.current_time')"
          >
            {{ currentTime }}
          </span>
          <span class="flexrow-item time-indicator">
          /
          </span>
          <span
            class="flexrow-item time-indicator"
            :title="$t('playlists.actions.max_duration')"
          >
            {{ maxDuration }}
          </span>
          <span
            class="flexrow-item time-indicator mr1"
            :title="$t('playlists.actions.frame_number')"
          >
            ({{ currentFrame }} / {{ (nbFrames + '').padStart(3, '0') }})
          </span>
          <button-simple
            class="button player-button flexrow-item"
            @click="onPreviousFrameClicked"
            :title="$t('playlists.actions.previous_frame')"
            icon="left"
          />
          <button-simple
            class="button player-button flexrow-item"
            @click="onNextFrameClicked"
            :title="$t('playlists.actions.next_frame')"
            icon="right"
          />
        </div>
        <span class="filler"></span>

        <div
          class="flexrow"
          v-if="!isCurrentUserArtist && (isCurrentPreviewMovie || isCurrentPreviewPicture)"
        >
          <button-simple
            class="player-button flexrow-item"
            icon="undo"
            :title="$t('playlists.actions.annotation_undo')"
            @click="undoLastAction"
          />

          <button-simple
            class="player-button flexrow-item"
            :title="$t('playlists.actions.annotation_redo')"
            icon="redo"
            @click="redoLastAction"
          />

          <transition name="slide">
            <div
              class="annotation-tools"
              v-show="isTyping"
            >
              <color-picker
                :isOpen="isShowingPalette"
                :color="this.textColor"
                @TogglePalette="onPickColor"
                @change="onChangeTextColor"
              />
            </div>
          </transition>
          <button-simple
            :class="{
              'player-button': true,
              'flexrow-item': true,
              active: isTyping
            }"
            :title="$t('playlists.actions.annotation_text')"
            @click="onTypeClicked"
            icon="type"
          />

          <transition name="slide">
            <div
              class="annotation-tools"
              v-show="isDrawing"
            >
              <pencil-picker
                :isOpen="isShowingPencilPalette"
                :pencil="pencil"
                :sizes="this.pencilPalette"
                @toggle-palette="onPickPencil"
                @change="onChangePencil"
              />

              <color-picker
                :isOpen="isShowingPalette"
                :color="this.color"
                @TogglePalette="onPickColor"
                @change="onChangeColor"
              />
            </div>
          </transition>
          <button-simple
            :class="{
              'player-button': true,
              'flexrow-item': true,
              active: isDrawing
            }"
            :title="$t('playlists.actions.annotation_draw')"
            @click="onAnnotateClicked"
            icon="pencil"
          />
          <button-simple
            class="player-button flexrow-item"
            icon="remove"
            :title="$t('playlists.actions.annotation_delete')"
            @click="onDeleteClicked"
          />
        </div>
        <div class="separator"></div>
        <button-simple
          class="button player-button flexrow-item"
          :title="$t('playlists.actions.comments')"
          @click="onCommentClicked"
          icon="comment"
        />
        <button-simple
          class="player-button flexrow-item"
          :title="$t('playlists.actions.' + (isHd ? 'switch_ld' : 'switch_hd'))"
          :text="isHd ? 'HD' : 'LD'"
          @click="isHd = !isHd"
          v-if="isCurrentPreviewMovie"
        />

        <button-simple
          class="button player-button flexrow-item"
          :title="$t('playlists.actions.fullscreen')"
          @click="onFullscreenClicked"
          icon="maximize"
          v-if="isFullScreenEnabled"
        />
      </div>

    </div>

    <div class="infos flexrow" ref="info-row">
      <div class="flexrow-item">
        <page-subtitle :text="$t('main.info')" />
        <div class="table-body">
          <table class="datatable" v-if="currentEdit">
            <tbody class="datatable-body">
              <tr class="datatable-row">
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

    <div class="infos schedule" v-if="scheduleItems.length > 0" ref="schedule-row">
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
import { ChevronLeftIcon, DownloadIcon } from 'vue-feather-icons'

import { annotationMixin } from '@/components/mixins/annotation'
import { domMixin } from '@/components/mixins/dom'
import { entityMixin } from '@/components/mixins/entity'
import { formatListMixin } from '@/components/mixins/format'
import { previewRoomMixin } from '@/components/mixins/previewRoom'
import { playerMixin } from '@/components/mixins/player'
import { DEFAULT_NB_FRAMES_PICTURE } from '@/lib/playlist'

import ButtonSimple from '@/components/widgets/ButtonSimple'
import DescriptionCell from '@/components/cells/DescriptionCell'
import EditEditModal from '@/components/modals/EditEditModal'
import EntityThumbnail from '@/components/widgets/EntityThumbnail'
import ColorPicker from '@/components/widgets/ColorPicker'
import PageSubtitle from '@/components/widgets/PageSubtitle'
import PageTitle from '@/components/widgets/PageTitle'
import PencilPicker from '@/components/widgets/PencilPicker'
import PreviewRoom from '@/components/widgets/PreviewRoom'
import PreviewsPerTaskType from '@/components/previews/PreviewsPerTaskType'
import RawVideoPlayer from '@/components/pages/playlists/RawVideoPlayer'
import Schedule from '../pages/schedule/Schedule'
import Spinner from '@/components/widgets/Spinner'
import TaskInfo from '@/components/sides/TaskInfo'
import VideoProgress from '@/components/previews/VideoProgress'

export default {
  name: 'edit',
  mixins: [annotationMixin, domMixin, entityMixin, formatListMixin, previewRoomMixin, playerMixin],
  components: {
    ButtonSimple,
    ChevronLeftIcon,
    ColorPicker,
    DescriptionCell,
    DownloadIcon,
    EditEditModal,
    EntityThumbnail,
    PageSubtitle,
    PageTitle,
    PencilPicker,
    PreviewRoom,
    PreviewsPerTaskType,
    RawVideoPlayer,
    Schedule,
    Spinner,
    TaskInfo,
    VideoProgress
  },

  data () {
    return {
      tempMode: false,
      previewRoomRef: 'edits-preview-room',
      previewFileMap: new Map(),
      currentEdit: null,
      isLoading: true,
      isError: false,
      errors: {
        edit: false
      },
      modals: {
        edit: false
      }
    }
  },

  mounted () {
    this.resetData()
    this.$on('annotation-changed', this.onAnnotationChanged)

    this.$options.scrubbing = false
    this.isHd = this.organisation
      ? this.organisation.hd_by_default === 'true'
      : false
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

  beforeDestroy () {
    this.$off('annotation-changed', this.onAnnotationChanged)
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
      'editMap',
      'editMetadataDescriptors',
      'editsPath',
      'taskMap',
      'taskTypeMap',
      'user'
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
    }
  },

  methods: {
    ...mapActions([
      'editEdit',
      'loadEdits',
      'loadTaskEntityPreviewFiles',
      'updatePreviewAnnotation'
    ]),

    resetPreviewFileMap () {
      this.previewFileMap.clear()
      if (this.previewFiles) {
        Object.values(this.previewFiles).forEach(previewFiles => {
          previewFiles.forEach(previewFile => {
            this.previewFileMap.set(previewFile.id, previewFile)
          })
        })
      }
    },

    resetHeight () {
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
          this.$refs['task-info'].$el.style.height = `${height}px`
        }
        if (this.rawPlayer) this.rawPlayer.resetHeight(height)
        this.$nextTick(() => {
          this.resetCanvas()
          this.updateProgressBar()
        })
      })
    },

    initPlayer () {
      if (!this.currentEdit) return

      this.currentPreviewIndex = 0
      // There's only one entity in this player, which is current Edit entity,
      // so playingEntityIndex is always 0
      this.playingEntityIndex = 0
      this.entityList = [{ ...this.currentEdit, preview_file_id: null, preview_files: this.previewFiles }]
      this.framesPerImage[0] = this.currentEdit.preview_nb_frames || DEFAULT_NB_FRAMES_PICTURE
      this.pause()
      if (this.rawPlayer) this.rawPlayer.setCurrentFrame(1)
      this.currentTimeRaw = 0
      this.updateProgressBar()
      this.updateTaskPanel()
      this.clearCanvas()
      this.annotations = []
      this.resetHeight()
      this.resetCanvas()
        .then(() => {
          if (this.isCurrentPreview) {
            this.annotations = this.currentEntity.preview_file_annotations
            this.loadAnnotation(this.getAnnotation(0))
          }
        })
    },

    getCurrentEdit () {
      return this.editMap.get(this.route.params.edit_id) || null
    },

    confirmEditEdit (form) {
      form.id = this.currentEdit.id
      this.isLoading = true
      this.errors.edit = false
      this.editEdit(form)
        .then(() => {
          this.isLoading = false
          this.modals.edit = false
        })
        .catch((err) => {
          console.error(err)
          this.isLoading = false
          this.errors.edit = true
        })
    },

    setPreviewFile (previewFile) {
      this.playingPreviewFileId = previewFile.id

      this.currentEntity.preview_file_id = previewFile.id
      this.currentEntity.preview_file_task_id = previewFile.task_id
      this.currentEntity.preview_file_extension = previewFile.extension
      this.currentEntity.preview_file_annotations = previewFile.annotations || []
      this.currentEntity.preview_file_previews = previewFile.previews

      this.annotations = this.currentEntity.preview_file_annotations

      if (this.rawPlayer) this.rawPlayer.reloadCurrentEntity()
      this.clearCanvas()
      this.updateTaskPanel()
      this.updateProgressBar()
    },

    onPreviewChanged (entity, previewFile) {
      this.pause()
      if (!previewFile) {
        // TODO: handle the situation when now preview file is selected
        // (e.g. if selected task has none)
      }
      const isDifferentPreviewFile = this.playingPreviewFileId !== previewFile.id
      this.setPreviewFile(previewFile)
      if (isDifferentPreviewFile) this.sendUpdatePlayingStatus()
    },

    onAnnotationChanged ({ preview, additions, deletions, updates }) {
      const taskId = preview.task_id
      this.updatePreviewAnnotation({
        taskId, preview, additions, deletions, updates
      })
    },

    scrollToEntity () {
      // This method in unused here, required by PlaylistPlayer that shares playerMixin.
    },

    resetData () {
      this.$nextTick(() => {
        this.loadEdits()
          .then(() => {
            this.currentEdit = this.getCurrentEdit()
            if (!this.currentEdit) {
              return
            }
            this.loadTaskEntityPreviewFiles(this.currentEdit.id).then((previewFiles) => {
              this.previewFiles = previewFiles
              this.resetPreviewFileMap()
              this.initPlayer()
              this.isLoading = false
            })
          })
      })
    },

    onPreviewFilesUpdate () {
      this.loadTaskEntityPreviewFiles(this.currentEdit.id).then((previewFiles) => {
        this.previewFiles = previewFiles
        this.currentEntity.preview_files = previewFiles
        this.resetPreviewFileMap()
        // FIXME: combo should continue displaying currently selected task preview
        // unless it's no longer available (e.g. was deleted along with the comment)
        if (this.currentEntity &&
          this.currentEntity.preview_file_id &&
          !this.previewFileMap.has(this.currentEntity.preview_file_id)) {
          // TODO: handle deletion of currently displayed preview file
        }
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
    },

    playingPreviewFileId () {
      // In case preview was switched by someone else in the room,
      // make sure that comboboxes reflect this change too.
      if (!this.currentEntity || !this.playingPreviewFileId) return

      const previewsCombo = this.$refs['previews-per-task-type']
      if (!previewsCombo) return

      const previews = this.currentEntity.preview_files
      for (const taskTypeId in previews) {
        const previewFile = previews[taskTypeId].find(p => p.id === this.playingPreviewFileId)
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
      ...previewRoomMixin.socket.events,
      ...playerMixin.socket.events,

      'preview-file:add-file' (eventData) {
        if (eventData.project_id !== this.task.project_id) return
        const taskId = eventData.task_id

        const previews = this.currentEntity.preview_files
        for (const taskTypeId in previews) {
          const previewFile = previews[taskTypeId].find(p => p.task_id === taskId)
          if (previewFile) {
            // Added preview affects one of the tasks, preview files must be refreshed
            this.onPreviewFilesUpdate()
            break
          }
        }
      },

      'comment:delete' (eventData) {
        // Deleting a comment might remove a task preview, preview files must be refreshed
        if (eventData.project_id !== this.task.project_id) return
        this.onPreviewFilesUpdate()
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

.icon {
  margin-top: -4px;
  height: 20px;
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
  background-color: #43B581;
}

progress::-webkit-progress-value {
  background-color: #43B581;
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
  background-color: #43B581;
}

.mr1 {
  margin-right: 1em;
}

.mr0 {
  margin-right: 0;
}

.video-progress {
  transition: opacity 0.5s ease
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
  transition: all .3s ease;
}
.slide-leave-active {
  transition: all .3s ease;
}
.slide-enter, .slide-leave-to {
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
