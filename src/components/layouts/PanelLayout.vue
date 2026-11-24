<template>
  <div
    class="columns fixed-page panel-layout"
    :class="{ 'side-focused': sideFocused, 'with-side': side }"
  >
    <div class="column main-column">
      <div
        class="panels"
        :style="maxWidth ? { maxWidth: `${maxWidth}px` } : null"
      >
        <div class="page-panel filters-panel" v-if="$slots.filters">
          <slot name="filters" />
        </div>
        <div class="page-panel list-panel">
          <slot name="list" />
        </div>
      </div>
    </div>
    <slot />
    <div class="column side-column" v-if="side">
      <slot name="side" />
    </div>
  </div>
</template>

<script setup>
/*
 * The panel layout of a page: its filters in a panel, its saved searches and
 * its list in a second one, and a side panel when it has one.
 */
defineProps({
  // the width the two panels stop growing at, in pixels
  maxWidth: { type: Number, default: 0 },
  side: { type: Boolean, default: false },
  // on phones the side panel shows in place of the list, never beside it
  sideFocused: { type: Boolean, default: false }
})
</script>

<style lang="scss" scoped>
.main-column {
  border: 0;
  overflow: hidden;
  // the 60px topbar, then the same 1em as the sides
  padding: calc(60px + 1em) 1em 1em;
}

.panels {
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
  margin: 0 auto;
}

// not .panel: Bulma gives that one a bottom margin and a font size
.page-panel {
  background: var(--background-panel);
  border-radius: 12px;
  padding: 14px;
}

.filters-panel {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.list-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.75em;
  min-height: 0;
}

// the global .query-list margins indent the saved searches from the panel
// padding
.list-panel :deep(.query-list) {
  margin: 0;
}

// the default tag color is the panel background: take the tone made for
// tags laid on a panel (groups keep their inline tint)
.list-panel :deep(.search-queries .tag:not(.empty)) {
  background-color: var(--background-panel-tag);
}

// the dropdown of a group takes the same color, lifted off the panel
.list-panel :deep(.search-queries .group-list) {
  background-color: var(--background-panel-tag);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

// a list sits right under the saved searches
.list-panel :deep(.data-list) {
  margin-top: 0;
}

// the side panel is its own surface: the column only frames it
.panel-layout .side-column {
  background: transparent;
}

.side-column :deep(.side.task-info) {
  background: var(--background-panel);
  border-radius: 12px;
}

// The resize handle of the task panel lies over the gutter before it, its
// line showing only on hover (the layout selector outweighs the dark theme
// color).
.panel-layout .side-column :deep(.extend-bar) {
  background: transparent;
  margin-left: -14px;
  width: 14px;

  &:hover {
    background: linear-gradient(var(--border), var(--border)) center / 3px 100%
      no-repeat;
  }
}

@media screen and (min-width: 769px) {
  .main-column {
    padding: 80px 20px 20px;
  }

  // the gutter before the side panel belongs to its column
  .with-side .main-column {
    padding-right: 0;
  }

  // 20px under the 60px margin of the column puts the side panel level with
  // the filters panel
  .side-column {
    padding: 20px 20px 20px 14px;
  }
}

@media screen and (max-width: 768px) {
  // the cards of a list carry their own padding
  .list-panel {
    padding: 0.5em;
  }

  // read-only: the saved searches stay, without their editing
  .list-panel :deep(.query-list .tag.folder) {
    display: none;
  }

  // TaskInfo writes the width of its resizable panel inline on the column
  .side-column {
    display: none;
    max-width: none;
    min-width: 0 !important;
    padding: 1em;
    width: 100%;
  }

  .side-focused .main-column {
    display: none;
  }

  .side-focused .side-column {
    display: block;
  }
}
</style>
