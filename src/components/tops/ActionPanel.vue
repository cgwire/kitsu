<template>
  <div>
    <div class="action-topbar unselectable">
      <div class="menu flexrow">
        <div
          class="menu-item status-item"
          :class="{
            active: selectedBar === 'change-status'
          }"
          :title="$t('menu.change_status')"
          role="button"
          tabindex="0"
          @click="selectBar('change-status')"
          @keydown.enter.prevent="selectBar('change-status')"
          @keydown.space.prevent="selectBar('change-status')"
          v-if="
            (isCurrentUserManager ||
              isSupervisorInDepartment ||
              isInDepartment ||
              isCurrentViewTodos) &&
            !isEntitySelection &&
            !isCurrentViewConcept &&
            isTaskSelection
          "
        >
          {{ $t('main.status') }}
        </div>

        <div
          class="menu-item"
          :class="{
            active: selectedBar === 'assignation'
          }"
          :title="$t('menu.assign_tasks')"
          role="button"
          tabindex="0"
          @click="selectBar('assignation')"
          @keydown.enter.prevent="selectBar('assignation')"
          @keydown.space.prevent="selectBar('assignation')"
          v-if="
            (isCurrentViewSingleEntity || isCurrentViewEntity) &&
            (isCurrentUserManager ||
              isSupervisorInDepartment ||
              isInDepartment ||
              isCurrentViewSingleEntity) &&
            !isEntitySelection &&
            isTaskSelection &&
            !isCurrentUserArtist
          "
        >
          <kitsu-icon
            name="user-check"
            :active="selectedBar === 'assignation'"
            :title="$t('menu.assign_tasks')"
          />
        </div>

        <div
          class="menu-item"
          :class="{
            active: selectedBar === 'priorities'
          }"
          :title="$t('menu.change_priority')"
          v-if="
            (isCurrentViewSingleEntity ||
              isCurrentViewEntity ||
              isCurrentViewPerson) &&
            (isCurrentUserManager || isSupervisorInDepartment) &&
            !isEntitySelection &&
            isTaskSelection
          "
          role="button"
          tabindex="0"
          @click="selectBar('priorities')"
          @keydown.enter.prevent="selectBar('priorities')"
          @keydown.space.prevent="selectBar('priorities')"
        >
          <kitsu-icon
            name="priority"
            :active="selectedBar === 'priorities'"
            :title="$t('menu.change_priority')"
          />
        </div>

        <div
          class="menu-item"
          :class="{
            active: selectedBar === 'thumbnails'
          }"
          :title="$t('menu.set_thumbnails')"
          v-if="
            isTaskSelection && !isCurrentUserArtist && !isCurrentViewConcept
          "
          role="button"
          tabindex="0"
          @click="selectBar('thumbnails')"
          @keydown.enter.prevent="selectBar('thumbnails')"
          @keydown.space.prevent="selectBar('thumbnails')"
        >
          <kitsu-icon
            name="add-thumbnail"
            :active="selectedBar === 'thumbnails'"
            :title="$t('menu.set_thumbnails')"
          />
        </div>

        <div
          class="menu-item"
          :class="{
            active: selectedBar === 'subscribe'
          }"
          :title="$t('menu.subscribe')"
          v-if="
            isTaskSelection &&
            !isCurrentViewSingleEntity &&
            !isCurrentViewTodos &&
            !isCurrentViewConcept
          "
          role="button"
          tabindex="0"
          @click="selectBar('subscribe')"
          @keydown.enter.prevent="selectBar('subscribe')"
          @keydown.space.prevent="selectBar('subscribe')"
        >
          <kitsu-icon
            name="watch"
            :active="selectedBar === 'subscribe'"
            :title="$t('menu.subscribe')"
          />
        </div>

        <div
          class="menu-item ml05"
          :class="{
            active: selectedBar === 'edit-concepts'
          }"
          :title="$t('menu.edit_concepts')"
          role="button"
          tabindex="0"
          @click="selectBar('edit-concepts')"
          @keydown.enter.prevent="selectBar('edit-concepts')"
          @keydown.space.prevent="selectBar('edit-concepts')"
          v-if="
            isCurrentViewConcept &&
            (isCurrentUserManager || isConceptPublisher) &&
            isTaskSelection
          "
        >
          <link-icon />
        </div>

        <div
          class="menu-separator"
          v-if="!isEntitySelection && isTaskSelection && nbSelectedTasks > 1"
        ></div>

        <div
          class="menu-item"
          :class="{
            active: selectedBar === 'playlists'
          }"
          :title="$t('menu.generate_playlist')"
          v-if="
            (isCurrentViewAsset ||
              isCurrentViewShot ||
              isCurrentViewSequence ||
              isCurrentViewTodos ||
              isCurrentViewTaskType) &&
            !isEntitySelection &&
            !isCurrentViewSingleEntity &&
            isTaskSelection &&
            nbSelectedTasks > 0
          "
          role="button"
          tabindex="0"
          @click="selectBar('playlists')"
          @keydown.enter.prevent="selectBar('playlists')"
          @keydown.space.prevent="selectBar('playlists')"
        >
          <kitsu-icon
            name="playlists"
            :active="selectedBar === 'playlists'"
            :title="$t('menu.generate_playlist')"
          />
        </div>

        <div
          v-if="
            (isCurrentViewAsset ||
              isCurrentViewShot ||
              isCurrentViewTaskType) &&
            !isEntitySelection &&
            !isCurrentViewSingleEntity &&
            isTaskSelection &&
            isCurrentUserManager
          "
          class="menu-separator"
        ></div>

        <div
          class="menu-item"
          :class="{
            active: selectedBar === 'create-tasks'
          }"
          :title="$t('menu.create_tasks')"
          role="button"
          tabindex="0"
          @click="selectBar('create-tasks')"
          @keydown.enter.prevent="selectBar('create-tasks')"
          @keydown.space.prevent="selectBar('create-tasks')"
          v-if="
            isCurrentViewEntity &&
            !isCurrentViewTaskType &&
            isCurrentUserManager &&
            !isEntitySelection &&
            nbSelectedTasks !== 1
          "
        >
          <check-square-icon />
        </div>

        <div
          class="menu-item"
          :class="{
            active: selectedBar === 'delete-tasks'
          }"
          :title="$t('menu.delete_tasks')"
          role="button"
          tabindex="0"
          @click="selectBar('delete-tasks')"
          @keydown.enter.prevent="selectBar('delete-tasks')"
          @keydown.space.prevent="selectBar('delete-tasks')"
          v-if="
            isCurrentViewEntity &&
            isCurrentUserManager &&
            !isEntitySelection &&
            !isCurrentViewSingleEntity &&
            isTaskSelection
          "
        >
          <kitsu-icon
            name="trash"
            :active="selectedBar === 'delete-tasks'"
            :title="$t('menu.delete_tasks')"
          />
        </div>

        <div class="menu-separator" v-if="isCustomActionAvailable"></div>

        <div
          class="menu-item"
          :class="{
            active: selectedBar === 'custom-actions'
          }"
          :title="$t('menu.run_custom_action')"
          role="button"
          tabindex="0"
          @click="selectBar('custom-actions')"
          @keydown.enter.prevent="selectBar('custom-actions')"
          @keydown.space.prevent="selectBar('custom-actions')"
          v-if="isCustomActionAvailable"
        >
          <play-circle-icon />
        </div>

        <div
          class="menu-item"
          :class="{
            active: selectedBar === 'delete-assets'
          }"
          :title="$t('menu.delete_assets')"
          role="button"
          tabindex="0"
          @click="selectBar('delete-assets')"
          @keydown.enter.prevent="selectBar('delete-assets')"
          @keydown.space.prevent="selectBar('delete-assets')"
          v-if="isCurrentViewAsset && isCurrentUserManager && !isTaskSelection"
        >
          <kitsu-icon name="trash" :title="$t('menu.delete_assets')" />
        </div>

        <div
          class="menu-item"
          :class="{
            active: selectedBar === 'delete-shots'
          }"
          :title="$t('menu.delete_shots')"
          role="button"
          tabindex="0"
          @click="selectBar('delete-shots')"
          @keydown.enter.prevent="selectBar('delete-shots')"
          @keydown.space.prevent="selectBar('delete-shots')"
          v-if="isCurrentViewShot && isCurrentUserManager && !isTaskSelection"
        >
          <kitsu-icon name="trash" :title="$t('menu.delete_shots')" />
        </div>

        <div
          class="menu-item"
          :class="{
            active: selectedBar === 'delete-edits'
          }"
          :title="$t('menu.delete_edits')"
          role="button"
          tabindex="0"
          @click="selectBar('delete-edits')"
          @keydown.enter.prevent="selectBar('delete-edits')"
          @keydown.space.prevent="selectBar('delete-edits')"
          v-if="isCurrentViewEdit && isCurrentUserManager && !isTaskSelection"
        >
          <kitsu-icon name="trash" :title="$t('menu.delete_edits')" />
        </div>

        <div
          class="menu-item"
          :class="{
            active: selectedBar === 'delete-concepts'
          }"
          :title="$t('menu.delete_concepts')"
          role="button"
          tabindex="0"
          @click="selectBar('delete-concepts')"
          @keydown.enter.prevent="selectBar('delete-concepts')"
          @keydown.space.prevent="selectBar('delete-concepts')"
          v-if="
            isCurrentViewConcept && (isCurrentUserManager || isConceptPublisher)
          "
        >
          <kitsu-icon name="trash" :title="$t('menu.delete_concepts')" />
        </div>

        <div class="filler"></div>

        <div
          class="menu-item"
          :title="$t('main.csv.export_file')"
          role="button"
          tabindex="0"
          @click="$emit('export-task')"
          @keydown.enter.prevent="$emit('export-task')"
          @keydown.space.prevent="$emit('export-task')"
          v-if="
            isTaskSelection &&
            !isEntitySelection &&
            nbSelectedTasks === 1 &&
            !isCurrentUserClient
          "
        >
          <kitsu-icon name="export" :title="$t('main.csv.export_file')" />
        </div>

        <div
          class="menu-item mr05"
          :title="$t('main.clear_selection')"
          role="button"
          tabindex="0"
          @click="clearSelection"
          @keydown.enter.prevent="clearSelection"
          @keydown.space.prevent="clearSelection"
        >
          <x-icon :size="16" />
        </div>
      </div>

      <div class="flexrow action-bar" v-if="selectedBar">
        <div class="flexcolumn is-wide" v-if="selectedBar === 'change-status'">
          <div class="flexrow mb05">
            <div class="flexrow-item change-status-item">
              <combobox-status
                :with-margin="false"
                :task-status-list="availableTaskStatuses"
                v-model="taskStatusId"
              />
            </div>
            <div class="flexrow-item is-wide">
              <textarea
                class="comment-text input w100"
                type="text"
                :placeholder="$t('comments.add_comment')"
                @keyup.ctrl.enter="confirmTaskStatusChange"
                @keyup.meta.enter="confirmTaskStatusChange"
                v-model="statusComment"
              />
            </div>
          </div>

          <div class="flexrow-item is-wide">
            <button
              class="button confirm-button is-wide"
              :class="{
                'is-loading': loading.changeStatus
              }"
              @click="confirmTaskStatusChange"
            >
              {{
                $t('tasks.change_task_status', {
                  count: nbSelectedTasks,
                  nbSelectedTasks
                })
              }}
            </button>
          </div>
        </div>

        <div
          class="flexcolumn flexrow-item is-wide"
          v-if="selectedBar === 'assignation'"
        >
          <div class="mb05" v-if="isCurrentUserArtist">
            {{ $t('tasks.to_myself') }}
          </div>
          <div
            class="mb05"
            v-else-if="isCurrentUserManager || isCurrentUserSupervisor"
          >
            <people-field
              class="is-wide assignation-field"
              ref="assignation-field"
              :people="currentTeam"
              :placeholder="$t('tasks.assign_explanation')"
              wide
              v-model="person"
            />
          </div>

          <div class="flexrow-item mt1 mb1" v-if="loading.assignation">
            <spinner :size="20" class="spinner" />
          </div>
          <div class="flexrow-item is-wide" v-if="!loading.assignation">
            <button
              class="button confirm-button is-wide"
              @click="confirmAssign"
            >
              {{
                $t('tasks.assign', { count: nbSelectedTasks, nbSelectedTasks })
              }}
            </button>
          </div>
          <div class="flexrow-item mb05 disclaimer">
            <router-link
              :to="{
                name: 'team',
                params: {
                  production_id: currentProduction.id
                }
              }"
              target="_blank"
            >
              {{ $t('tasks.assignation_disclaimer') }}
            </router-link>
          </div>
          <div
            class="flexrow-item mb05 assignation-error"
            v-if="errors.taskAssignation"
          >
            <p class="is-danger has-text-centered">
              {{ $t('tasks.assignation_error') }}
            </p>
          </div>
          <div
            class="flexrow-item is-wide flexrow"
            v-if="
              !loading.assignation &&
              (isCurrentUserManager || isSupervisorInDepartment)
            "
          >
            <div class="mauto flexrow">
              <button
                class="button is-link clear-assignation-button filler"
                @click="clearAssignation"
              >
                {{ $t('tasks.clear_assignations') }}
              </button>
              {{ $t('main.or') }}
              <button
                class="button is-link clear-assignation-button"
                @click="clearAllAssignations"
              >
                {{ $t('tasks.clear_all_assignations') }}
              </button>
            </div>
          </div>
          <div
            class="flexrow-item hide-small-screen"
            v-else-if="!loading.assignation && isCurrentUserArtist"
          >
            <button
              class="button is-link clear-assignation-button hide-small-screen"
              @click="clearAssignation"
            >
              {{ $t('tasks.clear_own_assignations') }}
            </button>
          </div>
          <div class="flexrow-item" v-if="!isShowAssignations">
            {{ $t('tasks.assignation_warning') }}
          </div>
        </div>

        <div class="flexcolumn filler" v-if="selectedBar === 'priorities'">
          <div class="flexrow-item flexrow priority-combobox mb05">
            <div class="flexrow-item">
              {{ $t('tasks.change_priority_to') }}
            </div>
            <combobox-styled
              class="flexrow-item"
              is-thin
              :options="priorityOptions"
              v-model="priority"
            />
          </div>
          <div class="flexrow-item is-wide">
            <button
              class="button confirm-button is-wide"
              :class="{
                'is-loading': loading.changePriority
              }"
              @click="confirmPriorityChange"
            >
              {{
                $t('tasks.change_priority', {
                  count: nbSelectedTasks,
                  nbSelectedTasks
                })
              }}
            </button>
          </div>
        </div>

        <div class="flexrow is-wide" v-if="selectedBar === 'create-tasks'">
          <button
            class="button confirm-button is-wide"
            :class="{
              'is-loading': loading.taskCreation
            }"
            @click="confirmTaskCreation"
            v-if="nbSelectedTasks !== 1"
          >
            {{ $t('tasks.create_for_selection') }}
          </button>
        </div>

        <div class="flexrow-item is-wide" v-if="selectedBar === 'thumbnails'">
          <button
            class="button confirm-button is-wide"
            :class="{
              'is-loading': loading.setThumbnails
            }"
            @click="confirmSetThumbnailsFromTasks"
            v-if="nbSelectedTasks > 1"
          >
            {{
              $t('tasks.set_thumbnails_from_tasks', {
                count: nbSelectedTasks,
                nbSelectedTasks
              })
            }}
          </button>
          <div v-else>
            <button
              class="button confirm-button is-wide"
              :class="{
                'is-loading':
                  loading.setThumbnails || isSetFrameThumbnailLoading
              }"
              @click="confirmSetThumbnailsFromTasks"
            >
              {{ $t('tasks.set_preview') }}
            </button>
            <label class="is-inline-block mt05 pointer" v-if="isMoviePreview">
              <input class="mr02" type="checkbox" v-model="isUseCurrentFrame" />
              {{ $t('tasks.use_current_frame') }}
            </label>
          </div>
        </div>

        <div class="flexcolumn filler" v-if="selectedBar === 'subscribe'">
          <div v-if="loading.tasksSubscription">
            <div class="flexrow-item">
              <spinner :size="20" class="spinner" />
            </div>
            <div class="flexrow-item">&nbsp;</div>
          </div>

          <div class="flexrow-item is-wide" v-if="!loading.tasksSubscription">
            <button
              class="button confirm-button is-wide"
              @click="confirmTasksSubscription"
            >
              {{
                $t('tasks.subscribe_to_tasks', {
                  count: nbSelectedTasks,
                  nbSelectedTasks
                })
              }}
            </button>
          </div>
          <div class="has-text-centered" v-if="!loading.tasksSubscription">
            <button
              class="button is-link filler"
              @click="confirmTasksUnsubscription"
            >
              {{ $t('tasks.unsubscribe_notifications') }}
            </button>
          </div>
        </div>

        <div class="flexrow-item is-wide" v-if="selectedBar === 'playlists'">
          <button
            class="button confirm-button is-wide"
            @click="confirmPlaylistGeneration"
          >
            {{ $t('playlists.create_for_selection') }}
          </button>
        </div>

        <div
          class="flexrow-item is-wide"
          v-if="selectedBar === 'edit-concepts'"
        >
          <h3 class="mb05">{{ $t('concepts.actions.title') }}</h3>
          <ul class="tags mb05">
            <li v-if="!conceptLinkedEntities.length">
              <em>{{ $t('concepts.actions.empty') }}</em>
            </li>
            <template v-else>
              <li
                :key="entity.id"
                class="tag"
                role="button"
                tabindex="0"
                @click="onRemoveLink(entity)"
                @keydown.enter.prevent="onRemoveLink(entity)"
                @keydown.space.prevent="onRemoveLink(entity)"
                v-for="entity in conceptLinkedEntities"
              >
                {{ entity.name }}
              </li>
            </template>
          </ul>
        </div>

        <div class="flexrow-item is-wide" v-if="selectedBar === 'delete-tasks'">
          <delete-entities
            :error-text="$t('tasks.delete_for_selection_error')"
            :is-loading="loading.taskDeletion"
            :is-error="errors.taskDeletion"
            :require-hard-delete-confirmation="true"
            :hard-delete-lock-text="
              $t('tasks.delete_for_selection_hard_lock_text')
            "
            :hard-delete-text="$t('tasks.delete_for_selection_hard_text')"
            :text="
              $t('tasks.delete_for_selection', {
                count: nbSelectedTasks,
                nbSelectedTasks
              })
            "
            @confirm="confirmTaskDeletion"
          />
        </div>

        <div class="flexcolumn filler" v-if="selectedBar === 'custom-actions'">
          <div class="flexrow-item custom-action-combobox is-wide">
            <combobox-model
              class="is-wide"
              :models="customActions"
              v-model="customAction"
            />
          </div>

          <div class="flexrow mt05">
            <div
              class="flexrow-item is-wide"
              v-if="customAction && !customAction.is_ajax"
            >
              <form target="_blank" method="POST" :action="customAction.url">
                <input
                  type="hidden"
                  id="personid"
                  name="personid"
                  :value="user.id"
                />
                <input
                  type="hidden"
                  id="personemail"
                  name="personemail"
                  :value="user.email"
                />
                <input
                  type="hidden"
                  id="projectid"
                  name="projectid"
                  :value="productionId"
                />
                <input
                  type="hidden"
                  id="currentpath"
                  name="currentpath"
                  :value="currentUrl"
                />
                <input
                  type="hidden"
                  id="currentserver"
                  name="currentserver"
                  :value="currentHost"
                />
                <input
                  type="hidden"
                  id="selection"
                  name="selection"
                  :value="selectedTaskIds"
                />
                <input
                  type="hidden"
                  id="entitytype"
                  name="entitytype"
                  :value="currentEntityType"
                />
                <button class="button is-wide" type="submit">
                  {{
                    $t('custom_actions.run_for_selection', {
                      count: nbSelectedTasks,
                      nbSelectedTasks
                    })
                  }}
                </button>
              </form>
            </div>
            <div class="flexrow-item is-wide" v-else>
              <button class="button is-wide" @click="runCustomAction">
                {{
                  $t('custom_actions.run_for_selection', {
                    count: nbSelectedTasks,
                    nbSelectedTasks
                  })
                }}
              </button>
            </div>
          </div>
        </div>

        <div
          class="flexrow-item is-wide"
          v-if="selectedBar === 'delete-assets'"
        >
          <delete-entities
            :error-text="$t('assets.multiple_delete_error')"
            :is-loading="loading.assetDeletion"
            :is-error="errors.assetDeletion"
            :text="
              $t('assets.delete_for_selection', {
                count: nbSelectedAssets,
                nbSelectedAssets
              })
            "
            :require-hard-delete-confirmation="allAssetsCanceled"
            :hard-delete-lock-text="
              $t('assets.delete_for_selection_hard_lock_text')
            "
            :hard-delete-text="$t('assets.delete_for_selection_hard_text')"
            @confirm="confirmAssetDeletion"
          />
        </div>

        <div class="flexrow-item is-wide" v-if="selectedBar === 'delete-shots'">
          <delete-entities
            :error-text="$t('shots.multiple_delete_error')"
            :is-loading="loading.shotDeletion"
            :is-error="errors.shotDeletion"
            :text="
              $t('shots.delete_for_selection', {
                count: nbSelectedShots,
                nbSelectedShots
              })
            "
            :require-hard-delete-confirmation="allShotsCanceled"
            :hard-delete-lock-text="
              $t('shots.delete_for_selection_hard_lock_text')
            "
            :hard-delete-text="$t('shots.delete_for_selection_hard_text')"
            @confirm="confirmShotDeletion"
          />
        </div>

        <div class="flexrow-item is-wide" v-if="selectedBar === 'delete-edits'">
          <delete-entities
            :error-text="$t('edits.multiple_delete_error')"
            :is-loading="loading.editDeletion"
            :is-error="errors.editDeletion"
            :text="
              $t('edits.delete_for_selection', {
                count: nbSelectedEdits,
                nbSelectedEdits
              })
            "
            :require-hard-delete-confirmation="allEditsCanceled"
            :hard-delete-lock-text="
              $t('edits.delete_for_selection_hard_lock_text')
            "
            :hard-delete-text="$t('edits.delete_for_selection_hard_text')"
            @confirm="confirmEditDeletion"
          />
        </div>

        <div
          class="flexrow-item is-wide"
          v-if="selectedBar === 'delete-concepts'"
        >
          <delete-entities
            :error-text="$t('concepts.multiple_delete_error')"
            :is-loading="loading.conceptDeletion"
            :is-error="errors.conceptDeletion"
            :text="
              $t('concepts.delete_for_selection', {
                count: nbSelectedConcepts,
                nbSelectedConcepts
              })
            "
            :require-hard-delete-confirmation="true"
            :hard-delete-lock-text="
              $t('concepts.delete_for_selection_hard_lock_text')
            "
            :hard-delete-text="$t('concepts.delete_for_selection_hard_text')"
            @confirm="confirmConceptDeletion"
          />
        </div>
      </div>
    </div>

    <div
      class="flexrow-item is-wide pa1"
      v-if="selectedBar === 'edit-concepts'"
    >
      <div class="concept-links">
        <h2 class="subtitle">{{ $t('concepts.add_links') }}</h2>
        <div class="flexrow mb2">
          <search-field
            ref="entity-search-field"
            @change="onEntitySearchChange"
          />
          <button-simple
            class="flexrow-item"
            :title="$t('entities.build_filter.title')"
            icon="filter"
            @click="modals.buildFilter = true"
          />
        </div>
        <div class="link-list">
          <ul
            class="link-types"
            :key="`link-types-${index}`"
            v-for="(linkGroup, index) in availableLinksByType"
          >
            <li class="link-type">
              <h4 class="subtitle">
                {{ linkGroup.type }}
              </h4>
              <ul class="tags">
                <li
                  class="tag"
                  :key="link.id"
                  role="button"
                  tabindex="0"
                  @click="onSelectLink(link)"
                  @keydown.enter.prevent="onSelectLink(link)"
                  @keydown.space.prevent="onSelectLink(link)"
                  v-for="link in linkGroup.links"
                >
                  {{ link.name }}
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <build-filter-modal
      :active="modals.buildFilter"
      @confirm="confirmBuildFilter"
      @cancel="modals.buildFilter = false"
      v-if="isCurrentViewConcept"
    />

    <view-playlist-modal
      active
      sort
      :task-ids="selectedTaskIds"
      @cancel="hidePlaylistModal"
      v-if="modals.playlist"
    />
  </div>
