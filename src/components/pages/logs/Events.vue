<template>
  <div class="mt1">
    <div class="flexrow">
      <date-field
        class="flexrow-item"
        :can-delete="false"
        :max-date="today"
        :label="$t('logs.current_date_label')"
        v-model="currentDate"
      />
      <button-simple
        class="flexrow-item small"
        icon="refresh"
        @click="loadDayEvents"
      />
      <span class="flexrow-item nb-events">
        {{ events.length }} {{ $t('logs.events') }}
      </span>
    </div>

    <div class="mt2 empty" v-if="!isLoading && !events.length">
      {{ $t('logs.empty_list') }}
    </div>
    <div class="has-text-centered" v-if="isLoading">
      <spinner />
    </div>
    <div class="log-list" v-else>
      <div
        class="event-line"
        :key="event.id"
        @click="selectLine(event)"
        v-for="event in events"
      >
        <span class="date tag mr1">{{ event.date }} </span>
        <span
          class="type tag"
          :title="event.type"
          :data-status="event.shortType"
        >
          {{ event.shortType }}
        </span>
        <span class="name tag mr1">{{ event.name }}</span>
        <ul v-if="selectedEvents[event.id]">
          <li class="flexrow">
            <span class="key">user</span>
            <people-avatar
              class="flexrow-item"
              :size="20"
              :font-size="10"
              :person="personMap.get(event.user_id)"
              v-if="event.user_id"
            />
            <people-name
              class="flexrow-item"
              :person="personMap.get(event.user_id)"
              with-link
              v-if="event.user_id"
            />
          </li>
          <li
            :key="`${event.id}-${key}`"
            v-for="key in Object.keys(event.data).sort()"
          >
            <span class="key">{{ key }}</span>
            <a :href="getLink(event, key)" v-if="isLink(key)">
              {{ event.data[key] }}
            </a>
            <template v-else>{{ event.data[key] }}</template>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'

import { formatFullDateWithRevertedTimezone } from '@/lib/time'
import { timeMixin } from '@/components/mixins/time'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import DateField from '@/components/widgets/DateField.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'
import Spinner from '@/components/widgets/Spinner.vue'

export default {
  name: 'events',

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
    ...mapGetters(['personMap', 'user']),

    today() {
      return moment().toDate()
    }
  },

  methods: {
    ...mapActions(['loadEvents']),

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
          this.events = events.map(event => {
            const [name, type] = event.name.split(':')
            return {
              id: event.id,
              date: this.formatDate(event.created_at),
              data: event.data,
              name,
              shortType: type.substring(0, 3),
              type,
              user_id: event.user_id
            }
          })
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    selectLine(event) {
      this.selectedEvents[event.id] = !this.selectedEvents[event.id]
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

  head() {
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

.empty {
  color: var(--text);
  font-style: italic;
}

.log-list {
  display: flex;
  gap: 0.5em;
  flex-direction: column;
  margin-bottom: 2em;
}

.event-line {
  cursor: pointer;

  .tag {
    border-radius: 4px;
  }

  .date {
    font-weight: 500;
    min-width: 140px;
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
    cursor: default;
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
