<template>
  <div
    :id="`casting-${asset.id}`"
    class="asset"
    :class="{
      active,
      'big-asset': bigMode,
      shared: asset.shared
    }"
    :title="asset.name"
    v-if="!textMode"
  >
    <div
      class="asset-add"
      role="button"
      tabindex="0"
      @click="addOneAsset"
      @keydown.enter.prevent="addOneAsset"
      @keydown.space.prevent="addOneAsset"
    >
      + 1
    </div>
    <div
      class="asset-add-10"
      role="button"
      tabindex="0"
      @click="addTenAssets"
      @keydown.enter.prevent="addTenAssets"
      @keydown.space.prevent="addTenAssets"
    >
      + 10
    </div>
    <div class="asset-picture" v-if="asset.preview_file_id">
      <img
        loading="lazy"
        :alt="asset.name"
        :src="`/api/pictures/thumbnails-square/preview-files/${asset.preview_file_id}.png`"
      />
    </div>
    <div class="asset-picture" v-else>
      <span class="empty-picture">
        {{ asset.name }}
      </span>
    </div>
  </div>
  <div
    class="asset-text flexrow-item flexrow"
    :class="{
      shared: asset.shared
    }"
    v-else
  >
    <span class="asset-text-name flexrow-item">
      {{ asset.name }}
    </span>
    <span
      class="modify-asset flexrow-item"
      role="button"
      tabindex="0"
      @click="addOneAsset"
      @keydown.enter.prevent="addOneAsset"
      @keydown.space.prevent="addOneAsset"
    >
      + 1
    </span>
  </div>
</template>

<script setup>
// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  asset: { type: Object, default: () => ({ id: '', name: '' }) },
  active: { type: Boolean, default: false },
  textMode: { type: Boolean, default: false },
  bigMode: { type: Boolean, default: true }
})

const emit = defineEmits(['add-one', 'add-ten'])

// Functions
// --------------------------------------------------------------------------
const addOneAsset = () => {
  if (props.active) emit('add-one', props.asset.id)
}

const addTenAssets = () => {
  if (props.active) emit('add-ten', props.asset.id)
}
</script>

<style lang="scss" scoped>
.dark .asset {
  background-color: $dark-grey-lightest;
}

.dark .asset .asset-add,
.dark .asset .asset-add-10 {
  background-color: $purple-strong;
}

.asset-add {
  position: relative;
  top: 0;
  left: 0;
  width: 60px;
  height: 30px;
  background: #f1e4ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2em;
  opacity: 0;
  z-index: 3;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.asset-add-10 {
  position: relative;
  top: 0;
  left: 0;
  margin-top: 0;
  width: 60px;
  height: 30px;
  background: #e1d4f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2em;
  opacity: 0;
  z-index: 3;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.asset.active:hover .asset-add,
.asset.active:hover .asset-add-10 {
  opacity: 1;
}

.asset {
  width: 60px;
  height: 60px;
  margin-right: 1em;
  margin-bottom: 1em;
  font-size: 0.8em;
  cursor: default;
  background: $white-grey;
  border-radius: 8px;

  &.big-asset {
    width: 100px;
    height: 100px;

    .asset-picture {
      top: -110px;
      left: -10px;
      width: 120px;
      height: 120px;
    }

    .asset-add-10,
    .asset-add {
      width: 100px;
      height: 50px;
    }
  }

  &.shared {
    box-shadow: 0 0 0 2px var(--shared-color);
  }
}

.asset-picture {
  position: relative;
  top: -60px;
  left: 0;
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  z-index: 2;
  width: 60px;
  height: 60px;
  word-break: break-all;
  font-size: 0.8em;

  img {
    border-radius: 8px;
  }
}

.active {
  cursor: pointer;
}

.asset-text {
  font-size: 0.9em;
  margin-bottom: 0.5em;

  &.shared {
    box-shadow: 0 0 0 2px var(--shared-color);
  }
}
</style>
