<template>
<div class="data-list">
  <table class="table">
    <thead>
      <tr>
        <th class="project">{{ $t('shots.fields.production') }}</th>
        <th class="sequence">{{ $t('shots.fields.sequence') }}</th>
        <th class="name">{{ $t('shots.fields.name') }}</th>
        <th class="framein">{{ $t('shots.fields.frame_in') }}</th>
        <th class="frameout">{{ $t('shots.fields.frame_out') }}</th>
        <th class="description">{{ $t('shots.fields.description') }}</th>
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
      <tr
        key="entry.id"
        :class="{canceled: entry.canceled}"
        v-for="entry in entries"
      >
        <production-name-cell
          class="project"
          :only-avatar="true"
          :entry="{name: entry.project_name || ''}"
        >
        </production-name-cell>
        <td :class="{name: !entry.canceled}">
          {{ entry.sequence_name }}
        </td>
        <td :class="{name: !entry.canceled}">
          {{ entry.name }}
        </td>
        <td class="framein">
          {{ entry.data.frame_in }}
        </td>
        <td class="frameout">
          {{ entry.data.frame_out }}
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
          :edit-route="'/shots/edit/' + entry.id"
          :delete-route="'/shots/delete/' + entry.id"
          :hide-edit="true"
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
  min-width: 60px;
  max-width: 60px;
  width: 60px;
}

.actions {
  min-width: 100px;
}

th.actions {
  padding: 0.4em;
}

.name {
  min-width: 100px;
  max-width: 100px;
  width: 100px;
  font-weight: bold;
}

.sequence {
  min-width: 50px;
  max-width: 50px;
  width: 50px;
  font-weight: bold;
}

.episode {
  min-width: 50px;
  max-width: 50px;
  width: 50px;
}

.framein {
  min-width: 50px;
  max-width: 50px;
  width: 50px;
}

.frameout {
  min-width: 50px;
  max-width: 50px;
  width: 50px;
}

.description {
  min-width: 200px;
  max-width: 200px;
  width: 200px;
}

.validation {
  min-width: 150px;
  max-width: 150px;
  width: 150px;
  margin-right: 1em;
}

td.name {
  font-size: 1.2em;
}

td.sequence {
  font-size: 1.2em;
}

.canceled {
  text-decoration: line-through;
}
</style>