</template>

<script setup>
/* eslint-disable no-unused-vars */
import {
  CheckSquareIcon,
  LinkIcon,
  PlayCircleIcon,
  XIcon
} from 'lucide-vue-next'
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  useTemplateRef,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import { intersection } from '@/lib/array'
import assetsStore from '@/store/modules/assets.js'

import BuildFilterModal from '@/components/modals/BuildFilterModal.vue'
import ViewPlaylistModal from '@/components/modals/ViewPlaylistModal.vue'
import DeleteEntities from '@/components/tops/actions/DeleteEntities.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxModel from '@/components/widgets/ComboboxModel.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import KitsuIcon from '@/components/widgets/KitsuIcon.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import Spinner from '@/components/widgets/Spinner.vue'
/* eslint-enable no-unused-vars */

const { t } = useI18n()
const route = useRoute()
const store = useStore()

// Props / Emits
// --------------------------------------------------------------------------

const props = defineProps({
  isMoviePreview: { type: Boolean, default: false },
  isSetFrameThumbnailLoading: { type: Boolean, default: false },
  productionId: { type: String, default: null },
  team: { type: Array, default: () => [] }
})

const emit = defineEmits(['export-task', 'set-frame-thumbnail'])

// State
// --------------------------------------------------------------------------

const assignationFieldRef = useTemplateRef('assignation-field')
const entitySearchFieldRef = useTemplateRef('entity-search-field')

