export default {
  getChoicesOptions(descriptor) {
    if (!descriptor?.choices) return [{ label: '', value: '' }]
    const values = descriptor.choices.map(c => ({ label: c, value: c }))
    return [{ label: '', value: '' }, ...values]
  }
}
