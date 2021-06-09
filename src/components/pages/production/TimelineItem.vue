<template>
  <div class="wrapper">
    <div class="timeline">
      <check-icon class="check" size="30" v-if="isCompleted" />
      <span class="step" v-else>{{ step }}</span>
      <div v-if="!isLast" class="dots"></div>
    </div>
    <div class="content">
      <h3
        class="title"
        :class="{ 'is-completed': isCompleted }"
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
import CheckIcon from 'vue-feather-icons/icons/CheckIcon'

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
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .content {
    p.subtitle {
      color: $white
    }
  }
  .step {
    background-color: $grey-strong;
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
  polyline {
    transform: scale(0.5) translate(12px, 12px);
    stroke-width: 4;
  }
}
.step {
  width: 30px;
  height: 30px;
  background-color: #adadad;
  padding: 0.25rem 0.5rem;
  text-align: center;
  border-radius: 15px;
  color: white;
  font-weight: bold;
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
.content {
  padding-top: 3px;
  flex: 1;

  h3.title.is-completed {
    color: $green;
  }

  p.subtitle {
    color: $dark-grey;
    font-size: 100%;
    padding-left: 3px;
  }
}
</style>
