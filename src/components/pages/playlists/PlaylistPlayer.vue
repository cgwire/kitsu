<template>
  <div
    ref="container"
    :class="{
      dark: true,
      'full-height': !isAddingEntity || isLoading,
      'playlist-player': true
    }"
  >
    <div ref="header" class="playlist-header flexrow" v-if="!tempMode">
      <div
        class="flexrow-item for-client"
        v-if="playlist && playlist.for_client && !isCurrentUserClient"
      >
        {{ $t('playlists.client_playlist') }}
      </div>
      <span class="flexrow-item playlist-name">
        {{ playlist.name }}
      </span>
      <span
        class="flexrow-item time-indicator"
        :title="$t('playlists.actions.entity_index')"
      >
        {{ entityList.length > 0 ? playingEntityIndex + 1 : 0 }}
      </span>
      <span class="flexrow-item time-indicator"> / </span>
      <span
        class="flexrow-item time-indicator mr1"
        :title="$t('playlists.actions.entities_number')"
      >
        {{ entityList.length }}
      </span>

      <button-simple
        class="button playlist-button flexrow-item"
        @click="onPlayPreviousEntityClicked"
        :title="$t('playlists.actions.previous_shot')"
        icon="back"
      />
      <button-simple
        class="playlist-button flexrow-item"
        @click="onPlayNextEntityClicked"
        :title="$t('playlists.actions.next_shot')"
        icon="forward"
      />

      <div class="filler"></div>
      <preview-room
        :ref="previewRoomRef"
        :roomId="isValidRoomId(playlist.id) ? playlist.id : ''"
        :joinRoom="joinRoom"
        :leaveRoom="leaveRoom"
        v-if="isValidRoomId(playlist.id)"
      />
      <button-simple
        @click="$emit('show-add-entities')"
        class="playlist-button topbar-button flexrow-item"
        icon="plus"
        :text="addEntitiesText"
        v-if="isCurrentUserManager && !isAddingEntity"
      />
      <button-simple
        @click="$emit('edit-clicked')"
        class="edit-button playlist-button flexrow-item"
        :title="$t('playlists.actions.edit')"
        icon="edit"
        v-if="isCurrentUserManager"
      />
      <button-simple
        @click="showDeleteModal"
        class="delete-button playlist-button flexrow-item"
        :title="$t('playlists.actions.delete')"
        icon="delete"
        v-if="isCurrentUserManager"
      />
    </div>

    <div class="flexrow filler" v-show="!isAddingEntity || isLoading">
      <div
        :class="{
          filler: true,
          flexrow: true,
          'video-container': true,
          'flexrow-reverse': !isComparisonOverlay
        }"
        ref="video-container"
      >
        <raw-video-player
          ref="raw-player-comparison"
          class="raw-player"
          :style="{
            position: isComparisonOverlay ? 'absolute' : 'relative'
          }"
          :entities="entityListToCompare"
          :full-screen="fullScreen"
          :is-hd="isHd"
          :is-repeating="isRepeating"
          :muted="true"
          :handle-in="playlist.for_entity === 'shot' ? handleIn : -1"
          :handle-out="playlist.for_entity === 'shot' ? handleOut : -1"
          name="comparison"
          v-show="
            isComparing &&
            isCurrentPreviewMovie &&
            isMovieComparison &&
            !isLoading
          "
        />

        <div
          class="picture-preview-comparison-wrapper"
          :style="{
            position: isComparisonOverlay ? 'absolute' : 'static',
            left: 0,
            right: 0
          }"
          v-show="
            isComparing &&
            !isLoading &&
            !isCurrentPreviewFile &&
            ((isCurrentPreviewMovie && !isMovieComparison) ||
              !isCurrentPreviewMovie)
          "
        >
          <img
            ref="picture-player-comparison"
            class="picture-preview"
            :src="currentComparisonPreviewPath"
            v-show="isComparing && isPictureComparison"
          />
          <video
            ref="picture-video-player-comparison"
            class="picture-preview"
            :src="currentComparisonPreviewPath"
            controls
            loop
            muted
            v-if="isComparing && isMovieComparison"
          />
          <span
            class="picture-preview"
            v-show="isComparing && !isPictureComparison && !isMovieComparison"
          >
            It's not a picture preview
          </span>
        </div>

        <raw-video-player
          ref="raw-player"
          class="raw-player"
          :style="{
            position: isComparisonOverlay ? 'absolute' : 'relative',
            opacity: overlayOpacity
          }"
          :entities="entityList"
          :full-screen="fullScreen"
          :is-hd="isHd"
          :is-repeating="isRepeating"
          :current-preview-index="currentPreviewIndex"
          :muted="isMuted"
          @entity-change="onPlayerPlayingEntityChange"
          @frame-update="onFrameUpdate"
          @max-duration-update="onMaxDurationUpdate"
          @metadata-loaded="onMetadataLoaded"
          @play-next="onPlayNext"
          @repeat="onVideoRepeated"
          @video-loaded="onVideoLoaded"
          v-show="isCurrentPreviewMovie && !isLoading"
        />

        <object-viewer
          ref="object-player"
          class="object-player"
          :preview-url="currentPreviewDlPath"
          :style="{
            position: isComparisonOverlay ? 'absolute' : 'static',
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
            position: isComparisonOverlay ? 'absolute' : 'static',
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
          v-show="
            !isCurrentPreviewFile &&
            isAnnotationsDisplayed &&
            !isCurrentPreviewModel
          "
        >
          <canvas
            id="playlist-annotation-canvas"
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
          hidden: isCommentsHidden
        }"
        :task="task"
        :is-preview="false"
        :silent="isCommentsHidden"
        :current-time-raw="currentTimeRaw"
        :current-parent-preview="currentPreview"
        panel-name="playlist-side-panel"
        @time-code-clicked="onTimeCodeClicked"
      />
    </div>

    <video-progress
      ref="video-progress"
      class="video-progress pull-bottom"
      :annotations="annotations"
      :frame-duration="frameDuration"
      :is-full-screen="fullScreen"
      :movie-dimensions="movieDimensions"
      :nb-frames="nbFrames"
      :handle-in="playlist.for_entity === 'shot' ? handleIn : -1"
      :handle-out="playlist.for_entity === 'shot' ? handleOut : -1"
      :preview-id="currentPreview ? currentPreview.id : ''"
      @start-scrub="onScrubStart"
      @end-scrub="onScrubEnd"
      @progress-changed="onProgressChanged"
      @handle-in-changed="onHandleInChanged"
      @handle-out-changed="onHandleOutChanged"
      v-show="isCurrentPreviewMovie && playlist.id && !isAddingEntity"
    />

    <div
      id="sound-container"
      :style="{
        height: isWaveformDisplayed ? '60px' : '0px',
        width: '100%'
      }"
      v-show="isWaveformDisplayed"
    >
      <div id="waveform"></div>
    </div>

    <div
      class="playlist-footer flexrow"
      ref="button-bar"
      v-if="playlist.id && !isAddingEntity"
    >
      <div class="flexrow flexrow-item comparison-buttons" v-if="tempMode">
        <span
          class="flexrow-item time-indicator"
          :title="$t('playlists.actions.entity_index')"
        >
          {{ entityList.length > 0 ? playingEntityIndex + 1 : 0 }}
        </span>
        <span class="flexrow-item time-indicator"> / </span>
        <span
          class="flexrow-item time-indicator mr1"
          :title="$t('playlists.actions.entities_number')"
        >
          {{ entityList.length }}
        </span>

        <button-simple
          class="button playlist-button flexrow-item"
          @click="onPlayPreviousEntityClicked"
          :title="$t('playlists.actions.previous_shot')"
          icon="back"
        />
        <button-simple
          class="playlist-button flexrow-item"
          @click="onPlayNextEntityClicked"
          :title="$t('playlists.actions.next_shot')"
          icon="forward"
        />
      </div>

      <div
        class="flexrow flexrow-item mr0"
        v-if="
          isCurrentPreviewMovie ||
          isCurrentPreviewPicture ||
          isCurrentPreviewSound
        "
      >
        <button-simple
          class="button playlist-button flexrow-item"
          @click="playClicked"
          :title="$t('playlists.actions.play')"
          icon="play"
          v-if="!isPlaying"
        />
        <button-simple
          class="button playlist-button flexrow-item"
          @click="pauseClicked"
          :title="$t('playlists.actions.pause')"
          icon="pause"
          v-else
        />
      </div>

      <div v-if="isCurrentPreviewMovie">
        <span
          class="flexrow-item time-indicator is-hidden-desktop"
          :title="$t('playlists.actions.current_time')"
        >
          {{ currentTime }}
        </span>
        <span class="flexrow-item time-indicator is-hidden-desktop"> / </span>
        <span
          class="flexrow-item time-indicator is-hidden-desktop"
          :title="$t('playlists.actions.max_duration')"
        >
          {{ maxDuration }}
        </span>
        <span
          class="flexrow-item time-indicator mr1"
          :title="$t('playlists.actions.frame_number')"
        >
          ({{ currentFrame }}&nbsp;/&nbsp;{{
            (nbFrames + '').padStart(3, '0')
          }})
        </span>
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

      <div class="flexrow flexrow-item" v-if="currentEntityPreviewLength > 1">
        <button-simple
          class="button playlist-button flexrow-item"
          icon="left"
          :title="$t('playlists.actions.files_previous')"
          :disabled="isPlaying"
          @click="onPreviousPreviewClicked"
        />
        <span class="ml05 mr05" :title="$t('playlists.actions.files_position')">
          {{ currentPreviewIndex + 1 }} / {{ currentEntityPreviewLength }}
        </span>
        <button-simple
          class="button playlist-button flexrow-item"
          icon="right"
          :title="$t('playlists.actions.files_next')"
          :disabled="isPlaying"
          @click="onNextPreviewClicked"
        />
        <a
          class="button playlist-button flexrow-item"
          :href="currentPreviewPath"
          :title="$t('playlists.actions.see_original_file')"
          target="blank"
        >
          <arrow-up-right-icon class="icon is-small" />
        </a>
      </div>

      <div class="flexrow flexrow-item mr0" v-if="isCurrentPreviewMovie">
        <button-simple
          class="button playlist-button flexrow-item"
          :active="isRepeating"
          :title="$t('playlists.actions.looping')"
          icon="repeat"
          @click="onRepeatClicked"
        />
        <button-simple
          class="playlist-button flexrow-item"
          :title="$t('playlists.actions.' + (isHd ? 'switch_ld' : 'switch_hd'))"
          :text="isHd ? 'HD' : 'LD'"
          @click="isHd = !isHd"
          v-if="isCurrentPreviewMovie"
        />
        <button-simple
          class="button playlist-button flexrow-item"
          @click="onSpeedClicked"
          :title="$t('playlists.actions.speed')"
          :text="speedTextMap[speed - 1]"
        />
        <button-simple
          class="button playlist-button flexrow-item mr0"
          :active="isShowAnnotationsWhilePlaying"
          :title="$t('playlists.actions.toggle_playing_annotations')"
          icon="triangle"
          @click="
            isShowAnnotationsWhilePlaying = !isShowAnnotationsWhilePlaying
          "
        />
        <button-simple
          class="flexrow-item playlist-button"
          :title="$t('playlists.actions.unmute')"
          icon="soundoff"
          @click="onToggleSoundClicked"
          v-if="isMuted"
        />
        <button-simple
          class="flexrow-item playlist-button"
          :title="$t('playlists.actions.mute')"
          icon="soundon"
          @click="onToggleSoundClicked"
          v-else
        />
        <button-simple
          class="button playlist-button flexrow-item"
          :active="isWaveformDisplayed"
          :title="$t('playlists.actions.toggle_waveform')"
          icon="music"
          @click="isWaveformDisplayed = !isWaveformDisplayed"
        />
      </div>

      <div class="separator"></div>
      <button-simple
        class="playlist-button flexrow-item"
        :title="$t('playlists.actions.change_task_type')"
        icon="layers"
        @click="showTaskTypeModal"
        v-if="!tempMode"
      />
      <div
        class="flexrow flexrow-item comparison-buttons"
        v-if="isCurrentPreviewMovie || isCurrentPreviewPicture"
      >
        <button-simple
          :class="{
            'comparison-button': true,
            'flexrow-item': true,
            'playlist-button': true,
            active: isComparing
          }"
          :title="$t('playlists.actions.split_screen')"
          icon="compare"
          @click="onCompareClicked"
          v-if="taskTypeOptions && taskTypeOptions.length > 0"
        />
        <div class="flexrow comparison-combos">
          <combobox
            class="playlist-button flexrow-item comparison-list"
            :options="taskTypeOptions"
            v-model="taskTypeToCompare"
            @input="onTaskTypeToCompareChanged"
            v-if="isComparing"
          />
          <combobox
            class="playlist-button flexrow-item comparison-list"
            :options="revisionOptions"
            @input="onRevisionToCompareChanged"
            v-model="revisionToCompare"
            v-if="isComparing"
          />
          <combobox
            class="playlist-button flexrow-item comparison-list"
            :options="comparisonModeOptions"
            v-model="comparisonMode"
            @input="updateRoomStatus"
            v-if="isComparing"
          />
          <div
            class="flexrow flexrow-item comparison-list"
            v-if="
              isComparing &&
              currentRevisionToCompare &&
              currentComparisonPreviewLength > 1
            "
          >
            <button-simple
              class="button playlist-button flexrow-item"
              icon="left"
              @click="onPreviousComparisonPictureClicked"
            />
            <span class="flexrow-item comparison-index">
              {{ currentComparisonPreviewIndex + 1 }} /
              {{ currentComparisonPreviewLength }}
            </span>
            <button-simple
              class="button playlist-button flexrow-item"
              icon="right"
              @click="onNextComparisonPictureClicked"
            />
          </div>
          <div
            class="flexrow flexrow-item comparison-missing"
            v-if="isComparing && comparisonEntityMissing"
          >
            ⚠️ {{ $t('playlists.comparing_missing_plan') }}
          </div>
        </div>
      </div>
      <span class="filler"></span>

      <button-simple
        @click="$emit('save-clicked')"
        class="playlist-button flexrow-item"
        :title="$t('playlists.actions.save_playlist')"
        icon="save"
        v-if="isCurrentUserManager && tempMode"
      />
      <div
        class="flexrow"
        v-if="
          !isCurrentUserArtist &&
          (isCurrentPreviewMovie || isCurrentPreviewPicture)
        "
      >
        <div class="separator" v-if="isCurrentUserManager && tempMode"></div>
        <button-simple
          @click="isAnnotationsDisplayed = !isAnnotationsDisplayed"
          :class="{
            'playlist-button': true,
            'flexrow-item': true,
            active: isAnnotationsDisplayed
          }"
          icon="pen"
          :title="$t('playlists.actions.toggle_annotations')"
          v-if="isCurrentUserManager && !isAddingEntity"
        />
        <transition name="slide">
          <div class="annotation-tools" v-show="isTyping">
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
            'playlist-button': true,
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
            'playlist-button': true,
            'flexrow-item': true,
            active: isDrawing
          }"
          :title="$t('playlists.actions.annotation_draw')"
          @click="onAnnotateClicked"
          icon="pencil"
        />
        <button-simple
          @click="isLaserModeOn = !isLaserModeOn"
          :class="{
            'playlist-button': true,
            'flexrow-item': true,
            active: isLaserModeOn
          }"
          icon="laser"
          :title="$t('playlists.actions.toggle_laser')"
          v-if="isCurrentUserManager && !isAddingEntity"
        />
        <button-simple
          :class="{
            'playlist-button': true,
            'flexrow-item': true,
            active: isDrawing
          }"
          :title="$t('playlists.actions.annotation_erase')"
          @click="onEraseClicked"
          icon="eraser"
          v-show="false"
        />
        <button-simple
          class="playlist-button flexrow-item"
          icon="remove"
          :title="$t('playlists.actions.annotation_delete')"
          @click="onDeleteClicked"
        />
      </div>
      <div class="separator"></div>
      <button-simple
        class="button playlist-button flexrow-item"
        :title="$t('playlists.actions.comments')"
        @click="onCommentClicked"
        icon="comment"
      />
      <button-simple
        class="playlist-button flexrow-item"
        :title="$t('playlists.actions.entity_list')"
        @click="onFilmClicked"
        icon="film"
      />
      <div
        class="flexrow-item playlist-button"
        style="position: relative"
        v-if="!tempMode"
      >
        <div
          :class="{
            'build-options': true,
            hidden: isDlButtonsHidden
          }"
        >
          <a class="dl-button zip-button" :href="zipDlPath">
            {{ $t('playlists.download_zip') }}
          </a>
          <a class="dl-button zip-button" :href="csvDlPath">
            {{ $t('playlists.download_csv') }}
          </a>
          <span
            :class="{
              'dl-button': true,
              'mp4-button': true,
              disabled: !isCurrentUserManager || isJobRunning,
              hidden: isDlButtonsHidden
            }"
            @click="onBuildClicked"
          >
            {{ $t('playlists.build_mp4') }} - concat
          </span>
          <span
            :class="{
              'dl-button': true,
              'mp4-2-button': true,
              disabled: !isCurrentUserManager || isJobRunning,
              hidden: isDlButtonsHidden
            }"
            @click="onBuildFullClicked"
          >
            {{ $t('playlists.build_mp4') }} - full
          </span>
        </div>
        <div
          :class="{
            'build-list': true,
            hidden: isDlButtonsHidden
          }"
        >
          <span v-if="!playlist.build_jobs || playlist.build_jobs.length === 0">
            {{ $t('playlists.no_build') }}
          </span>
          <div v-else>
            <div class="build-title">
              {{ $t('playlists.available_build') }}
            </div>
            <div
              class="flexrow"
              :key="job.id"
              v-for="job in playlist.build_jobs"
            >
              <spinner class="build-spinner" v-if="job.status === 'running'" />
              <span v-if="job.status === 'running'">
                {{ $t('playlists.building') }}
              </span>
              <span v-else-if="job.status === 'failed'">
                {{ $t('playlists.failed') }}
              </span>
              <a class="flexrow-item" :href="getBuildPath(job)" v-else>
                {{ formatDate(job.created_at) }}
              </a>
              <span class="filler"></span>
              <button class="delete-job-button" @click="onRemoveBuildJob(job)">
                x
              </button>
            </div>
          </div>
        </div>
        <button-simple
          class="playlist-button"
          :title="$t('playlists.actions.download')"
          icon="download"
          @click="toggleDlButtons"
          v-if="!isCurrentUserArtist"
        />
      </div>

      <button-simple
        class="button playlist-button flexrow-item"
        :title="$t('playlists.actions.fullscreen')"
        @click="onFullscreenClicked"
        icon="maximize"
        v-if="isFullScreenEnabled"
      />
    </div>

    <div
      :class="{
        'playlisted-entities': true,
        flexrow: true,
        hidden: isEntitiesHidden
      }"
      ref="playlisted-entities"
      @wheel="onEntitiesWheel"
      v-if="playlist.id"
    >
      <spinner class="spinner" v-if="isLoading" />
      <div
        class="flexrow-item has-text-centered playlisted-wrapper"
        :key="entity.id"
        v-for="(entity, index) in entityList"
        v-else
      >
        <playlisted-entity
          :ref="'entity-' + index"
          :index="index"
          :entity="entity"
          :is-playing="playingEntityIndex === index"
          @play-click="entityListClicked"
          @remove-entity="removeEntity"
          @preview-changed="onPreviewChanged"
          @entity-dropped="onEntityDropped"
        />
      </div>
    </div>

    <delete-modal
      :active="modals.delete"
      :is-loading="loading.deletePlaylist"
      :is-error="errors.deletePlaylist"
      :text="deleteText"
      :error-text="$t('playlists.delete_error')"
      @confirm="confirmRemovePlaylist"
      @cancel="hideDeleteModal"
    />

    <select-task-type-modal
      :active="modals.taskType"
      :task-type-list="entityTaskTypes"
      @confirm="confirmChangeTaskType"
      @cancel="hideTaskTypeModal"
    />

    <!-- used only for picture saving purpose, it is not displayed -->
    <canvas id="annotation-snapshot" ref="annotation-snapshot"> </canvas>
    <canvas id="resize-annotation-canvas" ref="resize-annotation-canvas">
    </canvas>
    <!-- end -->
  </div>
