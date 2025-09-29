<template>
  <combobox-options
    :options="options"
    thin
    :title="$t('entities.display_options')"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import ComboboxOptions from '@/components/widgets/ComboboxOptions.vue'

const props = defineProps({
  type: {
    type: String,
    required: true
  }
})

const { t } = useI18n()

const options = computed(() => {
  const opts = [
    {
      label: t('tasks.show_assignations'),
      value: 'showAssignations'
    },
    {
      label: t('tasks.show_infos'),
      value: 'showInfos'
    },
    {
      label: t('tasks.big_thumbnails'),
      value: 'bigThumbnails'
    },
    {
      label: t('tasks.show_contact_sheet'),
      value: 'contactSheetMode'
    }
  ]
  if (props.type === 'shot') {
    opts.push({
      label: t('shots.show_timecode'),
      value: 'inOutTimecode'
    })
  } else if (props.type === 'asset') {
    opts.push({
      label: t('breakdown.show_library'),
      value: 'showSharedAssets'
    })
  }
  return opts
})
</script>
