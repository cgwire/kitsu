import { marked } from 'marked'
import { markedEmoji } from 'marked-emoji'
import sanitizeHTML from 'sanitize-html'
import { formatTime } from '@/lib/video'
import emojis from '@/lib/emojis'

const options = {
  emojis,
  unicode: true
}
marked.use(markedEmoji(options))

export const TIME_CODE_REGEX = /v(\d+) (\d+:)?(\d+):(\d+)(\.|:)(\d+) \((\d+)\)/g

export const sanitize = html => {
  return sanitizeHTML(html, {
    allowedTags: sanitizeHTML.defaults.allowedTags.concat(['img']),
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
  className = ''
) => {
  let compiled = marked.parse(input || '')
  compiled = sanitize(compiled)
  if (mentions) {
    mentions.forEach(personId => {
      const person = personMap.get(personId)
      compiled = compiled.replaceAll(
        `@${person.full_name}`,
        `<a class="mention" href="/people/${person.id}">@${person.full_name}</a>`
      )
    })
    departmentMentions.forEach(departmentId => {
      const department = departmentMap.get(departmentId)
      compiled = compiled.replaceAll(
        `@${department.name}`,
        `<span style="color: ${department.color}">@${department.name}</span>`
      )
    })
  }

  return compiled.replaceAll(
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

export const renderMarkdown = input => {
  const compiled = marked.parse(input || '')
  return sanitize(compiled)
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
