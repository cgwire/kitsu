// @vitest-environment node
import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { babelParse, parse } from '@vue/compiler-sfc'
import { describe, expect, it } from 'vitest'

// Node types of the template AST (NodeTypes in @vue/compiler-core).
const ELEMENT = 1
const ATTRIBUTE = 6
const DIRECTIVE = 7

// Element kinds (ElementTypes in @vue/compiler-core).
const PLAIN_ELEMENT = 0
const COMPONENT = 1

// What any element takes, besides aria-* and data-*. Key and ref never reach
// the component.
const GLOBAL_ATTRIBUTES = [
  'accesskey',
  'autofocus',
  'class',
  'contenteditable',
  'dir',
  'draggable',
  'hidden',
  'id',
  'inert',
  'inputmode',
  'is',
  'key',
  'lang',
  'ref',
  'role',
  'spellcheck',
  'style',
  'tabindex',
  'title',
  'translate',
  // AnimXYZ reads it on the element of an animated page
  'xyz'
]

// What the root elements of components take on top of those.
const ELEMENT_ATTRIBUTES = {
  a: ['download', 'href', 'rel', 'target'],
  button: ['disabled', 'form', 'name', 'type', 'value'],
  img: ['alt', 'height', 'loading', 'src', 'width'],
  input: [
    'autocomplete',
    'checked',
    'disabled',
    'max',
    'maxlength',
    'min',
    'name',
    'placeholder',
    'readonly',
    'required',
    'step',
    'type',
    'value'
  ],
  label: ['for'],
  td: ['colspan', 'headers', 'rowspan'],
  th: ['colspan', 'headers', 'rowspan', 'scope']
}

// Global components, by the element they render.
const GLOBAL_COMPONENTS = { 'router-link': 'a' }

const kebabCase = name => name.replace(/\B([A-Z])/g, '-$1').toLowerCase()
const camelCase = name =>
  name.replace(/-(\w)/g, (_, char) => char.toUpperCase())

const isTakenBy = (tag, name) =>
  GLOBAL_ATTRIBUTES.includes(name) ||
  name.startsWith('aria-') ||
  name.startsWith('data-') ||
  (ELEMENT_ATTRIBUTES[tag] ?? []).includes(name)

const babelNodes = (node, found = []) => {
  if (Array.isArray(node)) node.forEach(child => babelNodes(child, found))
  else if (node && typeof node.type === 'string') {
    found.push(node)
    Object.values(node).forEach(child => {
      if (child && typeof child === 'object') babelNodes(child, found)
    })
  }
  return found
}

const isCallTo = (node, name) =>
  node.type === 'CallExpression' && node.callee.name === name

const resolveImport = (file, source) =>
  source.startsWith('@/')
    ? `src/${source.slice(2)}`
    : path.join(path.dirname(file), source)

const isLocal = source => source.startsWith('@/') || source.startsWith('.')

// The component file a local import points to, written with or without its
// extension: Vite resolves both.
const componentFile = (file, source) => {
  if (!isLocal(source)) return null
  const target = resolveImport(file, source)
  if (target.endsWith('.vue')) return target
  return existsSync(`${target}.vue`) ? `${target}.vue` : null
}

// The file a defineAsyncComponent call loads, from a loader written in the
// call or in a variable of the same script: undefined for a package, null
// when the spec cannot tell.
const asyncTarget = (file, call, declarations) => {
  const [loader] = call.arguments
  const definition =
    loader?.type === 'Identifier' ? declarations.get(loader.name) : loader
  const sources = babelNodes(definition ?? [])
    .filter(
      node => node.type === 'CallExpression' && node.callee.type === 'Import'
    )
    .map(node => node.arguments[0])
    .map(source => (source?.type === 'StringLiteral' ? source.value : null))
  const component = sources
    .map(source => source && componentFile(file, source))
    .find(Boolean)
  if (component) return component
  const isPackage = source => source !== null && !isLocal(source)
  return sources.length > 0 && sources.every(isPackage) ? undefined : null
}

// A chain of v-if and v-else branches renders one root.
const rootsOf = ast => {
  const roots = ast.children.filter(node => node.type === ELEMENT)
  if (roots.length === 0) return null
  const isBranch = (node, names) =>
    node.props.some(
      prop => prop.type === DIRECTIVE && names.includes(prop.name)
    )
  const isOneChain =
    roots.length === 1 ||
    (isBranch(roots[0], ['if']) &&
      roots.slice(1).every(node => isBranch(node, ['else-if', 'else'])))
  return isOneChain ? roots : null
}

const components = new Map()

