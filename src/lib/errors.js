const errors = {
  backToLogin () {
    if (window.location !== '/login') {
      window.location.replace('/login')
    }
  }
}
export default errors
