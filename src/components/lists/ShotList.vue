<template>
<div class="data-list">
  <table class="table">
    <thead>
      <tr>
        <th class="project">{{ $t('shots.fields.production') }}</th>
        <th class="sequence">{{ $t('shots.fields.sequence') }}</th>
        <th class="name">{{ $t('shots.fields.name') }}</th>
        <th class="actions"></th>
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
import RowActions from '../widgets/RowActions'

export default {
  name: 'shot-list',
  props: [
    'entries',
    'isLoading',
    'isError'
  ],
  data () {
    return {}
  },
  components: {
    ProductionNameCell,
    RowActions
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

.sequence {
  width: 50px;
}

.episode {
  width: 50px;
}
</style>
