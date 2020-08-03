<template>
<div
  :id="entityId"
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
          ({{ typeAssets.reduce((acc, a) => acc + a.nb_occurences, 0) }})
        </span>
        <div class="asset-type-items flexrow-item">
          <asset-block
            class="flexrow-item"
            :key="asset.id"
            :asset="asset"
            :nb-occurences="asset.nb_occurences"
            :read-only="readOnly"
            :text-mode="textMode"
            @edit-label="onEditLabelClicked"
            @remove-one="removeOneAsset"
            @remove-ten="removeTenAssets"
            v-for="asset in typeAssets"
          />
        </div>
      </div>
      <div
        class="asset-type-line flexrow empty mt05 mb05"
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
    entityId: {
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
    },
    readOnly: {
      default: false,
      type: Boolean
    },
    textMode: {
      default: false,
      type: Boolean
    }
  },

  components: {
    AssetBlock
  },

  methods: {
    onClicked (event) {
      this.$emit('click', this.entityId, event)
    },
    onEditLabelClicked (asset, label) {
      this.$emit('edit-label', asset, label, this.entityId)
    },
    removeOneAsset (assetId) {
      this.$emit('remove-one', assetId, this.entityId)
    },
    removeTenAssets (assetId) {
      this.$emit('remove-ten', assetId, this.entityId)
    }
  }
}
</script>
<style lang="scss" scoped>
.dark {
  .asset-type-name {
    color: $light-grey-light;
  }
}

.asset-list {
  border-left: 1px solid $light-grey;
  padding-left: 1em;
}

.asset-type-line:not(:first-child) {
  margin-top: 0.5em;
}

.shot-name {
  width: 100px;
  padding-left: 0.4em;
  padding-top: 0;
  flex: 0 0 100px;
  word-break: break-all;
}

.asset-type-name {
  display: flex;
  flex: 0 0 150px;
  align-items: center;
  align-self: flex-start;
  margin-right: 1em;
  width: 150px;
  height: 40px;
  color: $grey-strong;
  text-transform: uppercase;
}

.asset-type-items {
  flex: 1 1 auto;
  display: flex;
  flex-wrap: wrap;
}

.shot {
  font-size: 1.1em;
  padding: .5em .5em 0;
  border-bottom: 1px solid $light-grey;
  cursor: pointer;
}

.shot:hover {
  background: var(--background-selectable);
}

.shot.selected {
  background: var(--background-selected);
}

.empty {
  font-style: italic;
  color: $light-grey;
}
</style>
