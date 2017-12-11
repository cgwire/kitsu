<template>
  <div>
    <div :class="{
      'action-topbar': true,
      'hidden': isHidden
    }">
      <div class="level">
        <div class="level-left">
          <div class="level-item more-menu-icon" @click="toggleMenu">
            <more-vertical-icon></more-vertical-icon>
          </div>

          <div class="level-item" v-if="selectedBar === 'assignation'">
            <div class="flexrow" v-if="isCurrentUserManager">
              <div class="assignation flexrow-item">
                {{ $tc('tasks.assign', nbSelectedTasks, {nbSelectedTasks}) }}
              </div>
              <div class="flexrow-item">
                <combobox
                  :options="getPersonOptions"
                  v-model="personId"
                >
                </combobox>
              </div>
              <div class="" v-if="isAssignationLoading">
                <spinner :is-white="true"></spinner>
              </div>
              <div class="flexrow-item" v-if="!isAssignationLoading">
                <button
                  class="button is-success confirm-button"
                  @click="confirmAssign"
                >
                {{ $t('main.confirmation') }}
                </button>
              </div>
              <div class="flexrow-item" v-if="!isAssignationLoading">
                {{ $t('main.or') }}
              </div>
              <div class="flexrow-item" v-if="!isAssignationLoading">
                <button
                  class="button is-link clear-assignation-button"
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
            class="level-item"
            v-if="selectedBar === 'tasks'"
          >
            <div class="flexrow">
              <div class="flexrow-item strong bigger">
                Create new tasks for selection:
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

        </div>

        <div class="level-right">
          <div
            class="level-item clear-selection"
            @click="clearSelection"
          >
            <x-icon>
            </x-icon>
            {{ $t('main.clear_selection') }}
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
          @click="selectBar('assignation')"
        >
        Assign tasks
        </div>

        <div
          class="more-menu-item"
          @click="selectBar('tasks')"
        >
        Create tasks
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
import PeopleAvatar from './widgets/PeopleAvatar'
import PeopleName from './widgets/PeopleName'
import Combobox from './widgets/Combobox'
import Spinner from './widgets/Spinner'
import { ChevronRightIcon, XIcon, MoreVerticalIcon } from 'vue-feather-icons'

export default {
  name: 'topbar',
  components: {
    ChevronRightIcon,
    Combobox,
    MoreVerticalIcon,
    PeopleName,
    PeopleAvatar,
    Spinner,
    XIcon
  },
  data () {
    return {
      isMoreMenuDisplayed: true,
      isAssignationLoading: false,
      isCreationLoading: false,
      selectedBar: 'assignation',
      personId: ''
    }
  },
  computed: {
    ...mapGetters([
      'getPersonOptions',
      'selectedTasks',
      'nbSelectedTasks',
      'isCurrentUserManager',
      'currentProduction'
    ]),
    isHidden () {
      return this.nbSelectedTasks === 0
    }
  },
  methods: {
    ...mapActions([
      'assignSelectedTasks',
      'createSelectedTasks',
      'unassignSelectedTasks'
    ]),

    clearSelection () {
      this.$store.commit('CLEAR_SELECTED_TASKS')
    },

    getSelectedPersonId () {
      if (this.getPersonOptions.length > 0) {
        const defaultChoice = this.getPersonOptions[0].value
        return this.personId || defaultChoice
      } else {
        return null
      }
    },

    confirmAssign () {
      this.isAssignationLoading = true
      this.assignSelectedTasks({
        personId: this.getSelectedPersonId(),
        callback: () => {
          this.isAssignationLoading = false
        }
      })
    },

    confirmTaskCreation () {
      const type = this.$route.path.indexOf('shots') > 0 ? 'shots' : 'assets'
      this.isCreationLoading = true
      this.createSelectedTasks({
        type: type,
        project_id: this.currentProduction.id,
        callback: () => {
          this.isCreationLoading = false
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
      this.selectedBar = barName
      this.toggleMenu()
    },

    toggleMenu () {
      this.isMoreMenuDisplayed = !this.isMoreMenuDisplayed
    }
  },

  watch: {
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
  z-index: 200;
  position: fixed;
  left: 0;
  right: 0;
}

.level {
  width: 100%;
  height: 60px;
  align-items: center;
}

div.assignation {
  font-weight: bold;
  margin-right: 0.4em;
  padding-right: 0;
}

.level-item {
  padding: 0.5em;
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

.flexrow-item {
}

@media screen and (max-width: 768px) {
}
</style>
