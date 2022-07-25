<template>
  <div>
    <div :class="{
      'action-topbar': true,
      'hidden': isHidden
    }">
      <div class="flexrow action-bar">

        <div class="flexrow-item more-menu-icon" @click="toggleMenu">
          <div class="flexrow">
            <span class="flexrow-item hide-small-screen">
              {{ currentMenuLabel }}
            </span>
            <chevron-down-icon class="flexrow-item" />
          </div>
        </div>

        <div class="flexrow-item" v-if="selectedBar === 'assignation'">
          <div
            class="flexrow"
            v-if="isCurrentUserManager || isSupervisorInDepartment ||
            isInDepartment"
          >
            <div class="assignation flexrow-item hide-small-screen">
              <span>
                {{ $tc('tasks.assign', nbSelectedTasks, {nbSelectedTasks}) }}
              </span>
              <span v-show="isCurrentUserArtist">
                myself
              </span>
            </div>
            <div class="flexrow-item combobox-item">
              <people-field
                ref="assignation-field"
                :people="currentTeam"
                v-model="person"
                v-show="isCurrentUserManager || isCurrentUserSupervisor"
              />
            </div>
            <div class="" v-if="isAssignationLoading">
              <spinner :is-white="true" :size="25" />
            </div>
            <div class="flexrow-item" v-if="!isAssignationLoading">
              <button
                class="button is-success confirm-button"
                @click="confirmAssign"
              >
                {{ $t('main.confirmation') }}
              </button>
            </div>
            <div
              class="flexrow-item hide-small-screen"
              v-if="!isAssignationLoading && isCurrentUserManager"
            >
              {{ $t('main.or') }}
            </div>
            <div
              class="flexrow-item hide-small-screen"
              v-if="!isAssignationLoading && isCurrentUserManager"
            >
              <button
                class="button is-link clear-assignation-button hide-small-screen"
                @click="clearAssignation"
              >
                {{ $t('tasks.clear_assignations') }}
              </button>
            </div>
            <div
              class="flexrow-item hide-small-screen"
              v-else-if="!isAssignationLoading && isCurrentUserArtist"
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
          <div style="padding-left: 1em;" v-else>
            {{ $t('tasks.no_assignation_right') }}
          </div>
        </div>

        <div
          class="flexrow-item"
          v-if="selectedBar === 'change-status'"
        >
          <div class="flexrow">
            <div class="flexrow-item strong bigger hide-small-screen">
              {{ $t('tasks.change_status_to') }}
            </div>
            <div class="flexrow-item">
              <combobox-status
                :task-status-list="availableTaskStatuses"
                v-model="taskStatusId"
              />
            </div>
            <div class="flexrow-item" v-if="!isChangeStatusLoading">
              <button
                class="button is-success confirm-button"
                @click="confirmTaskStatusChange"
              >
                {{ $t('main.confirmation') }}
              </button>
            </div>
            <div class="flexrow-item" v-if="isChangeStatusLoading">
              <spinner :is-white="true" />
            </div>
             <div
              class="flexrow-item"
              v-if="!isChangeStatusLoading"
            >
              <input
                class="comment-text input"
                type="text"
                :placeholder="$t('tasks.with_comment')"
                @keyup.ctrl.enter="confirmTaskStatusChange"
                @keyup.meta.enter="confirmTaskStatusChange"
                v-model="statusComment"
              />
            </div>
          </div>
        </div>

        <div
          class="flexrow-item"
          v-if="selectedBar === 'priorities'"
        >
          <div class="flexrow">
            <div class="flexrow-item strong bigger hide-small-screen">
              {{ $t('tasks.change_priority') }}
            </div>
            <div class="flexrow-item priority-combobox">
              <combobox
                :options="priorityOptions"
                v-model="priority"
              />
            </div>
            <div class="flexrow-item" v-if="!isChangePriorityLoading">
              <button
                class="button is-success confirm-button"
                @click="confirmPriorityChange"
              >
                {{ $t('main.confirmation') }}
              </button>
            </div>
            <div class="flexrow-item" v-if="isChangePriorityLoading">
              <spinner :is-white="true" />
            </div>
          </div>
        </div>

        <div
          class="flexrow-item"
          v-if="selectedBar === 'tasks'"
        >
          <div class="flexrow">
            <div class="flexrow-item strong bigger hide-small-screen">
              {{ $t('tasks.create_for_selection') }}
            </div>
            <div class="flexrow-item" v-if="!isCreationLoading">
              <button
                class="button is-success confirm-button"
                @click="confirmTaskCreation"
              >
                {{ $t('main.confirmation') }}
              </button>
            </div>
            <div class="flexrow-item" v-else>
              <spinner :is-white="true" />
            </div>
          </div>
        </div>

        <div
          class="flexrow-item"
          v-if="selectedBar === 'playlists'"
        >
          <div class="flexrow">
            <div class="flexrow-item strong bigger hide-small-screen">
              {{ $t('playlists.create_for_selection') }}
            </div>
            <div class="flexrow-item">
              <button
                class="button is-success confirm-button"
                @click="confirmPlaylistGeneration"
              >
                {{ $t('main.confirmation') }}
              </button>
            </div>
          </div>
        </div>

        <div
          class="flexrow-item"
          v-if="selectedBar === 'delete-tasks'"
        >
          <div class="flexrow">
            <div class="flexrow-item strong bigger hide-small-screen">
              {{ $t('tasks.delete_for_selection') }}
            </div>
            <div class="flexrow-item" v-if="!isDeletionLoading">
              <button
                class="button is-danger confirm-button"
                @click="confirmTaskDeletion"
              >
                {{ $t('main.confirmation') }}
              </button>
            </div>
            <div class="flexrow-item" v-else>
              <spinner :is-white="true" />
            </div>
            <div class="flexrow-item error" v-if="errors.deleteTask">
              {{ $t('tasks.delete_error') }}
            </div>
          </div>
        </div>

        <div
          class="flexrow-item"
          v-if="selectedBar === 'custom-actions'"
        >
          <div class="flexrow">
            <div class="flexrow-item strong bigger hide-small-screen">
              {{ $t('custom_actions.run_for_selection') }}
            </div>
            <div class="flexrow-item combobox-item">
              <combobox-model
                :models="customActions"
                v-model="customAction"
              />
            </div>
            <div
              class="flexrow-item"
              v-if="customAction && !customAction.is_ajax"
            >
              <form
                target="_blank"
                method="POST"
                :action="customAction.url"
              >
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
                >
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
                <button
                  class="button is-success"
                  type="submit"
                >
                  {{ $t('main.confirmation') }}
                </button>
              </form>
            </div>
            <div
              class="flexrow-item"
              v-else
            >
              <button
                class="button is-success"
                @click="runCustomAction"
              >
                {{ $t('main.confirmation') }}
              </button>
            </div>
          </div>
        </div>

        <div
          class="flexrow-item"
          v-if="selectedBar === 'delete-assets'"
        >
          <div class="flexrow">
            <div class="flexrow-item strong bigger hide-small-screen">
              {{ $t('assets.delete_for_selection', {nbSelectedAssets}) }}
            </div>
            <div class="flexrow-item" v-if="!isAssetDeletionLoading">
              <button
                class="button is-danger confirm-button"
                @click="confirmAssetDeletion"
              >
                {{ $t('main.confirmation') }}
              </button>
            </div>
            <div class="flexrow-item" v-else>
              <spinner :is-white="true" />
            </div>
            <div class="flexrow-item error" v-if="errors.deleteAsset">
              {{ $t('assets.multiple_delete_error') }}
            </div>
          </div>
        </div>

        <div
          class="flexrow-item"
          v-if="selectedBar === 'delete-shots'"
        >
          <div class="flexrow">
            <div class="flexrow-item strong bigger hide-small-screen">
              {{ $t('shots.delete_for_selection', {nbSelectedShots}) }}
            </div>
            <div class="flexrow-item" v-if="!isShotDeletionLoading">
              <button
                class="button is-danger confirm-button"
                @click="confirmShotDeletion"
              >
                {{ $t('main.confirmation') }}
              </button>
            </div>
            <div class="flexrow-item" v-else>
              <spinner :is-white="true" />
            </div>
            <div class="flexrow-item error" v-if="errors.deleteShot">
              {{ $t('shots.multiple_delete_error') }}
            </div>
          </div>
        </div>

        <div
          class="flexrow-item"
          v-if="selectedBar === 'delete-edits'"
        >
          <div class="flexrow">
            <div class="flexrow-item strong bigger hide-small-screen">
              {{ $t('edits.delete_for_selection', {nbSelectedEdits}) }}
            </div>
            <div class="flexrow-item" v-if="!isEditDeletionLoading">
              <button
                class="button is-danger confirm-button"
                @click="confirmEditDeletion"
              >
                {{ $t('main.confirmation') }}
              </button>
            </div>
            <div class="flexrow-item" v-else>
              <spinner :is-white="true" />
            </div>
            <div class="flexrow-item error" v-if="errors.deleteEdit">
              {{ $t('edits.multiple_delete_error') }}
            </div>
          </div>
        </div>

        <div class="flexrow-item clear-selection-container has-text-right">
          <div class="flexrow has-text-right">
            <div style="flex: 1"></div>
            <notification-bell class="flexrow-item" :is-white="true" />
            <div
              class="clear-selection flexrow flexrow-item"
              @click="clearSelection"
            >
              <x-icon class="flexrow-item">
              </x-icon>
              <span class="flexrow-item hide-small-screen">
                {{ $t('main.clear_selection') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        ref="moreMenu"
        :class="{
          'more-menu': true,
          'is-hidden': isMoreMenuDisplayed
        }"
      >
        <div
          class="more-menu-item"
          v-if="
            (isCurrentViewAsset || isCurrentViewShot || isCurrentViewEdit) &&
            (isCurrentUserManager || isSupervisorInDepartment || isInDepartment) &&
            !isEntitySelection"
          @click="selectBar('assignation')"
        >
          {{ $t('menu.assign_tasks') }}
        </div>

        <div
          class="more-menu-item"
          @click="selectBar('change-status')"
          v-if="(isCurrentUserManager || isSupervisorInDepartment)
            && !isEntitySelection"
        >
          {{ $t('menu.change_status') }}
        </div>

        <div
          class="more-menu-item"
          v-if="(isCurrentViewAsset || isCurrentViewShot || isCurrentViewEdit ||
            isCurrentViewPerson) && (isCurrentUserManager ||
            isSupervisorInDepartment) && !isEntitySelection"
          @click="selectBar('priorities')"
        >
          {{ $t('menu.change_priority') }}
        </div>

        <div
          class="more-menu-item"
          v-if="
            ((isCurrentViewAsset || isCurrentViewShot || isCurrentViewEdit) &&
            !isCurrentViewTaskType) && isCurrentUserManager &&
            !isEntitySelection"
          @click="selectBar('tasks')"
        >
          {{ $t('menu.create_tasks') }}
        </div>

        <div
          class="more-menu-item"
          v-if="
            (isCurrentViewAsset || isCurrentViewShot ||
            isCurrentViewTaskType) && !isEntitySelection"
          @click="selectBar('playlists')"
        >
          {{ $t('menu.generate_playlists') }}
        </div>

        <div
          class="more-menu-item"
          v-if="
            (isCurrentViewAsset || isCurrentViewShot || isCurrentViewEdit) &&
            isCurrentUserManager &&
            !isEntitySelection"
          @click="selectBar('delete-tasks')"
        >
          {{ $t('menu.delete_tasks') }}
        </div>

        <div
          class="more-menu-item"
          v-if="
            !isCurrentViewTaskType &&
            (isCurrentUserManager || isSupervisorInDepartment) &&
            !isEntitySelection"
          @click="selectBar('custom-actions')"
        >
          {{ $t('menu.run_custom_action') }}
        </div>

        <div
          class="more-menu-item"
          v-if="
            isCurrentViewAsset &&
            isCurrentUserManager &&
            !isTaskSelection"
          @click="selectBar('delete-assets')"
        >
          {{ $t('menu.delete_assets') }}
        </div>

        <div
          class="more-menu-item"
          v-if="
            isCurrentViewShot &&
            isCurrentUserManager &&
            !isTaskSelection"
          @click="selectBar('delete-shots')"
        >
          {{ $t('menu.delete_shots') }}
        </div>

        <div
          class="more-menu-item"
          v-if="
            isCurrentViewEdit &&
            isCurrentUserManager &&
            !isTaskSelection"
          @click="selectBar('delete-edits')"
        >
          {{ $t('menu.delete_edits') }}
        </div>
      </div>
    </div>

    <div
      :class="{
        'menu-mask': true,
        'is-hidden': isMoreMenuDisplayed
      }"
      @click="toggleMenu"
    >
    </div>

    <view-playlist-modal
      :active="modals.playlist"
      :task-ids="selectedTaskIds"
      @cancel="hidePlaylistModal"
    />
  </div>

