<template>
<div class="data-list">
  <table class="details table" v-if="!isLoading">
    <thead>
      <tr>
        <th>{{ $t('quota.details_name') }}</th>
        <th>
        {{
          this.countMode === 'seconds'
            ? $t('quota.details_seconds')
            : $t('quota.details_frames')
        }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        :key="`shot-quota-${shot.id}`"
        v-for="shot in shots"
      >
        <td>{{ shot.full_name }}</td>
        <td>{{ getQuota(shot) }}</td>
      </tr>
    </tbody>
  </table>

  <table-info
    :is-loading="isLoading"
    :is-error="isLoadingError"
  />
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import { frameToSeconds } from '../../lib/video'
import TableInfo from '../widgets/TableInfo'

export default {
  name: 'quota-shot-list',

  components: {
    TableInfo
  },

  data () {
    return {
      projectNames: {}
    }
  },

  props: {
    shots: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isLoadingError: {
      type: Boolean,
      default: false
    },
    countMode: {
      type: String,
      default: 'frames'
    }
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'lastProductionScreen',
      'taskTypeMap'
    ])
  },

  methods: {
    ...mapActions([
    ]),

    getQuota (shot) {
      if (this.countMode === 'seconds') {
        return frameToSeconds(shot.nb_frames, this.currentProduction, shot)
      } else {
        return shot.nb_frames
      }
    }
  },

  watch: {
  }
}
</script>

<style lang="scss" scoped>
.dark {
  header tr:hover {
    background: transparent;
  }

  .table {
    thead,
    tbody tr:nth-child(odd) {
      color: $white-grey;
      background: #36393F;
    }

    tbody tr:nth-child(even) {
      color: $white-grey;
      background: #46494F;
    }

    thead th,
    thead:hover {
      color: $white-grey;
      background: #36393F;
      border-color: #666666;
    }

    tbody td {
      border-color: #25282E;
    }

    tbody tr:hover {
      color: $white-grey;
      background: #5E6169;
    }
  }
}

tbody {
  tr:nth-child(even) {
    background: #F6F6F6;
  }

  tr:hover {
    background: $light-green-lightest;
  }
}

.name {
  width: 300px;
}
</style>
