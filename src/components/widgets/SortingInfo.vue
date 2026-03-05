<template>
  <button-simple
    class="sorting-info mb05 is-small"
    icon="remove"
    :text="text"
    :title="$t('main.clear_sorting')"
    @click="$emit('clear-sorting')"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'

const { t } = useI18n()

const props = defineProps({
  sorting: {
    type: Array,
    required: true
  }
})

defineEmits(['clear-sorting'])

const text = computed(() => {
  return `${t('main.sorted_by')} ${props.sorting[0]?.name}`
})
</script>

<style lang="scss" scoped>
.sorting-info {
  align-self: end;
}
</style>
