<template>
<div class="data-list">
  <div style="overflow: hidden">
    <table class="table table-header" ref="headerWrapper">
      <thead>
        <tr>
          <th class="name">{{ $t('task_types.fields.name') }}</th>
          <th class="dedicated">{{ $t('task_types.fields.dedicated_to') }}</th>
          <th class="priority">{{ $t('task_types.fields.priority') }}</th>
          <th class="allow-timelog">{{ $t('task_types.fields.allow_timelog') }}</th>
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
          <task-type-name class="name" :entry="entry"></task-type-name>
          <td class="dedicated">{{ renderForShots(entry) }}</td>
          <td class="priority">{{ entry.priority }}</td>
          <td class="allow-timelog">
            {{ entry.allow_timelog ? $t('main.yes') : $t('main.no')}}
          </td>
          <row-actions
            :entry-id="entry.id"
            :edit-route="{
              name: 'edit-task-type',
              params: {task_type_id: entry.id}
            }"
            :delete-route="{
              name: 'delete-task-type',
              params: {task_type_id: entry.id}
            }"
          >
          </row-actions>
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
    TaskTypeName,
    TableInfo
  },

  computed: {
    ...mapGetters([
    ])
  },

  methods: {
    ...mapActions([
    ]),

    renderForShots (entry) {
      if (entry.for_shots) {
        return this.$t('shots.title')
      } else {
        return this.$t('assets.title')
      }
    },

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