const readComponent = file => {
  if (components.has(file)) return components.get(file)
  const source = readFileSync(file, 'utf8')
  const { descriptor } = parse(source, { filename: file })
  const props = new Set()
  const imports = new Map()
  const scripts = [descriptor.script, descriptor.scriptSetup].filter(Boolean)
  scripts.forEach(script => {
    const { program } = babelParse(script.content, { sourceType: 'module' })
    const nodes = babelNodes(program)
    const declarations = new Map(
      nodes
        .filter(node => node.type === 'VariableDeclarator' && node.init)
        .map(node => [node.id.name, node.init])
    )
    nodes.forEach(node => {
      if (isCallTo(node, 'defineProps')) {
        const [definition] = node.arguments
        definition?.properties?.forEach(property => {
          if (property.key) props.add(property.key.name ?? property.key.value)
        })
        definition?.elements?.forEach(element => props.add(element.value))
      } else if (isCallTo(node, 'defineModel')) {
        const [name] = node.arguments
        props.add(name?.type === 'StringLiteral' ? name.value : 'modelValue')
      } else if (
        node.type === 'ImportDeclaration' &&
        componentFile(file, node.source.value)
      ) {
        const target = componentFile(file, node.source.value)
        node.specifiers.forEach(specifier =>
          imports.set(kebabCase(specifier.local.name), target)
        )
      } else if (
        node.type === 'VariableDeclarator' &&
        node.init &&
        isCallTo(node.init, 'defineAsyncComponent')
      ) {
        const target = asyncTarget(file, node.init, declarations)
        if (target !== undefined) imports.set(kebabCase(node.id.name), target)
      }
    })
  })
  const component = {
    imports,
    props,
    // Such a component places the attributes it gets itself.
    placesAttributes:
      /inheritAttrs:\s*false|\$attrs|useAttrs\(/.test(source),
    roots: descriptor.template?.ast ? rootsOf(descriptor.template.ast) : null,
    template: descriptor.template?.ast
  }
  components.set(file, component)
  return component
}

// Where an attribute the component does not declare would land, when no
// element can take it.
const misplaced = (file, name) => {
  if (!existsSync(file)) return []
  const component = readComponent(file)
  if (component.props.has(camelCase(name)) || component.placesAttributes) {
    return []
  }
  if (!component.roots) return [`no single root of ${file}`]
  return component.roots.flatMap(root => {
    const tag = kebabCase(root.tag)
    if (root.tagType === COMPONENT) {
      if (component.imports.has(tag)) {
        const target = component.imports.get(tag)
        return target
          ? misplaced(target, name)
          : [`<${tag}> of ${file}, whose file the spec cannot tell`]
      }
      const element = GLOBAL_COMPONENTS[tag]
      return element && !isTakenBy(element, name) ? [`<${tag}> of ${file}`] : []
    }
    if (root.tagType !== PLAIN_ELEMENT || isTakenBy(tag, name)) return []
    return [`<${tag}> of ${file}`]
  })
}

const strayAttributes = file => {
  const component = readComponent(file)
  if (!component.template) return []
  const source = readFileSync(file, 'utf8')
  const found = []
  const visit = node => {
    if (node.type !== ELEMENT) return
    const target = component.imports.get(kebabCase(node.tag))
    if (node.tagType === COMPONENT && target === null) {
      const line = source.slice(0, node.loc.start.offset).split('\n')
      found.push(`${file}:${line.length} ${node.tag}: the spec cannot tell its file`)
    } else if (node.tagType === COMPONENT && target) {
      node.props.forEach(prop => {
        const name =
          prop.type === ATTRIBUTE
            ? prop.name
            : prop.name === 'bind' && prop.arg?.isStatic
              ? prop.arg.content
              : prop.name === 'model' && (!prop.arg || prop.arg.isStatic)
                ? (prop.arg?.content ?? 'modelValue')
                : null
        if (name && !['key', 'ref'].includes(name)) {
          misplaced(target, name).forEach(where => {
            const line = source.slice(0, prop.loc.start.offset).split('\n')
            found.push(`${file}:${line.length} ${name} on ${where}`)
          })
        }
      })
    }
    node.children.forEach(visit)
  }
  component.template.children.forEach(visit)
  return found
}

// A pathspec star crosses folders: this lists src/App.vue too.
const vueFiles = () =>
  execSync("git ls-files 'src/*.vue'", { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean)

// A prop the component does not declare lands on its root element as an
// attribute, where it does nothing: such as is-thin for a prop named thin, or
// a prop removed since.
describe('component attributes', () => {
  it('finds the components to scan', () => {
    const files = vueFiles()
    expect(files.length).toBeGreaterThan(100)
    expect(files).toContain('src/App.vue')
  })

  // Reads every component: past the default timeout under coverage or load.
  it(
    'pass a component only its props, or attributes its root takes',
    { timeout: 30000 },
    () => {
      expect(vueFiles().flatMap(strayAttributes)).toEqual([])
    }
  )
})
