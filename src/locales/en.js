export default {
  people: {
    title: 'People',
    new_person: 'Add a new employee',
    edit_title: 'Edit person',
    persons: 'person | persons',
    delete_text: 'Are you sure you want to remove {personName} from your database?',
    delete_error: 'An error occured while deleting this person. There are probably data linked to it. Are you sure this person has no assignation or wrote no comment?',
    csv: {
      import_file: 'Import a .csv file',
      export_file: 'Download as a .csv file',
      import_title: 'Import employees from a CSV file',
      required_fields: 'Your CSV file requires the following columns',
      select_file: 'Please select a file from one of your folder:',
      error_upload: 'An error occured while uploading your CSV file.'
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
      phone: 'Phone',
      old_password: 'Current password',
      password: 'New password',
      password_2: 'New password (repeat)'
    }
  },

  profile: {
    title: 'Your Profile',
    info_title: 'Information',
    password_title: 'Change password',
    timezone: 'Timezone',
    language: 'Language',
    save: {
      button: 'Save changes',
      error: 'An error occured while saving changes'
    },
    change_password: {
      button: 'Change password',
      success: 'Your password was successfully changed!',
      unvalid: 'Your new password confirmation doesn\'t match or your password is too short (7 chars, at least, is expected).',
      error: 'An error occured while changing password. Please verify your current password.'
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
    title: 'Productions',
    edit_title: 'Edit production',
    number: 'production | productions',
    new_production: 'Add a production',
    fields: {
      name: 'Name',
      status: 'Status'
    },
    status: {
      open: 'Open',
      closed: 'Close'
    },
    delete_text: 'Are you sure you want to remove {name} from your database?',
    delete_error: 'An error occured while deleting this production. There are probably data linked to it. Are you sure this production has no task, shot or asset linked to it?'
  },

  task_types: {
    title: 'Task Types',
    edit_title: 'Edit task type',
    number: 'task type | task types',
    new_task_type: 'Add a task type',
    fields: {
      name: 'Name',
      color: 'Color'
    },
    delete_text: 'Are you sure you want to remove {name} from your database?',
    delete_error: 'An error occured while deleting this task type. There are probably data linked to it. Are you sure this task type has no task linked to it?'
  },

  asset_types: {
    title: 'Asset Types',
    edit_title: 'Edit asset type',
    number: 'asset type | asset types',
    new_asset_type: 'Add an asset type',
    fields: {
      name: 'Name'
    },
    delete_text: 'Are you sure you want to remove {name} from your database?',
    delete_error: 'An error occured while deleting this asset type. There are probably data linked to it. Are you sure this asset type has no asset linked to it?'
  },

  assets: {
    title: 'Asset',
    edit_title: 'Edit asset',
    number: 'asset | asset',
    new_asset: 'Add an asset',
    fields: {
      name: 'Name',
      type: 'Type',
      production: 'Prod'
    },
    delete_text: 'Are you sure you want to remove {name} from your database?',
    delete_error: 'An error occured while deleting this asset. There are probably data linked to it. Are you sure this asset type has no task linked to it?'
  },

  server_down: {
    title: 'Kitsu encountered an error while reaching its data API.',
    text: 'Please contact your vendor support, your system administrator or your IT department to understand what is going wrong.'
  }
}
