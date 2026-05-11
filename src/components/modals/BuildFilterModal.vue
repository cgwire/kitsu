<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div @click="$emit('cancel')" class="modal-background"></div>

    <div class="modal-content">
      <div class="box content">
        <h1 class="title">
          {{ $t('entities.build_filter.title') }}
        </h1>

        <combobox
          class="flexrow-item"
          :options="unionOptions"
          locale-key-prefix="entities.build_filter."
          v-model="union"
        />

        <h3 class="subtitle" v-if="isAssets">
          {{ $t('entities.build_filter.asset_type') }}
        </h3>

        <div class="flexrow asset-type-filter" v-if="isAssets">
          <combobox
            class="flexrow-item"
            :options="operatorOptions"
            locale-key-prefix="entities.build_filter."
            v-model="assetTypeFilters.operator"
          />
          <combobox
            class="flexrow-item"
            :options="assetTypeOptions"
            v-model="assetTypeFilters.value"
          />
        </div>

        <h3 class="subtitle">
          {{ $t('entities.build_filter.status') }}
        </h3>

        <div
          class="flexrow task-type-filter"
          :key="`task-type-${i}`"
          v-for="(taskTypeFilter, i) in taskTypeFilters.values"
        >
          <combobox-task-type
            class="flexrow-item"
            :task-type-list="taskTypeList"
            v-model="taskTypeFilter.id"
          />
          <combobox
            class="flexrow-item"
            :options="taskTypeOperatorOptions"
            @update:model-value="onTaskTypeOperatorChanged(taskTypeFilter)"
            locale-key-prefix="entities.build_filter."
            v-model="taskTypeFilter.operator"
          />
          <div class="flexrow-item flexrow value-column">
            <combobox-status
              class="flexrow-item"
              :key="`task-type-value-${i}-${index}`"
              :task-status-list="taskStatuses"
              v-model="taskTypeFilter.values[index]"
              v-for="(statusId, index) in taskTypeFilter.values"
            />
            <button-simple
              class="mt05"
              icon="plus"
              @click="addInTaskTypeFilter(taskTypeFilter)"
              v-if="taskTypeFilter.operator === 'in'"
            />
          </div>
          <button-simple
            class="mt05"
            icon="minus"
            @click="removeTaskTypeFilter(taskTypeFilter)"
          />
        </div>
        <div class="add-button">
          <button-simple
            :disabled="!taskTypeList.length"
            icon="plus"
            @click="addTaskTypeFilter"
          />
        </div>

        <div class="mt2" v-if="descriptorOptions.length > 0">
          <h3 class="subtitle">
            {{ $t('entities.build_filter.descriptor') }}
          </h3>

          <div
            class="flexrow descriptor-filter"
            :key="`descriptor-${i}`"
            v-for="(descriptorFilter, i) in validDescriptorFilters"
          >
            <combobox
              class="flexrow-item"
              :options="descriptorOptions"
              @update:model-value="
                filterId => onDescriptorChanged(descriptorFilter, filterId)
              "
              v-model="descriptorFilter.id"
            />

            <combobox
              class="flexrow-item"
              :options="checklistOptions"
              locale-key-prefix="entities.build_filter."
              v-model="descriptorFilter.values[0].checked"
              v-if="descriptorFilter.is_checklist"
            />
            <combobox
              class="flexrow-item"
              :options="booleanOptions"
              locale-key-prefix="entities.build_filter."
              v-model="descriptorFilter.values[0]"
              v-else-if="
                getDescriptor(descriptorFilter.id).data_type === 'boolean'
              "
            />
            <combobox
              class="flexrow-item"
              :options="operatorOptions"
              locale-key-prefix="entities.build_filter."
              @update:model-value="
                operator => onOperatorChanged(operator, descriptorFilter)
              "
              v-model="descriptorFilter.operator"
              v-else
            />

            <div
              class="flexrow-item flexrow value-column"
              v-if="getDescriptor(descriptorFilter.id).data_type !== 'boolean'"
            >
              <template v-for="(value, index) in descriptorFilter.values">
                <metadata-field
                  class="flexrow-item"
                  label=""
                  :descriptor="getDescriptor(descriptorFilter.id)"
                  :entity="{}"
                  :key="`descriptor-value-field-${index}`"
                  v-model="descriptorFilter.values[index]"
                  v-if="getDescriptor(descriptorFilter.id).choices.length === 0"
                />
                <combobox
                  class="flexrow-item"
                  :key="`descriptor-value-combobox-checklist-${index}`"
                  :options="
                    getDescriptorChoiceOptions(
                      descriptorFilter.id,
                      descriptorFilter.is_checklist
                    )
                  "
                  v-model="descriptorFilter.values[index].text"
                  v-else-if="descriptorFilter.is_checklist"
                />
                <combobox
                  class="flexrow-item"
                  :key="`descriptor-value-combobox-${index}`"
                  :options="
                    getDescriptorChoiceOptions(
                      descriptorFilter.id,
                      descriptorFilter.is_checklist
                    )
                  "
                  v-model="descriptorFilter.values[index]"
                  v-else
                />
              </template>
              <button-simple
                class="mt05"
                icon="plus"
                @click="addInDescriptorFilter(descriptorFilter)"
                v-if="descriptorFilter.operator === 'in'"
              />
            </div>
            <button-simple
              class="mt05"
              icon="minus"
              @click="removeDescriptorFilter(descriptorFilter)"
            />
          </div>
          <div class="add-button">
            <button-simple icon="plus" @click="addDescriptorFilter" />
          </div>
        </div>

        <h3 class="subtitle" v-if="!isCurrentUserVendor">
          {{ $t('entities.build_filter.assignation') }}
        </h3>

        <div class="flexrow assignation-filter" v-if="!isCurrentUserVendor">
          <combobox
            class="flexrow-item"
            :options="assignation.options"
            locale-key-prefix="entities.build_filter."
            v-model="assignation.value"
          />

          <div class="flexcolumn">
            <template
              v-if="['assignedto', '-assignedto'].includes(assignation.value)"
            >
              <people-field
                class="flexrow-item"
                :people="team"
                v-model="assignation.person"
              />
              <span class="flexrow-item mt05 mb05">
                {{ $t('main.on') }}
              </span>
            </template>

            <combobox-task-type
              class="flexrow-item"
              :task-type-list="
                ['assigned', 'unassigned'].includes(assignation.value)
                  ? taskTypeList
                  : taskTypeListWithAll
              "
              v-model="assignation.taskTypeId"
              v-if="
                [
                  'assigned',
                  'unassigned',
                  'assignedto',
                  '-assignedto'
                ].includes(assignation.value)
              "
            />
          </div>
        </div>

        <h3 class="subtitle">
          {{ $t('entities.build_filter.thumbnail') }}
        </h3>

        <combobox
          :options="hasThumbnail.options"
          locale-key-prefix="entities.build_filter."
          v-model="hasThumbnail.value"
        />

        <h3 class="subtitle flexrow-item mt2">
          {{ $t('task_types.fields.priority') }}
        </h3>
        <div class="flexrow">
          <combobox-task-type
            class="flexrow-item"
            :task-type-list="taskTypeListWithAll"
            open-top
            v-model="priority.taskTypeId"
          />
          <combobox-styled
            class="flexrow-item"
            :options="priorityOptions"
            locale-key-prefix="tasks."
            v-model="priority.value"
            v-show="priority.taskTypeId !== ''"
          />
        </div>
        <h3 class="subtitle flexrow-item mt2" v-if="isAssets && !isAssetsOnly">
          {{ $t('assets.fields.ready_for') }}
        </h3>
        <div class="flexrow" v-if="isAssets && !isAssetsOnly">
          <combobox-task-type
            class="flexrow-item"
            :task-type-list="readyForTaskTypeList"
            open-top
            v-model="readyFor.taskTypeId"
          />
        </div>

        <h3 class="subtitle flexrow-item mt2" v-if="isShots">
          {{ $t('entities.build_filter.is_assets_ready') }}
        </h3>
        <div class="flexrow" v-if="isShots">
          <combobox-task-type
            class="flexrow-item"
            :task-type-list="taskTypeList"
            open-top
            v-model="isAssetsReady.taskTypeId"
          />

          <combobox
            class="flexrow-item"
            :options="isAssetsReady.options"
            locale-key-prefix="entities.build_filter."
            v-model="isAssetsReady.value"
          />
        </div>

        <modal-footer
          :error-text="$t('entities.thumbnails.error')"
          @confirm="applyFilter"
          @cancel="$emit('cancel')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { v4 as uuidv4 } from 'uuid'
