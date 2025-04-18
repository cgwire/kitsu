<template v-if="room.id">
  <div class="preview-room mr05">
    <button-simple
      :text="$t('preview_room.leave_room')"
      class="preview-room-button"
      @click="onLeaveClicked"
      v-if="joinedRoom"
    />
    <button-simple
      :text="$t('preview_room.join_room')"
      class="preview-room-button"
      @click="onJoinClicked"
      v-else
    />
    <people-avatar
      class="person-avatar"
      :key="person.id"
      :person="person"
      :size="30"
      :font-size="15"
      :is-link="false"
      v-for="person in peopleInRoom"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'

export default {
  name: 'preview-room',

  components: {
    ButtonSimple,
    PeopleAvatar
  },

  props: {
    room: {
      type: Object,
      default: () => {}
    }
  },

  emits: ['join-room', 'leave-room', 'open-room'],

  data() {
    return {}
  },

  computed: {
    ...mapGetters(['personMap', 'user']),

    peopleInRoom() {
      return this.room.people.map(id => this.personMap.get(id)) // .filter(Boolean)
    },

    joinedRoom() {
      if (!this.room.id) return
      return this.room.people.find(id => id === this.user.id)
    }
  },

  methods: {
    openRoom() {
      if (!this.room.id) return
      this.$emit('open-room', this.room.id)
    },

    onJoinClicked() {
      this.$emit('join-room', this.room.id)
    },

    onLeaveClicked() {
      this.$emit('leave-room', this.room.id)
    }
  }
}
</script>

<style lang="scss" scoped>
.preview-room {
  align-items: center;
  display: flex;
  font-size: 1.5em;
}

.preview-room-button.button {
  color: var(--text);
  background: none;
  border: 1px solid var(--border);
  border-radius: 10px;
  margin: 4px 0.5em 4px 0;

  &:hover {
    background-color: var(--background-tag-button);
  }
}

.avatar.person-avatar {
  display: inline-flex;
  margin: 4px 4px 4px 0;

  &:last-child {
    margin-right: 0.5em;
  }
}
</style>
