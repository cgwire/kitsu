import marked from 'marked'
import sanitizeHTML from 'sanitize-html'
import { TIME_CODE_REGEX } from './task'

export const sanitize = (html) => {
  return sanitizeHTML(html, {
    allowedTags: sanitizeHTML.defaults.allowedTags.concat(['img']),
    allowedAttributes: {
      a: ['class', 'href'],
      img: ['src']
    }
  })
}

export const getTaskTypeStyle = (task) => {
  let border = 'transparent'
  if (task) border = task.task_type_color
  return {
    'border-left': `4px solid ${border}`
  }
}

export const renderComment = (
  input, mentions, personMap, className = ''
) => {
  let compiled = marked(input || '')
  if (mentions) {
    mentions.forEach(personId => {
      const person = personMap.get(personId)
      compiled = compiled.replaceAll(
        `@${person.full_name}`,
        `<a class="mention" href="/people/${person.id}">@${person.full_name}</a>`
      )
    })
  }
  compiled = sanitize(compiled)

  return compiled.replaceAll(
    TIME_CODE_REGEX,
    function (match, p1, p2, p3, p4, p5, offset, string) {
      return `<a
        class="mention timecode ${className}"
        href="#"
        data-version-revision="${p1}"
        data-minutes="${p2}"
        data-seconds="${p3}"
        data-milliseconds="${p4}"
        data-frame="${p5}"
      >${match}</a>`
    }
  )
}

export const renderMarkdown = (input) => {
  const compiled = marked(input || '')
  return sanitize(compiled)
}
