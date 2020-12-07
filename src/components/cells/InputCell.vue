<template functional>
<td>
  <input
    class="input stylehidden"
    @blur="(event) => event.target.className = 'input stylehidden'"
    @change="estimationUpdated($event, task, index)"
    @keydown="onKeyDown"
    @mouseout="onMouseOut"
    @mouseover="(event) => event.target.className = 'input'"
    :value="formatEstimation(task.estimation)"
  />
</td>
</template>

<script>
export default {
  name: 'sorting-info',
  functional: true,

  props: {
    value: {
      default: '',
      type: String
    }
  }
}
</script>

<style lang="scss">
</style>
