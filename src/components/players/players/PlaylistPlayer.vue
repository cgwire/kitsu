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
        {{ playlist.name || '&nbsp;' }}
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
        icon="back"
        :title="$t('playlists.actions.previous_shot')"
        @click="onPlayPreviousEntityClicked"
        v-if="!isFullMode"
      />
      <button-simple
        class="playlist-button flexrow-item"
        icon="forward"
        :title="$t('playlists.actions.next_shot')"
        @click="onPlayNextEntityClicked"
        v-if="!isFullMode"
      />

      <div class="filler"></div>
      <button-simple
        class="playlist-button topbar-button flexrow-item"
        :text="$t('playlists.actions.exit_play_full')"
        :title="$t('playlists.actions.exit_play_full')"
        @click="isFullMode = false"
        v-if="isFullMode"
      />

      <preview-room
        :room="room"
        @open-room="openRoom"
        @join-room="joinRoom"
        @leave-room="leaveRoom"
        v-if="isValidRoomId(playlist) && !isFullMode"
      />
      <button-simple
        class="playlist-button topbar-button flexrow-item full-button"
        icon="bell"
        :text="$t('playlists.notify_clients')"
        @click="onNotifyClientsClicked"
        v-if="!isLoading && isCurrentUserManager && playlist.for_client"
      />
      <button-simple
        class="playlist-button topbar-button flexrow-item full-button"
        :class="{ 'has-active-links': hasActiveShareLinks }"
        icon="link"
        :text="$t('playlists.share')"
        @click="modals.share = true"
        v-if="!isLoading && isCurrentUserManager"
      />

      <template v-if="isAllowToEdit">
        <button-simple
          class="playlist-button topbar-button flexrow-item full-button"
          icon="plus"
          :text="addEntitiesText"
          @click="$emit('show-add-entities')"
          :active="isAddingEntity || isFullMode"
          v-if="!isLoading"
        />
        <button-simple
          @click="$emit('edit-clicked')"
          class="edit-button playlist-button flexrow-item"
          :title="$t('playlists.actions.edit')"
          icon="edit"
        />
        <button-simple
          @click="showDeleteModal"
          class="delete-button playlist-button flexrow-item"
          :title="$t('playlists.actions.delete')"
          icon="trash"
        />
      </template>
    </div>

    <div class="flexrow filler" v-show="!isAddingEntity || isLoading">
      <div
        :class="{
          filler: true,
          flexrow: true,
          'video-container': true,
          'flexrow-reverse': !isComparisonOverlay
        }"
        :style="{ cursor: annotationCursor || null }"
        ref="video-container"
      >
        <video
          ref="full-playlist-player"
          class="raw-player"
          :style="{
            position: isComparisonOverlay ? 'absolute' : 'relative'
          }"
          v-show="isFullMode"
        />

        <multi-video-viewer
          ref="raw-player-comparison"
          class="raw-player"
          name="comparison"
          :style="{
            position: isComparisonOverlay ? 'absolute' : 'relative'
          }"
          :entities="entityListToCompare"
          :full-screen="fullScreen"
          :is-hd="isHd"
          :is-repeating="isRepeating"
          :muted="true"
          :panzoom="true"
          :handle-in="
            ['shot', 'edit', 'episode'].includes(playlist.for_entity)
              ? handleIn
              : -1
          "
          :handle-out="
            ['shot', 'edit', 'episode'].includes(playlist.for_entity)
              ? handleOut
              : -1
          "
          @metadata-loaded="updateComparisonAnchor"
          v-show="
            isComparing &&
            isCurrentPreviewMovie &&
            isMovieComparison &&
            !isFullMode &&
            !isLoading
          "
        />

        <div
          ref="comparison-content-anchor"
          class="comparison-content-anchor"
          v-show="
            isComparing &&
            isCurrentPreviewMovie &&
            isMovieComparison &&
            !isComparisonOverlay &&
            !isFullMode &&
            !isLoading
          "
        />

        <annotation-canvas
          ref="comparison-annotation-canvas"
          canvas-id="playlist-annotation-canvas-comparison"
          :media-element="comparisonContentAnchorEl"
          :panzoom-transform="panzoomTransform"
          :interactive="false"
          :static="true"
          @resized="onComparisonCanvasResized"
          v-show="
            isAnnotationsDisplayed &&
            isComparing &&
            isCurrentPreviewMovie &&
            isMovieComparison &&
            currentRevisionToCompare &&
            !isComparisonOverlay &&
            !isFullMode &&
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
          <picture-viewer
            ref="picture-player-comparison"
            class="picture-preview"
            :big="true"
            :default-height="pictureDefaultHeight"
            :full-screen="fullScreen"
            :light="false"
            :margin-bottom="0"
            :panzoom="true"
            :preview="currentPreviewToCompare"
            :is-comparing="isComparing"
            @panzoom-changed="onComparisonPanZoomChanged"
            @loaded="onPictureLoaded"
            high-quality
            v-show="isComparing && isPictureComparison"
          />

          <video
            ref="picture-video-player-comparison"
            class="picture-preview"
            :src="currentComparisonPreviewPath"
            @panzoom-changed="onComparisonPanZoomChanged"
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

        <multi-video-viewer
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
          :panzoom="true"
          @entity-change="onPlayerPlayingEntityChange"
          @frame-update="onRawPlayerFrameUpdate"
          @max-duration-update="onMaxDurationUpdate"
          @metadata-loaded="onMetadataLoaded"
          @panzoom-changed="onPanZoomChanged"
          @play-next="onPlayNext"
          @repeat="onVideoRepeated"
          @video-loaded="onVideoLoaded"
          v-show="isCurrentPreviewMovie && !isFullMode && !isLoading"
        />

        <object-viewer
          ref="object-player"
          class="object-player"
          :background-url="backgroundUrl"
          :full-screen="fullScreen"
          :is-environment-skybox="isEnvironmentSkybox"
          :is-wireframe="isWireframe"
          :preview-url="isCurrentPreviewModel ? currentPreviewDlPath : null"
          :style="{
            position: isComparisonOverlay ? 'absolute' : 'static',
            opacity: overlayOpacity
          }"
          @model-loaded="onModelLoaded"
          v-show="isCurrentPreviewModel && !isLoading"
        />

        <sound-viewer
          ref="sound-player"
          class="sound-player"
          :preview-url="currentPreviewDlPath"
          :full-screen="fullScreen"
          @play-ended="pause"
          v-if="isCurrentPreviewSound && !isLoading"
        />

        <pdf-viewer
          ref="pdf-player"
          :preview="currentPreview"
          :default-height="pictureDefaultHeight"
          v-if="isCurrentPreviewPdf && !isLoading"
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
            right: 0,
            'z-index': 1
          }"
          v-show="isCurrentPreviewPicture && !isLoading"
        >
          <multi-picture-viewer
            ref="picture-player"
            :default-height="pictureDefaultHeight"
            :full-screen="fullScreen"
            :light="false"
            :margin-bottom="0"
            :panzoom="true"
            :current-preview="{
              ...currentPreview,
              position: currentPreviewIndex + 1
            }"
            :previews="picturePreviews"
            @loaded="onPictureLoaded"
            @panzoom-changed="onPanZoomChanged"
            high-quality
          />
        </div>

        <div class="loading-wrapper" v-if="isLoading">
          <spinner />
        </div>

        <div
          ref="main-content-anchor"
          class="main-content-anchor"
          v-show="!isCurrentPreviewFile && !isCurrentPreviewModel && !isLoading"
        />

        <annotation-canvas
          ref="main-annotation-canvas"
          canvas-id="playlist-annotation-canvas"
          :cursor="annotationCursor"
          :media-element="mainContentAnchorEl"
          :panzoom-transform="panzoomTransform"
          :interactive="isOverlayInteractive"
          :wheel-target="mainMediaElement"
          @click="onCanvasClicked"
          @resized="onMainCanvasResized"
          v-show="
            !isCurrentPreviewFile &&
            isAnnotationsDisplayed &&
            !isCurrentPreviewModel
          "
        />
      </div>

      <task-info
        ref="task-info"
        class="flexrow-item task-info-column"
        :current-frame="parseInt(currentFrame) - 1"
        :current-parent-preview="currentPreview"
        :fps="fps"
        :extendable="false"
        :in-playlist="true"
        :is-preview="false"
        :silent="isCommentsHidden"
        :task="task"
        :player="playerProxy"
        :show-assignees="isCurrentUserManager || isCurrentUserSupervisor"
        @comment-added="onCommentAdded"
        @time-code-clicked="onTimeCodeClicked"
        v-show="!isCommentsHidden"
      />
    </div>

    <video-progress
      ref="video-progress"
      class="video-progress pull-bottom"
      :annotations="annotations"
      :comparison-annotations="comparisonAnnotations"
      :empty="!isCurrentPreviewMovie"
      :frame-duration="frameDuration"
      :is-full-mode="isFullMode"
      :is-full-screen="fullScreen || isEntitiesHidden"
      :movie-dimensions="movieDimensions"
      :nb-frames="
        isCurrentPreviewMovie
          ? nbFrames
          : isCurrentPreviewPicture && currentEntity.preview_nb_frames
            ? currentEntity.preview_nb_frames
            : Math.round(2 * fps)
      "
      :handle-in="playlist.for_entity === 'shot' ? handleIn : -1"
      :handle-out="playlist.for_entity === 'shot' ? handleOut : -1"
      :preview-id="currentPreview ? currentPreview.id : ''"
      @start-scrub="onScrubStart"
      @end-scrub="onScrubEnd"
      @progress-changed="onProgressChanged"
      @handle-in-changed="onHandleInChanged"
      @handle-out-changed="onHandleOutChanged"
      v-show="playlist.id && !isAddingEntity"
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
      ref="button-bar"
      class="playlist-footer flexrow"
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

      <player-playback-bar
        :available-3-d-animations="objectModel.availableAnimations"
        :compact="isFullMode"
        :current-frame-label="currentFrame"
        :current-time="currentTime"
        :full-screen="fullScreen"
        :is-3-d-animation="objectModel.isAnimation"
        :is-3-d-model="isCurrentPreviewModel"
        :is-movie="isCurrentPreviewMovie"
        :is-picture="isCurrentPreviewPicture"
        :is-playing="isPlaying"
        :is-repeating="isRepeating"
        :is-sound="isCurrentPreviewSound"
        :max-duration="maxDuration"
        :nb-frames="nbFrames"
        v-model:current-3-d-animation="objectModel.currentAnimation"
        v-model:is-hd="isHd"
        v-model:is-muted="isMuted"
        v-model:is-show-annotations-while-playing="
          isShowAnnotationsWhilePlaying
        "
        v-model:is-waveform-displayed="isWaveformDisplayed"
        v-model:speed="speed"
        v-model:volume="volume"
        @play-pause-clicked="onPlayPauseClicked"
        @repeat-clicked="onRepeatClicked"
        @toggle-sound-clicked="onToggleSoundClicked"
      >
        <template #extra-controls>
          <div
            class="separator"
            v-if="isCurrentPreviewPicture || currentEntityPreviewLength > 1"
          ></div>

          <div
            class="flexrow-item"
            :title="$t('playlists.actions.frame_number')"
            v-if="isCurrentPreviewPicture"
          >
            {{ (framesSeenOfPicture + '').padStart(2, '0') }} /
            {{
              currentEntity.preview_nb_frames
                ? currentEntity.preview_nb_frames
                : Math.round(2 * fps)
            }}
          </div>

          <div
            class="flexrow flexrow-item"
            :class="{ mr0: isCurrentPreviewPicture }"
            v-if="currentEntityPreviewLength > 1"
          >
            <button-simple
              class="button playlist-button flexrow-item"
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
            <div class="separator" v-if="!isCurrentPreviewPicture"></div>
          </div>

          <div class="separator" v-if="!isFullMode"></div>
          <button-simple
            class="playlist-button flexrow-item"
            :title="$t('playlists.actions.change_task_type')"
            icon="check"
            @click="showTaskTypeModal"
            v-if="!tempMode && !isFullMode"
          />
        </template>
      </player-playback-bar>
      <div
        class="flexrow flexrow-item comparison-buttons"
        v-if="(isCurrentPreviewMovie || isCurrentPreviewPicture) && !isFullMode"
      >
        <player-comparison-bar
          :comparison-mode-options="comparisonModeOptions"
          :comparison-preview-index="currentComparisonPreviewIndex"
          :comparison-preview-length="currentComparisonPreviewLength"
          :is-comparing="isComparing"
          :is-comparison-enabled="true"
          :is-movie="isCurrentPreviewMovie"
          :is-sound="isCurrentPreviewSound"
          :preview-file-options="revisionOptions"
          :task-type-options="taskTypeOptions"
          v-model:comparison-mode="comparisonMode"
          v-model:preview-to-compare-id="revisionToCompare"
          v-model:task-type-id="taskTypeToCompare"
          @compare-clicked="onCompareClicked"
          @previous-comparison-clicked="onPreviousComparisonPictureClicked"
          @next-comparison-clicked="onNextComparisonPictureClicked"
        >
          <template #missing>
            <div
              class="flexrow flexrow-item comparison-missing"
              v-if="isComparing && comparisonEntityMissing"
            >
              ⚠️ {{ $t('playlists.comparing_missing_plan') }}
            </div>
          </template>
        </player-comparison-bar>
      </div>

      <span class="filler"></span>

      <template
        v-if="(isCurrentUserManager || isCurrentUserSupervisor) && tempMode"
      >
        <div class="separator"></div>
        <button-simple
          @click="$emit('save-clicked')"
          class="playlist-button flexrow-item"
          :title="$t('playlists.actions.save_playlist')"
          icon="save"
        />
      </template>

      <player-annotation-bar
        v-if="!isFullMode"
        :background-options="backgroundOptions"
        :full-screen="fullScreen"
        :is-3-d-model="isCurrentPreviewModel"
        :is-annotations-displayed="isAnnotationsDisplayed"
        :is-comments-hidden="isCommentsHidden"
        :is-concept="false"
        :is-drawing="isDrawing"
        :is-movie="isCurrentPreviewMovie"
        :is-object-background="isObjectBackground"
        :is-picture="isCurrentPreviewPicture"
        :is-typing="isTyping"
        :is-zoom-pan="false"
        :object-background-url="objectBackgroundUrl"
        :pencil-color="pencilColor"
        :pencil-palette="pencilPalette"
        :pencil-width="pencilWidth"
        :production-backgrounds="productionBackgrounds"
        :read-only="isCurrentUserArtist"
        :show-comments-button="true"
        :text-color="textColor"
        v-model:current-background="currentBackground"
        v-model:current-shape="currentShape"
        v-model:is-environment-skybox="isEnvironmentSkybox"
        v-model:is-laser-mode-on="isLaserModeOn"
        v-model:is-shape-mode="isShapeMode"
        v-model:is-wireframe="isWireframe"
        @annotation-displayed-clicked="
          isAnnotationsDisplayed = !isAnnotationsDisplayed
        "
        @change-pencil-color="onChangePencilColor"
        @change-pencil-width="onChangePencilWidth"
        @change-shape="setShapeTool"
        @change-text-color="onChangeTextColor"
        @comment-clicked="onCommentClicked"
        @delete-clicked="onDeleteClicked"
        @object-background-selected="onObjectBackgroundSelected"
        @pencil-annotate-clicked="onAnnotateClicked"
        @redo="redoLastAction"
        @shape-mode-clicked="onShapeModeClicked"
        @type-clicked="onTypeClicked"
        @undo="undoLastAction"
        @zoom-pan-clicked="onResetZoomClicked"
      />
      <button-simple
        class="playlist-button flexrow-item"
        :title="$t('playlists.actions.entity_list')"
        :active="!isEntitiesHidden"
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
              disabled:
                !(isCurrentUserManager || isCurrentUserSupervisor) ||
                isJobRunning,
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
              disabled:
                !(isCurrentUserManager || isCurrentUserSupervisor) ||
                isJobRunning,
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
              <template v-else>
                <button
                  class="job-button mr05"
                  v-if="!joinedRoom"
                  @click="playBuild(job)"
                >
                  <play-icon :size="12" />
                </button>
                <a class="flexrow-item" :href="getBuildPath(job)">
                  {{ formatDate(job.created_at) }}
                </a>
              </template>
              <span class="filler"></span>
              <button class="job-button" @click="onRemoveBuildJob(job)">
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

    <playlist-progress
      ref="playlist-progress"
      class="video-progress pull-bottom"
      :entity-list="entityList"
      :fps="fps"
      :frame-duration="frameDuration"
      :is-full-mode="isFullMode"
      :is-full-screen="fullScreen || isEntitiesHidden"
      :nb-frames="isCurrentPreviewMovie ? nbFrames : 0"
      :playlist-duration="playlistDuration"
      :playlist-progress="playlistProgress"
      :playlist-shot-position="playlistShotPosition"
      @start-scrub="onScrubStart"
      @end-scrub="onScrubEnd"
      @progress-playlist-changed="onProgressPlaylistChanged"
      v-show="playlist.id && !isAddingEntity"
    />

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
      <template v-else>
        <div
          class="flexrow-item has-text-centered playlisted-wrapper"
          :key="entity.id"
          v-for="(entity, index) in entityList"
        >
          <playlisted-entity
            :ref="'entity-' + index"
            :entity="entity"
            :index="index"
            :is-playing="playingEntityIndex === index"
            draggable="true"
            @dragstart="onEntityDragStart($event, entity)"
            @entity-to-add="$emit('entity-to-add', $event)"
            @entity-dropped="onEntityDropped"
            @play-click="entityListClicked"
            @preview-changed="onPreviewChanged"
            @remove-entity="removeEntity"
          />
        </div>
      </template>
    </div>

    <notify-client-modal
      active
      :is-loading="loading.notifyClients"
      :is-error="errors.notifyClients"
      :is-success="success.notifyClients"
      @confirm="confirmNotifyClients"
      @cancel="modals.notifyClients = false"
      v-if="modals.notifyClients"
    />

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

    <share-playlist-modal
      :active="modals.share"
      :playlist="playlist"
      @cancel="modals.share = false"
      @links-updated="onShareLinksUpdated"
      v-if="modals.share"
    />

    <!-- used only for picture saving purpose, it is not displayed -->
    <canvas id="annotation-snapshot" ref="annotation-snapshot"> </canvas>
    <canvas id="resize-annotation-canvas" ref="resize-annotation-canvas">
    </canvas>
    <!-- end -->
  </div>