</template>

<script>
/*
 * This modules manages all the options available while playing a playlist.
 * It is made to work with a single playlist.
 */
import moment from 'moment-timezone'
import WaveSurfer from 'wavesurfer.js'
import { mapActions, mapGetters } from 'vuex'
import { ArrowUpRightIcon, DownloadIcon } from 'vue-feather-icons'

import { formatFrame } from '@/lib/video'
import ButtonSimple from '@/components/widgets/ButtonSimple'
import ColorPicker from '@/components/widgets/ColorPicker'
import Combobox from '@/components/widgets/Combobox'
import DeleteModal from '@/components/modals/DeleteModal'
import ObjectViewer from '@/components/previews/ObjectViewer'
import PencilPicker from '@/components/widgets/PencilPicker'
import PlaylistedEntity from '@/components/pages/playlists/PlaylistedEntity'
import RawVideoPlayer from '@/components/pages/playlists/RawVideoPlayer'
import PreviewRoom from '@/components/widgets/PreviewRoom'
import SelectTaskTypeModal from '@/components/modals/SelectTaskTypeModal'
import SoundViewer from '@/components/previews/SoundViewer'
import Spinner from '@/components/widgets/Spinner'
const TaskInfo = () => import('@/components/sides/TaskInfo')
import VideoProgress from '@/components/previews/VideoProgress'

