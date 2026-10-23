<template>
  <div class="production-overview">
    <router-link class="production" :to="playlistsPath">
      <div class="avatar" :style="{ background: avatarColor }">
        <template v-if="!production.has_avatar">{{ avatarLetter }}</template>
        <img :src="thumbnailPath" alt="" v-else />
      </div>
      <div class="identity">
        <h2 class="overview-name">{{ production.name }}</h2>
        <div class="counts" v-if="!isLoading">
          <div v-if="nbEpisodes">
            {{ nbEpisodes }} {{ $t('episodes.number', { count: nbEpisodes }) }}
          </div>
          <div v-if="nbShots">
            {{ nbShots }} {{ $t('shots.number', { count: nbShots }) }}
          </div>
          <div v-if="nbAssets">
            {{ nbAssets }} {{ $t('assets.number', { count: nbAssets }) }}
          </div>
        </div>
      </div>
    </router-link>

    <div class="details">
      <section class="playlists">
        <div class="flexrow section-head">
          <h3 class="section-title flexrow-item">
            {{ $t('productions.home.latest_playlists') }}
          </h3>
          <span class="filler"></span>
          <router-link
            class="all-playlists flexrow-item"
            :to="playlistsPath"
            v-if="playlists.length"
          >
            {{ $t('productions.home.all_playlists') }}
          </router-link>
        </div>
        <spinner v-if="isLoading" />
        <div class="playlist-cards" v-else-if="playlists.length">
          <router-link
            class="playlist"
            :key="playlist.id"
            :to="playlistPath(playlist)"
            v-for="playlist in latestPlaylists"
          >
            <light-entity-thumbnail
              class="playlist-thumbnail"
              :preview-file-id="playlist.first_preview_file_id"
              type="previews"
              width="100%"
              height="100%"
              max-width="100%"
              max-height="100%"
              empty-width="100%"
              empty-height="100%"
              :title="playlist.name"
            />
            <div class="playlist-caption">
              <div class="playlist-name">{{ playlist.name }}</div>
              <div class="playlist-date">
                {{ formatDate(playlist.updated_at) }}
              </div>
            </div>
          </router-link>
        </div>
        <p class="empty" v-else>{{ $t('productions.home.no_playlist') }}</p>
      </section>

      <section class="progress-section" v-if="clientAccess.isStatsVisible">
        <div class="flexrow section-head">
          <h3 class="section-title flexrow-item">
            {{ $t('productions.home.progress') }}
          </h3>
          <span class="filler"></span>
          <router-link
            class="all-stats flexrow-item"
            :to="statsPath"
            v-if="statsPath"
          >
            {{ $t('productions.home.all_stats') }}
          </router-link>
        </div>
        <spinner v-if="isLoading" />
        <div class="departments" v-else-if="departments.length">
          <div
            class="department"
            :key="department.id"
            v-for="department in departments"
          >
            <department-name
              class="department-label"
              :department="department"
              no-padding
            />
            <stats-bar :data="chartData(department.id)" />
          </div>
        </div>
        <p class="empty" v-else>{{ $t('productions.home.no_progress') }}</p>
      </section>
    </div>
  </div>
</template>

<script setup>
/*
 * One production of the client home: its size, its latest playlists and its
 * progress by department, from the entities with tasks and the playlists
 * given.
 */
import { computed } from 'vue'
import { useStore } from 'vuex'

import { useFormat } from '@/composables/format'
import colors from '@/lib/colors'
import { getPlaylistPath } from '@/lib/path'
import { computeDepartmentStats, getChartData } from '@/lib/stats'

import DepartmentName from '@/components/widgets/DepartmentName.vue'
import LightEntityThumbnail from '@/components/widgets/LightEntityThumbnail.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import StatsBar from '@/components/widgets/StatsBar.vue'

// Composables
// --------------------------------------------------------------------------
const store = useStore()
const { formatDate } = useFormat()

// Props
// --------------------------------------------------------------------------
const props = defineProps({
  entities: { type: Array, default: () => [] },
  episodes: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  playlists: { type: Array, default: () => [] },
  production: { type: Object, required: true }
})

// Computed
// --------------------------------------------------------------------------
const departmentMap = computed(() => store.getters.departmentMap)
const taskStatusMap = computed(() => store.getters.taskStatusMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const avatarColor = computed(() => colors.fromString(props.production.name))
const avatarLetter = computed(() =>
  (props.production.name?.[0] || 'P').toUpperCase()
)
const thumbnailPath = computed(() => {
  const { id, updated_at: updatedAt, created_at: createdAt } = props.production
  const timestamp = Date.parse(updatedAt || createdAt)
  return `/api/pictures/thumbnails/projects/${id}.png?t=${timestamp}`
})

const countEntities = type =>
  props.entities.filter(entity => entity.type === type && !entity.canceled)
    .length
const nbAssets = computed(() => countEntities('Asset'))
const nbEpisodes = computed(
  () => props.episodes.filter(episode => !episode.canceled).length
)
const nbShots = computed(() => countEntities('Shot'))

const clientAccess = computed(() =>
  store.getters.getClientAccess(props.production.id)
)

const departmentStats = computed(() => {
  const { isTaskTypeVisible } = clientAccess.value
  const entities = props.entities.map(entity => ({
    ...entity,
    tasks: entity.tasks?.filter(task => isTaskTypeVisible(task.task_type_id))
  }))
  return computeDepartmentStats(
    entities,
    taskTypeMap.value,
    taskStatusMap.value
  )
})
// The departments holding tasks, by name: the production task types are
// not a reliable list, tasks exist outside of it.
const departments = computed(() =>
  Object.keys(departmentStats.value.all)
    .map(departmentId => departmentMap.value.get(departmentId))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name))
)

