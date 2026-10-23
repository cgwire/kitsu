<template>
  <settings-layout
    class="project-template-settings fixed-page"
    ref="page"
    :active-tab="activeTab"
    :menu-groups="menuGroups"
    v-if="template"
  >
    <template #menu-top>
      <router-link class="back-link" :to="{ name: 'project-templates' }">
        &larr; {{ $t('project_templates.title') }}
      </router-link>
    </template>

    <h2 class="template-name">{{ params.name.trim() || template.name }}</h2>

    <!-- Parameters -->
    <div class="tab" v-show="isActiveTab('parameters')">
      <div class="form">
        <div class="box section general">
          <h2 class="subtitle">
            {{ $t('productions.parameters.general_title') }}
          </h2>
          <text-field
            :label="$t('project_templates.fields.name')"
            :maxlength="80"
            v-model="params.name"
          />
          <p class="error mb1" v-if="nameError">{{ nameError }}</p>
          <textarea-field
            class="mb2"
            :label="$t('project_templates.fields.description')"
            v-model="params.description"
          />
          <combobox-styled
            class="mb2"
            locale-key-prefix="productions.type."
            :label="$t('productions.fields.type')"
            :options="PRODUCTION_TYPE_OPTIONS"
            v-model="params.production_type"
          />
          <combobox-styled
            class="mb2"
            locale-key-prefix="productions.style."
            :label="$t('productions.fields.style')"
            :options="PRODUCTION_STYLE_OPTIONS"
            v-model="params.production_style"
          />
          <combobox-styled
            class="mb2"
            locale-key-prefix="productions.homepage."
            :label="$t('productions.fields.homepage')"
            :options="HOME_PAGE_OPTIONS"
            v-model="params.homepage"
          />
        </div>

        <div class="box section comments">
          <h2 class="subtitle">
            {{ $t('productions.parameters.comments_and_retakes') }}
          </h2>
          <text-field
            class="number-line"
            type="number"
            :step="1"
            :description="$t('productions.parameters.max_retakes_description')"
            :label="$t('productions.fields.max_retakes')"
            v-model="params.max_retakes"
          />
          <checkbox
            class="mb0"
            :toggle="true"
            :label="$t('productions.fields.is_publish_default')"
            v-model="params.is_publish_default_for_artists"
          />
          <p class="field-help mb2">
            {{ $t('productions.parameters.publish_default_description') }}
          </p>
        </div>
        <p v-if="errors.parameters" class="error mt1">
          {{ $t('productions.edit_error') }}
        </p>
      </div>
    </div>

    <!-- Clients -->
    <div class="tab" v-show="isActiveTab('clients')">
      <p v-if="errors.parameters || errors.clients" class="error mb1">
        {{ $t('productions.clients.save_error') }}
      </p>
      <client-access-settings
        :key="clientsKey"
        :settings="params"
        :task-types="templateTaskTypes"
        :task-statuses="templateTaskStatuses"
        :is-saving="loading.clients"
        is-template
        @update-setting="(flag, value) => (params[flag] = value)"
        @set-task-type-visible="setTaskTypeClientVisible"
        @set-status-client-allowed="setStatusClientAllowed"
      />
    </div>

    <!-- Video -->
    <div class="tab" v-show="isActiveTab('video')">
      <video-settings-form
        :default-bitrates="bitrateDefaults"
        :errors="{ ratio: ratioError, resolution: resolutionError }"
        v-model="params"
      />
      <p v-if="errors.parameters" class="error mt1">
        {{ $t('productions.edit_error') }}
      </p>
    </div>

    <!-- Metadata Descriptors -->
    <div class="tab is-wide" v-show="isActiveTab('metadataDescriptors')">
      <div class="box section">
        <h2 class="subtitle">
          {{ $t('project_templates.tabs.metadata_descriptors') }}
        </h2>
        <p class="explanation mb1">
          {{ $t('project_templates.metadata_explanation') }}
        </p>
        <div class="section-tabs tabs">
          <ul>
            <li
              v-for="tab in metadataEntityTabs"
              :key="tab.name"
              :class="{ 'is-active': metadataEntityTab === tab.name }"
            >
              <a
                role="button"
                tabindex="0"
                @click="metadataEntityTab = tab.name"
                @keydown.enter.prevent="metadataEntityTab = tab.name"
                @keydown.space.prevent="metadataEntityTab = tab.name"
                >{{ tab.label }}</a
              >
            </li>
          </ul>
        </div>

        <div class="flexrow mt1 mb1 add-descriptor">
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
                <th
                  class="descriptor-task-type"
                  v-if="metadataEntityTab === 'Task'"
                >
                  {{ $t('tasks.fields.task_type') }}
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
                <td
                  class="descriptor-task-type"
                  v-if="metadataEntityTab === 'Task'"
                >
                  {{ taskTypeMap.get(descriptor.task_type_id)?.name || '—' }}
                </td>
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
    </div>

    <!-- Backgrounds -->
    <div class="tab" v-show="isActiveTab('backgrounds')">
      <div class="box section">
        <h2 class="subtitle">{{ $t('backgrounds.title') }}</h2>
        <p class="explanation mb1">
          {{ $t('project_templates.backgrounds_explanation') }}
        </p>
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

    <!-- Asset Types -->
    <div class="tab is-wide" v-show="isActiveTab('assetTypes')">
      <div class="box section">
        <h2 class="subtitle">{{ $t('asset_types.title') }}</h2>
        <asset-type-settings
          :asset-types="templateAssetTypes"
          :all-asset-types="allAssetTypes"
          @add="addAssetType"
          @import-items="importAssetTypes"
          @remove="removeAssetType"
        />
      </div>
    </div>

    <!-- Task Types -->
    <div class="tab is-wide" v-show="isActiveTab('taskTypes')">
      <div class="box section">
        <h2 class="subtitle">{{ $t('task_types.title') }}</h2>
        <task-type-settings
          :task-types="templateTaskTypes"
          :all-task-types="allTaskTypes"
          :default-bitrates="params"
          @add="addTaskType"
          @bitrates-changed="setTaskTypeBitrates"
          @import-items="importTaskTypes"
          @remove="removeTaskType"
          @reorder="reorderTaskTypes"
        />
      </div>
    </div>

    <!-- Task Statuses -->
    <div class="tab is-wide" v-show="isActiveTab('taskStatuses')">
      <div class="box section">
        <h2 class="subtitle">{{ $t('task_status.title') }}</h2>
        <task-status-settings
          :task-statuses="templateTaskStatuses"
          :all-task-statuses="allTaskStatuses"
          @add="addTaskStatus"
          @remove="removeTaskStatus"
          @reorder="reorderTaskStatuses"
        />
      </div>
    </div>

    <!-- Board -->
    <div class="tab is-wide" v-show="isActiveTab('board')">
      <div class="box section">
        <h2 class="subtitle">{{ $t('board.settings.title') }}</h2>
        <board-settings
          :task-statuses="templateTaskStatuses"
          :roles-map="boardRoles"
          @update-roles="onUpdateBoardRoles"
        />
      </div>
    </div>

    <!-- Status Automations -->
    <div class="tab is-wide" v-show="isActiveTab('statusAutomations')">
      <div class="box section">
        <h2 class="subtitle">{{ $t('status_automations.title') }}</h2>
        <status-automation-settings
          :status-automations="templateAutomations"
          :all-status-automations="allAutomations"
          @add="addAutomation"
          @remove="removeAutomation"
        />
      </div>
    </div>

    <add-metadata-modal
      :active="modals.addMetadata"
      :is-loading="loading.saveDescriptor"
      :is-error="errors.saveDescriptor"
      :descriptor-to-edit="descriptorToEdit"
      :entity-type="metadataEntityTab"
      :task-types="metadataEntityTab === 'Task' ? templateTaskTypes : []"
      @cancel="modals.addMetadata = false"
      @confirm="confirmMetadataModal"
    />
  </settings-layout>

  <div class="has-text-centered mt2" v-else-if="loading.template">
    <spinner />
  </div>
