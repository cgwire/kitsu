<template>
    <div v-bind:style="styles" class="spinner spinner--square-grid">
      <div v-bind:style='cubeStyles' class="sk-cube sk-cube1"></div>
      <div v-bind:style='cubeStyles' class="sk-cube sk-cube2"></div>
      <div v-bind:style='cubeStyles' class="sk-cube sk-cube3"></div>
      <div v-bind:style='cubeStyles' class="sk-cube sk-cube4"></div>
      <div v-bind:style='cubeStyles' class="sk-cube sk-cube5"></div>
      <div v-bind:style='cubeStyles' class="sk-cube sk-cube6"></div>
      <div v-bind:style='cubeStyles' class="sk-cube sk-cube7"></div>
      <div v-bind:style='cubeStyles' class="sk-cube sk-cube8"></div>
      <div v-bind:style='cubeStyles' class="sk-cube sk-cube9"></div>
    </div>
</template>

<script>
export default {
  props: {
    size: {
      default: '40px'
    },
    background: {
      default: '#41b883'
    },
    duration: {
      default: '1.3s'
    }
  },
  computed: {
    cubeStyles () {
      return {
        backgroundColor: this.background,
        animationDuration: this.duration
      }
    },
    styles () {
      return {
        width: this.size,
        height: this.size
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .spinner {
    display: inline-block;
    * {
      line-height: 0;
      box-sizing: border-box;
    }
  }

  .sk-cube {
    width: 33%;
    height: 33%;
    float: left;
    animation: sk-cubeGridScaleDelay 1.8s ease-in-out infinite;
  }

  .sk-cube1 {
    -webkit-animation-delay: 0.2s;
    animation-delay: 0.2s;
  }

  .sk-cube2 {
    -webkit-animation-delay: 0.3s;
    animation-delay: 0.3s;
  }

  .sk-cube3 {
    -webkit-animation-delay: 0.4s;
    animation-delay: 0.4s;
  }

  .sk-cube4 {
    -webkit-animation-delay: 0.1s;
    animation-delay: 0.1s;
  }

  .sk-cube5 {
    -webkit-animation-delay: 0.2s;
    animation-delay: 0.2s;
  }

  .sk-cube6 {
    -webkit-animation-delay: 0.3s;
    animation-delay: 0.3s;
  }

  .sk-cube7 {
    -webkit-animation-delay: 0s;
    animation-delay: 0s;
  }

  .sk-cube8 {
    -webkit-animation-delay: 0.1s;
    animation-delay: 0.1s;
  }

  .sk-cube9 {
    -webkit-animation-delay: 0.2s;
    animation-delay: 0.2s;
  }

  @keyframes sk-cubeGridScaleDelay {
    0%, 70%, 100% {
      transform: scale3D(1, 1, 1);
    }
    35% {
      transform: scale3D(0, 0, 1);
    }
  }
</style>
