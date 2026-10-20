<template>
  <div class="settings-page">
    <div class="wrapper">
      <nav class="settings-menu">
        <slot name="menu-top" />
        <div class="menu-group" v-for="group in menuGroups" :key="group.label">
          <p class="menu-label">{{ $t(group.label) }}</p>
          <ul>
            <li
              :class="{ 'is-active': item.id === activeTab }"
              :key="item.id"
              v-for="item in group.items"
            >
              <router-link
                :aria-current="item.id === activeTab ? 'page' : undefined"
                :to="{ query: { tab: item.id } }"
              >
                {{ $t(item.label) }}
              </router-link>
            </li>
          </ul>
        </div>
      </nav>

      <div class="settings-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
// --------------------------------------------------------------------------

defineProps({
  activeTab: { type: String, default: '' },
  // [{ label, items: [{ id, label }] }], labels are i18n keys
  menuGroups: { type: Array, default: () => [] }
})
</script>

<style lang="scss" scoped>
// The .tab blocks come from the slot and carry the scope of the page, hence
// the :deep() rules to style them from here.

.wrapper {
  background: var(--background-page);
  margin-top: 0;
  overflow-y: scroll;
  padding: 1.5em 1em 1em;
  flex: 1;
  display: flex;
  gap: 1.5em;
}

.settings-menu {
  align-self: flex-start;
  background: var(--background-panel);
  border-radius: 12px;
  flex: 0 0 220px;
  padding: 1.5em 1em 1em;
  position: sticky;
  top: 0;

  .menu-group + .menu-group {
    margin-top: 1.5em;
  }

  .menu-label {
    color: var(--text-alt);
    font-size: 0.8em;
    letter-spacing: 0.1em;
    margin-bottom: 0.5em;
    text-transform: uppercase;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    margin-bottom: 0.2em;
  }

  a {
    border-radius: 8px;
    color: var(--text-panel);
    cursor: pointer;
    display: block;
    padding: 0.4em 0.8em;

    &:hover {
      background: var(--background-hover);
    }
  }

  .is-active a,
  .is-active a:hover {
    background: var(--background-selected);
    color: var(--text-strong);
    font-weight: 600;
  }
}

.settings-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

:deep(.tab) {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 800px;
  overflow-y: auto;
  padding-left: 2px;
  padding-right: 1em;
}

// Workflow tabs hold lists and tables, they need more room than forms.
:deep(.tab.is-wide) {
  max-width: 1200px;
}

// The look of the setting blocks of every tab lives here. Wide tables
// scroll inside their block instead of stretching it.
// Same look as the .block panels of the entity pages (Shot.vue)
:deep(.tab .section) {
  background: var(--background-block);
  border: 1px solid var(--border);
  border-radius: 1em;
  box-shadow: 0 0 6px var(--box-shadow);
  margin-bottom: 1em;
  overflow-x: auto;
  padding: 1.5em;
}

// Empty list messages: modals also render a .box here, hence the parents.
:deep(.tab .column > .box),
:deep(.tab .background-settings > .box),
:deep(.tab .board-settings > .box) {
  border-radius: 12px;
}

// Direct children only: the Clients preview header lays out its own title.
// The shared list components (asset types, task types, automations,
// board) have fixed widths for the studio template page: here they fill
// their panel.
:deep(.tab .section .columns > .column:first-child) {
  flex: 1 1 auto;
  max-width: none;
}

:deep(.tab .section .datatable),
:deep(.tab .section .list),
:deep(.tab .section .columns > .column > .box),
:deep(.tab .section > .box) {
  max-width: none;
  min-width: 0;
  width: 100%;
}

:deep(.tab .section .datatable) {
  border-radius: 10px;
  overflow: hidden;
}

// A long studio list would otherwise stretch the page below the linked items
:deep(.tab .section .import-list) {
  flex: none;
  max-height: 400px;
}

:deep(.tab .section .datatable th) {
  background: transparent;
}

:deep(.tab .section > .subtitle) {
  border-bottom: 0;
  margin-bottom: 1.5em;
  margin-top: 0;
}

