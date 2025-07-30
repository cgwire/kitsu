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
  let allowedTags = sanitizeHTML.defaults.allowedTags
  if (!options.allowedLinkTag) {
    allowedTags = allowedTags.filter(tag => tag !== 'a')
  }
  if (options.allowedImageTag) {
    allowedTags.push('img')
  }
  return sanitizeHTML(html, {
    allowedTags,
    allowedAttributes: {
      a: ['class', 'href'],
      img: ['src']
    }
  })
}

export const getTaskTypeStyle = task => {
  let border = 'transparent'
  if (task) border = task.task_type_color
  return {
    'border-left': `4px solid ${border}`
  }
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

  if (mentions) {
    mentions.forEach(personId => {
      const person = personMap.get(personId)
      html = html.replaceAll(
        `@${person.full_name}`,
        `<a class="mention" href="/people/${person.id}">@${person.full_name}</a>`
      )
    })
    departmentMentions.forEach(departmentId => {
      const department = departmentMap.get(departmentId)
      html = html.replaceAll(
        `@${department.name}`,
        `<span style="color: ${department.color}">@${department.name}</span>`
      )
    })
  }

  if (taskTypes) {
    // replace #TaskType with a link to the task within the same entity
    taskTypes.forEach(taskType => {
      const task_name = encodeHtmlEntities(taskType.name)
      if (taskType.url)
        html = html.replaceAll(
          `#${task_name}`,
          `<a class="mention mention-task" href="${taskType.url}">#${task_name}</a>`
        )
    })
    // replace #All with a link to the shot
    html = html.replaceAll(
      '#All',
      `<a class="mention mention-task" href="#">#All</a>`
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

  // // -- more complex version if needed --
  // var el = document.createElement("div");
  // el.innerText = el.textContent = str;
  // str = el.innerHTML;
  // return str;
}

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
  let renderedSize = ''
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
