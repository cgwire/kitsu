<template>
<div class="data-list">
  <table class="table">
    <thead>
      <tr>
        <th class="name">{{ $t('productions.fields.name') }}</th>
        <th class="status">{{ $t('productions.fields.status') }}</th>
        <th class="actions"></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="entry in entries">
        <production-name-cell class="name" v-bind:entry="entry">
        </production-name-cell>
        <td class="td-status">
          {{ $t(getStatusLocale(entry.project_status_name)) }}
        </td>
        <td class="actions has-text-right">
          <p class="field">
				  <a class="button">
					  <span class="icon is-small">
						  <i class="fa fa-edit"></i>
						</span>
          </a>
				  <a class="button">
					  <span class="icon is-small">
						  <i class="fa fa-trash"></i>
						</span>
          </a>
				  </p>
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
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ProductionNameCell from '../cells/ProductionNameCell'

export default {
  name: 'production-list',
  props: [
    'entries',
    'isLoading',
    'isError'
  ],
  data () {
    return {}
  },
  components: {
    ProductionNameCell
  },
  computed: {
    ...mapGetters([
    ])
  },
  methods: {
    ...mapActions([
    ]),
    // Convert a database status to a locale key.
    getStatusLocale (originalStatus) {
      const statusMap = {
        Active: 'productions.status.open', // Shotgun compatibility
        Open: 'productions.status.open',
        Closed: 'productions.status.closed'
      }
      return statusMap[originalStatus]
    }
  }
}
</script>

<style scoped>
.name {
  width: 300px;
}

.status {
  width: 100px;
}
</style>