import { computed, onMounted, reactive, ref, toRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { getDescriptorChecklistValues } from '@/components/mixins/descriptors'
import { useModal } from '@/composables/modal'
import { getFilters } from '@/lib/filtering'
import { sortPeople } from '@/lib/sorting'

import ModalFooter from '@/components/modals/ModalFooter.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import MetadataField from '@/components/widgets/MetadataField.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'

const { t } = useI18n()
const store = useStore()

const props = defineProps({
  active: { type: Boolean, default: false },
  entityType: { type: String, default: 'asset' }
})

const emit = defineEmits(['cancel', 'confirm'])

useModal(toRef(props, 'active'), emit)

// Static option arrays — extracted from data() at module scope so
// they're not needlessly reactive.

const operatorOptions = [
  { label: 'equal', value: '=' },
  { label: 'not_equal', value: '=-' },
  { label: 'in', value: 'in' }
]
const taskTypeOperatorOptions = operatorOptions
const booleanOptions = [
  { label: 'checked', value: 'true' },
  { label: 'not_checked', value: '-true' }
]
const checklistOptions = [
  { label: 'checked', value: true },
  { label: 'not_checked', value: false }
]
const unionOptions = [
  { label: 'union_and', value: 'and' },
  { label: 'union_or', value: 'or' }
]
const priorityOptions = [
  { label: 'priority.normal', value: '0' },
  { label: 'priority.high', value: '1' },
  { label: 'priority.very_high', value: '2' },
  { label: 'priority.emergency', value: '3' }
]

// State

const assetTypeFilters = reactive({ operator: '=', value: '' })
const assignation = reactive({
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
})
const hasThumbnail = reactive({
  value: 'nofilter',
  options: [
    { label: 'no_filter', value: 'nofilter' },
    { label: 'with_thumbnail', value: 'withthumbnail' },
    { label: 'without_thumbnail', value: '-withthumbnail' }
  ]
})
const priority = reactive({ taskTypeId: '', value: '-1' })
const readyFor = reactive({ taskTypeId: '' })
const isAssetsReady = reactive({
  value: 'nofilter',
  taskTypeId: '',
  options: [
    { label: 'no_filter', value: 'nofilter' },
    { label: 'assets_ready', value: 'assetsready' },
    { label: 'assets_not_ready', value: '-assetsready' }
  ]
})
const metadataDescriptorFilters = reactive({ values: [] })
const taskTypeFilters = reactive({ values: [] })
const union = ref('and')

// Computed

const assetMetadataDescriptors = computed(
  () => store.getters.assetMetadataDescriptors
)
const assetTypeMap = computed(() => store.getters.assetTypeMap)
const assetSearchText = computed(() => store.getters.assetSearchText)
const assetValidationColumns = computed(
  () => store.getters.assetValidationColumns
)
const currentProduction = computed(() => store.getters.currentProduction)
const editSearchText = computed(() => store.getters.editSearchText)
const editMetadataDescriptors = computed(
  () => store.getters.editMetadataDescriptors
)
const editValidationColumns = computed(
  () => store.getters.editValidationColumns
)
const episodeSearchText = computed(() => store.getters.episodeSearchText)
const episodeMetadataDescriptors = computed(
  () => store.getters.episodeMetadataDescriptors
)
const episodeValidationColumns = computed(
  () => store.getters.episodeValidationColumns
)
const isCurrentUserVendor = computed(() => store.getters.isCurrentUserVendor)
const people = computed(() => store.getters.people)
const personMap = computed(() => store.getters.personMap)
const productionAssetTypes = computed(() => store.getters.productionAssetTypes)
const productionTaskStatuses = computed(
  () => store.getters.productionTaskStatuses
)
const productionTaskTypes = computed(() => store.getters.productionTaskTypes)
const productionShotTaskTypes = computed(
  () => store.getters.productionShotTaskTypes
)
const sequenceSearchText = computed(() => store.getters.sequenceSearchText)
const sequenceMetadataDescriptors = computed(
  () => store.getters.sequenceMetadataDescriptors
)
const sequenceValidationColumns = computed(
  () => store.getters.sequenceValidationColumns
)
const shotMetadataDescriptors = computed(
  () => store.getters.shotMetadataDescriptors
)
const shotSearchText = computed(() => store.getters.shotSearchText)
const shotValidationColumns = computed(
  () => store.getters.shotValidationColumns
)
const taskTypeMap = computed(() => store.getters.taskTypeMap)
const taskStatusMap = computed(() => store.getters.taskStatusMap)

const isAssets = computed(() => props.entityType === 'asset')
const isShots = computed(() => props.entityType === 'shot')
const isAssetsOnly = computed(
  () => currentProduction.value?.production_type === 'assets'
)

const taskStatuses = computed(() =>
  productionTaskStatuses.value.filter(status => !status.for_concept)
)

const validationColumnsByEntity = {
  asset: assetValidationColumns,
  edit: editValidationColumns,
  episode: episodeValidationColumns,
  sequence: sequenceValidationColumns,
  shot: shotValidationColumns
}

const metadataDescriptorsByEntity = {
  asset: assetMetadataDescriptors,
  edit: editMetadataDescriptors,
  episode: episodeMetadataDescriptors,
  sequence: sequenceMetadataDescriptors,
  shot: shotMetadataDescriptors
}

const searchTextByEntity = {
  asset: assetSearchText,
  edit: editSearchText,
  episode: episodeSearchText,
  sequence: sequenceSearchText,
  shot: shotSearchText
}

const taskTypeList = computed(() =>
  validationColumnsByEntity[props.entityType].value.map(taskTypeId =>
    taskTypeMap.value.get(taskTypeId)
  )
)

const taskTypeListWithAll = computed(() => [
  { id: '', color: '#999', name: t('main.all') },
  ...taskTypeList.value
])

const readyForTaskTypeList = computed(() => [
  { id: '', color: '#999', name: t('news.all') },
  ...productionShotTaskTypes.value
])

const team = computed(() =>
  sortPeople(
    currentProduction.value?.team
      .map(personId => personMap.value.get(personId))
      .filter(person => person && !person.is_bot) ?? []
  )
)

const metadataDescriptors = computed(
  () => metadataDescriptorsByEntity[props.entityType].value
)

const descriptorOptions = computed(() =>
  metadataDescriptors.value.map(descriptor => ({
    label: descriptor.name,
    value: descriptor.id
  }))
)

const assetTypeOptions = computed(() => [
  { label: t('entities.build_filter.all_types'), value: '-' },
  ...productionAssetTypes.value
    .filter(assetType => assetType !== undefined)
    .map(assetType => ({ label: assetType.name, value: assetType.id }))
])

const getDescriptor = descriptorId =>
  metadataDescriptors.value.find(d => d.id === descriptorId)

const validDescriptorFilters = computed(() =>
  metadataDescriptorFilters.values.filter(descriptor =>
    getDescriptor(descriptor.id)
  )
)

// Functions

const getDescriptorChoiceOptions = (descriptorId, isChecklist) => {
  const descriptor = getDescriptor(descriptorId)
  if (!isChecklist) {
    return descriptor.choices.map(choice => ({ label: choice, value: choice }))
  }
  return getDescriptorChecklistValues(descriptor).map(choice => ({
    label: choice.text,
    value: choice.text
  }))
}

const applyAssetTypeChoice = query => {
  const value = assetTypeFilters.value
  if (value && value !== '-') {
    let operator = '=['
    if (assetTypeFilters.operator === '=-') operator = '=[-'
    const assetType = assetTypeMap.value.get(value)
    query += ` type${operator}${assetType.name}]`
  }
  return query
}

const applyTaskTypeChoice = query => {
  taskTypeFilters.values.forEach(taskTypeFilter => {
    let operator = '=['
    if (taskTypeFilter.operator === '=-') operator = '=[-'
    const taskType = taskTypeMap.value.get(taskTypeFilter.id)
    const value = taskTypeFilter.values
      .map(statusId => taskStatusMap.value.get(statusId).short_name)
      .join(',')
    query += ` [${taskType.name}]${operator}${value}]`
  })
  return query
}

const applyDescriptorChoice = query => {
  validDescriptorFilters.value.forEach(descriptorFilter => {
    let operator = '=['
    let value
    if (descriptorFilter.is_checklist) {
      value = descriptorFilter.values[0].text
      value += descriptorFilter.values[0].checked ? ':true' : ':false'
    } else {
      if (descriptorFilter.operator === '=-') operator = '=[-'
      const values = descriptorFilter.values
      if (values.length === 0 || values[0] === '') {
        const options = getDescriptorChoiceOptions(
          descriptorFilter.id,
          descriptorFilter.is_checklist
        )
        value = options[0]?.value ?? ''
      } else {
        value = descriptorFilter.values.join(',')
      }
    }
    const descriptor = getDescriptor(descriptorFilter.id)
    query += ` [${descriptor.name}]${operator}${value}]`
  })
  return query
}

const applyAssignationChoice = query => {
  if (assignation.value !== 'nofilter') {
    if (assignation.person) {
      let value = assignation.person.name
      const taskType = taskTypeMap.value.get(assignation.taskTypeId)
      if (assignation.value === '-assignedto') value = `-${value}`
      if (taskType) {
        query += ` assignedto[${taskType.name}]=[${value}]`
      } else {
        query += ` assignedto[]=[${value}]`
      }
    } else if (assignation.taskTypeId) {
      const taskType = taskTypeMap.value.get(assignation.taskTypeId)
      const value = assignation.value === 'assigned' ? 'assigned' : 'unassigned'
      query += ` [${taskType.name}]=${value}`
    }
  }
  return query
}

const applyThumbnailChoice = query => {
  if (hasThumbnail.value !== 'nofilter') {
    query += ` ${hasThumbnail.value}`
  }
  return query
}

const applyPriorityChoice = query => {
  if (priority.taskTypeId !== '' && priority.value !== '-1') {
    const taskType = taskTypeMap.value.get(priority.taskTypeId)
    query += ` priority-[${taskType.name.toLowerCase()}]=${priority.value}`
  }
  return query
}

const applyReadyForChoice = query => {
  if (readyFor.taskTypeId !== '') {
    const taskType = taskTypeMap.value.get(readyFor.taskTypeId)
    query += ` readyfor=[${taskType.name.toLowerCase()}]`
  }
  return query
}

const applyAssetsReadyChoice = query => {
  if (isAssetsReady.value !== 'nofilter') {
    if (isAssetsReady.taskTypeId.length === 0) {
      isAssetsReady.taskTypeId = taskTypeList.value[0].id
    }
    const taskType = taskTypeMap.value.get(isAssetsReady.taskTypeId)
    const operator = isAssetsReady.value === 'assetsready' ? '' : '-'
    query += ` assetsready=[${operator}${taskType.name}]`
  }
  return query
}

const applyUnionChoice = query => {
  if (union.value === 'or') {
    query = `+(${query.trim()})`
  }
  return query
}

const buildFilter = () => {
  let query = ''
  query = applyAssetTypeChoice(query)
  query = applyTaskTypeChoice(query)
  query = applyDescriptorChoice(query)
  query = applyAssignationChoice(query)
  query = applyThumbnailChoice(query)
  query = applyPriorityChoice(query)
  query = applyReadyForChoice(query)
  query = applyAssetsReadyChoice(query)
  query = applyUnionChoice(query)
  return query.trim()
}

const applyFilter = () => {
  emit('confirm', buildFilter())
}

// Task types

const addTaskTypeFilter = () => {
  const filter = {
    localId: uuidv4(),
    id: taskTypeList.value[0].id,
    operator: '=',
    values: [taskStatuses.value[0].id]
  }
  taskTypeFilters.values.push(filter)
  return filter
}

const addInTaskTypeFilter = taskTypeFilter => {
  taskTypeFilter.values.push(taskStatuses.value[0].id)
}

const removeTaskTypeFilter = taskTypeFilter => {
  taskTypeFilters.values = taskTypeFilters.values.filter(
    f => f.localId !== taskTypeFilter.localId
  )
}

const addInDescriptorFilter = descriptorFilter => {
  const descriptor = getDescriptor(descriptorFilter.id)
  const value = descriptor.choices.length ? descriptor.choices[0] : ''
  descriptorFilter.values.push(value)
}

// Descriptors

const onDescriptorChanged = (descriptorFilter, filter) => {
  const descriptor = getDescriptor(filter)
  descriptorFilter.is_checklist = false
  if (descriptor.choices.length > 0) {
    const checklistValues = getDescriptorChecklistValues(descriptor)
    if (checklistValues.length > 0) {
      descriptorFilter.is_checklist = true
      descriptorFilter.values = [checklistValues[0]]
      descriptorFilter.operator = '='
    } else {
      descriptorFilter.values = [descriptor.choices[0]]
    }
  } else if (descriptor.data_type === 'boolean') {
    descriptorFilter.values = ['-true']
  } else {
    descriptorFilter.values = ['']
  }
}

const addDescriptorFilter = () => {
  const descriptor = getDescriptor(descriptorOptions.value[0].value)
  const values = []
  let isChecklist = false
  if (descriptor.choices.length > 0) {
    const checklistValues = getDescriptorChecklistValues(descriptor)
    if (checklistValues.length > 0) {
      isChecklist = true
      values.push({ ...checklistValues[0], checked: true })
    } else {
      values.push(descriptor.choices[0])
    }
  } else if (descriptor.data_type === 'boolean') {
    values.push('-true')
  } else {
    values.push('')
  }
  const filter = {
    localId: uuidv4(),
    id: descriptorOptions.value[0].value,
    operator: '=',
    values,
    is_checklist: isChecklist
  }
  metadataDescriptorFilters.values.push(filter)
  return filter
}

const removeDescriptorFilter = descriptorFilter => {
  metadataDescriptorFilters.values = metadataDescriptorFilters.values.filter(
    f => f.localId !== descriptorFilter.localId
  )
}

const onOperatorChanged = (operator, descriptorFilter) => {
  if (operator !== 'in') {
    descriptorFilter.values = [descriptorFilter.values[0]]
  }
}

// Helpers to set filters from search query

const setFiltersFromAssetTypeQuery = filter => {
  assetTypeFilters.operator = filter.excluding ? '=-' : '='
  assetTypeFilters.value = filter.assetType.id
}

const setFiltersFromStatusQuery = filter => {
  let operator = '='
  if (filter.taskStatuses.length > 1) operator = 'in'
  else if (filter.excluding) operator = '=-'
  taskTypeFilters.values.push({
    localId: uuidv4(),
    id: filter.taskType.id,
    operator,
    values: filter.taskStatuses
  })
}

const setFiltersFromDescriptorQuery = filter => {
  let operator = '='
  let isChecklist = false
  let values = filter.values
  if (filter.values.length > 1) {
    operator = 'in'
  } else {
    if (filter.values[0].endsWith(':true')) {
      isChecklist = true
      values = [{ text: filter.values[0].replace(/:true$/, ''), checked: true }]
    } else if (filter.values[0].endsWith(':false')) {
      isChecklist = true
      values = [
        { text: filter.values[0].replace(/:false$/, ''), checked: false }
      ]
    } else if (filter.excluding) {
      if (filter.descriptor.data_type === 'boolean') {
        values = [`-${filter.values[0]}`]
      } else {
        operator = '=-'
      }
    }
  }
  metadataDescriptorFilters.values.push({
    localId: uuidv4(),
    id: filter.descriptor.id,
    operator,
    values,
    is_checklist: isChecklist
  })
}

const setFiltersFromAssignationQuery = filter => {
  assignation.value = filter.assigned ? 'assigned' : 'unassigned'
  assignation.taskTypeId = filter.taskType.id
}

const setFiltersFromAssignedToQuery = filter => {
  assignation.value = filter.excluding ? '-assignedto' : 'assignedto'
  assignation.person = people.value.find(p => p.id === filter.personIds[0])
  assignation.taskTypeId = filter.taskType?.id
}

const setFiltersFromThumbnailQuery = filter => {
  hasThumbnail.value = filter.excluding ? '-withthumbnail' : 'withthumbnail'
}

const setFiltersFromPriorityQuery = filter => {
  priority.taskTypeId = filter.taskTypeId
  priority.value = String(filter.value)
}

const setFiltersFromReadyForQuery = filter => {
  readyFor.taskTypeId = filter.value
}

const setFiltersFromAssetsReadyQuery = filter => {
  isAssetsReady.taskTypeId = filter.value
  isAssetsReady.value = filter.excluding ? '-assetsready' : 'assetsready'
}

const setUnion = () => {
  union.value = 'or'
}

const filterDispatchByType = {
  assettype: setFiltersFromAssetTypeQuery,
  status: setFiltersFromStatusQuery,
  descriptor: setFiltersFromDescriptorQuery,
  assignation: setFiltersFromAssignationQuery,
  assignedto: setFiltersFromAssignedToQuery,
  thumbnail: setFiltersFromThumbnailQuery,
  priority: setFiltersFromPriorityQuery,
  readyfor: setFiltersFromReadyForQuery,
  assetsready: setFiltersFromAssetsReadyQuery
}

const setFiltersFromCurrentQuery = () => {
  const searchQuery = searchTextByEntity[props.entityType]?.value
  if (!searchQuery) return
  const filters = getFilters({
    entryIndex: [],
    assetTypes: productionAssetTypes.value,
    taskTypes: productionTaskTypes.value,
    taskStatuses: taskStatuses.value,
    descriptors: metadataDescriptors.value,
    persons: people.value,
    query: searchQuery
  })
  filters.forEach(filter => {
    filterDispatchByType[filter.type]?.(filter)
  })
  if (filters.union) setUnion()
}

const onTaskTypeOperatorChanged = taskTypeFilter => {
  if (taskTypeFilter.operator !== 'in') {
    taskTypeFilter.values = [taskTypeFilter.values[0]]
  }
}

const reset = () => {
  assignation.value = 'nofilter'
  assignation.person = null
  assignation.taskTypeId = ''
  hasThumbnail.value = 'nofilter'
  metadataDescriptorFilters.values = []
  taskTypeFilters.values = []
  assetTypeFilters.operator = '='
  assetTypeFilters.value = '-'
}

// Watchers

watch(
  () => props.active,
  active => {
    if (!active) return
    reset()
    assignation.taskTypeId =
      taskTypeList.value.length > 0 ? taskTypeList.value[0].id : ''
    readyFor.taskTypeId = ''
    priority.taskTypeId = ''
    priority.value = '0'
    setFiltersFromCurrentQuery()
  }
)

// Lifecycle

onMounted(() => {
  reset()
  setFiltersFromCurrentQuery()
})

// Exposed for unit tests

defineExpose({
  assetTypeFilters,
  assignation,
  hasThumbnail,
  metadataDescriptorFilters,
  taskTypeFilters,
  union,
  isAssets,
  taskTypeList,
  team,
  descriptorOptions,
  metadataDescriptors,
  applyFilter,
  buildFilter,
  setFiltersFromCurrentQuery,
  addTaskTypeFilter,
  removeTaskTypeFilter,
  addDescriptorFilter,
  removeDescriptorFilter,
  getDescriptorChoiceOptions
})
</script>

<style lang="scss" scoped>
.modal-content {
  max-height: calc(100vh - 7rem);
  margin-top: 3rem;
}

.add-button button {
  margin-left: 0;
}

.content h3:not(:first-child) {
  margin-top: 2.5em;
}

.subtitle {
  color: $grey;
  font-weight: 500;
  font-size: 1em;
  margin-bottom: 0.5em;
  margin-left: 0.1em;
  text-transform: uppercase;
}

.task-type-filter,
.descriptor-filter {
  margin-bottom: 0.3em;
  align-items: flex-start;
}

.value-column {
  flex-direction: column;
  align-items: flex-start;
}

.assignation-filter {
  align-items: flex-start;

  input {
    line-height: 30px;
  }
}

@media screen and (max-width: 768px) {
  .modal-content {
    margin: 1rem 0.5rem;
    max-height: calc(100vh - 2rem);
    width: auto;
  }

  .box {
    padding: 1.5em;
  }

  .title {
    font-size: 1.5em;
  }

  .task-type-filter,
  .descriptor-filter,
  .assignation-filter,
  .asset-type-filter {
    flex-wrap: wrap;
  }

  .value-column {
    width: 100%;
  }
}
</style>