</template>

<script setup>
/*
 * This modules manages all the options available while playing a playlist.
 * It is made to work with a single playlist.
 */
import { PSBrush } from 'fabricjs-psbrush'
import { ArrowUpRightIcon, DownloadIcon, PlayIcon } from 'lucide-vue-next'
import moment from 'moment-timezone'
import { v4 as uuidv4 } from 'uuid'
import {
  computed,
  defineAsyncComponent,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import WaveSurfer from 'wavesurfer.js'

import { useFullScreen } from '@/composables/fullScreen'
import { useAnnotation } from '@/composables/players/annotation'
import { useAnnotationBroadcast } from '@/composables/players/annotationBroadcast'
import { useAnnotationCursor } from '@/composables/players/annotationCursor'
import { usePlaylistComparison } from '@/composables/players/playlistComparison'
import { usePreviewShortcuts } from '@/composables/players/previewShortcuts'
import { usePreviewRoom } from '@/composables/previewRoom'
import preferences from '@/lib/preferences'
import {
  buildAnnotationSnapshotFilename,
  isModelPreview,
  isMoviePreview,
  isPdfPreview,
  isPicturePreview,
  isSoundPreview
} from '@/lib/preview'
import {
  ceilToFrame,
  floorToFrame,
  formatFrame,
  formatTime,
  roundToFrame
} from '@/lib/video'

import DeleteModal from '@/components/modals/DeleteModal.vue'
import NotifyClientModal from '@/components/modals/NotifyClientModal.vue'
import SelectTaskTypeModal from '@/components/modals/SelectTaskTypeModal.vue'
import SharePlaylistModal from '@/components/modals/SharePlaylistModal.vue'

import AnnotationCanvas from '@/components/players/annotations/AnnotationCanvas.vue'
import PlayerAnnotationBar from '@/components/players/bars/PlayerAnnotationBar.vue'
import PlayerComparisonBar from '@/components/players/bars/PlayerComparisonBar.vue'
import PlayerPlaybackBar from '@/components/players/bars/PlayerPlaybackBar.vue'
import PlaylistedEntity from '@/components/players/players/PlaylistedEntity.vue'
// eslint-disable-next-line no-unused-vars -- shadowed by setPlaylistProgress / playlistProgressRef in script
import PlaylistProgress from '@/components/players/progress/PlaylistProgress.vue'
import VideoProgress from '@/components/players/progress/VideoProgress.vue'
import MultiPictureViewer from '@/components/players/viewers/MultiPictureViewer.vue'
import MultiVideoViewer from '@/components/players/viewers/MultiVideoViewer.vue'
import ObjectViewer from '@/components/players/viewers/ObjectViewer.vue'
import PdfViewer from '@/components/players/viewers/PdfViewer.vue'
import PictureViewer from '@/components/players/viewers/PictureViewer.vue'
import SoundViewer from '@/components/players/viewers/SoundViewer.vue'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
// eslint-disable-next-line no-unused-vars -- shadowed by const previewRoom in script
import PreviewRoom from '@/components/widgets/PreviewRoom.vue'
import Spinner from '@/components/widgets/Spinner.vue'

// eslint-disable-next-line no-unused-vars
const TaskInfo = defineAsyncComponent(
  () => import('@/components/sides/TaskInfo.vue')
)

const FRAME_DELAY = 100
const RESIZE_DELAY = 300

const store = useStore()
const { t } = useI18n()
const instance = getCurrentInstance()
const $socket = instance.appContext.config.globalProperties.$socket

// Props

const props = defineProps({
  currentEntityType: {
    type: String,
    default: 'shot'
  },
  entities: {
    type: Array,
    default: () => []
  },
  initialShareLinksCount: {
    type: Number,
    default: 0
  },
  isAddingEntity: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  playlist: {
    type: Object,
    default: () => ({})
  },
  tempMode: {
    type: Boolean,
    default: false
  }
})

// Emits

const emit = defineEmits([
  'edit-clicked',
  'entity-to-add',
  'new-entity-dropped',
  'order-change',
  'playlist-deleted',
  'preview-changed',
  'remove-entity',
  'save-clicked',
  'show-add-entities',
  'task-type-changed'
])

// State

// — Template refs
const container = useTemplateRef('container')
const header = useTemplateRef('header')
const buttonBar = useTemplateRef('button-bar')
const videoContainer = useTemplateRef('video-container')
const mainAnnotationCanvas = useTemplateRef('main-annotation-canvas')
const mainContentAnchor = useTemplateRef('main-content-anchor')
// canvasWrapper points to the AnnotationCanvas's overlay div so the
// composable's legacy paths (addText, showCanvas) keep working with the
// new component-based API.
const canvasWrapper = computed(() => mainAnnotationCanvas.value?.overlay)
const fullPlaylistPlayer = useTemplateRef('full-playlist-player')
const rawPlayer = useTemplateRef('raw-player')
const rawPlayerComparison = useTemplateRef('raw-player-comparison')
const picturePlayer = useTemplateRef('picture-player')
const picturePlayerComparison = useTemplateRef('picture-player-comparison')
const soundPlayer = useTemplateRef('sound-player')
const modelPlayer = useTemplateRef('object-player')
const progress = useTemplateRef('video-progress')
const playlistProgressRef = useTemplateRef('playlist-progress')
const playlistedEntities = useTemplateRef('playlisted-entities')
const taskInfoRef = useTemplateRef('task-info')
const comparisonAnnotationCanvas = useTemplateRef(
  'comparison-annotation-canvas'
)
const comparisonContentAnchor = useTemplateRef('comparison-content-anchor')

// — Non-reactive (instance state)
let isMounted = false
let scrubbing = false
let scrubStartX = 0
let isRoomSilent = false
let silentMode = false
let isWaveformSeekingSilent = false
let fullPlayingPath = ''
let playLoop = null
let lastResizeCall = 0
let playingPictureTimeout = null
let autoHideTimer = null
let wavesurfer = null

// — Reactive
const annotations = ref([])
const entityList = ref([])
const framesPerImage = ref([])
const framesSeenOfPicture = ref(1)

const currentBackground = ref(null)
const currentPreviewIndex = ref(0)
const currentTime = ref('00:00.000')
const currentTimeRaw = ref(0)
const handleIn = ref(0)
const handleOut = ref(0)
const hasActiveShareLinks = ref(false)
const isAnnotationsDisplayed = ref(true)
const isBuildLaunched = ref(false)
const isCommentsHidden = ref(true)
const isDlButtonsHidden = ref(true)
const isDrawing = ref(false)
const isEntitiesHidden = ref(false)
const isEnvironmentSkybox = ref(false)
const isFullMode = ref(false)
const isHd = ref(false)
const isLaserModeOn = ref(false)
const isMuted = ref(false)
const isObjectBackground = ref(false)
const isPlaying = ref(false)
const isRepeating = ref(false)
const isShowAnnotationsWhilePlaying = ref(false)
const isTyping = ref(false)
const isWaveformDisplayed = ref(false)
const isWireframe = ref(false)
const maxDuration = ref('00:00.000')
const maxDurationRaw = ref(0)
const movieDimensions = ref({ width: 0, height: 0 })
const objectBackgroundUrl = ref(null)
const objectModel = ref({
  availableAnimations: [],
  currentAnimation: null,
  isAnimation: null
})
const onNextTimeUpdateActions = ref([])
const pencilPalette = ref(['huge', 'big', 'medium', 'small', 'tiny'])
const pictureDefaultHeight = ref(0)
const playingEntityIndex = ref(0)
const playlistDuration = ref(0)
const playlistProgress = ref(0)
const playlistShotPosition = ref({})
const room = ref({
  people: [],
  newComer: true
})
const speed = ref(3)
const volume = ref(50)

const modals = ref({
  delete: false,
  notifyClients: false,
  share: false,
  taskType: false
})
const loading = ref({
  deletePlaylist: false,
  notifyClients: false
})
const errors = ref({
  deletePlaylist: false,
  notifyClients: false,
  playlists: false
})
const success = ref({
  notifyClients: false
})

// Vuex getters

const currentProduction = computed(() => store.getters.currentProduction)
const editMap = computed(() => store.getters.editMap)
const episodeMap = computed(() => store.getters.episodeMap)
const isCurrentUserArtist = computed(() => store.getters.isCurrentUserArtist)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
const isCurrentUserManager = computed(() => store.getters.isCurrentUserManager)
const isCurrentUserSupervisor = computed(
  () => store.getters.isCurrentUserSupervisor
)
const organisation = computed(() => store.getters.organisation)
const personMap = computed(() => store.getters.personMap)
const previewFileMap = computed(() => store.getters.previewFileMap)
const productionAssetTaskTypes = computed(
  () => store.getters.productionAssetTaskTypes
)
const productionBackgrounds = computed(
  () => store.getters.productionBackgrounds
)
const productionEditTaskTypes = computed(
  () => store.getters.productionEditTaskTypes
)
const productionEpisodeTaskTypes = computed(
  () => store.getters.productionEpisodeTaskTypes
)
const productionSequenceTaskTypes = computed(
  () => store.getters.productionSequenceTaskTypes
)
const productionShotTaskTypes = computed(
  () => store.getters.productionShotTaskTypes
)
const shotMap = computed(() => store.getters.shotMap)
const taskMap = computed(() => store.getters.taskMap)
const taskStatusMap = computed(() => store.getters.taskStatusMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)
const user = computed(() => store.getters.user)
const userId = computed(() => store.getters.user?.id)

// Computed — file type helpers

const extension = computed(() => currentPreview.value?.extension || '')
const isCurrentPreviewMovie = computed(() => isMoviePreview(extension.value))
const isCurrentPreviewPicture = computed(() =>
  isPicturePreview(extension.value)
)
const isCurrentPreviewModel = computed(() => isModelPreview(extension.value))
const isCurrentPreviewSound = computed(() => isSoundPreview(extension.value))
const isCurrentPreviewPdf = computed(() => isPdfPreview(extension.value))
const isCurrentPreviewFile = computed(
  () =>
    !isCurrentPreviewMovie.value &&
    !isCurrentPreviewPicture.value &&
    !isCurrentPreviewSound.value &&
    !isCurrentPreviewModel.value &&
    !isCurrentPreviewPdf.value
)

// Computed — entity & preview state

const currentEntity = computed(() => entityList.value[playingEntityIndex.value])

// Derived from currentEntity + the store's taskMap so the right panel
// fills in as soon as both are available, no matter the order in
// which they arrive (entity-list watcher / mount / async task fetch).
// Replaces the previous imperative updateTaskPanel() calls — on
// Firefox those callers were racing the taskMap fetch and leaving
// the TaskInfo panel stuck on "no task selected".
const task = computed(() => {
  const entity = currentEntity.value
  if (!entity) return null
  return taskMap.value.get(entity.preview_file_task_id) || null
})

const currentPreview = computed(() => {
  const entity = currentEntity.value
  if (!entity) return null
  if (currentPreviewIndex.value === 0) {
    return {
      id: entity.preview_file_id,
      extension: entity.preview_file_extension,
      task_id: entity.preview_file_task_id,
      revision: entity.preview_file_revision,
      width: entity.preview_file_width,
      height: entity.preview_file_height,
      annotations: entity.preview_file_annotations || [],
      duration: entity.preview_file_duration || 0
    }
  }
  return entity.preview_file_previews?.[currentPreviewIndex.value - 1]
})

const currentEntityPreviewLength = computed(() => {
  const entity = currentEntity.value
  if (!entity || !entity.preview_file_previews) return 0
  return entity.preview_file_previews.length + 1
})

const previousEntityIndex = computed(() => {
  let index = playingEntityIndex.value - 1
  if (index < 0) index = entityList.value.length - 1
  return index
})

const nextEntityIndex = computed(() => {
  let index = playingEntityIndex.value + 1
  if (index > entityList.value.length - 1) index = 0
  return index
})

const picturePreviews = computed(() =>
  entityList.value.flatMap(e => [
    {
      id: e.preview_file_id,
      height: e.preview_file_height,
      width: e.preview_file_width,
      extension: e.preview_file_extension,
      revision: e.preview_file_revision,
      position: 1
    },
    ...(e.preview_file_previews || []).map((p, index) => ({
      id: p.id,
      height: p.height,
      width: p.width,
      extension: p.extension,
      revision: p.revision,
      position: index + 2
    }))
  ])
)

const currentPreviewPath = computed(() => {
  if (!currentPreview.value) return ''
  let previewId = currentPreview.value.id
  let ext = currentPreview.value.extension
  if (currentPreviewIndex.value > 0 && currentEntity.value) {
    const index = currentPreviewIndex.value - 1
    const preview = currentEntity.value.preview_file_previews[index]
    previewId = preview.id
    ext = preview.extension
  }
  return `/api/pictures/originals/preview-files/${previewId}.${ext}`
})

const currentComparisonPreviewPath = computed(() => {
  if (!currentPreviewToCompare.value) return ''
  if (!isPictureComparison.value && !isMovieComparison.value) return ''
  const ext = currentPreviewToCompare.value.extension
  const previewId = currentPreviewToCompare.value.id
  if (isPictureComparison.value) {
    return `/api/pictures/originals/preview-files/${previewId}.${ext}`
  }
  return `/api/movies/originals/preview-files/${previewId}.${ext}`
})

const currentPreviewDlPath = computed(() => {
  if (!currentPreview.value) return ''
  const previewId = currentPreview.value.id
  return `/api/pictures/originals/preview-files/${previewId}/download`
})

// Computed — frames

const fps = computed(() => parseFloat(currentProduction.value?.fps) || 25)
const frameDuration = computed(
  () => Math.round((1 / fps.value) * 10000) / 10000
)

const nbFrames = computed(() => {
  const isChromium = !!window.chrome
  const change = isChromium ? frameDuration.value : 0
  const duration =
    currentPreview.value && currentPreview.value.duration
      ? currentPreview.value.duration
      : maxDurationRaw.value + change
  return Math.round(duration * fps.value)
})

const frameNumber = computed(() => {
  if (isCurrentPreviewPicture.value) {
    return framesSeenOfPicture.value - 1
  }
  let n = currentTimeRaw.value / frameDuration.value
  if (n >= nbFrames.value) n = nbFrames.value
  return Math.round(n) - 1
})

const currentFrame = computed(() => formatFrame(frameNumber.value + 2))

const currentFrameMovieOrPicture = computed(() => {
  if (isCurrentPreviewMovie.value) return parseInt(currentFrame.value)
  if (isCurrentPreviewPicture.value) return framesSeenOfPicture.value
  return 0
})

// Computed — comparison

const isMovieComparison = computed(
  () => currentPreviewToCompare.value?.extension === 'mp4'
)

const isPictureComparison = computed(() =>
  isPicturePreview(currentPreviewToCompare.value?.extension)
)

// AnnotationCanvas overlays this anchor div instead of the comparison
// <video> element. Its size and position are computed in
// updateComparisonAnchor from `rawPlayerComparison.getVideoRatio()`, so
// the canvas matches the rendered video content rect rather than the
// element box (the <video> takes the full container height with the
// content letterboxed inside).
const comparisonContentAnchorEl = computed(
  () => comparisonContentAnchor.value || null
)
const mainContentAnchorEl = computed(() => mainContentAnchor.value || null)

// Where wheel events forwarded by the main AnnotationCanvas should
// land. Must be the element panzoom is bound to, so the user can zoom
// the main viewer through the overlay. For movies that's the inner
// <video>; for pictures it's the visible <img> resolved by
// MultiPictureViewer's getPictureElement() (a plain function, not an
// exposed ref — Vue's auto-unwrap was handing back the wrong slot).
// `currentPreview` is read so the computed re-runs whenever the
// active picture switches (entity change, revision change, …).
const mainMediaElement = computed(() => {
  if (isCurrentPreviewMovie.value) {
    return rawPlayer.value?.currentPlayer || null
  }
  if (isCurrentPreviewPicture.value) {
    currentPreview.value // dependency trigger
    return picturePlayer.value?.getPictureElement?.() || null
  }
  return null
})

// Main viewer's panzoom transform. Drives both the comparison
// annotation overlay (via the annotation-canvas prop) and the
// comparison <video>'s own panzoom (via the watcher below). Mirrors
// PreviewPlayer's usePanzoomSync: main is the source of truth, the
// comparison side just follows.
const panzoomTransform = ref({ x: 0, y: 0, scale: 1 })

// Computed — playlist meta

const isAssetPlaylist = computed(() => props.currentEntityType === 'asset')
const isSequencePlaylist = computed(
  () => props.currentEntityType === 'sequence'
)

const isAllowToEdit = computed(() => {
  if (isCurrentUserManager.value) return true
  if (isCurrentUserSupervisor.value) {
    const creator = personMap.value.get(props.playlist?.created_by)
    return !creator || creator.id === user.value?.id
  }
  return false
})

const isJobRunning = computed(
  () =>
    props.playlist?.build_jobs?.filter(job => job.status === 'running')
      .length !== 0
)

const csvDlPath = computed(
  () => `/api/export/csv/playlists/${props.playlist?.id}`
)
const zipDlPath = computed(
  () => `/api/data/playlists/${props.playlist?.id}/download/zip`
)

const deleteText = computed(() => {
  if (props.playlist) {
    return t('playlists.delete_text', { name: props.playlist.name })
  }
  return ''
})

const timezone = computed(() => user.value?.timezone || moment.tz.guess())

const entityTaskTypes = computed(() => {
  switch (props.playlist?.for_entity) {
    case 'asset':
      return productionAssetTaskTypes.value
    case 'edit':
      return productionEditTaskTypes.value
    case 'episode':
      return productionEpisodeTaskTypes.value
    case 'sequence':
      return productionSequenceTaskTypes.value
    case 'shot':
    default:
      return productionShotTaskTypes.value
  }
})

const addEntitiesText = computed(() => {
  if (isAssetPlaylist.value) return t('playlists.add_assets')
  if (isSequencePlaylist.value) return t('playlists.add_sequences')
  return t('playlists.add_shots')
})

const backgroundOptions = computed(() => {
  const defaultFlag = t('playlists.actions.default')
  return [
    {
      label: t('playlists.actions.select_background'),
      value: null,
      placeholder: true
    },
    ...productionBackgrounds.value.map(background => ({
      value: background,
      label: background.name,
      optionLabel:
        background.name +
        (isDefaultBackground(background) ? ` (${defaultFlag})` : '')
    }))
  ]
})

const backgroundUrl = computed(() =>
  isObjectBackground.value ? objectBackgroundUrl.value : undefined
)

const isFullScreenEnabled = computed(() =>
  Boolean(document.fullscreenEnabled || document.webkitFullscreenEnabled)
)

// Comparison composable

const {
  isComparing,
  taskTypeId: taskTypeToCompare,
  comparisonMode,
  comparisonModeOptions,
  isComparisonOverlay,
  overlayOpacity,
  toggleFullOverlay: toggleFullOverlayComparison,
  revisionToCompare,
  entityListToCompare,
  comparisonEntityMissing,
  currentComparisonPreviewIndex,
  savedTaskTypeToCompare,
  taskTypeOptions,
  revisionOptions,
  currentRevisionToCompare,
  currentPreviewToCompare,
  currentComparisonPreviewLength,
  comparisonAnnotations,
  toggleComparison,
  goToPreviousComparisonPicture,
  goToNextComparisonPicture
} = usePlaylistComparison({
  currentEntity,
  entityList,
  taskTypeMap,
  t
})

// Annotation broadcast (must be defined before useAnnotation)

const { postAnnotationAddition, postAnnotationDeletion, postAnnotationUpdate } =
  useAnnotationBroadcast({
    room,
    userId,
    socket: $socket
  })

// Annotation composable

const annotation = useAnnotation({
  mainCanvasComponent: mainAnnotationCanvas,
  comparisonCanvasComponent: comparisonAnnotationCanvas,
  canvasWrapper,
  annotations,
  isCurrentUserArtist,
  userId,
  store,
  emit,
  getCurrentTime: () => getCurrentTime(),
  getCurrentFrame: () => getCurrentFrame(),
  saveAnnotationsCb: () => saveAnnotations(),
  onCanvasMouseMovedCb: event => onCanvasMouseMoved(event),
  onCanvasReleasedCb: event => onCanvasReleased(event),
  isLaserModeOn,
  postAnnotationAddition,
  postAnnotationDeletion,
  postAnnotationUpdate
})

annotation.setCurrentPreviewGetter(() => currentPreview.value)

const {
  fabricCanvas,
  notSaved,
  pencilColor,
  pencilWidth,
  textColor,
  getObjectById,
  addText,
  addTypeArea,
  removeTypeArea,
  deleteSelection,
  addObjectToCanvas,
  removeObjectFromCanvas,
  updateObjectInCanvas,
  isWriting,
  getNewAnnotations,
  loadSingleAnnotation,
  loadSingleAnnotationComparison,
  clearComparisonCanvas,
  currentShape,
  isShapeMode,
  onChangePencilColor,
  onChangePencilWidth,
  onChangeTextColor,
  _resetColor,
  _resetPencil,
  resetPencilConfiguration,
  onWindowsClosed,
  resetUndoStacks,
  undoLastAction,
  redoLastAction,
  setAnnotationDrawingMode,
  setShapeTool,
  toggleShapeMode,
  clearCanvas,
  copyAnnotations,
  pasteAnnotations,
  fadeObject,
  startAnnotationSaving,
  endAnnotationSaving,
  restoreFailedAnnotations,
  confirmAnnotationsSaved,
  copyAnnotationCanvas,
  compositeLiveAnnotationsOntoCanvas
} = annotation

// FullScreen composable

const { fullScreen, toggle: toggleFullScreen } = useFullScreen({
  container,
  onChange: () => {
    resetHeight()
    setTimeout(() => {
      if (isCurrentPreviewPicture.value) {
        triggerResize()
        resetHeight()
        resetPictureCanvas()
      }
    }, 300)
  }
})

// Computed — joinedRoom (needed before usePreviewRoom binds it)

const joinedRoom = computed(() => {
  const r = room.value
  if (!r?.people) return undefined
  return r.people.find(id => id === user.value?.id)
})

// PreviewRoom composable

const previewRoom = usePreviewRoom({
  room,
  userId,
  socket: $socket,
  isPlaying,
  playingEntityIndex,
  currentEntity,
  currentPreview,
  currentPreviewIndex,
  currentFrame: currentFrameMovieOrPicture,
  isRepeating,
  isLaserModeOn,
  isAnnotationsDisplayed,
  isWaveformDisplayed,
  handleIn,
  handleOut,
  speed,
  isComparing,
  taskTypeToCompare,
  revisionToCompare,
  comparisonMode,
  currentComparisonPreviewIndex,
  playEntity: (...args) => playEntity(...args),
  pause: () => pause(),
  play: () => play(),
  setPlayerSpeed: rate => setPlayerSpeed(rate),
  syncComparisonPlayer: () => syncComparisonPlayer(),
  updateProgressBar: f => updateProgressBar(f),
  onWindowResize: () => onWindowResize(),
  findEntity: info => findEntity(info),
  changePreviewFile: (entity, previewFile) =>
    changePreviewFile(entity, previewFile),
  setRawPlayerFrame: f => rawPlayer.value?.setCurrentFrame(f),
  setCurrentTimeRaw: t => setCurrentTimeRaw(t),
  exists: v => v !== null && v !== undefined,
  frameDuration,
  taskMap,
  isCurrentPreviewPicture,
  framesSeenOfPicture,
  getAnnotation: time => getAnnotation(time),
  getObjectById,
  loadAnnotation: a => loadAnnotation(a),
  addObjectToCanvas,
  removeObjectFromCanvas,
  updateObjectInCanvas,
  fadeObject,
  clearCanvas,
  setPanZoom: (x, y, scale) => setPanZoom(x, y, scale),
  setComparisonPanZoom: (x, y, scale) => setComparisonPanZoom(x, y, scale)
})

const {
  openRoom,
  closeRoom,
  joinRoom,
  leaveRoom,
  updateRoomStatus,
  postPanZoomChanged,
  postComparisonPanZoomChanged
} = previewRoom

// Keyboard shortcuts (common subset; PlaylistPlayer-specific keys are
// handled below in onKeyDown).

const { isAltHeld } = usePreviewShortcuts({
  onDelete: () => deleteSelection(),
  onPlayPause: () => togglePlayPause(),
  onPrevAnnotation: () => onPreviousDrawingClicked(),
  onNextAnnotation: () => onNextDrawingClicked(),
  onCopy: () => copyAnnotations(),
  onPaste: () => pasteAnnotations(),
  onToggleOverlay: () => toggleFullOverlayComparison()
})

// Holding Alt makes the overlay transparent to pointer events so the
// user can pan/drag the underlying media (panzoom captures the events
// directly). Shift stays free for fabric's straight-line constraint,
// and wheel always reaches the media via wheel-target.
const isOverlayInteractive = computed(() => !isAltHeld.value)

const { cursor: annotationCursor } = useAnnotationCursor({
  isAltHeld,
  isDrawing,
  isTyping,
  isShapeMode,
  isLaserModeOn
})

// DOM utility helpers (inlined from domMixin)

const clearFocus = () => {
  document.activeElement?.blur()
}

const getClientX = event =>
  event.touches?.[0]?.clientX ??
  event.changedTouches?.[0]?.clientX ??
  event.clientX

// Helpers

const isValidRoomId = r => !!r?.id && r.id !== 'temp'

const isDefaultBackground = background => {
  const defaultId = currentProduction.value?.default_preview_background_file_id
  return defaultId ? background.id === defaultId : background.is_default
}

const triggerResize = () => {
  window.dispatchEvent(new Event('resize'))
}

const displayBars = () => {
  if (!buttonBar.value) return
  if (header.value) header.value.style.opacity = 1
  buttonBar.value.style.opacity = 1
  if (progress.value?.$el) progress.value.$el.style.opacity = 1
  if (playlistProgressRef.value?.$el) {
    playlistProgressRef.value.$el.style.opacity = 1
  }
  if (container.value) container.value.style.cursor = 'default'
}

const hideBars = () => {
  if (header.value) header.value.style.opacity = 0
  if (buttonBar.value) buttonBar.value.style.opacity = 0
  if (progress.value?.$el) progress.value.$el.style.opacity = 0
  if (playlistProgressRef.value?.$el) {
    playlistProgressRef.value.$el.style.opacity = 0
  }
}

// Modal handling

const showDeleteModal = () => {
  modals.value.delete = true
}

const hideDeleteModal = () => {
  modals.value.delete = false
}

const showTaskTypeModal = () => {
  modals.value.taskType = true
}

const hideTaskTypeModal = () => {
  modals.value.taskType = false
}

const confirmChangeTaskType = taskTypeId => {
  emit('task-type-changed', taskTypeId)
  modals.value.taskType = false
}

const onNotifyClientsClicked = () => {
  modals.value.notifyClients = true
  success.value.notifyClients = false
  errors.value.notifyClients = false
}

const onShareLinksUpdated = count => {
  hasActiveShareLinks.value = count > 0
}

const confirmNotifyClients = async ({ studioId, departmentId }) => {
  loading.value.notifyClients = true
  errors.value.notifyClients = false
  success.value.notifyClients = false
  try {
    await store.dispatch('notifyClients', {
      playlist: props.playlist,
      studioId,
      departmentId
    })
    success.value.notifyClients = true
  } catch (err) {
    console.error(err)
    errors.value.notifyClients = true
  } finally {
    loading.value.notifyClients = false
  }
}

const confirmRemovePlaylist = async () => {
  loading.value.deletePlaylist = true
  errors.value.deletePlaylist = false
  try {
    await store.dispatch('deletePlaylist', { playlist: props.playlist })
    emit('playlist-deleted')
    modals.value.delete = false
  } catch (err) {
    console.error(err)
    errors.value.deletePlaylist = true
  } finally {
    loading.value.deletePlaylist = false
  }
}

// Entity helpers

const findEntity = entityInfo => {
  const entityId = entityInfo.entity_id
  const previewFileId = entityInfo.preview_file_id
  return entityList.value.find(
    s => s.id === entityId && s.preview_file_id === previewFileId
  )
}

const findEntityIndex = entityInfo => {
  const entityId = entityInfo.entity_id
  const previewFileId = entityInfo.preview_file_id
  return entityList.value.findIndex(
    s => s.id === entityId && s.preview_file_id === previewFileId
  )
}

const scrollToEntity = index => {
  // Template uses `:ref="'entity-' + index"` inside a v-for; Vue 3
  // registers each on the parent's refs object. We have to reach into
  // the instance because `<script setup>` has no implicit `$refs`.
  const refs = instance.refs
  const entry = refs?.[`entity-${index}`]
  const entityRef = Array.isArray(entry) ? entry[0] : entry
  const playlistEl = playlistedEntities.value
  if (!entityRef || !playlistEl) return
  const entityWidget = entityRef.$el
  const entity = entityList.value[index]
  annotations.value = entity?.preview_file_annotations || []
  if (!entityWidget) return
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

const scrollToRight = () => {
  if (entityList.value.length > 0) {
    scrollToEntity(entityList.value.length - 1)
  }
}

const entityListClicked = entityIndex => {
  playEntity(entityIndex)
  currentPreviewIndex.value = 0
  updateRoomStatus()
}

const removeEntity = ({ entity, previewFileId }) => {
  emit('remove-entity', { entity, previewFileId })
}

// Playback controls (delegating to underlying players)

const playClicked = () => {
  play()
  updateRoomStatus()
}

const pauseClicked = () => {
  pause()
  updateRoomStatus()
}

const play = () => {
  if (playingPictureTimeout) clearTimeout(playingPictureTimeout)
  if (isFullMode.value) {
    if (
      fullPlaylistPlayer.value.currentTime >=
      fullPlaylistPlayer.value.duration - frameDuration.value
    ) {
      setPlaylistProgress(0)
      progress.value.updateProgressBar(0)
      nextTick(playFullBuild)
    } else {
      playFullBuild()
    }
  } else if (isCurrentPreviewPicture.value) {
    playPicture()
  } else if (isCurrentPreviewSound.value) {
    playSound()
  } else if (isCurrentPreviewModel.value) {
    playModel()
  } else {
    if (!rawPlayer.value) return
    _setCurrentTimeOnHandleIn()
    rawPlayer.value.play()
    if (isComparing.value) rawPlayerComparison.value?.play()
    isPlaying.value = rawPlayer.value.isPlaying
  }
  clearCanvas()
}

const playFullBuild = () => {
  fullPlaylistPlayer.value.play()
  isPlaying.value = true
  _runPlaylistProgressUpdateLoop()
}

const _setCurrentTimeOnHandleIn = () => {
  if (handleIn.value > 1 && frameNumber.value < handleIn.value) {
    rawPlayer.value.setCurrentTimeRaw(handleIn.value * frameDuration.value)
    syncComparisonPlayer()
  }
}

const _runPlaylistProgressUpdateLoop = () => {
  clearInterval(playLoop)
  playLoop = setInterval(() => {
    setPlaylistProgress(fullPlaylistPlayer.value.currentTime)
    if (currentEntity.value) {
      const entityTime =
        fullPlaylistPlayer.value.currentTime -
        currentEntity.value.start_duration
      const frame = entityTime * fps.value
      progress.value.updateProgressBar(frame)
    }
  }, 1000 / fps.value)
}

const _stopPlaylistProgressUpdateLoop = () => {
  clearInterval(playLoop)
}

const pause = () => {
  resetCanvasVisibility()
  if (isFullMode.value) {
    fullPlaylistPlayer.value.pause()
    isPlaying.value = false
    _stopPlaylistProgressUpdateLoop()
  } else if (isCurrentPreviewMovie.value) {
    const comparisonPlayer = rawPlayerComparison.value
    let currentTimeValue = 0
    if (rawPlayer.value) {
      currentTimeValue = ceilToFrame(
        rawPlayer.value.getCurrentTimeRaw(),
        fps.value
      )
    }
    rawPlayer.value?.pause()
    if (comparisonPlayer) {
      comparisonPlayer.pause()
      rawPlayer.value.setCurrentTimeRaw(currentTimeValue)
      comparisonPlayer.setCurrentTimeRaw(currentTimeValue)
    }
  } else if (isCurrentPreviewSound.value) {
    soundPlayer.value?.pause()
  } else if (isCurrentPreviewModel.value) {
    modelPlayer.value?.pause()
  }
  isPlaying.value = false
}

const playEntity = (entityIndex, updateFullPlaylist = true, frame = -1) => {
  const entity = entityList.value[entityIndex]
  const wasDrawing = isDrawing.value === true
  clearCanvas()
  framesSeenOfPicture.value = 1
  playingEntityIndex.value = entityIndex
  if (entity && isMoviePreview(entity.preview_file_extension)) {
    nextTick(() => {
      scrollToEntity(playingEntityIndex.value)
      rawPlayer.value?.loadEntity(entityIndex)
      annotations.value = entity.preview_file_annotations || []
      onProgressChanged(frame + 1, false)
      if (isComparing.value) {
        rawPlayerComparison.value?.loadEntity(entityIndex)
      }
      if (isPlaying.value) {
        if (!isFullMode.value) {
          rawPlayer.value.play()
          if (isComparing.value) rawPlayerComparison.value?.play()
        }
      } else {
        if (updateFullPlaylist) {
          if (isFullMode.value && !isPlaying.value) {
            fullPlaylistPlayer.value.currentTime = entity.start_duration
            playlistProgress.value = entity.start_duration
          } else if (!isFullMode.value) {
            playlistProgress.value = entity.start_duration
          }
        }
        resetCanvasVisibility()
      }
    })
  } else {
    const ann = getAnnotation(0)
    if (!isPlaying.value) loadAnnotation(ann)
    if (wasDrawing) {
      setTimeout(() => {
        isDrawing.value = true
        setAnnotationDrawingMode(true)
      }, 100)
    }
    if (
      isPlaying.value &&
      entity &&
      isPicturePreview(entity.preview_file_extension)
    ) {
      playPicture()
    }
  }
  scrollToEntity(playingEntityIndex.value)
}

const syncComparisonPlayer = () => {
  if (
    rawPlayer.value &&
    rawPlayerComparison.value &&
    isComparing.value &&
    rawPlayerComparison.value.currentPlayer
  ) {
    const t = Number(rawPlayer.value.getCurrentTimeRaw().toPrecision(4))
    rawPlayerComparison.value.setCurrentTimeRaw(t)
  }
}

// Size the anchor div to the aspect-fitted content rect of the
// comparison <video>. The video element itself takes the full container
// height with the actual content letterboxed inside, so we can't pass it
// straight to AnnotationCanvas. Mirrors the math used in resetCanvasSize
// for the main canvas wrapper.
const updateComparisonAnchor = () => {
  const player = rawPlayerComparison.value
  const anchor = comparisonContentAnchor.value
  const container = videoContainer.value
  if (!player || !anchor || !container) return
  const playerEl = player.$el
  const ratio = player.getVideoRatio()
  const fullWidth = playerEl.offsetWidth
  const fullHeight = playerEl.offsetHeight
  const playerRect = playerEl.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  let width, height, leftOffset, topOffset
  if (!ratio) {
    width = fullWidth
    height = fullHeight
    leftOffset = 0
    topOffset = 0
  } else if (fullWidth > fullHeight * ratio) {
    width = fullHeight * ratio
    height = fullHeight
    leftOffset = (fullWidth - width) / 2
    topOffset = 0
  } else {
    width = fullWidth
    height = fullWidth / ratio
    leftOffset = 0
    topOffset = (fullHeight - height) / 2
  }
  anchor.style.left = `${playerRect.left - containerRect.left + leftOffset}px`
  anchor.style.top = `${playerRect.top - containerRect.top + topOffset}px`
  anchor.style.width = `${width}px`
  anchor.style.height = `${height}px`
}

const goPreviousFrame = () => {
  clearCanvas()
  if (isFullMode.value) {
    let previousFrameTime =
      fullPlaylistPlayer.value.currentTime - frameDuration.value
    const previousFrame = Math.round(previousFrameTime * fps.value)
    const entityPosition = playlistShotPosition.value[previousFrame]
    if (!entityPosition) return
    const entityIndex = entityPosition.index
    const entity = entityList.value[entityIndex]
    if (entityIndex !== playingEntityIndex.value) {
      const shotTime = entity.preview_file_duration
      const endFrame = Math.round(shotTime * fps.value)
      playEntity(entityIndex, false, endFrame)
      onProgressChanged(endFrame, false)
    }
    previousFrameTime = previousFrame / fps.value
    setFullPlayerTime(previousFrameTime)
  } else {
    if (!rawPlayer.value) return
    rawPlayer.value.goPreviousFrame()
    if (isComparing.value) syncComparisonPlayer()
    const time = rawPlayer.value.getCurrentTime()
    const ann = getAnnotation(time)
    if (ann) loadSingleAnnotation(ann)
    if (isComparing.value && !isComparisonOverlay.value) {
      loadComparisonAnnotation(time)
    }
  }
}

const goNextFrame = () => {
  clearCanvas()
  if (isFullMode.value) {
    let nextFrameTime =
      fullPlaylistPlayer.value.currentTime + frameDuration.value
    const nextFrame = Math.round(nextFrameTime * fps.value)
    const entityIndex = playlistShotPosition.value[nextFrame]?.index
    if (entityIndex !== undefined && entityIndex !== playingEntityIndex.value) {
      playEntity(entityIndex, false)
    }
    nextFrameTime = nextFrame / fps.value
    setFullPlayerTime(nextFrameTime)
  } else {
    if (!rawPlayer.value) return
    const nextFrameTime =
      rawPlayer.value.getCurrentTimeRaw() + frameDuration.value + 0.0001
    const nextFrame = Math.round(nextFrameTime * fps.value)
    if (nextFrame >= nbFrames.value) return
    rawPlayer.value.goNextFrame()
    if (isComparing.value) syncComparisonPlayer()
    const time = rawPlayer.value.getCurrentTime()
    const ann = getAnnotation(time)
    if (ann) loadSingleAnnotation(ann)
    if (isComparing.value && !isComparisonOverlay.value) {
      loadComparisonAnnotation(time)
    }
  }
}

const goPreviousDrawing = () => {
  try {
    clearCanvas()
    const previous = getPreviousAnnotationTime(currentTimeRaw.value)
    if (!previous) return
    const annotationTime = Number(previous.frame) - 1
    if (isFullMode.value) {
      setFullPlayerTime(annotationTime / fps.value)
    } else {
      rawPlayer.value.setCurrentTimeRaw(annotationTime / fps.value)
      onProgressChanged(annotationTime, true)
    }
    if (isComparing.value) syncComparisonPlayer()
  } catch (err) {
    console.error('wrong call from unexpected player', err)
  }
}

const goNextDrawing = () => {
  try {
    clearCanvas()
    const next = getNextAnnotationTime(currentTimeRaw.value)
    if (!next) return
    const annotationTime = Number(next.frame) - 1
    if (isFullMode.value) {
      setFullPlayerTime(annotationTime / fps.value)
    } else {
      rawPlayer.value.setCurrentTimeRaw(annotationTime / fps.value)
      onProgressChanged(annotationTime, true)
    }
    if (isComparing.value) syncComparisonPlayer()
  } catch (err) {
    console.error('wrong call from unexpected player', err)
  }
}

const setFullPlayerTime = newTime => {
  if (!currentEntity.value) return
  fullPlaylistPlayer.value.currentTime = newTime
  setPlaylistProgress(newTime)
  const entityTime = newTime - currentEntity.value.start_duration
  const frame = entityTime * fps.value
  progress.value.updateProgressBar(frame + 1)
}

const onScrubStart = () => {
  buttonBar.value?.classList.add('unselectable')
}

const onScrubEnd = () => {
  buttonBar.value?.classList.remove('unselectable')
}

const onProgressChanged = (frame, updatePlaylistProgress = true) => {
  clearCanvas()
  reloadAnnotations(false)
  if (isCurrentPreviewPicture.value) {
    framesSeenOfPicture.value = frame + 1
  } else {
    rawPlayer.value.setCurrentFrame(frame)
    syncComparisonPlayer()
  }
  const time = frame * frameDuration.value
  const ann = getAnnotation(time)
  if (ann) {
    loadAnnotation(ann)
  } else if (isComparing.value && !isComparisonOverlay.value) {
    loadComparisonAnnotation(time)
  }
  sendUpdatePlayingStatus()
  onFrameUpdate(frame)
  if (isFullMode.value && updatePlaylistProgress) {
    const start = currentEntity.value.start_duration
    const time = (frame - 1) / fps.value + start
    fullPlaylistPlayer.value.currentTime = time
    playlistProgress.value = time
  }
}

const onHandleInChanged = ({ frameNumber: f, save }) => {
  handleIn.value = f
  if (save) _saveHandles()
  updateRoomStatus()
}

const onHandleOutChanged = ({ frameNumber: f, save }) => {
  handleOut.value = f
  if (save) _saveHandles()
  updateRoomStatus()
}

const _saveHandles = () => {
  const shot = shotMap.value.get(currentEntity.value?.id)
  if (!shot) return
  store.dispatch('editShot', {
    id: shot.id,
    data: {
      ...shot.data,
      handle_in: handleIn.value,
      handle_out: handleOut.value
    }
  })
}

const onPreviousFrameClicked = () => {
  clearFocus()
  goPreviousFrame()
  sendUpdatePlayingStatus()
}

const onNextFrameClicked = () => {
  clearFocus()
  goNextFrame()
  sendUpdatePlayingStatus()
}

const onPreviousDrawingClicked = () => {
  clearFocus()
  goPreviousDrawing()
  sendUpdatePlayingStatus()
}

const onNextDrawingClicked = () => {
  clearFocus()
  goNextDrawing()
  sendUpdatePlayingStatus()
}

// Toggle play/pause without touching focus, so the Alt+P shortcut
// can fire from inside the comment textarea without losing the
// caret. The click handler below adds the focus reset.
const togglePlayPause = () => {
  if (!isPlaying.value) {
    playClicked()
  } else {
    pauseClicked()
    const ann = getAnnotation(rawPlayer.value?.getCurrentTime())
    if (ann) loadAnnotation(ann)
    updateRoomStatus()
  }
}

const onPlayPauseClicked = () => {
  clearFocus()
  togglePlayPause()
}

const onVideoRepeated = () => {
  if (!isCommentsHidden.value) clearFocus()
  if (isComparing.value) {
    syncComparisonPlayer()
    rawPlayerComparison.value?.play()
  }
}

const onRepeatClicked = () => {
  clearFocus()
  isRepeating.value = !isRepeating.value
  updateRoomStatus()
}

const onToggleSoundClicked = () => {
  clearFocus()
  isMuted.value = !isMuted.value
}

const onFullscreenClicked = () => {
  if (fullScreen.value) {
    removeTypeArea()
  } else {
    addTypeArea()
  }
  toggleFullScreen()
}

const reloadAnnotations = (current = true) => {
  if (!annotations.value) return
  annotations.value = annotations.value.map(a => ({ ...a }))
  if (current) reloadCurrentAnnotation()
}

const reloadCurrentAnnotation = () => {
  let time = roundToFrame(currentTimeRaw.value, fps.value) || 0
  if (isCurrentPreviewPicture.value) time = 0
  const ann = getAnnotation(time)
  if (ann) loadAnnotation(ann)
}

const onFilmClicked = () => {
  isEntitiesHidden.value = !isEntitiesHidden.value
  triggerResize()
  nextTick(() => {
    resetHeight()
    scrollToEntity(playingEntityIndex.value)
  })
}

const getCurrentTime = () => {
  // A picture / model / pdf preview has a single canonical time (0),
  // so pin annotations to frame 0 there. Without this the playlist
  // scrub position leaks into the annotation key and strokes drawn
  // mid-shot disappear when the user comes back to the start.
  if (!isCurrentPreviewMovie.value) return 0
  const time = roundToFrame(currentTimeRaw.value, fps.value) || 0
  return Number(time.toPrecision(4))
}

const getCurrentFrame = () => {
  if (currentFrame.value) return currentFrame.value
  const time = roundToFrame(currentTimeRaw.value, fps.value) || 0
  return Math.round(time / frameDuration.value)
}

const setCurrentTimeRaw = time => {
  const roundedTime = roundToFrame(time, fps.value) || 0
  const frame = roundedTime / frameDuration.value
  if (rawPlayer.value) {
    rawPlayer.value.setCurrentFrame(frame)
    syncComparisonPlayer()
    const isChromium = !!window.chrome
    const change = isChromium ? 0.0001 : 0
    currentTimeRaw.value = Number((roundedTime + change).toPrecision(4))
    updateProgressBar()
  }
  return roundedTime
}

const getSortedAnnotations = () => {
  const anns = annotations.value
  anns.sort((a, b) => a.time - b.time)
  return anns
}

const getNextAnnotationTime = time => {
  const anns = getSortedAnnotations()
  if (isCurrentPreviewMovie.value) {
    time = roundToFrame(time, fps.value)
    return anns.find(a => roundToFrame(a.time, fps.value) > time + 0.0001)
  } else if (isCurrentPreviewPicture.value) {
    return anns.find(a => a.time === 0)
  }
}

const getPreviousAnnotationTime = time => {
  const anns = getSortedAnnotations()
  if (isCurrentPreviewMovie.value) {
    time = roundToFrame(time, fps.value)
    return anns.findLast(
      a => roundToFrame(a.time, fps.value) < time - 1 / fps.value + 0.0001
    )
  } else if (isCurrentPreviewPicture.value) {
    return anns.find(a => a.time === 0)
  }
}

const onCommentClicked = () => {
  const height = videoContainer.value.offsetHeight
  isCommentsHidden.value = !isCommentsHidden.value
  if (!isCommentsHidden.value && taskInfoRef.value?.$el) {
    taskInfoRef.value.$el.style.height = `${height}px`
  }
  triggerResize()
  nextTick(() => {
    taskInfoRef.value?.focusCommentTextarea()
    resetHeight()
  })
}

// Refresh the current entity's task status so the playlist progress bar
// reflects the new status right after the comment is posted (otherwise the
// fields stay the ones captured when the playlist was loaded).
const onCommentAdded = () => {
  const entity = currentEntity.value
  if (!entity) return
  const task = taskMap.value.get(entity.preview_file_task_id)
  if (!task) return
  const taskStatus = taskStatusMap.value.get(task.task_status_id)
  if (!taskStatus) return
  entity.task_status_id = task.task_status_id
  entity.task_status_color = taskStatus.color
}

const setPlayerSpeed = rate => {
  rawPlayer.value?.setSpeed(rate)
  rawPlayerComparison.value?.setSpeed(rate)
}

const onFrameUpdate = frame => {
  const isChromium = !!window.chrome
  const change = isChromium ? 0.0001 : 0
  currentTimeRaw.value = Number(
    (frame * frameDuration.value + change).toPrecision(4)
  )
  currentTime.value = formatTime(currentTimeRaw.value, fps.value)
  updateProgressBar()
  if (isShowAnnotationsWhilePlaying.value) {
    const ann = getAnnotation(currentTimeRaw.value)
    clearCanvas()
    if (ann) loadSingleAnnotation(ann)
    if (isComparing.value && !isComparisonOverlay.value) {
      loadComparisonAnnotation(currentTimeRaw.value)
    }
  }
  if (props.playlist && isPlaying.value) {
    const hasHandles =
      ['shot', 'edit', 'episode'].includes(props.playlist.for_entity) &&
      handleOut.value < nbFrames.value
    const reachedEnd = hasHandles
      ? frameNumber.value >= handleOut.value
      : frameNumber.value >= nbFrames.value - 1
    if (reachedEnd) {
      if (isRepeating.value) {
        const startFrame = hasHandles ? handleIn.value : 0
        rawPlayer.value?.setCurrentFrame(startFrame)
        rawPlayerComparison.value?.setCurrentFrame(startFrame)
      } else {
        onPlayNext()
      }
    }
  }
  if (isCurrentPreviewMovie.value && wavesurfer && isWaveformDisplayed.value) {
    const position = currentTimeRaw.value / maxDurationRaw.value
    wavesurfer.seekTo(position)
  }
  nextTick(() => {
    const actions = onNextTimeUpdateActions.value
    actions.forEach(action => action())
    onNextTimeUpdateActions.value = []
  })
}

const onMaxDurationUpdate = duration => {
  if (duration) {
    duration = floorToFrame(duration, fps.value)
    maxDurationRaw.value = duration
    maxDuration.value = formatTime(duration, fps.value)
    resetHandles()
  } else {
    maxDurationRaw.value = 0
    maxDuration.value = '00.00.000'
  }
}

const onMouseMove = () => {
  if (buttonBar.value && buttonBar.value.style.opacity !== '1') {
    displayBars()
  }
  const isMovieFullScreen =
    fullScreen.value && isEntitiesHidden.value && isCommentsHidden.value
  if (isMovieFullScreen) {
    if (autoHideTimer) clearTimeout(autoHideTimer)
    autoHideTimer = setTimeout(() => {
      const stillFullScreen =
        fullScreen.value && isEntitiesHidden.value && isCommentsHidden.value
      if (stillFullScreen) hideBars()
    }, 2000)
  }
}

const playPicture = () => {
  if (playingPictureTimeout) clearTimeout(playingPictureTimeout)
  framesSeenOfPicture.value = 1
  isPlaying.value = true
  playingPictureTimeout = setTimeout(() => {
    continuePlayingPlaylist(
      playingEntityIndex.value,
      Date.now() - (1000 * framesSeenOfPicture.value) / fps.value
    )
  }, 100)
}

const playSound = () => {
  if (playingPictureTimeout) clearTimeout(playingPictureTimeout)
  isPlaying.value = true
  if (isCurrentPreviewSound.value) soundPlayer.value?.play()
}

const playModel = () => {
  if (playingPictureTimeout) clearTimeout(playingPictureTimeout)
  isPlaying.value = true
  modelPlayer.value?.play(objectModel.value.currentAnimation)
}

// Size the main anchor div to the aspect-fit content rect of the
// current main preview. AnnotationCanvas reads it as `mediaElement` and
// overlays the matching area. Movies use the comparison-style math
// (rawPlayer.$el + getVideoRatio), pictures use natural dimensions and
// the video-container minus any comparison space.
const updateMainAnchor = () => {
  const anchor = mainContentAnchor.value
  if (!anchor) return

  if (isCurrentPreviewMovie.value && rawPlayer.value) {
    const playerEl = rawPlayer.value.$el
    const containerRect = videoContainer.value?.getBoundingClientRect()
    if (!containerRect) return
    const playerRect = playerEl.getBoundingClientRect()
    const ratio = rawPlayer.value.getVideoRatio()
    const fullWidth = playerEl.offsetWidth
    const fullHeight = playerEl.offsetHeight
    let width, height, leftOffset, topOffset
    if (!ratio) {
      width = fullWidth
      height = fullHeight
      leftOffset = 0
      topOffset = 0
    } else if (fullWidth > fullHeight * ratio) {
      width = fullHeight * ratio
      height = fullHeight
      leftOffset = (fullWidth - width) / 2
      topOffset = 0
    } else {
      width = fullWidth
      height = fullWidth / ratio
      leftOffset = 0
      topOffset = (fullHeight - height) / 2
    }
    anchor.style.left = `${playerRect.left - containerRect.left + leftOffset}px`
    anchor.style.top = `${playerRect.top - containerRect.top + topOffset}px`
    anchor.style.width = `${width}px`
    anchor.style.height = `${height}px`
    return
  }

  if (isCurrentPreviewPicture.value && videoContainer.value) {
    const naturalDimensions = currentPreview.value?.width
      ? {
          width: currentPreview.value.width,
          height: currentPreview.value.height
        }
      : picturePlayer.value?.getNaturalDimensions?.()
    if (!naturalDimensions) return
    const naturalWidth = naturalDimensions.width
    const naturalHeight = naturalDimensions.height
    const ratio = naturalWidth / naturalHeight

    let fullWidth = videoContainer.value.offsetWidth
    const fullHeight = videoContainer.value.offsetHeight
    if (isComparing.value && !isComparisonOverlay.value) {
      fullWidth = Math.round(fullWidth / 2)
    }

    let width = ratio ? fullHeight * ratio : fullWidth
    let height = ratio ? Math.round(fullWidth / ratio) : fullHeight
    let left = 0
    let top = 0

    if (fullWidth > naturalWidth) {
      left = Math.round((fullWidth - naturalWidth) / 2)
      width = naturalWidth
    } else if (fullWidth > width) {
      left = Math.round((fullWidth - width) / 2)
    } else {
      width = fullWidth
    }

    if (fullHeight > naturalHeight) {
      top = Math.round((fullHeight - naturalHeight) / 2)
      height = naturalHeight
    } else if (fullHeight > height) {
      top = Math.round((fullHeight - height) / 2)
    } else {
      height = fullHeight
      width = Math.round(height * ratio)
      left = Math.round((fullWidth - width) / 2)
    }

    anchor.style.left = `${left}px`
    anchor.style.top = `${top}px`
    anchor.style.width = `${width}px`
    anchor.style.height = `${height}px`
  }
}

const resetCanvasSize = () => {
  return nextTick().then(() => {
    updateMainAnchor()
    updateComparisonAnchor()
  })
}

const onMainCanvasResized = () => {
  // Wipe the canvas before reloading: addObjectToCanvas skips
  // objects that already have a fabric instance, so without this
  // the wrongly-scaled strokes drawn at mount-time (when the anchor
  // had no size yet) would stay on screen forever.
  clearCanvas()
  reloadAnnotations(false)
  const ann = getAnnotation(currentTimeRaw.value)
  if (ann) loadSingleAnnotation(ann)
}

const showCanvas = () => {
  if (canvasWrapper.value) canvasWrapper.value.style.display = 'block'
}

const hideCanvas = () => {
  if (canvasWrapper.value) canvasWrapper.value.style.display = 'none'
}

const loadAnnotation = ann => {
  if (!ann) return
  pause()
  const time = ann.time || 0
  if (rawPlayer.value || picturePlayer.value) {
    if (rawPlayer.value) {
      const frame = time / frameDuration.value
      rawPlayer.value.setCurrentFrame(frame)
      syncComparisonPlayer()
      currentTimeRaw.value = time
      updateProgressBar()
    }
    clearCanvas()
    loadSingleAnnotation(ann)
    if (isComparing.value && !isComparisonOverlay.value) {
      loadComparisonAnnotation(time)
    }
  }
}

const loadComparisonAnnotation = time => {
  clearComparisonCanvas()
  if (!isMovieComparison.value) return
  const compared = currentRevisionToCompare.value
  const anns = compared?.annotations || []
  const annotation = anns.find(a => a.time === time)
  if (annotation) loadSingleAnnotationComparison(annotation)
}

// Triggered when AnnotationCanvas's internal canvas has been resized to
// match the comparison video bounds. We re-load the annotation here so
// the scale multipliers in addObjectToCanvas are computed against the
// final canvas width (otherwise paths and PSStrokes land at stale
// coordinates — same pattern as PreviewPlayer.onMainCanvasResized).
const onComparisonCanvasResized = () => {
  if (isComparing.value && !isComparisonOverlay.value) {
    loadComparisonAnnotation(currentTimeRaw.value)
  }
}

const saveAnnotations = () => {
  let time = roundToFrame(currentTimeRaw.value, fps.value) || 0
  if (time < 0) time = 0
  if (isCurrentPreviewPicture.value) time = 0
  if (!annotations.value) return

  const frame = time / frameDuration.value
  const ann = getAnnotation(time)
  const newAnnotations = getNewAnnotations(time, frame, ann)
  const entity = entityList.value[playingEntityIndex.value]
  if (!entity) return

  let preview = {
    id: entity.preview_file_id,
    task_id: entity.preview_file_task_id,
    annotations: entity.preview_file_annotations || []
  }
  if (currentPreviewIndex.value > 0) {
    const index = currentPreviewIndex.value - 1
    const previewFile = currentEntity.value.preview_file_previews[index]
    preview = {
      id: previewFile.id,
      task_id: entity.preview_file_task_id,
      annotations: previewFile.annotations || []
    }
  }

  if (!isCurrentUserArtist.value) {
    if (!notSaved.value) {
      startAnnotationSaving(preview, newAnnotations)
    }

    entity.preview_file_annotations = newAnnotations
    Object.keys(entity.preview_files || {}).forEach(taskTypeId => {
      let revPreview = null
      entity.preview_files[taskTypeId].forEach(p => {
        if (p.id === preview.id) revPreview = p
        if (!revPreview && p.previews) {
          p.previews.forEach(sub => {
            if (sub.id === preview.id) revPreview = p
          })
        }
      })
      if (revPreview) {
        store.commit('UPDATE_PREVIEW_ANNOTATION', {
          taskId: preview.task_id,
          preview: revPreview,
          annotations: newAnnotations
        })
      }
    })
  }
}

const onDeleteClicked = () => {
  deleteSelection()
}

const getAnnotation = time => {
  if (!annotations.value) {
    annotations.value = currentEntity.value?.preview_file_annotations || []
  }
  time = roundToFrame(time, fps.value)
  if (annotations.value?.find) {
    let ann = annotations.value.find(a => a.time === time)
    if (!ann) {
      ann = annotations.value.find(
        a => a.time > time - 0.02 && a.time < time + 0.02
      )
    }
    if (!ann && isCurrentPreviewPicture.value && annotations.value.length > 0) {
      ann = annotations.value[0]
      store.commit('UPDATE_ANNOTATION', {
        annotation: ann,
        data: { time: 0 }
      })
    }
    return ann
  }
  annotations.value = []
  return null
}

const onMetadataLoaded = () => {
  nextTick(() => {
    resetCanvasSize()
    resetHeight()
  })
}

const clearPlayer = () => {
  rawPlayer.value?.clear()
  if (isComparing.value) rawPlayerComparison.value?.clear()
  maxDurationRaw.value = 0
  maxDuration.value = '00:00.000'
}

const resetPictureCanvas = async () => {
  if (!currentPreview.value) return
  annotations.value = currentPreview.value.annotations || []
  await resetCanvas()
  resetCanvasVisibility()
  if (isCurrentPreviewPicture.value && !isPlaying.value) {
    loadAnnotation(getAnnotation(0))
  }
}

// Scrubbing
const onCanvasMouseMoved = event => {
  if (isCurrentPreviewMovie.value && scrubbing) {
    const x = getClientX(event.e)
    if (x - scrubStartX < 0) goPreviousFrame()
    else goNextFrame()
    scrubStartX = x
  }
}

const onCanvasClicked = event => {
  if (event.button > 1 && isCurrentPreviewMovie.value) {
    scrubbing = true
    scrubStartX = getClientX(event)
  }
  return false
}

const onCanvasReleased = () => {
  if (isCurrentPreviewMovie.value && scrubbing) scrubbing = false
  return false
}

const onTimeCodeClicked = ({ versionRevision, frame }) => {
  const previews = currentEntity.value?.preview_files[task.value?.task_type_id]
  if (!previews) return
  const previewFile = previews.find(
    p => p.revision === parseInt(versionRevision)
  )
  if (!previewFile) return
  onPreviewChanged({ entity: currentEntity.value, previewFile })
  setTimeout(() => {
    rawPlayer.value.setCurrentFrame(frame)
    onFrameUpdate(frame)
    syncComparisonPlayer()
    nextTick(() => reloadCurrentAnnotation())
  }, FRAME_DELAY)
}

// Annotation snapshot extraction

const extractFrame = (canvas, frame) => {
  rawPlayer.value.setCurrentFrame(frame)
  const video = rawPlayer.value.currentPlayer
  const context = canvas.getContext('2d')
  const dimensions = rawPlayer.value.getNaturalDimensions()
  canvas.width = dimensions.width
  canvas.height = dimensions.height
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
}

const extractVideoFrame = (canvas, f) => {
  return new Promise(resolve => {
    rawPlayer.value.setCurrentFrame(f)
    nextTick(() => {
      setTimeout(() => {
        extractFrame(canvas, f)
        resolve()
      }, 500)
    })
  })
}

const extractPicture = canvas => {
  if (!picturePlayer.value) return
  const image = picturePlayer.value.getPictureElement()
  if (!image) return
  const { width, height } = picturePlayer.value.getNaturalDimensions()
  const context = canvas.getContext('2d')
  canvas.width = width
  canvas.height = height
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
}

const extractAnnotationSnapshots = async () => {
  if (isCurrentPreviewPicture.value) return extractPicturePreviewSnapshots()
  return extractVideoAnnotationSnapshots()
}

const snapshotFilename = ({ revision, frame, index } = {}) =>
  buildAnnotationSnapshotFilename({
    production: currentProduction.value?.name,
    entity: task.value?.entity_name,
    taskType: taskTypeMap.value.get(task.value?.task_type_id)?.name,
    revision,
    frame,
    index
  })

// Video preview: one PNG per annotation, each captured at the
// annotation's frame with its drawing composited on top.
const extractVideoAnnotationSnapshots = async () => {
  const cur = currentFrame.value
  const sorted = annotations.value.sort((a, b) => a.time - b.time)
  const files = []
  const revision = currentPreview.value?.revision
  for (const ann of sorted) {
    const canvas = document.getElementById('annotation-snapshot')
    const frame = Math.round(
      roundToFrame(ann.time, fps.value) / frameDuration.value
    )
    await extractVideoFrame(canvas, frame)
    await copyAnnotationCanvas(canvas, ann)
    files.push(
      await getFileFromCanvas(canvas, snapshotFilename({ revision, frame }))
    )
  }
  rawPlayer.value.setCurrentFrame(cur - 1)
  nextTick(() => clearCanvas())
  return files
}

// Picture revisions can hold several preview files (main + extras).
// Walk them all and emit one PNG per picture preview, with that
// preview's annotations composited on top. Briefly switches the
// displayed picture in order to reuse the live extract/composite
// pipeline.
const extractPicturePreviewSnapshots = async () => {
  const entity = currentEntity.value
  if (!entity) return []
  const picturePreviews = [
    {
      id: entity.preview_file_id,
      extension: entity.preview_file_extension,
      revision: entity.preview_file_revision,
      annotations: entity.preview_file_annotations || []
    },
    ...(entity.preview_file_previews || [])
  ]
    .map((preview, index) => ({ preview, index }))
    .filter(({ preview }) => isPicturePreview(preview.extension))

  const savedIndex = currentPreviewIndex.value
  const files = []
  let fileIndex = 1
  for (const { preview, index } of picturePreviews) {
    if (currentPreviewIndex.value !== index) {
      currentPreviewIndex.value = index
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    const canvas = document.getElementById('annotation-snapshot')
    extractPicture(canvas)
    await compositeLiveAnnotationsOntoCanvas(canvas)
    files.push(
      await getFileFromCanvas(
        canvas,
        snapshotFilename({ revision: preview.revision, index: fileIndex })
      )
    )
    fileIndex++
  }
  if (currentPreviewIndex.value !== savedIndex) {
    currentPreviewIndex.value = savedIndex
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  nextTick(() => clearCanvas())
  return files
}

const getFileFromCanvas = (canvas, filename) => {
  return new Promise(resolve => {
    canvas.toBlob(blob => {
      resolve(
        new File([blob], filename, {
          type: 'image/png',
          lastModified: new Date().getTime()
        })
      )
    })
  })
}

const updateProgressBar = f => {
  const frame = f !== undefined ? f : frameNumber.value
  if (progress.value) progress.value.updateProgressBar(frame + 1)
  if (playlistDuration.value && !isFullMode.value && currentEntity.value) {
    playlistProgress.value =
      currentEntity.value.start_duration + frame / fps.value
  }
}

// Player previews navigation

const onPlayPreviousEntityClicked = () => {
  if (currentPreviewIndex.value > 0) onPreviousPreviewClicked()
  else onPlayPreviousEntity()
}

const onPlayPreviousEntity = () => {
  clearFocus()
  playEntity(previousEntityIndex.value)
  sendUpdatePlayingStatus()
}

const onPlayNextEntity = () => {
  clearFocus()
  playEntity(nextEntityIndex.value)
  sendUpdatePlayingStatus()
}

const onPlayNextEntityClicked = () => {
  if (currentPreviewIndex.value < currentEntityPreviewLength.value - 1) {
    onNextPreviewClicked()
  } else {
    onPlayNextEntity()
  }
}

const onPlayNext = () => {
  const next = entityList.value[nextEntityIndex.value]
  if (isRepeating.value && isCurrentPreviewMovie.value) {
    rawPlayer.value?.playNext()
  } else if (next?.preview_file_extension === 'mp4') {
    resetHandles(next)
    rawPlayer.value?.playNext(handleIn.value)
    syncComparisonPlayer()
    _setCurrentTimeOnHandleIn()
  } else {
    onPlayNextEntityClicked()
    if (isCurrentPreviewPicture.value) {
      framesSeenOfPicture.value = 1
      playPicture()
      updateProgressBar()
    }
  }
}

const onPlayerPlayingEntityChange = entityIndex => {
  playingEntityIndex.value = entityIndex
  if (isCurrentPreviewMovie.value) {
    if (isComparing.value) {
      const comparisonIndex = rawPlayerComparison.value?.currentIndex
      if (comparisonIndex !== entityIndex) {
        rawPlayerComparison.value?.playNext()
      }
    }
    movieDimensions.value = {
      width: currentPreview.value?.width,
      height: currentPreview.value?.height
    }
  }
  if (!silentMode) scrollToEntity(playingEntityIndex.value)
}

const continuePlayingPlaylist = (entityIndex, startMs) => {
  const fpi = framesPerImage.value[entityIndex]
  const durationToWaitMs = (fpi * 1000) / fps.value
  const durationWaited = Date.now() - startMs
  if (!isPlaying.value) return
  if (durationWaited < durationToWaitMs) {
    framesSeenOfPicture.value = Math.max(
      Math.floor((durationWaited / 1000) * fps.value),
      1
    )
    playingPictureTimeout = setTimeout(() => {
      continuePlayingPlaylist(entityIndex, startMs)
    }, 100)
    return
  }
  const previews = currentEntity.value?.preview_file_previews
  if (previews && previews.length === currentPreviewIndex.value) {
    nextTick(() => {
      onPlayNextEntity(true)
      framesSeenOfPicture.value = 1
    })
  } else {
    currentPreviewIndex.value++
    nextTick(() => {
      playingPictureTimeout = setTimeout(() => {
        continuePlayingPlaylist(playingEntityIndex.value, Date.now())
      }, 100)
    })
  }
}

const onVideoLoaded = () => {
  if (currentPreview.value) {
    movieDimensions.value = {
      width: currentPreview.value.width,
      height: currentPreview.value.height
    }
    if (!isPlaying.value) loadAnnotation(getAnnotation(0))
  }
}

const onModelLoaded = () => {
  const animations = modelPlayer.value?.getAnimations() || []
  objectModel.value.isAnimation = animations.length > 0
  if (objectModel.value.isAnimation) {
    objectModel.value.availableAnimations = animations.map(a => ({
      label: a,
      value: a
    }))
    objectModel.value.currentAnimation = animations[0]
    nextTick(() => playModel())
  } else {
    objectModel.value.availableAnimations = []
    objectModel.value.currentAnimation = null
  }
}

const onPreviewChanged = ({ entity, previewFile, previousPreviewFileId }) => {
  if (!previewFile) return
  if (silentMode) return
  currentPreviewIndex.value = 0
  changePreviewFile(entity, previewFile, previousPreviewFileId)
  updateRoomStatus(previousPreviewFileId)
}

const changePreviewFile = (entity, previewFile, previousPreviewFileId) => {
  pause()
  const localEntity = entityList.value.find(
    s => s.id === entity.id && s.preview_file_id === previousPreviewFileId
  )
  if (!localEntity) return
  localEntity.preview_file_id = previewFile.id
  localEntity.preview_file_task_id = previewFile.task_id
  localEntity.preview_file_extension = previewFile.extension
  localEntity.preview_file_annotations = previewFile.annotations
  localEntity.preview_file_width = previewFile.width
  localEntity.preview_file_height = previewFile.height
  localEntity.preview_file_duration = previewFile.duration
  localEntity.preview_file_previews = previewFile.previews
  localEntity.preview_file_revision = previewFile.revision
  if (rawPlayer.value) {
    if (rawPlayer.value.getCurrentTimeRaw() < 0.1) {
      rawPlayer.value.loadEntity(playingEntityIndex.value, 0)
    } else {
      rawPlayer.value.reloadCurrentEntity()
    }
  }
  emit('preview-changed', {
    entity,
    previewFileId: previewFile.id,
    previousPreviewFileId
  })
  clearCanvas()
}

const onEntityDropped = info => {
  const playlistEl = playlistedEntities.value
  const scrollLeft = playlistEl.scrollLeft
  const entityToMove = findEntity(info.after)
  if (!entityToMove) {
    emit('new-entity-dropped', info)
  } else {
    const toMoveIndex = findEntityIndex(info.after)
    let targetIndex = findEntityIndex(info.before)
    if (toMoveIndex > targetIndex) targetIndex += 1
    silentMode = true
    moveSelectedEntity(entityToMove, toMoveIndex, targetIndex)
    nextTick(() => {
      playlistEl.scrollLeft = scrollLeft
      setTimeout(() => {
        silentMode = false
      }, 500)
    })
    emit('order-change', info)
  }
}

const moveSelectedEntityToLeft = () => {
  const toMoveIndex = playingEntityIndex.value
  const targetIndex = previousEntityIndex.value
  const entityToMove = currentEntity.value
  moveSelectedEntity(entityToMove, toMoveIndex, targetIndex)
  const info = {
    before: {
      entity_id: entityList.value[targetIndex].id,
      preview_file_id: entityList.value[targetIndex].preview_file_id
    },
    after: {
      entity_id: entityList.value[toMoveIndex].id,
      preview_file_id: entityList.value[toMoveIndex].preview_file_id
    }
  }
  emit('order-change', info)
}

const moveSelectedEntityToRight = () => {
  const toMoveIndex = playingEntityIndex.value
  const targetIndex = nextEntityIndex.value
  const entityToMove = currentEntity.value
  moveSelectedEntity(entityToMove, toMoveIndex, targetIndex)
  const info = {
    before: {
      entity_id: entityList.value[toMoveIndex].id,
      preview_file_id: entityList.value[toMoveIndex].preview_file_id
    },
    after: {
      entity_id: entityList.value[targetIndex].id,
      preview_file_id: entityList.value[targetIndex].preview_file_id
    }
  }
  emit('order-change', info)
}

const moveSelectedEntity = (entityToMove, toMoveIndex, targetIndex) => {
  if (!currentEntity.value) return
  if (playingEntityIndex.value >= 0) {
    if (toMoveIndex >= 0 && targetIndex >= 0) {
      const tmp = [...entityList.value]
      tmp.splice(toMoveIndex, 1)
      tmp.splice(targetIndex, 0, entityToMove)
      entityList.value = []
      nextTick(() => {
        entityList.value = tmp
        nextTick(() => {
          playingEntityIndex.value = targetIndex
          scrollToEntity(playingEntityIndex.value)
        })
      })
    }
  }
}

const resetHeight = () => {
  nextTick(() => {
    let height = window.innerHeight - 90
    if (!props.tempMode) {
      height = container.value ? container.value.offsetHeight : 0
    }
    height -= header.value ? header.value.offsetHeight : 0
    if (buttonBar.value) height -= buttonBar.value.offsetHeight
    if (playlistedEntities.value)
      height -= playlistedEntities.value.offsetHeight
    if (progress.value?.$el) height -= progress.value.$el.offsetHeight
    if (playlistProgressRef.value?.$el) {
      height -= playlistProgressRef.value.$el.offsetHeight
    }
    if (isWaveformDisplayed.value) height -= 60

    if (videoContainer.value) videoContainer.value.style.height = `${height}px`
    if (taskInfoRef.value?.$el && !isCommentsHidden.value) {
      taskInfoRef.value.$el.style.height = `${height}px`
    }
    if (fullPlaylistPlayer.value) {
      fullPlaylistPlayer.value.style.height = `${height}px`
    }
    pictureDefaultHeight.value = height
    rawPlayer.value?.resetHeight(height)
    if (isComparing.value && rawPlayerComparison.value) {
      rawPlayerComparison.value.resetHeight(height)
    }
    nextTick(() => {
      resetCanvas()
      updateProgressBar()
    })
  })
}

// Comparison side-effect wrappers (broadcast + player re-load belong here,
// the pure selection state lives in usePlaylistComparison).

const onCompareClicked = () => {
  toggleComparison()
  nextTick(() => {
    if (isComparing.value) saveUserComparisonChoice()
  })
  updateRoomStatus()
}

const saveUserComparisonChoice = () => {
  savedTaskTypeToCompare.value = taskTypeToCompare.value
  sendUpdatePlayingStatus()
}

const onTaskTypeToCompareChanged = () => {
  saveUserComparisonChoice()
  updateRoomStatus()
}

const onRevisionToCompareChanged = () => {
  if (isComparing.value) {
    nextTick(() => {
      pause()
      rawPlayerComparison.value?.loadEntity(playingEntityIndex.value)
      rawPlayerComparison.value?.setCurrentTimeRaw(currentTimeRaw.value)
      updateRoomStatus()
    })
  }
}

const onPreviousComparisonPictureClicked = () => {
  goToPreviousComparisonPicture()
  updateRoomStatus()
}

const onNextComparisonPictureClicked = () => {
  goToNextComparisonPicture()
  updateRoomStatus()
}

const resetComparison = () => {
  nextTick(() => {
    rawPlayerComparison.value?.loadEntity(playingEntityIndex.value)
    nextTick(() => {
      setTimeout(() => syncComparisonPlayer(), 100)
      if (isPlaying.value) play()
    })
  })
}

const toggleDlButtons = () => {
  isDlButtonsHidden.value = !isDlButtonsHidden.value
}

const onPictureLoaded = () => {
  nextTick(async () => {
    resetCanvasSize()
    const wasPlaying = isPlaying.value
    await resetPictureCanvas()
    isPlaying.value = wasPlaying
  })
}

const onObjectBackgroundSelected = () => {
  objectBackgroundUrl.value = currentBackground.value?.url
  const enabled = Boolean(objectBackgroundUrl.value)
  isObjectBackground.value = enabled
  isEnvironmentSkybox.value = enabled
}

const onBuildClicked = () => runBuild(false)
const onBuildFullClicked = () => runBuild(true)

const runBuild = (full = false) => {
  if (
    (isCurrentUserManager.value || isCurrentUserSupervisor.value) &&
    !isJobRunning.value &&
    !isBuildLaunched.value
  ) {
    isBuildLaunched.value = true
    store
      .dispatch('runPlaylistBuild', { playlist: props.playlist, full })
      .then(() => {
        isBuildLaunched.value = false
      })
      .catch(console.error)
  }
}

const playBuild = job => {
  isFullMode.value = true
  const path = getBuildPath(job)
  if (fullPlayingPath !== path) {
    fullPlayingPath = path
    fullPlaylistPlayer.value.src = path
    fullPlaylistPlayer.value.currentTime = 0
    setPlaylistProgress(0)
  }
}

const getBuildPath = job =>
  `/api/data/playlists/${props.playlist?.id}/jobs/${job.id}/build/mp4`

const formatDate = creationDate => {
  const date = moment.tz(creationDate, 'UTC').tz(timezone.value)
  return date.format('YYYY-MM-DD HH:mm')
}

const setPlaylistProgress = time => {
  playlistProgress.value = time
  const frame = Math.round(playlistProgress.value * fps.value)
  const pos = playlistShotPosition.value[frame]
  if (pos) {
    const entityIndex = pos.index
    if (entityIndex !== playingEntityIndex.value && entityIndex) {
      playEntity(entityIndex)
    }
  }
}

const onRemoveBuildJob = job => {
  job.playlist_id = props.playlist?.id
  store.dispatch('removeBuildJob', job)
}

const configureFullPlayer = () => {
  if (!fullPlaylistPlayer.value) return
  fullPlaylistPlayer.value.addEventListener('loadedmetadata', () => {
    playlistDuration.value = entityList.value.reduce(
      (acc, e) => acc + e.preview_file_duration,
      0
    )
  })
  fullPlaylistPlayer.value.addEventListener('ended', () => {
    pause()
  })
}

const onPreviousPreviewClicked = () => {
  const index = currentPreviewIndex.value - 1
  currentPreviewIndex.value =
    index < 0 ? currentEntityPreviewLength.value - 1 : index
  updateRoomStatus()
}

const onNextPreviewClicked = () => {
  const index = currentPreviewIndex.value + 1
  currentPreviewIndex.value =
    index > currentEntityPreviewLength.value - 1 ? 0 : index
  updateRoomStatus()
}

const onEntitiesWheel = event => {
  const isMouseWheelY = !event.deltaX
  if (isMouseWheelY) {
    event.preventDefault()
    if (playlistedEntities.value) {
      playlistedEntities.value.scrollLeft += event.deltaY
    }
  }
}

const onProgressPlaylistChanged = frameNumberValue => {
  if (isFullMode.value) {
    const time = frameNumberValue / fps.value
    fullPlaylistPlayer.value.currentTime = time
    playlistProgress.value = time
  }
  const pos = playlistShotPosition.value[frameNumberValue]
  if (!pos) return
  const { index, start } = pos
  const frame = (frameNumberValue / fps.value - start) * fps.value + 1
  if (index !== playingEntityIndex.value) {
    nextTick(() => {
      playEntity(index, false, frame)
      onFrameUpdate(frame)
    })
  } else {
    if (isCurrentPreviewPicture.value) {
      framesSeenOfPicture.value = frame + 1
    } else {
      setCurrentTimeRaw(frame / fps.value)
    }
  }
}

const configureWaveForm = () => {
  const element = document.getElementById('waveform')
  if (!element) return
  try {
    wavesurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: '#00B242',
      progressColor: '#008732',
      backend: 'MediaElement',
      mediaType: 'video',
      height: 60,
      fillParent: true,
      minPxPerSec: 1
    })
    wavesurfer.on('error', error => {
      console.error('Error loading audio:', error)
    })
    wavesurfer.on('seeking', onWaveformSeeking)
  } catch (err) {
    console.error(err)
  }
}

const onWaveformSeeking = position => {
  if (!isWaveformSeekingSilent && !isPlaying.value) {
    isWaveformSeekingSilent = true
    setCurrentTimeRaw(position)
    setTimeout(() => {
      isWaveformSeekingSilent = false
    }, 500)
  }
}

const loadWaveForm = () => {
  if (isWaveformDisplayed.value && isCurrentPreviewMovie.value) {
    if (rawPlayer.value?.currentPlayer?.src) {
      try {
        if (wavesurfer) wavesurfer.destroy()
        configureWaveForm()
        setTimeout(() => {
          wavesurfer.load(rawPlayer.value.currentPlayer.src)
        }, 100)
      } catch (err) {
        console.error('Error loading waveform:', err)
      }
    }
  } else {
    if (wavesurfer) wavesurfer.destroy()
  }
}

const resetHandles = entity => {
  if (!['shot', 'edit', 'episode'].includes(props.playlist?.for_entity)) return
  entity = entity || currentEntity.value
  const entityMapByType = {
    edit: editMap.value,
    episode: episodeMap.value,
    shot: shotMap.value
  }
  const source = entityMapByType[props.playlist.for_entity]?.get(entity?.id)
  handleIn.value = source?.data?.handle_in || 0
  handleOut.value = source?.data?.handle_out || nbFrames.value
}

const resetPlaylistFrameData = () => {
  let playlistDur = 0
  let curFrame = 0
  entityList.value.forEach((entity, index) => {
    const defaultNbFrames =
      entity.preview_nb_frames || 2 * fps.value * frameDuration.value
    framesPerImage.value[index] = defaultNbFrames
    const n =
      Math.round((entity.preview_file_duration || 0) * fps.value) ||
      defaultNbFrames
    entity.start_duration = (curFrame + 1) / fps.value
    for (let i = 0; i < n; i++) {
      playlistShotPosition.value[curFrame + i] = {
        index,
        name: entity.name,
        extension: entity.preview_file_extension,
        start: entity.start_duration,
        width: entity.preview_file_width,
        height: entity.preview_file_height,
        id: entity.preview_file_id
      }
    }
    curFrame += n
    playlistDur += n / fps.value

    const taskId = entity.preview_file_task_id
    const tk = taskMap.value.get(taskId)
    if (tk) {
      const taskStatus = taskStatusMap.value.get(tk.task_status_id)
      entity.task_status_color = taskStatus?.color
    }
  })
  playlistDuration.value = playlistDur
  return playlistDur
}

const onRawPlayerFrameUpdate = frame => {
  if (!isFullMode.value) onFrameUpdate(frame)
}

const onEntityDragStart = (event, entity) => {
  event.dataTransfer.setData('entityId', entity.id)
  event.dataTransfer.setData('previewFileId', entity.preview_file_id)
}

// Pan & zoom

const onResetZoomClicked = () => {
  clearFocus()
  resetPanZoom()
  panzoomTransform.value = { x: 0, y: 0, scale: 1 }
}

// Wheel-zoom and Alt+drag pan are always active on the main viewer,
// mirroring PreviewPlayer. The button only resets the transform —
// it does not toggle a mode any more.
const resumePanZoom = () => {
  rawPlayer.value?.resumePanZoom()
  picturePlayer.value?.resumePanZoom()
}

const resetPanZoom = () => {
  if (isCurrentPreviewMovie.value) {
    rawPlayer.value?.resetPanZoom()
  } else if (isCurrentPreviewPicture.value) {
    picturePlayer.value?.resetPanZoom()
  }
}

const setPanZoom = (x, y, scale) => {
  if (isCurrentPreviewMovie.value) {
    rawPlayer.value?.setPanZoom(x, y, scale)
  } else if (isCurrentPreviewPicture.value) {
    picturePlayer.value?.setPanZoom(x, y, scale)
  }
}

const setComparisonPanZoom = (x, y, scale) => {
  if (isCurrentPreviewMovie.value) {
    rawPlayerComparison.value?.setPanZoom(x, y, scale)
  } else if (isCurrentPreviewPicture.value) {
    picturePlayerComparison.value?.setPanZoom(x, y, scale)
  }
}

const onPanZoomChanged = ({ x, y, scale }) => {
  panzoomTransform.value = { x, y, scale }
  postPanZoomChanged(x, y, scale)
}

const onComparisonPanZoomChanged = ({ x, y, scale }) => {
  postComparisonPanZoomChanged(x, y, scale)
}

const resetPlaylist = () => {
  currentPreviewIndex.value = 0
  currentComparisonPreviewIndex.value = 0
  entityList.value = props.entities
  resetPlaylistFrameData()

  playingEntityIndex.value = 0
  pause()
  rawPlayer.value?.setCurrentFrame(0)
  currentTimeRaw.value = 0
  updateProgressBar()
  clearCanvas()
  annotations.value = []
  movieDimensions.value = { width: 0, height: 0 }
  isComparing.value = false
  if (entityList.value.length === 0) clearPlayer()
  resetHeight()
  resetCanvas().then(() => {
    if (currentPreview.value !== null) {
      resetHandles()
      movieDimensions.value = {
        width: currentPreview.value.width,
        height: currentPreview.value.height
      }
      annotations.value = currentEntity.value?.preview_file_annotations
      loadAnnotation(getAnnotation(0))
    }
  })
  rawPlayer.value?.setVolume(volume.value)
}

// Annotation tooling clicks

const onAnnotateClicked = () => {
  showCanvas()
  if (isDrawing.value) {
    if (fabricCanvas.value) fabricCanvas.value.isDrawingMode = false
    isDrawing.value = false
  } else {
    isShapeMode.value = false
    isTyping.value = false
    if (fabricCanvas.value) {
      fabricCanvas.value.isDrawingMode = true
      const brush = new PSBrush(fabricCanvas.value)
      fabricCanvas.value.freeDrawingBrush = brush
      brush.pressureManager.fallback = 0.5
    }
    _resetColor()
    _resetPencil()
    isDrawing.value = true
  }
}

const onTypeClicked = () => {
  const clickarea =
    canvasWrapper.value?.getElementsByClassName('upper-canvas')[0]
  showCanvas()
  if (isTyping.value) {
    isTyping.value = false
    clickarea?.removeEventListener('dblclick', addText)
  } else {
    if (fabricCanvas.value) fabricCanvas.value.isDrawingMode = false
    isShapeMode.value = false
    isDrawing.value = false
    isTyping.value = true
    clickarea?.addEventListener('dblclick', addText)
  }
}

const onShapeModeClicked = () => {
  toggleShapeMode()
  if (isShapeMode.value) {
    isDrawing.value = false
    isTyping.value = false
    if (!isAnnotationsDisplayed.value) isAnnotationsDisplayed.value = true
  }
}

const resetCanvasVisibility = () => {
  if (!canvasWrapper.value) return
  canvasWrapper.value.style.display = isAnnotationsDisplayed.value
    ? 'block'
    : 'none'
}

const resizeAnnotations = () => {
  resetCanvas().then(() => {
    reloadAnnotations()
    loadAnnotation()
  })
}

const resetCanvas = () => {
  clearCanvas()
  return resetCanvasSize().then(() => {
    if (fabricCanvas.value) fabricCanvas.value.renderAll()
    resetCanvasVisibility()
    return fabricCanvas.value
  })
}

// Preview-room helpers (kept in component because of heavy player deps)

const sendUpdatePlayingStatus = () => {
  if (isCurrentPreviewMovie.value) {
    onNextTimeUpdateActions.value.push(() => updateRoomStatus())
  } else {
    updateRoomStatus()
  }
}

// Keyboard shortcuts specific to PlaylistPlayer (entity navigation,
// reorder, HOME/END). Common shortcuts are wired through
// usePreviewShortcuts above.

const onKeyDown = event => {
  displayBars()
  if (['INPUT', 'TEXTAREA'].includes(event.target?.tagName)) return

  const HOMEKEY = 36
  const ENDKEY = 35
  const LEFTKEY = 37
  const RIGHTKEY = 39

  if ((event.keyCode === 46 || event.keyCode === 8) && fabricCanvas.value) {
    deleteSelection()
  } else if (event.keyCode === LEFTKEY) {
    event.preventDefault()
    event.stopPropagation()
    if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
      moveSelectedEntityToLeft()
    } else if (event.altKey) {
      onPlayPreviousEntityClicked()
      nextTick(() => {
        rawPlayer.value?.setCurrentFrame(nbFrames.value - 1)
        if (isFullMode.value && currentEntity.value) {
          const time =
            currentEntity.value.start_duration +
            currentEntity.value.preview_file_duration -
            frameDuration.value
          fullPlaylistPlayer.value.currentTime = time
          playlistProgress.value = time
          setCurrentTimeRaw(
            currentEntity.value.preview_file_duration - frameDuration.value
          )
          updateProgressBar()
        }
      })
    } else {
      onPreviousFrameClicked()
    }
  } else if (event.keyCode === RIGHTKEY) {
    event.preventDefault()
    event.stopPropagation()
    if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
      moveSelectedEntityToRight()
    } else if (event.altKey) {
      onPlayNextEntityClicked()
      nextTick(() => {
        rawPlayer.value?.setCurrentFrame(0)
      })
    } else {
      onNextFrameClicked()
    }
  } else if (event.keyCode === 32) {
    event.preventDefault()
    event.stopPropagation()
    onPlayPauseClicked()
  } else if (event.altKey && event.keyCode === 74) {
    event.preventDefault()
    event.stopPropagation()
    onPlayPreviousEntityClicked()
  } else if (event.altKey && event.keyCode === 75) {
    event.preventDefault()
    event.stopPropagation()
    onPlayNextEntityClicked()
  } else if (
    (event.ctrlKey || event.metaKey) &&
    event.altKey &&
    event.keyCode === 68
  ) {
    onAnnotateClicked()
  } else if ((event.ctrlKey || event.metaKey) && event.keyCode === 90) {
    event.preventDefault()
    undoLastAction()
  } else if (event.altKey && event.keyCode === 82) {
    redoLastAction()
  } else if (event.keyCode === HOMEKEY) {
    rawPlayer.value?.setCurrentFrame(0)
  } else if (event.keyCode === ENDKEY) {
    rawPlayer.value?.setCurrentFrame(nbFrames.value - 1)
  }
}

