<template>
  <div class="data-list">
    <table class="details table" v-if="!isLoading">
      <thead>
        <tr>
          <th>{{ $t('quota.details_name') }}</th>
          <th>
            {{
              $t(
                countMode === 'seconds'
                  ? 'quota.details_seconds'
                  : 'quota.details_frames'
              )
            }}
          </th>
          <th>{{ $t('quota.weight') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr :key="`shot-quota-${shot.id}`" v-for="shot in shots">
          <td>{{ shot.full_name }}</td>
          <td>{{ getQuota(shot) }}</td>
          <td>{{ shot.weight }}</td>
        </tr>
      </tbody>
    </table>

    <table-info
      :is-loading="isLoading"
      :is-error="isLoadingError"
      :cells="2"
      :with-thumbnail="false"
      :with-actions="false"
    />
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { computed } from 'vue'
import { useStore } from 'vuex'

import { frameToSeconds } from '@/lib/video'

import TableInfo from '@/components/widgets/TableInfo.vue'

const store = useStore()

// Props
// --------------------------------------------------------------------------
const props = defineProps({
  shots: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  isLoadingError: { type: Boolean, default: false },
  countMode: { type: String, default: 'frames' }
})

// Computed
// --------------------------------------------------------------------------
const currentProduction = computed(() => store.getters.currentProduction)

// Functions
// --------------------------------------------------------------------------
const getQuota = shot =>
  props.countMode === 'seconds'
    ? frameToSeconds(shot.nb_frames, currentProduction.value, shot)
    : shot.nb_frames
</script>

<style lang="scss" scoped>
.dark {
  .table {
    thead,
    tbody tr:nth-child(odd) {
      color: $white-grey;
      background: var(--background);
    }

    tbody tr:nth-child(even) {
      color: $white-grey;
      background: var(--background-alt);
    }

    thead th,
    thead:hover {
      color: $white-grey;
      background: var(--background);
      border-color: var(--border-alt);
    }

    tbody td {
      border-color: var(--border);
    }

    tbody tr:hover {
      color: $white-grey;
      background: #5e6169;
    }
  }
}

tbody {
  tr:nth-child(even) {
    background: #f6f6f6;
  }

  tr:hover {
    background: $light-green-lightest;
  }
}
</style>
