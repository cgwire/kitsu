<template>
  <div>
    <div
      ref="action-bar"
      :class="{
        'action-topbar': true,
        unselectable: true,
        minimized
      }"
      :style="{
        left: position.left + 'px',
        top: position.top + 'px'
      }"
    >
      <div class="menu">
        <div class="flexrow">
          <div
            :class="{
              'menu-item': true,
              'status-item': true,
              active: selectedBar === 'change-status'
            }"
            :title="$t('menu.change_status')"
            @click="selectBar('change-status')"
            v-if="
              (isCurrentUserManager ||
                isSupervisorInDepartment ||
                isInDepartment) &&
              !isEntitySelection &&
              isTaskSelection &&
              nbSelectedTasks > 1
            "
          >
            STATUS
          </div>

          <div
            :class="{
              'menu-item': true,
              active: selectedBar === 'assignation'
            }"
            :title="$t('menu.assign_tasks')"
            @click="selectBar('assignation')"
            v-if="
              isCurrentViewEntity &&
              (isCurrentUserManager ||
                isSupervisorInDepartment ||
                isInDepartment) &&
              !isEntitySelection &&
              isTaskSelection
            "
          >
            <user-icon />
          </div>

          <div
            :class="{
              'menu-item': true,
              active: selectedBar === 'priorities'
            }"
            :title="$t('menu.change_priority')"
            v-if="
              (isCurrentViewEntity || isCurrentViewPerson) &&
              (isCurrentUserManager || isSupervisorInDepartment) &&
              !isEntitySelection &&
              isTaskSelection
            "
            @click="selectBar('priorities')"
          >
            <alert-circle-icon />
          </div>

          <div
            :class="{
              'menu-item': true,
              active: selectedBar === 'thumbnails'
            }"
            :title="$t('menu.set_thumbnails')"
            v-if="isTaskSelection"
            @click="selectBar('thumbnails')"
          >
            <image-icon />
          </div>

          <div
            :class="{
              'menu-item': true,
              active: selectedBar === 'subscribe'
            }"
            :title="$t('menu.subscribe')"
            v-if="isTaskSelection"
            @click="selectBar('subscribe')"
          >
            <eye-icon />
          </div>

          <div
            class="menu-separator"
            v-if="!isEntitySelection && isTaskSelection && nbSelectedTasks > 1"
          ></div>

          <div
            :class="{
              'menu-item': true,
              active: selectedBar === 'playlists'
            }"
            :title="$t('menu.generate_playlist')"
            v-if="
              (isCurrentViewAsset ||
                isCurrentViewShot ||
                isCurrentViewTaskType) &&
              !isEntitySelection &&
              isTaskSelection &&
              nbSelectedTasks > 0
            "
            @click="selectBar('playlists')"
          >
            <film-icon />
          </div>

          <div
            v-if="
              (isCurrentViewAsset ||
                isCurrentViewShot ||
                isCurrentViewTaskType) &&
              !isEntitySelection &&
              isTaskSelection &&
              isCurrentUserManager
            "
            class="menu-separator"
          ></div>

          <div
            :class="{
              'menu-item': true,
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
            :class="{
              'menu-item': true,
              active: selectedBar === 'delete-tasks'
            }"
            :title="$t('menu.delete_tasks')"
            @click="selectBar('delete-tasks')"
            v-if="
              isCurrentViewEntity &&
              isCurrentUserManager &&
              !isEntitySelection &&
              isTaskSelection
            "
          >
            <trash-icon />
          </div>

          <div
            class="menu-separator"
            v-if="
              !isEntitySelection &&
              isTaskSelection &&
              !isCurrentViewEpisode &&
              customActions &&
              customActions.length > 0
            "
          ></div>

          <div
            :class="{
              'menu-item': true,
              active: selectedBar === 'custom-actions'
            }"
            :title="$t('menu.run_custom_action')"
            @click="selectBar('custom-actions')"
            v-if="
              (isCurrentUserManager || isSupervisorInDepartment) &&
              !isEntitySelection &&
              isTaskSelection &&
              !isCurrentViewEpisode &&
              customActions &&
              customActions.length > 0
            "
          >
            <play-circle-icon />
          </div>

          <div
            :class="{
              'menu-item': true,
              active: selectedBar === 'delete-assets'
            }"
            :title="$t('menu.delete_assets')"
            @click="selectBar('delete-assets')"
            v-if="
              isCurrentViewAsset && isCurrentUserManager && !isTaskSelection
            "
          >
            <trash-icon />
          </div>

          <div
            :class="{
              'menu-item': true,
              active: selectedBar === 'delete-shots'
            }"
            :title="$t('menu.delete_shots')"
            @click="selectBar('delete-shots')"
            v-if="isCurrentViewShot && isCurrentUserManager && !isTaskSelection"
          >
            <trash-icon />
          </div>

          <div
            :class="{
              'menu-item': true,
              active: selectedBar === 'delete-edits'
            }"
            :title="$t('menu.delete_edits')"
            @click="selectBar('delete-edits')"
            v-if="isCurrentViewEdit && isCurrentUserManager && !isTaskSelection"
          >
            <trash-icon />
          </div>

          <div class="filler"></div>

          <div
            class="menu-item mr1"
            :title="$t('main.csv.export_file')"
            @click="$emit('export-task')"
            v-if="
              isTaskSelection && !isEntitySelection && nbSelectedTasks === 1
            "
          >
            <download-icon />
          </div>

          <!--div class="flexrow-item close-bar" @click="minimized = !minimized">
            <minus-icon v-if="!minimized" />
            <square-icon v-else />
          </div-->

          <!--div class="flexrow-item close-bar" @click="clearSelection">
            <x-icon />
          </div-->
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
              :class="{
                button: true,
                'confirm-button': true,
                'is-wide': true,
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
          <div class="assignation flexrow-item">
            <span v-show="isCurrentUserArtist">
              {{ $tc('tasks.to_myself') }}
            </span>
          </div>
          <div class="flexrow mb05">
            <people-field
              class="flexrow-item is-wide"
              ref="assignation-field"
              :people="currentTeam"
              :placeholder="$t('tasks.assign_explaination')"
              big
              wide
              v-model="person"
              v-show="isCurrentUserManager || isCurrentUserSupervisor"
            />
          </div>
          <div v-if="loading.assignation">
            <div class="flexrow-item">
              <spinner :size="20" class="spinner" />
            </div>
            <div class="flexrow-item">&nbsp;</div>
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
            class="flexrow-item is-wide has-text-centered flexrow"
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
              <span>
                {{ $t('main.or') }}
              </span>
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
              :class="{
                button: true,
                'confirm-button': true,
                'is-wide': true,
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
            :class="{
              button: true,
              'confirm-button': true,
              'is-wide': true,
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
              @click="confirmSetThumbnailsFromTasks"
            >
              {{ $t('tasks.set_preview') }}
            </button>
            <input
              class="flexrow-item mr02"
              type="checkbox"
              v-model="isUseCurrentFrame"
            />
            <span class="flexrow-item">
              {{ $t('tasks.use_current_frame') }}
            </span>
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
              :class="{
                button: true,
                'confirm-button': true,
                'is-wide': true
              }"
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

        <div class="flexrow-item is-wide" v-if="selectedBar === 'delete-tasks'">
          <div class="flexrow is-wide">
            <button
              class="button is-danger confirm-button is-wide"
              :class="{
                button: true,
                'is-danger': true,
                'confirm-button': true,
                'is-wide': true,
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
                  :value="currentProduction ? currentProduction.id : null"
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
      </div>
    </div>

    <view-playlist-modal
      :active="modals.playlist"
      :task-ids="selectedTaskIds"
      sort
      @cancel="hidePlaylistModal"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { domMixin } from '@/components/mixins/dom'