const onWindowResize = () => {
  const now = new Date().getTime()
  if (now - lastResizeCall > 100) {
    lastResizeCall = now
    setTimeout(() => {
      resetHeight()
      resizeAnnotations()
    }, 200)
  }
}

// Socket handler for annotation refresh (was in playerMixin)

const onPreviewFileAnnotationUpdate = eventData => {
  if (
    props.tempMode ||
    !currentPreview.value ||
    !previewFileMap.value.get(eventData.preview_file_id)
  ) {
    return
  }
  store
    .dispatch('refreshPreview', {
      previewId: eventData.preview_file_id,
      taskId: currentPreview.value.task_id
    })
    .then(preview => {
      if (
        !notSaved.value &&
        currentPreview.value?.id === eventData.preview_file_id &&
        !isWriting(eventData.updated_at)
      ) {
        const isAnnotationSizeChanged =
          annotations.value.length !== preview.annotations.length
        annotations.value = preview.annotations
        const isLiveRoom = !room.value?.people?.length
        if (isAnnotationSizeChanged) reloadAnnotations(isLiveRoom)
      }
    })
}

// Watchers

watch(isAnnotationsDisplayed, () => {
  isRoomSilent = true
  if (!isAnnotationsDisplayed.value) {
    if (isDrawing.value) onAnnotateClicked()
    else if (isTyping.value) onTypeClicked()
  }
  isRoomSilent = false
  resetCanvasVisibility()
  if (!isRoomSilent) updateRoomStatus()
})

