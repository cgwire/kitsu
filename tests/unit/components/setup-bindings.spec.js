// @vitest-environment node
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'
import { describe, expect, it } from 'vitest'

// In <script setup>, template resolution camelizes a tag before it capitalizes
// it, so a setup binding named after the tag is tried first. Vue only takes it
// when it is a function, because a function is a valid functional component:
// a ref of the same name is skipped and the component still wins. Task.vue
// declared `addComment` next to <add-comment>, so Vue rendered the function on
// every update and each render posted a comment.
const camelize = tag =>
  tag
    .split('-')
    .map((part, index) => (index ? part[0].toUpperCase() + part.slice(1) : part))
    .join('')

// Only bindings that hold a function shadow a component.
const FUNCTION_DECLARATIONS =
  /^(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>|^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/gm

const componentTags = template =>
  new Set(
    [...template.matchAll(/<([a-z][a-z0-9]*(?:-[a-z0-9]+)+)[\s/>]/g)].map(
      match => match[1]
    )
  )

const functionNames = script =>
  new Set(
    [...script.matchAll(FUNCTION_DECLARATIONS)].map(
      match => match[1] ?? match[2]
    )
  )

const shadowedTags = source => {
  const setupAt = source.indexOf('<script setup>')
  if (setupAt === -1) return []
  const functions = functionNames(source.slice(setupAt))
  return [...componentTags(source.slice(0, setupAt))].filter(tag =>
    functions.has(camelize(tag))
  )
}

// A name the template reads but <script setup> does not bind compiles to
// `_ctx.name`, undefined at runtime: a click handler that does nothing, a prop
// that falls back to its default. Names starting with `$` are the instance
// globals ($t, $route, $store, ...).
const unboundNames = (file, source) => {
  const { descriptor } = parse(source, { filename: file })
  if (!descriptor.scriptSetup || !descriptor.template) return []
  const { bindings } = compileScript(descriptor, {
    id: file,
    inlineTemplate: false
  })
  const { code } = compileTemplate({
    filename: file,
    id: file,
    source: descriptor.template.content,
    compilerOptions: { bindingMetadata: bindings, prefixIdentifiers: true }
  })
  const names = [...code.matchAll(/_ctx\.([A-Za-z_$][\w$]*)/g)].map(
    match => match[1]
  )
  return [...new Set(names)].filter(
    name => !name.startsWith('$') && !(name in bindings)
  )
}

const files = execSync('git ls-files ":(glob)src/**/*.vue"', { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)

describe('script setup bindings', () => {
  it('finds the components to scan', () => {
    expect(files.length).toBeGreaterThan(100)
    expect(files).toContain('src/App.vue')
  })

  it('never shadows a component tag with a setup function', () => {
    const offenders = files
      .map(file => ({ file, tags: shadowedTags(readFileSync(file, 'utf8')) }))
      .filter(entry => entry.tags.length > 0)
      .map(entry => `${entry.file}: ${entry.tags.join(', ')}`)

    expect(offenders).toEqual([])
  })

  it('binds every name a template reads', () => {
    const offenders = files
      .map(file => ({
        file,
        names: unboundNames(file, readFileSync(file, 'utf8'))
      }))
      .filter(entry => entry.names.length > 0)
      .map(entry => `${entry.file}: ${entry.names.join(', ')}`)

    expect(offenders).toEqual([])
  })
})
