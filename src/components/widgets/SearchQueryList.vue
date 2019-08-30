<template>
<div class="search-queries">
  <span
    class="tag"
    @click="changeSearch($event, searchQuery)"
    :key="searchQuery.id"
    v-for="searchQuery in queries"
  >
    {{ searchQuery.name }}
    <button
      class="delete"
      @click.prevent="removeSearch(searchQuery)"
    >
    </button>
  </span>
</div>
</template>

<script>
export default {
  name: 'search-query-list',
  props: {
    queries: {
      type: Array,
      default: () => []
    }
  },
  components: {
  },
  computed: {
  },
  methods: {
    changeSearch (event, searchQuery) {
      if (event.target.className !== 'delete') {
        this.$emit('changesearch', searchQuery)
      }
    },

    removeSearch (searchQuery) {
      this.$emit('removesearch', searchQuery)
    }
  }
}
</script>
<style>
.tag {
  cursor: pointer;
}
</style>
