<template>
  <section
    v-if="canAccess"
    class="task-working-files box"
    :aria-labelledby="titleId"
  >
    <header class="working-files-header">
      <h2 class="subtitle is-6" :id="titleId">
        {{ t('tasks.working_files.title') }}
      </h2>
      <button
        class="button is-small"
        type="button"
        :disabled="isLoading"
        @click="load"
      >
        {{ t('tasks.working_files.refresh') }}
      </button>
    </header>

    <p v-if="isLoading" class="help" role="status">
      {{ t('tasks.working_files.loading') }}
    </p>
    <p v-if="loadError" class="help is-danger" role="alert">
      {{ t(`tasks.working_files.errors.${loadError}`) }}
    </p>
    <button
      v-if="ambiguousCreate && createRetrySupported"
      data-testid="ambiguous-create-acknowledge"
      class="button is-small"
      type="button"
      :disabled="isLoading || Boolean(loadError)"
      @click="acknowledgeAmbiguousCreate"
    >
      {{ t('tasks.working_files.acknowledge_ambiguous') }}
    </button>
    <p v-if="softwareError" class="help is-danger" role="alert">
      {{ t(`tasks.working_files.errors.${softwareError}`) }}
    </p>
    <p v-if="accessDenied" class="help is-danger" role="alert">
      {{ t('tasks.working_files.errors.forbidden') }}
    </p>
    <p
      v-if="canUpload && !createRetrySupported"
      class="help is-warning"
      role="status"
    >
      {{ t('tasks.working_files.upload_unsupported') }}
    </p>
    <p v-if="downloadError" class="help is-danger" role="alert">
      {{ t('tasks.working_files.errors.' + downloadError) }}
    </p>

    <p
      v-if="!isLoading && !loadError && workingFiles.length === 0"
      class="help"
    >
      {{ t('tasks.working_files.empty') }}
    </p>

    <ul v-if="workingFiles.length" class="working-file-list">
      <li
        class="working-file-row"
        v-for="workingFile in sortedWorkingFiles"
        :key="workingFile.id"
      >
        <div class="working-file-details">
          <strong>{{
            displayPathName(workingFile.path, workingFile.name)
          }}</strong>
          <span class="tag is-light">
            {{
              t('tasks.working_files.revision', {
                revision: workingFile.revision
              })
            }}
          </span>
          <span v-if="softwareName(workingFile.software_id)" class="help">
            {{ softwareName(workingFile.software_id) }}
          </span>
          <span v-if="workingFile.size != null" class="help">
            {{ formatSize(workingFile.size) }}
          </span>
        </div>
        <button
          class="button is-small is-link is-light"
          type="button"
          :disabled="downloadingId === workingFile.id"
          :aria-label="
            t('tasks.working_files.download_aria', {
              name: displayPathName(workingFile.path, workingFile.name)
            })
          "
          @click="download(workingFile)"
        >
          {{
            downloadingId === workingFile.id
              ? t('tasks.working_files.downloading')
              : t('tasks.working_files.download')
          }}
        </button>
      </li>
    </ul>

    <form
      v-if="canUpload && createRetrySupported && !accessDenied"
      class="working-file-upload"
      @submit.prevent="submit"
    >
      <h3 class="is-size-6">{{ t('tasks.working_files.submit_title') }}</h3>
      <div class="field">
        <label class="label" :for="`${titleId}-name`">
          {{ t('tasks.working_files.group_name') }}
        </label>
        <div class="control">
          <input
            :id="`${titleId}-name`"
            class="input"
            type="text"
            maxlength="250"
            v-model.trim="groupName"
            :disabled="
              isCreating ||
              isUploading ||
              Boolean(pendingUpload) ||
              Boolean(pendingCreateRequestId)
            "
          />
        </div>
      </div>

      <div class="field">
        <label class="label" :for="`${titleId}-software`">
          {{ t('tasks.working_files.software') }}
        </label>
        <div class="control select is-fullwidth">
          <select
            :id="`${titleId}-software`"
            v-model="softwareId"
            :disabled="
              isCreating ||
              isUploading ||
              Boolean(pendingUpload) ||
              Boolean(pendingCreateRequestId)
            "
          >
            <option value="">
              {{ t('tasks.working_files.select_software') }}
            </option>
            <option
              v-for="software in availableSoftwares"
              :key="software.id"
              :value="software.id"
            >
              {{ software.name }} ({{ software.file_extension }})
            </option>
          </select>
        </div>
      </div>

      <div class="field">
        <label class="label" :for="`${titleId}-file`">
          {{ t('tasks.working_files.file') }}
        </label>
        <div class="control">
          <input
            :id="`${titleId}-file`"
            data-testid="working-file-input"
            class="input"
            type="file"
            :disabled="
              isCreating ||
              isUploading ||
              Boolean(pendingUpload) ||
              Boolean(pendingCreateRequestId)
            "
            @change="selectFile"
          />
        </div>
        <p v-if="selectedFile" class="help">
          {{ selectedFile.name }} · {{ formatSize(selectedFile.size) }}
        </p>
      </div>

      <p v-if="extensionError" class="help is-danger" role="alert">
        {{ t('tasks.working_files.errors.extension') }}
      </p>
      <p v-if="uploadError" class="help is-danger" role="alert">
        {{ t(`tasks.working_files.errors.${uploadError}`) }}
      </p>
      <p v-if="ambiguousCreate" class="help is-warning" role="status">
        {{ t('tasks.working_files.ambiguous_create') }}
      </p>
      <p
        v-if="ambiguousCreate && !createRetrySupported"
        class="help is-danger"
        role="alert"
      >
        {{ t('tasks.working_files.ambiguous_retry_unsupported') }}
      </p>
      <p v-if="pendingUpload && !uploadError" class="help" role="status">
        {{
          t('tasks.working_files.retry_same_file', {
            name: pendingUpload.file.name
          })
        }}
      </p>
      <progress
        v-if="isUploading"
        class="progress is-small is-primary"
        :value="uploadProgress"
        max="100"
        :aria-label="t('tasks.working_files.upload_progress')"
      >
        {{ uploadProgress }}%
      </progress>
      <div class="control">
        <button
          class="button is-primary"
          type="submit"
          data-testid="working-file-submit"
          :disabled="!canSubmit"
        >
          {{
            isCreating
              ? t('tasks.working_files.creating')
              : isUploading
                ? t('tasks.working_files.uploading')
                : pendingUpload
                  ? t('tasks.working_files.retry_upload')
                  : t('tasks.working_files.submit')
          }}
        </button>
      </div>
      <p class="help">{{ t('tasks.working_files.revision_notice') }}</p>
    </form>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import filesApi from '@/store/api/files'

