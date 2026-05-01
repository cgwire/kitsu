<template>
  <base-modal
    :active="active"
    :title="$t('edits.history')"
    @cancel="$emit('cancel')"
  >
    <table class="table">
      <thead class="table-header">
        <tr>
          <th class="date">{{ $t('main.date') }}</th>
          <th class="name">{{ $t('edits.fields.name') }}</th>
          <th class="person table-filler">
            {{ $t('edits.fields.person') }}
          </th>
        </tr>
      </thead>
    </table>

    <div class="table-body" v-if="!isLoading">
      <table class="table">
        <tbody class="table-body">
          <tr
            class="edit-version"
            :key="version.id"
            v-for="version in versions"
          >
            <td class="date">
              {{ formatDate(version.created_at) }}
            </td>
            <td class="name">
              {{ version.name }}
            </td>
            <td class="person table-filler">
              {{ getPersonFullName(version.person_id) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <table-info :is-loading="isLoading" :is-error="isError" />

    <div class="has-text-right modal-footer">
      <button @click="$emit('cancel')" class="button is-link">
        {{ $t('main.cancel') }}
      </button>
    </div>
  </base-modal>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { formatDate } from '@/lib/time'

import BaseModal from '@/components/modals/BaseModal.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

const store = useStore()

// Props / Emits

const props = defineProps({
  active: { type: Boolean, default: false },
  edit: { type: Object, default: () => ({}) }
})

defineEmits(['cancel'])

// State

const isError = ref(false)
const isLoading = ref(false)
const versions = ref([])

// Computed

const personMap = computed(() => store.getters.personMap)

// Functions

const getPersonFullName = personId =>
  personMap.value.get(personId)?.full_name || ''

const reset = () => {
  versions.value = []
  isError.value = false
  isLoading.value = false
}

const loadData = async () => {
  isError.value = false
  isLoading.value = true
  try {
    versions.value = await store.dispatch('loadEditHistory', props.edit.id)
  } catch (err) {
    console.error(err)
    isError.value = true
  }
  isLoading.value = false
}

// Watchers

watch(
  () => props.active,
  active => {
    if (active) {
      reset()
      loadData()
    }
  }
)

// Lifecycle

onMounted(reset)
</script>

<style lang="scss" scoped>
.dark {
  .table {
    th {
      color: $white;
    }
  }

  .table tr:nth-child(odd) {
    color: $white-grey;
    background: #36393f;
  }

  .table tr:nth-child(even) {
    color: $white-grey;
    background: #46494f;
  }
}

.modal .table {
  margin-bottom: 0;
}

.modal-footer {
  margin-top: 1em;
}

.table tr .date {
  min-width: 160px;
  max-width: 160px;
  width: 160px;
}

.name {
  min-width: 160px;
  width: 160px;
}

td.person {
  font-size: 0.8em;
  padding-top: 0.9em;
}

.table-filler {
  width: 100%;
}
</style>
