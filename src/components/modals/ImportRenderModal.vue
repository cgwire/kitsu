<template>
  <base-modal
    :active="active"
    :title="$t('main.csv.preview_title')"
    @cancel="$emit('cancel')"
  >
    <p>
      {{ $t('main.csv.preview_required') }}
    </p>
    <div class="description">
      <div v-if="!disableUpdate">
        <h2 class="legend-title">
          {{ $t('main.csv.options.title') }}
        </h2>
        <checkbox
          :toggle="true"
          :label="$t('main.csv.options.update')"
          v-model="updateData"
        />
      </div>
      <h3 class="legend-title">
        {{ $t('main.csv.legend') }}
      </h3>
      <div class="flexrow legends">
        <ul class="legend flexrow-item">
          <li class="legend-definition">
            <span class="legend-term"></span>
            {{ $t('main.csv.legend_ok') }}
          </li>
          <li class="legend-definition">
            <span class="legend-term ignored"></span>
            {{ $t('main.csv.legend_ignored') }}
          </li>
          <li class="legend-definition">
            <span class="legend-term missing"></span>
            {{ $t('main.csv.legend_missing') }}
          </li>
          <li class="legend-definition">
            <span class="legend-term missing-optional"></span>
            {{ $t('main.csv.legend_missing_optional') }}
          </li>
        </ul>
        <ul class="legend flexrow-item">
          <li class="legend-definition">
            <span class="legend-term"></span>
            {{ $t('main.csv.legend_line_ok') }}
          </li>
          <li class="legend-definition">
            <span class="legend-term disabled"></span>
            {{ $t('main.csv.legend_disabled') }}
          </li>
          <li v-if="!disableUpdate" class="legend-definition">
            <span class="legend-term overwrite"></span>
            {{ $t('main.csv.legend_overwrite') }}
          </li>
        </ul>
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

    <div class="render-footer">
      <button-simple
        :text="$t('main.csv.preview_reupload')"
        @click="$emit('reupload')"
      />
      <modal-footer
        :error-text="errorText"
        :is-loading="isLoading"
        :is-disabled="formData === undefined"
        :is-error="isError"
        @confirm="$emit('confirm', parsedCsv, updateData)"
        @cancel="$emit('cancel')"
      />
    </div>
  </base-modal>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

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
const formData = ref(null)
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

// columnSelect intentionally returns parsedCsv[0] directly so that
// `v-model="columnSelect[index]"` mutates the underlying array — the
// template expects to write back into the parsed CSV header row.
const columnSelect = computed(() => props.parsedCsv[0])

const indexMatchers = computed(() =>
  props.dataMatchers.map(item => props.parsedCsv[0].indexOf(item))
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
  const csv = props.parsedCsv[index + 1]
  let itemName = ''
  indexMatchers.value.forEach(col => {
    itemName += csv[col]
  })
  return props.database[itemName]
}
</script>

<style lang="scss" scoped>
.dark {
  .render-container {
    .render {
      th,
      td {
        border: 1px solid $dark-grey-lightest;
        color: $white;
      }
      tr:not(.render-headers):hover {
        background-color: $dark-grey-lightmore;
      }
    }
  }
  .render-select {
    border-color: $dark-grey-lightest;
  }
  .legend-term {
    border: 1px solid $dark-grey-lightest;
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
.modal-content {
  margin: 6rem auto 1.4rem;
  max-width: calc(100vw - 4rem);
  max-height: calc(100% - 6rem);
  width: auto;
}
.modal-content .box p.text {
  margin-bottom: 1em;
}
.error {
  margin-top: 1em;
}
.description {
  margin-bottom: 1em;
  margin-top: 2em;
  .flex-item {
    flex: 1 1 50%;
  }
}
.render-container {
  max-height: 300px;
  overflow: auto;
  .render-headers {
    .field {
      margin: 0;
    }
  }
  .render {
    width: 100%;
    border: 1px solid $light-grey-light;
    th,
    td {
      color: $dark-grey;
      border: 1px solid $light-grey-light;
      padding: 0.75rem;
    }
    tr:hover {
      background: none;
    }
    tr:not(.render-headers):hover {
      background-color: $white-grey-light;
    }
  }
}

.render-select {
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid $light-grey-light;
}

.render-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2rem;
}

.modal-content .box h1.title {
  margin-bottom: 0;
}

.legend-title {
  color: var(--text);
  font-size: 1em;
  font-weight: bold;
  margin-bottom: 1.5em;
  margin-top: 0;
  text-transform: uppercase;
}

.legends {
  align-items: flex-start;
}

.legend {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.legend-term {
  display: inline-block;
  margin-right: 0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  border: 1px solid $light-grey-light;
}
.legend-definition {
  width: 100%;
  display: flex;
  align-items: center;
  margin: 0 1rem 0.5rem 0;
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

.optional-header,
.required-header {
  vertical-align: bottom;
}

col.missing-optional,
col.missing {
  min-width: 150px;

  th {
    vertical-align: bottom;
  }
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
</style>
