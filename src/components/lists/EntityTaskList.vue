<template>
<div class="data-list">
  <div style="overflow: hidden">
    <table class="table table-header" ref="headerWrapper">
      <thead>
        <tr>
          <th class="type">
            {{ $t('tasks.fields.task_type') }}
          </th>
          <th class="status">
            {{ $t('tasks.fields.task_status') }}
          </th>
          <th class="assignees">
            {{ $t('tasks.fields.assignees') }}
          </th>
        </tr>
      </thead>
    </table>
  </div>

  <table-info
    :is-loading="isLoading"
    :is-error="isError"
  >
  </table-info>

  <div class="table-body" v-scroll="onBodyScroll" v-if="entries.length > 0">
    <table class="table">
      <tbody>
        <tr v-for="entry in entries" :key="entry.taskType.id">
          <task-type-name
            class="type"
            :entry="{
              id: entry.taskType.id,
              name: entry.taskType.name,
              color: entry.taskType.color
            }"
            :production-id="currentProduction.id"
          >
          </task-type-name>
          <td class="status">
            <validation-tag
              :task="entry"
            >
            </validation-tag>
          </td>
          <td class="assignees">
            <div class="flexrow">
              <div
                class="avatar-wrapper"
                :key="person.id"
                v-for="person in entry.persons"
              >
                <people-avatar
                  class="person-avatar flexrow-item"
                  :key="entry.id + '-' + person.id"
                  :person="person"
                  :size="30"
                  :font-size="15"
                >
                </people-avatar>
              </div>
            </div>
          </td>
       </tr>
      </tbody>
    </table>
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import TaskTypeName from '../cells/TaskTypeName'
import TableInfo from '../widgets/TableInfo'
import ValidationTag from '../widgets/ValidationTag'
import PeopleAvatar from '../widgets/PeopleAvatar'

export default {
  name: 'todos-list',

  components: {
    TableInfo,
    TaskTypeName,
    PeopleAvatar,
    ValidationTag
  },

  props: [
    'entries',
    'isLoading',
    'isError'
  ],

  computed: {
    ...mapGetters([
      'currentProduction'
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

<style scoped>
.data-list {
  max-width: 500px;
}

.type {
  max-width: 250px;
  min-width: 250px;
}

.status {
  max-width: 100px;
  min-width: 100px;
}

.assignees {
  max-width: 150px;
  min-width: 150px;
}

.flexrow-item {
  margin-right: 0.3em;
}

.avatar-wrapper {
  margin-right: 0.5em;
}
</style>
