<template>
<div class="data-list">
  <table class="table">
    <thead>
      <tr>
        <th class="project">{{ $t('assets.fields.production') }}</th>
        <th class="type">{{ $t('assets.fields.type') }}</th>
        <th class="name">{{ $t('assets.fields.name') }}</th>
        <th class="validation" v-for="column in validationColumns">
          {{ column }}
        </th>
        <th class="actions"></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="entry in entries">
        <production-name-cell
          class="project"
          :only-avatar="true"
          :entry="{name: entry.project_name}"
        >
        </production-name-cell>
        <td class="type">
          {{ entry.asset_type_name }}
        </td>
        <td class="name">
          {{ entry.name }}
        </td>
        <td class="validation" v-for="column in validationColumns">
          <validation-tag
            :task="entry.validations[column]"
            v-if="entry.validations[column]"
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

.name {
  width: 200px;
}

.type {
  width: 150px;
}

.validation {
  width: 100px;
}
</style>
