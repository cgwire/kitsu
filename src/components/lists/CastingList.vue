<template>
  <div class="data-list">
    <div class="datatable-wrapper">
      <table class="datatable datatable--cards">
        <thead class="datatable-head">
          <tr>
            <th class="name">{{ $t(`${entityType}s.fields.name`) }}</th>
            <th class="link-label">{{ $t('breakdown.label') }}</th>
            <th class="occurrences">{{ $t('breakdown.occurrences') }}</th>
            <th class="ready-for" v-if="entityType === 'asset'">
              {{ $t('assets.fields.ready_for') }}
            </th>
            <th class="end-cell"></th>
            <th class="actions" v-if="canRemove"></th>
          </tr>
        </thead>
        <tbody class="datatable-body">
          <tr
            class="datatable-row"
            :class="{ shared: entry.shared }"
            :key="entry[`${entityType}_id`]"
            v-for="entry in entries"
          >
            <td class="name card-head">
              <div class="flexrow">
                <entity-thumbnail
                  class="flexrow-item"
                  :entity="entry"
                  :width="50"
                  :height="33"
                  :empty-width="50"
                  :empty-height="34"
                  :with-link="false"
                />
                <router-link class="flexrow-item" :to="entityPath(entry)">
                  {{ entry[`${entityType}_name`] }}
                </router-link>
              </div>
            </td>
            <td class="link-label" :data-label="$t('breakdown.label')">
              <span class="asset-label" :label="entry.label">
                {{ entry.label || $t('breakdown.options.animate') }}
              </span>
            </td>
            <td class="occurrences" :data-label="$t('breakdown.occurrences')">
              {{ entry.nb_occurences || 1 }}
            </td>
            <td
              class="ready-for"
              :data-label="
                entry.ready_for ? $t('assets.fields.ready_for') : null
              "
              v-if="entityType === 'asset'"
            >
              <task-type-name
                :task-type="taskTypeMap.get(entry.ready_for)"
                v-if="!entry.shared && entry.ready_for"
              />
            </td>
            <td class="end-cell"></td>
            <td class="actions" v-if="canRemove">
              <button-simple
                icon="remove"
                :title="$t('breakdown.remove_from_casting')"
                @click="$emit('remove', entry)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
// Imports
import { computed } from 'vue'
import { useStore } from 'vuex'

/* eslint-disable no-unused-vars */
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'
/* eslint-enable no-unused-vars */

// Composables
// --------------------------------------------------------------------------
const store = useStore()

// Props / Emits
// --------------------------------------------------------------------------
defineProps({
  entries: { type: Array, default: () => [] },
  entityType: { type: String, default: 'asset' },
  entityPath: { type: Function, default: () => ({}) },
  canRemove: { type: Boolean, default: false }
})

defineEmits(['remove'])

// Computed
// --------------------------------------------------------------------------
const taskTypeMap = computed(() => store.getters.taskTypeMap)
</script>

<style lang="scss" scoped>
.datatable-row.shared td:first-child {
  box-shadow: inset 3px 0 0 var(--shared-color);
}

.name {
  min-width: 250px;
  width: 250px;

  a {
    color: var(--text-strong);
    font-weight: 500;
  }
}

.link-label {
  min-width: 120px;
  width: 120px;
}

.ready-for {
  min-width: 200px;
  width: 200px;
}

.asset-label {
  background: $dark-green;
  border-radius: 4px;
  color: $white;
  font-size: 0.8em;
  font-weight: 500;
  padding: 2px 6px;

  &[label='fixed'] {
    background: $orange-carrot;
  }
}

.occurrences {
  min-width: 120px;
  width: 120px;
}

.actions {
  min-width: 60px;
  text-align: right;
  width: 60px;
}

@media screen and (max-width: 768px) {
  .actions {
    display: none;
  }
}
</style>