const availableTaskStatuses = ref([])
const customAction = ref({})
const customActions = ref([])
const isUseCurrentFrame = ref(false)
const person = ref(null)
const priority = ref('0')
const selectedBar = ref('')
const statusComment = ref('')
const taskStatusId = ref('')

const modals = reactive({
  buildFilter: false,
  playlist: false
})

const loading = reactive({
  assignation: false,
  assetDeletion: false,
  changePriority: false,
  changeStatus: false,
  conceptDeletion: false,
  editDeletion: false,
  taskCreation: false,
  taskDeletion: false,
  setThumbnails: false,
  shotDeletion: false,
  tasksSubscription: false
})

const errors = reactive({
  assetDeletion: false,
  conceptDeletion: false,
  editDeletion: false,
  shotDeletion: false,
  taskAssignation: false,
  taskDeletion: false
})

const currentHost = window.location.host

// Computed
// --------------------------------------------------------------------------

const assetsByType = computed(() => store.getters.assetsByType)
const currentProduction = computed(() => store.getters.currentProduction)
const isCurrentUserArtist = computed(() => store.getters.isCurrentUserArtist)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
const isShowAssignations = computed(() => store.getters.isShowAssignations)
const nbSelectedTasks = computed(() => store.getters.nbSelectedTasks)
const nbSelectedValidations = computed(
  () => store.getters.nbSelectedValidations
)
const productionMap = computed(() => store.getters.productionMap)
const selectedAssets = computed(() => store.getters.selectedAssets)
const selectedConcepts = computed(() => store.getters.selectedConcepts)
const selectedEdits = computed(() => store.getters.selectedEdits)
const selectedShots = computed(() => store.getters.selectedShots)
const selectedTasks = computed(() => store.getters.selectedTasks)
const taskMap = computed(() => store.getters.taskMap)
const taskStatusForCurrentUser = computed(
  () => store.getters.taskStatusForCurrentUser
)
const taskTypeMap = computed(() => store.getters.taskTypeMap)
const user = computed(() => store.getters.user)

