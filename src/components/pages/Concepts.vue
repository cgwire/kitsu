<template>
  <div class="fixed-page columns">
    <div class="column main-column">
      <div class="concepts page">
        <div class="page-header">
          <div class="filters">
            <search-field
              ref="search-field"
              class="field"
              :can-save="true"
              placeholder="ex: chara"
              @change="onSearchChange"
              @save="saveSearchQuery"
              v-if="false"
            />
            <combobox-status
              :label="$t('main.status')"
              :task-status-list="taskStatusList"
              v-model="filters.taskStatusId"
            />
            <span class="field small">
              <label class="label">
                {{ $t('concepts.fields.publisher') }}
              </label>
              <people-field
                :big="true"
                :people="publishers"
                v-model="filters.publisher"
              />
            </span>
            <combobox
              :label="$t('concepts.fields.entity_type')"
              :options="entityTypeOptions"
              v-model="filters.entityType"
              v-if="false"
            />
            <combobox
              class="right"
              :label="$t('main.sorted_by')"
              locale-key-prefix="concepts.fields."
              :options="sortByOptions"
              v-model="filters.sortBy"
            />
          </div>
          <div class="query-list" v-if="false">
            <search-query-list
              :queries="conceptSearchQueries"
              type="concept"
              @change-search="changeSearch"
              @remove-search="removeSearchQuery"
            />
          </div>
        </div>
        <h2 class="mt0">
          {{ $t('concepts.title') }} ({{ filteredConcepts?.length || 0 }})
        </h2>
        <table-info
          :is-loading="loading.loadingConcepts"
          :is-error="errors.loadingConcepts"
          v-if="loading.loadingConcepts || errors.loadingConcepts"
        />
        <div class="concept-list pb1" v-else-if="filteredConcepts?.length">
          <ul class="items">
            <li
              class="item"
              :class="{
                'selected-item': isSelected(concept)
              }"
              v-for="concept in filteredConcepts"
              :key="concept.id"
              @click="
                onSelectConcept(concept, $event.ctrlKey || $event.metaKey)
              "
            >
              <entity-preview
                :empty-height="200"
                :empty-width="300"
                :height="200"
                :width="300"
                :entity="concept"
                is-rounded-top-border
              />
              <div class="description">
                <ul class="tags">
                  <li
                    class="tag"
                    v-for="entity in getLinkedEntities(concept)"
                    :key="entity.id"
                    @click.stop
                  >
                    <router-link :to="entityPath(entity, 'asset')">
                      {{ entity.name }}
                    </router-link>
                  </li>
                </ul>
                <div class="status" v-if="hasTask(concept)">
                  <span
                    class="tag"
                    :style="{
                      backgroundColor: getTaskStatus(concept).color,
                      color: 'white'
                    }"
                  >
                    {{ getTaskStatus(concept).short_name }}
                  </span>
                  <people-avatar
                    :person="personMap.get(concept.created_by)"
                    :size="25"
                    :font-size="14"
                  />
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div v-else>
          {{ $t('concepts.empty') }}
        </div>
        <footer class="footer mt2">
          <button-simple
            :disabled="loading.loadingConcepts"
            :text="$t('concepts.add_new_concept')"
            @click="openAddConceptModal"
          />
        </footer>
      </div>
    </div>

    <add-preview-modal
      ref="add-preview-modal"
      :active="modals.addConcept"
      is-concept
      :is-error="errors.addingConcept"
      :is-loading="loading.addingConcept"
      message=""
      @cancel="closeAddConceptModal"
      @confirm="confirmAddConceptModal"
    />

    <div class="column side-column" v-if="selectedConcepts.size">
      <task-info entity-type="Concept" :task="currentTask" with-actions />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { firstBy } from 'thenby'

import { getEntityPath } from '@/lib/path'
import { sortByName, sortPeople } from '@/lib/sorting'

import { searchMixin } from '@/components/mixins/search'

import AddPreviewModal from '@/components/modals/AddPreviewModal'
import ButtonSimple from '@/components/widgets/ButtonSimple'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import EntityPreview from '@/components/widgets/EntityPreview.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import PeopleField from '@/components/widgets/PeopleField'
import SearchField from '@/components/widgets/SearchField'
import SearchQueryList from '@/components/widgets/SearchQueryList'
import TableInfo from '@/components/widgets/TableInfo'
import TaskInfo from '@/components/sides/TaskInfo'

