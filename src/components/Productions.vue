<template>
  <div class="productions page">
    <div class="productions-list">
      <h1 class="title">{{ $t('productions.title') }}</h1>

      <production-list
        v-bind:entries="productions"
        v-bind:is-loading="isProductionsLoading"
        v-bind:is-error="isProductionsLoadingError"
      ></production-list>

      <p class="has-text-centered nb-persons">
        {{ productions.length }} {{ $tc('productions.number', productions.length) }}
      </p>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ProductionList from './lists/ProductionList.vue'
import Filters from './widgets/Filters.vue'

export default {
  name: 'menu',
  components: {
    ProductionList,
    Filters
  },
  data () {
    return {
      choices: [],
      productionFilters: [{
        type: 'Status',
        value: {
          name: 'open'
        }
      }],
      productionFilterTypes: [
        'Status'
      ]
    }
  },

  created () {
    this.$store.dispatch('loadProductions')
  },
  computed: {
    ...mapGetters([
      'productions',
      'isProductionsLoading',
      'isProductionsLoadingError'
    ])
  },
  methods: {
    ...mapActions([
    ])
  }
}
</script>

<style scoped>
.productions-list {
  margin-top: 2em;
}
</style>
