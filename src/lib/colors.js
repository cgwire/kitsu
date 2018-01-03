import ColorHash from 'color-hash'

export default {
  /*
   * Convert a string (it can be anything) into a HTML color hash.
   */
  fromString (str) {
    let colorHash = new ColorHash({lightness: 0.7, saturation: 0.8})
    return colorHash.hex(str)
  },

  /*
   * This function is needed to convert Shotgun colors to one that are better
   * suited for CGWire skin.
   */
  validationBackgroundColor (task) {
    if (task) {
      if (task.task_status_short_name === 'wtg') {
        return '#f5f5f5'
      } else if (task.task_status_short_name === 'ip') {
        return '#3273dc'
      } else if (task.task_status_short_name === 'pndng') {
        return '#ab26ff'
      } else if (task.task_status_short_name === 'fin') {
        return '#22d160'
      } else if (task.task_status_short_name === 'rtk') {
        return '#ff3860'
      } else if (task.task_status_short_name === 'cfrm') {
        return '#f1c40f'
      } else if (task.task_status_short_name === 'recd') {
        return '#1abc9c'
      }
      return task.task_status_color
    } else {
      return '#ffffff'
    }
  },

  /*
   * Quick and dirty function to change the text color in case the status color
   * is too dark.
   */
  validationTextColor (task) {
    if (task &&
        task.task_status_short_name !== 'todo' &&
        task.task_status_short_name !== 'wtg') {
      return 'white'
    } else {
      return '#333'
    }
  }
}