</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { intersection } from '@/lib/array'
import { sortPeople } from '@/lib/sorting'

import { ChevronDownIcon, XIcon } from 'vue-feather-icons'
import Combobox from '@/components/widgets/Combobox'
import ComboboxModel from '@/components/widgets/ComboboxModel'
import ComboboxStatus from '@/components/widgets/ComboboxStatus'
import ViewPlaylistModal from '@/components/modals/ViewPlaylistModal'
import NotificationBell from '@/components/widgets/NotificationBell'
import PeopleField from '@/components/widgets/PeopleField'
import Spinner from '@/components/widgets/Spinner'

export default {
  name: 'action-topbar',

  components: {
    ChevronDownIcon,
    Combobox,
    ComboboxModel,
    ComboboxStatus,
    NotificationBell,
    PeopleField,
    Spinner,
    XIcon,
    ViewPlaylistModal
  },

  data () {
    return {
      availableTaskStatuses: [],
      currentTeam: [],
      customAction: {},
      customActions: [],
      isAssignationLoading: false,
      isAssetDeletionLoading: false,
      isChangePriorityLoading: false,
      isChangeStatusLoading: false,
      isCreationLoading: false,
      isDeletionLoading: false,
      isMoreMenuDisplayed: true,
      isShotDeletionLoading: false,
      isEditDeletionLoading: false,
      person: null,
      priority: '0',
      selectedBar: 'assignation',
      selectedTaskIds: [],
      taskStatusId: '',
      statusComment: '',
      modals: {
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
      errors: {
        deleteAsset: false,
        deleteTask: false,
        deleteShot: false
      }
    }
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
      'selectedTasks',
      'selectedAssets',
      'selectedShots',
      'selectedEdits',
      'shotCustomActions',
      'taskMap',
      'taskStatusForCurrentUser',
      'taskTypeMap',
      'user'
    ]),

    isTaskSelection () {
      return this.nbSelectedTasks > 0
    },

    isEntitySelection () {
      return this.selectedAssets.size > 0 || this.selectedShots.size > 0 ||
        this.selectedEdits.size > 0
    },

    nbSelectedAssets () {
      return this.selectedAssets.size
    },

    nbSelectedShots () {
      return this.selectedShots.size
    },

    nbSelectedEdits () {
      return this.selectedEdits.size
    },

    isHidden () {
      return (
        this.nbSelectedTasks === 0 &&
        this.nbSelectedValidations === 0 &&
        this.nbSelectedAssets === 0 &&
        this.nbSelectedShots === 0 &&
        this.nbSelectedEdits === 0
      ) ||
      !(
        this.isCurrentViewAsset ||
        this.isCurrentViewTodos ||
        this.isCurrentViewShot ||
        this.isCurrentViewEdit
      )
    },

    currentUrl () {
      return this.$route.path
    },

    currentHost () {
      return window.location.host
    },

    currentEntityType () {
      return this.isCurrentViewAsset ? 'asset' : 'shot'
    },

    defaultCustomAction () {
      if (this.customActions.length > 0) {
        return this.customActions[0]
      } else {
        return {}
      }
    },

    isCurrentViewAsset () {
      return this.$route.path.indexOf('asset') > 0 &&
             !this.$route.params.asset_id
    },

    isCurrentViewShot () {
      return this.$route.path.indexOf('shot') > 0 &&
             !this.$route.params.shot_id
    },

    isCurrentViewEdit () {
      return this.$route.path.indexOf('edit') > 0 &&
             !this.$route.params.edit_id
    },

    isCurrentViewTodos () {
      return this.$route.path.indexOf('todos') > 0 ||
             this.$route.path.indexOf('people/') > 0
    },

    isCurrentViewPerson () {
      return this.$route.path.indexOf('people/') > 0
    },

    isCurrentViewPersonTasks () {
      return this.$route.path.indexOf('todos') > 0
    },

    isCurrentViewTaskType () {
      return this.$route.path.indexOf('task-type') > 0
    },

    isList () {
      return this.isCurrentViewAsset || this.isCurrentViewShot
    },

    selectedPersonId () {
      return this.person ? this.person.id : null
    },

    currentProductionTeam () {
      return this.currentProduction ? this.currentProduction.team || [] : []
    },

    isInDepartment () {
      return this.selectedTaskIds.every(taskId => {
        const task = this.taskMap.get(taskId)
        const taskType = this.taskTypeMap.get(task.task_type_id)
        return taskType.department_id && this.user.departments.includes(
          taskType.department_id)
      })
    },

    isSupervisorInDepartment () {
      return this.isCurrentUserSupervisor && (
        this.user.departments.length === 0 || this.isInDepartment)
    },

    currentMenuLabel () {
      const labels = {
        assignation: 'menu.assign_tasks',
        'change-status': 'menu.change_status',
        priorities: 'menu.change_priority',
        playlists: 'menu.generate_playlists',
        tasks: 'menu.create_tasks',
        'delete-tasks': 'menu.delete_tasks',
        'delete-assets': 'menu.delete_assets',
        'delete-shots': 'menu.delete_shots',
        'delete-edits': 'menu.delete_edits',
        'custom-actions': 'menu.run_custom_action'
      }
      return this.$t(labels[this.selectedBar])
    },

    storagePrefix () {
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
      'changeSelectedTaskStatus',
      'changeSelectedPriorities',
      'clearSelectedTasks',
      'postCustomAction',
      'unassignPersonFromTask',
      'unassignSelectedTasks'
    ]),

    confirmAssign () {
      if (this.selectedPersonId || this.isInDepartment) {
        this.isAssignationLoading = true
        const personId = (this.isCurrentUserManager ||
          this.isCurrentUserSupervisor)
          ? this.selectedPersonId
          : this.user.id
        this.assignSelectedTasks({
          personId,
          callback: () => {
            this.isAssignationLoading = false
          }
        })
      }
    },

    confirmTaskStatusChange () {
      this.isChangeStatusLoading = true
      if (!this.taskStatusId) {
        this.taskStatusId = this.availableTaskStatuses[0].id
      }
      this.changeSelectedTaskStatus({
        taskStatusId: this.taskStatusId,
        comment: this.statusComment
      })
        .then(() => {
          this.statusComment = ''
          this.isChangeStatusLoading = false
        })
        .catch(err => {
          console.error(err)
          this.isChangeStatusLoading = false
        })
    },

    confirmPriorityChange () {
      this.isChangePriorityLoading = true
      this.changeSelectedPriorities({
        priority: Number(this.priority),
        callback: () => {
          this.isChangePriorityLoading = false
        }
      })
    },

    confirmTaskCreation () {
      const type = this.$route.path.indexOf('shots') > 0 ? 'shots' : 'assets'
      this.isCreationLoading = true
      this.createSelectedTasks({
        type: type,
        projectId: this.currentProduction.id
      })
        .then(() => {
          this.isCreationLoading = false
        })
        .catch((err) => {
          this.isCreationLoading = false
          console.error(err)
        })
    },

    confirmTaskDeletion () {
      this.isDeletionLoading = true
      this.errors.deleteTask = false
      this.deleteSelectedTasks()
        .then(() => {
          this.isDeletionLoading = false
        })
        .catch((err) => {
          console.error(err)
          this.isDeletionLoading = false
          this.errors.deleteTask = true
        })
    },

    confirmAssetDeletion () {
      this.isAssetDeletionLoading = true
      this.errors.deleteAsset = false
      this.deleteSelectedAssets()
        .then(() => {
          this.isAssetDeletionLoading = false
          this.clearSelectedAssets()
        })
        .catch((err) => {
          console.error(err)
          this.isAssetDeletionLoading = false
          this.errors.deleteAsset = true
        })
    },

    confirmShotDeletion () {
      this.isShotDeletionLoading = true
      this.errors.deleteShot = false
      this.deleteSelectedShots()
        .then(() => {
          this.isShotDeletionLoading = false
          this.clearSelectedShots()
        })
        .catch((err) => {
          console.error(err)
          this.isShotDeletionLoading = false
          this.errors.deleteShot = true
        })
    },

    confirmEditDeletion () {
      this.isEditDeletionLoading = true
      this.errors.deleteEdit = false
      this.deleteSelectedEdits()
        .then(() => {
          this.isEditDeletionLoading = false
          this.clearSelectedEdits()
        })
        .catch((err) => {
          console.error(err)
          this.isEditDeletionLoading = false
          this.errors.deleteEdit = true
        })
    },

    confirmPlaylistGeneration () {
      this.modals.playlist = true
    },

    hidePlaylistModal () {
      this.modals.playlist = false
    },

    clearAssignation () {
      if (this.isCurrentUserArtist) {
        this.selectedTasks.forEach(task => {
          this.unassignPersonFromTask({ task, person: this.user })
        })
      } else {
        this.isAssignationLoading = true
        this.unassignSelectedTasks({
          callback: () => {
            this.isAssignationLoading = false
          }
        })
      }
    },

    selectBar (barName) {
      localStorage.setItem(
        `${this.storagePrefix}-selected-bar`,
        barName,
        { expires: '1M' }
      )
      this.selectedBar = barName
      this.toggleMenu()
    },

    toggleMenu () {
      this.isMoreMenuDisplayed = !this.isMoreMenuDisplayed
    },

    setCurrentTeam () {
      if (this.people.length > 10 && this.currentProduction) {
        this.currentTeam = sortPeople(
          this.currentProductionTeam.map((personId) => {
            return this.personMap.get(personId)
          })
        )
      } else {
        this.currentTeam = [...this.people]
      }
      if (this.isCurrentUserSupervisor && this.user.departments.length > 0) {
        this.currentTeam = this.currentTeam.filter(person =>
          person.departments.some(
            department => this.user.departments.includes(department)))
      }
      return this.currentTeam
    },

    runCustomAction () {
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

    onKeyDown (event) {
      if (event.keyCode === 27) {
        if (!this.modals.playlist) {
          this.$store.commit('CLEAR_SELECTED_TASKS')
        }
      }
    },

    clearSelection () {
      this.clearSelectedAssets()
      this.clearSelectedShots()
      this.clearSelectedTasks()
      this.clearSelectedEdits()
    },

    autoChooseSelectBar () {
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

        const prefix = this.storagePrefix
        const lastSelection = localStorage.getItem(`${prefix}-selected-bar`)
        if (lastSelection) {
          this.selectedBar = lastSelection
        } else {
          if (this.isCurrentViewAsset || this.isCurrentViewShot) {
            this.selectedBar = 'assignation'
          } else {
            this.selectedBar = 'change-status'
          }
        }
      } else {
        window.removeEventListener('keydown', this.onKeyDown)
      }
    },

    setAvailableStatus () {
      if (this.selectedTasks.size === 0) this.availableTaskStatuses = []
      else if (this.isCurrentViewTodos) {
        const productions = new Map()
        this.selectedTasks.forEach(task => {
          const project = this.productionMap.get(task.project_id)
          productions.set(task.project_id, project)
        })
        const statusLists =
          Array.from(productions.values()).map(p => p.task_statuses)
        const availableStatus = new Set(intersection(statusLists))
        this.availableTaskStatuses = this.taskStatusForCurrentUser
          .filter(status => availableStatus.has(status.id))
      } else {
        this.availableTaskStatuses = this.taskStatusForCurrentUser
      }
    }
  },

  mounted () {
    this.customAction = this.defaultCustomAction
    this.setCurrentTeam()
  },

  watch: {
    nbSelectedAssets () {
      this.autoChooseSelectBar()
      if (this.nbSelectedAssets > 0) this.clearSelectedTasks()
    },

    nbSelectedShots () {
      this.autoChooseSelectBar()
      if (this.nbSelectedShots > 0) this.clearSelectedTasks()
    },

    isHidden () {
      this.autoChooseSelectBar()
    },

    nbSelectedTasks () {
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
            this.customActions.findIndex((action) => {
              return action.id === this.customAction.id
            }) >= 0

          if (!isUrlSelected) {
            this.customAction = this.customActions[0]
          }
        }
      }
    },

    selectedBar () {
      if (this.selectedBar === 'assignation') {
        this.$nextTick(() => {
          this.$refs['assignation-field'].focus()
        })
      }
    },

    currentProduction () {
      this.setCurrentTeam()
    },

    currentProductionTeam () {
      this.setCurrentTeam()
    },

    people () {
      this.setCurrentTeam()
    },

    $route () {
      this.selectedTaskIds = Array.from(this.selectedTasks.keys())
      if (this.nbSelectedTasks > 0) {
        this.clearSelectedTasks()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.action-topbar {
  background: #5e60ba;
  color: white;
  box-shadow: 0px 0px 6px rgba(0,0,0,0.2);
  max-height: 60px;
  min-height: 60px;
  z-index: 210;
  position: fixed;
  left: 0;
  right: 0;
}

div.assignation {
  font-weight: bold;
  margin-right: 1em;
  padding-right: 0;
}

div.combobox-item {
  padding-top: 3px;
}

.hidden {
  display: none;
}

.clear-selection {
  cursor: pointer;
  padding-right: 0.5em;
}

.field {
  margin-bottom: 0px;
}

.is-link {
  color: white;
}

.confirm-button {
  margin-right: 1em;
}

.clear-assignation-button:focus,
.clear-assignation-button:active,
.clear-assignation-button:hover {
  box-shadow: none;
  background: transparent;
  color: white;
}

.more-menu-icon {
  cursor: pointer;
  font-weight: bold;
  font-size: 1.2em;
  background: #4e50aa;
  height: 60px;
  padding: 0 0.5em 0 0.5em;
  align-items: middle;
}

.more-menu-icon .flexrow {
  height: 100%;
}

.more-menu {
  position: fixed;
  width: 200px;
  z-index: 200;
  left: 0;
  top: 60px;
  background: #5e60ba;
  color: white;
  box-shadow: 0px 0px 6px rgba(0,0,0,0.2);
}

.more-menu-item {
  padding: 0.4em 1em;
  font-size: 1.2em;
  cursor: pointer;
}

.more-menu-item:hover {
  background: #9f7fdf;
}

.action-bar {
  padding: 0;
  margin: 0;
}

.clear-selection-container {
  flex: 1;
}

.clear-selection {
}

.clear-selection .flexrow-item:first-child {
  margin-left: auto;
}

.comment-text {
  padding: 8px;
}

.priority-combobox {
  margin-top: -5px;
}

.confirm-button {
  margin-top: 2px;
}

@media screen and (max-width: 768px) {
  .level-item {
    width: auto;
  }

  .hide-small-screen {
    display: none;
  }
}
</style>