// Role gating follows the production of the displayed tasks, not the
// globally selected one: this panel also serves cross-production views
// (Todos, All Tasks, checks, notifications).
const currentUserProductionRole = computed(() =>
  store.getters.currentUserRoleForProduction(props.productionId)
)

const isCurrentUserManager = computed(
  () =>
    store.getters.isCurrentUserAdmin ||
    currentUserProductionRole.value === 'manager'
)

const isCurrentUserSupervisor = computed(
  () => currentUserProductionRole.value === 'supervisor'
)

const currentUrl = computed(() => route.path)

const isCurrentViewSingleEntity = computed(() =>
  [
    'asset',
    'shot',
    'edit',
    'episode',
    'sequence',
    'episode-asset',
    'episode-shot',
    'episode-edit',
    'episode-sequence'
  ].includes(route.name)
)

const isCurrentViewAsset = computed(
  () => route.path.includes('asset') && !route.params.shot_id
)

const isCurrentViewShot = computed(
  () => route.path.includes('shot') && !route.params.shot_id
)

const isCurrentViewEdit = computed(
  () => route.path.includes('edit') && !route.params.edit_id
)

const isCurrentViewConcept = computed(() => route.path.includes('concept'))

const isCurrentViewPerson = computed(() => route.path.includes('people/'))

