import marked from 'marked'

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
    mentions.forEach((personId) => {
      const person = personMap[personId]
      compiled = compiled.replace(
        `@${person.full_name}`,
        `<a class="mention" href="/people/${person.id}">@${person.full_name}</a>`
      )
    })
  }
  return compiled
}
