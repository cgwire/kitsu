<template>
<div class="data-list">
  <table class="table">
    <thead>
      <tr>
        <th class="name">{{ $t('task_types.fields.name') }}</th>
        <th class="actions"></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="entry in entries">
        <task-type-name class="name" :entry="entry">
        </task-type-name>
        <row-actions
          :entry-id="entry.id"
          :edit-route="'/task-types/edit/' + entry.id"
          :delete-route="'/task-types/delete/' + entry.id"
        >
        </row-actions>
      </tr>
    </tbody>
  </table>

  <div class="has-text-centered" v-if="isLoading">
    <img src="../../assets/spinner.svg">
  </div>
  <div class="has-text-centered" v-if="isError">
    <span class="tag is-danger">An error occured while loading data</span>
  </div>

  <p class="has-text-centered nb-task-types">
    {{ entries.length }} {{ $tc('task_types.number', entries.length) }}
  </p>

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import RowActions from '../widgets/RowActions'
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
    TaskTypeName
  },
  computed: {
    ...mapGetters([
    ])
  },
  methods: {
    ...mapActions([
    ])
  }
}
</script>

<style scoped>
.name {
  width: 300px;
}

.color {
  width: 100px;
}
</style>
