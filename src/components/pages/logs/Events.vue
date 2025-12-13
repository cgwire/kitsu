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
      <people-field
        class="flexrow-item field"
        :label="$t('main.user')"
        :people="people"
        v-model="selectedPerson"
      />
      <button-simple
        class="flexrow-item small"
        icon="refresh"
        :is-loading="loading.events"
        :title="$t('main.reload')"
        @click="loadDayEvents()"
      />
    </div>

    <div class="mt2 empty" v-if="!loading.events && !filteredEvents.length">
      {{ $t('logs.empty_list') }}
    </div>
    <div class="has-text-centered" v-if="loading.events">
      <spinner />
    </div>
    <div class="log-list" v-else>
      <div
        class="event-line"
        :key="event.id"
        @click="selectLine(event)"
        v-for="event in filteredEvents"
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
        <ul v-if="selectedEvents[event.id]" @click.stop>
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
      <div class="has-text-centered mt1" v-if="hasMoreEvents">
        <button-simple
          :is-loading="loading.moreEvents"
          :text="$t('main.load_more')"
          @click="loadMoreEvents()"
        />
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
import PeopleField from '@/components/widgets/PeopleField.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'
import Spinner from '@/components/widgets/Spinner.vue'

const PAGE_SIZE = 1000

export default {
  name: 'events',

  mixins: [timeMixin],

  components: {
    ButtonSimple,
    DateField,
    PeopleAvatar,
    PeopleField,
    PeopleName,
    Spinner
  },

  data() {
    return {
      currentDate: new Date(),
      events: [],
      hasMoreEvents: false,
      selectedEvents: {},
      selectedPerson: null,
      loading: {
        events: false,
        moreEvents: false
      }
    }
  },

  mounted() {
    this.loadDayEvents()
  },

  computed: {
    ...mapGetters(['people', 'personMap', 'user']),

    today() {
      return moment().toDate()
    },

    filteredEvents() {
      let events = this.events
      if (this.selectedPerson) {
        events = events.filter(
          event => event.user_id === this.selectedPerson.id
        )
      }
      return events
    }
  },

  methods: {
    ...mapActions(['loadEvents']),

    async loadDayEvents() {
      const before = moment(this.currentDate).add(1, 'days')
      const after = moment(this.currentDate)
      this.selectedEvents = {}
      this.events = []
      this.loading.events = true
      try {
        const events = await this.loadEvents({
          after: formatFullDateWithRevertedTimezone(after, this.timezone),
          before: formatFullDateWithRevertedTimezone(before, this.timezone),
          limit: PAGE_SIZE
        })
        this.events = this.formatEvents(events)
        this.hasMoreEvents = events.length >= PAGE_SIZE
      } catch (err) {
        console.error(err)
      } finally {
        this.loading.events = false
      }
    },

    async loadMoreEvents() {
      if (!this.events.length) return

      this.loading.moreEvents = true
      const lastEventId = this.events[this.events.length - 1].id
      const before = moment(this.currentDate).add(1, 'days')
      const after = moment(this.currentDate)
      try {
        const events = await this.loadEvents({
          after: formatFullDateWithRevertedTimezone(after, this.timezone),
          before: formatFullDateWithRevertedTimezone(before, this.timezone),
          lastEventId,
          limit: PAGE_SIZE
        })
        this.events = [...this.events, ...this.formatEvents(events)]
        this.hasMoreEvents = events.length >= PAGE_SIZE
      } catch (err) {
        console.error(err)
      } finally {
        this.loading.moreEvents = false
      }
    },

    formatEvents(events) {
      return events.map(event => {
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
  flex-direction: column;
  margin-bottom: 2em;
}

.event-line {
  cursor: pointer;
  padding: 0.25em;
  border-radius: 4px;
  transition: background 0.2s ease;

  &:hover {
    background: var(--background-selectable);
  }

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

    a {
      color: var(--text);

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
