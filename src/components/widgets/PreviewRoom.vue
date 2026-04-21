<template v-if="room.id">
  <div class="preview-room" :class="{ mr05: peopleInRoom.length > 0 }">
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

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'

const store = useStore()
const personMap = computed(() => store.getters.personMap)
const user = computed(() => store.getters.user)

const props = defineProps({
  room: {
    type: Object,
    default: () => {}
  }
})

const emit = defineEmits(['join-room', 'leave-room'])

const peopleInRoom = computed(() => {
  return props.room.people.map(id => personMap.value.get(id))
})

const joinedRoom = computed(() => {
  if (!props.room.id) return
  return props.room.people.find(id => id === user.value.id)
})

const onJoinClicked = () => {
  emit('join-room', props.room.id)
}

const onLeaveClicked = () => {
  emit('leave-room', props.room.id)
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
