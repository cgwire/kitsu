<template>
  <div class="search-queries">
    <span
      class="tag folder mr1"
      @click="editGroup()"
      :title="$t('main.filter_group_add')"
      v-if="isGroupEnabled"
    >
      <folder-plus-icon size="12" />
    </span>
    <span
      class="tag group"
      :class="{ open: toggleGroupId === group.id }"
      :key="`group-${group.id}`"
      :style="{
        backgroundColor: `${group.color}B3`
      }"
      @click="toggleFilterGroup(group)"
      v-for="group in userFilterGroups"
      v-if="isGroupEnabled"
    >
      <div class="group-header">
        <span>{{ group.name }}</span>
        <chevron-down-icon class="chevron ml05" size="12" />
        <button
          class="edit"
          :style="{ backgroundColor: group.color }"
          @click.stop="editGroup(group)"
        >
          <edit2-icon size="0.7x" />
        </button>
        <button
          class="del"
          :style="{ backgroundColor: group.color }"
          @click.stop="removeGroup(group)"
          v-if="!group.queries.length"
        >
          <trash2-icon size="0.7x" />
        </button>
      </div>
      <div
        :ref="`group-${group.id}`"
        class="group-list"
        :style="{ backgroundColor: `${group.color}B3` }"
        v-if="toggleGroupId === group.id"
      >
        <span class="tag empty" v-if="!group.queries.length">
          <em>{{ $t('main.filter_group_empty') }}</em>
        </span>
        <span
          class="tag"
          :key="searchQuery.id"
          :style="{ backgroundColor: `${group.color}BF` }"
          @click="changeSearch(searchQuery)"
          v-for="searchQuery in group.queries"
          v-else
        >
          <span>
            {{ searchQuery.name }}
          </span>
          <button
            class="edit"
            :style="{
              backgroundColor: `${group.color}`
            }"
            @click.stop="editSearch(searchQuery)"
          >
            <edit2-icon size="0.6x" />
          </button>
          <button
            class="del"
            :style="{ backgroundColor: `${group.color}B3` }"
            @click.stop="removeSearch(searchQuery)"
          >
            <trash2-icon size="0.6x" />
          </button>
        </span>
      </div>
    </span>
    <span
      class="tag"
      :key="searchQuery.id"
      @click="changeSearch(searchQuery)"
      v-for="searchQuery in userFilters"
    >
      <span>
        {{ searchQuery.name }}
      </span>
      <button class="edit" @click.stop="editSearch(searchQuery)">
        <edit2-icon size="0.6x" />
      </button>
      <button class="del" @click.stop="removeSearch(searchQuery)">
        <trash2-icon size="0.6x" />
      </button>
    </span>
    <edit-search-filter-modal
      :active="modals.edit"
      :group-options="groupOptions"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :is-group-enabled="isGroupEnabled"
      :search-query-to-edit="searchQueryToEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditSearch"
    />
    <edit-search-filter-group-modal
      :active="modals.group"
      :is-loading="loading.group"
      :is-error="errors.group"
      :group-to-edit="groupToEdit"
      @cancel="modals.group = false"
      @confirm="confirmEditFilterGroup"
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
  ChevronDownIcon,
  Edit2Icon,
  FolderPlusIcon,
  Trash2Icon
} from 'vue-feather-icons'

import { sortByName } from '@/lib/sorting'
import stringHelpers from '@/lib/string'
import EditSearchFilterModal from '@/components/modals/EditSearchFilterModal'
import EditSearchFilterGroupModal from '@/components/modals/EditSearchFilterGroupModal'

