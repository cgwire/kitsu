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
  },
  hasLinkedAssets: {
    type: Boolean,
    required: false
  }
})

const { t } = useI18n()

const options = computed(() => {
  const isTaskType = props.type.includes('tasktype-')

  return [
    {
      label: t('tasks.show_assignations'),
      value: 'showAssignations',
      when: !isTaskType
    },
    {
      label: t('tasks.show_infos'),
      value: 'showInfos',
      when: !isTaskType
    },
    {
      label: t('tasks.big_thumbnails'),
      value: 'bigThumbnails',
      when: !isTaskType
    },
    {
      label: t('tasks.show_contact_sheet'),
      value: 'contactSheetMode'
    },
    {
      label: t('shots.show_timecode'),
      value: 'inOutTimecode',
      when: props.type === 'shot'
    },
    {
      label: t('breakdown.show_library'),
      value: 'showSharedAssets',
      when: props.type === 'asset'
    },
    {
      label: t('assets.show_linked'),
      value: 'showLinkedAssets',
      when:
        (props.type === 'asset' || props.type === 'tasktype-asset') &&
        props.hasLinkedAssets
    }
  ]
    .filter(opt => opt.when !== false)
    .map(({ label, value }) => ({ label, value }))
})
</script>
