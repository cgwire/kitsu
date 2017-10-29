<template>
  <div :class="{
    'action-topbar': true,
    'hidden': isHidden
  }">
    <div class="level">
      <div class="level-left">
        <div class="level-item assignation">
          <chevron-right-icon></chevron-right-icon>
          {{ $t('tasks.assign', {nbSelectedTasks}) }}
        </div>
        <div class="level-item">
          <combobox
            :options="getPersonOptions"
            v-model="personId"
          >
          </combobox>
        </div>
        <div class="level-item" v-if="isAssignationLoading">
          <spinner :is-white="true"></spinner>
        </div>
        <div class="level-item" v-else>
          <button
            class="button is-success confirm-button"
            @click="confirmAssign"
          >
          {{ $t('main.confirmation') }}
          </button>
          {{ $t('main.or') }}
          <button
            class="button is-link clear-assignation-button"
            @click="clearAssignation"
          >
            {{ $t('tasks.clear_assignations') }}
          </button>
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
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import PeopleAvatar from './widgets/PeopleAvatar'
import PeopleName from './widgets/PeopleName'
import Combobox from './widgets/Combobox'
import Spinner from './widgets/Spinner'
import { ChevronRightIcon, XIcon } from 'vue-feather-icons'

export default {
  name: 'topbar',
  components: {
    ChevronRightIcon,
    Combobox,
    PeopleName,
    PeopleAvatar,
    Spinner,
    XIcon
  },
  data () {
    return {
      isAssignationLoading: false,
      personId: ''
    }
  },
  computed: {
    ...mapGetters([
      'getPersonOptions',
      'selectedTasks',
      'nbSelectedTasks'
    ]),
    isHidden () {
      return this.nbSelectedTasks === 0
    }
  },
  methods: {
    ...mapActions([
      'assignSelectedTasks',
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
    clearAssignation () {
      this.isAssignationLoading = true
      this.unassignSelectedTasks({
        callback: () => {
          this.isAssignationLoading = false
        }
      })
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
  font-size: 1.3em;
  font-weight: bold;
  margin-right: 0;
  padding-right: 0;
}

.level-item {
  padding: 1em;
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

@media screen and (max-width: 768px) {
}
</style>
