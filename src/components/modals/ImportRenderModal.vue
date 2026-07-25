<template>
  <base-modal
    :active="active"
    :title="$t('main.csv.preview_title')"
    @cancel="$emit('cancel')"
  >
    <p>
      {{ $t('main.csv.preview_required') }}
    </p>
    <div class="preview-info">
      <div v-if="!disableUpdate">
        <span class="group-label">{{ $t('main.csv.options.title') }}</span>
        <checkbox
          :toggle="true"
          :label="$t('main.csv.options.update')"
          v-model="updateData"
        />
      </div>
      <div class="legend-items">
        <span class="legend-item" :key="item.label" v-for="item in legendItems">
          <span class="legend-term" :class="item.state"></span>
          {{ item.label }}
        </span>
      </div>
    </div>

    <div class="render-container">
      <table class="render">
        <colgroup>
          <col
            :key="`col-missing-${item}`"
            class="missing"
            v-for="item in columnsRequired"
          />
          <col
            :key="`col-${index}`"
            :class="stateColumn(cell)"
            v-for="(cell, index) in parsedCsv[0]"
          />
          <col
            :key="`col-missing-${item}`"
            class="missing-optional"
            v-for="item in columnsOptional"
          />
        </colgroup>
        <thead>
          <tr class="render-headers">
            <th
              class="required-header"
              :key="`header-${cell}`"
              v-for="cell in columnsRequired"
            >
              {{ cell }}
            </th>
            <th :key="`header-${index}`" v-for="(cell, index) in parsedCsv[0]">
              <div class="render-select">
                <combobox
                  :options="columnOptions"
                  :value="cell"
                  :error="isDuplicated(index)"
                  v-model="columnSelect[index]"
                  @update:model-value="checkForDuplicate"
                />
              </div>
              {{ cell || '-' }}
            </th>
            <th
              class="optional-header"
              :key="`header-${cell}`"
              v-for="cell in columnsOptional"
            >
              {{ cell }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            :class="{
              overwrite: updateData && existingData(index),
              disabled: !updateData && existingData(index)
            }"
            :key="`line-${index}`"
            v-for="(line, index) in parsedCsv
              .slice(1)
              .filter(line => line.length > 1)"
          >
            <td v-for="cell in columnsRequired" :key="`cell-${cell}`">
              {{ '-' }}
            </td>
            <td v-for="(cell, index) in line" :key="`cell-${index}`">
              {{ cell || '-' }}
            </td>
            <td v-for="cell in columnsOptional" :key="`cell-${cell}`">
              {{ '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="new-entities" v-if="updateData && newEntityNames.length > 0">
      <p class="new-entities-text">
        {{ $t('main.csv.new_entities_to_create', newEntityNames.length) }}
      </p>
      <p class="new-entities-names">
        {{ newEntityNames.join(', ') }}
      </p>
      <checkbox
        :label="$t('main.csv.new_entities_confirmation', newEntityNames.length)"
        v-model="newEntitiesConfirmed"
      />
    </div>

    <div class="render-footer">
      <button-simple
        :text="$t('main.csv.preview_reupload')"
        @click="$emit('reupload')"
      />
      <modal-footer
        :error-text="errorText"
        :is-loading="isLoading"
        :is-disabled="isConfirmDisabled"
        :is-error="isError"
        @confirm="$emit('confirm', parsedCsv, updateData)"
        @cancel="$emit('cancel')"
      />
    </div>
  </base-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import csv from '@/lib/csv'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Checkbox from '@/components/widgets/Checkbox.vue'
import Combobox from '@/components/widgets/Combobox.vue'

const { t } = useI18n()
const route = useRoute()
const store = useStore()

const props = defineProps({
  active: { type: Boolean, default: false },
  columns: { type: Array, default: () => [] },
  dataMatchers: { type: Array, default: () => [] },
  database: { type: Object, default: () => ({}) },
  disableUpdate: { type: Boolean, default: false },
  importError: { type: Error, default: null },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  parsedCsv: { type: Array, default: () => [] }
})

defineEmits(['cancel', 'confirm', 'reupload'])

const duplicates = ref([])
const newEntitiesConfirmed = ref(false)
const updateData = ref(false)

const assetMetadataDescriptors = computed(
  () => store.getters.assetMetadataDescriptors
)
const shotMetadataDescriptors = computed(
  () => store.getters.shotMetadataDescriptors
)
const editMetadataDescriptors = computed(
  () => store.getters.editMetadataDescriptors
)
const taskMetadataDescriptors = computed(
  () => store.getters.taskMetadataDescriptors
)

const columnsRequired = computed(() => {
  if (props.parsedCsv.length === 0) return []
  return props.columns.filter(
    item =>
      !props.parsedCsv[0].includes(item) && props.dataMatchers.includes(item)
  )
})

const columnsOptional = computed(() => {
  if (props.parsedCsv.length === 0) return []
  return props.columns.filter(
    item =>
      !props.parsedCsv[0].includes(item) && !props.dataMatchers.includes(item)
  )
})

const metadataDescriptors = computed(() => {
  const path = route.path
  // The task type route also contains the entity type segment
  // (/productions/:id/:type/task-types/:id), so check task-types first.
  if (path.indexOf('task-types') > 0) {
    return taskMetadataDescriptors.value.filter(
      descriptor => descriptor.task_type_id === route.params.task_type_id
    )
  }
  if (path.indexOf('assets') > 0) return assetMetadataDescriptors.value
  if (path.indexOf('shots') > 0) return shotMetadataDescriptors.value
  if (path.indexOf('edits') > 0) return editMetadataDescriptors.value
  return []
})

const columnsAllowed = computed(() => {
  const list = [...props.columns]
  metadataDescriptors.value.forEach(item => {
    if (!list.includes(item.name)) list.push(item.name)
  })
  return list
})

const columnOptions = computed(() => {
  const options = [
    { label: t('main.csv.choose'), value: t('main.csv.unknown') }
  ]
  columnsAllowed.value.forEach(item => {
    options.push({ label: item, value: item })
  })
  return options
})

const legendItems = computed(() => {
  const items = [
    { state: '', label: t('main.csv.legend_ok') },
    { state: 'ignored', label: t('main.csv.legend_ignored') },
    { state: 'missing', label: t('main.csv.legend_missing') },
    { state: 'missing-optional', label: t('main.csv.legend_missing_optional') },
    { state: '', label: t('main.csv.legend_line_ok') },
    { state: 'disabled', label: t('main.csv.legend_disabled') }
  ]
  if (!props.disableUpdate) {
    items.push({ state: 'overwrite', label: t('main.csv.legend_overwrite') })
  }
  return items
})

// columnSelect intentionally returns parsedCsv[0] directly so that
// `v-model="columnSelect[index]"` mutates the underlying array — the
// template expects to write back into the parsed CSV header row.
const columnSelect = computed(() => props.parsedCsv[0])

const indexMatchers = computed(() =>
  props.dataMatchers.map(item => props.parsedCsv[0].indexOf(item))
)

const newEntityNames = computed(() => {
  if (props.parsedCsv.length === 0) return []
  return csv.getNewEntityNames(
    props.parsedCsv,
    indexMatchers.value,
    props.database
  )
})

const isConfirmDisabled = computed(
  () =>
    updateData.value &&
    newEntityNames.value.length > 0 &&
    !newEntitiesConfirmed.value
)

const errorText = computed(() => {
  let text = t('main.csv.error_upload')
  if (props.importError?.status === 400) {
    const res = props.importError.response
    text += ` (line: ${res.body.line_number}) ${res.body.message}`
  }
  return text
})

const stateColumn = data =>
  columnsAllowed.value.includes(data) ? undefined : 'ignored'

const checkForDuplicate = () => {
  const ignoredItem = t('main.csv.unknown')
  duplicates.value = columnSelect.value
    .filter((item, index) => columnSelect.value.indexOf(item) !== index)
    .filter(item => item !== ignoredItem)
}

const isDuplicated = index =>
  duplicates.value.includes(columnSelect.value[index])

const existingData = index => {
  const line = props.parsedCsv[index + 1]
  let itemName = ''
  indexMatchers.value.forEach(col => {
    itemName += line[col]
  })
  return props.database[itemName]
}

watch(
  () => props.active,
  () => {
    newEntitiesConfirmed.value = false
  }
)
</script>

<style lang="scss" scoped>
:deep(.modal-content) {
  max-width: calc(100vw - 4rem);
  min-width: min(800px, calc(100vw - 4rem));
  width: auto;
}

:deep(.modal-content .box h2.title) {
  margin-bottom: 0.5em;
}

.preview-info {
  background: $white-grey-light;
  border: 1px solid var(--border);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 1.2em;
  margin: 1.6em 0;
  padding: 1.2em 1.4em;
}

.group-label {
  color: var(--text-alt);
  display: block;
  font-size: 0.9em;
  margin-bottom: 0.5em;
}

.legend-items {
  column-gap: 1.5em;
  display: flex;
  flex-wrap: wrap;
  row-gap: 0.5em;
}

.legend-item {
  align-items: center;
  color: var(--text);
  display: flex;
  font-size: 0.9em;
  gap: 0.5em;
}

.legend-term {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 4px;
  display: inline-block;
  flex-shrink: 0;
  height: 1.2em;
  width: 1.2em;
}

.render-container {
  border: 1px solid var(--border);
  border-radius: 10px;
  max-height: 50vh;
  overflow: auto;

  .render-headers .field {
    margin: 0;
  }

  .render {
    width: 100%;

    th,
    td {
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.75rem;
    }

    tr:hover {
      background: none;
    }

    tr:not(.render-headers):hover {
      background-color: var(--background-hover);
    }
  }
}

.render-select {
  border-bottom: 1px solid var(--border);
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
}

.new-entities {
  border: 1px solid $orange-carrot;
  border-radius: 10px;
  margin-top: 1em;
  padding: 1em;

  .new-entities-text {
    color: var(--text);
    font-weight: bold;
    margin-bottom: 0.5em;
  }

  .new-entities-names {
    color: var(--text);
    margin-bottom: 1em;
    max-height: 100px;
    overflow: auto;
  }
}

.render-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;

  // The row provides the spacing, neutralize ModalFooter's own top margin
  .modal-footer {
    margin-top: 0;
  }
}

.ignored {
  background-color: rgba($light-grey-light, 0.6);
}

.missing {
  background-color: rgba($red, 0.6);
}

.missing-optional {
  background-color: rgba($red, 0.2);
}

th.optional-header,
th.required-header {
  min-width: 150px;
  vertical-align: bottom;
}

.disabled {
  opacity: 0.4;
  background: repeating-linear-gradient(
    -45deg,
    rgba($light-grey-light, 0.7),
    rgba($light-grey-light, 0.7) 2px,
    transparent 2px,
    transparent 10px
  );
}

.overwrite {
  background-color: rgba($blue, 0.2);

  &:hover td {
    background-color: rgba($blue, 0.3);
  }
}

.dark {
  .preview-info {
    background: var(--background-alt);
  }

  .ignored {
    background-color: $dark-grey;
  }

  .disabled {
    background: repeating-linear-gradient(
      -45deg,
      rgba($dark-grey, 0.6),
      rgba($dark-grey, 0.6) 2px,
      transparent 2px,
      transparent 10px
    );
  }
}
</style>
