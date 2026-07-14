<template>
  <div class="data-list">
    <div class="datatable-wrapper" ref="body" @scroll.passive="onBodyScroll">
      <table-header-menu
        ref="headerMenu"
        :is-minimized="hiddenColumns[lastHeaderMenuDisplayed]"
        :is-edit-allowed="isCurrentUserManager"
        :is-sticked="stickedColumns[lastHeaderMenuDisplayed]"
        @minimize-clicked="onMinimizeColumnToggled()"
        @delete-all-clicked="onDeleteAllTasksClicked()"
        @sort-by-clicked="onSortByTaskTypeClicked()"
        @select-column="onSelectColumn('shot')"
        @toggle-stick="stickColumnClicked()"
      />

      <table-metadata-header-menu
        ref="headerMetadataMenu"
        :is-edit-allowed="
          isMetadataColumnEditAllowed(lastMetadataHeaderMenuDisplayed)
        "
        :is-sticked="stickedColumns[lastMetadataHeaderMenuDisplayed]"
        @edit-clicked="onEditMetadataClicked()"
        @delete-clicked="onDeleteMetadataClicked()"
        @sort-by-clicked="onSortByMetadataClicked()"
        @toggle-stick="metadataStickColumnClicked($event)"
      />

      <table-metadata-header-menu
        ref="headerFieldMenu"
        :is-edit-allowed="false"
        :show-stick="false"
        @sort-by-clicked="onSortByFieldClicked()"
      />

      <table
        class="datatable multi-section"
        :class="{ 'expand-task-types': displaySettings.fullTaskTypeNames }"
      >
        <thead class="datatable-head" id="datatable-shot" v-columns-resizable>
          <tr>
            <th
              scope="col"
              class="name shot-name datatable-row-header"
              ref="th-shot"
            >
              <sortable-field-header
                field-name="name"
                :label="$t('shots.fields.name')"
                @show-menu="showFieldHeaderMenu"
              >
                <template #actions>
                  <button-simple
                    class="is-small flexrow"
                    icon="plus"
                    :text="''"
                    @click="onAddMetadataClicked"
                    v-if="
                      (isCurrentUserManager || isCurrentUserSupervisor) &&
                      !isLoading
                    "
                  />
                </template>
              </sortable-field-header>
            </th>

            <metadata-header
              :ref="`editor-${j}`"
              :key="descriptor.id"
              :descriptor="descriptor"
              :left="
                offsets['editor-' + j] ? `${offsets['editor-' + j]}px` : '0'
              "
              @show-metadata-header-menu="
                event => showMetadataHeaderMenu(descriptor.id, event)
              "
              is-stick
              v-for="(descriptor, j) in stickedVisibleMetadataDescriptors"
            />

            <template v-if="!isLoading">
              <validation-header
                :ref="`validation-${columnIndexInGrid}`"
                :key="columnId"
                :hidden-columns="hiddenColumns"
                :column-id="columnId"
                :title="taskTypeMap.get(columnId).name"
                :validation-style="getValidationStyle(columnId)"
                :left="
                  offsets['validation-' + columnIndexInGrid]
                    ? `${offsets['validation-' + columnIndexInGrid]}px`
                    : '0'
                "
                type="assets"
                @show-header-menu="
                  event => showHeaderMenu(columnId, columnIndexInGrid, event)
                "
                is-stick
                v-for="(
                  columnId, columnIndexInGrid
                ) in stickedDisplayedValidationColumns"
              />
            </template>

            <th
              scope="col"
              class="description selectable"
              v-if="
                !isCurrentUserClient &&
                displaySettings.showInfos &&
                isShotDescription
              "
            >
              <sortable-field-header
                field-name="description"
                :label="$t('shots.fields.description')"
                @show-menu="showFieldHeaderMenu"
              />
            </th>

            <th
              scope="col"
              ref="th-spent"
              class="time-spent number-cell"
              v-if="
                !isCurrentUserClient &&
                displaySettings.showInfos &&
                isShotTime &&
                metadataDisplayHeaders.timeSpent
              "
            >
              {{ $t('shots.fields.time_spent') }}
            </th>

            <th
              scope="col"
              class="estimation number-cell"
              ref="th-spent"
              :title="$t('main.estimation')"
              v-if="
                !isCurrentUserClient &&
                displaySettings.showInfos &&
                isShotEstimation &&
                metadataDisplayHeaders.estimation
              "
            >
              {{ $t('main.estimation_short') }}
            </th>

            <th
              class="drawings number-cell"
              scope="col"
              v-if="
                displaySettings.showInfos &&
                isPaperProduction &&
                metadataDisplayHeaders.drawings
              "
            >
              {{ $t('shots.fields.nb_drawings') }}
            </th>

            <th
              class="frames number-cell"
              scope="col"
              v-if="
                isFrames &&
                displaySettings.showInfos &&
                !isPaperProduction &&
                metadataDisplayHeaders.frames
              "
            >
              {{ $t('shots.fields.nb_frames') }}
            </th>

            <th
              scope="col"
              class="framein number-cell"
              v-if="
                isFrameIn &&
                displaySettings.showInfos &&
                metadataDisplayHeaders.frameIn
              "
            >
              {{ $t('shots.fields.frame_in') }}
            </th>
            <th
              scope="col"
              class="frameout number-cell"
              v-if="
                isFrameOut &&
                displaySettings.showInfos &&
                metadataDisplayHeaders.frameOut
              "
            >
              {{ $t('shots.fields.frame_out') }}
            </th>

            <th
              scope="col"
              class="fps number-cell"
              v-if="
                isFps && displaySettings.showInfos && metadataDisplayHeaders.fps
              "
            >
              {{ $t('shots.fields.fps') }}
            </th>

            <th
              scope="col"
              class="max-retakes number-cell"
              v-if="
                isMaxRetakes &&
                displaySettings.showInfos &&
                metadataDisplayHeaders.maxRetakes
              "
            >
              {{ $t('shots.fields.max_retakes') }}
            </th>

            <th
              scope="col"
              class="resolution"
              v-if="
                isResolution &&
                displaySettings.showInfos &&
                metadataDisplayHeaders.resolution
              "
            >
              {{ $t('shots.fields.resolution') }}
            </th>

            <template v-if="displaySettings.showInfos">
              <metadata-header
                :key="descriptor.id"
                :descriptor="descriptor"
                @show-metadata-header-menu="
                  event => showMetadataHeaderMenu(descriptor.id, event)
                "
                v-for="descriptor in nonStickedVisibleMetadataDescriptors"
              />
            </template>

            <template v-if="!isLoading">
              <validation-header
                :key="columnId"
                :hidden-columns="hiddenColumns"
                :column-id="columnId"
                :validation-style="getValidationStyle(columnId)"
                type="shots"
                @show-header-menu="
                  event => showHeaderMenu(columnId, columnIndexInGrid, event)
                "
                v-for="(
                  columnId, columnIndexInGrid
                ) in nonStickedDisplayedValidationColumns"
              />
            </template>

            <th scope="col" class="actions" ref="actionsSection">
              <button-simple
                :class="{
                  'is-small': true,
                  highlighted: isEmptyTask
                }"
                icon="plus"
                :text="$t('tasks.create_tasks')"
                @click="$emit('create-tasks')"
                v-if="isCurrentUserManager"
              />

              <table-metadata-selector-menu
                :descriptors="shotMetadataDescriptors"
                namespace="shots"
                :exclude="{
                  frames: !isFrames,
                  frameIn: !isFrameIn,
                  frameOut: !isFrameOut,
                  fps: !isFps,
                  estimation: !isShotEstimation,
                  timeSpent: !isShotTime,
                  resolution: !isResolution,
                  max_retakes: !isMaxRetakes
                }"
                v-model="metadataDisplayHeaders"
                v-model:is-open="columnSelectorDisplayed"
                v-if="displaySettings.showInfos"
              />

              <button-simple
                class="is-small is-pulled-right mr05"
                icon="down"
                @click="toggleColumnSelector"
                v-if="displaySettings.showInfos"
              />
            </th>
          </tr>
        </thead>

        <!--
          PERF-1: virtualized rows (@tanstack/vue-virtual), same recipe as
          EditList/AssetList. The per-sequence tbodys are linearized into
          one flat list mixing sequence-header items and shot items
          (flattenedItems, built in setup); only the items near the
          viewport render below, between two spacer rows sized to the
          off-screen items' total height. Sequence-header rows keep the
          exact markup/classes they had when each group owned its tbody.
        -->
        <tbody
          class="datatable-body"
          @mousedown="startBrowsing"
          @touchstart="startBrowsing"
          v-if="!isLoading && isListVisible"
        >
          <tr class="virtual-spacer-row" v-if="topSpacerHeight > 0">
            <td
              :colspan="totalColumnsCount"
              :style="{ height: `${topSpacerHeight}px` }"
            ></td>
          </tr>
          <template
            :key="key"
            v-for="{
              isHeader,
              group,
              shot,
              i,
              k,
              flatIndex,
              key
            } in visibleItems"
          >
            <tr
              class="datatable-type-header"
              :ref="el => rowVirtualizer.measureElement(el)"
              :data-index="flatIndex"
              v-if="isHeader"
            >
              <th scope="rowgroup">
                <div
                  class="datatable-row-header pointer"
                  role="button"
                  tabindex="0"
                  @click="$emit('sequence-clicked', group[0].sequence_name)"
                  @keydown.enter.prevent="
                    $emit('sequence-clicked', group[0].sequence_name)
                  "
                >
                  {{ group[0] ? group[0].sequence_name : '' }}
                </div>
              </th>
            </tr>
            <tr
              class="datatable-row"
              :class="{
                canceled: shot.canceled,
                'stripe-even': i % 2 === 0,
                'stripe-odd': i % 2 === 1
              }"
              :ref="el => rowVirtualizer.measureElement(el)"
              :data-index="flatIndex"
              v-else
            >
              <th
                scope="row"
                :class="{
                  'datatable-row-header': true,
                  'shot-name': true,
                  name: true,
                  bold: !shot.canceled
                }"
              >
                <div class="flexrow">
                  <input
                    type="checkbox"
                    class="mr1"
                    :checked="selectedShots.has(shot.id) || null"
                    @input="event => toggleLine(shot, event)"
                    v-if="isCurrentUserManager"
                  />
                  <entity-thumbnail
                    :entity="shot"
                    :width="displaySettings.bigThumbnails ? 150 : 50"
                    :height="displaySettings.bigThumbnails ? 100 : 33"
                    :empty-width="displaySettings.bigThumbnails ? 150 : 50"
                    :empty-height="displaySettings.bigThumbnails ? 100 : 34"
                  />
                  <router-link
                    tabindex="-1"
                    :title="shot.full_name"
                    :to="shotPath(shot.id)"
                    v-if="!isCurrentUserClient"
                  >
                    {{ shot.name }}
                  </router-link>
                  <template v-else>
                    {{ shot.name }}
                  </template>
                </div>
              </th>

              <!-- Metadata stick -->
              <td
                :ref="`editor-${getIndex(i, k)}-${j}`"
                class="metadata-descriptor datatable-row-header"
                :title="shot.data ? shot.data[descriptor.field_name] : ''"
                :style="{
                  'z-index':
                    descriptor.data_type === 'taglist'
                      ? 1000 - (getIndex(i, k) % 1000) // Needed for combo to be above the next cell
                      : undefined,
                  left: offsets['editor-' + j]
                    ? `${offsets['editor-' + j]}px`
                    : '0'
                }"
                :key="shot.id + '-' + descriptor.id"
                v-for="(descriptor, j) in stickedVisibleMetadataDescriptors"
              >
                <metadata-input
                  :entity="shot"
                  :descriptor="descriptor"
                  :indexes="{ i, j, k }"
                  @metadata-changed="$emit('metadata-changed', $event)"
                />
              </td>

              <template v-if="!isLoading">
                <validation-cell
                  :ref="`validation-${getIndex(i, k)}-${j}`"
                  :key="columnId + '-' + shot.id"
                  :class="{
                    canceled: shot.canceled,
                    'validation-cell': !hiddenColumns[columnId],
                    'hidden-validation-cell': hiddenColumns[columnId],
                    'datatable-row-header': true
                  }"
                  :canceled="shot.canceled"
                  :column="taskTypeMap.get(columnId)"
                  :column-y="j"
                  :contact-sheet="displaySettings.contactSheetMode"
                  :entity="shot"
                  :is-assignees="displaySettings.showAssignations"
                  :is-casting-ready="isCastingReady(shot, columnId)"
                  :is-static="true"
                  :left="
                    offsets['validation-' + j]
                      ? `${offsets['validation-' + j]}px`
                      : '0'
                  "
                  :max-assignees="maxAssigneesPerCell"
                  :minimized="hiddenColumns[columnId]"
                  :row-x="getIndex(i, k)"
                  :selected="isSelected(i, k, j)"
                  :sticked="true"
                  :task-test="taskMap.get(shot.validations.get(columnId))"
                  @select="infos => onTaskSelected(infos, true)"
                  @unselect="infos => onTaskUnselected(infos, true)"
                  v-for="(columnId, j) in stickedDisplayedValidationColumns"
                />
              </template>

              <description-cell
                class="description"
                :entry="shot"
                :editable="isCurrentUserManager"
                @description-changed="
                  value => onDescriptionChanged(shot, value)
                "
                v-if="
                  !isCurrentUserClient &&
                  displaySettings.showInfos &&
                  isShotDescription
                "
              />

              <!-- Fixed attributes -->
              <td
                class="time-spent selectable number-cell"
                v-if="
                  !isCurrentUserClient &&
                  displaySettings.showInfos &&
                  isShotTime &&
                  metadataDisplayHeaders.timeSpent
                "
              >
                {{ formatDuration(shot.timeSpent) }}
              </td>

              <td
                class="estimation selectable number-cell"
                v-if="
                  !isCurrentUserClient &&
                  displaySettings.showInfos &&
                  isShotEstimation &&
                  metadataDisplayHeaders.estimation
                "
              >
                {{ formatDuration(shot.estimation) }}
              </td>

              <td
                class="drawings number-cell"
                v-if="
                  displaySettings.showInfos &&
                  isPaperProduction &&
                  metadataDisplayHeaders.drawings
                "
              >
                {{ shot.nb_drawings }}
              </td>

              <td
                class="frames number-cell"
                v-if="
                  isFrames &&
                  !isPaperProduction &&
                  displaySettings.showInfos &&
                  metadataDisplayHeaders.frames
                "
              >
                <input
                  class="input-editor"
                  step="1"
                  :value="shot.nb_frames"
                  type="number"
                  min="0"
                  @input="event => onNbFramesChanged(shot, event.target.value)"
                  @keydown="onNumberFieldKeyDown"
                  @keyup.ctrl="
                    event =>
                      onInputKeyUp(event, getIndex(i, k), descriptorLength)
                  "
                  v-if="isCurrentUserManager"
                />
                <span class="metadata-value selectable" v-else>
                  {{ shot.nb_frames }}
                </span>
              </td>

              <td
                class="framein number-cell"
                v-if="
                  isFrameIn &&
                  displaySettings.showInfos &&
                  metadataDisplayHeaders.frameIn
                "
              >
                <span
                  class="metadata-value selectable"
                  v-if="displaySettings.inOutTimecode"
                >
                  {{
                    formatToTimecode(
                      getMetadataFieldValue({ field_name: 'frame_in' }, shot)
                    )
                  }}
                </span>
                <input
                  class="input-editor"
                  step="1"
                  type="number"
                  min="0"
                  :value="
                    getMetadataFieldValue({ field_name: 'frame_in' }, shot)
                  "
                  @input="
                    event =>
                      onMetadataFieldChanged(
                        shot,
                        { field_name: 'frame_in', data_type: 'number' },
                        event
                      )
                  "
                  @keydown="onNumberFieldKeyDown"
                  @keyup.ctrl="
                    event =>
                      onInputKeyUp(event, getIndex(i, k), descriptorLength + 1)
                  "
                  v-else-if="isCurrentUserManager"
                />
                <span class="metadata-value selectable" v-else>
                  {{ getMetadataFieldValue({ field_name: 'frame_in' }, shot) }}
                </span>
              </td>
              <td
                class="frameout number-cell"
                :class="{ 'timecode-cell': displaySettings.inOutTimecode }"
                v-if="
                  isFrameOut &&
                  displaySettings.showInfos &&
                  metadataDisplayHeaders.frameOut
                "
              >
                <span
                  class="metadata-value selectable"
                  v-if="displaySettings.inOutTimecode"
                >
                  {{
                    formatToTimecode(
                      getMetadataFieldValue({ field_name: 'frame_out' }, shot)
                    )
                  }}
                </span>
                <input
                  class="input-editor"
                  step="1"
                  type="number"
                  min="0"
                  :value="
                    getMetadataFieldValue({ field_name: 'frame_out' }, shot)
                  "
                  @keydown="onNumberFieldKeyDown"
                  @input="
                    event =>
                      onMetadataFieldChanged(
                        shot,
                        { field_name: 'frame_out', data_type: 'number' },
                        event
                      )
                  "
                  @keyup.ctrl="
                    event =>
                      onInputKeyUp(event, getIndex(i, k), descriptorLength + 2)
                  "
                  v-else-if="isCurrentUserManager"
                />
                <span class="metadata-value selectable" v-else>
                  {{ getMetadataFieldValue({ field_name: 'frame_out' }, shot) }}
                </span>
              </td>

              <td
                class="fps number-cell"
                v-if="
                  isFps &&
                  displaySettings.showInfos &&
                  metadataDisplayHeaders.fps
                "
              >
                <input
                  class="input-editor"
                  min="0"
                  max="1000"
                  step="0.001"
                  type="number"
                  :value="getMetadataFieldValue({ field_name: 'fps' }, shot)"
                  @keydown="onNumberFieldKeyDown"
                  @input="
                    event =>
                      onMetadataFieldChanged(
                        shot,
                        { field_name: 'fps', data_type: 'number' },
                        event
                      )
                  "
                  @keyup.ctrl="
                    event =>
                      onInputKeyUp(event, getIndex(i, k), descriptorLength + 3)
                  "
                  v-if="isCurrentUserManager"
                />
                <span class="metadata-value selectable" v-else>
                  {{ getMetadataFieldValue({ field_name: 'fps' }, shot) }}
                </span>
              </td>

              <td
                class="max-retakes number-cell"
                v-if="
                  isMaxRetakes &&
                  displaySettings.showInfos &&
                  metadataDisplayHeaders.maxRetakes
                "
              >
                <input
                  class="input-editor"
                  type="number"
                  step="1"
                  :value="
                    getMetadataFieldValue({ field_name: 'max_retakes' }, shot)
                  "
                  @keydown="onNumberFieldKeyDown"
                  @input="
                    event =>
                      onMetadataFieldChanged(
                        shot,
                        { field_name: 'max_retakes', data_type: 'number' },
                        event
                      )
                  "
                  @keyup.ctrl="
                    event =>
                      onInputKeyUp(event, getIndex(i, k), descriptorLength + 3)
                  "
                  v-if="isCurrentUserManager"
                />
                <span class="metadata-value selectable" v-else>
                  {{
                    getMetadataFieldValue({ field_name: 'max_retakes' }, shot)
                  }}
                </span>
              </td>

              <td
                class="resolution"
                v-if="
                  isResolution &&
                  displaySettings.showInfos &&
                  metadataDisplayHeaders.resolution
                "
              >
                <input
                  :class="{
                    'input-editor': true,
                    error: !isValidResolution(shot)
                  }"
                  :value="
                    getMetadataFieldValue({ field_name: 'resolution' }, shot)
                  "
                  @input="
                    event =>
                      onMetadataFieldChanged(
                        shot,
                        { field_name: 'resolution' },
                        event
                      )
                  "
                  @keyup.ctrl="
                    event =>
                      onInputKeyUp(event, getIndex(i, k), descriptorLength + 3)
                  "
                  v-if="isCurrentUserManager"
                />
                <span class="metadata-value selectable" v-else>
                  {{
                    getMetadataFieldValue({ field_name: 'resolution' }, shot)
                  }}
                </span>
              </td>

              <!-- other metadata cells -->
              <template v-if="displaySettings.showInfos">
                <td
                  class="metadata-descriptor"
                  :title="shot.data ? shot.data[descriptor.field_name] : ''"
                  :key="shot.id + '-' + descriptor.id"
                  v-for="(
                    descriptor, j
                  ) in nonStickedVisibleMetadataDescriptors"
                >
                  <metadata-input
                    :entity="shot"
                    :descriptor="descriptor"
                    :indexes="{ i, j, k }"
                    @metadata-changed="$emit('metadata-changed', $event)"
                  />
                </td>
              </template>

              <template v-if="!isLoading">
                <validation-cell
                  :ref="`validation-${getIndex(i, k)}-${
                    j + stickedDisplayedValidationColumns.length
                  }`"
                  :class="{
                    'validation-cell': !hiddenColumns[columnId],
                    'hidden-validation-cell': hiddenColumns[columnId]
                  }"
                  :canceled="shot.canceled"
                  :key="`${columnId}-${shot.id}`"
                  :column="taskTypeMap.get(columnId)"
                  :contact-sheet="displaySettings.contactSheetMode"
                  :entity="shot"
                  :task-test="
                    taskMap.get(
                      shot.validations ? shot.validations.get(columnId) : null
                    )
                  "
                  :max-assignees="maxAssigneesPerCell"
                  :minimized="hiddenColumns[columnId]"
                  :selected="
                    isSelected(
                      i,
                      k,
                      j + stickedDisplayedValidationColumns.length
                    )
                  "
                  :row-x="getIndex(i, k)"
                  :column-y="j"
                  :is-assignees="displaySettings.showAssignations"
                  :is-casting-ready="isCastingReady(shot, columnId)"
                  :casting-title="castingTitle(shot, columnId)"
                  @select="onTaskSelected"
                  @unselect="onTaskUnselected"
                  v-for="(columnId, j) in nonStickedDisplayedValidationColumns"
                />
              </template>
              <row-actions-cell
                :entry="shot"
                :hide-history="false"
                @delete-clicked="$emit('delete-clicked', shot)"
                @edit-clicked="$emit('edit-clicked', shot)"
                @history-clicked="$emit('shot-history', shot)"
                @restore-clicked="$emit('restore-clicked', shot)"
                v-if="isCurrentUserManager"
              />
              <td class="actions" v-else></td>
            </tr>
          </template>
          <tr class="virtual-spacer-row" v-if="bottomSpacerHeight > 0">
            <td
              :colspan="totalColumnsCount"
              :style="{ height: `${bottomSpacerHeight}px` }"
            ></td>
          </tr>
        </tbody>
      </table>
    </div>
    <table-info :is-loading="isLoading" :is-error="isError" big-cells />

    <div
      class="has-text-centered"
      v-if="isEmptyList && !isCurrentUserClient && !isLoading"
    >
      <p class="info">
        <img src="../../assets/illustrations/empty_shot.png" alt="" />
      </p>
      <p class="info">{{ $t('shots.empty_list') }}</p>
      <button-simple
        class="level-item big-button"
        :text="$t('shots.new_shots')"
        @click="$emit('add-shots')"
      />
    </div>
    <div
      class="has-text-centered"
      v-if="isEmptyList && isCurrentUserClient && !isLoading"
    >
      <p class="info">
        <img src="../../assets/illustrations/empty_shot.png" alt="" />
      </p>
      <p class="info">{{ $t('shots.empty_list_client') }}</p>
    </div>

    <p class="has-text-centered nb-shots" v-if="!isEmptyList && !isLoading">
      {{ displayedShotsLength }} {{ $t('shots.number', displayedShotsLength) }}
      <span v-if="displayedShotsFrames">
        -
        {{ displayedShotsFrames }}
        {{ $t('main.nb_frames', displayedShotsFrames) }}
      </span>
      <span v-if="isPaperProduction">
        -
        {{ displayedShotsDrawings }}
        {{ $t('main.nb_drawings', displayedShotsDrawings) }}
      </span>
      <span v-if="displayedShotsTimeSpent > 0 || displayedShotsEstimation > 0">
        ({{ formatDuration(displayedShotsTimeSpent) }}
        {{
          isDurationInHours
            ? $t(
                'main.hours_spent',
                formatDuration(displayedShotsTimeSpent, false)
              )
            : $t(
                'main.days_spent',
                formatDuration(displayedShotsTimeSpent, false)
              )
        }},
        {{ formatDuration(displayedShotsEstimation) }}
        {{
          isDurationInHours
            ? $t(
                'main.hours_estimated',
                formatDuration(displayedShotsEstimation, false)
              )
            : $t(
                'main.man_days',
                formatDuration(displayedShotsEstimation, false)
              )
        }})
      </span>
    </p>
  </div>
</template>

<script>
import { useVirtualizer } from '@tanstack/vue-virtual'
import { computed, ref } from 'vue'
import { mapGetters, mapActions } from 'vuex'

import preferences from '@/lib/preferences'
import { range } from '@/lib/time'
import { formatToTimecode } from '@/lib/video'

import { descriptorMixin } from '@/components/mixins/descriptors'
import { domMixin } from '@/components/mixins/dom'
import { entityListMixin } from '@/components/mixins/entity_list'
import { formatListMixin } from '@/components/mixins/format'
import { selectionListMixin } from '@/components/mixins/selection'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import DescriptionCell from '@/components/cells/DescriptionCell.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import MetadataHeader from '@/components/cells/MetadataHeader.vue'
import MetadataInput from '@/components/cells/MetadataInput.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import SortableFieldHeader from '@/components/widgets/SortableFieldHeader.vue'
import TableMetadataHeaderMenu from '@/components/widgets/TableMetadataHeaderMenu.vue'
import TableMetadataSelectorMenu from '@/components/widgets/TableMetadataSelectorMenu.vue'
import TableHeaderMenu from '@/components/widgets/TableHeaderMenu.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import ValidationCell from '@/components/cells/ValidationCell.vue'
import ValidationHeader from '@/components/cells/ValidationHeader.vue'

// PERF-1: row-height estimates per display mode (same technique as
// EditList/AssetList). Heights are fixed within a mode — the
// assignee-avatar stack is capped via maxAssignees below so it can never
// wrap a row taller; rowVirtualizer.measureElement stays as a safety net
// for anything still content-driven.
const ROW_HEIGHT_ESTIMATE = 52
const ROW_HEIGHT_ESTIMATE_BIG_THUMBNAILS = 116
const ROW_HEIGHT_ESTIMATE_CONTACT_SHEET = 102
// Sequence header row: 1.5rem/0.5rem paddings + one line of 1.1em text.
const TYPE_HEADER_HEIGHT_ESTIMATE = 56

// Cap on assignee avatars per validation cell (rest collapses into "+N"):
// 3 avatars + status tag fit the 150px cell on one line, keeping row
// heights constant for the virtualizer whatever the assignation count.
const MAX_ASSIGNEES_PER_CELL = 3

export default {
  name: 'shot-list',

  mixins: [
    descriptorMixin,
    domMixin,
    formatListMixin,
    entityListMixin,
    selectionListMixin
  ],

  components: {
    ButtonSimple,
    DescriptionCell,
    EntityThumbnail,
    MetadataHeader,
    MetadataInput,
    RowActionsCell,
    SortableFieldHeader,
    TableHeaderMenu,
    TableMetadataHeaderMenu,
    TableMetadataSelectorMenu,
    TableInfo,
    ValidationCell,
    ValidationHeader
  },

  props: {
    displaySettings: {
      type: Object,
      default: () => ({})
    },
    displayedShots: {
      type: Array,
      default: () => []
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    validationColumns: {
      type: Array,
      default: () => []
    },
    departmentFilter: {
      type: Array,
      default: () => []
    }
  },

  emits: [
    'add-shots',
    'create-tasks',
    'delete-clicked',
    'edit-clicked',
    'field-changed',
    'metadata-changed',
    'restore-clicked',
    'sequence-clicked',
    'shot-history'
    // 'scroll' and 'keep-task-panel-open' come from entityListMixin
  ],

  // PERF-1: virtualized rows, same recipe as EditList/AssetList.
  // useVirtualizer is a composable so it needs a setup() hook even though
  // this component is otherwise Options API. `body` doubles as
  // `this.$refs.body` for the existing mixin methods and as the
  // virtualizer's scroll element. The flattening derives from the
  // displayedShots prop, so episode scoping (handled upstream in the shots
  // store for TV shows) is transparent here.
  setup(props) {
    const body = ref(null)

    // The per-sequence tbodys, linearized into one flat list of
    // sequence-header items and shot items (display order preserved) so a
    // single virtualizer can window over the whole grid. `i` and `k` keep
    // their historical meaning (index inside the group / group index), so
    // every getIndex(i, k)-based selection coordinate is unchanged.
    const flattenedItems = computed(() => {
      const items = []
      props.displayedShots.forEach((group, k) => {
        if (group[0]) {
          items.push({
            isHeader: true,
            group,
            k,
            key: `header-${group[0].sequence_id}`
          })
          group.forEach((shot, i) => {
            items.push({ isHeader: false, shot, i, k, key: shot.id })
          })
        }
      })
      return items
    })

    const rowVirtualizer = useVirtualizer(
      computed(() => ({
        count: flattenedItems.value.length,
        getScrollElement: () => body.value,
        // bigThumbnails first: combined with contact sheet, the name
        // column's 100px thumbnail + cell padding is the taller of the two.
        estimateSize: index => {
          if (flattenedItems.value[index]?.isHeader) {
            return TYPE_HEADER_HEIGHT_ESTIMATE
          }
          if (props.displaySettings.bigThumbnails) {
            return ROW_HEIGHT_ESTIMATE_BIG_THUMBNAILS
          }
          if (props.displaySettings.contactSheetMode) {
            return ROW_HEIGHT_ESTIMATE_CONTACT_SHEET
          }
          return ROW_HEIGHT_ESTIMATE
        },
        getItemKey: index => flattenedItems.value[index]?.key ?? index,
        overscan: 10
      }))
    )

    return { body, flattenedItems, rowVirtualizer }
  },

  data() {
    return {
      type: 'shot',
      hiddenColumns: {},
      lastFieldHeaderMenuDisplayed: null,
      lastFieldHeaderMenuLabel: null,
      lastHeaderMenuDisplayed: null,
      lastMetadataHeaderMenuDisplayed: null,
      lastHeaderMenuDisplayedIndexInGrid: null,
      lastSelectedShot: null,
      lastSelection: null,
      metadataDisplayHeaders: {
        drawings: true,
        fps: true,
        frameIn: true,
        frameOut: true,
        frames: true,
        estimation: true,
        maxRetakes: true,
        resolution: true,
        timeSpent: true
      },
      offsets: {},
      stickedColumns: {},
      domEvents: [
        ['mousemove', this.onMouseMove],
        ['touchmove', this.onMouseMove],
        ['mouseup', this.stopBrowsing],
        ['mouseleave', this.stopBrowsing],
        ['touchend', this.stopBrowsing],
        ['touchcancel', this.stopBrowsing],
        ['keyup', this.stopBrowsing]
      ]
    }
  },

  beforeUnmount() {
    this.removeEvents(this.domEvents)
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'currentEpisode',
      'displayedShotsEstimation',
      'displayedShotsCount',
      'displayedShotsDrawings',
      'displayedShotsFrames',
      'displayedShotsLength',
      'displayedShotsTimeSpent',
      'isBigThumbnails',
      'isCurrentUserAdmin',
      'isCurrentUserManager',
      'isCurrentUserClient',
      'isCurrentUserSupervisor',
      'isFps',
      'isFrames',
      'isFrameIn',
      'isFrameOut',
      'isPaperProduction',
      'isMaxRetakes',
      'isResolution',
      'isSingleEpisode',
      'isShotDescription',
      'isShotEstimation',
      'isShotTime',
      'isShowAssignations',
      'displaySettings.showInfos',
      'isTVShow',
      'nbSelectedTasks',
      'selectedShots',
      'selectedTasks',
      'sequenceMap',
      'shotFilledColumns',
      'shotMap',
      'shotMetadataDescriptors',
      'shots',
      'shotSearchText',
      'shotSelectionGrid',
      'taskMap',
      'taskTypeMap',
      'user'
    ]),

    isEmptyList() {
      return (
        this.displayedShots &&
        this.displayedShots[0].length === 0 &&
        !this.isLoading &&
        !this.isError &&
        (!this.shotSearchText || this.shotSearchText.length === 0)
      )
    },

    isEmptyTask() {
      return (
        !this.isEmptyList &&
        !this.isLoading &&
        this.validationColumns &&
        this.validationColumns.length === 0
      )
    },

    isListVisible() {
      return !this.isLoading && !this.isError && this.displayedShotsCount > 0
    },

    displayedValidationColumns() {
      return this.validationColumns.filter(columnId => {
        return (
          this.shotFilledColumns[columnId] &&
          (!this.hiddenColumns[columnId] || this.displaySettings.showInfos)
        )
      })
    },

    metadataDescriptors() {
      return this.shotMetadataDescriptors
    },

    localStorageStickKey() {
      return `stick-shots-${this.currentProduction?.id}`
    },

    // PERF-1: virtualization plumbing (see the EditList pilot). Everything
    // below reasons in data terms (flattenedItems / getIndex coordinates),
    // never DOM order, so filtering, sorting and real-time updates keep
    // working exactly as before virtualization.
    virtualRows() {
      return this.rowVirtualizer.getVirtualItems()
    },

    totalRowsSize() {
      return this.rowVirtualizer.getTotalSize()
    },

    topSpacerHeight() {
      return this.virtualRows.length > 0 ? this.virtualRows[0].start : 0
    },

    bottomSpacerHeight() {
      if (this.virtualRows.length === 0) return 0
      const lastRow = this.virtualRows[this.virtualRows.length - 1]
      return this.totalRowsSize - lastRow.end
    },

    // The flattened items tanstack currently renders, `flatIndex` being the
    // index in flattenedItems (used only for data-index / measurement, not
    // for selection coordinates, which stay getIndex(i, k)-based).
    visibleItems() {
      return this.virtualRows
        .filter(virtualRow => this.flattenedItems[virtualRow.index])
        .map(virtualRow => ({
          ...this.flattenedItems[virtualRow.index],
          flatIndex: virtualRow.index
        }))
    },

    // Maps a row's global selection index (getIndex coordinates) back to
    // its shot, for the data-driven shift selection below.
    rowIndexToShot() {
      const map = new Map()
      this.displayedShots.forEach((group, k) => {
        group.forEach((shot, i) => {
          map.set(this.getIndex(i, k), shot)
        })
      })
      return map
    },

    maxAssigneesPerCell() {
      return MAX_ASSIGNEES_PER_CELL
    },

    // Spans the spacer rows across every column currently in the header,
    // so they don't leave a jagged one-column-wide row in the table.
    totalColumnsCount() {
      const showInfos = this.displaySettings.showInfos
      let count = 1 // shot name column, always present
      count += this.stickedVisibleMetadataDescriptors.length
      if (!this.isLoading) {
        count += this.stickedDisplayedValidationColumns.length
        count += this.nonStickedDisplayedValidationColumns.length
      }
      if (!this.isCurrentUserClient && showInfos && this.isShotDescription) {
        count++
      }
      if (
        !this.isCurrentUserClient &&
        showInfos &&
        this.isShotTime &&
        this.metadataDisplayHeaders.timeSpent
      ) {
        count++
      }
      if (
        !this.isCurrentUserClient &&
        showInfos &&
        this.isShotEstimation &&
        this.metadataDisplayHeaders.estimation
      ) {
        count++
      }
      if (
        showInfos &&
        this.isPaperProduction &&
        this.metadataDisplayHeaders.drawings
      ) {
        count++
      }
      if (
        this.isFrames &&
        showInfos &&
        !this.isPaperProduction &&
        this.metadataDisplayHeaders.frames
      ) {
        count++
      }
      if (this.isFrameIn && showInfos && this.metadataDisplayHeaders.frameIn) {
        count++
      }
      if (
        this.isFrameOut &&
        showInfos &&
        this.metadataDisplayHeaders.frameOut
      ) {
        count++
      }
      if (this.isFps && showInfos && this.metadataDisplayHeaders.fps) {
        count++
      }
      if (
        this.isMaxRetakes &&
        showInfos &&
        this.metadataDisplayHeaders.maxRetakes
      ) {
        count++
      }
      if (
        this.isResolution &&
        showInfos &&
        this.metadataDisplayHeaders.resolution
      ) {
        count++
      }
      if (showInfos) {
        count += this.nonStickedVisibleMetadataDescriptors.length
      }
      count++ // actions column, always present
      return count
    }
  },

  methods: {
    ...mapActions(['setShotSelection']),

    formatToTimecode,

    isSelected(indexInGroup, groupIndex, columnIndex) {
      const lineIndex = this.getIndex(indexInGroup, groupIndex)
      return this.shotSelectionGrid.has(`${lineIndex}-${columnIndex}`)
    },

    // Hook for entity_list.js's data-driven shift-rectangle selection.
    entityForRow(lineIndex) {
      return this.rowIndexToShot.get(lineIndex)
    },

    isCastingReady(shot, columnId) {
      if (!shot.nb_entities_out) {
        return false
      }
      const task = this.taskMap.get(shot.validations.get(columnId))
      return (
        task &&
        task.nb_assets_ready > 0 &&
        shot.nb_entities_out === task.nb_assets_ready
      )
    },

    castingTitle(shot, columnId) {
      if (!shot.nb_entities_out) {
        return ''
      }
      const task = this.taskMap.get(shot.validations.get(columnId))
      return task
        ? task.nb_assets_ready + ' / ' + shot.nb_entities_out + ' assets ready'
        : ''
    },

    toggleLine(shot, event) {
      const selected = event.target.checked
      const shotsToSelect = [shot]
      if (selected && this.shiftKeyPressed && this.lastSelectedShot) {
        const shotsFlatten = this.displayedShots.flat()
        let startShotIndex = shotsFlatten.findIndex(
          displayedShot => displayedShot.id === this.lastSelectedShot.id
        )
        let endShotIndex = shotsFlatten.findIndex(
          displayedShot => displayedShot.id === shot.id
        )
        if (startShotIndex > endShotIndex) {
          ;[startShotIndex, endShotIndex] = [endShotIndex, startShotIndex]
        }
        if (startShotIndex >= 0 && endShotIndex >= 0) {
          range(startShotIndex, endShotIndex).forEach(index => {
            shotsToSelect.push(shotsFlatten[index])
          })
        }
      }
      if (selected) {
        this.lastSelectedShot = shot
      }
      shotsToSelect.forEach(shot => {
        this.setShotSelection({ shot, selected })
      })
    },

    // PERF-1: no local onBodyScroll anymore. The store now displays the
    // full result at once (rows are virtualized), so the old
    // scroll-to-bottom -> displayMoreShots wiring is gone and the mixin's
    // onBodyScroll (scroll-position emit only) takes over.

    shotPath(shotId) {
      return this.getPath('shot', shotId)
    },

    getPath(section, shotId) {
      const route = {
        name: section,
        params: {
          production_id: this.currentProduction?.id
        }
      }

      if (this.isTVShow && this.currentEpisode) {
        route.name = `episode-${section}`
        route.params.episode_id = this.currentEpisode.id
      }

      if (shotId) {
        route.params.shot_id = shotId
      }

      return route
    },

    onInputKeyUp(event, i, j) {
      const listWidth = this.visibleMetadataDescriptors.length + 4
      const listHeight = this.displayedShotsCount
      this.keyMetadataNavigation(listWidth, listHeight, i, j, event.key)
      return this.pauseEvent(event)
    },

    onNbFramesChanged(entry, value) {
      const shotsToChange = this.selectedShots.has(entry.id)
        ? this.selectedShots
        : [entry]

      const cleanValue = this.sanitizeIntegerLight(value)

      shotsToChange.forEach(shot => {
        this.$emit('field-changed', {
          entry: shot,
          fieldName: 'nb_frames',
          value: cleanValue
        })
      })
    },

    getIndex(i, k) {
      return this.getEntityLineNumber(this.displayedShots, i, k)
    },

    toggleStickedColumns(columnId) {
      const sticked = !this.stickedColumns[columnId]
      this.stickedColumns = {
        ...this.stickedColumns,
        [columnId]: sticked
      }
      preferences.setObjectPreference(
        this.localStorageStickKey,
        this.stickedColumns
      )
    },

    stickColumnClicked() {
      this.toggleStickedColumns(this.lastHeaderMenuDisplayed)
      this.showHeaderMenu()
    },

    metadataStickColumnClicked(event) {
      this.toggleStickedColumns(this.lastMetadataHeaderMenuDisplayed)
      this.showMetadataHeaderMenu(this.lastMetadataHeaderMenuDisplayed, event)
    },

    updateOffsets() {
      if (this.isLoading) {
        return
      }
      this.$nextTick(() => {
        let offset = this.$refs['th-shot'].clientWidth
        this.offsets = {}

        if (this.displaySettings.showInfos) {
          for (
            let metadataCol = 0;
            metadataCol < this.stickedVisibleMetadataDescriptors.length;
            metadataCol++
          ) {
            this.offsets[`editor-${metadataCol}`] = offset
            offset += this.$refs[`editor-${metadataCol}`][0].$el.clientWidth
          }
        }
        for (
          let validationCol = 0;
          validationCol < this.stickedDisplayedValidationColumns.length;
          validationCol++
        ) {
          this.offsets[`validation-${validationCol}`] = offset
          offset += this.$refs[`validation-${validationCol}`][0].$el.clientWidth
        }
      })
    }
  },

  watch: {
    displayedShots() {
      this.$options.lineIndex = {}
    },

    validationColumns() {
      this.initHiddenColumns(this.validationColumns, this.hiddenColumns)
    },

    stickedColumns() {
      this.updateOffsets()
    },

    isLoading() {
      this.updateOffsets()
    },

    isBigThumbnails() {
      this.updateOffsets()
    }
  }
}
</script>

<style lang="scss" scoped>
.datatable-wrapper {
  min-height: 40px;
  // Firefox scroll anchoring fights windowed updates: when the top spacer
  // row resizes it re-anchors the scroll position and produces micro-jumps
  // (standard TanStack Virtual mitigation). Scoped: only this virtualized
  // wrapper opts out, other datatables keep the default.
  overflow-anchor: none;
}

// PERF-1: spacer rows standing in for the off-screen virtualized items
// above/below the rendered window (see the datatable-body template).
// Qualified with .datatable-body so it outranks shared.scss's
// `.data-list .datatable-body td` padding by specificity, not by
// stylesheet injection order.
.datatable-body .virtual-spacer-row td {
  padding: 0;
  border: none;
}

// With virtualization the DOM only holds a window of rows, so the global
// `.multi-section .datatable-row:nth-child(odd/even)` zebra rules
// (App.vue) re-anchor on whatever row happens to be rendered first and
// every stripe flips each time the window shifts by one row. Stripe from
// the group-local data index instead (stripe-even/stripe-odd bound in the
// row's :class, matching the per-tbody parity the nth-child rules
// produced). Hover is redeclared after the stripes so it keeps winning.
tr.datatable-row.stripe-even,
tr.datatable-row.stripe-even .datatable-row-header {
  background-color: var(--background);
}

tr.datatable-row.stripe-odd,
tr.datatable-row.stripe-odd .datatable-row-header {
  background-color: var(--background-alt);
}

tr.datatable-row:hover,
tr.datatable-row:hover .datatable-row-header {
  background-color: var(--background-hover);
}

.actions {
  min-width: 160px;
  position: sticky;
}

th.actions {
  padding: 0.4em;
}

.name {
  min-width: 100px;
  width: 100px;
}

.bold {
  font-weight: bold;
}

.name a {
  color: inherit;
}

thead .name.shot-name {
  min-width: 110px;
  width: 300px;
}

.episode {
  min-width: 100px;
  width: 100px;
}

.sequence {
  min-width: 100px;
  width: 100px;
  font-weight: bold;
}

.framein {
  min-width: 60px;
  width: 60px;
}

.frameout {
  min-width: 60px;
  width: 60px;
}

.fps {
  min-width: 70px;
  max-width: 70px;
  width: 70px;
}

.resolution {
  min-width: 110px;
  max-width: 110px;
  width: 110px;
}

.max-retakes {
  min-width: 80px;
  max-width: 80px;
  width: 80px;
}

.description {
  min-width: 200px;
  max-width: 200px;
  width: 200px;
}

.validation-cell {
  min-width: 150px;
  max-width: 150px;
  width: 150px;
}

.expand-task-types :deep(.validation-cell) {
  width: auto;
  min-width: 150px;
  max-width: none;
}

.expand-task-types :deep(.task-type-name) {
  max-width: none;
  overflow: visible;
  text-overflow: clip;
}

.frames {
  min-width: 80px;
  max-width: 80px;
  width: 80px;
}

.drawings {
  min-width: 80px;
  max-width: 80px;
  width: 80px;
}

.estimation,
.time-spent {
  min-width: 70px;
  max-width: 70px;
  width: 70px;
}

td.name {
  font-size: 1.2em;
}

td.sequence {
  font-size: 1.2em;
}

span.thumbnail-empty {
  display: block;
  width: 50px;
  height: 30px;
  background: #f3f3f3;
}

.info {
  margin-top: 2em;
}

.info img {
  max-width: 80vh;
}

.datatable-row th.name {
  font-size: 1.1em;
  padding: 6px;
}

input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}

// Metadata cell CSS

td.metadata-descriptor {
  height: 3.1rem;
  padding: 0;
}

.metadata-value {
  padding: 0.5rem 0.75rem;
}
</style>
