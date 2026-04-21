<template>
  <div class="project-template-settings fixed-page" v-if="template">
    <div class="wrapper">
      <div class="flexrow back-row">
        <router-link
          class="flexrow-item back-link"
          :to="{ name: 'project-templates' }"
        >
          &larr; {{ $t('project_templates.title') }}
        </router-link>
      </div>

      <h2 class="template-name">{{ template.name }}</h2>

      <div class="tabs">
        <ul>
          <li :class="{ 'is-active': isActiveTab('parameters') }">
            <a @click="activeTab = 'parameters'">
              {{ $t('productions.parameters.title') }}
            </a>
          </li>
          <li :class="{ 'is-active': isActiveTab('metadataDescriptors') }">
            <a @click="activeTab = 'metadataDescriptors'">
              {{ $t('project_templates.tabs.metadata_descriptors') }}
            </a>
          </li>
          <li :class="{ 'is-active': isActiveTab('assetTypes') }">
            <a @click="activeTab = 'assetTypes'">
              {{ $t('asset_types.title') }}
            </a>
          </li>
          <li :class="{ 'is-active': isActiveTab('taskTypes') }">
            <a @click="activeTab = 'taskTypes'">
              {{ $t('task_types.title') }}
            </a>
          </li>
          <li :class="{ 'is-active': isActiveTab('taskStatuses') }">
            <a @click="activeTab = 'taskStatuses'">
              {{ $t('task_status.title') }}
            </a>
          </li>
          <li :class="{ 'is-active': isActiveTab('board') }">
            <a @click="activeTab = 'board'">
              {{ $t('board.settings.title') }}
            </a>
          </li>
          <li :class="{ 'is-active': isActiveTab('statusAutomations') }">
            <a @click="activeTab = 'statusAutomations'">
              {{ $t('status_automations.title') }}
            </a>
          </li>
          <li :class="{ 'is-active': isActiveTab('backgrounds') }">
            <a @click="activeTab = 'backgrounds'">
              {{ $t('backgrounds.title') }}
            </a>
          </li>
        </ul>
      </div>

      <!-- Parameters -->
      <div class="tab" v-show="isActiveTab('parameters')">
        <div class="columns">
          <div class="column is-one-third box">
            <div class="form">
              <combobox-styled
                class="mb2"
                locale-key-prefix="productions.type."
                :label="$t('productions.fields.type')"
                :options="productionTypeOptions"
                v-model="params.production_type"
              />
              <combobox-styled
                class="mb2"
                locale-key-prefix="productions.style."
                :label="$t('productions.fields.style')"
                :options="productionStyleOptions"
                v-model="params.production_style"
              />
              <combobox-styled
                class="mb2"
                locale-key-prefix="productions.homepage."
                :label="$t('productions.fields.homepage')"
                :options="homepageOptions"
                v-model="params.homepage"
              />
              <text-field
                type="number"
                :max="60"
                :step="0.001"
                :label="$t('productions.fields.fps')"
                placeholder="25"
                v-model="params.fps"
              />
              <text-field
                :label="$t('productions.fields.ratio')"
                placeholder="16:9"
                :maxlength="10"
                v-model.trim="params.ratio"
                @input="ratioError = ''"
              />
              <p class="field-error" v-if="ratioError">{{ ratioError }}</p>
              <text-field
                :label="$t('productions.fields.resolution')"
                placeholder="1920x1080"
                v-model.trim="params.resolution"
                @input="resolutionError = ''"
              />
              <p class="field-error" v-if="resolutionError">
                {{ resolutionError }}
              </p>
              <combobox-boolean
                :label="$t('productions.fields.is_clients_isolated')"
                v-model="params.is_clients_isolated"
              />
              <combobox-boolean
                :label="$t('productions.fields.is_preview_download_allowed')"
                v-model="params.is_preview_download_allowed"
              />
              <combobox-boolean
                :label="$t('productions.fields.is_set_preview_automated')"
                v-model="params.is_set_preview_automated"
              />
              <combobox-boolean
                :label="$t('productions.fields.is_publish_default')"
                v-model="params.is_publish_default_for_artists"
              />
              <text-field
                type="number"
                :step="1"
                :label="$t('productions.fields.max_retakes')"
                v-model="params.max_retakes"
              />
              <p v-if="errors.parameters" class="error mt1">
                {{ $t('productions.edit_error') }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Task Types -->
      <div class="tab" v-show="isActiveTab('taskTypes')">
        <task-type-settings
          :task-types="templateTaskTypes"
          :all-task-types="allTaskTypes"
          @add="addTaskType"
          @remove="removeTaskType"
          @reorder="reorderTaskTypes"
        />
      </div>

      <!-- Task Statuses -->
      <div class="tab" v-show="isActiveTab('taskStatuses')">
        <task-status-settings
          :task-statuses="templateTaskStatuses"
          :all-task-statuses="allTaskStatuses"
          @add="addTaskStatus"
          @remove="removeTaskStatus"
          @reorder="reorderTaskStatuses"
        />
      </div>

      <!-- Board -->
      <div class="tab" v-show="isActiveTab('board')">
        <board-settings
          :task-statuses="templateTaskStatuses"
          :roles-map="boardRoles"
          @update-roles="onUpdateBoardRoles"
        />
      </div>

      <!-- Asset Types -->
      <div class="tab" v-show="isActiveTab('assetTypes')">
        <asset-type-settings
          :asset-types="templateAssetTypes"
          :all-asset-types="allAssetTypes"
          @add="addAssetType"
          @remove="removeAssetType"
        />
      </div>

      <!-- Status Automations -->
      <div class="tab" v-show="isActiveTab('statusAutomations')">
        <status-automation-settings
          :status-automations="templateAutomations"
          :all-status-automations="allAutomations"
          @add="addAutomation"
          @remove="removeAutomation"
        />
      </div>

      <!-- Metadata Descriptors -->
      <div class="tab" v-show="isActiveTab('metadataDescriptors')">
        <div class="section-tabs tabs">
          <ul>
            <li
              v-for="tab in metadataEntityTabs"
              :key="tab.name"
              :class="{ 'is-active': metadataEntityTab === tab.name }"
            >
              <a @click="metadataEntityTab = tab.name">{{ tab.label }}</a>
            </li>
          </ul>
        </div>

        <div class="flexrow mt1 mb1">
          <button class="button flexrow-item" @click="openAddDescriptor">
            {{ $t('project_templates.add_metadata') }}
          </button>
        </div>

        <div class="box" v-if="descriptorsForEntity.length === 0">
          {{ $t('settings.production.empty_metadata') }}
        </div>
        <div class="datatable-wrapper" v-else>
          <table class="datatable descriptors-table">
            <thead class="datatable-head">
              <tr>
                <th class="descriptor-name">
                  {{ $t('project_templates.fields.name') }}
                </th>
                <th class="descriptor-type">{{ $t('main.type') }}</th>
                <th class="descriptor-for-client">
                  {{ $t('assets.fields.hidden_from_client') }}
                </th>
                <th class="descriptor-departments">
                  {{ $t('people.fields.departments') }}
                </th>
                <th class="descriptor-values">
                  {{ $t('productions.metadata.available_values') }}
                </th>
                <th class="actions"></th>
              </tr>
            </thead>
            <tbody class="datatable-body">
              <tr
                class="datatable-row"
                v-for="descriptor in descriptorsForEntity"
                :key="descriptor.__index"
              >
                <td class="descriptor-name">{{ descriptor.name }}</td>
                <td class="descriptor-type">{{ descriptor.data_type }}</td>
                <td class="descriptor-for-client">
                  {{ descriptor.for_client ? $t('main.yes') : $t('main.no') }}
                </td>
                <td class="descriptor-departments">
                  <span
                    class="department-tag mr05"
                    :key="deptId"
                    v-for="deptId in descriptor.departments || []"
                  >
                    <span
                      class="department-dot"
                      :style="{
                        background: departmentMap.get(deptId)?.color || '#999'
                      }"
                    ></span>
                    {{ departmentMap.get(deptId)?.name || '—' }}
                  </span>
                </td>
                <td class="descriptor-values">
                  <span v-if="descriptor.choices?.length">
                    {{ (descriptor.choices || []).join(', ') }}
                  </span>
                </td>
                <row-actions-cell
                  @edit-clicked="openEditDescriptor(descriptor.__index)"
                  @delete-clicked="removeDescriptor(descriptor.__index)"
                />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Backgrounds -->
      <div class="tab" v-show="isActiveTab('backgrounds')">
        <background-settings
          :backgrounds="templateBackgrounds"
          :all-backgrounds="allBackgrounds"
          :default-background-id="template?.default_preview_background_file_id"
          @add="addBackground"
          @remove="removeBackground"
          @set-default="setDefaultBackground"
        />
      </div>
    </div>

    <add-metadata-modal
      :active="modals.addMetadata"
      :is-loading="loading.saveDescriptor"
      :is-error="errors.saveDescriptor"
      :descriptor-to-edit="descriptorToEdit"
      :entity-type="metadataEntityTab"
      @cancel="modals.addMetadata = false"
      @confirm="confirmMetadataModal"
    />
  </div>

  <div class="has-text-centered mt2" v-else-if="loading.template">
    <spinner />
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
import AssetTypeSettings from '@/components/pages/production/AssetTypeSettings.vue'
import BackgroundSettings from '@/components/pages/production/BackgroundSettings.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import BoardSettings from '@/components/pages/production/BoardSettings.vue'
import StatusAutomationSettings from '@/components/pages/production/StatusAutomationSettings.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import TaskStatusSettings from '@/components/pages/production/TaskStatusSettings.vue'
import TaskTypeSettings from '@/components/pages/production/TaskTypeSettings.vue'
import TextField from '@/components/widgets/TextField.vue'

