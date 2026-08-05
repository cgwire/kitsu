<template>
  <div class="has-text-centered">
    <p class="info">
      <img :src="illustration" alt="" />
    </p>
    <p class="info">{{ message }}</p>
    <button-simple
      class="level-item big-button"
      :text="buttonText"
      @click="$emit('create')"
      v-if="isCurrentUserManager && buttonText"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import emptyListIllustration from '@/assets/illustrations/empty_list.png'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'

// Props / Emits

const props = defineProps({
  text: { type: String, default: '' },
  readOnlyText: { type: String, default: '' },
  buttonText: { type: String, default: '' },
  illustration: { type: String, default: emptyListIllustration }
})

defineEmits(['create'])

// Composables

const store = useStore()

// Computed

// Only admins and managers can create entities, so they are the only ones
// invited to do it. The others get a plain statement instead.
const isCurrentUserManager = computed(() => store.getters.isCurrentUserManager)

const message = computed(() =>
  isCurrentUserManager.value ? props.text : props.readOnlyText
)
</script>

<style lang="scss" scoped>
.info img {
  max-width: 80vh;
}
</style>