import { annotationMixin } from '@/components/mixins/annotation'
import { DEFAULT_NB_FRAMES_PICTURE } from '@/lib/playlist'
import { domMixin } from '@/components/mixins/dom'
import { previewRoomMixin } from '@/components/mixins/previewRoom'
import { playerMixin } from '@/components/mixins/player'

export default {
  name: 'playlist-player',
  mixins: [annotationMixin, domMixin, previewRoomMixin, playerMixin],

  components: {
    ArrowUpRightIcon,
    ButtonSimple,
    ColorPicker,
    Combobox,
    DownloadIcon,
    DeleteModal,
    ObjectViewer,
    PencilPicker,
    PlaylistedEntity,
    RawVideoPlayer,
    PreviewRoom,
    SelectTaskTypeModal,
    SoundViewer,
    Spinner,
    TaskInfo,
    VideoProgress
  },

  props: {
    playlist: {
      type: Object,
      default: () => {}
    },
    entities: {
      type: Object,
      default: () => {}
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isAddingEntity: {
      type: Boolean,
      default: false
    },
    currentEntityType: {
      type: String,
      default: 'shot'
    },
    tempMode: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      buildLaunched: false,
      comparisonEntityMissing: false,
      comparisonMode: 'sidebyside',
      currentComparisonPreviewIndex: 0,
      handleIn: 0,
      handleOut: 0,
      isAnnotationsDisplayed: true,
      isBuildLaunched: false,
      isDlButtonsHidden: true,
      isLaserModeOn: false,
      isShowingPalette: false,
      isShowingPencilPalette: false,
      isShowAnnotationsWhilePlaying: false,
      isWaveformDisplayed: false,
      movieDimensions: { width: 0, height: 0 },
      playlistToEdit: {},
      previewRoomRef: 'playlist-player-preview-room',
      revisionOptions: [],
      savedTaskTypeToCompare: null,
      taskTypeOptions: [],
      taskTypeToCompare: null,
      revisionToCompare: null,
      modals: {
        delete: false,
        taskType: false
      },
      loading: {
        deletePlaylist: false
      },
      errors: {
        playlists: false,
        deletePlaylist: false
      },
      forClientOptions: [
        { label: this.$t('playlists.for_client'), value: 'true' },
        { label: this.$t('playlists.for_studio'), value: 'false' }
      ],
      speedTextMap: ['x0.25', 'x0.50', 'x1.00', 'x2.00']
    }
  },

  mounted() {
    this.$options.scrubbing = false
    this.isHd = this.organisation
      ? this.organisation.hd_by_default === 'true'
      : false
    if (this.entities) {
      this.entityList = Object.values(this.entities)
    } else {
      this.entityList = []
    }
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
      this.resetCanvas()
      this.setPlayerSpeed(1)
      this.rebuildComparisonOptions()
      this.onFrameUpdate(0)
      this.configureWaveForm()
    })
  },

  computed: {
    ...mapGetters([
      'assetTaskTypes',
      'currentEpisode',
      'currentProduction',
      'isCurrentUserArtist',
      'isCurrentUserClient',
      'isCurrentUserManager',
      'isTVShow',
      'organisation',
      'previewFileMap',
      'shotMap',
      'taskMap',
      'taskTypeMap',
      'shotTaskTypes',
      'user'
    ]),

    isMovieComparison() {
      if (!this.currentPreviewToCompare) return false
      return this.currentPreviewToCompare.extension === 'mp4'
    },

    isPictureComparison() {
      if (!this.currentPreviewToCompare) return false
      return this.isPicture(this.currentPreviewToCompare.extension)
    },

    comparisonModeOptions() {
      return [
        {
          label: this.$t('playlists.actions.side_by_side'),
          value: 'sidebyside'
        },
        {
          label: `${this.$t('playlists.actions.overlay')} 0%`,
          value: 'overlay0'
        },
        {
          label: `${this.$t('playlists.actions.overlay')} 25%`,
          value: 'overlay25'
        },
        {
          label: `${this.$t('playlists.actions.overlay')} 50%`,
          value: 'overlay50'
        },
        {
          label: `${this.$t('playlists.actions.overlay')} 75%`,
          value: 'overlay75'
        },
        {
          label: `${this.$t('playlists.actions.overlay')} 100%`,
          value: 'overlay100'
        }
      ]
    },

    currentRevisionToCompare() {
      if (!this.currentEntity) return null
      const previewFiles =
        this.currentEntity.preview_files[this.taskTypeToCompare]
      if (previewFiles && previewFiles.length > 0) {
        const preview = previewFiles.find(
          p => `${p.revision}` === this.revisionToCompare
        )
        if (preview) return preview
        else {
          return previewFiles[0]
        }
      } else {
        return null
      }
    },

    currentPreviewToCompare() {
      if (!this.currentEntity) return null
      if (this.currentComparisonPreviewIndex > 0) {
        const index = this.currentComparisonPreviewIndex - 1
        return this.currentRevisionToCompare.previews[index]
      } else {
        return this.currentRevisionToCompare
      }
    },

    currentPreviewOriginalPath() {
      if (!this.currentPreview) return ''
      const previewId = this.currentPreview.id
      const extension = this.currentPreview.extension
      return `/api/pictures/originals/preview-files/${previewId}.${extension}`
    },

    previousEntityIndex() {
      let index = this.playingEntityIndex - 1
      if (index < 0) index = this.entityList.length - 1
      return index
    },

    nextEntityIndex() {
      let index = this.playingEntityIndex + 1
      if (index > this.entityList.length - 1) index = 0
      return index
    },

    currentComparisonPreviewLength() {
      if (this.currentRevisionToCompare) {
        const previews = this.currentRevisionToCompare.previews
        return previews ? previews.length + 1 : 0
      } else {
        return 0
      }
    },

    csvDlPath() {
      return `/api/export/csv/playlists/${this.playlist.id}`
    },

    zipDlPath() {
      return `/api/data/playlists/${this.playlist.id}/download/zip`
    },

    deleteText() {
      if (this.playlist) {
        return this.$t('playlists.delete_text', { name: this.playlist.name })
      } else {
        return ''
      }
    },

    timezone() {
      return this.user.timezone || moment.tz.guess()
    },

    entityTaskTypes() {
      if (this.playlist.for_entity === 'asset') {
        return this.assetTaskTypes
      } else {
        return this.shotTaskTypes
      }
    },

    addEntitiesText() {
      if (this.isAssetPlaylist) {
        return this.$t('playlists.add_assets')
      } else if (this.isSequencePlaylist) {
        return this.$t('playlists.add_sequences')
      } else {
        return this.$t('playlists.add_shots')
      }
    },

    isAssetPlaylist() {
      return this.currentEntityType === 'asset'
    },

    isSequencePlaylist() {
      return this.currentEntityType === 'sequence'
    },

    isJobRunning() {
      return (
        this.playlist.build_jobs.filter(job => job.status === 'running')
          .length !== 0
      )
    }
  },

  methods: {
    ...mapActions([
      'changePlaylistType',
      'deletePlaylist',
      'removeBuildJob',
      'runPlaylistBuild',
      'editShot'
    ]),

    getBuildPath(job) {
      return `/api/data/playlists/${this.playlist.id}/jobs/${job.id}/build/mp4`
    },

    formatDate(creationDate) {
      const date = moment.tz(creationDate, 'UTC').tz(this.timezone)
      return date.format('YYYY-MM-DD HH:mm')
    },

    formatFrame,

    showDeleteModal() {
      this.modals.delete = true
    },

    hideDeleteModal() {
      this.modals.delete = false
    },

    confirmRemovePlaylist() {
      this.loading.deletePlaylist = true
      this.errors.deletePlaylist = false
      this.deletePlaylist({
        playlist: this.playlist,
        callback: err => {
          if (err) this.errors.deletePlaylist = true
          this.loading.deletePlaylist = false
          this.$emit('playlist-deleted')
          this.modals.delete = false
        }
      })
    },

    scrollToEntity(index) {
      const entityEl = this.$refs['entity-' + index]
      if (entityEl && entityEl[0]) {
        const entityWidget = entityEl[0].$el
        const playlistEl = this.$refs['playlisted-entities']
        const entity = this.entityList[index]
        this.annotations = entity.preview_file_annotations || []
        if (entityWidget) {
          const margin = 30
          const rect = entityWidget.getBoundingClientRect()
          const listRect = playlistEl.getBoundingClientRect()
          const isRight = rect.right > listRect.right - margin
          const isLeft = rect.left < listRect.left - margin

          if (isLeft) {
            const scrollingRequired = rect.left - listRect.left - margin
            playlistEl.scrollLeft = playlistEl.scrollLeft + scrollingRequired
          } else if (isRight) {
            const scrollingRequired = rect.right - listRect.right + margin
            playlistEl.scrollLeft = playlistEl.scrollLeft + scrollingRequired
          }
        }
      }
    },

    scrollToRight() {
      if (this.entityList.length > 0) {
        this.scrollToEntity(this.entityList.length - 1)
      }
    },

    entityListClicked(entityIndex) {
      this.playEntity(entityIndex)
      this.updateRoomStatus()
    },

    removeEntity(entity) {
      this.$emit('remove-entity', entity)
      this.$options.silent = true
      const entityIndex = this.entityList.findIndex(s => s.id === entity.id)
      this.entityList.splice(entityIndex, 1)
      setTimeout(() => {
        this.$options.silent = false
      }, 1000)
    },

    onPlayPreviousEntityClicked() {
      this.clearFocus()
      this.playEntity(this.previousEntityIndex)
      this.sendUpdatePlayingStatus()
    },

    onPlayNextEntity() {
      this.clearFocus()
      this.playEntity(this.nextEntityIndex)
      this.sendUpdatePlayingStatus()
    },

    onPlayNextEntityClicked() {
      this.onPlayNextEntity()
      this.sendUpdatePlayingStatus()
    },

    onPlayNext() {
      const nextEntity = this.entityList[this.nextEntityIndex]
      if (this.isRepeating && this.isCurrentPreviewMovie) {
        this.rawPlayer.playNext()
      } else if (nextEntity.preview_file_extension === 'mp4') {
        this.resetHandles(nextEntity)
        this.rawPlayer.playNext(this.handleIn)
        this.syncComparisonPlayer()
        this._setCurrentTimeOnHandleIn()
      } else {
        this.onPlayNextEntityClicked()
        if (this.isCurrentPreviewPicture) {
          this.framesSeenOfPicture = 0
          this.playPicture()
        }
      }
    },

    onPlayerPlayingEntityChange(entityIndex) {
      this.playingEntityIndex = entityIndex
      if (this.isCurrentPreviewMovie) {
        if (this.isComparing) {
          const comparisonIndex = this.rawPlayerComparison.currentIndex
          if (comparisonIndex !== entityIndex) {
            this.rawPlayerComparison.playNext()
          }
        }
        this.movieDimensions = {
          width: this.currentPreview.width,
          height: this.currentPreview.height
        }
      }
      if (!this.$options.silent) this.scrollToEntity(this.playingEntityIndex)
    },

    continuePlayingPlaylist(entityIndex, startMs) {
      const framesPerImage = this.framesPerImage[entityIndex]
      const durationToWaitMs = (framesPerImage * 1000) / this.fps
      const durationWaited = Date.now() - startMs
      if (!this.isPlaying) return
      else if (durationWaited < durationToWaitMs) {
        this.framesSeenOfPicture = Math.floor(
          (durationWaited / 1000) * this.fps
        )
        this.playingPictureTimeout = setTimeout(
          () => this.continuePlayingPlaylist(entityIndex, startMs),
          100
        )
        return
      }

      // we've seen all the frames the picture should be visible
      this.framesSeenOfPicture = 0
      const previews = this.currentEntity.preview_file_previews
      if (previews.length === this.currentPreviewIndex) {
        this.$nextTick(() => {
          this.onPlayNextEntity(true)
        })
      } else {
        this.currentPreviewIndex++
        this.$nextTick(() => {
          this.playingPictureTimeout = setTimeout(() => {
            this.continuePlayingPlaylist(this.playingEntityIndex, Date.now())
          }, 100)
        })
      }
    },

    onVideoLoaded() {
      this.movieDimensions = {
        width: this.currentPreview.width,
        height: this.currentPreview.height
      }
    },

    onPreviewChanged(entity, previewFile) {
      this.pause()
      const localEntity = this.entityList.find(s => s.id === entity.id)
      localEntity.preview_file_id = previewFile.id
      localEntity.preview_file_task_id = previewFile.task_id
      localEntity.preview_file_extension = previewFile.extension
      localEntity.preview_file_annotations = previewFile.annotations
      localEntity.preview_file_width = previewFile.width
      localEntity.preview_file_height = previewFile.height
      localEntity.preview_file_previews = previewFile.previews
      localEntity.preview_file_revision = previewFile.revision
      if (this.rawPlayer) {
        // Hack needed to make sure that the same entity is selected when
        // switching from a non-video preview to a video preview
        // Reloading the player makes it lose the right playing index, if it
        // was not a video before.
        if (this.rawPlayer.getCurrentTimeRaw() < 0.1) {
          this.rawPlayer.loadEntity(this.playingEntityIndex, 0)
        } else {
          this.rawPlayer.reloadCurrentEntity()
        }
      }
      this.$emit('preview-changed', entity, previewFile.id)
      this.clearCanvas()
      this.updateTaskPanel()
    },

    onEntityDropped(info) {
      const playlistEl = this.$refs['playlisted-entities']
      const scrollLeft = playlistEl.scrollLeft

      const entityToMove = this.entityList.find(s => s.id === info.after)
      const toMoveIndex = this.entityList.findIndex(s => s.id === info.after)
      let targetIndex = this.entityList.findIndex(s => s.id === info.before)
      if (toMoveIndex > targetIndex) targetIndex += 1
      this.moveSelectedEntity(entityToMove, toMoveIndex, targetIndex)
      this.$nextTick(() => {
        playlistEl.scrollLeft = scrollLeft
      })
      this.$emit('order-change', info)
    },

    moveSelectedEntityToLeft() {
      const toMoveIndex = this.playingEntityIndex
      const targetIndex = this.previousEntityIndex
      const entityToMove = this.currentEntity
      this.moveSelectedEntity(entityToMove, toMoveIndex, targetIndex)
      const info = {
        before: this.entityList[targetIndex].id,
        after: this.entityList[toMoveIndex].id
      }
      this.$emit('order-change', info)
    },

    moveSelectedEntityToRight() {
      const toMoveIndex = this.playingEntityIndex
      const targetIndex = this.nextEntityIndex
      const entityToMove = this.currentEntity
      this.moveSelectedEntity(entityToMove, toMoveIndex, targetIndex)
      const info = {
        before: this.entityList[toMoveIndex].id,
        after: this.entityList[targetIndex].id
      }
      this.$emit('order-change', info)
    },

    moveSelectedEntity(entityToMove, toMoveIndex, targetIndex) {
      if (!this.currentEntity) return
      if (this.playingEntityIndex >= 0) {
        if (toMoveIndex >= 0 && targetIndex >= 0) {
          this.entityList.splice(toMoveIndex, 1)
          this.entityList.splice(targetIndex, 0, entityToMove)
        }
        this.$nextTick(() => {
          this.playingEntityIndex = targetIndex
          this.scrollToEntity(this.playingEntityIndex)
        })
      }
    },

    resetHeight() {
      this.$nextTick(() => {
        let height = window.innerHeight - 90
        if (!this.tempMode) {
          height = this.container ? this.container.offsetHeight : 0
        }
        height -= this.$refs.header ? this.$refs.header.offsetHeight : 0
        if (this.$refs['button-bar']) {
          height -= this.$refs['button-bar'].offsetHeight
        }
        if (this.$refs['playlisted-entities']) {
          height -= this.$refs['playlisted-entities'].offsetHeight
        }
        if (this.$refs['video-progress']) {
          height -= this.$refs['video-progress'].$el.offsetHeight
        }
        if (this.isWaveformDisplayed) {
          height -= 60
        }
        if (this.$refs['video-container']) {
          this.$refs['video-container'].style.height = `${height}px`
        }
        if (!this.isCommentsHidden) {
          this.$refs['task-info'].$el.style.height = `${height}px`
        }
        if (this.rawPlayer) this.rawPlayer.resetHeight(height)
        if (this.isComparing && this.$refs['raw-player-comparison']) {
          this.$refs['raw-player-comparison'].resetHeight(height)
          if (this.$refs['picture-preview-wrapper']) {
            this.$refs['picture-preview-wrapper'].style.height = `${height}px`
          }
        }
        this.$nextTick(() => {
          this.resetCanvas()
          this.updateProgressBar()
        })
      })
    },

    getComparisonTaskTypeOptions() {
      const taskTypeIds = Object.keys(this.currentEntity.preview_files).filter(
        taskTypeId => {
          return !!this.currentEntity.preview_files[taskTypeId]
        }
      )
      const taskTypeOptions = taskTypeIds
        .map(taskTypeId => {
          return {
            label: this.taskTypeMap.get(taskTypeId).name,
            value: this.taskTypeMap.get(taskTypeId).id
          }
        })
        .sort((a, b) => -a.label.localeCompare(b.label))
      return taskTypeOptions
    },

    isComparisonTaskTypeAvailable() {
      return (
        this.taskTypeOptions.findIndex(taskTypeOption => {
          return taskTypeOption.value === this.savedTaskTypeToCompare
        }) !== -1
      )
    },

    rebuildComparisonOptions() {
      this.comparisonEntityMissing = false
      if (this.entityList.length > 0) {
        this.taskTypeOptions = this.getComparisonTaskTypeOptions()
        if (this.taskTypeOptions.length > 0) {
          if (this.isComparisonTaskTypeAvailable()) {
            this.taskTypeToCompare = this.savedTaskTypeToCompare
          } else {
            // If we couldn't find the current task type,
            // then fallback to the first one in the list.
            this.taskTypeToCompare = this.taskTypeOptions[0].value
            this.comparisonEntityMissing = true
          }
        }
        this.rebuildRevisionOptions()
      } else {
        this.taskTypeOptions = []
        this.revisionOptions = []
      }
    },

    rebuildRevisionOptions() {
      if (
        this.currentEntity &&
        this.currentEntity.preview_files[this.taskTypeToCompare]
      ) {
        const revisions = this.currentEntity.preview_files[
          this.taskTypeToCompare
        ].map(p => p.revision)
        this.revisionOptions = [
          {
            label: 'Last',
            value: null
          }
        ].concat(
          revisions
            .sort((a, b) => b - a)
            .map(revision => {
              return {
                label: `v${revision}`,
                value: `${revision}`
              }
            })
        )
        if (this.revisionOptions.length > 0) {
          this.revisionToCompare = this.revisionOptions[0].value
        }
      } else {
        this.revisionOptions = []
      }
    },

    rebuildEntityListToCompare() {
      if (this.taskTypeToCompare) {
        this.entityListToCompare = this.entityList.map(entity => {
          if (!entity.preview_files || entity.preview_files === {}) {
            return {
              preview_file_id: '',
              preview_file_extension: 'none'
            }
          }
          let previewFiles = entity.preview_files[this.taskTypeToCompare]
          let key = this.taskTypeToCompare
          if (!previewFiles) {
            key = Object.keys(entity.preview_files)[0]
            previewFiles = entity.preview_files[key]
          }
          if (!previewFiles) return null
          let preview = previewFiles.find(
            p => `${p.revision}` === this.revisionToCompare
          )
          if (!preview) {
            preview = entity.preview_files[key][0]
          }
          return {
            preview_file_id: preview.id,
            preview_file_extension: 'mp4'
          }
        })
      } else {
        this.buildEntityListToCompare = []
      }
    },

    resetComparison() {
      this.rebuildRevisionOptions()
      this.$nextTick(() => {
        this.rawPlayerComparison.loadEntity(this.playingEntityIndex)
        this.$nextTick(() => {
          setTimeout(() => {
            this.syncComparisonPlayer()
          }, 100)
          if (this.isPlaying) this.play()
        })
      })
    },

    toggleDlButtons() {
      this.isDlButtonsHidden = !this.isDlButtonsHidden
    },

    onBuildClicked() {
      this.runBuild(false)
    },

    onBuildFullClicked() {
      this.runBuild(true)
    },

    runBuild(full = false) {
      if (
        this.isCurrentUserManager &&
        !this.isJobRunning &&
        !this.isBuildLaunched
      ) {
        this.isBuildLaunched = true
        this.runPlaylistBuild({ playlist: this.playlist, full })
          .then(() => {
            this.isBuildLaunched = false
          })
          .catch(console.error)
      }
    },

    onRemoveBuildJob(job) {
      job.playlist_id = this.playlist.id
      this.removeBuildJob(job)
    },

    showTaskTypeModal() {
      this.modals.taskType = true
    },

    hideTaskTypeModal() {
      this.modals.taskType = false
    },

    confirmChangeTaskType(taskTypeId) {
      this.$emit('task-type-changed', taskTypeId)
      this.modals.taskType = false
    },

    onPreviousPreviewClicked() {
      const index = this.currentPreviewIndex - 1
      this.currentPreviewIndex =
        index < 0 ? this.currentEntityPreviewLength - 1 : index
      this.updateRoomStatus()
    },

    onNextPreviewClicked() {
      const index = this.currentPreviewIndex + 1
      this.currentPreviewIndex =
        index > this.currentEntityPreviewLength - 1 ? 0 : index
      this.updateRoomStatus()
    },

    onPreviousComparisonPictureClicked() {
      const index = this.currentComparisonPreviewIndex - 1
      this.currentComparisonPreviewIndex =
        index < 0 ? this.currentComparisonPreviewLength - 1 : index
      this.updateRoomStatus()
    },

    onNextComparisonPictureClicked() {
      const index = this.currentComparisonPreviewIndex + 1
      this.currentComparisonPreviewIndex =
        index > this.currentComparisonPreviewLength - 1 ? 0 : index
      this.updateRoomStatus()
    },

    onTaskTypeToCompareChanged() {
      this.saveUserComparisonChoice()
      this.rebuildEntityListToCompare()
      this.updateRoomStatus()
    },

    onRevisionToCompareChanged() {
      if (this.isComparing) {
        this.rebuildEntityListToCompare()
        this.updateRoomStatus()
        this.$nextTick(() => {
          this.pause()
          this.rawPlayerComparison.loadEntity(this.playingEntityIndex)
          this.rawPlayerComparison.setCurrentTimeRaw(this.currentTimeRaw)
        })
      }
    },

    onEntitiesWheel(event) {
      const isMouseWheelY = !event.deltaX
      if (isMouseWheelY) {
        event.preventDefault()
        this.$refs['playlisted-entities'].scrollLeft += event.deltaY
      }
    },

    saveUserComparisonChoice() {
      this.savedTaskTypeToCompare = this.taskTypeToCompare
      this.sendUpdatePlayingStatus()
    },

    configureWaveForm() {
      try {
        this.wavesurfer = WaveSurfer.create({
          container: '#waveform',
          waveColor: '#00B242', // green
          progressColor: '#008732', // dark-green,
          height: 60,
          responsive: true,
          fillParent: true,
          minPxPerSec: 1,
          backend: 'MediaElement'
        })
        this.wavesurfer.on('seek', position => {
          this.setCurrentTimeRaw(this.maxDurationRaw * position)
        })
      } catch (err) {
        console.error(err)
      }
    },

    loadWaveForm() {
      if (this.isWaveformDisplayed) {
        this.wavesurfer.load(this.rawPlayer.currentPlayer)
      }
    },

    updateProgressBar() {
      if (this.progress) {
        this.progress.updateProgressBar(this.frameNumber + 1)
      }
    },

    resetHandles(entity) {
      if (this.playlist.for_entity === 'shot') {
        entity = entity || this.currentEntity
        const shot = this.shotMap.get(entity.id)
        this.handleIn = shot.data.handle_in || 0
        this.handleOut = shot.data.handle_out || this.nbFrames
      }
    }
  },

  watch: {
    currentPreviewIndex() {
      this.endAnnotationSaving()
      this.resetUndoStacks()
      this.$nextTick(() => {
        if (this.isCurrentPreviewPicture) {
          this.resetPictureCanvas()
        } else {
          this.resetCanvas()
        }
      })
      this.movieDimensions = {
        width: this.currentPreview.width,
        height: this.currentPreview.height
      }
    },

    playingEntityIndex() {
      this.endAnnotationSaving()
      this.updateTaskPanel()
      this.resetUndoStacks()
      this.currentPreviewIndex = 0
      this.currentComparisonPreviewIndex = 0
      if (this.isCurrentPreviewMovie) {
        this.$nextTick(() => {
          this.loadWaveForm()
          if (this.isPlaying) this.play()
        })
      }
      if (this.currentEntity) {
        this.annotations = this.currentEntity.preview_file_annotations || []
        this.movieDimensions = {
          width: this.currentPreview.width,
          height: this.currentPreview.height
        }
      }
      this.$nextTick(() => {
        if (this.isComparing) {
          this.rebuildComparisonOptions()
          this.rebuildRevisionOptions()
        }
        this.$nextTick(() => {
          if (this.isCurrentPreviewPicture) {
            this.resetPictureCanvas()
          } else {
            this.resetCanvas()
          }
        })
      })
    },

    isComparing() {
      if (this.isComparing) {
        this.pause()
        this.resetComparison()
        this.rebuildEntityListToCompare()
      }
      this.$nextTick().then(() => {
        this.resetPictureCanvas()
        this.resetCanvas()
        this.syncComparisonPlayer()
        this.reloadAnnotations()
      })
    },

    taskTypeToCompare() {
      if (this.isComparing) {
        this.resetComparison()
      }
    },

    revisionToCompare() {},

    entities() {
      this.currentPreviewIndex = 0
      this.currentComparisonPreviewuIndex = 0
      this.entityList = Object.values(this.entities)
      this.entityList.forEach((entity, i) => {
        this.framesPerImage[i] =
          entity.preview_nb_frames || DEFAULT_NB_FRAMES_PICTURE
      })
      this.playingEntityIndex = 0
      this.pause()
      if (this.rawPlayer) this.rawPlayer.setCurrentFrame(1)
      this.currentTimeRaw = 0
      this.updateProgressBar()
      this.updateTaskPanel()
      this.rebuildComparisonOptions()
      this.clearCanvas()
      this.annotations = []
      this.movieDimensions = {
        width: 0,
        height: 0
      }
      this.isComparing = false
      if (this.entityList.length === 0) {
        this.clearPlayer()
      }
      this.resetHeight()
      this.resetCanvas().then(() => {
        if (this.isCurrentPreview) {
          this.resetHandles()
          this.movieDimensions = {
            width: this.currentPreview.width,
            height: this.currentPreview.height
          }
          this.annotations = this.currentEntity.preview_file_annotations
          this.loadAnnotation(this.getAnnotation(0))
        }
      })
    },

    playlist() {
      this.endAnnotationSaving()
      this.forClient = Boolean(this.playlist.for_client).toString()
      this.$nextTick(() => {
        this.updateProgressBar()
        this.clearCanvas()
        this.$nextTick(() => {
          if (this.currentPreview) {
            this.movieDimensions = {
              width: this.currentPreview.width,
              height: this.currentPreview.height
            }
          }
        })
      })
    },

    isAddingEntity() {
      this.$nextTick(() => {
        this.updateProgressBar()
      })
    },

    isComparisonOverlay() {
      this.$nextTick(() => {
        this.resetCanvas().then(this.reloadCurrentAnnotation)
      })
    },

    isWaveformDisplayed() {
      if (this.isWaveformDisplayed) {
        this.resetHeight()
        this.loadWaveForm()
      }
    },

    isLaserModeOn() {
      this.updateRoomStatus()
    }
  },

  socket: {
    events: {
      ...previewRoomMixin.socket.events,
      ...playerMixin.socket.events

      // TODO (?) :
      // - handle updating the playlist order, adding/removing items
      // - sync number of frames per image
    }
  }
}
</script>

