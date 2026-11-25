<template>
  <div
    class="columns fixed-page panel-layout"
    :class="{
      'paneled-side': !plainSide,
      'side-focused': sideFocused,
      'with-side': side,
      'with-tabs': $slots.tabs
    }"
  >
    <div class="page-tabs" v-if="$slots.tabs">
      <slot name="tabs" />
    </div>
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
 * its list in a second one, and a side panel when it has one. The tabs of a
 * page go above them all.
 */
defineProps({
  // the width the two panels stop growing at, in pixels
  maxWidth: { type: Number, default: 0 },
  // the side keeps the look it has on the other pages: a full-height column
  plainSide: { type: Boolean, default: false },
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
  // the text of the theme, where the body keeps the darker one of Bulma
  color: var(--text);
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
  margin: 0 auto;
}

// The tabs of a page run above its columns, in the place of their margin
// under the topbar: a row for them, another for the column a phone shows.
.with-tabs {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
}

.page-tabs {
  padding: calc(60px + 1em) 1em 0;

  // Bulma sets the tabs apart from what follows: the columns already do
  :deep(.tabs) {
    margin-bottom: 0;
  }
}

.with-tabs .main-column,
.with-tabs.paneled-side .side-column {
  padding-top: 14px;
}

.with-tabs .side-column {
  margin-top: 0;
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

// a list sits right under the saved searches, in a frame of its own
.list-panel :deep(.data-list) {
  margin-top: 0;
}

.list-panel :deep(.datatable-wrapper) {
  border-radius: 10px;
}

// A search field has no background of its own: on a panel it takes the one
// of the comboboxes beside it.
.page-panel :deep(.search-field-wrapper),
.paneled-side .side-column :deep(.search-field-wrapper) {
  background: var(--background);

  .dark & {
    background: $dark-grey-light;
  }
}

// the side panel is its own surface: the column only frames it, level with
// the filters panel
.panel-layout.paneled-side .side-column {
  background: transparent;
  padding: 1em;
}

.paneled-side .side-column :deep(.side.task-info) {
  background: var(--background-panel);
  border-radius: 12px;
}

// The resize handle of the task panel lies over the gutter before it, its
// line showing only on hover (the layout selector outweighs the dark theme
// color).
.panel-layout.paneled-side .side-column :deep(.extend-bar) {
  background: transparent;
  margin-left: -14px;
  width: 14px;

  &:hover {
    background: linear-gradient(var(--border), var(--border)) center / 3px 100%
      no-repeat;
  }
}

@media screen and (min-width: 769px) {
  // the tabs run over the two columns, the side one as wide as it asks
  .with-tabs {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .page-tabs {
    grid-column: 1 / -1;
  }

  // the gutter before the side panel belongs to its column
  .paneled-side.with-side .main-column {
    padding-right: 0;
  }

  // The frame of a list is a sheet of the page color: the rows of a list in
  // sections round their own corners, over a background they expect behind
  // them. Phones get borderless cards instead.
  .list-panel :deep(.datatable-wrapper) {
    background: var(--background);
    border: 1px solid var(--border);
  }

  // The frame is the outline of the whole list: the sections of a list
  // keep square rows in it, where they rounded their own first and last row
  // for a page without a frame.
  .list-panel :deep(.datatable.multi-section .datatable-row) {
    th:first-child,
    td:first-child,
    td:last-child {
      border-radius: 0;
    }
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

  // A list lets its cards overflow, for a page that scrolls: here they
  // scroll inside the panel, without the bar.
  .list-panel :deep(.datatable-wrapper) {
    overflow-y: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  // TaskInfo writes the width of its resizable panel inline on the column
  .side-column {
    display: none;
    max-width: none;
    min-width: 0 !important;
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
