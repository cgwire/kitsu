export default {
  people: {
    title: 'People',
    new_person: 'Add a new employee',
    edit_title: 'Edit person',
    persons: 'person | persons',
    running_tasks: 'Running tasks',
    delete_text: 'Are you sure you want to remove {personName} from your database?',
    delete_error: 'An error occured while deleting this person. There are probably data linked to it. Are you sure this person has no assignation or wrote no comment?',
    csv: {
      import_file: 'Import a .csv file',
      export_file: 'Download as a .csv file',
      import_title: 'Import data from a CSV file',
      required_fields: 'Your CSV file requires the following columns',
      select_file: 'Please select a file from one of your folder:',
      error_upload: 'An error occured while uploading your CSV file.'
    },
    list: {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      role: 'Role',
      active: 'Active'
    },
    fields: {
      first_name: 'First name',
      last_name: 'Last name',
      email: 'Email',
      phone: 'Phone',
      role: 'Role',
      old_password: 'Current password',
      password: 'New password',
      password_2: 'New password (repeat)',
      active: 'Active'
    },
    role: {
      admin: 'Administrator',
      manager: 'Supervisor',
      user: 'CG Artist'
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
    avatar: {
      title: 'Change avatar'
    },
    change_password: {
      button: 'Change password',
      success: 'Your password was successfully changed!',
      unvalid: 'Your new password confirmation doesn\'t match or your password is too short (7 chars, at least, is expected).',
      error: 'An error occured while changing password. Please verify your current password.'
    }
  },

  main: {
    add: 'add',
    profile: 'Profile',
    logout: 'Logout',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    or: 'or',
    yes: 'yes',
    no: 'no',
    info: 'Information',
    confirmation: 'Confirm',
    confirmation_and_stay: 'Confirm and stay',
    clear_selection: 'Clear current selection',
    delete_text: 'Are you sure you want to remove {name} from your database?',
    loading_error: 'An error occured while loading data.',
    user: 'User',
    production: 'Production',
    studio: 'Studio',
    admin: 'Admin',
    csv: {
      import_file: 'Import',
      export_file: 'Export',
      import_title: 'Import data from a CSV file',
      required_fields: 'Your CSV file requires the following columns',
      select_file: 'Please select a file from one of your folder:',
      error_upload: 'An error occured while uploading your CSV file.'
    }
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

  menu: {
    assign_tasks: 'Assign tasks',
    create_tasks: 'Create tasks',
    change_status: 'Change status',
    run_custom_action: 'Run custom action'
  },

  custom_actions: {
    title: 'Custom Actions',
    new_custom_action: 'Add a custom action',
    number: 'custom action | custom actions',
    delete_text: 'Are you sure you want to remove custom action {name} from your database?',
    delete_error: 'An error occured while deleting this custom custom action.',
    run_for_selection: 'Run custom action for selected tasks:',
    fields: {
      name: 'Name',
      url: 'URL',
      entity_type: 'Entity Type'
    },
    entity_types: {
      all: 'All',
      shot: 'Shot',
      asset: 'Asset'
    }
  },

  productions: {
    title: 'Productions',
    home: {
      title: 'Running Productions',
      welcome: 'Welcome to Kitsu',
      empty: 'You don\'t have any production open. What about creating a new one?',
      create_new: 'Create a new production',
      no_task: 'You have no task assigned. See your supervisor to see what you can do!'
    },
    current: 'Selected production',
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

  comments: {
    retake: 'Retake',
    validated: 'Validated!',
    validation_required: 'Validation Required',
    add_comment: 'Add a comment...',
    post_status: 'Post status',
    edit_title: 'Edit comment',
    change_preview: 'Change preview',
    empty_text: 'This comment is empty',
    fields: {
      text: 'text'
    }
  },

  tasks: {
    previous: 'previous task',
    next: 'next task',
    back_to_list: 'back to list',
    preview: 'Previews',
    assign: 'Assign one task to: | Assign {nbSelectedTasks} tasks to:',
    change_status_to: 'Change task status to:',
    no_preview: 'There is currently no preview for this task.',
    no_comment: 'There is currently no comment for this task.',
    validation: 'Validation',
    clear_assignations: 'clear assignations',
    no_assignation_right: 'you are no allowed to manage assignations',
    create_tasks: 'Add tasks',
    create_tasks_shot: 'Add tasks for current shots',
    create_tasks_shot_explaination: 'You are going to create a new task for each shot of current list for the given task type. Do you want to continue?',
    create_tasks_shot_failed: 'A server error occured while proceeding creations.',
    create_tasks_asset: 'Add tasks for current assets',
    create_tasks_asset_explaination: 'You are going to create a new task for each asset of current list for the given task type. Do you want to continue?',
    create_tasks_asset_failed: 'A server error occured while proceeding creations.',
    current_status: 'Current status :',
    add_preview: 'Add preview',
    add_preview_error: 'An error occured while adding preview.',
    change_preview: 'Change preview',
    set_preview: 'Set this preview as thumbnail',
    set_preview_error: 'An error occured while setting preview as thumbnail',
    set_preview_done: 'This preview is used as thumbnail for the current entity.',
    select_preview_file: 'Please select a picture from your hard drive to be used as a preview for the current task:',
    delete_error: 'An error occured while deleting task.',
    feedback: 'feedback',
    my_tasks: 'My tasks',
    create_for_selection: 'Create task for each empty cell:',
    tasks: 'Tasks',
    current: 'Current',
    done: 'Done',
    delete_comment: 'Are you sure you want to delete last comment?',
    edit_comment: 'Edit comment',
    delete_comment_error: 'An error occured while deleting comment',
    fields: {
      production: 'Prod',
      entity: 'Entity',
      task_status: 'Status',
      task_type: 'Type',
      last_comment: 'Last comment',
      assignees: 'Assignees',
      end_date: 'End date'
    }
  },

  task_types: {
    title: 'Task Types',
    edit_title: 'Edit task type',
    number: 'task type | task types',
    new_task_type: 'Add a task type',
    fields: {
      name: 'Name',
      color: 'Color',
      priority: 'Priority',
      dedicated_to: 'For'
    },
    delete_text: 'Are you sure you want to remove {name} from your database?',
    delete_error: 'An error occured while deleting this task type. There are probably data linked to it. Are you sure this task type has no task linked to it?'
  },

  task_status: {
    title: 'Task Status',
    edit_title: 'Edit task status',
    number: 'task status | task status',
    new_task_status: 'Add a task status',
    fields: {
      name: 'Name',
      short_name: 'Short name',
      color: 'Color',
      is_reviewable: 'Is reviewable',
      is_done: 'Is done'
    },
    delete_text: 'Are you sure you want to remove {name} from your database?',
    delete_error: 'An error occured while deleting this task status. There are probably data linked to it. Are you sure this task status has no task linked to it?'
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
    title: 'Assets',
    edit_title: 'Edit asset',
    number: 'asset | assets',
    new_asset: 'Add an asset',
    new_assets: 'Add assets',
    edit_fail: 'Creation or edition failed, an error occured.',
    new_success: 'Asset {name} successfully created.',
    edit_success: 'Asset {name} successfully edited.',
    empty_list: 'There is no asset in the production. What about creating some?',
    tasks: 'Asset tasks',
    fields: {
      name: 'Asset',
      type: 'Type',
      production: 'Prod',
      description: 'Description'
    },
    delete_text: 'Are you sure you want to remove {name} from your database?',
    delete_error: 'An error occured while deleting this asset. There are probably data linked to it. Are you sure this asset type has no task linked to it?',
    restore_text: 'Are you sure you want to restore {name} into your database?',
    restore_error: 'An error occured while restoring this asset.',
    cast_in: 'Cast in',
    no_cast_in: 'This asset is not cast in any shot.'
  },

  shots: {
    title: 'Shots',
    edit_title: 'Edit shot',
    number: 'shot | shots',
    new_shot: 'Add a shot',
    new_shots: 'Add shots',
    manage: 'Manage shots',
    edit_fail: 'Creation or edition failed, an error occured.',
    new_success: 'Shot {name} successfully created.',
    edit_success: 'Shot {name} successfully edited.',
    empty_list: 'There is no shot in the production. What about creating some?',
    fields: {
      name: 'Shot',
      episode: 'Episode',
      sequence: 'Sequence',
      production: 'Prod',
      frame_in: 'In',
      frame_out: 'Out',
      fps: 'FPS',
      description: 'Description'
    },
    delete_text: 'Are you sure you want to remove {name} from your database?',
    delete_error: 'An error occured while deleting this shot. There are probably data linked to it. Are you sure this shot has no task linked to it?',
    restore_text: 'Are you sure you want to restore {name} into your database?',
    restore_error: 'An error occured while restoring this shot.',
    tasks: 'Shot Tasks',
    casting: 'Shot casting',
    no_casting: 'The shot casting is empty.'
  },

  breakdown: {
    title: 'Breakdown',
    select_shot: 'Please select a shot on the left to manage its casting.',
    selected_shot: 'Assets in {sequence_name} / {name} casting',
    all_assets: 'All available assets',
    save_error: 'An error occured while saving breakdown.'
  },

  playlists: {
    title: 'Playlists',
    new_playlist: 'Add a playlist',
    edit_title: 'Edit playlist',
    loading_error: 'A server error occured. Playlists cannot be loaded.',
    no_playlist: 'There is currently no playlist for this project.',
    no_selection: 'Please select a playlist on the left.',
    delete_text: 'Are you sure you want to remove {name} from your database?',
    delete_error: 'An error occured while deleting this playlist.',
    add_shots: 'Select shots',
    select_shot: 'Please select a shot in the right column',
    select_playlist: 'Please select a playlist in the left column',
    remove: 'remove',
    no_shot_for_production: 'There is no shot for this production',
    no_sequence_for_episode: 'There is no sequence for this episode',
    fields: {
      name: 'Name'
    }
  },

  server_down: {
    title: 'Kitsu encountered an error while reaching its data API.',
    text: 'Please contact your vendor support, your system administrator or your IT department to understand what is going wrong.'
  },

  not_found: {
    title: 'Page not found... are your looking for something you deleted?',
    text: 'There was something wrong with the link you clicked on, we encourage you to come back on the home page.'
  }
}
