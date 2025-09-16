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
        <div class="flexrow-item block mt0">
          <preview-room
            :ref="previewRoomRef"
            :room="room"
            @open-room="openRoom"
            @join-room="joinRoom"
            @leave-room="leaveRoom"
            v-if="isValidRoomId(currentEdit) && currentPreview?.id"
          />
        </div>
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
        <div class="flexrow filler" v-show="!isLoading">
          <div class="flexrow filler video-container" ref="video-container">
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
              @frame-update="onFrameUpdate"
              @metadata-loaded="onMetadataLoaded"
              @repeat="onVideoRepeated"
              @video-loaded="onVideoLoaded"
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
              :style="{ width: '100%' }"
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
                  {{ $t('tasks.download_pdf_file', { extension: extension }) }}
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
            class="flexrow-item task-info-column"
            :task="task"
            :is-preview="false"
            :silent="isCommentsHidden"
            :current-frame="parseInt(currentFrame) - 1"
            :current-parent-preview="currentPreview"
            @time-code-clicked="onTimeCodeClicked"
            v-show="!isCommentsHidden"
          />
        </div>

        <video-progress
          ref="video-progress"
          class="video-progress pull-bottom"
          :annotations="annotations"
          :frame-duration="frameDuration"
          :movie-dimensions="movieDimensions"
          :nb-frames="nbFrames"
          :handle-in="-1"
          :handle-out="-1"
          :preview-id="currentPreview ? currentPreview.id : ''"
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
              isCurrentPreviewSound
            "
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
            />
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
              class="ml05 mr05 nowrap"
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
              <arrow-up-right-icon class="icon" />
            </a>
          </div>

          <div class="flexrow flexrow-item" v-if="isCurrentPreviewMovie">
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
            <span class="flexrow-item time-indicator"> / </span>
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
            v-if="
              !isCurrentUserArtist &&
              (isCurrentPreviewMovie || isCurrentPreviewPicture)
            "
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
              <div class="annotation-tools" v-show="isTyping">
                <color-picker
                  :color="textColor"
                  @toggle-palette="onPickTextColor"
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
              <div class="annotation-tools" v-show="isDrawing">
                <pencil-picker
                  :pencil="pencil"
                  :sizes="pencilPalette"
                  @toggle-palette="onPickPencilWidth"
                  @change="onChangePencilWidth"
                />

                <color-picker
                  :color="color"
                  @toggle-palette="onPickPencilColor"
                  @change="onChangePencilColor"
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
            :active="!isCommentsHidden"
            :title="$t('playlists.actions.comments')"
            @click="onCommentClicked"
            icon="comment"
          />
          <button-simple
            class="player-button flexrow-item"
            :title="
              $t('playlists.actions.' + (isHd ? 'switch_ld' : 'switch_hd'))
            "
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
                          {{
                            currentEdit.data
                              ? currentEdit.data[descriptor.field_name]
                              : ''
                          }}
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
  ArrowUpRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CornerLeftUpIcon,
  DownloadIcon
} from 'lucide-vue-next'

import editStore from '@/store/modules/edits'

import { annotationMixin } from '@/components/mixins/annotation'
import { domMixin } from '@/components/mixins/dom'
import { entityMixin } from '@/components/mixins/entity'
import { getEntitiesPath } from '@/lib/path'
import { formatListMixin } from '@/components/mixins/format'
import { previewRoomMixin } from '@/components/mixins/previewRoom'
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
import ColorPicker from '@/components/widgets/ColorPicker.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import ObjectViewer from '@/components/previews/ObjectViewer.vue'
import PageSubtitle from '@/components/widgets/PageSubtitle.vue'
import PencilPicker from '@/components/widgets/PencilPicker.vue'
import PreviewRoom from '@/components/widgets/PreviewRoom.vue'
import PreviewsPerTaskType from '@/components/previews/PreviewsPerTaskType.vue'
import RawVideoPlayer from '@/components/pages/playlists/RawVideoPlayer.vue'
import Schedule from '@/components/widgets/Schedule.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import SoundViewer from '@/components/previews/SoundViewer.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import VideoProgress from '@/components/previews/VideoProgress.vue'

export default {
  name: 'edit',

  mixins: [
    annotationMixin,
    domMixin,
    entityMixin,
    formatListMixin,
    previewRoomMixin,
    playerMixin
  ],

  components: {
    ArrowUpRightIcon,
    ButtonSimple,
    ChevronLeftIcon,
    ChevronRightIcon,
    CornerLeftUpIcon,
    ColorPicker,
    ComboboxStyled,
    ComboboxNumber,
    DescriptionCell,
    DownloadIcon,
    EditEditModal,
    EntityNews,
    EntityPreviewFiles,
    EntityTaskList,
    EntityTimeLogs,
    EntityThumbnail,
    ObjectViewer,
    PageSubtitle,
    PencilPicker,
    PreviewRoom,
    PreviewsPerTaskType,
    RawVideoPlayer,
    SoundViewer,
    Schedule,
    Spinner,
    TaskInfo,
    VideoProgress
  },

  data() {
    return {
      type: 'edit',
      currentEdit: null,
      currentSection: 'infos',
      isLoading: true,
      isError: false,
      movieDimensions: { width: 0, height: 0 },
      previewRoomRef: 'edits-preview-room',
      previewFileMap: new Map(),
      room: {
        id: null,
        people: [],
        newComer: true
      },
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
        return 'Loading...'
      }
    },

    editsPath() {
      return getEntitiesPath(
        this.currentProduction.id,
        'edits',
        this.currentEpisode ? this.currentEpisode.id : this.currentEpisode
      )
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
      if (this.rawPlayer) this.rawPlayer.setCurrentFrame(1)
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
      const isDifferentPreviewFile =
        this.playingPreviewFileId !== previewFile.id
      this.setPreviewFile(previewFile)
      if (isDifferentPreviewFile) this.sendUpdatePlayingStatus()
    },

    onAnnotationChanged({ preview, additions, deletions, updates }) {
      const taskId = preview.task_id
      this.updatePreviewAnnotation({
        taskId,
        preview,
        additions,
        deletions,
        updates
      })
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
          this.room.id = this.currentEdit ? this.currentEdit.id : null
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
    }
  },

  watch: {
    currentEdit() {
      this.room.id = this.currentEdit ? this.currentEdit.id : null
    },

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
      ...previewRoomMixin.socket.events,
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
