<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div @click="$emit('cancel')" class="modal-background"></div>

  <div class="modal-content">
    <div class="box content">
      <h1 class="title">
        {{ $t('entities.build_filter.title') }}
      </h1>

      <h3 class="subtitle">
        {{ $t('entities.build_filter.status') }}
      </h3>

      <div
        class="flexrow task-type-filter"
        :key="'task-type-' + i"
        v-for="(taskTypeFilter, i) in taskTypeFilters.values"
      >
        <combobox-task-type
          class="flexrow-item"
          :task-type-list="taskTypeList"
          v-model="taskTypeFilter.id"
        />
        <combobox
          class="flexrow-item"
          :options="general.operatorOptions"
          locale-key-prefix="entities.build_filter."
          v-model="taskTypeFilter.operator"
        />
        <combobox-status
          class="flexrow-item"
          :task-status-list="taskStatus"
          v-model="taskTypeFilter.statusId"
        />
        <button-simple
          icon="minus"
          @click="removeTaskTypeFilter(taskTypeFilter)"
        />
      </div>
      <div class="add-button">
        <button-simple
          icon="plus"
          @click="addTaskTypeFilter"
        />
      </div>

      <div v-if="descriptorOptions.length > 0">
        <h3 class="subtitle">
          {{ $t('entities.build_filter.descriptor') }}
        </h3>

        <div
          class="flexrow descriptor-filter"
          :key="'desc-' + i"
          v-for="(descriptorFilter, i) in metadataDescriptorFilters.values"
        >
          <combobox
            class="flexrow-item"
            :options="descriptorOptions"
            v-model="descriptorFilter.id"
          />
          <combobox
            class="flexrow-item"
            :options="general.operatorOptions"
            locale-key-prefix="entities.build_filter."
            v-model="descriptorFilter.operator"
          />
          <text-field
            class="flexrow-item"
            input-class=" thin"
            v-model="descriptorFilter.text"
            v-if="getDescriptor(descriptorFilter.id).choices.length === 0"
          />
          <combobox
            class="flexrow-item"
            :options="getDescriptorChoiceOptions(descriptorFilter.id)"
            v-model="descriptorFilter.text"
            v-else
          />
          <button-simple
            icon="minus"
            @click="removeDescriptorFilter(descriptorFilter)"
          />
        </div>
        <div class="add-button">
          <button-simple
            icon="plus"
            @click="addDescriptorFilter"
          />
        </div>
      </div>

      <h3 class="subtitle" v-if="!isCurrentUserVendor">
        {{ $t('entities.build_filter.assignation') }}
      </h3>

      <div class="flexrow" v-if="!isCurrentUserVendor">
        <combobox
          class="flexrow-item"
          :options="assignation.options"
          locale-key-prefix="entities.build_filter."
          v-model="assignation.value"
        />

        <combobox-task-type
          class="flexrow-item"
          :task-type-list="taskTypeList"
          v-model="assignation.taskTypeId"
          v-if="['assigned', 'unassigned'].includes(assignation.value)"
        />

        <people-field
          class="flexrow-item"
          :people="team"
          v-model="assignation.person"
          v-if="['assignedto', '-assignedto'].includes(assignation.value)"
        />
      </div>

      <h3 class="subtitle">
        {{ $t('entities.build_filter.thumbnail') }}
      </h3>

      <combobox
        :options="hasThumbnail.options"
        locale-key-prefix="entities.build_filter."
        v-model="hasThumbnail.value"
      />

      <modal-footer
        :error-text="$t('entities.thumbnails.error')"
        @confirm="applyFilter"
        @cancel="$emit('cancel')"
      />
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from './base_modal'
import { getFilters } from '../../lib/filtering'

import ButtonSimple from '../widgets/ButtonSimple'
import Combobox from '../widgets/Combobox'
import ComboboxStatus from '../widgets/ComboboxStatus'
import ComboboxTaskType from '../widgets/ComboboxTaskType'
import ModalFooter from './ModalFooter'
import PeopleField from '../widgets/PeopleField'
import TextField from '../widgets/TextField'

