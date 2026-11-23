// @vitest-environment node
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

import { parse } from '@vue/compiler-sfc'
import { describe, expect, it } from 'vitest'

// Node types of the template AST (NodeTypes in @vue/compiler-core).
const ELEMENT = 1
const TEXT = 2
const COMMENT = 3
const INTERPOLATION = 5
const ATTRIBUTE = 6
const DIRECTIVE = 7

// Element kinds (ElementTypes in @vue/compiler-core).
const COMPONENT = 1
const SLOT = 2

const NAME_ATTRIBUTES = ['aria-label', 'aria-labelledby', 'title']

const EMPTY_STRINGS = ["''", '""', '``']

// Button components drawing the icon their `icon` prop names.
const BUTTON_COMPONENTS = ['button-simple', 'button-link', 'button-href-link']

// Lint keeps imported components in kebab case, not global ones such as
// RouterLink.
const kebabCase = tag => tag.replace(/\B([A-Z])/g, '-$1').toLowerCase()

// A static attribute, or a bound one (`:title`).
const hasAttribute = (element, names) =>
  element.props.some(
    prop =>
      (prop.type === ATTRIBUTE && names.includes(prop.name)) ||
      (prop.type === DIRECTIVE &&
        prop.name === 'bind' &&
        names.includes(prop.arg?.content))
  )

// The same, without the empty ones: `:text="''"` names nothing.
const hasNonEmptyAttribute = (element, names) =>
  element.props.some(
    prop =>
      (prop.type === ATTRIBUTE &&
        names.includes(prop.name) &&
        Boolean(prop.value?.content.trim())) ||
      (prop.type === DIRECTIVE &&
        prop.name === 'bind' &&
        names.includes(prop.arg?.content) &&
        !EMPTY_STRINGS.includes(prop.exp?.content.trim()))
  )

const isIcon = element =>
  element.tag === 'svg' || /-icon$/.test(kebabCase(element.tag))

