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
          <th class="is-done">
            {{ $t('task_status.fields.is_done') }}
          </th>
          <th class="is-retake">
            {{ $t('task_status.fields.is_retake') }}
          </th>
          <th class="is-artist-allowed">
            {{ $t('task_status.fields.is_artist_allowed') }}
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
    <table class="table">
      <tbody>
        <tr v-for="entry in entries" :key="entry.id">
          <td class="name">
            {{ entry.name }}
          </td>
          <task-status-name class="short-name" :entry="entry" />
          <td class="is-done">
            {{ formatBoolean(entry.is_done) }}
          </td>
          <td class="is-retake">
            {{ formatBoolean(entry.is_retake) }}
          </td>
          <td class="is-artist-allowed">
            {{ formatBoolean(entry.is_artist_allowed) }}
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
            :hide-edit="entry.short_name === 'todo'"
            :hide-delete="entry.short_name === 'todo'"
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
import { formatListMixin } from './format_mixin'
import RowActions from '../widgets/RowActions'
import TableInfo from '../widgets/TableInfo'
import TaskStatusName from '../cells/TaskStatusName'

export default {
  name: 'task-status-list',
  mixins: [formatListMixin],
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
    }
  }
}
</script>

<style lang="scss" scoped>
.name {
  width: 200px;
  min-width: 200px;
}

.short-name {
  width: 150px;
  min-width: 150px;
}

.is-reviewable,
.is-done,
.is-retake,
.is-artist-allowed {
  width: 140px;
  min-width: 140px;
}
</style>
