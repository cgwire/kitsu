import { marked } from 'marked'
import { markedEmoji } from 'marked-emoji'
import sanitizeHTML from 'sanitize-html'

import emojis from '@/lib/emojis'
import { formatTime } from '@/lib/video'

const markedEmojiOptions = {
  emojis,
  renderer: token => token.emoji
}
marked.use(markedEmoji(markedEmojiOptions))

export const TIME_CODE_REGEX = /v(\d+) (\d+:)?(\d+):(\d+)(\.|:)(\d+) \((\d+)\)/g

export const sanitize = (html, options) => {
  options = {
    allowedLinkTag: true,
    allowedImageTag: true,
    ...options
  }
  // Allow <del>, which marked emits for ~~strikethrough~~.
  let allowedTags = [...sanitizeHTML.defaults.allowedTags, 'del']
  if (!options.allowedLinkTag) {
    allowedTags = allowedTags.filter(tag => tag !== 'a')
  }
  if (options.allowedImageTag) {
    allowedTags.push('img')
  }
  const allowedAttributes = {
    a: ['class', 'href'],
    img: ['src', 'alt', 'title'],
    td: ['align'],
    th: ['align']
  }
  // GFM task-list checkboxes are inert disabled inputs; allow them where a
  // full document is rendered (file preview) so done/todo state survives.
  if (options.allowChecklist) {
    allowedTags.push('input')
    allowedAttributes.input = ['type', 'checked', 'disabled']
  }
  return sanitizeHTML(html, {
    allowedTags,
    allowedAttributes
  })
}

export const renderComment = (
  input,
  mentions,
  departmentMentions,
  personMap,
  departmentMap,
  taskTypes = [],
  className = ''
) => {
  let html = renderMarkdown(input)

  const replacements = new Map()

  if (mentions) {
    for (const personId of mentions) {
      const person = personMap.get(personId)
      if (!person) continue
      const fullName = encodeHtmlEntities(person.full_name)
      replacements.set(
        `@${fullName}`,
        `<a class="mention" href="/people/${person.id}">@${fullName}</a>`
      )
    }
  }

  if (departmentMentions) {
    for (const departmentId of departmentMentions) {
      const department = departmentMap.get(departmentId)
      if (!department) continue
      const departmentName = encodeHtmlEntities(department.name)
      const departmentColor = encodeHtmlEntities(department.color)
      replacements.set(
        `@${departmentName}`,
        `<span style="color: ${departmentColor}">@${departmentName}</span>`
      )
    }
  }

  if (taskTypes) {
    taskTypes.forEach(taskType => {
      const task_name = encodeHtmlEntities(taskType.name)
      if (taskType.url && isSafeHref(taskType.url)) {
        replacements.set(
          `#${task_name}`,
          `<a class="mention mention-task" href="${encodeHtmlEntities(taskType.url)}">#${task_name}</a>`
        )
      }
    })
    replacements.set(
      '#All',
      `<a class="mention mention-task" href="#">#All</a>`
    )
  }

  if (replacements.size > 0) {
    const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = [...replacements.keys()]
      .sort((a, b) => b.length - a.length)
      .map(escapeRegex)
      .join('|')
    html = html.replace(new RegExp(pattern, 'g'), match =>
      replacements.get(match)
    )
  }

  return html.replaceAll(
    TIME_CODE_REGEX,
    (match, version, hours, minutes, seconds, sep, subframes, frame) => {
      return `<span
        class="timecode ${className}"
        data-version-revision="${version}"
        data-frame="${frame}"
      >${match}</span>`
    }
  )
}

export const renderMarkdown = (input, options = {}) => {
  if (!input?.length) return ''
  const html = marked.parse(input)
  return sanitize(html, options)
}

/**
 * Encode HTML entities in JavaScript
 * example task name: "Light & Render" => "Light &amp; Render"
 * @param {string} str - string to encode
 * @returns {string} - encoded string
 */
const encodeHtmlEntities = str => {
  return str.replace(
    /[&<>'"]/g,
    tag =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      })[tag]
  )
}

// Allow relative URLs and http(s) only; block javascript:, data:, vbscript:…
const isSafeHref = url => {
  const scheme = /^\s*([a-z][a-z0-9+.-]*):/i.exec(url)
  return !scheme || ['http', 'https'].includes(scheme[1].toLowerCase())
}

// For :href bindings on user-provided URLs: null when the scheme is unsafe
// (Vue drops the attribute entirely on null).
export const safeUrl = url => (url && isSafeHref(url) ? url : null)

export const replaceTimeWithTimecode = (
  comment,
  currentPreviewRevision,
  frame,
  fps
) => {
  if (comment) {
    const frameDuration = Math.round((1 / fps) * 10000) / 10000
    const currentTimeRaw = (frame - 1) * frameDuration
    const formatedTime = formatTime(currentTimeRaw, fps)
    return comment.replaceAll(
      '@frame',
      `v${currentPreviewRevision} ${formatedTime} (${frame})`
    )
  } else {
    return ''
  }
}

export const renderFileSize = size => {
  if (!size) return ''
  let renderedSize
  if (size > 1000000000) {
    renderedSize = (size / 1000000000).toFixed(1) + 'G'
  } else if (size > 1000000) {
    renderedSize = (size / 1000000).toFixed(1) + 'M'
  } else if (size > 1000) {
    renderedSize = (size / 1000).toFixed(0) + 'K'
  } else {
    renderedSize = size + ''
  }
  return renderedSize
}