<style lang="scss" scoped>
.full-height {
  height: 100%;
}

.playlist-header {
  color: $white-grey;
  background: $dark-grey-light;

  .playlist-name {
    font-size: 1.5em;
    padding: 10px 0 10px 1em;
  }

  .edit-button,
  .delete-button {
    height: 50px;
    width: 50px;
  }
}

.playlist-player {
  background: $dark-grey;
  display: flex;
  flex-direction: column;

  .playlist-button {
    margin: 0;
    background: none;
    border: 0;
    border-radius: 0;
    color: var(--text);

    &:hover {
      background: var(--background-tag-button);
    }

    &.active {
      color: $green;
    }

    &.topbar-button {
      border: 1px solid var(--border);
      border-radius: 10px;
      margin-right: 0.5em;

      &.active {
        color: $light-green;
      }
    }
  }
}

.playlisted-entities,
.playlist-footer {
  background: $dark-grey-light;
  color: $white-grey;
}

.playlist-footer {
  width: 100%;
  min-height: 32px;
  padding-right: 5px;
}

.playlisted-entities {
  border-top: 1px solid $dark-grey-strong;
  padding: 0.4em 0em 0 0.4em;
  overflow-x: auto;
  min-height: 600px;
  align-items: flex-start;
  height: 240px;
  min-height: 240px;
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

.time-indicator {
  color: $light-grey;
  padding-left: 0.8em;
  margin-right: 0;
}

.video-container {
  position: relative;
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

.comparison-combobox {
  margin-bottom: 0;
}

.buttons .comparison-button {
  margin-left: 1em;
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

.playlist-header,
.video-progress {
  transition: opacity 0.5s ease;
}

.comparison-list,
.comparison-list p,
.comparison-list select {
  font-size: 0.8em;
}
.comparison-list select {
  height: 2.2em;
}
.comparison-missing {
  padding: 6px 10px;
  border: 1px solid $dark-grey;
  border-radius: 5px;
  background-color: $dark-grey-light;
  font-weight: bold;
  width: max-content;
}

.dl-button {
  background: $dark-grey;
  border: 1px solid $dark-grey;
  color: $white;
  display: inline-block;
  width: 190px;
  padding: 8px;
  cursor: pointer;

  &:hover {
    background: $dark-grey-light;
  }
}

.build-options {
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  background: $dark-grey;
  border: 1px solid $dark-grey-light;
  position: absolute;
  width: 190px;
  left: -120px;
  top: -280px;
  height: 160px;
  z-index: 300;
}

.build-list {
  background: $dark-grey-stronger;
  border: 1px solid $dark-grey-light;
  position: absolute;
  width: 190px;
  left: -120px;
  top: -121px;
  height: 120px;
  overflow-y: auto;
  padding: 8px;
  z-index: 300;
}

.build-title {
  margin-bottom: 0.5em;
}

.delete-job-button {
  background: transparent;
  border-radius: 50%;
  color: $light-grey-light;
  cursor: pointer;
  padding: 3px;

  &:hover {
    background: $dark-grey-light;
  }
}

.build-spinner {
  width: 15px;
  max-width: 15px;
  margin-top: 5px;
  margin-right: 5px;
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

#playlist-annotation-canvas {
  margin: auto;
}

.playlisted-wrapper {
  margin-right: 0;
}

.picture-preview-wrapper {
  display: flex;
  height: inherit;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.picture-preview-comparison-wrapper {
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

.playlist-player a.playlist-button {
  padding-top: 3px;
  svg {
    width: 18px;
  }
}

.comparison-buttons {
  position: relative;
}

.comparison-index {
  min-width: 30px;
  margin: 0;
}

.disabled {
  color: $grey;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  /* display: none; <- Crashes Chrome on hover */
  -webkit-appearance: none;
  margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
}

input[type='number'] {
  -moz-appearance: textfield; /* Firefox */
}

.frame-per-image-input {
  padding: 2px;
  margin-left: 3px;
  background-color: $dark-grey-2;
  border: 1px solid $dark-grey-stronger;
  color: white;
  width: 3rem;
}

#resize-annotation-canvas,
#annotation-snapshot {
  display: none;
}

@media only screen and (min-width: 1600px) {
  .comparison-combos {
    top: -1px;
    left: 33px;
  }
}
</style>