export default {
  name: 'concepts',
  mixins: [searchMixin],

  components: {
    AddPreviewModal,
    ButtonSimple,
    Combobox,
    ComboboxStatus,
    EntityPreview,
    PeopleAvatar,
    PeopleField,
    SearchField,
    SearchQueryList,
    TableInfo,
    TaskInfo
  },

  data() {
    return {
      loading: {
        addingConcept: false,
        loadingConcepts: false,
        savingSearch: false
      },
      errors: {
        addingConcept: false,
        loadingConcepts: false
      },
      filters: {
        entityType: null,
        publisher: null,
        sortBy: 'created_at',
        taskStatusId: null
      },
      form: {
        file: null
      },
      modals: {
        addConcept: false
      },

      // TODO: module getters
      conceptSearchQueries: [
        {
          id: 'filter-test-1',
          list_type: 'concept',
          name: 'test',
          search_query: 'test'
        }
      ]
    }
  },

  mounted() {
    // TODO: concept search
    // this.setSearch(this.$route.query.search)
    // this.searchField.focus()
  },

  computed: {
    ...mapGetters([
      'assetMap',
      'currentProduction',
      'displayedConcepts',
      'isDarkTheme',
      'isTVShow',
      'personMap',
      'selectedConcepts',
      'taskStatusMap'
    ]),

    publishers() {
      const publishers = new Map()
      this.filteredConcepts.forEach(concept => {
        const personId = concept.created_by
        if (!publishers.has(personId)) {
          const person = this.personMap.get(personId)
          if (person) {
            publishers.set(personId, person)
          }
        }
      })
      return sortPeople([...publishers.values()])
    },

    currentTask() {
      return this.currentConcept?.tasks?.[0]
    },

    currentConcept() {
      return this.selectedConcepts.size === 1
        ? this.selectedConcepts.values().next().value
        : null
    },

    entityTypeOptions() {
      const allEntityTypeOptions = {
        label: this.$t('main.all'),
        value: null
      }
      const options = ['assets', 'shots', 'sequences', 'edits', 'episodes'].map(
        name => ({
          label: this.$t(`${name}.title`),
          value: name
        })
      )
      return [allEntityTypeOptions].concat(options)
    },

    sortByOptions() {
      return ['created_at', 'updated_at', 'last_comment_date'].map(name => ({
        label: name,
        value: name
      }))
    },

    filteredConcepts() {
      let concepts = [...this.displayedConcepts]

      if (this.filters.taskStatusId) {
        concepts = concepts.filter(
          concept =>
            concept.tasks[0].task_status_id === this.filters.taskStatusId
        )
      }
      if (this.filters.publisher) {
        concepts = concepts.filter(
          concept => concept.created_by === this.filters.publisher.id
        )
      }
      if (this.filters.entityType) {
        concepts = concepts.filter(concept =>
          concept.tags?.some(
            // FIXME: condition related to many-to-many relationship
            entity => entity.type === this.filters.entityType
          )
        )
      }
      return concepts.sort(
        firstBy(this.filters.sortBy, -1).thenBy('created_at', -1)
      )
    },

    searchField() {
      return this.$refs['search-field']
    },

    taskStatusList() {
      const allStatusItem = {
        id: null,
        color: '#999',
        name: this.$t('main.all'),
        short_name: this.$t('main.all')
      }
      const conceptTaskStatusList = sortByName(
        Array.from(this.taskStatusMap.values()).filter(
          status => status.for_concept
        )
      )
      return [allStatusItem].concat(conceptTaskStatusList)
    }
  },

  methods: {
    ...mapActions([
      'addSelectedConcepts',
      'addSelectedTask',
      'clearSelectedConcepts',
      'clearSelectedTasks',
      'loadAssets',
      'loadConcepts',
      'newConcepts',
      'setCurrentEpisode'
    ]),

    // TODO: module actions
    setConceptSearch: searchQuery => Promise.resolve(),
    saveConceptSearch: searchQuery => Promise.resolve(),
    removeConceptSearch: searchQuery => Promise.resolve(),

    setSearch(value) {
      this.searchField.setValue(value)
    },

    onSearchChange() {
      const searchQuery = this.searchField.getValue() || ''
      if (searchQuery?.length !== 1) {
        this.setConceptSearch(searchQuery)
      }
      this.setSearchInUrl()
    },

    saveSearchQuery(searchQuery) {
      if (this.loading.savingSearch) {
        return
      }
      this.loading.savingSearch = true
      this.saveConceptSearch(searchQuery)
        .catch(console.error)
        .finally(() => {
          this.loading.savingSearch = false
        })
    },

    removeSearchQuery(searchQuery) {
      this.removeConceptSearch(searchQuery).catch(err => {
        if (err) console.error(err)
      })
    },

    async refreshConcepts() {
      this.loading.loadingConcepts = true
      try {
        this.setCurrentEpisode('all') // mandatory to load all assets
        await this.loadAssets(true)
        await this.loadConcepts()
      } catch (err) {
        console.error(err)
        this.errors.loadingConcepts = true
      } finally {
        this.loading.loadingConcepts = false
      }
    },

    entityPath(entity, section) {
      const episodeId = this.isTVShow ? entity.episode_id || 'main' : null
      return getEntityPath(
        entity.id,
        this.currentProduction.id,
        section,
        episodeId,
        { section: 'concepts' }
      )
    },

    getLinkedEntities(concept) {
      return concept.entity_concept_links
        .map(id => this.assetMap.get(id))
        .filter(Boolean)
    },

    getTaskStatus(concept) {
      return this.taskStatusMap.get(concept.tasks[0].task_status_id)
    },

    hasTask(concept) {
      return concept.tasks?.length
    },

    isSelected(concept) {
      return this.selectedConcepts.has(concept.id)
    },

    onSelectConcept(concept, isMultipleSelection = false) {
      const selection = isMultipleSelection
        ? new Map(this.selectedConcepts)
        : new Map()
      if (
        (isMultipleSelection && this.isSelected(concept)) ||
        (!isMultipleSelection && concept === this.currentConcept)
      ) {
        selection.delete(concept.id)
      } else {
        selection.set(concept.id, concept)
      }
      this.clearSelectedConcepts()
      this.addSelectedConcepts(selection)

      this.clearSelectedTasks()
      if (this.currentTask) {
        this.addSelectedTask(this.currentTask)
      }
    },

    openAddConceptModal() {
      this.modals.addConcept = true
    },

    closeAddConceptModal() {
      this.modals.addConcept = false
    },

    async confirmAddConceptModal(forms) {
      this.loading.addingConcept = true
      try {
        await this.newConcepts(forms)
        this.closeAddConceptModal()
      } catch (err) {
        console.error(err)
        this.errors.addingConcept = true
      } finally {
        this.loading.addingConcept = false
      }
    },

    reset() {
      this.clearSelectedConcepts()
      this.clearSelectedTasks()
      this.refreshConcepts()
    }
  },

  watch: {
    currentProduction: {
      immediate: true,
      handler() {
        // HACK: the store init a wrong current production by default
        const productionId = this.$route.params.production_id
        if (this.currentProduction?.id === productionId) {
          this.reset()
        }
      }
    }
  },

  metaInfo() {
    return {
      title: `${this.$t('concepts.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.filters {
  display: flex;
  align-items: flex-end;
  gap: 0 20px;
  padding: 10px;

  .field {
    margin-bottom: 1em;

    .label {
      padding-top: 5px;
    }
  }

  .right {
    margin-left: auto;
  }
}

.concept-list {
  overflow-x: auto;
}

.items {
  cursor: pointer;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  list-style: none;
  margin: 0;
  width: 100vw;

  .item {
    display: flex;
    flex-direction: column;
    width: 300px;
    background-color: var(--background);
    border-radius: 1em;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);

    .dark & {
      background-color: var(--background-alt);
    }

    &.selected-item {
      background-color: var(--background-selected);
    }

    &:hover {
      background-color: var(--background-hover);
    }

    .description {
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      row-gap: 10px;
      padding: 0.3em 1em;
      margin: 0.3em 0;
      flex: 1;
    }

    .tags {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-left: 0;
      flex: 1;

      .tag {
        cursor: pointer;

        &:hover {
          transform: scale(1.1);
        }
      }
    }

    .tag {
      font-weight: 500;
      letter-spacing: 1px;
    }

    .status {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .tag {
        text-transform: uppercase;
      }
    }
  }
}

.footer {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: center;
  padding: 3em;

  .dark & {
    background-color: var(--background-alt);
  }
}
</style>