import {
  PRODUCTION_TYPE_OPTIONS,
  PRODUCTION_STYLE_OPTIONS,
  HOME_PAGE_OPTIONS
} from '@/lib/productions'
import projectTemplatesApi from '@/store/api/projecttemplates'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

const activeTab = ref('parameters')
const VALID_METADATA_ENTITIES = ['Asset', 'Shot', 'Sequence', 'Episode', 'Edit']
const initialMetadataEntity = VALID_METADATA_ENTITIES.includes(
  route.query.entity
)
  ? route.query.entity
  : 'Asset'
const metadataEntityTab = ref(initialMetadataEntity)

watch(metadataEntityTab, entity => {
  // eslint-disable-next-line no-unused-vars
  const { search, ...rest } = route.query
  router.replace({ query: { ...rest, entity } })
})

const metadataEntityTabs = computed(() => [
  { label: t('assets.title'), name: 'Asset' },
  { label: t('shots.title'), name: 'Shot' },
  { label: t('sequences.title'), name: 'Sequence' },
  { label: t('episodes.title'), name: 'Episode' },
  { label: t('edits.title'), name: 'Edit' }
])

const descriptorsForEntity = computed(() => {
  const result = []
  descriptors.value.forEach((d, index) => {
    if ((d.entity_type || 'Asset') === metadataEntityTab.value) {
      // attach the index to the original descriptor so v-model keeps the ref
      d.__index = index
      result.push(d)
    }
  })
  return result
})
const template = ref(null)
const templateTaskTypes = ref([])
const templateTaskStatuses = ref([])
const templateAssetTypes = ref([])
const templateAutomations = ref([])
const templateBackgrounds = ref([])
const descriptors = ref([])
const loading = reactive({
  template: false,
  descriptors: false,
  saveDescriptor: false,
  parameters: false
})
const errors = reactive({ parameters: false, saveDescriptor: false })
const modals = reactive({ addMetadata: false })
const descriptorToEdit = ref({})
const descriptorToEditIndex = ref(-1)
const ratioError = ref('')
const resolutionError = ref('')
const boardRoles = ref({}) // { taskStatusId: [roles] }

