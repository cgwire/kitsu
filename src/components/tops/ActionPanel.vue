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
          @click="selectBar('change-status')"
          v-if="
            (isCurrentUserManager ||
              isSupervisorInDepartment ||
              isInDepartment ||
              isCurrentViewTodos) &&
            !isEntitySelection &&
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
          @click="selectBar('assignation')"
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
              isCurrentViewPerson ||
              isCurrentViewSingleEntity) &&
            (isCurrentUserManager || isSupervisorInDepartment) &&
            !isEntitySelection &&
            isTaskSelection
          "
          @click="selectBar('priorities')"
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
          @click="selectBar('thumbnails')"
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
          @click="selectBar('subscribe')"
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
          @click="selectBar('edit-concepts')"
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
          @click="selectBar('playlists')"
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
          @click="selectBar('create-tasks')"
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
          @click="selectBar('delete-tasks')"
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

        <div
          class="menu-separator"
          v-if="
            !isEntitySelection &&
            isTaskSelection &&
            !isCurrentViewEpisode &&
            !isCurrentViewConcept &&
            customActions &&
            customActions.length > 0
          "
        ></div>

        <div
          class="menu-item"
          :class="{
            active: selectedBar === 'custom-actions'
          }"
          :title="$t('menu.run_custom_action')"
          @click="selectBar('custom-actions')"
          v-if="
            (isCurrentUserManager || isSupervisorInDepartment) &&
            !isEntitySelection &&
            isTaskSelection &&
            !isCurrentViewEpisode &&
            !isCurrentViewConcept &&
            customActions &&
            customActions.length > 0
          "
        >
          <play-circle-icon />
        </div>

        <div
          class="menu-item"
          :class="{
            active: selectedBar === 'delete-assets'
          }"
          :title="$t('menu.delete_assets')"
          @click="selectBar('delete-assets')"
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
          @click="selectBar('delete-shots')"
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
          @click="selectBar('delete-edits')"
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
          @click="selectBar('delete-concepts')"
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
          @click="$emit('export-task')"
          v-if="isTaskSelection && !isEntitySelection && nbSelectedTasks === 1"
        >
          <kitsu-icon name="export" :title="$t('main.csv.export_file')" />
        </div>

        <div
          class="menu-item mr05"
          :title="$t('main.clear_selection')"
          @click="clearSelection"
        >
          <x-icon :size="16" />
        </div>
      </div>

      <div class="flexrow action-bar" v-if="selectedBar && !minimized">
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
                $tc('tasks.change_task_status', nbSelectedTasks, {
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
            {{ $tc('tasks.to_myself') }}
          </div>
          <div
            class="mb05"
            v-else-if="isCurrentUserManager || isCurrentUserSupervisor"
          >
            <people-field
              class="is-wide assignation-field"
              ref="assignation-field"
              :people="currentTeam"
              :placeholder="$t('tasks.assign_explaination')"
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
              {{ $tc('tasks.assign', nbSelectedTasks, { nbSelectedTasks }) }}
            </button>
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
                $tc('tasks.change_priority', nbSelectedTasks, {
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
              $tc('tasks.set_thumbnails_from_tasks', nbSelectedTasks, {
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
                $tc('tasks.subscribe_to_tasks', nbSelectedTasks, {
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
                @click="onRemoveLink(entity)"
                v-for="entity in conceptLinkedEntities"
              >
                {{ entity.name }}
              </li>
            </template>
          </ul>
        </div>

        <div class="flexrow-item is-wide" v-if="selectedBar === 'delete-tasks'">
          <div class="flexrow is-wide">
            <button
              class="button is-danger confirm-button is-wide"
              :class="{
                'is-loading': loading.taskDeletion
              }"
              @click="confirmTaskDeletion"
            >
              {{
                $tc('tasks.delete_for_selection', nbSelectedTasks, {
                  nbSelectedTasks
                })
              }}
            </button>
          </div>
          <div class="flexrow-item error" v-if="errors.taskDeletion">
            {{ $t('tasks.delete_error') }}
          </div>
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
                    $tc('custom_actions.run_for_selection', nbSelectedTasks, {
                      nbSelectedTasks
                    })
                  }}
                </button>
              </form>
            </div>
            <div class="flexrow-item is-wide" v-else>
              <button class="button is-wide" @click="runCustomAction">
                {{
                  $tc('custom_actions.run_for_selection', nbSelectedTasks, {
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
              $tc('assets.delete_for_selection', nbSelectedAssets, {
                nbSelectedAssets
              })
            "
            @confirm="confirmAssetDeletion"
          />
        </div>

        <div class="flexrow-item is-wide" v-if="selectedBar === 'delete-shots'">
          <delete-entities
            :error-text="$t('shots.multiple_delete_error')"
            :is-loading="loading.shotDeletion"
            :is-error="errors.deleteShot"
            :text="
              $tc('shots.delete_for_selection', nbSelectedShots, {
                nbSelectedShots
              })
            "
            @confirm="confirmShotDeletion"
          />
        </div>

        <div class="flexrow-item is-wide" v-if="selectedBar === 'delete-edits'">
          <delete-entities
            :error-text="$t('edits.multiple_delete_error')"
            :is-loading="loading.editDeletion"
            :is-error="errors.deleteEdit"
            :text="
              $tc('edits.delete_for_selection', nbSelectedEdits, {
                nbSelectedEdits
              })
            "
            @confirm="confirmEditDeletion"
          />
        </div>

        <div
          class="flexrow-item is-wide"
          v-if="selectedBar === 'delete-episodes'"
        >
          <delete-entities
            :error-text="$t('episodes.multiple_delete_error')"
            :is-loading="loading.episodeDeletion"
            :is-error="errors.deleteEpisode"
            :text="
              $tc('episodes.delete_for_selection', nbSelectedEpisodes, {
                nbSelectedEpisodes
              })
            "
            @confirm="confirmEpisodeDeletion"
          />
        </div>

        <div
          class="flexrow-item is-wide"
          v-if="selectedBar === 'delete-concepts'"
        >
          <delete-entities
            :error-text="$t('concepts.multiple_delete_error')"
            :is-loading="loading.episodeDeletion"
            :is-error="errors.deleteEpisode"
            :text="
              $tc('concepts.delete_for_selection', nbSelectedConcepts, {
                nbSelectedConcepts
              })
            "
            @confirm="confirmConceptDeletion"
          />
        </div>
      </div>
    </div>

    <div
      class="flexrow-item is-wide pa1"
      v-if="selectedBar === 'edit-concepts'"
    >
      <div ref="asset-list" class="concept-links">
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
        <spinner v-if="loading.links" />
        <div class="link-list" v-else>
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
                  @click="onSelectLink(link)"
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
      :active="modals.playlist"
      :task-ids="selectedTaskIds"
      sort
      @cancel="hidePlaylistModal"
    />
  </div>
</template>

<script>
import {
  CheckSquareIcon,
  LinkIcon,
  PlayCircleIcon,
  XIcon
} from 'lucide-vue-next'
import { mapGetters, mapActions } from 'vuex'

import { intersection } from '@/lib/array'
import func from '@/lib/func'

import BuildFilterModal from '@/components/modals/BuildFilterModal.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxModel from '@/components/widgets/ComboboxModel.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import DeleteEntities from '@/components/tops/actions/DeleteEntities.vue'
import KitsuIcon from '@/components/widgets/KitsuIcon.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import ViewPlaylistModal from '@/components/modals/ViewPlaylistModal.vue'

export default {
  name: 'action-panel',

  props: {
    isMoviePreview: {
      type: Boolean,
      default: false
    },
    isSetFrameThumbnailLoading: {
      type: Boolean,
      default: false
    },
    productionId: {
      type: String,
      default: null
    },
    team: {
      type: Array,
      default: () => []
    }
  },

  components: {
    BuildFilterModal,
    ButtonSimple,
    CheckSquareIcon,
    ComboboxModel,
    ComboboxStatus,
    ComboboxStyled,
    DeleteEntities,
    KitsuIcon,
    LinkIcon,
    PeopleField,
    PlayCircleIcon,
    SearchField,
    Spinner,
    ViewPlaylistModal,
    XIcon
  },

  emits: ['export-task', 'set-frame-thumbnail'],

  data() {
    return {
      availableTaskStatuses: [],
      customAction: {},
      customActions: [],
      isUseCurrentFrame: false,
      person: null,
      priority: '0',
      selectedBar: '',
      selectedTaskIds: [],
      taskStatusId: '',
      statusComment: '',
      modals: {
        buildFilter: false,
        playlist: false
      },
      priorityOptions: [
        {
          label: this.$t('tasks.priority.normal'),
          value: '0'
        },
        {
          label: this.$t('tasks.priority.high'),
          value: '1'
        },
        {
          label: this.$t('tasks.priority.very_high'),
          value: '2'
        },
        {
          label: this.$t('tasks.priority.emergency'),
          value: '3'
        }
      ],
      loading: {
        assignation: false,
        assetDeletion: false,
        changePriority: false,
        changeStatus: false,
        conceptDeletion: false,
        editDeletion: false,
        episodeDeletion: false,
        taskCreation: false,
        taskDeletion: false,
        setThumbnails: false,
        shotDeletion: false,
        links: false,
        tasksSubscription: false
      },
      errors: {
        assetDeletion: false,
        taskDeletion: false,
        conceptDeletion: false,
        editDeletion: false,
        episodeDeletion: false,
        shotDeletion: false
      }
    }
  },

  mounted() {
    this.customAction = this.defaultCustomAction
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeyDown)
  },

  computed: {
    ...mapGetters([
      'allCustomActions',
      'assetMap',
      'assetCustomActions',
      'assetsByType',
      'isCurrentUserArtist',
      'isCurrentUserManager',
      'isCurrentUserSupervisor',
      'isShowAssignations',
      'nbSelectedTasks',
      'nbSelectedValidations',
      'productionMap',
      'selectedAssets',
      'selectedConcepts',
      'selectedEdits',
      'selectedShots',
      'selectedTasks',
      'shotCustomActions',
      'taskMap',
      'taskStatusForCurrentUser',
      'taskTypeMap',
      'user'
    ]),

    minimized() {
      return this.selectedBar === ''
    },

    currentUrl() {
      return this.$route.path
    },

    currentHost() {
      return window.location.host
    },

    currentEntityType() {
      if (this.isCurrentViewAsset) return 'asset'
      if (this.isCurrentViewShot) return 'shot'
      if (this.isCurrentViewSequence) return 'sequence'
      if (this.isCurrentViewEdit) return 'edit'
      return 'episode'
    },

    currentConcept() {
      return this.selectedConcepts.values().next().value
    },

    conceptLinkedEntities() {
      return this.getLinkedEntities(this.currentConcept)
    },

    currentTeam() {
      const isSupervisorWithDepartments =
        this.isCurrentUserSupervisor && this.user.departments.length > 0

      return this.team.filter(person => {
        if (!person?.is_bot) {
          if (isSupervisorWithDepartments) {
            return (
              person.departments.length === 0 ||
              person.departments.some(department =>
                this.user.departments.includes(department)
              )
            )
          }
          return true
        }
        return false
      })
    },

    defaultCustomAction() {
      if (this.customActions.length > 0) {
        return this.customActions[0]
      } else {
        return {}
      }
    },

    isTaskSelection() {
      return this.nbSelectedTasks > 0
    },

    isEntitySelection() {
      return (
        this.selectedAssets.size > 0 ||
        this.selectedShots.size > 0 ||
        this.selectedEdits.size > 0
      )
    },

    isAssigned() {
      if (!this.isCurrentUserArtist) return
      if (this.nbSelectedTasks === 0) return
      const selectedTasks = Array.from(this.selectedTasks.values())
      const isAssigned = selectedTasks.some(task => {
        return task.assignees.includes(this.user.id)
      })
      return isAssigned
    },

    nbSelectedAssets() {
      return this.selectedAssets.size
    },

    nbSelectedShots() {
      return this.selectedShots.size
    },

    nbSelectedEdits() {
      return this.selectedEdits.size
    },

    nbSelectedConcepts() {
      return this.selectedConcepts.size
    },

    isHidden() {
      return (
        (this.nbSelectedTasks === 0 &&
          this.nbSelectedValidations === 0 &&
          this.nbSelectedAssets === 0 &&
          this.nbSelectedShots === 0 &&
          this.nbSelectedEdits === 0 &&
          this.nbSelectedConcepts === 0) ||
        !(
          this.isCurrentViewAsset ||
          this.isCurrentViewTodos ||
          this.isCurrentViewShot ||
          this.isCurrentViewEpisode ||
          this.isCurrentViewSequence ||
          this.isCurrentViewEdit ||
          this.isCurrentViewConcept
        )
      )
    },

    isConceptPublisher() {
      return this.currentConcept?.created_by === this.user.id
    },

    isCurrentViewSingleEntity() {
      return [
        'asset',
        'shot',
        'edit',
        'episode',
        'sequence',
        'episode-asset',
        'episode-shot',
        'episode-edit',
        'episode-sequence'
      ].includes(this.$route.name)
    },

    isCurrentViewAsset() {
      return this.$route.path.includes('asset') && !this.$route.params.shot_id
    },

    isCurrentViewShot() {
      return this.$route.path.includes('shot') && !this.$route.params.shot_id
    },

    isCurrentViewEdit() {
      return this.$route.path.includes('edit') && !this.$route.params.edit_id
    },

    isCurrentViewConcept() {
      return this.$route.path.includes('concept')
    },

    isCurrentViewTodos() {
      return (
        this.$route.path.includes('my-tasks') ||
        this.$route.path.includes('people/')
      )
    },

    isCurrentViewPerson() {
      return this.$route.path.includes('people/')
    },

    isCurrentViewPersonTasks() {
      return this.$route.path.includes('todos')
    },

    isCurrentViewTaskType() {
      return this.$route.path.includes('task-type')
    },

    isCurrentViewEntity() {
      return (
        this.isCurrentViewAsset ||
        this.isCurrentViewShot ||
        this.isCurrentViewEdit ||
        this.isCurrentViewSequence ||
        this.isCurrentViewEpisode
      )
    },

    isCurrentViewEpisode() {
      return (
        !(
          this.isCurrentViewAsset ||
          this.isCurrentViewShot ||
          this.isCurrentViewEdit
        ) && this.$route.path.includes('episodes')
      )
    },

    isCurrentViewSequence() {
      return (
        !(
          this.isCurrentViewAsset ||
          this.isCurrentViewShot ||
          this.isCurrentViewEdit
        ) && this.$route.path.includes('sequences')
      )
    },

    selectedPersonId() {
      return this.person ? this.person.id : null
    },

    isInDepartment() {
      return this.selectedTaskIds.every(taskId => {
        const task = this.taskMap.get(taskId)
        if (task) {
          const taskType = this.taskTypeMap.get(task.task_type_id)
          return (
            taskType.department_id &&
            this.user.departments.includes(taskType.department_id)
          )
        } else {
          return true // We are in the artist todolist.
        }
      })
    },

    isSupervisorInDepartment() {
      return (
        this.isCurrentUserSupervisor &&
        (this.user.departments.length === 0 || this.isInDepartment)
      )
    },

    storagePrefix() {
      let prefix = 'todos-'
      if (
        this.isCurrentViewAsset ||
        this.isCurrentViewShot ||
        this.isCurrentViewEdit
      ) {
        prefix = 'entities-'
      }
      if (this.isCurrentViewConcept) prefix = 'concepts-'
      if (this.isCurrentViewTaskType) prefix = 'tasks-'
      return prefix
    },

    availableLinksByType() {
      const assetGroups = [...this.assetsByType]
      const result = assetGroups
        .map(assets => {
          if (!assets.length) return
          const links = assets
            .filter(
              asset =>
                !this.conceptLinkedEntities.some(
                  entity => entity.id === asset.id
                )
            )
            .map(asset => ({
              id: asset.id,
              name: asset.name
            }))
          return {
            type: assets[0].asset_type_name,
            links
          }
        })
        .filter(Boolean)
      return result
    }
  },

  methods: {
    ...mapActions([
      'assignSelectedTasks',
      'changeSelectedTaskStatus',
      'changeSelectedPriorities',
      'clearSelectedAssets',
      'clearSelectedShots',
      'clearSelectedEdits',
      'clearSelectedConcepts',
      'clearSelectedTasks',
      'createSelectedTasks',
      'deleteSelectedAssets',
      'deleteSelectedShots',
      'deleteSelectedTasks',
      'deleteSelectedEdits',
      'deleteSelectedEpisodes',
      'deleteSelectedConcepts',
      'editConcept',
      'loadAssets',
      'postCustomAction',
      'setAssetSearch',
      'setLastTaskPreview',
      'subscribeToTask',
      'unassignPersonFromTask',
      'unassignSelectedTasks',
      'unsubscribeFromTask'
    ]),

    getLinkedEntities(concept) {
      return concept.entity_concept_links
        .map(id => this.assetMap.get(id))
        .filter(Boolean)
    },

    confirmTaskStatusChange() {
      this.loading.changeStatus = true
      if (!this.taskStatusId) {
        this.taskStatusId = this.availableTaskStatuses[0].id
      }
      this.changeSelectedTaskStatus({
        taskStatusId: this.taskStatusId,
        comment: this.statusComment
      })
        .then(() => {
          this.statusComment = ''
          this.loading.changeStatus = false
        })
        .catch(err => {
          console.error(err)
          this.loading.changeStatus = false
        })
    },

    async confirmAssign() {
      if (this.selectedPersonId || this.isInDepartment) {
        const personId =
          this.isCurrentUserManager || this.isCurrentUserSupervisor
            ? this.selectedPersonId
            : this.user.id
        this.loading.assignation = true
        try {
          await this.assignSelectedTasks({ personId })
          this.$refs['assignation-field']?.clear()
        } catch (err) {
          console.error(err)
        } finally {
          this.loading.assignation = false
        }
      }
    },

    clearAssignation() {
      const person = this.isCurrentUserArtist ? this.user : this.person
      if (person) {
        this.loading.assignation = true
        func
          .runPromiseAsSeries(
            Array.from(this.selectedTasks.values()).map(task => {
              return this.unassignPersonFromTask({ task, person })
            })
          )
          .then(() => {
            this.loading.assignation = false
          })
          .catch(console.error)
      }
    },

    clearAllAssignations() {
      this.loading.assignation = true
      return this.unassignSelectedTasks({})
        .then(() => {
          this.loading.assignation = false
        })
        .catch(console.error)
    },

    confirmPriorityChange() {
      this.loading.changePriority = true
      this.changeSelectedPriorities({
        priority: Number(this.priority),
        callback: () => {
          this.loading.changePriority = false
        }
      })
    },

    confirmTaskCreation() {
      const type = this.$route.path.includes('shots')
        ? 'shots'
        : this.$route.path.includes('assets')
          ? 'assets'
          : this.$route.path.includes('edits')
            ? 'edits'
            : 'episodes'
      this.loading.taskCreation = true
      this.createSelectedTasks({
        type,
        projectId: this.productionId
      })
        .then(() => {
          this.loading.taskCreation = false
        })
        .catch(err => {
          this.loading.taskCreation = false
          console.error(err)
        })
    },

    confirmTaskDeletion() {
      this.loading.taskDeletion = true
      this.errors.taskDeletion = false
      this.deleteSelectedTasks()
        .then(() => {
          this.loading.taskDeletion = false
        })
        .catch(err => {
          console.error(err)
          this.loading.taskDeletion = false
          this.errors.taskDeletion = true
        })
    },

    confirmAssetDeletion() {
      this.loading.deleteAsset = true
      this.errors.deleteAsset = false
      this.deleteSelectedAssets()
        .then(() => {
          this.loading.deleteAsset = false
          this.clearSelectedAssets()
        })
        .catch(err => {
          console.error(err)
          this.loading.deleteAsset = false
          this.errors.deleteAsset = true
        })
    },

    confirmShotDeletion() {
      this.loading.deleteShot = true
      this.errors.deleteShot = false
      this.deleteSelectedShots()
        .then(() => {
          this.loading.deleteShot = false
          this.clearSelectedShots()
        })
        .catch(err => {
          console.error(err)
          this.loading.deleteShot = false
          this.errors.deleteShot = true
        })
    },

    confirmEditDeletion() {
      this.loading.deleteEdit = true
      this.errors.deleteEdit = false
      this.deleteSelectedEdits()
        .then(() => {
          this.loading.deleteEdit = false
          this.clearSelectedEdits()
        })
        .catch(err => {
          console.error(err)
          this.loading.deleteEdit = false
          this.errors.deleteEdit = true
        })
    },

    confirmConceptDeletion() {
      this.loading.deleteConcept = true
      this.errors.deleteConcept = false
      this.deleteSelectedConcepts()
        .then(() => {
          this.loading.deleteConcept = false
          this.clearSelectedConcepts()
        })
        .catch(err => {
          console.error(err)
          this.loading.deleteConcept = false
          this.errors.deleteConcept = true
        })
    },

    confirmPlaylistGeneration() {
      this.modals.playlist = true
      this.selectedBar = ''
    },

    confirmTasksSubscription() {
      this.loading.tasksSubscription = true
      func
        .runPromiseAsSeries(
          Array.from(this.selectedTasks.values()).map(task => {
            return this.subscribeToTask(task.id)
          })
        )
        .then(() => {
          this.loading.tasksSubscription = false
        })
        .catch(err => {
          console.error(err)
          this.loading.tasksSubscription = false
          this.errors.tasksSubscription = false
        })
    },

    confirmTasksUnsubscription() {
      this.loading.tasksSubscription = true
      func
        .runPromiseAsSeries(
          Array.from(this.selectedTasks.values()).map(task => {
            return this.unsubscribeFromTask(task.id)
          })
        )
        .then(() => {
          this.loading.tasksSubscription = false
        })
        .catch(err => {
          console.error(err)
          this.loading.tasksSubscription = false
          this.errors.tasksSubscription = false
        })
    },

    hidePlaylistModal() {
      this.modals.playlist = false
    },

    confirmSetThumbnailsFromTasks() {
      this.loading.setThumbnails = true
      if (this.nbSelectedTasks === 1) {
        this.$emit(
          'set-frame-thumbnail',
          this.isMoviePreview && this.isUseCurrentFrame
        )
        this.loading.setThumbnails = false
      } else {
        func
          .runPromiseAsSeries(
            Array.from(this.selectedTasks.values()).map(task => {
              return this.setLastTaskPreview(task.id)
            })
          )
          .then(() => {
            this.loading.setThumbnails = false
          })
      }
    },

    runCustomAction() {
      this.postCustomAction({
        data: {
          entitytype: this.currentEntityType,
          originurl: this.currentUrl,
          originserver: this.currentHost,
          selection: this.selectedTaskIds,
          productionid: this.productionId,
          userid: this.user.id,
          useremail: this.user.email
        },
        url: this.customAction.url
      })
    },

    onKeyDown(event) {
      if (event.keyCode === 27) {
        if (!this.modals.playlist) {
          this.$store.commit('CLEAR_SELECTED_TASKS')
        }
      }
    },

    clearSelection() {
      this.clearSelectedAssets()
      this.clearSelectedShots()
      this.clearSelectedTasks()
      this.clearSelectedEdits()
      this.clearSelectedConcepts()
    },

    selectBar(barName) {
      localStorage.setItem(`${this.storagePrefix}-selected-bar`, barName, {
        expires: '1M'
      })
      if (this.selectedBar !== barName) {
        this.selectedBar = barName
      } else {
        this.selectedBar = ''
      }
    },

    autoChooseSelectBar() {
      if (!this.isHidden) {
        window.addEventListener('keydown', this.onKeyDown)
        if (this.isCurrentViewAsset && this.nbSelectedAssets > 0) {
          this.selectedBar = 'delete-assets'
          return
        }
        if (this.isCurrentViewShot && this.nbSelectedShots > 0) {
          this.selectedBar = 'delete-shots'
          return
        }
        if (this.isCurrentViewEdit && this.nbSelectedEdits > 0) {
          this.selectedBar = 'delete-edits'
          return
        }
        if (this.isCurrentViewConcept && this.nbSelectedConcepts > 1) {
          this.selectedBar = 'delete-concepts'
          return
        }
        if (this.nbSelectedTasks === 1) {
          this.selectedBar = ''
        }

        const lastSelection = localStorage.getItem(
          `${this.storagePrefix}-selected-bar`
        )
        if (lastSelection) {
          this.selectedBar = lastSelection
        } else if (
          this.isCurrentViewAsset ||
          this.isCurrentViewShot ||
          this.isCurrentViewEdit
        ) {
          this.selectedBar = 'change-status'
        }
      } else {
        window.removeEventListener('keydown', this.onKeyDown)
      }
    },

    setAvailableStatuses() {
      let availableTaskStatuses
      if (this.selectedTasks.size === 0) {
        availableTaskStatuses = []
      } else if (this.isCurrentViewTodos) {
        const productions = new Map()
        this.selectedTasks.forEach(task => {
          const project = this.productionMap.get(task.project_id)
          productions.set(task.project_id, project)
        })
        const statusLists = Array.from(productions.values()).map(
          p => p.task_statuses
        )
        const availableStatus = new Set(intersection(statusLists))
        availableTaskStatuses = this.taskStatusForCurrentUser.filter(status =>
          availableStatus.has(status.id)
        )
      } else {
        availableTaskStatuses = this.taskStatusForCurrentUser
      }
      availableTaskStatuses = availableTaskStatuses.filter(
        status => Boolean(status.for_concept) === this.isCurrentViewConcept
      )
      this.availableTaskStatuses = availableTaskStatuses
    },

    onRemoveLink(link) {
      const concept = {
        id: this.currentConcept.id,
        entity_concept_links: this.currentConcept.entity_concept_links.filter(
          id => id !== link.id
        )
      }
      this.editConcept(concept)
    },

    confirmBuildFilter(query) {
      this.modals.buildFilter = false
      this.$refs['entity-search-field'].setValue(query)
      this.onEntitySearchChange(query)
    },

    onEntitySearchChange(searchQuery) {
      this.setAssetSearch(searchQuery)
    },

    onSelectLink(link) {
      const concept = {
        id: this.currentConcept.id,
        entity_concept_links: [
          ...this.currentConcept.entity_concept_links
        ].concat(link.id)
      }
      this.editConcept(concept)
    }
  },

  watch: {
    nbSelectedAssets() {
      this.autoChooseSelectBar()
      if (this.nbSelectedAssets > 0) this.clearSelectedTasks()
    },

    nbSelectedShots() {
      this.autoChooseSelectBar()
      if (this.nbSelectedShots > 0) this.clearSelectedTasks()
    },

    nbSelectedEdits() {
      this.autoChooseSelectBar()
      if (this.nbSelectedEdits > 0) this.clearSelectedTasks()
    },

    nbSelectedConcepts() {
      this.autoChooseSelectBar()
      if (this.nbSelectedConcepts > 1) this.clearSelectedTasks()
    },

    isHidden() {
      this.autoChooseSelectBar()
    },

    nbSelectedTasks: {
      immediate: true,
      handler() {
        this.selectedTaskIds = Array.from(this.selectedTasks.keys())
        if (this.nbSelectedTasks > 0) {
          let isShotSelected = false
          let isAssetSelected = false
          this.setAvailableStatuses()
          this.selectedTaskIds.forEach(taskId => {
            const task = this.selectedTasks.get(taskId)
            if (task && task.sequence_name) {
              isShotSelected = true
            } else {
              isAssetSelected = true
            }
          })
          if (isShotSelected && isAssetSelected) {
            this.customActions = this.allCustomActions
          } else if (isShotSelected) {
            this.customActions = this.shotCustomActions
          } else {
            this.customActions = this.assetCustomActions
          }

          if (this.customActions.length > 0) {
            const isUrlSelected =
              this.customAction.url &&
              this.customActions.findIndex(action => {
                return action.id === this.customAction.id
              }) >= 0

            if (!isUrlSelected) {
              this.customAction = this.customActions[0]
            }
          }

          if (this.nbSelectedTasks === 1) {
            this.lastSelectedBar = this.selectedBar
            this.selectedBar === ''
          } else if (this.lastSelectedBar) {
            this.selectedBar === this.lastSelectedBar
          }
        }
      }
    },

    selectedTasks() {
      this.selectedTaskIds = Array.from(this.selectedTasks.keys())
    },

    $route(oldRoute, newRoute) {
      if (oldRoute.name !== newRoute.name) {
        this.selectedTaskIds = Array.from(this.selectedTasks.keys())
        if (this.nbSelectedTasks > 0) {
          this.clearSelectedTasks()
        }
      }
    }
  }
}
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

.hidden {
  display: none;
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

    .action {
      border-radius: 50%;
      display: none;
      height: 14px;
      width: 14px;
      line-height: 8px;
    }

    &:hover {
      transform: scale(1.1);

      .action {
        display: inline-block;
      }
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
      cursor: pointer;
      transition: transform 0.1s linear;

      &:hover {
        transform: scale(1.1);
      }
    }
  }
}
</style>
