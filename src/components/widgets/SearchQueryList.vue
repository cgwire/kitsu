<template>
<div class="search-queries">
  <span
    class="tag flexrow"
    :key="searchQuery.id"
    @click="changeSearch($event, searchQuery)"
    v-for="searchQuery in userFilters"
  >
    <span class="flexrow-item">
      {{ searchQuery.name }}
    </span>
    <button
      class="edit flexrow-item"
      @click.prevent="editSearch(searchQuery)"
    >
      <edit2-icon size="0.6x" class="edit-icon"/>
    </button>
    <button
      class="delete flexrow-item"
      @click.prevent="removeSearch(searchQuery)"
    >
    </button>
  </span>
  <edit-search-filter-modal
    ref="edit-search-modal"
    :active="modals.edit"
    :is-loading="loading.edit"
    :is-error="errors.edit"
    :search-query-to-edit="searchQueryToEdit"
    @cancel="modals.edit = false"
    @confirm="confirmEditSearch"
  />
</div>
</template>

<script>
/*
 * This component displays a list of queries available to users to filter list
 * results. It allows to modify each query too.
 */
import { mapActions } from 'vuex'
import {
  Edit2Icon
} from 'vue-feather-icons'

import { sortByName } from '@/lib/sorting'
import EditSearchFilterModal from '@/components/modals/EditSearchFilterModal'

export default {
  name: 'search-query-list',
  props: {
    queries: {
      type: Array,
      default: () => []
    }
  },
  components: {
    Edit2Icon,
    EditSearchFilterModal
  },
  data () {
    return {
      searchQueryToEdit: {},
      errors: {
        edit: false
      },
      loading: {
        edit: false
      },
      modals: {
        edit: false
      }
    }
  },
  computed: {
    userFilters () {
      return sortByName([...this.queries])
    }
  },
  methods: {
    ...mapActions([
      'updateSearchFilter'
    ]),

    changeSearch (event, searchQuery) {
      const isButtonClicked =
        ['delete flexrow', 'edit flexrow'].includes(event.target.className)
      if (!isButtonClicked) {
        this.$emit('change-search', searchQuery)
      }
    },

    editSearch (searchQuery) {
      this.searchQueryToEdit = searchQuery
      this.modals.edit = true
    },

    confirmEditSearch (searchFilter) {
      this.loading.edit = true
      this.updateSearchFilter(searchFilter)
        .then(() => {
          this.loading.edit = false
          this.modals.edit = false
        })
        .catch((err) => {
          console.error(err)
          this.loading.edit = false
          this.errors.edit = true
        })
    },

    removeSearch (searchQuery) {
      this.$emit('remove-search', searchQuery)
    }
  }
}
</script>
<style>
.tag {
  cursor: pointer;
}

.search-queries .flexrow {
  display: inline-flex;
  padding-right: 0;
}

.search-queries .delete {
  display: none;
}

.search-queries .tag:hover .delete {
  display: inline-block;
}

.search-queries .tag:hover .edit {
  display: inline-block;
}

.search-queries .edit:hover {
  background: #A4A4A4;
}

.search-queries .edit {
  display: none;
  background: #C4C4C4;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  height: 14px;
  margin-right: 0;
  width: 14px;
  line-height: 8px;
  .edit-icon {
    padding-bottom: 20px;
  }
}
</style>
