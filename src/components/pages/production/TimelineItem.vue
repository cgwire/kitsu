<template>
  <div class="wrapper">
    <div class="timeline">
      <check-icon class="check" size="30" v-if="isCompleted" />
      <span
        :class="{
          step: true,
          optional
        }"
        v-else
      >
        {{ step }}
      </span>
      <div v-if="!isLast" class="dots"></div>
    </div>
    <div class="timeline-content">
      <h3
        class="title"
        :class="{ 'is-completed': isCompleted, optional }"
      >
        {{ title }}
      </h3>
      <p class="subtitle">{{ subtitle }}</p>
      <slot></slot>
      <hr v-if="!isLast">
    </div>
  </div>
</template>

<script>
import { CheckIcon } from 'vue-feather-icons'

export default {
  name: 'TimelineItem',
  components: {
    CheckIcon
  },
  props: {
    title: String,
    subtitle: String,
    isLast: {
      type: Boolean,
      default: false
    },
    step: Number,
    isCompleted: {
      type: Boolean,
      default: false
    },
    optional: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .timeline-content {
    p.subtitle {
      color: $white
    }
  }
  hr {
    background-color: $grey-strong;
  }
}

.wrapper {
  display: flex;
}

.check {
  color: $white;
  background-color: $green;
  border-radius: 50%;
  height: 36px;
  width: 36px;
  polyline {
    transform: scale(0.5) translate(12px, 12px);
    stroke-width: 4;
  }
}

.step {
  border-radius: 50%;
  border: 3px solid $green;
  color: $green;
  height: 36px;
  font-size: 16px;
  font-weight: bold;
  padding-top: 0.2rem;
  text-align: center;
  width: 36px;

  &.optional {
    border: 3px solid var(--text);
    color: var(--text);
  }
}

.timeline {
  margin-right: 2rem;
  display: flex;
  flex-direction: column;
}

.dots {
  border-right: 2px dotted $light-grey;
  width: 0;
  margin: 3px auto;
  display: flex;
  flex: 1;
}

.timeline-content {
  padding-top: 3px;
  flex: 1;

  h3.title {
    color: $green;
    font-size: 22px;
    font-family: Lato;
    font-weight: 600;
    line-height: 1.125;
    padding-top: 0.2em;

    &.optional {
      color: var(--text);
    }
  }

  h3.title.is-completed {
    color: $green;
  }

  p.subtitle {
    color: $dark-grey;
    font-size: 14px;
    font-weight: 400;
    padding-left: 3px;
  }
}
</style>
