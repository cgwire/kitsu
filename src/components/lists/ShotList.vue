<template>
<div class="data-list">
  <table class="table">
    <thead>
      <tr>
        <th class="project">{{ $t('shots.fields.production') }}</th>
        <th class="sequence">{{ $t('shots.fields.sequence') }}</th>
        <th class="name">{{ $t('shots.fields.name') }}</th>
        <th
          class="validation"
          :style="{
            border: '2px solid ' + column.color
          }"
          v-for="column in validationColumns">
          {{ column.name }}
        </th>

        <th class="actions">
          <button-link
            class="level-item is-small"
            :text="$t('tasks.create_tasks')"
            path="/shots/create-tasks"
          >
          </button-link>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="entry in entries">
        <production-name-cell
          class="project"
          :only-avatar="true"
          :entry="{name: entry.project_name || ''}"
        >
        </production-name-cell>
        <td class="sequence">
          {{ entry.sequence_name }}
        </td>
        <td class="name">
          {{ entry.name }}
        </td>
        <td
          class="validation"
          :style="{
            'border': '2px solid ' + column.color,
          }"
          v-for="column in validationColumns"
        >
          <validation-tag
            :task="entry.validations[column.name]"
            v-if="entry.validations[column.name]"
          >
          </validation-tag>
        </td>
        <td class="actions">
        </td>
      </tr>
    </tbody>
  </table>

  <div class="has-text-centered" v-if="isLoading">
    <img src="../../assets/spinner.svg">
  </div>
  <div class="has-text-centered" v-if="isError">
    <span class="tag is-danger">An error occured while loading data</span>
  </div>

  <p class="has-text-centered nb-shots">
    {{ entries.length }} {{ $tc('shots.number', entries.length) }}
  </p>

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ProductionNameCell from '../cells/ProductionNameCell'
import ValidationTag from '../widgets/ValidationTag'
import RowActions from '../widgets/RowActions'
import ButtonLink from '../widgets/ButtonLink'

export default {
  name: 'shot-list',
  props: [
    'entries',
    'isLoading',
    'isError',
    'validationColumns'
  ],
  data () {
    return {}
  },
  components: {
    ButtonLink,
    ProductionNameCell,
    RowActions,
    ValidationTag
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
.project {
  width: 50px;
}

th.actions {
  padding: 0.4em;
}

.name {
  width: 100px;
  font-weight: bold;
}

td.name {
  font-size: 1.2em;
}

.sequence {
  width: 50px;
  font-weight: bold;
}

td.sequence {
  font-size: 1.2em;
}

.episode {
  width: 50px;
}

.validation {
  width: 150px;
  margin-right: 1em;
}
</style>