const productionTypeOptions = PRODUCTION_TYPE_OPTIONS
const productionStyleOptions = PRODUCTION_STYLE_OPTIONS
const homepageOptions = HOME_PAGE_OPTIONS

const params = ref({
  production_type: 'short',
  production_style: '2d3d',
  homepage: 'assets',
  fps: '25',
  ratio: '16:9',
  resolution: '1920x1080',
  is_clients_isolated: 'false',
  is_preview_download_allowed: 'false',
  is_set_preview_automated: 'false',
  is_publish_default_for_artists: 'false',
  max_retakes: 0
})

const allTaskTypes = computed(() => {
  const taskTypes = store.getters.taskTypes || []
  if (params.value.production_type === 'tvshow') return taskTypes
  return taskTypes.filter(tt => tt.for_entity !== 'Episode')
})
const allTaskStatuses = computed(() => store.getters.taskStatus || [])
const allAssetTypes = computed(() => store.getters.assetTypes || [])
const allAutomations = computed(() => store.getters.statusAutomations || [])
const allBackgrounds = computed(() => store.getters.backgrounds || [])
const departmentMap = computed(() => store.getters.departmentMap || new Map())

const isActiveTab = tab => activeTab.value === tab

watch(activeTab, tab => {
  router.replace({ query: { ...route.query, tab } })
})