watch(isDrawing, () => {
  if (!isDrawing.value && isLaserModeOn.value) isLaserModeOn.value = false
  if (isDrawing.value && !isAnnotationsDisplayed.value) {
    isAnnotationsDisplayed.value = true
  }
})

watch(isTyping, () => {
  if (!isAnnotationsDisplayed.value) isAnnotationsDisplayed.value = true
})

watch(
  () => objectModel.value.currentAnimation,
  () => {
    if (isCurrentPreviewModel.value && objectModel.value.isAnimation) {
      playModel()
    }
  }
)

watch(framesSeenOfPicture, () => {
  if (isCurrentPreviewPicture.value) {
    updateProgressBar(framesSeenOfPicture.value - 1)
  }
})

watch(
  () => props.isLoading,
  () => {
    if (!props.isLoading) resetHeight()
  }
)

watch(currentPreviewIndex, () => {
  endAnnotationSaving()
  resetUndoStacks()
  resetHeight()
  nextTick(() => {
    if (isCurrentPreviewPicture.value) resetPictureCanvas()
    else resetCanvas()
  })
  if (currentPreview.value) {
    resetPanZoom()
    movieDimensions.value = {
      width: currentPreview.value.width,
      height: currentPreview.value.height
    }
  }
})

watch(playingEntityIndex, () => {
  endAnnotationSaving()
  resetUndoStacks()
  currentPreviewIndex.value = 0
  currentComparisonPreviewIndex.value = 0
  if (isCurrentPreviewMovie.value) {
    nextTick(() => {
      loadWaveForm()
      if (isPlaying.value) play()
    })
  } else if (wavesurfer && isWaveformDisplayed.value) {
    wavesurfer.destroy()
  }
  if (currentEntity.value) {
    annotations.value = currentEntity.value.preview_file_annotations || []
    movieDimensions.value = {
      width: currentPreview.value?.width,
      height: currentPreview.value?.height
    }
  }
  nextTick(() => {
    nextTick(() => {
      if (isCurrentPreviewPicture.value && !isPlaying.value) {
        triggerResize()
        resetHeight()
        resetPictureCanvas()
      } else {
        resetCanvas()
      }
      resetPanZoom()
      resetCanvasVisibility()
    })
  })
})