const props = defineProps({
  task: { type: Object, required: true },
  canAccess: { type: Boolean, default: false },
  canUpload: { type: Boolean, default: false }
})

const { t } = useI18n()
const workingFiles = ref([])
const softwares = ref([])
const selectedFile = ref(null)
const softwareId = ref('')
const groupName = ref('main')
const isLoading = ref(false)
const isCreating = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const downloadingId = ref(null)
const loadError = ref('')
const softwareError = ref('')
const uploadError = ref('')
const downloadError = ref('')
const accessDenied = ref(false)
const pendingUpload = ref(null)
const pendingCreateRequestId = ref(null)
const ambiguousCreate = ref(false)
const createRetrySupported = ref(false)
const objectUrls = new Set()

const titleId = computed(() => `task-working-files-${props.task.id}`)
const availableSoftwares = computed(() =>
  softwares.value.filter(software => !software.archived)
)
const sortedWorkingFiles = computed(() =>
  [...workingFiles.value].sort((left, right) => {
    const byName = String(left.name || '').localeCompare(
      String(right.name || '')
    )
    return byName || Number(right.revision || 0) - Number(left.revision || 0)
  })
)
const selectedSoftware = computed(() =>
  availableSoftwares.value.find(software => software.id === softwareId.value)
)
const extensionError = computed(() => {
  if (!selectedFile.value || !selectedSoftware.value) return false
  const selectedExtension = extensionOf(selectedFile.value.name)
  if (!selectedExtension) return true
  return !softwareExtensions(selectedSoftware.value).includes(selectedExtension)
})
const canSubmit = computed(
  () =>
    !isLoading.value &&
    !isCreating.value &&
    !isUploading.value &&
    !accessDenied.value &&
    !ambiguousCreate.value &&
    !loadError.value &&
    !softwareError.value &&
    Boolean(selectedFile.value) &&
    Boolean(selectedSoftware.value) &&
    Boolean(groupName.value) &&
    !/[\\/]/.test(groupName.value) &&
    ![...groupName.value].some(
      char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127
    ) &&
    !['.', '..'].includes(groupName.value) &&
    !extensionError.value
)