useHead({
  title: computed(() =>
    template.value
      ? `${template.value.name} - ${t('project_templates.title')} - Kitsu`
      : t('project_templates.title')
  )
})

const templateId = computed(() => route.params.template_id)

const loadTemplateData = async () => {
  const id = templateId.value
  const [tmpl, taskTypes, taskStatuses, assetTypes, automations, backgrounds] =
    await Promise.all([
      projectTemplatesApi.getProjectTemplate(id),
      projectTemplatesApi.getTemplateTaskTypes(id),
      projectTemplatesApi.getTemplateTaskStatuses(id),
      projectTemplatesApi.getTemplateAssetTypes(id),
      projectTemplatesApi.getTemplateStatusAutomations(id),
      projectTemplatesApi.getTemplateBackgrounds(id)
    ])
  template.value = tmpl
  templateTaskTypes.value = taskTypes
  templateTaskStatuses.value = taskStatuses
  templateAssetTypes.value = assetTypes
  templateAutomations.value = automations
  templateBackgrounds.value = backgrounds
  descriptors.value = (tmpl.metadata_descriptors || []).map(d => ({ ...d }))
  params.value = {
    production_type: tmpl.production_type || 'short',
    production_style: tmpl.production_style || '2d3d',
    homepage: tmpl.homepage || 'assets',
    fps: tmpl.fps || '25',
    ratio: tmpl.ratio || '16:9',
    resolution: tmpl.resolution || '1920x1080',
    is_clients_isolated: tmpl.is_clients_isolated ? 'true' : 'false',
    is_preview_download_allowed: tmpl.is_preview_download_allowed
      ? 'true'
      : 'false',
    is_set_preview_automated: tmpl.is_set_preview_automated ? 'true' : 'false',
    is_publish_default_for_artists: tmpl.is_publish_default_for_artists
      ? 'true'
      : 'false',
    max_retakes: tmpl.max_retakes || 0
  }
  // Build roles map from task status link data (if available from API)
  const roles = {}
  taskStatuses.forEach(ts => {
    roles[ts.id] = ts.roles_for_board || []
  })
  boardRoles.value = roles
}

const validateRatio = () => {
  const v = params.value.ratio
  if (!v) return ''
  if (!/^\d+:\d+$/.test(v)) {
    return t('project_templates.ratio_error')
  }
  return ''
}

const validateResolution = () => {
  const v = params.value.resolution
  if (!v) return ''
  if (!/^\d+x\d+$|^\d+x$|^x\d+$/.test(v)) {
    return t('project_templates.resolution_error')
  }
  return ''
}

const saveParameters = async () => {
  ratioError.value = validateRatio()
  resolutionError.value = validateResolution()
  if (ratioError.value || resolutionError.value) return
  loading.parameters = true
  errors.parameters = false
  try {
    await projectTemplatesApi.editProjectTemplate({
      id: templateId.value,
      name: template.value.name,
      description: template.value.description,
      ...params.value,
      is_clients_isolated: params.value.is_clients_isolated === 'true',
      is_preview_download_allowed:
        params.value.is_preview_download_allowed === 'true',
      is_set_preview_automated:
        params.value.is_set_preview_automated === 'true',
      is_publish_default_for_artists:
        params.value.is_publish_default_for_artists === 'true'
    })
  } catch {
    errors.parameters = true
  }
  loading.parameters = false
}

let saveTimeout = null
watch(
  () => ({ ...params.value }),
  () => {
    if (!template.value?.id) return
    clearTimeout(saveTimeout)
    saveTimeout = setTimeout(saveParameters, 800)
  },
  { deep: true }
)