const isCurrentViewTodos = computed(
  () => route.path.includes('my-tasks') || isCurrentViewPerson.value
)

const isCurrentViewTaskType = computed(() => route.path.includes('task-type'))

const isCurrentViewAssetShotOrEdit = computed(
  () =>
    isCurrentViewAsset.value ||
    isCurrentViewShot.value ||
    isCurrentViewEdit.value
)

const isCurrentViewEpisode = computed(
  () => !isCurrentViewAssetShotOrEdit.value && route.path.includes('episodes')
)

const isCurrentViewSequence = computed(
  () => !isCurrentViewAssetShotOrEdit.value && route.path.includes('sequences')
)

const isCurrentViewEntity = computed(
  () =>
    isCurrentViewAssetShotOrEdit.value ||
    isCurrentViewSequence.value ||
    isCurrentViewEpisode.value
)

const currentEntityType = computed(() => {
  if (isCurrentViewAsset.value) return 'asset'
  if (isCurrentViewShot.value) return 'shot'
  if (isCurrentViewSequence.value) return 'sequence'
  if (isCurrentViewEdit.value) return 'edit'
  return 'episode'
})

const currentConcept = computed(
  () => selectedConcepts.value.values().next().value
)

const isConceptPublisher = computed(
  () => currentConcept.value?.created_by === user.value.id
)

