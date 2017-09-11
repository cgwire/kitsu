<template>
<div class="data-list">
  <table class="table">
    <thead>
      <tr>
        <th class="project">{{ $t('assets.fields.production') }}</th>
        <th class="type">{{ $t('assets.fields.type') }}</th>
        <th class="name">{{ $t('assets.fields.name') }}</th>
        <th class="description">{{ $t('assets.fields.description') }}</th>
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
            class="is-small"
            :text="$t('tasks.create_tasks')"
            path="/assets/create-tasks"
          >
          </button-link>
        </th>

      </tr>
    </thead>
    <tbody>
      <tr
        key="entry.id"
        :class="{canceled: entry.canceled}"
        v-for="entry in entries"
      >
        <production-name-cell
          class="project"
          :only-avatar="true"
          :entry="{name: entry.project_name}"
        >
        </production-name-cell>
        <td :class="{type: !entry.canceled}">
          {{ entry.asset_type_name }}
        </td>
        <td :class="{name: !entry.canceled}">
          {{ entry.name }}
        </td>
        <td class="description">
          {{ entry.description }}
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
        <row-actions
          :entry-id="entry.id"
          :edit-route="'/assets/edit/' + entry.id"
          :delete-route="'/assets/delete/' + entry.id"
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

  <p class="has-text-centered nb-assets">
    {{ entries.length }} {{ $tc('assets.number', entries.length) }}
  </p>

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ProductionNameCell from '../cells/ProductionNameCell'
import RowActions from '../widgets/RowActions'
import ValidationTag from '../widgets/ValidationTag'
import ButtonLink from '../widgets/ButtonLink'

export default {
  name: 'asset-list',
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
    ProductionNameCell,
    RowActions,
    ButtonLink,
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
.actions {
  min-width: 150px;
  padding: 0.4em;
}

.project {
  min-width: 50px;
  max-width: 50px;
  width: 50px;
}

.name {
  min-width: 200px;
  max-width: 200px;
  width: 200px;
  font-weight: bold;
}

.type {
  min-width: 100px;
  max-width: 100px;
  width: 100px;
  font-weight: bold;
}

.description {
  min-width: 200px;
  max-width: 200px;
  width: 200px;
}

.validation {
  min-width: 120px;
  max-width: 120px;
  width: 120px;
  margin-right: 1em;
}

td.name {
  font-size: 1.2em;
}

td.type {
  font-size: 1.2em;
}

.canceled {
  text-decoration: line-through;
}
</style>
