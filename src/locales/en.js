export default {
  people: {
    title: 'People',
    new_person: 'Add a new employee',
    edit_title: 'Edit person',
    persons: 'Persons',
    delete_text: 'Are you sure you want to remove {personName} from your database?',
    delete_error: 'An error occured while deleting this person. There are probably data linked to it. Are you sure this person has no assignation or wrote no comment?',
    csv: {
      import_file: 'Import a .csv file',
      export_file: 'Download as a .csv file',
      import_title: 'Import employees from a CSV file',
      required_fields: 'First Name, Last Name'
    },
    list: {
      name: 'Name',
      email: 'Email',
      phone: 'Phone'
    },
    fields: {
      first_name: 'First name',
      last_name: 'Last name',
      email: 'Email',
      phone: 'Phone'
    }
  },
  main: {
    profile: 'Profile',
    logout: 'Logout',
    cancel: 'Cancel',
    confirmation: 'Confirm'
  },
  login: {
    title: 'Log in to Kitsu',
    login: 'Log in',
    login_failed: 'Log in failed, please verify your credentials',
    fields: {
      email: 'Email',
      password: 'Password'
    }
  },
  productions: {
    title: 'Productions'
  },
  task_types: {
    title: 'Task Types'
  },
  server_down: {
    title: 'Kitsu encountered an error while reaching its data API.',
    text: 'Please contact your vendor support, your system administrator or your IT department to understand what is going wrong.'
  }
}