</template>

<script setup>
import { useHead } from '@unhead/vue'
import { computed, onMounted, reactive, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { useFieldCommitOnLeave } from '@/composables/fieldCommit'
import {
  HOME_PAGE_OPTIONS,
  PRODUCTION_STYLE_OPTIONS,
  PRODUCTION_TYPE_OPTIONS,
  clampBitrate,
  clampBitrates
} from '@/lib/productions'

import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
import AssetTypeSettings from '@/components/pages/production/AssetTypeSettings.vue'
import BackgroundSettings from '@/components/pages/production/BackgroundSettings.vue'
import BoardSettings from '@/components/pages/production/BoardSettings.vue'
import ClientAccessSettings from '@/components/pages/production/ClientAccessSettings.vue'
import SettingsLayout from '@/components/pages/production/SettingsLayout.vue'
import StatusAutomationSettings from '@/components/pages/production/StatusAutomationSettings.vue'
import TaskStatusSettings from '@/components/pages/production/TaskStatusSettings.vue'
import TaskTypeSettings from '@/components/pages/production/TaskTypeSettings.vue'
import VideoSettingsForm from '@/components/pages/production/VideoSettingsForm.vue'
import Checkbox from '@/components/widgets/Checkbox.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import TextareaField from '@/components/widgets/TextareaField.vue'
import TextField from '@/components/widgets/TextField.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

// State
// --------------------------------------------------------------------------
const menuGroups = [
  {
    label: 'project_templates.settings_menu.template',
    items: [
      { id: 'parameters', label: 'productions.parameters.title' },
      { id: 'clients', label: 'productions.clients.title' },
      { id: 'video', label: 'productions.video.title' },
      {
        id: 'metadataDescriptors',
        label: 'project_templates.tabs.metadata_descriptors'
      },
      { id: 'backgrounds', label: 'backgrounds.title' }
    ]
  },
  {
    label: 'productions.settings_menu.workflow',
    items: [
      { id: 'assetTypes', label: 'asset_types.title' },
      { id: 'taskTypes', label: 'task_types.title' },
      { id: 'taskStatuses', label: 'task_status.title' },
      { id: 'board', label: 'board.settings.title' },
      { id: 'statusAutomations', label: 'status_automations.title' }
    ]
  }
]
const tabIds = menuGroups.flatMap(group => group.items.map(item => item.id))
const VALID_METADATA_ENTITIES = [
  'Asset',
  'Shot',
  'Sequence',
  'Episode',
  'Edit',
  'Task'
]
const activeTab = ref('parameters')
const metadataEntityTab = ref(
  VALID_METADATA_ENTITIES.includes(route.query.entity)
    ? route.query.entity
    : 'Asset'
)
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
  parameters: false,
  clients: false
})
const errors = reactive({
  clients: false,
  parameters: false,
  saveDescriptor: false
})
const clientsKey = ref(0)
const modals = reactive({ addMetadata: false })
const descriptorToEdit = ref({})
const descriptorToEditIndex = ref(-1)
const nameError = ref('')
const ratioError = ref('')
const resolutionError = ref('')
const boardRoles = ref({}) // { taskStatusId: [roles] }
const params = ref({
  name: '',
  description: '',
  production_type: 'short',
  production_style: '2d3d',
  homepage: 'assets',
  fps: '25',
  ratio: '16:9',
  resolution: '1920x1080',
  hd_bitrate_compression: '',
  ld_bitrate_compression: '',
  is_clients_isolated: false,
  is_client_stats_visible: true,
  is_client_task_list_visible: true,
  is_client_task_panel_visible: true,
  is_preview_download_allowed: false,
  is_set_preview_automated: false,
  is_single_preview_per_revision: false,
  is_publish_default_for_artists: false,
  is_frame_in_numbering: false,
  max_retakes: 0
})
let savedParams = ''
let saveTimeout = null
const layout = useTemplateRef('page')

