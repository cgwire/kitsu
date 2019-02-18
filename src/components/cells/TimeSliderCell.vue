<template>
<td>
  <div class="flexrow">
    <span class="value flexrow-item">
      {{ value }}
    </span>
    <vue-slider
      class="flexrow-item slider"
      ref="slider"
      v-model="value"
      v-bind="options"
    />
    <button class="button flexrow-item" @click="setValue(1)">1</button>
    <button class="button flexrow-item" @click="setValue(4)">4</button>
    <button class="button flexrow-item" @click="setValue(8)">8</button>
  </div>
</td>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import VueSlider from 'vue-slider-component'

export default {
  name: 'time-slider-cell',

  data () {
    return {
      value: this.duration,
      options: {
        show: true,
        width: 400,
        min: 0,
        max: 10,
        interval: 0.5,
        lazy: true,
        piecewise: true,
        tooltip: 'hover',
        tooltipDir: 'bottom',
        tooltipStyle: {
          'background-color': '#FFFFFF',
          color: '$grey-strong666',
          'z-index': 2000
        },
        processStyle: {
          'background-color': '#8F91EB'
        }
      }
    }
  },

  components: {
    VueSlider
  },

  props: {
    'task-id': {
      type: String,
      default: ''
    },
    duration: {
      type: Number,
      default: 0
    }
  },

  computed: {
    ...mapGetters([
    ])
  },

  methods: {
    ...mapActions([
    ]),

    setValue (value) {
      this.value = value
    }
  },

  watch: {
    value () {
      this.$emit('change', {taskId: this.taskId, duration: this.value})
    }
  }
}
</script>

<style lang="scss" scoped>
.value {
  font-size: 1.5em;
  font-weight: bold;
  width: 20px;
}

.slider {
  cursor: pointer;
}
</style>
