<template>
<div class="data-list">
  <div class="datatable-wrapper">
    <table class="datatable">
      <thead class="datatable-head">
        <tr>
          <th scope="col" class="name">{{ $t('task_types.fields.name') }}</th>
          <th scope="col" class="priority">
            {{ $t('task_types.fields.priority') }}
          </th>
          <th scope="col" class="allow-timelog">
            {{ $t('task_types.fields.allow_timelog') }}
          </th>
          <th scope="col" class="actions"></th>
        </tr>
      </thead>
      <draggable
        class="datatable-body"
        v-model="assetsItems"
        draggable=".tasktype-item"
        tag="tbody"
        :sort="true"
        @end="updatePriorityAssets"
      >
        <tr class="datatable-type-header" slot="header">
          <th scope="rowgroup" colspan="4">
            <span class="datatable-row-header">
              {{ $t('assets.title') }}
            </span>
          </th>
        </tr>
        <tr class="datatable-row tasktype-item" v-for="taskType in assetsItems" :key="taskType.id">
          <task-type-cell class="name" :task-type="taskType" />
          <td class="priority">{{ taskType.priority }}</td>
          <td class="allow-timelog">
            {{ taskType.allow_timelog ? $t('main.yes') : $t('main.no')}}
          </td>
          <row-actions
            :taskType-id="taskType.id"
            @delete-clicked="$emit('delete-clicked', taskType)"
            @edit-clicked="$emit('edit-clicked', taskType)"
          />
        </tr>
      </draggable>
      <draggable
        class="datatable-body"
        v-model="shotsItems"
        draggable=".tasktype-item"
        tag="tbody"
        :sort="true"
        @end="updatePriorityShots"
      >
        <tr class="datatable-type-header" slot="header">
          <th scope="rowgroup" colspan="4">
            <span class="datatable-row-header">
              {{ $t('shots.title') }}
            </span>
          </th>
        </tr>
        <tr
          class="datatable-row tasktype-item"
          v-for="taskType in shotsItems" :key="taskType.id"
        >
          <task-type-cell class="name" :task-type="taskType" />
          <td class="priority">{{ taskType.priority }}</td>
          <td class="allow-timelog">
            {{ taskType.allow_timelog ? $t('main.yes') : $t('main.no')}}
          </td>
          <row-actions
            :taskType-id="taskType.id"
            :edit-route="{
              name: 'edit-task-type',
              params: {task_type_id: taskType.id}
            }"
            :delete-route="{
              name: 'delete-task-type',
              params: {task_type_id: taskType.id}
            }"
          />
        </tr>
      </draggable>
    </table>
  </div>

  <table-info
    :is-loading="isLoading"
    :is-error="isError"
  />

  <p class="has-text-centered nb-task-types">
    {{ entries.length }} {{ $tc('task_types.number', entries.length) }}
  </p>

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import draggable from 'vuedraggable'
import RowActions from '../widgets/RowActions'
import TableInfo from '../widgets/TableInfo'
import TaskTypeCell from '../cells/TaskTypeName'

export default {
  name: 'task-type-list',

  props: [
    'entries',
    'isLoading',
    'isError'
  ],

  data () {
    return {
      assetsItems: [],
      shotsItems: []
    }
  },

  components: {
    draggable,
    RowActions,
    TableInfo,
    TaskTypeCell
  },

  mounted () {},

  computed: {
    ...mapGetters([
    ]),

    assetTaskTypes () {
      return this.entries.filter(taskType => !taskType.for_shots)
    },

    shotTaskTypes () {
      return this.entries.filter(taskType => taskType.for_shots)
    }
  },

  methods: {
    ...mapActions([
    ]),

    updatePriorityAssets () {
      const forms = []
      this.assetsItems.forEach((item, index) => {
        index += 1
        const form = {
          id: item.id,
          name: item.name,
          priority: String(index)
        }
        item.priority = index
        forms.push(form)
      })
      this.$emit('update-priorities', forms)
    },

    updatePriorityShots () {
      const forms = []
      this.shotsItems.forEach((item, index) => {
        index += 1
        const form = {
          id: item.id,
          name: item.name,
          priority: String(index)
        }
        item.priority = index
        forms.push(form)
      })
      this.$emit('update-priorities', forms)
    }
  },

  watch: {
    entries: {
      immediate: true,
      handler () {
        setTimeout(() => {
          this.assetsItems = JSON.parse(JSON.stringify(this.assetTaskTypes))
          this.shotsItems = JSON.parse(JSON.stringify(this.shotTaskTypes))
        }, 100)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.name {
  width: 300px;
  min-width: 300px;
}

.priority {
  width: 80px;
  min-width: 80px;
}

.dedicated {
  width: 100px;
  min-width: 100px;
}

.allow-timelog {
  width: 100px;
  min-width: 100px;
}

.actions {
  min-width: 100px;
}

.color {
  width: 100px;
}

.tasktype-item[draggable=false] {
  cursor: grab;
}

.tasktype-item[draggable=true] {
  cursor: grabbing;
}

tr {
  cursor: pointer;
}
</style>
