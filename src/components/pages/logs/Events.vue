<template>
  <div class="mt1">
    <div class="flexrow">
      <date-field
        class="flexrow-item"
        :disabled-dates="{ from: today }"
        :label="$t('logs.current_date_label')"
        v-model="currentDate"
      />
      <button-simple
        class="flexrow-item"
        icon="refresh"
        @click="loadDayEvents"
      />
      <span class="flexrow-item nb-events">
        {{ events.length }} {{ $t('logs.events') }}
      </span>
    </div>

    <div class="mt2" v-if="!isLoading && events.length === 0">
      {{ $t('logs.empty_list') }}
    </div>
    <div class="has-text-centered" v-if="isLoading">
      <spinner />
    </div>
    <div class="log-list" v-else>
      <div
        class="mt05 event-line"
        :key="event.id"
        @click="selectLine(event)"
        v-for="event in events"
      >
        <div>
          <span class="date tag mr1">{{ formatDate(event.created_at) }} </span>
          <span
            class="type tag"
            :title="event.name.split(':')[1]"
            :data-status="formatType(event)"
          >
            {{ formatType(event) }}
          </span>
          <span class="name tag mr1">{{ event.name.split(':')[0] }}</span>
        </div>
        <ul v-show="selectedEvents[event.id]">
          <li class="flexrow">
            <span class="key">user</span>
            <people-avatar
              class="flexrow-item"
              :size="20"
              :person="personMap.get(event.user_id)"
              v-if="event.user_id"
            />
            <people-name
              class="flexrow-item"
              :person="personMap.get(event.user_id)"
              v-if="event.user_id"
            />
          </li>
          <li
            class="variable"
            :key="event.id + '-' + key"
            v-for="key in Object.keys(event.data).sort()"
          >
            <span class="key">{{ key }}</span>
            <a :href="getLink(event, key)" v-if="isLink(key)">
              {{ event.data[key] }}
            </a>
            <span v-else>{{ event.data[key] }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'
import Vue from 'vue/dist/vue'

import { formatFullDateWithRevertedTimezone } from '@/lib/time'
import { timeMixin } from '@/components/mixins/time'

import ButtonSimple from '@/components/widgets/ButtonSimple'
import DateField from '@/components/widgets/DateField'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import PeopleName from '@/components/widgets/PeopleName'
import Spinner from '@/components/widgets/Spinner'

export default {
  name: 'Events',
  mixins: [timeMixin],

  components: {
    ButtonSimple,
    DateField,
    PeopleAvatar,
    PeopleName,
    Spinner
  },

  data() {
    return {
      currentDate: new Date(),
      events: [],
      isLoading: true,
      selectedEvents: {}
    }
  },

  mounted() {
    this.loadDayEvents()
  },

  computed: {
    ...mapGetters(['personMap', 'productionMap', 'user']),

    today() {
      return moment().toDate()
    }
  },

  methods: {
    ...mapActions(['loadEvents']),

    formatType(event) {
      return event.name.split(':')[1].substring(0, 3)
    },

    loadDayEvents() {
      const before = moment(this.currentDate).add(1, 'days')
      const after = moment(this.currentDate)
      this.selectedEvents = {}
      this.isLoading = true
      this.loadEvents({
        after: formatFullDateWithRevertedTimezone(after, this.timezone),
        before: formatFullDateWithRevertedTimezone(before, this.timezone)
      })
        .then(events => {
          this.isLoading = false
          this.events = events
        })
        .catch(err => {
          this.isLoading = false
          console.error(err)
        })
    },

    selectLine(event) {
      Vue.set(this.selectedEvents, event.id, !this.selectedEvents[event.id])
    },

    isLink(key) {
      const linkKeys = ['project_id', 'task_id']
      return linkKeys.includes(key)
    },

    getLink(event, key) {
      const productionId = event.data.project_id
      const entityType = key.substring(0, key.length - 3)
      if (entityType === 'project') {
        return `/productions/${productionId}/news-feed`
      } else {
        const entityId = event.data[key]
        return `/productions/${productionId}/${entityType}s/${entityId}`
      }
    }
  },

  watch: {
    currentDate() {
      this.loadDayEvents()
    }
  },

  metaInfo() {
    return {
      title: `${this.$t('logs.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .tag {
    color: $white;
    background: $dark-grey;
  }

  .nb-events {
    color: $white;
  }
}

.log-list {
  margin-bottom: 2em;
}

.event-line {
  cursor: pointer;

  .tag {
    border-radius: 4px;
  }

  .date {
    font-weight: 500;
  }

  .type {
    text-transform: uppercase;
    min-width: 50px;
  }

  .type[data-status='new'] {
    color: white;
    background: $green;
  }

  .type[data-status='upd'] {
    color: white;
    background: $blue;
  }

  .type[data-status='add'] {
    color: white;
    background: $dark-purple;
  }

  .type[data-status='del'] {
    color: white;
    background: $red;
  }

  .type[data-status='sta'] {
    color: white;
    background: $pink;
  }

  .type[data-status='set'] {
    background: $purple;
  }

  ul {
    color: var(--text);
    border-left: 3px solid $light-grey;
    list-style-type: none;
    margin: 1em 1em 2em 0.2em;
    padding-left: 1em;

    .key {
      font-weight: 500;
      width: 170px;
      display: inline-block;
    }
  }
}
</style>