const onUpdateBoardRoles = async ({ taskStatusId, roles }) => {
  boardRoles.value = { ...boardRoles.value, [taskStatusId]: roles }
  await projectTemplatesApi.addTaskStatusToTemplate(
    templateId.value,
    taskStatusId,
    null,
    roles
  )
}

const addTaskType = async taskTypeId => {
  await projectTemplatesApi.addTaskTypeToTemplate(templateId.value, taskTypeId)
  await loadTemplateData()
}

const removeTaskType = async taskTypeId => {
  await projectTemplatesApi.removeTaskTypeFromTemplate(
    templateId.value,
    taskTypeId
  )
  await loadTemplateData()
}

const reorderTaskTypes = async ordered => {
  for (const { taskTypeId, priority } of ordered) {
    await projectTemplatesApi.addTaskTypeToTemplate(
      templateId.value,
      taskTypeId,
      priority
    )
  }
  await loadTemplateData()
}

const addTaskStatus = async taskStatusId => {
  await projectTemplatesApi.addTaskStatusToTemplate(
    templateId.value,
    taskStatusId
  )
  await loadTemplateData()
}

const removeTaskStatus = async taskStatusId => {
  await projectTemplatesApi.removeTaskStatusFromTemplate(
    templateId.value,
    taskStatusId
  )
  await loadTemplateData()
}

const reorderTaskStatuses = async ordered => {
  for (const { taskStatusId, priority } of ordered) {
    await projectTemplatesApi.addTaskStatusToTemplate(
      templateId.value,
      taskStatusId,
      priority
    )
  }
  await loadTemplateData()
}

const addAssetType = async assetTypeId => {
  await projectTemplatesApi.addAssetTypeToTemplate(
    templateId.value,
    assetTypeId
  )
  await loadTemplateData()
}

const removeAssetType = async assetTypeId => {
  await projectTemplatesApi.removeAssetTypeFromTemplate(
    templateId.value,
    assetTypeId
  )
  await loadTemplateData()
}

const addAutomation = async automationId => {
  await projectTemplatesApi.addStatusAutomationToTemplate(
    templateId.value,
    automationId
  )
  await loadTemplateData()
}

const removeAutomation = async automationId => {
  await projectTemplatesApi.removeStatusAutomationFromTemplate(
    templateId.value,
    automationId
  )
  await loadTemplateData()
}

const addBackground = async backgroundId => {
  await projectTemplatesApi.addBackgroundToTemplate(
    templateId.value,
    backgroundId
  )
  await loadTemplateData()
}

const removeBackground = async backgroundId => {
  await projectTemplatesApi.removeBackgroundFromTemplate(
    templateId.value,
    backgroundId
  )
  await loadTemplateData()
}

const setDefaultBackground = async backgroundId => {
  await projectTemplatesApi.setTemplateDefaultBackground(
    templateId.value,
    backgroundId
  )
  await loadTemplateData()
}

const cleanDescriptors = () =>
  descriptors.value.map(d => ({
    name: d.name,
    entity_type: d.entity_type,
    data_type: d.data_type,
    choices: d.choices || [],
    for_client: Boolean(d.for_client),
    departments: d.departments || [],
    field_name: d.field_name,
    position: d.position
  }))

const persistDescriptors = async () => {
  await projectTemplatesApi.setTemplateMetadataDescriptors(
    templateId.value,
    cleanDescriptors()
  )
  await loadTemplateData()
}

const openAddDescriptor = () => {
  descriptorToEditIndex.value = -1
  descriptorToEdit.value = {
    name: '',
    data_type: 'string',
    for_client: false,
    choices: [],
    departments: []
  }
  modals.addMetadata = true
}

const openEditDescriptor = index => {
  const d = descriptors.value[index]
  if (!d) return
  descriptorToEditIndex.value = index
  descriptorToEdit.value = {
    id: `template-descriptor-${index}`,
    name: d.name,
    data_type: d.data_type,
    for_client: Boolean(d.for_client),
    choices: [...(d.choices || [])],
    departments: [...(d.departments || [])]
  }
  modals.addMetadata = true
}

const removeDescriptor = async index => {
  descriptors.value.splice(index, 1)
  await persistDescriptors()
}