// Computed
// --------------------------------------------------------------------------
const templateId = computed(() => route.params.template_id)

const metadataEntityTabs = computed(() => [
  { label: t('assets.title'), name: 'Asset' },
  { label: t('shots.title'), name: 'Shot' },
  { label: t('sequences.title'), name: 'Sequence' },
  { label: t('episodes.title'), name: 'Episode' },
  { label: t('edits.title'), name: 'Edit' },
  { label: t('tasks.tasks'), name: 'Task' }
])

// __index points back into descriptors, the list the modal edits
const descriptorsForEntity = computed(() =>
  descriptors.value
    .map((descriptor, index) => ({ ...descriptor, __index: index }))
    .filter(d => (d.entity_type || 'Asset') === metadataEntityTab.value)
)

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
const taskTypeMap = computed(() => store.getters.taskTypeMap || new Map())
const bitrateDefaults = computed(() => store.getters.movieBitrateDefaults)

// Functions
// --------------------------------------------------------------------------
const isActiveTab = tab => activeTab.value === tab

const loadTemplateData = async () => {
  const id = templateId.value
  const [tmpl, taskTypes, taskStatuses, assetTypes, automations, backgrounds] =
    await Promise.all([
      store.dispatch('loadProjectTemplate', id),
      store.dispatch('loadTemplateTaskTypes', id),
      store.dispatch('loadTemplateTaskStatuses', id),
      store.dispatch('loadTemplateAssetTypes', id),
      store.dispatch('loadTemplateStatusAutomations', id),
      store.dispatch('loadTemplateBackgrounds', id)
    ])
  template.value = tmpl
  templateTaskTypes.value = taskTypes
  templateTaskStatuses.value = taskStatuses
  templateAssetTypes.value = assetTypes
  templateAutomations.value = automations
  templateBackgrounds.value = backgrounds
  descriptors.value = (tmpl.metadata_descriptors || []).map(d => ({ ...d }))
  params.value = {
    name: tmpl.name || '',
    description: tmpl.description || '',
    production_type: tmpl.production_type || 'short',
    production_style: tmpl.production_style || '2d3d',
    homepage: tmpl.homepage || 'assets',
    fps: tmpl.fps || '25',
    ratio: tmpl.ratio || '16:9',
    resolution: tmpl.resolution || '1920x1080',
    hd_bitrate_compression: tmpl.hd_bitrate_compression ?? '',
    ld_bitrate_compression: tmpl.ld_bitrate_compression ?? '',
    is_clients_isolated: !!tmpl.is_clients_isolated,
    is_client_stats_visible: tmpl.is_client_stats_visible !== false,
    is_client_task_list_visible: tmpl.is_client_task_list_visible !== false,
    is_client_task_panel_visible: tmpl.is_client_task_panel_visible !== false,
    is_preview_download_allowed: !!tmpl.is_preview_download_allowed,
    is_set_preview_automated: !!tmpl.is_set_preview_automated,
    is_single_preview_per_revision: !!tmpl.is_single_preview_per_revision,
    is_publish_default_for_artists: !!tmpl.is_publish_default_for_artists,
    is_frame_in_numbering: !!tmpl.is_frame_in_numbering,
    max_retakes: tmpl.max_retakes || 0
  }
  savedParams = JSON.stringify(params.value)
  boardRoles.value = Object.fromEntries(
    taskStatuses.map(ts => [ts.id, ts.roles_for_board || []])
  )
}

