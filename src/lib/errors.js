const errors = {
  backToLogin() {
    if (window.location.pathname !== '/login') {
      window.location.replace('/login')
    }
  }
}
export default errors
