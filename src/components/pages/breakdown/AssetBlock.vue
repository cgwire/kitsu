<template>
<div
  :class="{
    asset: true,
    big: true,
    casted: true,
    active: active
  }"
  :title="`${asset.name} (${nbOccurences})`"
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
  <div class="asset-picture" v-if="asset.preview_file_id">
    <img
      v-lazy="'/api/pictures/thumbnails-square/preview-files/' + asset.preview_file_id + '.png'"
    />
    <span class="nb-occurences" v-if="nbOccurences > 1">
      {{ nbOccurences }}
    </span>
  </div>
  <div class="asset-picture" v-else>
    <span class="empty-picture">
      {{ asset.name }} ({{ nbOccurences }})
    </span>
  </div>
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
      this.$emit('remove-one', this.asset.asset_id)
    },
    removeTenAssets (event) {
      this.$emit('remove-ten', this.asset.asset_id)
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
  font-size: 0.8em;
  cursor: default;
  background: $white-grey;
  word-wrap: break-word;
}

.asset.big {
  width: 40px;
  height: 40px;
}

.asset-add {
  position: relative;
  top: 0;
  left: 0;
  width: 30px;
  height: 15px;
  background: #F1E4FF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2em;
  opacity: 0;
  z-index: 3;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  font-size: 0.9em;
}

.asset-add-10 {
  position: relative;
  top: 0;
  left: 0;
  margin-top: 0px;
  width: 30px;
  height: 15px;
  background: #E1D4F9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2em;
  opacity: 0;
  z-index: 3;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  font-size: 0.9em;
}

.big .asset-add {
  width: 40px;
  height: 20px;
}

.big .asset-add-10 {
  width: 40px;
  height: 20px;
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
  top: -40px;
  left: 0;
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  z-index: 2;
  width: 40px;
  height: 40px;
  word-break: break-all;
  font-size: 0.8em;

  img {
    border-radius: 5px;
  }
}

.asset-name {
  text-align: center;
  position: relative;
  word-break: break-all;
  top: -75px;
}

.nb-occurences {
  background: rgba(160, 160, 180, 0.8);
  font-size: 0.8em;
  border-radius: 2px;
  color: white;
  position: absolute;
  padding: 2px;
  right: 2px;
  bottom: 2px;
}

.asset.casted {
  background: $purple;
  border-radius: 5px;
}
</style>