watch(fullScreen, () => {
  resetHeight()
  setTimeout(() => {
    if (isCurrentPreviewPicture.value) {
      triggerResize()
      resetHeight()
      resetPictureCanvas()
    }
  }, RESIZE_DELAY)
})

watch(isComparing, () => {
  if (isComparing.value) {
    pause()
    resetComparison()
  } else {
    clearComparisonCanvas()
    panzoomTransform.value = { x: 0, y: 0, scale: 1 }
  }
  nextTick().then(() => {
    triggerResize()
    resetPictureCanvas()
    resetCanvas()
    syncComparisonPlayer()
    if (isComparing.value) {
      // Apply the main viewer's current panzoom to the comparison
      // viewer. The PictureViewer-side isComparing watcher resets its
      // own panzoom on activation, and MultiVideoViewer starts at the
      // identity transform — without this push the two viewers end up
      // visually out of sync until the user nudges the wheel again.
      const { x, y, scale } = panzoomTransform.value
      setComparisonPanZoom(x, y, scale)
    }
    if (isComparing.value && !isComparisonOverlay.value) {
      loadComparisonAnnotation(currentTimeRaw.value)
    }
  })
})

watch(currentRevisionToCompare, () => {
  if (isComparing.value && !isComparisonOverlay.value) {
    loadComparisonAnnotation(currentTimeRaw.value)
  }
})