export default {
  name: 'search-query-list',
  props: {
    queries: {
      type: Array,
      default: () => []
    },
    groups: {
      type: Array,
      default: () => []
    },
    isGroupEnabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      required: true
    }
  },
  components: {
    ChevronDownIcon,
    Edit2Icon,
    EditSearchFilterModal,
    EditSearchFilterGroupModal,
    FolderPlusIcon,
    Trash2Icon
  },
  data() {
    return {
      groupToEdit: {},
      searchQueryToEdit: {},
      errors: {
        edit: false,
        group: false
      },
      loading: {
        edit: false,
        group: false
      },
      modals: {
        edit: false,
        group: false
      },
      toggleGroupId: null
    }
  },
  computed: {
    sortedFilters() {
      return sortByName([...this.queries])
    },
    userFilters() {
      return this.sortedFilters.filter(query => !query.search_filter_group_id)
    },
    userFilterGroups() {
      return sortByName([...this.groups]).map(group => {
        return {
          ...group,
          queries: this.sortedFilters.filter(
            query => query.search_filter_group_id === group.id
          )
        }
      })
    },
    groupOptions() {
      return [
        { label: '', value: null },
        ...this.userFilterGroups.map(group => ({
          label: group.name,
          value: group.id
        }))
      ]
    }
  },
  methods: {
    ...mapActions([
      'removeAssetSearchFilterGroup',
      'removeShotSearchFilterGroup',
      'saveAssetSearchFilterGroup',
      'saveShotSearchFilterGroup',
      'updateSearchFilter',
      'updateSearchFilterGroup'
    ]),

    changeSearch(searchQuery) {
      this.$emit('change-search', searchQuery)
    },

    editGroup(group = {}) {
      this.groupToEdit = group
      this.modals.group = true
    },

    editSearch(searchQuery) {
      this.searchQueryToEdit = searchQuery
      this.modals.edit = true
    },

    async confirmEditFilterGroup(filterGroup) {
      try {
        this.loading.group = true
        this.errors.group = false

        if (!filterGroup.id) {
          await this[
            `save${stringHelpers.capitalize(this.type)}SearchFilterGroup`
          ](filterGroup)
        } else {
          await this.updateSearchFilterGroup(filterGroup)
        }
        this.modals.group = false
      } catch (err) {
        console.error(err)
        this.errors.group = true
      } finally {
        this.loading.group = false
      }
    },

    async confirmEditSearch(searchFilter) {
      try {
        this.loading.edit = true
        this.errors.edit = false
        await this.updateSearchFilter(searchFilter)
        this.modals.edit = false
      } catch (err) {
        console.error(err)
        this.errors.edit = true
      } finally {
        this.loading.edit = false
      }
    },

    closeFilterGroupModal() {
      this.modals.group = false
    },

    removeSearch(searchQuery) {
      this.$emit('remove-search', searchQuery)
    },

    async removeGroup(filterGroup) {
      try {
        await this[
          `remove${stringHelpers.capitalize(this.type)}SearchFilterGroup`
        ](filterGroup)
      } catch (err) {
        console.error(err)
      }
    },

    toggleFilterGroup(group) {
      this.toggleGroupId = this.toggleGroupId !== group.id ? group.id : null
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .search-queries .del,
  .search-queries .edit {
    background: $dark-grey-light;
    color: white;
  }
}

.tag {
  border-radius: 1em;
  margin-left: 0;
  cursor: pointer;
}

.search-queries .group {
  position: relative;

  &.open {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .chevron {
    position: relative;
    top: 3px;
  }

  .group-list {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0.5rem 0;
    background-color: whitesmoke;
    border-bottom-left-radius: 1em;
    border-bottom-right-radius: 1em;
    max-height: 200px;
    overflow: scroll;

    .tag {
      margin: 0 0.5em;
    }
    .tag + .tag {
      margin-top: 0.5em;
    }
  }
}

.search-queries .tag {
  margin: 0 1em 0.2em 0;

  &.empty {
    background-color: transparent;
  }
}

.search-queries .group.tag:not(.open):hover,
.search-queries .tag:hover {
  transform: scale(1.1);
}

.search-queries .group.tag:hover, // avoid bug  (overflow)
.search-queries .tag.empty:hover {
  transform: none;
}

.search-queries .del {
  display: none;
}

.search-queries .tag:hover .del,
.search-queries .tag:hover .edit {
  display: inline-block;
}

.search-queries .group.tag:hover .del,
.search-queries .group.tag:hover .edit {
  display: none;
}

.search-queries .group.tag.open .group-header:hover .del,
.search-queries .group.tag.open .group-header:hover .edit {
  display: inline-block;
}

.search-queries .group.tag .tag:hover .del,
.search-queries .group.tag .tag:hover .edit {
  display: inline-block;
}

.search-queries .del:hover,
.search-queries .edit:hover {
  background: $dark-grey-lighter;
}

.search-queries .edit,
.search-queries .del {
  background: $light-grey;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: none;
  height: 14px;
  width: 14px;
  line-height: 8px;
}

.search-queries .edit {
  margin-left: 1em;
  margin-right: 0;
}
.search-queries .del {
  margin-left: 0.5em;
}
</style>
