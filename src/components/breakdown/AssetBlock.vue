<template>
<div
  :id="'casting-' + asset.id"
  :class="{
    asset: true,
    big: true,
    casted: true,
    active: active
  }"
>

  <div
    class="asset-add"
    @click="removeOneAsset"
  >
  - 1
  </div>
  <div
    class="asset-add-10"
    @click="removeTenAssets"
    >
  - 10
  </div>

  <div class="asset-picture" v-if="asset.preview_file_id.length > 0">
    <img
      v-lazy="'/api/pictures/thumbnails-square/preview-files/' + asset.preview_file_id + '.png'"
    />
  </div>
  <div class="asset-picture" v-else>
    <span class="empty-picture">
      no pic
    </span>
  </div>
  <p class="asset-name">
    {{ asset.name }}
    <span v-if="nbOccurences > 1">
    ({{ nbOccurences }})
    </span>
  </p>

</div>
</template>

<script>
export default {
  name: 'asset-block',
  props: {
    asset: {
      default: () => ({
        id: '',
        name: ''
      }),
      type: Object
    },
    nbOccurences: {
      default: 1,
      type: Number
    },
    active: {
      default: true,
      type: Boolean
    }
  },
  computed: {
  },
  methods: {
    removeOneAsset (event) {
      let assetId = event.target.parentElement.id.substring('casting-'.length)
      this.$emit('remove-one', assetId)
    },
    removeTenAssets (event) {
      let assetId = event.target.parentElement.id.substring('casting-'.length)
      this.$emit('remove-ten', assetId)
    }
  }
}
</script>

<style lang="scss" scoped>
.dark .asset {
  background-color: $dark-grey-lightest;
}

.dark .asset.casted,
.dark .asset .asset-add,
.dark .asset .asset-add-10 {
  background-color: #8F91EB;
}

.asset {
  width: 60px;
  height: 60px;
  margin-right: 1em;
  margin-bottom: 4em;
  font-size: 0.8em;
  cursor: default;
  background: $white-grey;
  word-wrap: break-word;
}

.asset.big {
  width: 80px;
  height: 80px;
}

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
}

.big .asset-add-10 {
  width: 80px;
  height: 40px;
}

.asset.active {
  cursor: pointer;
}

.asset.active:hover .asset-add,
.asset.active:hover .asset-add-10 {
  opacity: 1;
}

.asset-picture {
  position: relative;
  top: -80px;
  left: 0;
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  z-index: 2;
  width: 80px;
  height: 80px;
}

.asset-name {
  text-align: center;
  position: relative;
  word-break: break-all;
  top: -75px;
}

.nb-occurences {
  margin-left: 0.4em;
}

.asset.casted {
  background: $purple;
}
</style>