// PlayerComparisonBar drives these via v-model only (no change events), so we
// re-derive the side effects the inline @update:model-value handlers used to
// run: refresh the saved choice + broadcast, reload the comparison player on
// revision change, and rebroadcast the room status on mode change.
watch(taskTypeToCompare, (newVal, oldVal) => {
  if (newVal && oldVal !== null && newVal !== oldVal) {
    onTaskTypeToCompareChanged()
  }
  if (isComparing.value) resetComparison()
})

watch(revisionToCompare, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    onRevisionToCompareChanged()
  }
})

watch(comparisonMode, () => {
  if (isComparing.value) updateRoomStatus()
})

// Mirror the main viewer's panzoom on the comparison <video> so both
// stay in sync. The annotation overlay picks up the same transform via
// its panzoom-transform prop. setComparisonPanZoom runs in silent mode
// inside MultiVideoViewer, so the resulting panzoom-changed event is
// suppressed and we don't get a feedback loop.
watch(
  panzoomTransform,
  ({ x, y, scale }) => {
    if (isComparing.value) setComparisonPanZoom(x, y, scale)
  },
  { deep: true }
)

watch(
  () => props.entities,
  () => {
    resetPlaylist()
  }
)

watch(
  () => props.entities?.length ?? 0,
  () => {
    // Parent mutates currentEntitiesList in place on add/remove (no ref
    // change), so the ref-level watcher above misses it. Re-aliasing here
    // forces the v-for over entityList to pick up the new content.
    entityList.value = props.entities ?? []
  }
)

