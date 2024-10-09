<template>
  <img :class="{ active }" :src="imgUrl" :title="title" :alt="alt" />
</template>

<script>
import assets from '@/assets/icons/fi-assets.svg'
import assetTypeStats from '@/assets/icons/fi-asset-stats.svg'
import addThumbnail from '@/assets/icons/fi-add-thumbnail.svg'
import automations from '@/assets/icons/fi-automations.svg'
import bot from '@/assets/icons/fi_user-bot.svg'
import bigThumbnail from '@/assets/icons/fi-big-thumbnail.svg'
import breakdown from '@/assets/icons/fi-breakdown.svg'
import concepts from '@/assets/icons/fi-image.svg'
import custom from '@/assets/icons/fi-sliders.svg'
import departments from '@/assets/icons/fi-departments.svg'
import importEdl from '@/assets/icons/fi-import-edl.svg'
import importFiles from '@/assets/icons/fi-import-files.svg'
import episodes from '@/assets/icons/fi-episodes.svg'
import edits from '@/assets/icons/fi-edits.svg'
import episodeStats from '@/assets/icons/fi-episode-stats.svg'
import filter from '@/assets/icons/fi-filter.svg'
import infos from '@/assets/icons/fi-info.svg'
import message from '@/assets/icons/fi-message-square.svg'
import myChecks from '@/assets/icons/fi-check-circle.svg'
import myProductions from '@/assets/icons/fi-my-productions.svg'
import myTasks from '@/assets/icons/fi-my-tasks.svg'
import newsFeed from '@/assets/icons/fi-news.svg'
import playlists from '@/assets/icons/fi-playlists.svg'
import productions from '@/assets/icons/fi-productions.svg'
import productionSettings from '@/assets/icons/fi-settings.svg'
import quota from '@/assets/icons/fi-quotas.svg'
import logs from '@/assets/icons/fi-logs.svg'
import priority from '@/assets/icons/fi-alert-circle.svg'
import refresh from '@/assets/icons/fi-rotate-ccw.svg'
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
import trash from '@/assets/icons/fi-trash-2.svg'
import user from '@/assets/icons/fi-user.svg'
import userCheck from '@/assets/icons/fi-user-check.svg'
import watch from '@/assets/icons/fi-eye.svg'
import myWorksheet from '@/assets/icons/fi-task-status.svg'

// Player icons

// import addPreview from '@/assets/icons/fi-add-preview.svg'
import annotations from '@/assets/icons/fi-annotations.svg'
import box from '@/assets/icons/fi-box.svg'
import compare from '@/assets/icons/fi-compare.svg'
import check from '@/assets/icons/fi-check-square.svg'
import deleteIcon from '@/assets/icons/fi-delete.svg'
import exportIcon from '@/assets/icons/fi-export-csv.svg'
import exportLines from '@/assets/icons/fi-export-lines.svg'
import importIcon from '@/assets/icons/fi-import-csv.svg'
import repeat from '@/assets/icons/fi-repeat.svg'
import textIcon from '@/assets/icons/fi-text.svg'
import play from '@/assets/icons/fi-play.svg'
import soundOn from '@/assets/icons/fi-sound-on.svg'
import soundOff from '@/assets/icons/fi-sound-off.svg'
import laser from '@/assets/icons/fi-laser.svg'
import waveform from '@/assets/icons/fi-waveform.svg'

const icons = {
  'add-thumbnail': addThumbnail,
  assets,
  assetTypes: assetTypeStats,
  'asset-types': assets,
  automations,
  bot,
  'big-thumbnail': bigThumbnail,
  box,
  breakdown,
  compare,
  concepts,
  custom,
  check,
  delete: deleteIcon,
  departments,
  filter,
  episodes,
  'episode-stats': episodeStats,
  edits,
  export: exportIcon,
  'export-lines': exportLines,
  import: importIcon,
  'import-edl': importEdl,
  'import-files': importFiles,
  infos,
  laser,
  logs,
  message,
  'my-checks': myChecks,
  'my-worksheet': myWorksheet,
  'my-productions': myProductions,
  'my-tasks': myTasks,
  newsFeed,
  playlists,
  productions,
  'production-settings': productionSettings,
  quota,
  pen: annotations,
  play,
  priority,
  refresh,
  restore: refresh,
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
  trash,
  type: textIcon,
  timesheets,
  user,
  'user-check': userCheck,
  team,
  watch,
  waveform
}

export default {
  name: 'kitsu-icon',

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
      default: undefined,
      type: String
    },
    active: {
      default: false,
      type: Boolean
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

img.active {
  filter: invert(59%) sepia(38%) saturate(660%) hue-rotate(201deg)
    brightness(95%) contrast(93%);
  box-shadow: none;
}
</style>