const validateRatio = () => {
  const ratio = params.value.ratio
  return ratio && !/^\d+:\d+$/.test(ratio)
    ? t('project_templates.ratio_error')
    : ''
}

const validateResolution = () => {
  const resolution = params.value.resolution
  return resolution && !/^\d+x\d+$|^\d+x$|^x\d+$/.test(resolution)
    ? t('project_templates.resolution_error')
    : ''
}

const saveParameters = async () => {
  nameError.value = params.value.name.trim()
    ? ''
    : t('project_templates.name_required')
  ratioError.value = validateRatio()
  resolutionError.value = validateResolution()
  if (nameError.value || ratioError.value || resolutionError.value) return
  loading.parameters = true
  errors.parameters = false
  const max = bitrateDefaults.value.hd_bitrate_compression
  const bitrates = clampBitrates(params.value, { max })
  Object.keys(bitrates).forEach(key => {
    const bitrate = clampBitrate(params.value[key], max)
    if (bitrate !== null && bitrate !== params.value[key]) {
      params.value[key] = bitrate
    }
  })
  const previousParams = savedParams
  savedParams = JSON.stringify(params.value)
  try {
    await store.dispatch('editProjectTemplate', {
      id: template.value.id,
      ...params.value,
      name: params.value.name.trim(),
      ...bitrates
    })
  } catch (err) {
    savedParams = previousParams
    const message = err?.body?.message || err?.message || ''
    if (message.toLowerCase().includes('already exists')) {
      nameError.value = t('project_templates.duplicate_name')
    } else {
      errors.parameters = true
    }
  }
  loading.parameters = false
}

// A link change saves, then the template reloads as a whole, even after a
// failure: the page shows what the template holds, and the task type and
// status lists wait for this reload after a drop.
const updateTemplate = async (action, payload) => {
  try {
    await store.dispatch(action, { templateId: templateId.value, ...payload })
  } finally {
    await loadTemplateData()
  }
}

