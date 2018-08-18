<template>
  <span
    class="avatar has-text-centered"
    :style="{
      background: person.color,
      width: size +'px',
      height: size + 'px',
      'min-width': size +'px',
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
      class="avatar-link"
    >
    <img
      :src="avatarPath"
      v-if="person.has_avatar && noCache"
    />
    <img
      v-lazy="person.avatarPath"
      v-else-if="person.has_avatar"
    />
    <span
      v-if="!person.has_avatar"
    >
     {{ person.initials }}
    </span>
    </router-link>
  </span>

<span
   class="avatar has-text-centered"
   :style="{
     background: person.color,
     width: size +'px',
     height: size + 'px',
     'font-size': fontSize + 'px'
   }"
   v-else
>
  <img
    :src="avatarPath"
    v-if="person.has_avatar && noCache"
  />
  <img
    v-lazy="person.avatarPath"
    v-else-if="person.has_avatar"
  />
  <span v-else>
    {{ person.initials }}
  </span>
</span>
</template>

<script>
export default {
  name: 'person-avatar',

  data () {
    return {
      avatarPath: this.person.avatarPath + '&stamp=' + new Date().toISOString()
    }
  },

  props: {
    person: { type: Object, default: () => { return { color: '#FFF' } } },
    size: { type: Number, default: 40 },
    'font-size': { type: Number, default: 18 },
    'is-link': { type: Boolean, default: true },
    'no-cache': { type: Boolean, default: false }
  },

  watch: {
    person () {
      this.avatarPath = this.person.avatarPath + '&stamp=' + new Date().toISOString()
    }
  }
}
</script>

<style scoped>
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

.avatar span {
  flex: 1;
}

.avatar a {
  padding: 0;
  margin: 0;
  color: white;
}

.flexrow-item {
  margin-right: 10px;
}
</style>
