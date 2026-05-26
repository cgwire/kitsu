<template>
  <div>
    <div
      class="combo"
      :class="{
        open: showList,
        reversed: isReversed,
        thin,
        'align-right': alignRight
      }"
      ref="select"
    >
      <div class="flexrow" :title="title" @click="toggleList">
        <div class="selected-line mr05 ellipsis nowrap">
          {{ title }}
        </div>
        <chevron-down-icon class="down-icon flexrow-item" />
      </div>
      <div class="select-input" v-if="showList">
        <a
          :key="action.label"
          class="option-line flexrow"
          :href="action.href || null"
          :target="action.href ? '_blank' : null"
          :rel="action.href ? 'noopener noreferrer' : null"
          @click="onActionClick(action)"
          v-for="action in actions"
        >
          <component
            :is="action.icon"
            :size="14"
            class="action-icon"
            v-if="action.icon"
          />
          <span>{{ action.label }}</span>
        </a>
      </div>
    </div>
    <div
      class="c-mask"
      :class="{ 'is-active': showList }"
      @click="toggleList"
    ></div>
  </div>
</template>

<script setup>
import { ChevronDownIcon } from 'lucide-vue-next'
import { ref } from 'vue'

defineProps({
  actions: {
    type: Array,
    default: () => []
  },
  alignRight: {
    type: Boolean,
    default: false
  },
  isReversed: {
    type: Boolean,
    default: false
  },
  thin: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  }
})

const select = ref(null)
const showList = ref(false)

const toggleList = () => {
  showList.value = !showList.value
}

const onActionClick = action => {
  if (action.handler) action.handler()
  showList.value = false
}
</script>

<style lang="scss" scoped>
.dark {
  .select-input,
  .selected-line,
  .option-line,
  .combo {
    color: var(--text);
    background: $dark-grey-light;
    border-color: $dark-grey;
  }

  .option-line:hover {
    background: $dark-purple;
  }
}

.combo {
  background: $white;
  border: 1px solid $light-grey-light;
  border-radius: 10px;
  cursor: pointer;
  display: inline-block;
  margin: 0;
  margin-top: 1px;
  max-width: 400px;
  padding: 0.5em;
  position: relative;
  user-select: none;
  vertical-align: middle;

  &.open {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  &:hover {
    border: 1px solid $green;
  }
}

.option-line {
  align-items: center;
  background: $white;
  border-bottom: 1px solid $light-grey-light;
  color: inherit;
  cursor: pointer;
  gap: 0.5em;
  margin: 0;
  min-width: 150px;
  padding: 0.5em;
  text-decoration: none;

  &:hover {
    background: $purple;
  }
}

.action-icon {
  flex-shrink: 0;
}

.down-icon {
  color: $green;
  margin-right: 0.4em;
  min-width: 15px;
  width: 15px;
}

.select-input {
  background: var(--background);
  border: 1px solid $light-grey-light;
  border-bottom-left-radius: 1em;
  border-bottom-right-radius: 1em;
  border-top-right-radius: 1em;
  left: 0;
  margin-left: -1px;
  max-height: 270px;
  overflow-x: hidden;
  overflow-y: auto;
  position: absolute;
  top: 38px;
  width: inherit;
  z-index: 2000;

  .option-line {
    padding-right: 0.4em;
    white-space: nowrap;
  }
}

// Anchor the dropdown to the right edge of the combo and let it grow
// leftwards. Used when the combo sits near the right side of the
// screen and the natural left-anchored dropdown would overflow. The
// header flexrow gets justify-content: flex-end so the title and
// chevron sit on the right too.
.combo.align-right {
  .select-input {
    border-top-right-radius: 0;
    border-top-left-radius: 1em;
    left: auto;
    margin-left: 0;
    margin-right: -1px;
    right: 0;
    width: max-content;
  }
}

.c-mask {
  z-index: 199;
}

.thin {
  height: 34px;
  margin-bottom: 3px;
  padding: 4px 0 3px 10px;

  .select-input {
    top: 30px;
  }
}

.reversed {
  &.open {
    border-bottom-left-radius: 1em;
    border-bottom-right-radius: 1em;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }

  .select-input {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-top-left-radius: 1em;
    border-top-right-radius: 1em;
    height: 180px;
    top: -180px;
  }
}
</style>