:deep(.tab .explanation) {
  color: var(--text-alt);
}

// Same look as the TextField description, for the Checkbox that has no
// description prop.
:deep(.tab .field-help) {
  color: var(--text-alt);
  font-size: 0.9em;
  margin-top: 0.4em;
}

// Short numeric settings: the input sits on the left of its label, the
// description on its own line below.
:deep(.tab .number-line) {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6em;

  .label {
    margin-bottom: 0;
  }

  .control {
    flex: 0 0 auto;
    order: -1;
  }

  .help {
    flex: 0 0 100%;
    margin-top: 0;
  }

  .input {
    padding: 0.3em 0.3em;
    width: 45px;
    height: 35px;
  }
}

// Light theme only: on the grey page the panel grey would blend in.
:global(.theme:not(.dark) .settings-page .settings-menu) {
  background: var(--background);
}

// Dark theme keeps the background App.vue gives to .dark .box
:global(.dark .settings-page .tab .section) {
  background: #3d4048;
}

@media screen and (max-width: 768px) {
  .wrapper {
    flex-direction: column;
    gap: 1em;
    padding: 1em;
  }

  .settings-menu {
    align-self: stretch;
    flex: 0 0 auto;
    overflow-x: auto;
    padding: 0.5em;
    position: static;

    &,
    ul {
      display: flex;
      gap: 0.5em;
      white-space: nowrap;
    }

    .menu-group + .menu-group {
      margin-top: 0;
    }

    .menu-label {
      display: none;
    }
  }

  :deep(.tab .section) {
    padding: 1.5em;
  }

  :deep(.tab .columns .column + .column) {
    display: none;
  }

  :deep(.tab .remove),
  :deep(.tab .grab),
  :deep(.tab .name-full) {
    display: none !important;
  }

  :deep(.background-settings .flexrow.mt1.mb1),
  :deep(.status-automation-settings .add-status-automation) {
    display: none;
  }

  :deep(.background-settings .datatable th:last-child),
  :deep(.background-settings .datatable td:last-child),
  :deep(.background-settings .is-default) {
    display: none !important;
  }

  :deep(.tab .datatable-row .button) {
    display: none !important;
  }

  :deep(.board-settings .roles .button) {
    display: none;
  }

  :deep(.board-settings .roles .bool-field) {
    pointer-events: none;
    opacity: 0.7;
  }

  :deep(.board-settings .datatable-row .roles .bool-field) {
    flex: 0 0 100% !important;
    width: 100% !important;
    margin-bottom: 0.35em;
  }

  :deep(.tab .datatable),
  :deep(.tab .datatable.list),
  :deep(.tab table.list) {
    display: block;
    background: transparent;
    overflow-x: visible;
    min-width: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
    white-space: normal;
  }

  :deep(.tab .columns),
  :deep(.tab .columns .column) {
    max-width: 100%;
    min-width: 0;
    width: auto;
  }

  :deep(.tab .datatable .datatable-head),
  :deep(.tab .datatable thead) {
    display: none;
  }

  :deep(.tab .datatable .datatable-body),
  :deep(.tab .datatable tbody) {
    display: block;
  }

  :deep(.tab .datatable .datatable-row),
  :deep(.tab .datatable .datatable-row:nth-child(even)),
  :deep(.tab .datatable .datatable-row:hover),
  :deep(.tab .datatable .datatable-row:last-child) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5em;
    padding: 0.6em 0.75em;
    margin-bottom: 0.5em;
    background-color: var(--background) !important;
    border: 1px solid var(--border);
    border-radius: 6px;
    width: 100%;
    box-sizing: border-box;
    max-width: 100%;
  }

  :deep(.tab .datatable .datatable-row td),
  :deep(.tab .datatable .datatable-row:last-child td),
  :deep(.tab .datatable .datatable-row:last-child:nth-child(even) td),
  :deep(.tab .datatable .datatable-row:last-child:hover td) {
    display: block;
    padding: 0;
    border: 0;
    background-color: transparent !important;
    width: auto;
    min-width: 0;
    max-width: none;
  }
}
</style>
