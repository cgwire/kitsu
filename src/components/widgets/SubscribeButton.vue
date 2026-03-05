<template>
  <button class="button" :title="buttonTitle" @click="$emit('click')">
    <eye-icon class="icon is-small" v-if="subscribed" />
    <eye-off-icon class="icon is-small" v-else />
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { EyeIcon, EyeOffIcon } from 'lucide-vue-next'

const { t } = useI18n()

const props = defineProps({
  subscribed: {
    default: false,
    type: Boolean
  }
})

defineEmits(['click'])

const buttonTitle = computed(() => {
  if (!props.subscribed) {
    return t('tasks.subscribe_notifications')
  } else {
    return t('tasks.unsubscribe_notifications')
  }
})
</script>
