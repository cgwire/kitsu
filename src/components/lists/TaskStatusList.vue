<template>
<div class="data-list">
  <div style="overflow: hidden">
    <table class="table table-header" ref="headerWrapper">
      <thead>
        <tr>
          <th class="name">
            {{ $t('task_status.fields.name') }}
          </th>
          <th class="short-name">
            {{ $t('task_status.fields.short_name') }}
          </th>
          <th class="is-reviewable">
            {{ $t('task_status.fields.is_reviewable') }}
          </th>
          <th class="is-done">
            {{ $t('task_status.fields.is_done') }}
          </th>
          <th class="actions"></th>
        </tr>
      </thead>
    </table>
  </div>

  <table-info
    :is-loading="isLoading"
    :is-error="isError"
  >
  </table-info>

  <div class="table-body" v-scroll="onBodyScroll">
    <table class="table">
      <tbody>
        <tr v-for="entry in entries" :key="entry.id">
          <td class="name">
            {{ entry.name }}
          </td>
          <task-status-name class="short-name" :entry="entry">
          </task-status-name>
          <td class="is-reviewable">
            {{ translateBoolean(entry.is_reviewable) }}
          </td>
          <td class="is-done">
            {{ translateBoolean(entry.is_done) }}
          </td>
          <row-actions
            :entry-id="entry.id"
            :edit-route="{
              name: 'edit-task-status',
              params: {task_status_id: entry.id}
            }"
            :delete-route="{
              name: 'delete-task-status',
              params: {task_status_id: entry.id}
            }"
          />
        </tr>
      </tbody>
    </table>
  </div>

  <p class="has-text-centered nb-task-status">
    {{ entries.length }} {{ $tc('task_status.number', entries.length) }}
  </p>

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import RowActions from '../widgets/RowActions'
import TableInfo from '../widgets/TableInfo'
import TaskStatusName from '../cells/TaskStatusName'

export default {
  name: 'task-status-list',
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
    TaskStatusName
  },
  computed: {
    ...mapGetters([
    ])
  },
  methods: {
    ...mapActions([
    ]),
    onBodyScroll (event, position) {
      this.$refs.headerWrapper.style.left = `-${position.scrollLeft}px`
    },
    translateBoolean (booleanValue) {
      return booleanValue ? this.$t('main.yes') : this.$t('main.no')
    }
  }
}
</script>

<style scoped>
.name {
  width: 200px;
  min-width: 200px;
}

.short-name {
  width: 150px;
  min-width: 150px;
}

.is-reviewable {
  width: 120px;
  min-width: 120px;
}

.is-done {
  width: 120px;
  min-width: 120px;
}
</style>
