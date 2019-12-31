<template>
<div
  class="columns fixed-page"
>
  <div
    class="column main-column"
  >
    <div class="flexrow filters">
      <div class="flexrow-item">
        <combobox
          class="flexrow-item"
          :label="$t('quota.type_label')"
          :options="typeOptions"
          v-model="type"
        />
      </div>
      <div class="flexrow-item">
        <combobox
          class="flexrow-item"
          :label="$t('quota.detail_label')"
          :options="detailLevelOptions"
          v-model="detailLevel"
        />
      </div>
      <div class="flexrow-item">
        <combobox-number
          class="flexrow-item"
          :label="$t('quota.year_label')"
          :options="yearsOptions"
          v-model="years"
        />
      </div>
      <div class="flexrow-item">
        <combobox
          class="flexrow-item"
          :label="$t('quota.count_label')"
          :options="countModeOptions"
          v-model="countMode"
        />
      </div>
    </div>

    <quota />
  </div>
</div>

</template>

<script>
import Combobox from '../widgets/Combobox'
import ComboboxNumber from '../widgets/ComboboxNumber'
import Quota from './quota/Quota'

export default {
  name: 'production-quota',
  components: {
    Combobox,
    ComboboxNumber,
    Quota
  },

  data () {
    return {
      typeOptions: [
        { label: 'Storyboard', value: 'storyboard' },
        { label: 'Layout', value: 'layout' },
        { label: 'Previz', value: 'previz' },
        { label: 'Anim Blocking', value: 'animeblocking' },
        { label: 'Animation', value: 'animation' },
        { label: 'Cleanup', value: 'cleanup' },
        { label: 'FX', value: 'fx' },
        { label: 'Render', value: 'render' },
        { label: 'Compositing', value: 'compositin' }
      ],
      yearsOptions: [
        { label: '2020', value: 2020 },
        { label: '2019', value: 2019 },
        { label: '2018', value: 2018 },
        { label: '2017', value: 2017 },
        { label: '2016', value: 2016 }
      ],
      countModeOptions: [
        { label: 'Frames', value: 'frames' },
        { label: 'Seconds', value: 'seconds' }
      ],
      detailLevelOptions: [
        { label: 'Day', value: 'day' },
        { label: 'Week', value: 'week' },
        { label: 'Month', value: 'month' }
      ]
    }
  },

  mounted () {

  },

  computed: {
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .filters {
    color: $white-grey;
  }
}

.filters {
  padding-bottom: 4rem;

  .field {
    padding-bottom: 0;
    margin-bottom: 0;
  }

  .overall-man-days {
    width: 120px;
    font-size: 0.9em;
    margin-right: 1em;
  }
}

.fixed-page {
  padding: 1em;
  padding-top: 90px;
  padding-left: 2em;
}

.main-column {
  display: flex;
  border: 0;
  overflow: hidden;
  flex-direction: column;
}

.zoom-level {
  margin-top: -10px;
}
</style>