const conceptLinkedEntities = computed(() =>
  (currentConcept.value?.entity_concept_links ?? [])
    .map(id => assetsStore.cache.assetMap.get(id))
    .filter(Boolean)
)

const availableLinksByType = computed(() =>
  assetsByType.value
    .filter(assets => assets.length)
    .map(assets => ({
      type: assets[0].asset_type_name,
      links: assets
        .filter(
          asset =>
            !conceptLinkedEntities.value.some(entity => entity.id === asset.id)
        )
        .map(asset => ({ id: asset.id, name: asset.name }))
    }))
)

const currentTeam = computed(() => {
  const isSupervisorWithDepartments =
    isCurrentUserSupervisor.value && user.value.departments.length > 0
  return props.team.filter(
    member =>
      !member?.is_bot &&
      (!isSupervisorWithDepartments ||
        member.departments.length === 0 ||
        member.departments.some(department =>
          user.value.departments.includes(department)
        ))
  )
})

const priorityOptions = computed(() =>
  ['normal', 'high', 'very_high', 'emergency'].map((name, index) => ({
    label: t(`tasks.priority.${name}`),
    value: String(index)
  }))
)

const isTaskSelection = computed(() => nbSelectedTasks.value > 0)

const nbSelectedAssets = computed(() => selectedAssets.value.size)
const nbSelectedShots = computed(() => selectedShots.value.size)
const nbSelectedEdits = computed(() => selectedEdits.value.size)
const nbSelectedConcepts = computed(() => selectedConcepts.value.size)

const isEntitySelection = computed(
  () =>
    nbSelectedAssets.value > 0 ||
    nbSelectedShots.value > 0 ||
    nbSelectedEdits.value > 0
)

const isCustomActionAvailable = computed(
  () =>
    !isEntitySelection.value &&
    isTaskSelection.value &&
    !isCurrentViewConcept.value &&
    customActions.value.length > 0
)

const allAssetsCanceled = computed(() =>
  Array.from(selectedAssets.value.values()).every(asset => asset.canceled)
)

const allShotsCanceled = computed(() =>
  Array.from(selectedShots.value.values()).every(shot => shot.canceled)
)

const allEditsCanceled = computed(() =>
  Array.from(selectedEdits.value.values()).every(edit => edit.canceled)
)

const isHidden = computed(
  () =>
    (nbSelectedTasks.value === 0 &&
      nbSelectedValidations.value === 0 &&
      nbSelectedAssets.value === 0 &&
      nbSelectedShots.value === 0 &&
      nbSelectedEdits.value === 0 &&
      nbSelectedConcepts.value === 0) ||
    !(
      isCurrentViewEntity.value ||
      isCurrentViewTodos.value ||
      isCurrentViewConcept.value
    )
)

const selectedTaskIds = computed(() => Array.from(selectedTasks.value.keys()))

const isInDepartment = computed(() =>
  selectedTaskIds.value.every(taskId => {
    const task = taskMap.value.get(taskId)
    // A task that is not loaded must not block the action here.
    if (!task) return true
    const taskType = taskTypeMap.value.get(task.task_type_id)
    return (
      taskType?.department_id &&
      user.value.departments.includes(taskType.department_id)
    )
  })
)

const isSupervisorInDepartment = computed(
  () =>
    isCurrentUserSupervisor.value &&
    (user.value.departments.length === 0 || isInDepartment.value)
)

const storagePrefix = computed(() => {
  if (isCurrentViewTaskType.value) return 'tasks-'
  if (isCurrentViewConcept.value) return 'concepts-'
  if (isCurrentViewAssetShotOrEdit.value) return 'entities-'
  return 'todos-'
})

// Functions
// --------------------------------------------------------------------------

const confirmTaskStatusChange = async () => {
  loading.changeStatus = true
  if (!taskStatusId.value) {
    taskStatusId.value = availableTaskStatuses.value[0].id
  }
  try {
    await store.dispatch('changeSelectedTaskStatus', {
      taskStatusId: taskStatusId.value,
      comment: statusComment.value
    })
    statusComment.value = ''
  } catch (err) {
    console.error(err)
  }
  loading.changeStatus = false
}

const confirmAssign = async () => {
  if (person.value || isInDepartment.value) {
    const personId =
      isCurrentUserManager.value || isCurrentUserSupervisor.value
        ? (person.value?.id ?? null)
        : user.value.id
    loading.assignation = true
    errors.taskAssignation = false
    try {
      await store.dispatch('assignSelectedTasks', { personId })
      assignationFieldRef.value?.clear()
    } catch (err) {
      errors.taskAssignation = true
      console.error(err)
    } finally {
      loading.assignation = false
    }
  }
}

const runUnassignation = async (action, payload) => {
  loading.assignation = true
  try {
    await store.dispatch(action, payload)
  } catch (err) {
    console.error(err)
  }
  loading.assignation = false
}

