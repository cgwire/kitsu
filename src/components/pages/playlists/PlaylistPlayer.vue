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
        icon="plus"
        :text="addEntitiesText"
        @click="$emit('show-add-entities')"
        :active="
          !(
            (isCurrentUserManager || isCurrentUserSupervisor) &&
            !isAddingEntity &&
            !isFullMode
          )
        "
      />
      <button-simple
        @click="$emit('edit-clicked')"
        class="edit-button playlist-button flexrow-item"
        :title="$t('playlists.actions.edit')"
        icon="edit"
        v-if="isCurrentUserManager || isCurrentUserSupervisor"
      />
      <button-simple
        @click="showDeleteModal"
        class="delete-button playlist-button flexrow-item"
        :title="$t('playlists.actions.delete')"
        icon="trash"
        v-if="isCurrentUserManager || isCurrentUserSupervisor"
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
        <video
          ref="full-playlist-player"
          class="raw-player"
          :style="{
            position: isComparisonOverlay ? 'absolute' : 'relative'
          }"
          v-show="isFullMode"
        />

        <raw-video-player
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
          :handle-in="playlist.for_entity === 'shot' ? handleIn : -1"
          :handle-out="playlist.for_entity === 'shot' ? handleOut : -1"
          v-show="
            isComparing &&
            isCurrentPreviewMovie &&
            isMovieComparison &&
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
            high-quality
            @loaded="onPictureLoaded"
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
            :big="true"
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
            @panzoom-changed="onPanZoomChanged"
            high-qualiy
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
        class="flexrow-item task-info-column"
        :current-frame="parseInt(currentFrame) - 1"
        :current-parent-preview="currentPreview"
        :fps="fps"
        :extendable="false"
        :is-preview="false"
        :silent="isCommentsHidden"
        :task="task"
        :player="this"
        :show-assignees="isCurrentUserManager || isCurrentUserSupervisor"
        @time-code-clicked="onTimeCodeClicked"
        v-show="!isCommentsHidden"
      />
    </div>

    <video-progress
      ref="video-progress"
      class="video-progress pull-bottom"
      :annotations="annotations"
      :entity-ist="entityList"
      :empty="!isCurrentPreviewMovie"
      :fps="fps"
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

      <div
        class="flexrow flexrow-item mr0"
        v-if="
          isCurrentPreviewMovie ||
          isCurrentPreviewPicture ||
          isCurrentPreviewSound ||
          isCurrentPreviewModel
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

        <combobox-styled
          class="flexrow-item"
          :options="objectModel.availableAnimations"
          :is-dark="true"
          :thin="true"
          is-reversed
          v-model="objectModel.currentAnimation"
          v-if="objectModel.isAnimation"
        />
      </div>

      <div
        class="flexrow flexrow-item mr0"
        v-if="isCurrentPreviewMovie && !isFullMode"
      >
        <span
          class="flexrow-item time-indicator"
          :title="$t('playlists.actions.current_time')"
        >
          {{ currentTime }}
        </span>
        <span
          class="flexrow-item time-indicator is-hidden-touch is-hidden-desktop-only"
        >
          /
        </span>
        <span
          class="flexrow-item time-indicator is-hidden-touch is-hidden-desktop-only"
          :title="$t('playlists.actions.max_duration')"
        >
          {{ maxDuration }}
        </span>
        <span
          class="flexrow-item time-indicator mr05 nowrap"
          :title="$t('playlists.actions.frame_number')"
        >
          ({{ currentFrame }}
          <span class="is-hidden-touch is-hidden-desktop-only">
            / {{ (nbFrames + '').padStart(3, '0') }} </span
          >)
        </span>
      </div>

      <div class="separator"></div>

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
        <div class="separator" v-if="!isCurrentPreviewPicture"></div>
      </div>

      <div
        class="flexrow flexrow-item mr0"
        v-if="isCurrentPreviewMovie && !isFullMode"
      >
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
          icon="waveform"
          @click="isWaveformDisplayed = !isWaveformDisplayed"
        />
      </div>

      <div class="separator" v-if="!isFullMode"></div>
      <button-simple
        class="playlist-button flexrow-item"
        :title="$t('playlists.actions.change_task_type')"
        icon="check"
        @click="showTaskTypeModal"
        v-if="!tempMode && !isFullMode"
      />
      <div
        class="flexrow flexrow-item comparison-buttons"
        v-if="(isCurrentPreviewMovie || isCurrentPreviewPicture) && !isFullMode"
      >
        <button-simple
          class="comparison-button flexrow-item playlist-button"
          :active="isComparing"
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
            @update:model-value="onTaskTypeToCompareChanged"
            v-if="isComparing"
          />
          <combobox
            class="playlist-button flexrow-item comparison-list"
            :options="revisionOptions"
            @update:model-value="onRevisionToCompareChanged"
            v-model="revisionToCompare"
            v-if="isComparing"
          />
          <combobox
            class="playlist-button flexrow-item comparison-list"
            :options="comparisonModeOptions"
            v-model="comparisonMode"
            @update:model-value="updateRoomStatus"
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

      <div class="flexrow" v-if="isCurrentPreviewModel">
        <combobox-styled
          class="background-combo mr05"
          :active="Boolean(currentBackground)"
          :disabled="!productionBackgrounds.length"
          :is-compact="!productionBackgrounds.length"
          is-reversed
          keep-order
          thin
          :options="backgroundOptions"
          v-model="currentBackground"
          @change="onObjectBackgroundSelected()"
        >
          <template #icon>
            <globe-icon class="icon is-small mr05" />
          </template>
        </combobox-styled>
        <button-simple
          class="playlist-button flexrow-item"
          :active="isObjectBackground && isEnvironmentSkybox"
          :disabled="!objectBackgroundUrl || !isObjectBackground"
          icon="image"
          :title="$t('playlists.actions.toggle_environment_skybox')"
          @click="isEnvironmentSkybox = !isEnvironmentSkybox"
        />
        <button-simple
          class="playlist-button flexrow-item"
          :active="isWireframe"
          icon="codepen"
          :title="$t('playlists.actions.toggle_wireframe')"
          @click="isWireframe = !isWireframe"
        />
      </div>

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
      <div
        class="flexrow"
        v-if="
          !isCurrentUserArtist &&
          (isCurrentPreviewMovie || isCurrentPreviewPicture) &&
          !isFullMode
        "
      >
        <div
          class="separator"
          v-if="(isCurrentUserManager || isCurrentUserSupervisor) && tempMode"
        ></div>
        <button-simple
          class="playlist-button flexrow-item"
          :active="isAnnotationsDisplayed"
          icon="pen"
          :title="$t('playlists.actions.toggle_annotations')"
          v-if="
            (isCurrentUserManager || isCurrentUserSupervisor) && !isAddingEntity
          "
          @click="isAnnotationsDisplayed = !isAnnotationsDisplayed"
        />
        <button-simple
          class="playlist-button flexrow-item"
          :active="isZoomEnabled"
          icon="loupe"
          :title="$t('playlists.actions.annotation_zoom_pan')"
          @click="isZoomEnabled = !isZoomEnabled"
          v-if="isCurrentPreviewMovie || isCurrentPreviewPicture"
        />
        <transition name="slide">
          <div class="annotation-tools" v-show="isTyping">
            <color-picker
              :color="textColor"
              @toggle-palette="onPickPencilColor"
              @change="onChangeTextColor"
            />
          </div>
        </transition>
        <button-simple
          class="playlist-button flexrow-item"
          :active="isTyping"
          :title="$t('playlists.actions.annotation_text')"
          @click="onTypeClicked"
          icon="type"
        />

        <transition name="slide">
          <div class="annotation-tools" v-show="isDrawing">
            <pencil-picker
              :pencil="pencilWidth"
              :sizes="pencilPalette"
              @toggle-palette="onPickPencilWidth"
              @change="onChangePencilWidth"
            />

            <color-picker
              :color="pencilColor"
              @toggle-palette="onPickPencilColor"
              @change="onChangePencilColor"
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
          class="playlist-button flexrow-item"
          :active="isLaserModeOn"
          icon="laser"
          :title="$t('playlists.actions.toggle_laser')"
          v-if="
            (isCurrentUserManager || isCurrentUserSupervisor) && !isAddingEntity
          "
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
          icon="delete"
          :title="$t('playlists.actions.annotation_delete')"
          @click="onDeleteClicked"
        />
      </div>
      <div class="separator"></div>
      <button-simple
        class="button playlist-button flexrow-item"
        :active="!isCommentsHidden"
        :title="$t('playlists.actions.comments')"
        @click="onCommentClicked"
        icon="comment"
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
import {
  ArrowUpRightIcon,
  DownloadIcon,
  GlobeIcon,
  PlayIcon
} from 'lucide-vue-next'
import moment from 'moment-timezone'
import { v4 as uuidv4 } from 'uuid'
import WaveSurfer from 'wavesurfer.js'

