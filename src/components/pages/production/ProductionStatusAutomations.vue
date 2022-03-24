<template>
  <div class="columns">
    <div class="column">
      <template v-if="remainingStatusAutomations.length > 0">
        <div
          class="flexrow mt1 mb1 add-status-automation"
          v-if="!isEmpty(remainingStatusAutomations)"
        >
          <combobox-status-automation
            class="flexrow-item selector"
            :status-automations-list="remainingStatusAutomations"
            v-model="statusAutomationId"
          />
          <button
            class="button flexrow-item"
            @click="addStatusAutomation"
          >
            {{ $t('main.add') }}
          </button>
        </div>
      </template>

      <div
        class="box"
        v-if="isEmpty(currentProduction.status_automations)"
      >
        {{ $t('settings.production.empty_list') }}
      </div>

      <status-automation-list
        :entries="productionStatusAutomations"
      />
  </div>
</div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import StatusAutomationList from '@/components/lists/StatusAutomationList'
import ComboboxStatusAutomation from '../../widgets/ComboboxStatusAutomation.vue'

export default {
  name: 'production-status-automations',

  components: {
    ComboboxStatusAutomation,
    StatusAutomationList
  },

  data () {
    return {
      statusAutomationId: ''
    }
  },

  mounted () {
    if (this.remainingStatusAutomations.length > 0) {
      this.statusAutomationId = this.remainingStatusAutomations[0].id
    }
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'productionStatusAutomations',
      'statusAutomations',
      'statusAutomationMap',
      'remainingStatusAutomations'
    ])
  },

  methods: {
    ...mapActions([
      'addStatusAutomationToProduction'
    ]),

    isEmpty (list) {
      return !list || list.length === 0
    },

    resetDisplayedStatusAutomations () {
      this.resetStatusAutomations()
    },

    addStatusAutomation () {
      this.addStatusAutomationToProduction(this.statusAutomationId)
      if (this.remainingStatusAutomations.length > 0) {
        this.statusAutomationId = this.remainingStatusAutomations[0].id
      } else {
        // Clean data to avoid duplicated data in combobox
        this.statusAutomationId = ''
      }
    },

    /*
      Return an object with the following structure:
      {
        title: 'title of the first column of the tab (Assets or short)',
        list:  [{taskTypes, scheduleItem}]
        // A list of objects that represents a couple of taskType and their
        linked scheduleItem.
      }
    */
    resetStatusAutomations () {
      this.statusAutomations = this.productionStatusAutomations
    }
  },

  watch: {
    currentProduction: {
      handler () {
        this.resetDisplayedStatusAutomations()
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>
.column {
  overflow-y: initial;
}

.datatable th {
  color: var(--text);
}

table {
  margin-bottom: 1.5em;
}

th {
  padding-left: 10px;
  padding-bottom: 5px;
}

td p {
  color: var(--text);
}

td.name {
  flex: 1;
}

.start-date {
  width: 135px;
}

.end-date {
  width: 135px;
}

.remove {
  width: 100px;
}

td ::v-deep p.control.flexrow {
  width: 105px;
}

.field {
  margin-bottom: 0;
}

.section-title {
  color: $grey;
  font-size: 1.2em;
  margin-bottom: 1em;
  margin-top: 2em;
  text-transform: uppercase;
}
</style>
