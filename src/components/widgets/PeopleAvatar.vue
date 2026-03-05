<template>
  <router-link
    class="avatar has-text-centered"
    :class="{ bot: person.is_bot }"
    :style="style"
    :title="person.full_name"
    :to="{
      name: 'person',
      params: {
        person_id: person.id
      }
    }"
    v-if="person?.id && isLink"
  >
    <img
      :loading="isLazy ? 'lazy' : undefined"
      alt=""
      :src="person.avatarPath"
      v-if="person.has_avatar"
    />
    <template v-else>{{ person.initials }}</template>
  </router-link>

  <span
    class="avatar has-text-centered"
    :class="{ bot: person.is_bot }"
    :title="person.full_name"
    :style="style"
    v-else-if="person"
  >
    <img
      :loading="isLazy ? 'lazy' : undefined"
      alt=""
      :src="person.avatarPath"
      v-if="person.has_avatar"
    />
    <template v-else>{{ person.initials }}</template>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const props = defineProps({
  person: {
    type: Object,
    required: true
  },
  size: {
    type: Number,
    default: 40
  },
  fontSize: {
    type: Number,
    default: 18
  },
  isLink: {
    type: Boolean,
    default: true
  },
  isLazy: {
    type: Boolean,
    default: true
  }
})

const isDarkTheme = computed(() => store.getters.isDarkTheme)

const style = computed(() => {
  return {
    color: isDarkTheme.value ? '#333' : '#FFF',
    width: `${props.size}px`,
    height: `${props.size}px`,
    fontSize: props.person.has_avatar ? 0 : `${props.fontSize}px`,
    backgroundColor: props.person.color
  }
})
</script>

<style lang="scss" scoped>
.avatar {
  color: #333;
  display: flex;
  align-items: center;
  font-weight: bold;
  justify-content: center;
  position: relative;
  flex-shrink: 0;

  a {
    margin: 0;
  }

  img {
    max-height: 100%;
    height: 100%;
    width: 100%;
  }
}

.flexrow-item {
  margin-right: 10px;
}
</style>
