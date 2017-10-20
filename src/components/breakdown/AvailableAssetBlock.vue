<template>
<div
  :id="'casting-' + asset.id"
  :class="{
    asset: true,
    casted: casted,
    active: active
  }"
>
  <div
    class="asset-add"
    @click="addOneAsset"
  >
  + 1
  </div>
  <div
    class="asset-add-10"
    @click="addTenAssets"
    >
  + 10
  </div>
  <div class="asset-name">
    <p>
    {{ asset.name }}
    </p>
  </div>
</div>
</template>

<script>
export default {
  name: 'available-asset-block',
  props: {
    asset: {
      default: {
        id: '',
        name: ''
      },
      type: Object
    },
    casted: {
      default: false,
      type: Boolean
    },
    active: {
      default: false,
      type: Boolean
    }
  },
  computed: {
  },
  methods: {
    addOneAsset (event) {
      let assetId = event.target.parentElement.id.substring('casting-'.length)
      this.$emit('add-one', assetId)
    },
    addTenAssets (event) {
      let assetId = event.target.parentElement.id.substring('casting-'.length)
      this.$emit('add-ten', assetId)
    }
  }
}
</script>

<style scoped>
.asset-add {
  position: relative;
  top: 0;
  left: 0;
  width: 60px;
  height: 30px;
  background: #F1E4FF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2em;
  opacity: 0;
  z-index: 3;
}

.asset-add-10 {
  position: relative;
  top: 0;
  left: 0;
  margin-top: 0px;
  width: 60px;
  height: 30px;
  background: #E1D4F9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2em;
  opacity: 0;
  z-index: 3;
}

.big .asset-add {
  width: 80px;
  height: 40px;
  cursor: pointer;
}

.big .asset-add-10 {
  width: 80px;
  height: 40px;
  cursor: pointer;
}

.asset.active:hover .asset-add,
.asset.active:hover .asset-add-10 {
  opacity: 1;
}

.asset-name {
  position: relative;
  top: -60px;
  left: 0;
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  z-index: 2;
  word-break: break-all;
  padding: 0.5em;
}

.asset {
  width: 60px;
  height: 60px;
  margin-right: 1em;
  margin-bottom: 1em;
  font-size: 0.8em;
  cursor: default;
  background: #EEE;
}

.asset.casted {
  background: #D1C4E9;
}

.active {
  cursor: pointer;
}
</style>
