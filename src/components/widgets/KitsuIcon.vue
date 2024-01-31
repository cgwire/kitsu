<template>
  <img :src="imgUrl" :title="title" :alt="alt" />
</template>

<script>
import assets from '@/assets/icons/fi-assets.svg'
import assetTypeStats from '@/assets/icons/fi-asset-stats.svg'
import automations from '@/assets/icons/fi-automations.svg'
import bot from '@/assets/icons/fi_user-bot.svg'
import breakdown from '@/assets/icons/fi-breakdown.svg'
import concepts from '@/assets/icons/fi-image.svg'
import custom from '@/assets/icons/fi-sliders.svg'
import departments from '@/assets/icons/fi-departments.svg'
import episodes from '@/assets/icons/fi-episodes.svg'
import edits from '@/assets/icons/fi-edits.svg'
import episodeStats from '@/assets/icons/fi-episode-stats.svg'
import filter from '@/assets/icons/fi-filter.svg'
import myChecks from '@/assets/icons/fi-check-circle.svg'
import myProductions from '@/assets/icons/fi-my-productions.svg'
import myTasks from '@/assets/icons/fi-my-tasks.svg'
import newsFeed from '@/assets/icons/fi-news.svg'
import playlists from '@/assets/icons/fi-playlists.svg'
import productions from '@/assets/icons/fi-productions.svg'
import productionSettings from '@/assets/icons/fi-settings.svg'
import quota from '@/assets/icons/fi-quotas.svg'
import logs from '@/assets/icons/fi-logs.svg'
import schedule from '@/assets/icons/fi-calendar.svg'
import search from '@/assets/icons/fi-entity-search.svg'
import shots from '@/assets/icons/fi-shots.svg'
import sequences from '@/assets/icons/fi-sequences.svg'
import sequenceStats from '@/assets/icons/fi-sequence-stats.svg'
import taskStatus from '@/assets/icons/fi-task-status.svg'
import taskTypes from '@/assets/icons/fi-task-types.svg'
import team from '@/assets/icons/fi-users.svg'
import teamSchedule from '@/assets/icons/fi-team-schedule.svg'
import timesheets from '@/assets/icons/fi-timesheets.svg'


import importIcon from '@/assets/icons/fi-import-csv.svg'
import compare from '@/assets/icons/fi-compare.svg'
import box from '@/assets/icons/fi-box.svg'
import play from '@/assets/icons/fi-play.svg'
import skybox from '@/assets/icons/fi-skybox.svg'
import download from '@/assets/icons/fi-download.svg'
import exportIcon from '@/assets/icons/fi-export-csv.svg'
import exportLines from '@/assets/icons/fi-export-lines.svg'
import zoomIn from '@/assets/icons/fi-zoom-in.svg'
import repeat from '@/assets/icons/fi-repeat.svg'
import textIcon from '@/assets/icons/fi-text.svg'
import skyboxDesactive from '@/assets/icons/fi-skybox-desactive.svg'
import zoomOut from '@/assets/icons/fi-zoom-out.svg'
import addPreview from '@/assets/icons/fi-add-preview.svg'
import maximize from '@/assets/icons/fi-maximize.svg'
import soundOn from '@/assets/icons/fi-sound-on.svg'
import soundOff from '@/assets/icons/fi-sound-off.svg'
import laser from '@/assets/icons/fi-laser.svg'
import annotations from '@/assets/icons/fi-annotations.svg'

const icons = {
  assets,
  assetTypes: assetTypeStats,
  'asset-types': assets,
  automations,
  bot,
  breakdown,
  compare,
  concepts,
  custom,
  departments,
  filter,
  episodes,
  'episode-stats': episodeStats,
  edits,
  export: exportIcon,
  'export-lines': exportLines,
  import: importIcon,
  laser,
  logs,
  'my-checks': myChecks,
  'my-productions': myProductions,
  'my-tasks': myTasks,
  newsFeed,
  playlists,
  productions,
  'production-settings': productionSettings,
  quota,
  pen: annotations,
  play,
  repeat,
  'sequence-stats': sequenceStats,
  search,
  schedule,
  shots,
  sequences,
  settings: productionSettings,
  soundon: soundOn,
  soundoff: soundOff,
  'task-status': taskStatus,
  'task-types': taskTypes,
  'team-schedule': teamSchedule,
  type: textIcon,
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