const clearAssignation = () => {
  const personToClear = isCurrentUserArtist.value ? user.value : person.value
  if (personToClear) {
    runUnassignation('unassignPersonFromTasks', {
      tasks: Array.from(selectedTasks.value.values()),
      person: personToClear
    })
  }
}

const clearAllAssignations = () => runUnassignation('unassignSelectedTasks', {})

const confirmPriorityChange = async () => {
  loading.changePriority = true
  try {
    await store.dispatch('changeSelectedPriorities', {
      priority: Number(priority.value)
    })
  } catch (err) {
    console.error(err)
  }
  loading.changePriority = false
}

const confirmTaskCreation = async () => {
  const type =
    ['shots', 'assets', 'edits'].find(name => route.path.includes(name)) ||
    'episodes'
  loading.taskCreation = true
  try {
    await store.dispatch('createSelectedTasks', {
      type,
      projectId: props.productionId
    })
  } catch (err) {
    console.error(err)
  }
  loading.taskCreation = false
}

const runDeletion = async (key, deleteAction, clearAction) => {
  loading[key] = true
  errors[key] = false
  try {
    await store.dispatch(deleteAction)
    store.dispatch(clearAction)
  } catch (err) {
    console.error(err)
    errors[key] = true
  }
  loading[key] = false
}

const confirmTaskDeletion = () =>
  runDeletion('taskDeletion', 'deleteSelectedTasks', 'clearSelectedTasks')

const confirmAssetDeletion = () =>
  runDeletion('assetDeletion', 'deleteSelectedAssets', 'clearSelectedAssets')

const confirmShotDeletion = () =>
  runDeletion('shotDeletion', 'deleteSelectedShots', 'clearSelectedShots')

const confirmEditDeletion = () =>
  runDeletion('editDeletion', 'deleteSelectedEdits', 'clearSelectedEdits')

const confirmConceptDeletion = () =>
  runDeletion(
    'conceptDeletion',
    'deleteSelectedConcepts',
    'clearSelectedConcepts'
  )

const confirmPlaylistGeneration = () => {
  modals.playlist = true
  selectedBar.value = ''
}

const hidePlaylistModal = () => {
  modals.playlist = false
}

const runSubscription = async action => {
  loading.tasksSubscription = true
  try {
    await store.dispatch(action, selectedTaskIds.value)
  } catch (err) {
    console.error(err)
  }
  loading.tasksSubscription = false
}

const confirmTasksSubscription = () => runSubscription('subscribeToTasks')

const confirmTasksUnsubscription = () => runSubscription('unsubscribeFromTasks')

const confirmSetThumbnailsFromTasks = async () => {
  if (nbSelectedTasks.value === 1) {
    emit('set-frame-thumbnail', props.isMoviePreview && isUseCurrentFrame.value)
  } else {
    loading.setThumbnails = true
    try {
      await store.dispatch('setTasksMainPreview', selectedTaskIds.value)
    } catch (err) {
      console.error(err)
    }
    loading.setThumbnails = false
  }
}

const runCustomAction = () => {
  store.dispatch('postCustomAction', {
    data: {
      entitytype: currentEntityType.value,
      originurl: currentUrl.value,
      originserver: currentHost,
      selection: selectedTaskIds.value,
      productionid: props.productionId,
      userid: user.value.id,
      useremail: user.value.email
    },
    url: customAction.value.url
  })
}

const onKeyDown = event => {
  if (event.keyCode === 27 && !modals.playlist) {
    store.commit('CLEAR_SELECTED_TASKS')
  }
}

const clearSelection = () => {
  store.dispatch('clearSelectedAssets')
  store.dispatch('clearSelectedShots')
  store.dispatch('clearSelectedTasks')
  store.dispatch('clearSelectedEdits')
  store.dispatch('clearSelectedConcepts')
}

const selectBar = barName => {
  localStorage.setItem(`${storagePrefix.value}-selected-bar`, barName)
  selectedBar.value = selectedBar.value !== barName ? barName : ''
}

const autoChooseSelectBar = () => {
  if (isHidden.value) {
    window.removeEventListener('keydown', onKeyDown)
    return
  }
  window.addEventListener('keydown', onKeyDown)
  if (isCurrentViewAsset.value && nbSelectedAssets.value > 0) {
    selectedBar.value = 'delete-assets'
  } else if (isCurrentViewShot.value && nbSelectedShots.value > 0) {
    selectedBar.value = 'delete-shots'
  } else if (isCurrentViewEdit.value && nbSelectedEdits.value > 0) {
    selectedBar.value = 'delete-edits'
  } else if (isCurrentViewConcept.value && nbSelectedConcepts.value > 1) {
    selectedBar.value = 'delete-concepts'
  } else {
    if (nbSelectedTasks.value === 1) selectedBar.value = ''
    const lastSelection = localStorage.getItem(
      `${storagePrefix.value}-selected-bar`
    )
    if (lastSelection) {
      selectedBar.value = lastSelection
    } else if (isCurrentViewAssetShotOrEdit.value) {
      selectedBar.value = 'change-status'
    }
  }
}

const getAvailableStatuses = () => {
  if (selectedTasks.value.size === 0) return []
  const isForCurrentView = status =>
    Boolean(status.for_concept) === isCurrentViewConcept.value
  if (!isCurrentViewTodos.value) {
    return taskStatusForCurrentUser.value.filter(isForCurrentView)
  }
  const statusLists = Array.from(selectedTasks.value.values())
    .map(task => productionMap.value.get(task.project_id)?.task_statuses)
    .filter(Boolean)
  const availableStatus = new Set(intersection(statusLists))
  return taskStatusForCurrentUser.value.filter(
    status => availableStatus.has(status.id) && isForCurrentView(status)
  )
}

const getSelectionCustomActions = () => {
  const selectedTypes = new Set(
    Array.from(selectedTasks.value.values()).map(
      task => taskTypeMap.value.get(task.task_type_id)?.for_entity
    )
  )
  return store.getters.getCustomActionsByType(
    ...['Asset', 'Shot', 'Sequence', 'Edit', 'Episode'].map(type =>
      selectedTypes.has(type)
    )
  )
}

