<template>
<div
  :id="shotId"
  :class="{
    shot: true,
    selected: selected,
    unselectable: true
  }"
  @click="onClicked($event)"
>
  <div class="flexrow">
    <div class="shot-name flexrow-item">
      {{ name }}
    </div>
    <div class="asset-list flexrow-item">
      <div
        class="asset-type-line flexrow"
        :key="typeAssets.length > 0 ? typeAssets[0].asset_type_name : ''"
        v-for="typeAssets in assets"
      >
        <span class="asset-type-name flexrow-item">
          {{ typeAssets.length > 0 ? typeAssets[0].asset_type_name : '' }}
        </span>
        <asset-block
          class="flexrow-item"
          :key="asset.id"
          :asset="asset"
          :nb-occurences="asset.nb_occurences"
          @remove-one="removeOneAsset"
          @remove-ten="removeTenAssets"
          v-for="asset in typeAssets"
        />
      </div>
      <div
        class="asset-type-line flexrow empty"
        v-if="assets.length === 0"
      >
        {{ $t('breakdown.empty') }}
      </div>
    </div>
  </div>
</div>
</template>

<script>
import AssetBlock from './AssetBlock'

export default {
  name: 'shot-line',
  props: {
    shotId: {
      default: '',
      type: String
    },
    selected: {
      default: false,
      type: Boolean
    },
    name: {
      default: '',
      type: String
    },
    assets: {
      default: () => [],
      type: Array
    }
  },

  components: {
    AssetBlock
  },

  methods: {
    onClicked (event) {
      this.$emit('click', this.shotId, event)
    },
    removeOneAsset (assetId) {
      this.$emit('remove-one', assetId, this.shotId)
    },
    removeTenAssets (assetId) {
      this.$emit('remove-ten', assetId, this.shotId)
    }
  }
}
</script>
<style lang="scss" scoped>
.dark .shot:hover {
  background-color: #56595F;
}

.dark .shot.selected {
  background-color: #8F91EB;
}

.asset-list {
  border-left: 1px solid $light-grey;
  padding-left: 1em;
}

.asset-type-line {
  padding-bottom: 0.5em;
}

.shot-name {
  width: 100px;
  padding-left: 0.4em;
}

.asset-type-name {
  color: $grey;
  text-transform: uppercase;
  width: 130px;
  margin-right: 1em;
}

.shot {
  font-size: 1.1em;
  padding: 0.5em 0 0.2em 0.2em;
  border-bottom: 1px solid $light-grey;
  cursor: pointer;
}

.shot:hover {
  background: #ecfaec;
}

.shot.selected {
  background: $light-purple;
}

.empty {
  font-style: italic;
  color: $light-grey;
}
</style>
