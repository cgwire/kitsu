<template>
  <div>
    <div :class="{
      'action-topbar': true,
      'hidden': isHidden
    }">
      <div class="flexrow action-bar">

        <div class="flexrow-item more-menu-icon" @click="toggleMenu">
          <more-vertical-icon />
        </div>

        <div class="flexrow-item" v-if="selectedBar === 'assignation'">
          <div class="flexrow" v-if="isCurrentUserManager">
            <div class="assignation flexrow-item hide-small-screen">
              {{ $tc('tasks.assign', nbSelectedTasks, {nbSelectedTasks}) }}
            </div>
            <div class="flexrow-item combobox-item">
              <people-field v-model="person" />
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
            <div class="flexrow-item hide-small-screen" v-if="!isAssignationLoading">
              {{ $t('main.or') }}
            </div>
            <div class="flexrow-item hide-small-screen" v-if="!isAssignationLoading">
              <button
                class="button is-link clear-assignation-button hide-small-screen"
                @click="clearAssignation"
              >
                {{ $t('tasks.clear_assignations') }}
              </button>
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
            <div class="flexrow-item combobox-item">
              <combobox
                :options="taskStatusOptions"
                v-model="taskStatusId"
              >
              </combobox>
            </div>
            <div class="flexrow-item" v-if="!isChangeStatusLoading">
              <button
                class="button is-success confirm-button"
                @click="confirmTaskStatusChange"
              >
                {{ $t('main.confirmation') }}
              </button>

              <div class="" v-if="isChangeStatusLoading">
                <spinner :is-white="true"></spinner>
              </div>
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
            <div class="flexrow-item combobox-item">
              <combobox
                :options="priorityOptions"
                v-model="priority"
              >
              </combobox>
            </div>
            <div class="flexrow-item" v-if="!isChangePriorityLoading">
              <button
                class="button is-success confirm-button"
                @click="confirmPriorityChange"
              >
                {{ $t('main.confirmation') }}
              </button>

              <div class="" v-if="isChangePriorityLoading">
                <spinner :is-white="true"></spinner>
              </div>
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

              <div class="" v-if="isCreationLoading">
                <spinner :is-white="true"></spinner>
              </div>
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
              <combobox
                :options="customActionOptions"
                v-model="customActionUrl"
              >
              </combobox>
            </div>
            <div class="flexrow-item">
              <form
                target="_blank"
                method="POST"
                :action="customActionUrl"
              >
                <input type="hidden" id="personid" name="personid" :value="user.id">
                <input type="hidden" id="personemail" name="personemail" :value="user.email">
                <input type="hidden" id="projectid" name="projectid" :value="currentProduction.id">
                <input type="hidden" id="currentpath" name="currentpath" :value="currentUrl">
                <input type="hidden" id="currentserver" name="currentserver" :value="currentHost">
                <input type="hidden" id="selection" name="selection" :value="selectedTaskIds">
                <input type="hidden" id="entity_type" name="entity_type" :value="currentEntityType">
              <button
                class="button is-success"
                type="submit"
              >
                {{ $t('main.confirmation') }}
              </button>
              </form>
            </div>
          </div>
        </div>

        <div class="flexrow-item clear-selection-container">
          <div
            class="clear-selection flexrow"
            @click="clearSelectedTasks"
          >
            <x-icon class="flexrow-item">
            </x-icon>
            <span class="flexrow-item hide-small-screen">
              {{ $t('main.clear_selection') }}
            </span>
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
          v-if="isCurrentViewAsset || isCurrentViewShot"
          @click="selectBar('assignation')"
        >
          {{ $t('menu.assign_tasks') }}
        </div>

        <div
          class="more-menu-item"
          @click="selectBar('change-status')"
        >
          {{ $t('menu.change_status') }}
        </div>

        <div
          class="more-menu-item"
          v-if="isCurrentViewAsset || isCurrentViewShot"
          @click="selectBar('priorities')"
        >
          {{ $t('menu.change_priority') }}
        </div>

        <div
          class="more-menu-item"
          v-if="isCurrentViewAsset || isCurrentViewShot"
          @click="selectBar('tasks')"
        >
          {{ $t('menu.create_tasks') }}
        </div>

        <div
          class="more-menu-item"
          @click="selectBar('custom-actions')"
        >
          {{ $t('menu.run_custom_action') }}
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
  </div>

</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ButtonHrefLink from './widgets/ButtonHrefLink'
import Combobox from './widgets/Combobox'
import PeopleField from './widgets/PeopleField'
import Spinner from './widgets/Spinner'
import { ChevronRightIcon, XIcon, MoreVerticalIcon } from 'vue-feather-icons'

