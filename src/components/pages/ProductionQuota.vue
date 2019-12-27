<template>
<div
  class="columns fixed-page"
>
  <div
    class="column main-column"
  >
    <div class="flexrow filters">
      <div class="flexrow-item">
        <label class="label">
          {{ $t('main.start_date') }}
        </label>
        <datepicker
          wrapper-class="datepicker"
          input-class="date-input input"
          :language="locale"
          :minimumView="'year'"
          :maximumView="'year'"
          :initialView="'year'"
          format="yyyy"
          v-model="selectedStartDate"
        />
      </div>
      <div class="flexrow-item">
        <label class="label">
          {{ $t('main.start_date') }}
        </label>
        <combobox-task-type
          class="flexrow-item zoom-level"
          :label="$t('schedule.zoom_level')"
          :options="zoomOptions"
          v-model="zoomLevel"
        />
      </div>
    </div>

    <quota />
  </div>
</div>

</template>

<script>
// import { en, fr } from 'vuejs-datepicker/dist/locale'
import Datepicker from 'vuejs-datepicker'
import ComboboxTaskType from '../widgets/ComboboxTaskType'
import Quota from './quota/Quota'

export default {
  name: 'production-quota',
  components: {
    Datepicker,
    ComboboxTaskType,
    Quota
  },

  data () {
    return {
    }
  },

  mounted () {

  },

  computed: {
    locale () {
      // if (this.user.locale === 'fr_FR') {
      //   return fr
      // } else {
      //   return en
      // }
    }
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
