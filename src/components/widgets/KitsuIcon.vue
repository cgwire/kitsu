<template>
  <img :src="imgUrl" :title="title" :alt="alt" />
</template>

<script>
import assets from '@/assets/icons/fi_assets.svg'
import assetTypeStats from '@/assets/icons/fi_asset_stats.svg'
import automations from '@/assets/icons/fi-automations.svg'
import bot from '@/assets/icons/fi_user-bot.svg'
import breakdown from '@/assets/icons/fi_breakdown.svg'
import concepts from '@/assets/icons/fi_image.svg'
import custom from '@/assets/icons/fi_sliders.svg'
import departments from '@/assets/icons/fi_departments.svg'
import episodes from '@/assets/icons/fi_episodes.svg'
import edits from '@/assets/icons/fi_edits.svg'
import episodeStats from '@/assets/icons/fi_episode_stats.svg'
import myChecks from '@/assets/icons/fi-check-circle.svg'
import myProductions from '@/assets/icons/fi-my-productions.svg'
import myTasks from '@/assets/icons/fi-my-tasks.svg'
import newsFeed from '@/assets/icons/fi_news.svg'
import playlists from '@/assets/icons/fi_playlists.svg'
import productions from '@/assets/icons/fi-productions.svg'
import productionSettings from '@/assets/icons/fi_settings.svg'
import quota from '@/assets/icons/fi_quotas.svg'
import logs from '@/assets/icons/fi_logs.svg'
import schedule from '@/assets/icons/fi_calendar.svg'
import search from '@/assets/icons/fi_entity-search.svg'
import shots from '@/assets/icons/fi_shots.svg'
import sequences from '@/assets/icons/fi_sequences.svg'
import sequenceStats from '@/assets/icons/fi_sequence_stats.svg'
import taskStatus from '@/assets/icons/fi-task-status.svg'
import taskTypes from '@/assets/icons/fi-task-types.svg'
import team from '@/assets/icons/fi_users.svg'
import teamSchedule from '@/assets/icons/fi-team-schedule.svg'
import timesheets from '@/assets/icons/fi-timesheets.svg'

const icons = {
  assets,
  assetTypes: assetTypeStats,
  'asset-types': assets,
  automations,
  bot,
  breakdown,
  concepts,
  custom,
  departments,
  episodes,
  'episode-stats': episodeStats,
  edits,
  logs,
  'my-checks': myChecks,
  'my-productions': myProductions,
  'my-tasks': myTasks,
  newsFeed,
  playlists,
  productions,
  'production-settings': productionSettings,
  quota,
  'sequence-stats': sequenceStats,
  search,
  schedule,
  shots,
  sequences,
  settings: productionSettings,
  'task-status': taskStatus,
  'task-types': taskTypes,
  'team-schedule': teamSchedule,
  timesheets,
  team
}

export default {
  name: 'kitsu-icon',
  components: {},
  props: {
    name: {
      default: '',
      type: String
    },
    title: {
      default: '',
      type: String
    },
    alt: {
      default: '',
      type: String
    }
  },

  computed: {
    imgUrl() {
      return icons[this.name]
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  img {
    filter: brightness(90);
  }
}

img {
  filter: brightness(1.5);
}
</style>
