<template>
  <span
    class="avatar has-text-centered"
    :style="{
      background: person.color,
      width: size + 'px',
      height: size + 'px',
      'min-width': size + 'px',
      'min-height': size + 'px',
      'font-size': person.has_avatar ? 0 : fontSize + 'px'
    }"
    v-if="isLink"
  >
    <router-link
      :to="{
        name: 'person',
        params: {
          person_id: person.id
        }
      }"
      :title="person.full_name"
    >
      <img
        :loading="this.isLazy ? 'lazy' : undefined"
        :src="person.avatarPath"
        v-if="person.has_avatar"
      />
      <template v-else>{{ person.initials }}</template>
    </router-link>
  </span>

  <span
    class="avatar has-text-centered"
    :title="person.full_name"
    :style="{
      background: person.color,
      width: size + 'px',
      height: size + 'px',
      'font-size': fontSize + 'px'
    }"
    v-else
  >
    <img
      :loading="this.isLazy ? 'lazy' : undefined"
      :src="person.avatarPath"
      v-if="person.has_avatar"
    />
    <template v-else>{{ person.initials }}</template>
  </span>
</template>

<script>
export default {
  name: 'people-avatar',

  props: {
    person: {
      type: Object,
      default: () => ({
        id: 'empty',
        color: '#FFF'
      })
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
  }
}
</script>

<style lang="scss" scoped>
.avatar img {
  max-height: 100%;
  height: 100%;
  width: 100%;
}

.avatar {
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar a {
  margin: 0;
  color: white;
}

.flexrow-item {
  margin-right: 10px;
}
</style>