// Buttons, links, and elements given the button role, bound or not.
const isControl = element =>
  ['button', 'router-link'].includes(kebabCase(element.tag)) ||
  (element.tag === 'a' && hasAttribute(element, ['href'])) ||
  element.props.some(
    prop =>
      (prop.type === ATTRIBUTE &&
        prop.name === 'role' &&
        prop.value?.content === 'button') ||
      (prop.type === DIRECTIVE &&
        prop.name === 'bind' &&
        prop.arg?.content === 'role' &&
        /['"`]button['"`]/.test(prop.exp?.content ?? ''))
  )

const hasText = node =>
  node.type === INTERPOLATION ||
  (node.type === TEXT && node.content.trim() !== '')

const hasTextDirective = element =>
  element.props.some(
    prop => prop.type === DIRECTIVE && ['html', 'text'].includes(prop.name)
  )

// An icon names itself with an SVG <title> child or an attribute.
const isNamedIcon = icon =>
  hasNonEmptyAttribute(icon, NAME_ATTRIBUTES) ||
  icon.children.some(
    child =>
      child.type === ELEMENT &&
      child.tag === 'title' &&
      child.children.some(hasText)
  )

const hasDirective = (node, name) =>
  node.type === ELEMENT &&
  node.props.some(prop => prop.type === DIRECTIVE && prop.name === name)

// What the content of a control gives its name: text, a named icon, or a
// component or slot that may render text. Only icons without a name give
// nothing.
const contentNames = node => {
  if (hasText(node)) return true
  if (node.type !== ELEMENT) return false
  if (isIcon(node)) return isNamedIcon(node)
  if (node.tagType === COMPONENT || node.tagType === SLOT) return true
  return hasTextDirective(node) || alwaysNamed(node.children)
}

// Whether some content names the control in every state: a branch under
// v-show or v-for, or under v-if without a v-else, can be gone and leave the
// icon alone.
const alwaysNamed = children => {
  const nodes = children.filter(
    child =>
      child.type !== COMMENT && !(child.type === TEXT && !child.content.trim())
  )
  return nodes.some((node, index) => {
    if (['show', 'for', 'else-if', 'else'].some(name => hasDirective(node, name))) {
      return false
    }
    if (!hasDirective(node, 'if')) return contentNames(node)
    const chain = [node]
    nodes
      .slice(index + 1)
      .every(
        next =>
          (hasDirective(next, 'else-if') || hasDirective(next, 'else')) &&
          chain.push(next)
      )
    return (
      hasDirective(chain[chain.length - 1], 'else') &&
      chain.every(
        branch =>
          !hasDirective(branch, 'show') &&
          !hasDirective(branch, 'for') &&
          contentNames(branch)
      )
    )
  })
}

const hasIcon = node =>
  node.type === ELEMENT && (isIcon(node) || node.children.some(hasIcon))

const unnamedIconControls = (file, source) => {
  const { descriptor } = parse(source, { filename: file })
  if (!descriptor.template?.ast) return []
  const found = []
  const visit = node => {
    if (node.type !== ELEMENT) return
    const line = source.slice(0, node.loc.start.offset).split('\n').length
    const at = `${file}:${line} <${node.tag}>`
    if (BUTTON_COMPONENTS.includes(kebabCase(node.tag))) {
      // They show their `text` and render their `title` on their button.
      const named = hasNonEmptyAttribute(node, ['text', ...NAME_ATTRIBUTES])
      if (!named && hasAttribute(node, ['icon'])) found.push(at)
    } else if (
      isControl(node) &&
      !hasNonEmptyAttribute(node, NAME_ATTRIBUTES) &&
      !hasTextDirective(node)
    ) {
      const iconOnly = isIcon(node)
        ? !isNamedIcon(node)
        : hasIcon(node) && !alwaysNamed(node.children)
      if (iconOnly) found.push(at)
    }
    node.children.forEach(visit)
  }
  descriptor.template.ast.children.forEach(visit)
  return found
}

// A pathspec star crosses folders: this lists src/App.vue too.
const vueFiles = () =>
  execSync("git ls-files 'src/*.vue'", { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean)

// The props that name each picker. ComboboxActions, ComboboxMultiple,
// ComboboxProduction, ComboboxStatusMultiple, and ComboboxStudio take no
// aria-label: on them, the attribute lands on the wrapper and leaves the
// combobox unnamed.
const PICKER_NAMES = {
  'combobox-actions': [],
  'combobox-department': ['label', 'aria-label'],
  'combobox-multiple': ['label'],
  'combobox-options': ['aria-label'],
  'combobox-production': ['label'],
  'combobox-status-automation': ['label', 'aria-label'],
  'combobox-status-multiple': ['label'],
  'combobox-studio': ['label'],
  'combobox-styled': ['label', 'aria-label'],
  'combobox-tag': ['label', 'aria-label'],
  'combobox-task-type-options': ['label', 'aria-label'],
  'combobox-visible-options': ['label', 'aria-label']
}

// These show their title as text. It names them when it is fixed text, not
// when it sums up the selection, such as "All" or "(2/3)".
const TITLED_PICKERS = ['combobox-actions', 'combobox-options']

const hasFixedTitle = element =>
  element.props.some(
    prop =>
      (prop.type === ATTRIBUTE &&
        prop.name === 'title' &&
        Boolean(prop.value?.content.trim())) ||
      (prop.type === DIRECTIVE &&
        prop.name === 'bind' &&
        prop.arg?.content === 'title' &&
        /^\$t\(\s*'[^']+'\s*\)$/.test(prop.exp?.content.trim()))
  )

// A control holding only an icon has no name of its own: a screen reader
// announces a bare "button" or "link", and the mouse gets no tooltip.
describe('icon controls', () => {
  it('finds the components to scan', () => {
    const files = vueFiles()
    expect(files.length).toBeGreaterThan(100)
    expect(files).toContain('src/App.vue')
  })

  it('give each button or link made of an icon alone a name', () => {
    const unnamed = vueFiles().flatMap(file =>
      unnamedIconControls(file, readFileSync(file, 'utf8'))
    )

    expect(unnamed).toEqual([])
  })

  // Their combobox takes its name from the label, or from an aria-label where
  // the page shows none.
  it('give each picker listed above a name', () => {
    const unnamed = vueFiles().flatMap(file => {
      const source = readFileSync(file, 'utf8')
      const { descriptor } = parse(source, { filename: file })
      if (!descriptor.template?.ast) return []
      const found = []
      const visit = node => {
        if (node.type !== ELEMENT) return
        const tag = kebabCase(node.tag)
        if (
          PICKER_NAMES[tag] &&
          !hasNonEmptyAttribute(node, PICKER_NAMES[tag]) &&
          !(TITLED_PICKERS.includes(tag) && hasFixedTitle(node))
        ) {
          const line = source.slice(0, node.loc.start.offset).split('\n').length
          found.push(`${file}:${line} <${node.tag}>`)
        }
        node.children.forEach(visit)
      }
      descriptor.template.ast.children.forEach(visit)
      return found
    })

    expect(unnamed).toEqual([])
  })
})
