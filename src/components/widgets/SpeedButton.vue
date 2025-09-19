<template>
  <button-simple
    :title="$t('playlists.actions.speed')"
    :text="speedTextMap[model - 1]"
    @click="onSpeedClicked"
  />
</template>

<script setup>
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'

const model = defineModel()

const speedTextMap = {
  0: 'x0.25',
  1: 'x0.50',
  2: 'x1.00',
  3: 'x1.50',
  4: 'x2.00'
}

const onSpeedClicked = () => {
  const rates = [0.25, 0.5, 1, 1.5, 2]
  model.value = (model.value % rates.length) + 1
}
</script>

<style scoped></style>