export default {
  name: 'build-filter-modal',
  mixins: [modalMixin],

  components: {
    ButtonSimple,
    Combobox,
    ComboboxStatus,
    ComboboxTaskType,
    ModalFooter,
    PeopleField,
    TextField
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    entityType: {
      type: String,
      default: 'asset'
    }
  },

  data () {
    return {
      assignation: {
        person: null,
        taskTypeId: '',
        value: 'nofilter',
        options: [
          { label: 'no_filter', value: 'nofilter' },
          { label: 'assigned_to', value: 'assignedto' },
          { label: 'not_assigned_to', value: '-assignedto' },
          { label: 'assignation_exists_for', value: 'assigned' },
          { label: 'no_assignation_for', value: 'unassigned' }
        ]
      },
      general: {
        operatorOptions: [
          { label: 'equal', value: '=' },
          { label: 'not_equal', value: '=-' }
        ]
      },
      hasThumbnail: {
        value: 'nofilter',
        options: [
          { label: 'no_filter', value: 'nofilter' },
          { label: 'with_thumbnail', value: 'withthumbnail' },
          { label: 'without_thumbnail', value: '-withthumbnail' }
        ]
      },
      metadataDescriptorFilters: {
        values: []
      },
      taskTypeFilters: {
        values: []
      }
    }
  },

  mounted () {
    this.reset()
    this.setFiltersFromCurrentQuery()
  },

  computed: {
    ...mapGetters([
      'assetMetadataDescriptors',
      'assetSearchText',
      'assetValidationColumns',
      'currentProduction',
      'isCurrentUserVendor',
      'people',
      'personMap',
      'shotMetadataDescriptors',
      'shotSearchText',
      'shotValidationColumns',
      'taskTypes',
      'taskTypeMap',
      'taskStatus',
      'taskStatusMap'
    ]),

    isAssets () {
      return this.entityType === 'asset'
    },

    taskTypeList () {
      if (this.isAssets) {
        return this.assetValidationColumns
          .map((taskTypeId) => this.taskTypeMap[taskTypeId])
      } else {
        return this.shotValidationColumns
          .map((taskTypeId) => this.taskTypeMap[taskTypeId])
      }
    },

    team () {
      return this.currentProduction.team.map(pId => this.personMap[pId])
    },

    descriptorOptions () {
      return this.metadataDescriptors.map(descriptor => ({
        label: descriptor.name,
        value: descriptor.id
      }))
    },

    metadataDescriptors () {
      let descriptors = this.shotMetadataDescriptors
      if (this.isAssets) descriptors = this.assetMetadataDescriptors
      return descriptors
    }
  },

  methods: {
    ...mapActions([
    ]),

    // Build filter

    applyFilter () {
      const query = this.buildFilter()
      this.$emit('confirm', query)
    },

    buildFilter () {
      let query = ''
      query = this.applyTaskTypeChoice(query)
      query = this.applyDescriptorChoice(query)
      query = this.applyAssignationChoice(query)
      query = this.applyThumbnailChoice(query)
      return query.trim()
    },

    applyTaskTypeChoice (query) {
      this.taskTypeFilters.values.forEach((taskTypeFilter) => {
        let operator = '=['
        if (taskTypeFilter.operator === '=-') operator = '=[-'
        const taskType = this.getTaskType(taskTypeFilter.id)
        const taskStatus = this.taskStatusMap[taskTypeFilter.statusId]
        query += ` [${taskType.name}]${operator}${taskStatus.short_name}]`
      })
      return query
    },

    applyDescriptorChoice (query) {
      this.metadataDescriptorFilters.values.forEach((descriptorFilter) => {
        const operator = descriptorFilter.operator
        const desc = this.getDescriptor(descriptorFilter.id)
        query += ` [${desc.name}]${operator}${descriptorFilter.text}`
      })
      return query
    },

    applyAssignationChoice (query) {
      if (this.assignation.value !== 'nofilter') {
        if (this.assignation.person) {
          let value = this.assignation.person.name
          if (this.assignation.value === '-assignedto') value = `-${value}`
          query += ` assignedto=[${value}]`
        }
        if (this.assignation.taskTypeId) {
          const taskType = this.taskTypeMap[this.assignation.taskTypeId]
          const value =
            this.assignation.value === 'assigned' ? 'assigned' : 'unassigned'
          query += ` [${taskType.name}]=${value}`
        }
      }
      return query
    },

    applyThumbnailChoice (query) {
      if (this.hasThumbnail.value !== 'nofilter') {
        query += ` ${this.hasThumbnail.value}`
      }
      return query
    },

    // Task types

    addTaskTypeFilter () {
      const filter = {
        id: this.taskTypeList[0].id,
        operator: '=',
        statusId: this.taskStatus[0].id
      }
      this.taskTypeFilters.values.push(filter)
      return filter
    },

    removeTaskTypeFilter (taskTypeFilter) {
      this.taskTypeFilters.values =
        this.taskTypeFilters.values.filter(f => f !== taskTypeFilter)
    },

    getTaskType (taskTypeId) {
      return this.taskTypeMap[taskTypeId]
    },

    // Descriptors

    addDescriptorFilter () {
      const desc = this.getDescriptor(this.descriptorOptions[0].value)
      const filter = {
        id: this.descriptorOptions[0].value,
        operator: '=',
        text: desc.choices.length > 0 ? desc.choices[0] : ''
      }
      this.metadataDescriptorFilters.values.push(filter)
      return filter
    },

    removeDescriptorFilter (descriptorFilter) {
      this.metadataDescriptorFilters.values =
        this.metadataDescriptorFilters.values.filter(
          f => f !== descriptorFilter
        )
    },

    getDescriptor (descriptorId) {
      return this.metadataDescriptors.find(d => d.id === descriptorId)
    },

    getDescriptorChoiceOptions (descriptorId) {
      return this.getDescriptor(descriptorId)
        .choices
        .map(choice => ({ label: choice, value: choice }))
    },

    // Helpers to set filters from search query

    setFiltersFromCurrentQuery () {
      const searchQuery =
        this.isAssets ? this.assetSearchText : this.shotSearchText
      if (searchQuery) {
        const filters = getFilters(
          [], // entry list is not needed,
          this.taskTypes,
          this.taskStatus,
          this.metadataDescriptors,
          this.people,
          searchQuery
        )
        filters.forEach((filter) => {
          if (filter.type === 'status') {
            this.setFiltersFromStatusQuery(filter)
          } if (filter.type === 'descriptor') {
            this.setFiltersFromDescriptorQuery(filter)
          } if (filter.type === 'assignation') {
            this.setFiltersFromAssignationQuery(filter)
          } else if (filter.type === 'assignedto') {
            this.setFiltersFromAssignedToQuery(filter)
          } else if (filter.type === 'thumbnail') {
            this.setFiltersFromThumbnailQuery(filter)
          }
        })
      }
    },

    setFiltersFromStatusQuery (filter) {
      this.taskTypeFilters.values.push({
        id: filter.taskType.id,
        operator: filter.excluding ? '=-' : '=',
        statusId: filter.taskStatus.id
      })
    },

    setFiltersFromDescriptorQuery (filter) {
      this.metadataDescriptorFilters.values.push({
        id: filter.descriptor.id,
        operator: filter.excluding ? '=-' : '=',
        text: filter.value
      })
    },

    setFiltersFromAssignationQuery (filter) {
      if (filter.assigned) {
        this.assignation.value = 'assigned'
      } else {
        this.assignation.value = 'unassigned'
      }
      this.assignation.taskTypeId = filter.taskType.id
    },

    setFiltersFromAssignedToQuery (filter) {
      this.assignation.value = filter.excluding ? '-assignedto' : 'assignedto'
      this.assignation.person = this.people.find(p => p.id === filter.personId)
    },

    setFiltersFromThumbnailQuery (filter) {
      if (filter.excluding) {
        this.hasThumbnail.value = '-withthumbnail'
      } else {
        this.hasThumbnail.value = 'withthumbnail'
      }
    },

    // General

    reset () {
      this.assignation.value = 'nofilter'
      this.assignation.person = null
      this.assignation.taskType = ''
      this.hasThumbnail.value = 'nofilter'
      this.metadataDescriptorFilters.values = []
      this.taskTypeFilters.values = []
    }
  },

  watch: {
    active () {
      if (this.active) {
        this.reset()
        this.assignation.taskTypeId = this.taskTypeList[0].id
        this.setFiltersFromCurrentQuery()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-content {
  max-height: calc(100vh - 7rem);
  margin-top: 3rem;
}

.add-button button {
  margin-left: 0;
}

.subtitle {
  color: $grey;
  font-size: 1em;
  margin-top: 1.1em;
  text-transform: uppercase;
  margin-bottom: 0.5em;
  margin-left: 0.1em;
}

.field {
  margin-top: 0;
  margin-bottom: 0;
}

.task-type-filter,
.descriptor-filter {
  margin-bottom: 0.3em;

  .descriptor-text-value {
    padding: 0;
  }
}
</style>