const latestPlaylists = computed(() => props.playlists.slice(0, 3))

const episodeId = computed(() =>
  props.production.production_type === 'tvshow'
    ? props.production.first_episode_id || 'all'
    : null
)
const playlistsPath = computed(() => {
  const route = {
    name: 'playlists',
    params: { production_id: props.production.id }
  }
  if (episodeId.value) {
    route.name = 'episode-playlists'
    route.params.episode_id = episodeId.value
  }
  return route
})

// An assets production has no sequence nor episode to show stats of.
const statsPath = computed(() => {
  const { id, production_type: productionType } = props.production
  if (productionType === 'assets') return null
  return {
    name: productionType === 'tvshow' ? 'episode-stats' : 'sequence-stats',
    params: { production_id: id }
  }
})

// The bar reads from left to right: done, retake, waiting for approval,
// then the other statuses in the order of the production. The chart rows
// only carry the status name, hence the rank by name.
const statusRanks = computed(() => {
  const productionOrder = props.production.task_statuses || []
  const rank = status => {
    if (status.is_done) return 0
    if (status.is_retake) return 1
    if (status.is_feedback_request) return 2
    const index = productionOrder.indexOf(status.id)
    return index === -1 ? Infinity : 3 + index
  }
  return new Map(
    [...taskStatusMap.value.values()].map(status => [status.name, rank(status)])
  )
})

// Functions
// --------------------------------------------------------------------------
const chartData = departmentId =>
  getChartData(departmentStats.value, 'all', departmentId).sort(
    (a, b) =>
      (statusRanks.value.get(a[0]) ?? Infinity) -
      (statusRanks.value.get(b[0]) ?? Infinity)
  )

// A TV-show playlist without episode is the main pack, unless it is for all.
const playlistPath = playlist =>
  getPlaylistPath(
    props.production.id,
    episodeId.value &&
      (playlist.episode_id || (playlist.is_for_all ? 'all' : 'main')),
    playlist.id
  )
</script>

<style lang="scss" scoped>
// A production is two side-by-side panels: who it is, and where it stands.
.production-overview {
  display: flex;
  gap: 1.5em;
  margin-bottom: 1.5em;

  &:last-child {
    margin-bottom: 0;
  }
}

// The raised panel of the task pages and charts.
.production,
.details {
  --text-strong: var(--text-panel);

  background: var(--background-panel-raised);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 1px 4px var(--box-shadow);
}

.production {
  color: var(--text);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  justify-content: center;
  padding: 2em 1em;
  text-align: center;
  width: 200px;

  .avatar {
    align-items: center;
    border-radius: 16px;
    color: white;
    display: flex;
    font-size: 2.4em;
    height: 96px;
    justify-content: center;
    margin: 0 auto;
    overflow: hidden;
    width: 96px;

    img {
      height: 100%;
      object-fit: cover;
      width: 100%;
    }
  }

  // The global h2 is an uppercase, underlined section title.
  .overview-name {
    border-bottom: 0;
    font-size: 1.2em;
    font-weight: 500;
    margin: 0.6em 0 0.3em 0;
    text-transform: none;
  }

  .counts {
    color: var(--text-alt);
    font-size: 0.9em;
    line-height: 1.5;
  }

  &:hover .overview-name {
    text-decoration: underline;
  }
}

.details {
  flex: 1;
  min-width: 0;
  padding: 1.5em 2em;
}

.section-head {
  margin-bottom: 0.8em;
}

.section-title {
  color: var(--text-alt);
  font-size: 0.9em;
  font-weight: 500;
  letter-spacing: 0.05em;
  margin: 0 0 0.8em 0;
  text-transform: uppercase;

  .section-head & {
    margin-bottom: 0;
  }
}

.playlists {
  margin-bottom: 2em;
}

.playlist-cards {
  display: grid;
  gap: 1em;
  grid-template-columns: repeat(3, 1fr);
}

// A playlist card is its first frame, with the name laid over the bottom.
.playlist {
  aspect-ratio: 16 / 9;
  background: $dark-grey;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  color: white;
  overflow: hidden;
  position: relative;
  transition: box-shadow 0.2s ease;

  :deep(.playlist-thumbnail) {
    display: block;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover,
  &:focus-visible {
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
  }

  &:hover :deep(.playlist-thumbnail),
  &:focus-visible :deep(.playlist-thumbnail) {
    transform: scale(1.05);
  }

  .playlist-caption {
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
    bottom: 0;
    left: 0;
    padding: 2em 0.8em 0.6em 0.8em;
    position: absolute;
    right: 0;
  }

  .playlist-name {
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
    white-space: nowrap;
  }

  .playlist-date {
    font-size: 0.8em;
    opacity: 0.8;
  }
}

.all-playlists,
.all-stats {
  font-size: 0.9em;
}

.departments {
  display: grid;
  gap: 1em 2.5em;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}

.department-label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.3em;
}

.empty {
  color: var(--text-alt);
}

@media screen and (max-width: 768px) {
  .production-overview {
    flex-direction: column;
    gap: 1em;
  }

  // The production becomes a strip: logo on the left, name and counts next
  // to it.
  .production {
    align-items: center;
    flex-direction: row;
    gap: 1em;
    justify-content: flex-start;
    padding: 1em 1.5em;
    text-align: left;
    width: 100%;

    .avatar {
      font-size: 1.8em;
      height: 64px;
      margin: 0;
      width: 64px;
    }

    .overview-name {
      margin-top: 0;
    }
  }

  .details {
    padding: 1.2em 1.5em;
  }

  .playlist-cards {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>