const onUpdateBoardRoles = async ({ taskStatusId, roles }) => {
  boardRoles.value = { ...boardRoles.value, [taskStatusId]: roles }
  await store.dispatch('addTaskStatusToTemplate', {
    templateId: templateId.value,
    taskStatusId,
    priority: null,
    rolesForBoard: roles
  })
}

const addTaskType = taskTypeId =>
  updateTemplate('addTaskTypeToTemplate', { taskTypeId })

const removeTaskType = taskTypeId =>
  updateTemplate('removeTaskTypeFromTemplate', { taskTypeId })

const reorderTaskTypes = ordered =>
  updateTemplate('reorderTemplateTaskTypes', {
    taskTypeIds: ordered.map(item => item.taskTypeId)
  })

const setTaskTypeBitrates = async ({ taskTypeId, ...bitrates }) => {
  const id = templateId.value
  await store.dispatch('addTaskTypeToTemplate', {
    templateId: id,
    taskTypeId,
    ...bitrates
  })
  if (templateId.value === id) await loadTemplateData()
}

const saveClientAccess = async (action, update) => {
  loading.clients = true
  errors.clients = false
  try {
    await action()
    update()
  } catch (err) {
    console.error(err)
    errors.clients = true
    clientsKey.value++
  }
  loading.clients = false
}

const setTaskTypeClientVisible = (taskTypeId, isClientVisible) =>
  saveClientAccess(
    () =>
      store.dispatch('addTaskTypeToTemplate', {
        templateId: templateId.value,
        taskTypeId,
        is_client_visible: isClientVisible
      }),
    () => {
      templateTaskTypes.value = templateTaskTypes.value.map(taskType =>
        taskType.id === taskTypeId
          ? { ...taskType, is_client_visible: isClientVisible }
          : taskType
      )
    }
  )

const setStatusClientAllowed = (taskStatusId, isClientAllowed) =>
  saveClientAccess(
    () =>
      store.dispatch('addTaskStatusToTemplate', {
        templateId: templateId.value,
        taskStatusId,
        isClientAllowed
      }),
    () => {
      templateTaskStatuses.value = templateTaskStatuses.value.map(status =>
        status.id === taskStatusId
          ? { ...status, link_is_client_allowed: isClientAllowed }
          : status
      )
    }
  )

const addTaskStatus = taskStatusId =>
  updateTemplate('addTaskStatusToTemplate', { taskStatusId })

const removeTaskStatus = taskStatusId =>
  updateTemplate('removeTaskStatusFromTemplate', { taskStatusId })

const reorderTaskStatuses = ordered =>
  updateTemplate('reorderTemplateTaskStatuses', {
    taskStatusIds: ordered.map(item => item.taskStatusId)
  })

const addAssetType = assetTypeId =>
  updateTemplate('addAssetTypeToTemplate', { assetTypeId })

const removeAssetType = assetTypeId =>
  updateTemplate('removeAssetTypeFromTemplate', { assetTypeId })

const importLinks = async ({ ids, done }, action, key) => {
  try {
    for (const id of ids) {
      await store.dispatch(action, { templateId: templateId.value, [key]: id })
    }
    await loadTemplateData()
  } catch (err) {
    console.error(err)
  }
  done()
}

const importTaskTypes = payload =>
  importLinks(payload, 'addTaskTypeToTemplate', 'taskTypeId')

const importAssetTypes = payload =>
  importLinks(payload, 'addAssetTypeToTemplate', 'assetTypeId')

const addAutomation = statusAutomationId =>
  updateTemplate('addStatusAutomationToTemplate', { statusAutomationId })

const removeAutomation = statusAutomationId =>
  updateTemplate('removeStatusAutomationFromTemplate', { statusAutomationId })

const addBackground = backgroundId =>
  updateTemplate('addBackgroundToTemplate', { backgroundId })

const removeBackground = backgroundId =>
  updateTemplate('removeBackgroundFromTemplate', { backgroundId })

const setDefaultBackground = backgroundId =>
  updateTemplate('setTemplateDefaultBackground', { backgroundId })

const cleanDescriptors = () =>
  descriptors.value.map(d => ({
    name: d.name,
    entity_type: d.entity_type,
    task_type_id: d.task_type_id || null,
    data_type: d.data_type,
    choices: d.choices || [],
    for_client: Boolean(d.for_client),
    departments: d.departments || [],
    field_name: d.field_name,
    position: d.position
  }))