import { defineAsyncComponent } from 'vue'
import { mapActions, mapGetters } from 'vuex'

import { formatFrame } from '@/lib/video'

import { annotationMixin } from '@/components/mixins/annotation'
import { domMixin } from '@/components/mixins/dom'
import { previewRoomMixin } from '@/components/mixins/previewRoom'
import { playerMixin } from '@/components/mixins/player'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ColorPicker from '@/components/widgets/ColorPicker.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import MultiPictureViewer from '@/components/previews/MultiPictureViewer.vue'
import ObjectViewer from '@/components/previews/ObjectViewer.vue'
import PencilPicker from '@/components/widgets/PencilPicker.vue'
import PlaylistedEntity from '@/components/pages/playlists/PlaylistedEntity.vue'
import PictureViewer from '@/components/previews/PictureViewer.vue'
import RawVideoPlayer from '@/components/pages/playlists/RawVideoPlayer.vue'
import PreviewRoom from '@/components/widgets/PreviewRoom.vue'
import SelectTaskTypeModal from '@/components/modals/SelectTaskTypeModal.vue'
import SoundViewer from '@/components/previews/SoundViewer.vue'
import Spinner from '@/components/widgets/Spinner.vue'
const TaskInfo = () => import('@/components/sides/TaskInfo.vue')
import PlaylistProgress from '@/components/previews/PlaylistProgress.vue'
import VideoProgress from '@/components/previews/VideoProgress.vue'

