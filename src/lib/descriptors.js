export default {
  getChoicesOptions(descriptor) {
    const values = descriptor.choices.map(c => ({ label: c, value: c }))
    return [{ label: '', value: '' }, ...values]
  }
}