const confirmMetadataModal = async form => {
  loading.saveDescriptor = true
  errors.saveDescriptor = false
  const entry = {
    name: form.name,
    data_type: form.data_type,
    entity_type: metadataEntityTab.value,
    choices: form.values || [],
    for_client: form.for_client === 'true',
    departments: form.departments || []
  }
  try {
    if (descriptorToEditIndex.value >= 0) {
      const existing = descriptors.value[descriptorToEditIndex.value]
      entry.entity_type = existing.entity_type
      entry.field_name = existing.field_name
      entry.position = existing.position
      descriptors.value[descriptorToEditIndex.value] = entry
    } else {
      descriptors.value.push(entry)
    }
    await persistDescriptors()
    modals.addMetadata = false
  } catch (error) {
    console.error(error)
    errors.saveDescriptor = true
  }
  loading.saveDescriptor = false
}

onMounted(async () => {
  if (route.query.tab) {
    activeTab.value = route.query.tab
  }
  loading.template = true
  await Promise.all([store.dispatch('loadContext'), loadTemplateData()])
  loading.template = false
})
</script>

<style lang="scss" scoped>
.fixed-page {
  display: flex;
}

.wrapper {
  margin-top: 0;
  overflow-y: scroll;
  padding: 2em;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tabs {
  min-height: 2em;
}

.tabs ul {
  margin-left: 0;
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-left: 2px;
  padding-top: 0.5em;
}

h2.subtitle {
  color: $grey;
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 0.4em;
  text-transform: uppercase;
}

.back-link {
  color: var(--text-alt);
  text-decoration: none;
  font-size: 0.9em;

  &:hover {
    text-decoration: underline;
  }
}

.template-name {
  color: var(--text);
  font-size: 1.6em;
  font-weight: bold;
  border-bottom: none;
  margin-top: 0.5em;
  margin-bottom: 0.8em;
}

.datatable .field {
  margin-bottom: 0;
}

.list {
  width: 400px;
  min-width: 400px;
  max-width: 400px;

  .name {
    width: 100%;
  }
}

.box {
  max-width: 600px;
  width: 100%;
  padding: 1em;
}

.input.is-small,
.select.is-small {
  font-size: 0.9em;
  padding: 0.3em 0.5em;
}

.datatable .name {
  min-width: 200px;
}

.columns {
  margin-bottom: 2em;
}

.column {
  overflow-y: initial;
  padding: 1em;
}

p {
  color: var(--text);
}

.datatable th {
  color: var(--text);
  padding-left: 10px;
  padding-bottom: 5px;
}

.field-error {
  color: $red;
  font-size: 0.85em;
  margin-top: -1.4rem;
  margin-bottom: 0.5em;
}

.section-tabs {
  margin-bottom: 0.5em;
}

.section-tabs ul {
  margin-left: 0;
  margin-right: 0;
}

.section-tabs li + li {
  margin: 0;
}

.department-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.15em 0.6em;
  border-radius: 3px;
  background: var(--background-alt);
  color: var(--text);
  font-size: 0.85em;
}

.department-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.descriptors-table {
  width: auto;
  max-width: none;
}

.descriptor-name {
  min-width: 260px;
  width: 260px;
  font-weight: 500;
}

.descriptor-type {
  width: 120px;
}

.descriptor-departments {
  width: 220px;
}

.descriptor-for-client {
  width: 60px;
  text-align: center;
}

.descriptor-values {
  min-width: 200px;
  color: var(--text-alt);
}

.datatable-wrapper {
  overflow-x: auto;
  width: 100%;
}

.tabs {
  overflow-x: auto;
}

.tabs ul {
  flex-wrap: nowrap;
  white-space: nowrap;
}

@media screen and (max-width: 1000px) {
  .wrapper {
    padding: 1.5em 1em;
  }
}

