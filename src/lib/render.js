import marked from 'marked'
import sanitizeHTML from 'sanitize-html'

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

export const renderComment = (input, mentions, personMap) => {
  let compiled = marked(input || '')
  if (mentions) {
    mentions.forEach(personId => {
      const person = personMap.get(personId)
      compiled = compiled.replace(
        `@${person.full_name}`,
        `<a class="mention" href="/people/${person.id}">@${person.full_name}</a>`
      )
    })
  }
  return sanitize(compiled)
}

export const renderMarkdown = (input) => {
  const compiled = marked(input || '')
  return sanitize(compiled)
}
