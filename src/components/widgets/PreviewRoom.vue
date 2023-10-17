<template v-if="roomId">
  <div class="preview-room">
    <button-simple
      :text="$t('preview_room.leave_room')"
      class="preview-room-button"
      @click="
        leaveRoom()
        openRoom()
      "
      v-if="joinedRoom"
    />
    <button-simple
      :text="$t('preview_room.join_room')"
      class="preview-room-button"
      @click="joinRoom"
      v-else
    />
    <people-avatar
      class="person-avatar"
      :key="personId"
      :person="personMap.get(personId)"
      :size="30"
      :font-size="15"
      :is-link="false"
      v-for="personId in room.people"
      v-if="personMap.get(personId)"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import ButtonSimple from '@/components/widgets/ButtonSimple'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'

export default {
  name: 'preview-room',
  mixins: [],

  components: {
    ButtonSimple,
    PeopleAvatar
  },

  props: {
    roomId: { type: String },
    joinRoom: { type: Function },
    leaveRoom: { type: Function }
  },

  data() {
    return {
      room: {
        people: [],
        newComer: true
      }
    }
  },

  mounted() {
    this.openRoom()
  },

  beforeDestroy() {},

  computed: {
    ...mapGetters(['personMap', 'user']),

    joinedRoom() {
      if (!this.roomId) {
        return
      }
      return !!this.room.people.find(id => id === this.user.id)
    }
  },

  methods: {
    openRoom() {
      if (!this.roomId) {
        return
      }
      this.$socket.emit('preview-room:open-playlist', {
        playlist_id: this.roomId
      })
    }
  },

  watch: {}
}
</script>

<style lang="scss" scoped>
.preview-room {
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