watch(
  () => props.playlist,
  (newPlaylist, oldPlaylist) => {
    if (oldPlaylist) {
      if (room.value?.people?.includes(user.value?.id)) leaveRoom()
      closeRoom(oldPlaylist.id)
    }
    endAnnotationSaving()
    room.value.id = props.playlist?.id
    room.value.localId = uuidv4()
    openRoom(newPlaylist?.id)
    nextTick(() => {
      updateProgressBar()
      clearCanvas()
      nextTick(() => {
        if (currentPreview.value) {
          movieDimensions.value = {
            width: currentPreview.value.width,
            height: currentPreview.value.height
          }
        }
      })
    })
  }
)

watch(
  () => props.isAddingEntity,
  () => {
    nextTick(() => updateProgressBar())
  }
)

watch(
  () => props.initialShareLinksCount,
  count => {
    hasActiveShareLinks.value = count > 0
  },
  { immediate: true }
)

watch(isEntitiesHidden, () => {
  nextTick(() => {
    setTimeout(() => triggerResize(), RESIZE_DELAY)
  })
})

watch(isComparisonOverlay, () => {
  nextTick(() => {
    resetCanvas().then(reloadCurrentAnnotation)
  })
})

watch(isWaveformDisplayed, () => {
  if (isWaveformDisplayed.value) {
    resetHeight()
    loadWaveForm()
  }
  nextTick(() => updateRoomStatus())
})

