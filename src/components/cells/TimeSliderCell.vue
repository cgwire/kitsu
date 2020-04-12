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
import 'vue-slider-component/theme/default.css'

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
        marks: true,
        hideLabel: true,
        piecewise: true,
        tooltip: 'focus',
        tooltipPlacement: 'bottom',
        processStyle: {
          'background-color': '#8F91EB'
        },
        railStyle: {
          background: '#CCC'
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
      this.$emit('change', {
        taskId: this.taskId, duration: this.value
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.value {
  font-size: 1.5em;
  font-weight: bold;
  width: 30px;
}

.slider {
  cursor: pointer;
  z-index: 0;
}
</style>