@media screen and (max-width: 768px) {
  .wrapper {
    padding: 1em 0.75em;
  }

  .template-name {
    font-size: 1.3em;
    margin-top: 0.3em;
    margin-bottom: 0.5em;
  }

  .column {
    padding: 0.5em 0;
  }

  .columns {
    margin-bottom: 1em;
  }

  .box {
    padding: 1.5em;
  }

  /* Read-only mobile: hide all add buttons / mutation widgets */
  /* Parameters: Save button row */
  .tab .has-text-right {
    display: none;
  }

  /* Metadata: "Add a metadata" button row + actions column in the table */
  .tab > .flexrow.mt1.mb1 {
    display: none;
  }

  .descriptors-table .actions {
    display: none;
  }

  /* Shared sub-components — hide importer column (right side of .columns) */
  :deep(.tab .columns .column + .column) {
    display: none;
  }

  /* Shared lists — hide remove buttons and drag handles */
  :deep(.tab .remove),
  :deep(.tab .grab),
  :deep(.tab td.remove),
  :deep(.tab td.grab),
  :deep(.tab .name-full) {
    display: none !important;
  }

  /* Add rows across shared sub-components */
  :deep(.background-settings .flexrow.mt1.mb1),
  :deep(.task-status-settings .add-task-status),
  :deep(.status-automation-settings .add-status-automation) {
    display: none;
  }

  /* BackgroundSettings — last column (remove) and is-default toggle */
  :deep(.background-settings .datatable th:last-child),
  :deep(.background-settings .datatable td:last-child),
  :deep(.background-settings .is-default) {
    display: none !important;
  }

  /* Catch-all: hide any remaining action buttons inside datatable rows
     on mobile (read-only mode) */
  :deep(.tab .datatable-row .button) {
    display: none !important;
  }

  /* BoardSettings — Select all / Unselect all buttons hidden, role toggles
     rendered as disabled read-only checks. */
  :deep(.board-settings .roles .button) {
    display: none;
  }

  :deep(.board-settings .roles .bool-field) {
    pointer-events: none;
    opacity: 0.7;
  }

  :deep(.board-settings .datatable-row .roles .bool-field) {
    flex: 0 0 100% !important;
    width: 100% !important;
    margin-bottom: 0.35em;
  }

  /* Card mode for every list/table inside a tab */
  :deep(.tab .datatable),
  :deep(.tab .datatable.list),
  :deep(.tab table.list) {
    display: block;
    background: transparent;
    overflow-x: visible;
    min-width: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
    white-space: normal;
  }

  :deep(.tab .columns),
  :deep(.tab .columns .column) {
    max-width: 100%;
    min-width: 0;
    width: auto;
  }

  :deep(.tab .datatable .datatable-head),
  :deep(.tab .datatable thead) {
    display: none;
  }

  :deep(.tab .datatable .datatable-body),
  :deep(.tab .datatable tbody) {
    display: block;
  }

  :deep(.tab .datatable .datatable-row),
  :deep(.tab .datatable .datatable-row:nth-child(even)),
  :deep(.tab .datatable .datatable-row:hover),
  :deep(.tab .datatable .datatable-row:last-child) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5em;
    padding: 0.6em 0.75em;
    margin-bottom: 0.5em;
    background-color: var(--background) !important;
    border: 1px solid var(--border);
    border-radius: 6px;
    width: 100%;
    box-sizing: border-box;
    max-width: 100%;
  }

  :deep(.tab .datatable .datatable-row td),
  :deep(.tab .datatable .datatable-row:last-child td),
  :deep(.tab .datatable .datatable-row:last-child:nth-child(even) td),
  :deep(.tab .datatable .datatable-row:last-child:hover td) {
    display: block;
    padding: 0;
    border: 0;
    background-color: transparent !important;
    width: auto;
    min-width: 0;
    max-width: none;
  }

  /* Descriptors: name as title (full width) */
  :deep(.descriptors-table .datatable-row .descriptor-name) {
    flex: 1 1 100%;
    font-weight: 600;
    font-size: 1.05em;
  }

  :deep(.descriptors-table .datatable-row .descriptor-type) {
    flex: 0 0 auto;
    font-size: 0.85em;
    color: var(--text-alt);
  }

  :deep(.descriptors-table .descriptor-for-client),
  :deep(.descriptors-table .datatable-row .actions),
  :deep(.descriptors-table tr td.actions) {
    display: none !important;
  }

  :deep(.descriptors-table .datatable-row .descriptor-departments),
  :deep(.descriptors-table .datatable-row .descriptor-values) {
    flex: 1 1 100%;
    font-size: 0.9em;
    color: var(--text-alt);
  }
}
</style>