const persistDescriptors = () =>
  updateTemplate('setTemplateMetadataDescriptors', {
    descriptors: cleanDescriptors()
  })

const openAddDescriptor = () => {
  errors.saveDescriptor = false
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
  errors.saveDescriptor = false
  descriptorToEditIndex.value = index
  descriptorToEdit.value = {
    id: `template-descriptor-${index}`,
    name: d.name,
    data_type: d.data_type,
    task_type_id: d.task_type_id ?? null,
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
    task_type_id: form.task_type_id ?? null,
    choices: form.values || [],
    for_client: form.for_client === 'true',
    departments: form.departments || []
  }
  try {
    if (descriptorToEditIndex.value >= 0) {
      const existing = descriptors.value[descriptorToEditIndex.value]
      entry.entity_type = existing.entity_type
      entry.task_type_id = form.task_type_id ?? existing.task_type_id
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

// Watchers
// --------------------------------------------------------------------------
watch(
  () => route.query.tab,
  tab => {
    activeTab.value = tabIds.includes(tab) ? tab : 'parameters'
  },
  { immediate: true }
)

watch(metadataEntityTab, entity => {
  // eslint-disable-next-line no-unused-vars
  const { search, ...rest } = route.query
  router.replace({ query: { ...rest, entity } })
})

watch(
  () => params.value.name,
  () => (nameError.value = '')
)
watch(
  () => params.value.ratio,
  () => (ratioError.value = '')
)
watch(
  () => params.value.resolution,
  () => (resolutionError.value = '')
)

watch(
  () => ({ ...params.value }),
  () => {
    clearTimeout(saveTimeout)
    if (!template.value?.id || JSON.stringify(params.value) === savedParams) {
      return
    }
    saveTimeout = setTimeout(saveParameters, 800)
  },
  { deep: true }
)

// Lifecycle
// --------------------------------------------------------------------------
useFieldCommitOnLeave(
  computed(() => layout.value?.$el),
  (to, from) => to.params.template_id !== from.params.template_id
)

onMounted(async () => {
  loading.template = true
  await Promise.all([store.dispatch('loadContext'), loadTemplateData()])
  loading.template = false
})

// Head
// --------------------------------------------------------------------------
useHead({
  title: computed(() =>
    template.value
      ? `${params.value.name.trim() || template.value.name} - ${t('project_templates.title')} - Kitsu`
      : t('project_templates.title')
  )
})
</script>

<style lang="scss" scoped>
.fixed-page {
  display: flex;
}

.back-link {
  color: var(--text-alt);
  display: block;
  font-size: 0.9em;
  margin-bottom: 1em;
  text-decoration: none;

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

.datatable th {
  color: var(--text);
  padding-left: 10px;
  padding-bottom: 5px;
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

@media screen and (max-width: 768px) {
  .section-tabs {
    overflow-x: auto;
  }

  .section-tabs ul {
    flex-wrap: nowrap;
    white-space: nowrap;
  }

  .template-name {
    font-size: 1.3em;
    margin-top: 0.3em;
    margin-bottom: 0.5em;
  }

  .add-descriptor,
  .descriptors-table .actions {
    display: none;
  }

  :deep(.task-status-settings .add-task-status) {
    display: none;
  }

  :deep(.client-access-settings .statuses-reset) {
    display: none;
  }

  :deep(.client-access-settings .checkbox-field) {
    pointer-events: none;
  }

  /* Descriptors: name as title (full width) */
  .descriptors-table .datatable-row .descriptor-name {
    flex: 1 1 100%;
    font-weight: 600;
    font-size: 1.05em;
  }

  .descriptors-table .datatable-row .descriptor-type {
    flex: 0 0 auto;
    font-size: 0.85em;
    color: var(--text-alt);
  }

  .descriptors-table .descriptor-for-client,
  .descriptors-table .datatable-row .actions,
  .descriptors-table tr td.actions {
    display: none !important;
  }

  .descriptors-table .datatable-row .descriptor-departments,
  .descriptors-table .datatable-row .descriptor-values {
    flex: 1 1 100%;
    font-size: 0.9em;
    color: var(--text-alt);
  }
}
</style>