function statusOf(error) {
  return Number(error?.status || error?.response?.status || 0)
}

function createRequestId() {
  const bytes = new Uint8Array(16)
  globalThis.crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = [...bytes].map(value => value.toString(16).padStart(2, '0'))
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex
    .slice(6, 8)
    .join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`
}

function errorCode(error) {
  const status = statusOf(error)
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 413) return 'too_large'
  if (status === 400 || status === 409) return 'revision_conflict'
  return 'request_failed'
}

function extensionOf(filename) {
  return String(filename || '')
    .split('.')
    .pop()
    .toLowerCase()
}

function softwareExtensions(software) {
  return [software.file_extension, ...(software.secondary_extensions || [])]
    .filter(Boolean)
    .map(extension => String(extension).replace(/^\./, '').toLowerCase())
}

function displayPathName(path, fallback) {
  const parts = String(path || '')
    .split(/[\\/]/)
    .filter(Boolean)
  return parts[parts.length - 1] || fallback || t('tasks.working_files.unnamed')
}

function softwareName(id) {
  return softwares.value.find(software => software.id === id)?.name || ''
}

function formatSize(bytes) {
  const value = Number(bytes)
  if (!Number.isFinite(value) || value < 0) return ''
  if (value < 1024) return `${value} B`
  const units = ['KiB', 'MiB', 'GiB', 'TiB']
  let size = value
  let unit = -1
  do {
    size /= 1024
    unit += 1
  } while (size >= 1024 && unit < units.length - 1)
  return `${size.toFixed(1)} ${units[unit]}`
}

async function load() {
  const taskId = props.task.id
  isLoading.value = true
  loadError.value = ''
  softwareError.value = ''
  downloadError.value = ''
  accessDenied.value = false
  const [filesResult, softwaresResult, apiInfoResult] =
    await Promise.allSettled([
      filesApi.getTaskWorkingFiles(taskId),
      filesApi.getWorkingSoftwares(),
      filesApi.getApiInfo()
    ])
  if (props.task.id !== taskId) return

  createRetrySupported.value =
    apiInfoResult.status === 'fulfilled' &&
    apiInfoResult.value?.capabilities?.working_file_create_idempotency === true

  if (filesResult.status === 'fulfilled') {
    workingFiles.value = Array.isArray(filesResult.value)
      ? filesResult.value
      : []
  } else {
    loadError.value = errorCode(filesResult.reason)
    accessDenied.value = statusOf(filesResult.reason) === 403
  }

  if (softwaresResult.status === 'fulfilled') {
    softwares.value = Array.isArray(softwaresResult.value)
      ? softwaresResult.value
      : []
  } else {
    softwareError.value = errorCode(softwaresResult.reason)
  }
  isLoading.value = false
}

function selectFile(event) {
  const file = event.target.files?.[0] || null
  selectedFile.value = file
  uploadError.value = ''
  if (!file || pendingUpload.value) return

  const extension = extensionOf(file.name)
  const match = availableSoftwares.value.find(software =>
    softwareExtensions(software).includes(extension)
  )
  if (match) softwareId.value = match.id
}

async function submit() {
  if (!canSubmit.value) return
  if (pendingUpload.value) {
    await uploadPending()
    return
  }
  uploadError.value = ''
  isCreating.value = true
  const requestId = pendingCreateRequestId.value || createRequestId()
  pendingCreateRequestId.value = requestId

  try {
    const workingFile = await filesApi.createTaskWorkingFile(props.task.id, {
      name: groupName.value,
      mode: 'working',
      revision: 0,
      software_id: softwareId.value,
      request_id: requestId
    })
    pendingCreateRequestId.value = null
    pendingUpload.value = { workingFile, file: selectedFile.value }
  } catch (error) {
    uploadError.value = errorCode(error)
    isCreating.value = false
    if ([0, 408, 500, 502, 503, 504].includes(statusOf(error))) {
      // Older Zou versions ignore request_id; never retry an ambiguous create
      // unless the server explicitly advertises idempotency support.
      ambiguousCreate.value = true
      await load()
    }
    return
  }

  isCreating.value = false
  await uploadPending()
}

async function acknowledgeAmbiguousCreate() {
  if (!ambiguousCreate.value || !createRetrySupported.value) return
  await load()
  if (!loadError.value) ambiguousCreate.value = false
}

async function uploadPending() {
  if (!pendingUpload.value || isUploading.value) return
  const taskId = props.task.id
  isUploading.value = true
  uploadProgress.value = 0
  uploadError.value = ''
  const formData = new FormData()
  formData.append(
    'file',
    pendingUpload.value.file,
    pendingUpload.value.file.name
  )

  try {
    const { request, promise } = filesApi.uploadWorkingFile(
      pendingUpload.value.workingFile.id,
      formData
    )
    request.on('progress', event => {
      if (event.direction === 'upload' && Number.isFinite(event.percent)) {
        uploadProgress.value = Math.min(100, Math.max(0, event.percent))
      }
    })
    await promise
    pendingUpload.value = null
    ambiguousCreate.value = false
    selectedFile.value = null
    const input = document.getElementById(`${titleId.value}-file`)
    if (input) input.value = ''
    await load()
  } catch (error) {
    if (props.task.id === taskId) {
      uploadError.value = errorCode(error)
    }
  } finally {
    isUploading.value = false
  }
}

async function download(workingFile) {
  if (downloadingId.value) return
  downloadingId.value = workingFile.id
  downloadError.value = ''
  try {
    const blob = await filesApi.getWorkingFileBlob(workingFile.id)
    const url = URL.createObjectURL(blob)
    objectUrls.add(url)
    const link = document.createElement('a')
    link.href = url
    link.download = displayPathName(
      workingFile.path,
      `working-file-${workingFile.revision}`
    )
    link.hidden = true
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => {
      URL.revokeObjectURL(url)
      objectUrls.delete(url)
    }, 1000)
  } catch (error) {
    downloadError.value = errorCode(error)
  } finally {
    downloadingId.value = null
  }
}

watch(
  () => [props.task.id, props.canAccess],
  () => {
    workingFiles.value = []
    softwares.value = []
    selectedFile.value = null
    pendingUpload.value = null
    pendingCreateRequestId.value = null
    softwareId.value = ''
    groupName.value = 'main'
    softwareError.value = ''
    uploadError.value = ''
    downloadError.value = ''
    if (props.canAccess) load()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  objectUrls.forEach(url => URL.revokeObjectURL(url))
})
</script>

<style scoped>
.task-working-files {
  margin: 1rem 0;
}

.working-files-header,
.working-file-row,
.working-file-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.working-files-header,
.working-file-row {
  justify-content: space-between;
}

.working-file-list {
  list-style: none;
  margin: 0 0 1rem;
  padding: 0;
}

.working-file-row {
  border-top: 1px solid var(--border);
  padding: 0.5rem 0;
}

.working-file-details {
  flex-wrap: wrap;
  min-width: 0;
}

.working-file-details strong {
  overflow-wrap: anywhere;
}

.working-file-upload {
  border-top: 1px solid var(--border);
  padding-top: 0.75rem;
}

.working-file-upload .field {
  margin-bottom: 0.75rem;
}

.working-file-upload .help {
  margin-top: 0.35rem;
}
</style>
