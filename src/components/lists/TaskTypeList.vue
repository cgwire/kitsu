<template>
<div class="data-list">
  <div style="overflow: hidden">
    <table class="table table-header" ref="headerWrapper">
      <thead>
        <tr>
          <th class="name">{{ $t('task_types.fields.name') }}</th>
          <th class="priority">{{ $t('task_types.fields.priority') }}</th>
          <th class="allow-timelog">
            {{ $t('task_types.fields.allow_timelog') }}
          </th>
          <th class="actions"></th>
        </tr>
      </thead>
    </table>
  </div>

  <table-info
    :is-loading="isLoading"
    :is-error="isError"
  />

  <div class="table-body" v-scroll="onBodyScroll">
    <table class="table splitted-table">
      <tbody>
        <tr class="type-header">
          <td colspan="30">
            {{ $t('assets.title') }}
          </td>
        </tr>
        <tr v-for="taskType in assetTaskTypes" :key="taskType.id">
          <task-type-name class="name" :entry="taskType" />
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
      </tbody>
    </table>

    <table class="table splitted-table">
      <tbody>
        <tr class="type-header">
          <td colspan="30">
            {{ $t('shots.title') }}
          </td>
        </tr>
        <tr v-for="taskType in shotTaskTypes" :key="taskType.id">
          <task-type-name class="name" :entry="taskType" />
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
      </tbody>

    </table>
  </div>

  <p class="has-text-centered nb-task-types">
    {{ entries.length }} {{ $tc('task_types.number', entries.length) }}
  </p>

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import RowActions from '../widgets/RowActions'
import TableInfo from '../widgets/TableInfo'
import TaskTypeName from '../cells/TaskTypeName'

export default {
  name: 'task-type-list',

  props: [
    'entries',
    'isLoading',
    'isError'
  ],

  data () {
    return {}
  },

  components: {
    RowActions,
    TableInfo,
    TaskTypeName
  },

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

    onBodyScroll (event, position) {
      this.$refs.headerWrapper.style.left = `-${position.scrollLeft}px`
    }
  }
}
</script>

<style scoped>
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
</style>
