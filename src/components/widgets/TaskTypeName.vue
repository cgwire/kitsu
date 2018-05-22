<template>
<router-link
  :to="{
    name: 'task-type',
    params: {
      production_id: productionId,
      task_type_id: taskType.id
    }
  }"
  v-if="productionId"
>
  <span
    class="tag task-type-name"
    :style="{ 'border-left': '4px solid ' + color }"
  >
    {{ taskType.name }}
  </span>
</router-link>
<div
  class="tag task-type-name no-link"
  :style="{ 'border-left': '4px solid ' + color }"
  v-else
>
  {{ taskType.name }}
</div>

</span>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'task-type-name',
  components: {
  },
  props: [
    'taskType',
    'productionId'
  ],
  computed: {
    ...mapGetters([
    ]),
    color () {
      if (this.taskType.color.toUpperCase() === '#000000') return '#666'
      else return this.taskType.color
    }
  },
  methods: {
    ...mapActions([
    ])
  }
}
</script>

<style scoped>
.tag {
  margin: 0;
  padding: 0 0.7em;
  font-size: 0.9em;
  line-height: 0.8em;
  color: #666;
  border-radius: 0;
  font-weight: bold;
}

.no-link {
  cursor: default
}
</style>