export default {
  name: 'topbar',

  components: {
    ChevronRightIcon,
    Combobox,
    MoreVerticalIcon,
    PeopleField,
    Spinner,
    ButtonHrefLink,
    XIcon
  },

  data () {
    return {
      isMoreMenuDisplayed: true,
      isAssignationLoading: false,
      isChangeStatusLoading: false,
      isChangePriorityLoading: false,
      isCreationLoading: false,
      selectedBar: 'assignation',
      person: null,
      taskStatusId: '',
      customActionUrl: '',
      selectedTaskIds: [],
      customActionOptions: [],
      priority: '0',
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
      ]
    }
  },

  computed: {
    ...mapGetters([
      'assetMap',
      'getPersonOptions',
      'taskStatusOptions',
      'selectedTasks',
      'nbSelectedTasks',
      'nbSelectedValidations',
      'isCurrentUserManager',
      'currentProduction',
      'allCustomActionOptions',
      'assetCustomActionOptions',
      'shotCustomActionOptions',
      'user',
      'people'
    ]),

    isHidden () {
      return (
        this.nbSelectedTasks === 0 &&
        this.nbSelectedValidations === 0
      ) ||
      !(
        this.isCurrentViewAsset ||
        this.isCurrentViewTodos ||
        this.isCurrentViewShot
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

    defaultCustomActionUrl () {
      if (this.customActionOptions.length > 0) {
        return this.customActionOptions[0].value
      } else {
        return ''
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

    isCurrentViewTodos () {
      return this.$route.path.indexOf('todos') > 0 ||
             this.$route.path.indexOf('people/') > 0
    },

    isCurrentViewPersonTasks () {
      return this.$route.path.indexOf('todos') > 0
    },

    isList () {
      return this.isCurrentViewAsset || this.isCurrentViewShot
    },

    selectedPersonId () {
      return this.person ? this.person.id : null
    }
  },

  methods: {
    ...mapActions([
      'assignSelectedTasks',
      'createSelectedTasks',
      'unassignSelectedTasks',
      'changeSelectedTaskStatus',
      'changeSelectedPriorities',
      'clearSelectedTasks'
    ]),

    confirmAssign () {
      if (this.selectedPersonId) {
        this.isAssignationLoading = true
        this.assignSelectedTasks({
          personId: this.selectedPersonId,
          callback: () => {
            this.isAssignationLoading = false
          }
        })
      }
    },

    confirmTaskStatusChange () {
      this.isChangeStatusLoading = true
      if (!this.taskStatusId) {
        this.taskStatusId = this.taskStatusOptions[0].value
      }

      this.changeSelectedTaskStatus({
        taskStatusId: this.taskStatusId,
        callback: () => {
          this.isChangeStatusLoading = false
        }
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
      this.isPriorityLoading = true
      this.createSelectedTasks({
        type: type,
        projectId: this.currentProduction.id,
        callback: () => {
          this.isPriorityLoading = false
        }
      })
    },

    clearAssignation () {
      this.isAssignationLoading = true
      this.unassignSelectedTasks({
        callback: () => {
          this.isAssignationLoading = false
        }
      })
    },

    selectBar (barName) {
      const prefix = this.isList ? 'entities-' : 'todos-'
      this.$cookie.set(
        `${prefix}-selected-bar`,
        barName,
        { expires: '1M' }
      )
      this.selectedBar = barName
      this.toggleMenu()
    },

    toggleMenu () {
      this.isMoreMenuDisplayed = !this.isMoreMenuDisplayed
    }
  },

  mounted () {
    this.customActionUrl = this.defaultCustomActionUrl
  },

  watch: {
    isHidden () {
      if (!this.isHidden) {
        const prefix = this.isList ? 'entities-' : 'todos-'
        const lastSelection = this.$cookie.get(`${prefix}-selected-bar`)

        if (lastSelection) {
          this.selectedBar = lastSelection
        } else {
          if (this.isCurrentViewAsset || this.isCurrentViewShot) {
            this.selectedBar = 'assignation'
          } else {
            this.selectedBar = 'change-status'
          }
        }
      }
    },

    nbSelectedTasks () {
      this.selectedTaskIds = Object.keys(this.selectedTasks)

      if (this.nbSelectedTasks > 0) {
        let isShotSelected = false
        let isAssetSelected = false

        for (let taskId of Object.keys(this.selectedTasks)) {
          const task = this.selectedTasks[taskId]
          if (task.sequence_name) {
            isShotSelected = true
          } else {
            isAssetSelected = true
          }
        }

        if (isShotSelected && isAssetSelected) {
          this.customActionOptions = this.allCustomActionOptions
        } else if (isShotSelected) {
          this.customActionOptions = this.shotCustomActionOptions
        } else {
          this.customActionOptions = this.assetCustomActionOptions
        }
      }
    },

    $route () {
      this.clearSelectedTasks()
    }
  }
}
</script>

<style scoped>
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
  padding-top: 3px;
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
  padding: 0.7em;
}

.clear-selection-container {
  flex: 1;
}

.clear-selection {
}

.clear-selection .flexrow-item:first-child {
  margin-left: auto;
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