export default {
  name: 'playlist-player',

  mixins: [annotationMixin, domMixin, previewRoomMixin, playerMixin],

  components: {
    ArrowUpRightIcon,
    ButtonSimple,
    ColorPicker,
    Combobox,
    ComboboxStyled,
    DeleteModal,
    DownloadIcon,
    GlobeIcon,
    ObjectViewer,
    PencilPicker,
    PictureViewer,
    MultiPictureViewer,
    PlayIcon,
    PlaylistProgress,
    PlaylistedEntity,
    PreviewRoom,
    RawVideoPlayer,
    SelectTaskTypeModal,
    SoundViewer,
    Spinner,
    TaskInfo: defineAsyncComponent(TaskInfo),
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

  emits: [
    'edit-clicked',
    'entity-to-add',
    'new-entity-dropped',
    'order-change',
    'playlist-deleted',
    'preview-changed',
    'save-clicked',
    'show-add-entities',
    'remove-entity',
    'task-type-changed'
  ],

  data() {
    return {
      buildLaunched: false,
      comparisonEntityMissing: false,
      comparisonMode: 'sidebyside',
      currentBackground: null,
      currentComparisonPreviewIndex: 0,
      handleIn: 0,
      handleOut: 0,
      isAnnotationsDisplayed: true,
      isBuildLaunched: false,
      isDlButtonsHidden: true,
      isEnvironmentSkybox: false,
      isFullMode: false,
      isLaserModeOn: false,
      isMounted: false,
      isObjectBackground: false,
      isShowingPalette: false,
      isShowingPencilPalette: false,
      isShowAnnotationsWhilePlaying: false,
      isWaveformDisplayed: false,
      isWireframe: false,
      isZoomEnabled: false,
      movieDimensions: { width: 0, height: 0 },
      objectBackgroundUrl: null,
      pictureDefaultHeight: 0,
      playlistShotPosition: {},
      playlistDuration: 0,
      playlistProgress: 0,
      playlistToEdit: {},
      revisionOptions: [],
      savedTaskTypeToCompare: null,
      taskTypeOptions: [],
      taskTypeToCompare: null,
      revisionToCompare: null,
      objectModel: {
        availableAnimations: [],
        currentAnimation: null,
        isAnimation: null
      },
      room: {
        people: [],
        newComer: true
      },
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
      speedTextMap: ['x0.25', 'x0.50', 'x1.00', 'x1.50', 'x2.00']
    }
  },

  mounted() {
    if (this.isMounted) return
    this.$options.scrubbing = false
    this.isHd = Boolean(this.organisation.hd_by_default)
    if (this.entities) {
      this.entityList = Object.values(this.entities)
    } else {
      this.entityList = []
    }
    this.resetPlaylistFrameData()
    this.room.id = this.playlist.id
    this.room.localId = uuidv4()
    this.$nextTick(() => {
      this.configureEvents()
      this.setupFabricCanvas()
      this.resetCanvas()
      this.setPlayerSpeed(1)
      this.rebuildComparisonOptions()
      this.onFrameUpdate(0)
      this.configureWaveForm()
      this.configureFullPlayer()
    })
    this.currentBackground =
      this.productionBackgrounds.find(this.isDefaultBackground) || null
    this.onObjectBackgroundSelected()
    this.isMounted = true

    this.resetPencilConfiguration()
  },

  beforeUnmount() {
    if (this.wavesurfer) {
      this.wavesurfer.destroy()
    }
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'isCurrentUserArtist',
      'isCurrentUserClient',
      'isCurrentUserManager',
      'isCurrentUserSupervisor',
      'isTVShow',
      'organisation',
      'previewFileMap',
      'productionBackgrounds',
      'shotMap',
      'productionAssetTaskTypes',
      'productionSequenceTaskTypes',
      'productionShotTaskTypes',
      'taskMap',
      'taskStatusMap',
      'taskTypeMap',
      'user'
    ]),

    fullPlayer() {
      return this.$refs['full-playlist-player']
    },

    picturePreviews() {
      const picturePreviews = []
      this.entityList.forEach(e => {
        picturePreviews.push({
          id: e.preview_file_id,
          height: e.preview_file_height,
          width: e.preview_file_width,
          extension: e.preview_file_extension,
          revision: e.preview_file_revision,
          position: 1
        })
        if (e.preview_file_previews) {
          e.preview_file_previews.forEach((p, index) => {
            picturePreviews.push({
              id: p.id,
              height: p.height,
              width: p.width,
              extension: p.extension,
              revision: p.revision,
              position: index + 2
            })
          })
        }
      })
      return picturePreviews
    },

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
        return this.productionAssetTaskTypes
      } else if (this.playlist.for_entity === 'shot') {
        return this.productionShotTaskTypes
      } else {
        return this.productionSequenceTaskTypes
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
    },

    backgroundOptions() {
      const defaultFlag = this.$t('playlists.actions.default')
      return [
        {
          label: this.$t('playlists.actions.select_background'),
          value: null,
          placeholder: true
        },
        ...this.productionBackgrounds.map(background => ({
          value: background,
          label: background.name,
          optionLabel:
            background.name +
            (this.isDefaultBackground(background) ? ` (${defaultFlag})` : '')
        }))
      ]
    },

    backgroundUrl() {
      return this.isObjectBackground ? this.objectBackgroundUrl : undefined
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
      this.currentPreviewIndex = 0
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
      const index = this.currentPreviewIndex
      if (index > 0) {
        this.onPreviousPreviewClicked()
      } else {
        this.onPlayPreviousEntity()
      }
    },

    onPlayPreviousEntity() {
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
      const index = this.currentPreviewIndex
      if (index < this.currentEntityPreviewLength - 1) {
        this.onNextPreviewClicked()
      } else {
        this.onPlayNextEntity()
      }
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
          this.framesSeenOfPicture = 1
          this.playPicture()
          this.updateProgressBar()
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
        this.framesSeenOfPicture = Math.max(
          Math.floor((durationWaited / 1000) * this.fps),
          1
        )
        this.playingPictureTimeout = setTimeout(() => {
          this.continuePlayingPlaylist(entityIndex, startMs)
        }, 100)
        return
      }

      // we've seen all the frames the picture should be visible
      const previews = this.currentEntity.preview_file_previews
      if (previews.length === this.currentPreviewIndex) {
        this.$nextTick(() => {
          this.onPlayNextEntity(true)
          this.framesSeenOfPicture = 1
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
      if (this.currentPreview) {
        this.movieDimensions = {
          width: this.currentPreview.width,
          height: this.currentPreview.height
        }
        if (!this.isPlaying) {
          this.loadAnnotation(this.getAnnotation(0))
        }
      }
    },

    onModelLoaded() {
      const animations = this.modelPlayer?.getAnimations() || []
      this.objectModel.isAnimation = animations.length > 0
      if (this.objectModel.isAnimation) {
        this.objectModel.availableAnimations = animations.map(animation => ({
          label: animation,
          value: animation
        }))
        this.objectModel.currentAnimation = animations[0]
        this.$nextTick(() => {
          this.playModel()
        })
      } else {
        this.objectModel.availableAnimations = []
        this.objectModel.currentAnimation = null
      }
    },

    onPreviewChanged(entity, previewFile) {
      if (!previewFile) return
      this.currentPreviewIndex = 0
      this.changePreviewFile(entity, previewFile)
      this.updateRoomStatus()
    },

    changePreviewFile(entity, previewFile) {
      this.pause()
      const localEntity = this.entityList.find(s => s.id === entity.id)
      localEntity.preview_file_id = previewFile.id
      localEntity.preview_file_task_id = previewFile.task_id
      localEntity.preview_file_extension = previewFile.extension
      localEntity.preview_file_annotations = previewFile.annotations
      localEntity.preview_file_width = previewFile.width
      localEntity.preview_file_height = previewFile.height
      localEntity.preview_file_duration = previewFile.duration
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

    /*
     * Called when an entity is dropped in the playlist. The entity is moved
     * to the new position and the order of the entities is updated.
     * @param {Object} info - {
     *   before: where entity is dropped (id of the entity before),
     *   after: the id of the entity dropped.
     * }
     */
    onEntityDropped(info) {
      const playlistEl = this.$refs['playlisted-entities']
      const scrollLeft = playlistEl.scrollLeft
      const entityToMove = this.entityList.find(s => s.id === info.after)
      if (!entityToMove) {
        this.$emit('new-entity-dropped', info)
      } else {
        const toMoveIndex = this.entityList.findIndex(s => s.id === info.after)
        let targetIndex = this.entityList.findIndex(s => s.id === info.before)
        if (toMoveIndex > targetIndex) targetIndex += 1
        this.moveSelectedEntity(entityToMove, toMoveIndex, targetIndex)
        this.$nextTick(() => {
          playlistEl.scrollLeft = scrollLeft
        })
        this.$emit('order-change', info)
      }
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
        if (this.$refs['playlist-progress']) {
          height -= this.$refs['playlist-progress'].$el.offsetHeight
        }
        if (this.isWaveformDisplayed) {
          height -= 60
        }

        if (this.$refs['video-container']) {
          this.$refs['video-container'].style.height = `${height}px`
        }
        if (this.$refs['task-info'] && !this.isCommentsHidden) {
          this.$refs['task-info'].$el.style.height = `${height}px`
        }
        if (this.$refs['picture-preview-wrapper']) {
          this.$refs['picture-preview-wrapper'].style.height = `${height}px`
        }

        if (this.$refs['full-playlist-player']) {
          this.$refs['full-playlist-player'].style.height = `${height}px`
        }

        this.pictureDefaultHeight = height
        if (this.rawPlayer) this.rawPlayer.resetHeight(height)
        if (this.isComparing && this.$refs['raw-player-comparison']) {
          this.$refs['raw-player-comparison'].resetHeight(height)
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
        .sort(
          (a, b) =>
            -a.label.localeCompare(b.label, undefined, {
              numeric: true
            })
        )
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
            preview_file_extension: preview.extension
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

    onPictureLoaded() {
      this.$nextTick(async () => {
        this.resetCanvasSize()
        const wasPlaying = this.isPlaying
        await this.resetPictureCanvas()
        this.isPlaying = wasPlaying
      })
    },

    onObjectBackgroundSelected() {
      this.objectBackgroundUrl = this.currentBackground?.url
      const enabled = Boolean(this.objectBackgroundUrl)
      this.isObjectBackground = enabled
      this.isEnvironmentSkybox = enabled
    },

    isDefaultBackground(background) {
      const defaultId =
        this.currentProduction.default_preview_background_file_id
      return defaultId ? background.id === defaultId : background.is_default
    },

    onBuildClicked() {
      this.runBuild(false)
    },

    onBuildFullClicked() {
      this.runBuild(true)
    },

    runBuild(full = false) {
      if (
        (this.isCurrentUserManager || this.isCurrentUserSupervisor) &&
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

    playBuild(job) {
      this.isFullMode = true
      const path = this.getBuildPath(job)
      if (this.$options.fullPlayingPath !== path) {
        this.$options.fullPlayingPath = path
        this.fullPlayer.src = path
        this.fullPlayer.currentTime = 0
        this.setPlaylistProgress(0)
      }
    },

    setPlaylistProgress(time) {
      this.playlistProgress = time
      const frame = Math.round(this.playlistProgress * this.fps)
      if (this.playlistShotPosition[frame]) {
        const entityIndex = this.playlistShotPosition[frame].index
        if (entityIndex !== this.playingEntityIndex && entityIndex) {
          this.playEntity(entityIndex)
        }
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

    configureFullPlayer() {
      if (!this.fullPlayer) return
      this.fullPlayer.addEventListener('loadedmetadata', () => {
        this.playlistDuration = this.entityList.reduce(
          (acc, entity) => acc + entity.preview_file_duration,
          0
        )
      })
      this.fullPlayer.addEventListener('ended', () => {
        this.pause()
      })
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
        this.$nextTick(() => {
          this.pause()
          this.rawPlayerComparison.loadEntity(this.playingEntityIndex)
          this.rawPlayerComparison.setCurrentTimeRaw(this.currentTimeRaw)
          this.updateRoomStatus()
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

    onProgressPlaylistChanged(frameNumber) {
      if (this.isFullMode) {
        const time = frameNumber / this.fps
        this.fullPlayer.currentTime = time
        this.playlistProgress = time
      }
      const { index, start } = this.playlistShotPosition[frameNumber]
      const frame = (frameNumber / this.fps - start) * this.fps + 1
      if (index !== this.playingEntityIndex) {
        this.$nextTick(() => {
          this.playEntity(index, false, frame)
          this.onFrameUpdate(frame)
        })
      } else {
        if (this.isPlayingPicture) {
          this.framesSeenOfPicture = frame + 1
        } else {
          this.setCurrentTimeRaw(frame / this.fps)
        }
      }
    },

    saveUserComparisonChoice() {
      this.savedTaskTypeToCompare = this.taskTypeToCompare
      this.sendUpdatePlayingStatus()
    },

    configureWaveForm() {
      const element = document.getElementById('waveform')
      if (!element) return
      try {
        this.wavesurfer = WaveSurfer.create({
          container: '#waveform',
          waveColor: '#00B242', // green
          progressColor: '#008732', // dark-green,
          backend: 'MediaElement', // or 'WebAudio'
          mediaType: 'video',
          height: 60,
          fillParent: true,
          minPxPerSec: 1
        })
        this.wavesurfer.on('error', error => {
          console.error('Error loading audio:', error)
        })
        this.wavesurfer.on('seeking', this.onWaveformSeeking)
      } catch (err) {
        console.error(err)
      }
    },

    onWaveformSeeking(position) {
      if (!this.$options.isWaveformSeekingSilent && !this.isPlaying) {
        this.$options.isWaveformSeekingSilent = true
        this.setCurrentTimeRaw(position)
        setTimeout(() => {
          this.$options.isWaveformSeekingSilent = false
        }, 500)
      }
    },

    loadWaveForm() {
      if (this.isWaveformDisplayed && this.isCurrentPreviewMovie) {
        if (this.rawPlayer?.currentPlayer?.src) {
          try {
            if (this.wavesurfer) {
              this.wavesurfer.destroy()
            }
            this.configureWaveForm()
            setTimeout(() => {
              this.wavesurfer.load(this.rawPlayer.currentPlayer.src)
            }, 100)
          } catch (err) {
            console.error('Error loading waveform:', err)
          }
        }
      } else {
        if (this.wavesurfer) {
          this.wavesurfer.destroy()
        }
      }
    },

    updateProgressBar(frameNumber) {
      const frame = frameNumber || this.frameNumber
      if (this.progress) {
        this.progress.updateProgressBar(frame + 1)
      }
      if (this.playlistDuration && !this.isFullMode && this.currentEntity) {
        this.playlistProgress =
          this.currentEntity.start_duration + frame / this.fps
      }
    },

    resetHandles(entity) {
      if (this.playlist.for_entity === 'shot') {
        entity = entity || this.currentEntity
        const shot = this.shotMap.get(entity?.id)
        this.handleIn = shot?.data?.handle_in || 0
        this.handleOut = shot?.data?.handle_out || this.nbFrames
      }
    },

    resetPlaylistFrameData() {
      let playlistDuration = 0
      let currentFrame = 0
      this.entityList.forEach((entity, index) => {
        const defaultNbFrames =
          entity.preview_nb_frames || 2 * this.fps * this.frameDuration
        this.framesPerImage[index] = defaultNbFrames
        const nbFrames =
          Math.round((entity.preview_file_duration || 0) * this.fps) ||
          defaultNbFrames
        entity.start_duration = (currentFrame + 1) / this.fps
        for (let i = 0; i < nbFrames; i++) {
          this.playlistShotPosition[currentFrame + i] = {
            index,
            name: entity.name,
            extension: entity.preview_file_extension,
            start: entity.start_duration,
            width: entity.preview_file_width,
            height: entity.preview_file_height,
            id: entity.preview_file_id
          }
        }
        currentFrame += nbFrames
        playlistDuration += nbFrames / this.fps

        const taskId = entity.preview_file_task_id
        const task = this.taskMap.get(taskId)
        if (task) {
          const taskStatus = this.taskStatusMap.get(task.task_status_id)
          entity.task_status_color = taskStatus.color
        }
      })
      this.playlistDuration = playlistDuration
      return playlistDuration
    },

    onRawPlayerFrameUpdate(frame) {
      if (!this.isFullMode) {
        this.onFrameUpdate(frame)
      }
    },

    onEntityDragStart(event, entity) {
      event.dataTransfer.setData('entityId', entity.id)
    },

    resumePanZoom() {
      if (this.isCurrentPreviewMovie) {
        this.rawPlayer.resumePanZoom()
      } else if (this.isCurrentPreviewPicture) {
        this.picturePlayer.resumePanZoom()
      }
    },

    pausePanZoom() {
      if (this.isCurrentPreviewMovie) {
        this.rawPlayer.pausePanZoom()
      } else if (this.isCurrentPreviewPicture) {
        this.picturePlayer.pausePanZoom()
      }
    },

    resetPanZoom() {
      if (this.isCurrentPreviewMovie) {
        this.rawPlayer.resetPanZoom()
      } else if (this.isCurrentPreviewPicture) {
        this.picturePlayer.resetPanZoom()
      }
    },

    setPanZoom(x, y, scale) {
      if (this.isCurrentPreviewMovie) {
        this.rawPlayer.setPanZoom(x, y, scale)
      } else if (this.isCurrentPreviewPicture) {
        this.picturePlayer.setPanZoom(x, y, scale)
      }
    },

    onPanZoomChanged({ x, y, scale }) {
      this.postPanZoomChanged(x, y, scale)
    }
  },

  watch: {
    isAnnotationsDisplayed() {
      this.$options.isRoomSilent = true
      if (this.isAnnotationsDisplayed && this.isZoomEnabled) {
        this.isZoomEnabled = false
      }
      if (!this.isAnnotationsDisplayed) {
        if (this.isDrawing) {
          this.onAnnotateClicked()
        } else if (this.isTyping) {
          this.onTypeClicked()
        }
      }
      this.$options.isRoomSilent = false
      this.resetCanvasVisibility()
      if (!this.$options.isRoomSilent) {
        this.updateRoomStatus()
      }
    },

    isDrawing() {
      if (this.isDrawing && this.isZoomEnabled) {
        this.isZoomEnabled = false
      }
      if (!this.isDrawing && this.isLaserModeOn) {
        this.isLaserModeOn = false
      }
      if (this.isDrawing && !this.isAnnotationsDisplayed) {
        this.isAnnotationsDisplayed = true
      }
    },

    isTyping() {
      if (this.isTyping && this.isZoomEnabled) {
        this.isZoomEnabled = false
      }
      if (!this.isAnnotationsDisplayed) {
        this.isAnnotationsDisplayed = true
      }
    },

    isZoomEnabled() {
      if (this.isZoomEnabled) {
        this.resumePanZoom()
        this.silentRoom = true
        if (this.isDrawing) {
          this.onAnnotateClicked()
        } else if (this.isTyping) {
          this.onTypeClicked()
        }
        this.$nextTick(() => {
          if (this.isAnnotationsDisplayed) {
            this.isAnnotationsDisplayed = false
          }
          this.resetCanvasVisibility()
        })
        this.silentRoom = false
      } else {
        this.pausePanZoom()
        this.resetPanZoom()
      }
      this.$nextTick(() => {
        this.updateRoomStatus()
      })
    },

    'objectModel.currentAnimation'() {
      if (this.isCurrentPreviewModel && this.objectModel.isAnimation) {
        this.playModel()
      }
    },

    framesSeenOfPicture() {
      if (this.isCurrentPreviewPicture) {
        this.updateProgressBar(this.framesSeenOfPicture - 1)
      }
    },

    isLoading() {
      if (!this.isLoading) {
        this.resetHeight()
      }
    },

    currentPreviewIndex() {
      this.endAnnotationSaving()
      this.resetUndoStacks()
      this.resetHeight()
      this.$nextTick(() => {
        if (this.isCurrentPreviewPicture) {
          this.resetPictureCanvas()
        } else {
          this.resetCanvas()
        }
      })
      if (this.currentPreview) {
        this.resetPanZoom()
        this.movieDimensions = {
          width: this.currentPreview.width,
          height: this.currentPreview.height
        }
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
      } else {
        if (this.wavesurfer && this.isWaveformDisplayed) {
          this.wavesurfer.destroy()
        }
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
          if (this.isCurrentPreviewPicture && !this.isPlaying) {
            this.triggerResize()
            this.resetHeight()
            this.resetPictureCanvas()
          } else {
            this.resetCanvas()
          }
          this.resetPanZoom()
          this.resetCanvasVisibility()
        })
      })
    },

    fullScreen() {
      this.resetHeight()
      setTimeout(() => {
        if (this.isCurrentPreviewPicture) {
          this.triggerResize()
          this.resetHeight()
          this.resetPictureCanvas()
        }
      }, 300)
    },

    isComparing() {
      if (this.isComparing) {
        this.pause()
        this.resetComparison()
        this.rebuildEntityListToCompare()
        this.rebuildComparisonOptions()
      }
      this.$nextTick().then(() => {
        this.triggerResize()
        this.resetPictureCanvas()
        this.resetCanvas()
        this.syncComparisonPlayer()
      })
    },

    taskTypeToCompare() {
      if (this.isComparing) {
        this.resetComparison()
      }
    },

    entities() {
      this.currentPreviewIndex = 0
      this.currentComparisonPreviewuIndex = 0
      this.entityList = Object.values(this.entities)
      this.resetPlaylistFrameData()

      this.playingEntityIndex = 0
      this.pause()
      if (this.rawPlayer) this.rawPlayer.setCurrentFrame(0)
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
        if (this.currentPreview !== null) {
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

    playlist(newPlaylist, oldPlaylist) {
      if (oldPlaylist) {
        if (this.room && this.room.people.includes(this.user.id)) {
          this.leaveRoom()
        }
        this.closeRoom(oldPlaylist.id)
      }
      this.endAnnotationSaving()
      this.room.id = this.playlist.id
      this.room.localId = uuidv4()
      this.openRoom(newPlaylist.id)
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

    isEntitiesHidden() {
      this.$nextTick(() => {
        setTimeout(() => {
          this.triggerResize()
        }, 300)
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
      this.$nextTick(() => {
        this.updateRoomStatus()
      })
    },

    isLaserModeOn() {
      if (!this.isDrawing && this.isLaserModeOn) {
        this.onAnnotateClicked()
      }
      this.updateRoomStatus()
    },

    isFullMode() {
      this.isComparing = false
      if (this.isFullMode) {
        this.$nextTick(() => {
          this.playEntity(0)
        })
      } else {
        this.$options.fullPlayingPath = ''
        this.onFrameUpdate(0)
      }
    }
  },

  socket: {
    events: {
      ...previewRoomMixin.socket.events,
      ...playerMixin.socket.events
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

  .playlist-button.edit-button,
  .playlist-button.delete-button {
    margin-left: 5px;
    margin-right: 0;
  }

  .playlist-button.delete-button {
    margin-right: 10px;
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

.canvas-wrapper {
  margin: auto;
  position: absolute;
  top: 0;
  left: 0;
}
.comparison-combobox {
  margin-bottom: 0;
}

.playlist-footer .background-combo {
  max-width: 300px;

  :deep(.combo) {
    max-width: 100%;
  }
  .icon {
    height: 1rem;
    margin-top: 0;
  }
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
.playlist-progress,
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

.canvas-wrapper {
  z-index: 5;
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
  margin-left: 4px;
  padding-left: 5px;
  background-color: $dark-grey-2;
  border: 1px solid $dark-grey-stronger;
  border-radius: 5px;
  color: white;
  width: 3rem;
}

#resize-annotation-canvas,
#annotation-snapshot {
  display: none;
}

.video-time {
  position: absolute;
  background: black;
  color: white;
  top: 0;
  left: 0;
  z-index: 100000;
}

.full-button {
  &:hover {
    border: 1px solid var(--text);
  }
}

.playlist-button.button.active,
.buttons .background-combo.active .icon {
  color: var(--background-selectable);

  img.active {
    filter: invert(59%) sepia(38%) saturate(660%) hue-rotate(201deg)
      brightness(95%) contrast(93%);
    box-shadow: none;
  }
}

@media only screen and (min-width: 1600px) {
  .comparison-combos {
    top: -1px;
    left: 33px;
  }
}
</style>
