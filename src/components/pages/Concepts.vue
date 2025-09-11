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
            <span class="field">
              <label class="label">
                {{ $t('concepts.fields.publisher') }}
              </label>
              <people-field
                small
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
        </div>
        <table-info
          :is-loading="loading.loadingConcepts"
          :is-error="errors.loadingConcepts"
          v-if="loading.loadingConcepts || errors.loadingConcepts"
        />
        <div
          ref="concept-list"
          class="concept-list pb1"
          @dragover="onFileDragover"
          v-else-if="filteredConcepts?.length"
        >
          <div
            class="drop-mask"
            @drop="onFileDrop"
            @dragover="onFileDragover"
            @dragleave="onFileDragLeave"
            v-if="isDraggingFile"
          >
            {{ $t('concepts.drop_new_concepts') }}
          </div>
          <ul class="items">
            <li
              class="item"
              :class="{
                'selected-item': isSelected(concept)
              }"
              :key="concept.id"
              @click="
                onSelectConcept(concept, $event.ctrlKey || $event.metaKey)
              "
              v-for="concept in filteredConcepts"
            >
              <concept-card :concept="concept" />
            </li>
          </ul>
        </div>
        <div class="has-text-centered mb1 mt1 empty-concepts" v-else>
          <strong>
            {{ $t('concepts.empty') }}
          </strong>
        </div>
        <div class="footer mb2">
          <button-simple
            class="upload-button"
            :disabled="loading.loadingConcepts"
            :text="$t('concepts.add_new_concept')"
            @click="openAddConceptModal"
          />
        </div>
      </div>
    </div>

    <add-preview-modal
      ref="add-preview-modal"
      :active="modals.addConcept"
      :extensions="imgExtensions"
      is-concept
      :is-error="errors.addingConcept"
      :is-loading="loading.addingConcept"
      message=""
      @cancel="closeAddConceptModal"
      @confirm="confirmAddConceptModal"
    />

    <div class="column side-column">
      <task-info entity-type="Concept" :task="currentTask" with-actions />
    </div>
  </div>
</template>

<script>
import assetsStore from '@/store/modules/assets.js'
import { mapGetters, mapActions } from 'vuex'
import { firstBy } from 'thenby'

import { sortByName, sortPeople } from '@/lib/sorting'

import { searchMixin } from '@/components/mixins/search'
import { domMixin } from '@/components/mixins/dom'

import files from '@/lib/files'

import AddPreviewModal from '@/components/modals/AddPreviewModal.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ConceptCard from '@/components/widgets/ConceptCard.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'

export default {
  name: 'concepts',

  mixins: [searchMixin, domMixin],

  components: {
    AddPreviewModal,
    ButtonSimple,
    Combobox,
    ComboboxStatus,
    ConceptCard,
    PeopleField,
    SearchField,
    TableInfo,
    TaskInfo
  },

  data() {
    return {
      imgExtensions: files.IMG_EXTENSIONS_STRING,
      isDraggingFile: false,
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
      'currentProduction',
      'displayedConcepts',
      'isDarkTheme',
      'isTVShow',
      'personMap',
      'selectedConcepts',
      'taskStatusMap'
    ]),

    assetMap() {
      return assetsStore.cache.assetMap
    },

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
        if (this.isTVShow) {
          this.setCurrentEpisode('all') // mandatory to load all assets of a TV show
        }
        await this.loadAssets({ all: true })
        await this.loadConcepts()
      } catch (err) {
        console.error(err)
        this.errors.loadingConcepts = true
      } finally {
        this.loading.loadingConcepts = false
      }
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
    },

    onFileDrop(event) {
      this.pauseEvent(event)
      const files = event.dataTransfer.files
      this.modals.addConcept = true
      this.isDraggingFile = false
      this.$nextTick(() => {
        this.$refs['add-preview-modal'].setFiles(files)
      })
    },

    onFileDragover(event) {
      this.pauseEvent(event)
      this.isDraggingFile = true
    },

    onFileDragLeave() {
      this.isDraggingFile = false
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

  head() {
    return {
      title: `${this.currentProduction.name} | ${this.$t('concepts.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.concepts {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

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
  flex: 1;
  margin: 0 auto;
  position: relative;
  overflow-y: auto;
}

.items {
  cursor: pointer;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  list-style: none;
  margin: 0;

  .item {
    display: flex;
    flex-direction: column;
    background-color: var(--background);
    border-radius: 1em;

    border: 5px solid transparent;
    transition: border-color 0.2s ease-in-out;

    &:hover {
      border-color: var(--background-selectable);
    }

    &.selected-item {
      border-color: var(--background-selected);
    }
  }
}

.page-header {
  margin-top: 0;
  padding: 0;
}

.footer {
  background: transparent;
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: center;
  padding: 5px;

  .button {
    border-radius: 10px;
    font-size: 1.2em;
    height: 50px;
    transition: background-color 0.1s ease-in-out;
    width: 100%;

    &:hover {
      background-color: var(--background-hover);
    }
  }
}

.drop-mask {
  background: rgba(0.1, 0, 0, 0.5);
  border-radius: 0.5em;
  color: white;
  font-size: 2em;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.empty-concepts {
  flex: 1;
}
</style>
