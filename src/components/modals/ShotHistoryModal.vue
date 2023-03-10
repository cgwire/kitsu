<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background" @click="$emit('cancel')"></div>

    <div class="modal-content">
      <div class="box content">
        <h1 class="title">
          {{ $t('shots.history') }}
        </h1>

        <table class="table" ref="headerWrapper">
          <thead class="table-header">
            <tr>
              <th class="date">{{ $t('main.date') }}</th>
              <th class="name">{{ $t('shots.fields.name') }}</th>
              <th class="frame-in">{{ $t('shots.fields.frame_in') }}</th>
              <th class="frame-out">{{ $t('shots.fields.frame_out') }}</th>
              <th class="person table-filler">
                {{ $t('shots.fields.person') }}
              </th>
            </tr>
          </thead>
        </table>

        <div class="table-body" v-if="!isLoading">
          <table class="table">
            <tbody class="table-body">
              <tr
                class="shot-version"
                :key="version.id"
                v-for="version in versions"
              >
                <td class="date">
                  {{ formatDate(version.created_at) }}
                </td>
                <td class="name">
                  {{ version.name }}
                </td>
                <td class="frame-in">
                  {{ version.data.frame_in }}
                </td>
                <td class="frame-out">
                  {{ version.data.frame_out }}
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
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from '@/components/modals/base_modal'
import { formatDate } from '@/lib/time'

import TableInfo from '@/components/widgets/TableInfo'

export default {
  name: 'shot-history-modal',
  mixins: [modalMixin],

  components: {
    TableInfo
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    shot: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {
      isError: false,
      isLoading: false,
      versions: []
    }
  },

  mounted() {
    this.reset()
  },

  computed: {
    ...mapGetters(['personMap'])
  },

  methods: {
    ...mapActions(['loadShotHistory']),

    formatDate(dateString) {
      return formatDate(dateString)
    },

    getPersonFullName(personId) {
      const person = this.personMap.get(personId)
      return person ? person.full_name : ''
    },

    loadData() {
      this.isError = false
      this.isLoading = true
      return this.loadShotHistory(this.shot.id)
        .then(versions => {
          this.versions = versions
          this.isLoading = false
        })
        .catch(err => {
          console.error(err)
          this.isLoading = false
          this.isError = true
        })
    },

    reset() {
      this.versions = []
      this.isError = false
      this.isLoading = false
    }
  },

  watch: {
    active() {
      if (this.active) {
        this.reset()
        this.loadData()
      }
    }
  }
}
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

.frame-out,
.frame-in {
  min-width: 80px;
  width: 80px;
}

td.person {
  font-size: 0.8em;
  padding-top: 0.9em;
}

.table-filler {
  width: 100%;
}
</style>