watch(isLaserModeOn, () => {
  if (!isDrawing.value && isLaserModeOn.value) onAnnotateClicked()
  updateRoomStatus()
})

watch(isFullMode, () => {
  isComparing.value = false
  if (isFullMode.value) {
    nextTick(() => playEntity(0))
  } else {
    fullPlayingPath = ''
    onFrameUpdate(0)
  }
})

watch(volume, () => {
  rawPlayer.value?.setVolume(volume.value)
  preferences.setPreference('player:volume', volume.value)
})

watch(isCommentsHidden, () => {
  if (isCurrentPreviewSound.value) soundPlayer.value?.redraw()
})

watch(speed, () => {
  const rates = [0.25, 0.5, 1, 1.5, 2]
  const rate = rates[speed.value - 1]
  setPlayerSpeed(rate)
  updateRoomStatus()
})

// Lifecycle

onMounted(() => {
  if (isMounted) return
  scrubbing = false
  if (isCurrentUserClient.value) isCommentsHidden.value = false
  isHd.value = Boolean(organisation.value?.hd_by_default)
  entityList.value = props.entities ? props.entities : []
  resetPlaylistFrameData()
  room.value.id = props.playlist?.id
  room.value.localId = uuidv4()
  nextTick(() => {
    window.addEventListener('keydown', onKeyDown, false)
    window.addEventListener('resize', onWindowResize)
    if (container.value) {
      container.value.onmousemove = onMouseMove
    }
    window.addEventListener('beforeunload', onWindowsClosed)
    resetCanvas()
    setPlayerSpeed(1)
    onFrameUpdate(0)
    configureWaveForm()
    configureFullPlayer()
    resumePanZoom()
  })
  currentBackground.value =
    productionBackgrounds.value.find(isDefaultBackground) || null
  onObjectBackgroundSelected()
  isMounted = true

  resetPencilConfiguration()

  volume.value = preferences.getPreference('player:volume') || volume.value
  nextTick(() => {
    rawPlayer.value?.setVolume(volume.value)
  })

  // Socket handler for annotation refresh (was top-level
  // socket.events['preview-file:annotation-update'] in playerMixin).
  $socket.on('preview-file:annotation-update', onPreviewFileAnnotationUpdate)
})

onBeforeUnmount(() => {
  endAnnotationSaving()
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('resize', onWindowResize)
  window.removeEventListener('beforeunload', onWindowsClosed)
  if (container.value) container.value.onmousemove = null
  leaveRoom()
  $socket.off('preview-file:annotation-update', onPreviewFileAnnotationUpdate)
  if (wavesurfer) wavesurfer.destroy()
})

// Public API for the parent's `$refs['playlist-player']` and for the
// `playerProxy` passed to TaskInfo. We can't bind `:player="this"` from
// <script setup> — the public proxy is restricted and TaskInfo's internal
// access patterns trigger enumeration warnings and a recursive update
// cycle. The plain-object proxy below mirrors only what TaskInfo
// actually calls on the player.

defineExpose({
  clearCanvas,
  confirmAnnotationsSaved,
  extractAnnotationSnapshots,
  fullScreen,
  hideCanvas,
  isFullMode,
  joinedRoom,
  onEntityDropped,
  onWindowResize,
  pause,
  resetHeight,
  resetPlaylist,
  restoreFailedAnnotations,
  scrollToRight,
  showCanvas
})

const playerProxy = {
  extractAnnotationSnapshots: () => extractAnnotationSnapshots()
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

  .playlist-button.edit-button,
  .playlist-button.delete-button {
    margin-left: 5px;
    margin-right: 0;
  }

  .playlist-button.delete-button {
    margin-right: 10px;
  }
}

.has-active-links {
  color: $purple-strong;
  border-color: $purple-strong;
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
    transition: all 0.3s ease;

    &:hover {
      background: var(--background-tag-button);
      border-radius: 5px;
      // transform: scale(1.2);
    }

    &.topbar-button {
      border: 1px solid var(--border);
      border-radius: 10px;
      margin-right: 0.5em;
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
  height: 32px;
  padding-right: 5px;
  font-variant-numeric: tabular-nums;
}

// Match .playlist-button look on bar buttons that come from child
// components (PlayerComparisonBar, PlayerPlaybackBar), since scoped
// styles otherwise stop at the component boundary.
.playlist-footer :deep(.button) {
  margin: 0;
  background: none;
  border: 0;
  border-radius: 0;
  transition: all 0.3s ease;

  &:hover {
    background: var(--background-tag-button);
    border-radius: 5px;
  }

  &.active {
    color: var(--background-selectable);
  }
}

.playlisted-entities {
  border-top: 1px solid $dark-grey-strong;
  padding: 0.4em 0 0 0.4em;
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

.main-content-anchor,
.comparison-content-anchor {
  position: absolute;
  pointer-events: none;
}

.mr1 {
  margin-right: 1em;
}

.mr0 {
  margin-right: 0;
}

.playlist-header,
.playlist-progress,
.video-progress {
  transition: opacity 0.5s ease;
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
  width: 200px;
  left: -120px;
  top: -280px;
  height: 160px;
  z-index: 300;
}

.build-list {
  background: $dark-grey-stronger;
  border: 1px solid $dark-grey-light;
  position: absolute;
  width: 200px;
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

.job-button {
  background: transparent;
  border-radius: 50%;
  width: 22px;
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

.playlisted-wrapper {
  margin-right: 0;
}

.picture-preview-wrapper {
  display: flex;
  height: inherit;
  justify-content: center;
  align-items: center;
  flex: 1;
  z-index: 3;
}

.picture-preview-comparison-wrapper {
  display: flex;
  height: inherit;
  justify-content: center;
  align-items: center;
  flex: 1;
  z-index: 1;
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

.disabled {
  color: $grey;
}

#resize-annotation-canvas,
#annotation-snapshot {
  display: none;
}

.full-button {
  &:hover {
    border: 1px solid var(--text);
  }
}

.playlist-button.button.active {
  color: var(--background-selectable);

  img.active {
    filter: invert(59%) sepia(38%) saturate(660%) hue-rotate(201deg)
      brightness(95%) contrast(93%);
    box-shadow: none;
  }
}
</style>
