<template>
  <button
    :class="{
      'level-item': true,
      button: true,
      'is-toggle': true,
      'is-on': buttonIsOn
    }"
    :title="$t(buttonIsOn ? 'tasks.hide_infos' : 'tasks.show_infos')"
    @click="toggleInfos"
  >
    <kitsu-icon
      class="icon is-small"
      name="infos"
      :title="$t(buttonIsOn ? 'tasks.hide_infos' : 'tasks.show_infos')"
    />
  </button>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'

import preferences from '@/lib/preferences'

import KitsuIcon from '@/components/widgets/KitsuIcon.vue'

const store = useStore()

const isShowInfosBreakdown = computed(() => store.getters.isShowInfosBreakdown)

const buttonIsOn = computed(() => isShowInfosBreakdown.value)

const hideInfosBreakdown = () => {
  return store.dispatch('hideInfosBreakdown')
}

const showInfosBreakdown = () => {
  return store.dispatch('showInfosBreakdown')
}

const toggleInfos = () => {
  if (isShowInfosBreakdown.value) {
    hideInfosBreakdown()
  } else {
    showInfosBreakdown()
  }
}

onMounted(() => {
  if (preferences.getBoolPreference('show-infos-breakdown', true)) {
    showInfosBreakdown()
  } else {
    hideInfosBreakdown()
  }
})

watch(isShowInfosBreakdown, () => {
  preferences.setBoolPreference(
    'show-infos-breakdown',
    isShowInfosBreakdown.value
  )
})
</script>

<style lang="scss" scoped>
.button {
  border-radius: 10px;
  padding: 0 10px;
}

.button .icon {
  height: 18px;
  width: 18px;
}
</style>