import { intersection } from '@/lib/array'
import { sortPeople } from '@/lib/sorting'
import preferences from '@/lib/preferences'
import func from '@/lib/func'

import {
  AlertCircleIcon,
  CheckSquareIcon,
  DownloadIcon,
  EyeIcon,
  FilmIcon,
  ImageIcon,
  PlayCircleIcon,
  TrashIcon,
  UserIcon
} from 'vue-feather-icons'
import ComboboxModel from '@/components/widgets/ComboboxModel'
import ComboboxStatus from '@/components/widgets/ComboboxStatus'
import ComboboxStyled from '@/components/widgets/ComboboxStyled'
import DeleteEntities from '@/components/tops/actions/DeleteEntities'
import PeopleField from '@/components/widgets/PeopleField'
import Spinner from '@/components/widgets/Spinner'
import ViewPlaylistModal from '@/components/modals/ViewPlaylistModal'

export default {
  name: 'action-panel',
  mixins: [domMixin],

  components: {
    AlertCircleIcon,
    CheckSquareIcon,
    ComboboxModel,
    ComboboxStatus,
    ComboboxStyled,
    DeleteEntities,
    DownloadIcon,
    EyeIcon,
    FilmIcon,
    ImageIcon,
    PeopleField,
    PlayCircleIcon,
    Spinner,
    UserIcon,
    TrashIcon,
    ViewPlaylistModal
  },

  data() {
    return {
      availableTaskStatuses: [],
      currentTeam: [],
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
        playlist: false
      },
      position: {
        top: 10,
        left: 640
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
        editDeletion: false,
        episodeDeletion: false,
        taskCreation: false,
        taskDeletion: false,
        setThumbnails: false,
        shotDeletion: false,
        tasksSubscription: false
      },
      errors: {
        assetDeletion: false,
        taskDeletion: false,
        editDeletion: false,
        episodeDeletion: false,
        shotDeletion: false
      }
    }
  },

  mounted() {
    this.customAction = this.defaultCustomAction
    this.setCurrentTeam()
    this.resetPosition()
    window.removeEventListener('mousemove', this.doDrag)
    window.removeEventListener('mouseup', this.stopDrag)
    window.removeEventListener('beforeunload', this.setPositionPreference)
    window.addEventListener('mousemove', this.doDrag)
    window.addEventListener('mouseup', this.stopDrag)
    window.addEventListener('beforeunload', this.setPositionPreference)
  },

  beforeDestroy() {
    this.setPositionPreference()
  },

  computed: {
    ...mapGetters([
      'allCustomActions',
      'assetMap',
      'assetCustomActions',
      'currentProduction',
      'getPersonOptions',
      'isCurrentUserArtist',
      'isCurrentUserManager',
      'isCurrentUserSupervisor',
      'isShowAssignations',
      'nbSelectedTasks',
      'nbSelectedValidations',
      'organisation',
      'people',
      'personMap',
      'productionMap',
      'selectedAssets',
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
      else if (this.isCurrentViewShot) return 'shot'
      else if (this.isCurrentViewEdit) return 'edit'
      return 'episode'
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

    nbSelectedAssets() {
      return this.selectedAssets.size
    },

    nbSelectedShots() {
      return this.selectedShots.size
    },

    nbSelectedEdits() {
      return this.selectedEdits.size
    },

    isHidden() {
      return (
        (this.nbSelectedTasks === 0 &&
          this.nbSelectedValidations === 0 &&
          this.nbSelectedAssets === 0 &&
          this.nbSelectedShots === 0 &&
          this.nbSelectedEdits === 0) ||
        !(
          this.isCurrentViewAsset ||
          this.isCurrentViewTodos ||
          this.isCurrentViewShot ||
          this.isCurrentViewEpisode ||
          this.isCurrentViewSequence ||
          this.isCurrentViewEdit
        )
      )
    },

    isCurrentViewAsset() {
      return (
        this.$route.path.indexOf('asset') > 0 && !this.$route.params.asset_id
      )
    },

    isCurrentViewShot() {
      return this.$route.path.indexOf('shot') > 0 && !this.$route.params.shot_id
    },

    isCurrentViewEdit() {
      return this.$route.path.indexOf('edit') > 0 && !this.$route.params.edit_id
    },

    isCurrentViewTodos() {
      return (
        this.$route.path.indexOf('todos') > 0 ||
        this.$route.path.indexOf('people/') > 0
      )
    },

    isCurrentViewPerson() {
      return this.$route.path.indexOf('people/') > 0
    },

    isCurrentViewPersonTasks() {
      return this.$route.path.indexOf('todos') > 0
    },

    isCurrentViewTaskType() {
      return this.$route.path.indexOf('task-type') > 0
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
        ) && this.$route.path.indexOf('episodes') > 0
      )
    },

    isCurrentViewSequence() {
      return (
        !(
          this.isCurrentViewAsset ||
          this.isCurrentViewShot ||
          this.isCurrentViewEdit
        ) && this.$route.path.indexOf('sequences') > 0
      )
    },

    selectedPersonId() {
      return this.person ? this.person.id : null
    },

    currentProductionTeam() {
      return this.currentProduction ? this.currentProduction.team || [] : []
    },

    isInDepartment() {
      return this.selectedTaskIds.every(taskId => {
        const task = this.taskMap.get(taskId)
        const taskType = this.taskTypeMap.get(task.task_type_id)
        return (
          taskType.department_id &&
          this.user.departments.includes(taskType.department_id)
        )
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
      if (this.isCurrentViewAsset || this.isCurrentViewShot) {
        prefix = 'entities-'
      }
      if (this.isCurrentViewTaskType) prefix = 'tasks-'
      return prefix
    }
  },

  methods: {
    ...mapActions([
      'assignSelectedTasks',
      'clearSelectedAssets',
      'clearSelectedShots',
      'clearSelectedEdits',
      'createSelectedTasks',
      'deleteSelectedAssets',
      'deleteSelectedShots',
      'deleteSelectedTasks',
      'deleteSelectedEdits',
      'deleteSelectedEpisodes',
      'changeSelectedTaskStatus',
      'changeSelectedPriorities',
      'clearSelectedTasks',
      'postCustomAction',
      'setLastTaskPreview',
      'subscribeToTask',
      'unassignPersonFromTask',
      'unassignSelectedTasks',
      'unsubscribeFromTask'
    ]),

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

    confirmAssign() {
      if (this.selectedPersonId || this.isInDepartment) {
        this.loading.assignation = true
        const personId =
          this.isCurrentUserManager || this.isCurrentUserSupervisor
            ? this.selectedPersonId
            : this.user.id
        this.assignSelectedTasks({
          personId,
          callback: () => {
            this.loading.assignation = false
            this.$refs['assignation-field'].clear()
          }
        })
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
      return this.unassignSelectedTasks()
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
      const type =
        this.$route.path.indexOf('shots') > 0
          ? 'shots'
          : this.$route.path.indexOf('assets') > 0
          ? 'assets'
          : this.$route.path.indexOf('edits') > 0
          ? 'edits'
          : 'episodes'
      this.loading.taskCreation = true
      this.createSelectedTasks({
        type,
        projectId: this.currentProduction.id
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
      if (this.$options.dragging) return
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
      if (this.$options.dragging) return
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
      if (this.$options.dragging) return
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
      if (this.$options.dragging) return
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
        const task = this.selectedTasks.values().next().value
        this.$emit('set-frame-thumbnail', this.isUseCurrentFrame)
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

    setCurrentTeam() {
      if (this.people.length > 10 && this.currentProduction) {
        this.currentTeam = sortPeople(
          this.currentProductionTeam.map(personId => {
            return this.personMap.get(personId)
          })
        )
      } else {
        this.currentTeam = [...this.people]
      }
      if (this.isCurrentUserSupervisor && this.user.departments.length > 0) {
        this.currentTeam = this.currentTeam.filter(person =>
          person.departments.some(department =>
            this.user.departments.includes(department)
          )
        )
      }
      return this.currentTeam
    },

    runCustomAction() {
      this.postCustomAction({
        data: {
          entitytype: this.currentEntityType,
          originurl: this.currentUrl,
          originserver: this.currentHost,
          selection: this.selectedTaskIds,
          productionid: this.currentProduction.id,
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
    },

    selectBar(barName) {
      if (this.$options.dragging) return
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
        if (this.nbSelectedTasks === 1) {
          this.selectedBar = ''
          return
        }

        const prefix = this.storagePrefix
        const lastSelection = localStorage.getItem(`${prefix}-selected-bar`)
        if (lastSelection) {
          this.selectedBar = lastSelection
        } else {
          if (this.isCurrentViewAsset || this.isCurrentViewShot) {
            this.selectedBar = 'change-status'
          }
        }
      } else {
        window.removeEventListener('keydown', this.onKeyDown)
      }
    },

    setAvailableStatus() {
      if (this.selectedTasks.size === 0) this.availableTaskStatuses = []
      else if (this.isCurrentViewTodos) {
        const productions = new Map()
        this.selectedTasks.forEach(task => {
          const project = this.productionMap.get(task.project_id)
          productions.set(task.project_id, project)
        })
        const statusLists = Array.from(productions.values()).map(
          p => p.task_statuses
        )
        const availableStatus = new Set(intersection(statusLists))
        this.availableTaskStatuses = this.taskStatusForCurrentUser.filter(
          status => availableStatus.has(status.id)
        )
      } else {
        this.availableTaskStatuses = this.taskStatusForCurrentUser
      }
    },

    startDrag(event) {
      // if (event.target.nodeName === 'svg') return
      this.$options.startX = event.x
      this.$options.startY = event.y
      this.$options.startLeft = parseInt(this.position.left)
      this.$options.startTop = parseInt(this.position.top)
      this.$options.dragging = true
    },

    doDrag(event) {
      if (this.$options.dragging) {
        let newX = this.$options.startLeft - (this.$options.startX - event.x)
        const barHeight = this.$refs['action-bar'].offsetHeight
        const barWidth = this.$refs['action-bar'].offsetWidth
        if (newX < 0) newX = 0
        if (newX + barWidth > window.innerWidth) {
          newX = window.innerWidth - barWidth
        }
        let newY = this.$options.startTop - (this.$options.startY - event.y)
        if (newY < 65) newY = 65
        if (newY + barHeight > window.innerHeight) {
          newY = window.innerHeight - barHeight
        }
        this.position.left = newX
        this.position.top = newY
      }
    },

    stopDrag(event) {
      this.pauseEvent(event)
      this.$options.dragging = false
    },

    resetPosition() {
      let newX = parseInt(preferences.getPreference('topbar:position-x')) || 0
      let newY = parseInt(preferences.getPreference('topbar:position-y')) || 0
      const barHeight = 148
      const barWidth = 460
      if (newX < 0) newX = 0
      if (newX + barWidth > window.innerWidth) {
        newX = window.innerWidth - barWidth
      }
      if (newY < 65) newY = 65
      if (newY + barHeight > window.innerHeight) {
        newY = window.innerHeight - barHeight
      }
      this.position.left = newX
      this.position.top = newY
    },

    setPositionPreference() {
      preferences.setPreference('topbar:position-x', this.position.left)
      preferences.setPreference('topbar:position-y', this.position.top)
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
      if (this.nbSelectedShots > 0) this.clearSelectedTasks()
    },

    isHidden() {
      this.autoChooseSelectBar()
      if (this.isHidden) {
        window.removeEventListener('mousemove', this.doDrag)
        window.removeEventListener('mouseup', this.stopDrag)
        window.removeEventListener('beforeunload', this.setPositionPreference)
        this.setPositionPreference()
      } else {
        window.addEventListener('mousemove', this.doDrag)
        window.addEventListener('mouseup', this.stopDrag)
        window.addEventListener('beforeunload', this.setPositionPreference)
        this.resetPosition()
      }
    },

    nbSelectedTasks() {
      this.selectedTaskIds = Array.from(this.selectedTasks.keys())
      if (this.nbSelectedTasks > 0) {
        let isShotSelected = false
        let isAssetSelected = false
        this.setAvailableStatus()
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
    },

    currentProduction() {
      this.setCurrentTeam()
    },

    currentProductionTeam() {
      this.setCurrentTeam()
    },

    people() {
      this.setCurrentTeam()
    },

    $route() {
      this.selectedTaskIds = Array.from(this.selectedTasks.keys())
      if (this.nbSelectedTasks > 0) {
        this.clearSelectedTasks()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .action-topbar {
    background: $dark-grey-light;

    .menu-item {
      color: $light-grey-light;

      &.active {
        color: $green;
      }

      &.status-item.active {
        color: $green;
        border-color: $green;
      }
    }

    .menu {
      background: $black;
      border-bottom: 1px solid $dark-grey-light;
    }

    .action-bar {
      border-bottom: 1px solid $dark-grey-light;
    }
  }
}

.action-topbar {
  background: #f4f4ff;
  color: $grey;
  z-index: 1000;
}

div.assignation {
  margin-right: 1em;
  padding-right: 0;
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
  background: var(--background);
  color: $grey;
  cursor: grab;
  padding-top: 0.7em;
  border-bottom: 1px solid $light-grey-light;
  z-index: 200;
  background: #fcfcff;
}

.menu-item {
  cursor: pointer;
  font-size: 0.9em;
  transform: scale(0.9);
  padding: 0.2em 0.6em 0.4em 0.6em;

  &:hover {
    color: var(--text);
    transform: scale(1.2);
    transition: transform ease 0.3s;
  }

  &.active {
    color: $light-green;

    &:hover {
      color: $light-green;
    }
  }
}

.action-bar {
  padding: 0.5em 0.5em;
  border-bottom: 1px solid $light-grey-light;
}

.minimized {
  .menu {
  }
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

.handle {
  cursor: grab;
  padding-left: 0.5em;
  padding-right: 0em;
  .handle-icon:last-child {
    margin-left: -14px;
  }

  .handle-icon:last-child {
    margin-left: -32px;
  }
}

.is-link {
  color: var(--text);
}

.close-bar {
  cursor: pointer;
  margin-right: 0.5em;
  margin-top: -1.5em;
  svg {
    width: 16px;
  }
}

.change-status-item {
  margin-right: 0.5em;
}

.status-item {
  align-items: center;
  border: 2px solid $light-grey;
  border-radius: 15px;
  font-weight: bold;
  display: flex;
  font-size: 0.7em;
  justify-content: center;
  height: 100%;
  margin-left: 1em;
  margin-top: -1em;

  &:hover {
    border: 2px solid var(--text);
  }

  &.active {
    border: 2px solid $light-green;
    color: $light-green;

    &:hover {
      border: 2px solid $light-green;
      color: $light-green;
    }
  }
}

.spinner {
  margin: auto;
  margin-top: 0.5em;
}
</style>