const editConceptLinks = entityConceptLinks => {
  store.dispatch('editConcept', {
    id: currentConcept.value.id,
    entity_concept_links: entityConceptLinks
  })
}

const onRemoveLink = link => {
  editConceptLinks(
    currentConcept.value.entity_concept_links.filter(id => id !== link.id)
  )
}

const onSelectLink = link => {
  editConceptLinks([...currentConcept.value.entity_concept_links, link.id])
}

const onEntitySearchChange = searchQuery => {
  store.dispatch('setAssetSearch', searchQuery)
}

const confirmBuildFilter = query => {
  modals.buildFilter = false
  entitySearchFieldRef.value.setValue(query)
  onEntitySearchChange(query)
}

// Watchers
// --------------------------------------------------------------------------

const watchEntitySelection = (count, threshold = 0) => {
  watch(count, () => {
    autoChooseSelectBar()
    if (count.value > threshold) store.dispatch('clearSelectedTasks')
  })
}

watchEntitySelection(nbSelectedAssets)
watchEntitySelection(nbSelectedShots)
watchEntitySelection(nbSelectedEdits)
watchEntitySelection(nbSelectedConcepts, 1)

watch(isHidden, autoChooseSelectBar)

watch(
  nbSelectedTasks,
  () => {
    if (nbSelectedTasks.value > 0) {
      availableTaskStatuses.value = getAvailableStatuses()
      customActions.value = getSelectionCustomActions()
      const isActionStillAvailable =
        customAction.value.url &&
        customActions.value.some(action => action.id === customAction.value.id)
      if (customActions.value.length > 0 && !isActionStillAvailable) {
        customAction.value = customActions.value[0]
      }
    }
  },
  { immediate: true }
)

watch(
  () => route.name,
  () => {
    if (nbSelectedTasks.value > 0) store.dispatch('clearSelectedTasks')
  }
)

// Lifecycle
// --------------------------------------------------------------------------

onMounted(() => {
  customAction.value = customActions.value[0] ?? {}
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<style lang="scss" scoped>
.dark {
  .action-topbar {
    background: $dark-grey-light;

    .menu {
      background: $black;
      border-bottom: 1px solid $dark-grey-light;
    }

    .action-bar {
      border-bottom: 1px solid $dark-grey-light;
    }
  }

  .concept-links {
    background: $dark-grey-light;
    border: 1px solid #222;
    box-shadow: 0 0 6px #222;
  }
}

.action-topbar {
  background: #f4f4ff;
  color: $grey;
  z-index: 1000;
}

.clear-assignation-button {
  margin: auto;
}
.clear-assignation-button:focus,
.clear-assignation-button:active,
.clear-assignation-button:hover {
  box-shadow: none;
  background: transparent;
}

.menu {
  color: var(--text);
  padding-top: 0.7em;
  border-bottom: 1px solid $light-grey-light;
  background: #fcfcff;
  overflow-x: auto;
  overflow-y: hidden;
}
.is-danger {
  color: #ff3860;
  font-style: italic;
}

.menu-item {
  cursor: pointer;
  font-size: 0.9em;
  transform: scale(0.9);
  padding: 0.2em 0.6em 0.4em 0.6em;

  > img {
    max-width: none;
  }

  &:hover {
    transform: scale(1.1);
    transition: transform ease 0.3s;
  }

  &.active {
    color: var(--text-selected);

    &:hover {
      color: var(--text-selected);
    }
  }
}

.action-bar {
  padding: 0.5em 0.5em;
  border-bottom: 1px solid $light-grey-light;
}

.button {
  border-radius: 6px;
}

.comment-text {
  border-radius: 10px;
  height: 43px;
  min-height: 43px;
  padding: 8px;
}

.priority-combobox {
  color: var(--text);
  margin-left: 0.3em;
}

.menu-separator {
  padding: 0.2em;
  border-right: 2px solid $light-grey-light;
  height: 26px;
  margin-bottom: 8px;
}

.is-wide {
  margin: 0;
  flex: 1;
  width: 100%;
}

.is-link {
  color: var(--text);
}

.change-status-item {
  margin-right: 0.5em;
}

.status-item {
  align-items: center;
  border: 2px solid var(--text);
  border-radius: 15px;
  color: var(--text);
  font-weight: bold;
  display: flex;
  font-size: 0.7em;
  justify-content: center;
  height: 100%;
  margin-left: 1em;
  margin-top: -1em;
  padding-top: 0.3em;
  text-transform: uppercase;

  &.active {
    border: 2px solid var(--text-selected);
    color: var(--text-selected);
  }
}

.spinner {
  margin: auto;
  margin-top: 0.5em;
}

.disclaimer {
  font-size: 0.8em;
  font-style: italic;
  text-align: center;
}

.tags {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-left: 0;
  min-height: 21px;
  font-weight: 500;
  letter-spacing: 1px;

  .tag {
    cursor: pointer;
    display: inline-flex;
    gap: 1em;
    border: 1px solid $light-green;
    transition: transform 0.1s linear;

    &:hover {
      transform: scale(1.1);
    }
  }
}

.concept-links {
  overflow-y: auto;
  padding: 1em;
  background: $white;
  border: 1px solid $white-grey;
  box-shadow: 0 0 6px #e0e0e0;
  border-radius: 1em;

  .subtitle {
    margin-top: 0;
    border-bottom: 0;
  }

  .link-types {
    list-style: none;
    margin-left: 0;
  }

  .link-list {
    height: 300px;
    overflow-y: auto;
  }

  .link-type {
    .subtitle {
      text-transform: uppercase;
      color: $grey;
      border-bottom: 1px solid $light-grey;
      font-size: 1.2em;
      margin-top: 1em;
      margin-bottom: 1em;
    }

    .tag {
      border-color: $light-grey;
    }
  }
}
</style>
