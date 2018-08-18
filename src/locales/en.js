export default {

  assets: {
    cast_in: 'Cast in',
    delete_error: 'An error occured while deleting this asset. There are probably data linked to it. Are you sure this asset type has no task linked to it?',
    delete_text: 'Are you sure you want to remove {name} from your database?',
    edit_fail: 'Creation or edition failed, an error occured.',
    edit_success: 'Asset {name} successfully edited.',
    edit_title: 'Edit asset',
    empty_list: 'There is no asset in the production. What about creating some?',
    empty_list_client: 'There is no asset in this production.',
    new_asset: 'Add an asset',
    new_assets: 'Add assets',
    new_success: 'Asset {name} successfully created.',
    no_cast_in: 'This asset is not cast in any shot.',
    number: 'asset | assets',
    restore_text: 'Are you sure you want to restore {name} into your database?',
    restore_error: 'An error occured while restoring this asset.',
    tasks: 'Asset tasks',
    title: 'Assets',
    fields: {
      description: 'Description',
      name: 'Asset',
      production: 'Prod',
      type: 'Type'
    }
  },

  asset_types: {
    delete_text: 'Are you sure you want to remove {name} from your database?',
    delete_error: 'An error occured while deleting this asset type. There are probably data linked to it. Are you sure this asset type has no asset linked to it?',
    edit_title: 'Edit asset type',
    new_asset_type: 'Add an asset type',
    number: 'asset type | asset types',
    title: 'Asset Types',
    fields: {
      name: 'Name'
    }
  },

  breakdown: {
    all_assets: 'All available assets',
    select_shot: 'Please select a shot on the left to manage its casting.',
    selected_shot: 'Assets in {sequence_name} / {name} casting',
    save_error: 'An error occured while saving breakdown.',
    title: 'Breakdown'
  },

  comments: {
    add_comment: 'Add a comment...',
    change_preview: 'Change preview',
    empty_text: 'This comment is empty',
    edit_title: 'Edit comment',
    post_status: 'Post status',
    retake: 'Retake',
    validated: 'Validated!',
    validation_required: 'Validation Required',
    fields: {
      text: 'text'
    }
  },

  custom_actions: {
    delete_text: 'Are you sure you want to remove custom action {name} from your database?',
    delete_error: 'An error occured while deleting this custom custom action.',
    edit_title: 'Edit a custom action',
    new_custom_action: 'Add a custom action',
    number: 'custom action | custom actions',
    run_for_selection: 'Run custom action for selected tasks:',
    title: 'Custom Actions',
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

  episodes: {
    delete_error: 'An error occured while deleting this episode. There are probably data linked to it. Are you sure this episode has no sequence linked to it?',
    delete_text: 'Are you sure you want to remove {name} from your database?',
    edit_title: 'Edit episode',
    empty_list: 'There is no episode in the production. What about creating some?',
    empty_list_client: 'There is no episode in this production.',
    new_episode: 'New episode',
    number: 'episode | episodes',
    title: 'Episodes',
    fields: {
      name: 'name',
      description: 'description'
    }
  },

  login: {
    login: 'Log in',
    login_failed: 'Log in failed, please verify your credentials',
    title: 'Log in to Kitsu',
    fields: {
      email: 'Email',
      password: 'Password'
    }
  },

  main: {
    add: 'add',
    admin: 'Admin',
    cancel: 'Cancel',
    clear_selection: 'Clear current selection',
    delete_text: 'Are you sure you want to remove {name} from your database?',
    close: 'Close',
    confirmation: 'Confirm',
    confirmation_and_stay: 'Confirm and stay',
    empty_comment: 'Empty comment',
    info: 'Information',
    or: 'or',
    no: 'no',
    loading_error: 'An error occured while loading data.',
    logout: 'Logout',
    profile: 'Profile',
    production: 'Production',
    save: 'Save',
    studio: 'Studio',
    user: 'User',
    yes: 'yes',
    csv: {
      export_file: 'Export',
      error_upload: 'An error occured while uploading your CSV file.',
      import_file: 'Import',
      import_title: 'Import data from a CSV file',
      required_fields: 'Your CSV file requires the following columns',
      select_file: 'Please select a file from one of your folder:'
    }
  },

  menu: {
    assign_tasks: 'Assign tasks',
    change_priority: 'Change priority',
    change_status: 'Change status',
    create_tasks: 'Create tasks',
    run_custom_action: 'Run custom action'
  },

  not_found: {
    text: 'There was something wrong with the link you clicked on, we encourage you to come back on the home page.',
    title: 'Page not found... are your looking for something you deleted?'
  },

  notifications: {
    and_change_status: 'and changed status to',
    commented_on: 'commented on',
    title: 'Notifications',
    with_preview: 'with a preview'
  },

  people: {
    delete_error: 'An error occured while deleting this person. There are probably data linked to it. Are you sure this person has no assignation or wrote no comment?',
    delete_text: 'Are you sure you want to remove {personName} from your database?',
    edit_title: 'Edit person',
    new_person: 'Add a new employee',
    persons: 'person | persons',
    running_tasks: 'Running tasks',
    title: 'People',
    csv: {
      import_file: 'Import a .csv file',
      export_file: 'Download as a .csv file',
      import_title: 'Import data from a CSV file',
      required_fields: 'Your CSV file requires the following columns',
      select_file: 'Please select a file from one of your folder:',
      error_upload: 'An error occured while uploading your CSV file.'
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
    list: {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      role: 'Role',
      active: 'Active'
    },
    role: {
      admin: 'Administrator',
      client: 'Client',
      manager: 'Supervisor',
      user: 'CG Artist'
    }
  },

  playlists: {
    add_shots: 'Select shots',
    delete_text: 'Are you sure you want to remove {name} from your database?',
    delete_error: 'An error occured while deleting this playlist.',
    edit_title: 'Edit playlist',
    loading_error: 'A server error occured. Playlists cannot be loaded.',
    new_playlist: 'Add a playlist',
    no_playlist: 'There is currently no playlist for this project.',
    no_selection: 'Please select a playlist on the left.',
    no_sequence_for_episode: 'There is no sequence for this episode',
    no_shot_for_production: 'There is no shot for this production',
    select_shot: 'Please select a shot in the right column',
    select_playlist: 'Please select a playlist in the left column',
    title: 'Playlists',
    remove: 'remove',
    fields: {
      name: 'Name'
    }
  },

  productions: {
    current: 'Selected production',
    delete_text: 'Are you sure you want to remove {name} from your database?',
    delete_error: 'An error occured while deleting this production. There are probably data linked to it. Are you sure this production has no task, shot or asset linked to it?',
    edit_title: 'Edit production',
    new_production: 'Add a production',
    number: 'production | productions',
    picture: 'Change picture',
    title: 'Productions',
    home: {
      create_new: 'Create a new production',
      empty: 'You don\'t have any production open. What about creating a new one?',
      no_task: 'You have no task assigned. See your supervisor to see what you can do!',
      no_prod_for_client: 'You don\'t have access to any production. Contact your contractor to obtain an access.',
      title: 'Running Productions',
      welcome: 'Welcome to Kitsu'
    },
    fields: {
      name: 'Name',
      status: 'Status'
    },
    status: {
      closed: 'Close',
      open: 'Open'
    }
  },

  profile: {
    info_title: 'Information',
    language: 'Language',
    password_title: 'Change password',
    timezone: 'Timezone',
    title: 'Your Profile',
    avatar: {
      title: 'Change avatar'
    },
    change_password: {
      button: 'Change password',
      error: 'An error occured while changing password. Please verify your current password.',
      success: 'Your password was successfully changed!',
      unvalid: 'Your new password confirmation doesn\'t match or your password is too short (7 chars, at least, is expected).'
    },
    save: {
      button: 'Save changes',
      error: 'An error occured while saving changes'
    }
  },

  task_status: {
    delete_text: 'Are you sure you want to remove {name} from your database?',
    delete_error: 'An error occured while deleting this task status. There are probably data linked to it. Are you sure this task status has no task linked to it?',
    edit_title: 'Edit task status',
    number: 'task status | task status',
    new_task_status: 'Add a task status',
    title: 'Task Status',
    fields: {
      color: 'Color',
      is_reviewable: 'Is reviewable',
      is_done: 'Is done',
      name: 'Name',
      short_name: 'Short name'
    }
  },

  task_types: {
    delete_text: 'Are you sure you want to remove {name} from your database?',
    delete_error: 'An error occured while deleting this task type. There are probably data linked to it. Are you sure this task type has no task linked to it?',
    edit_title: 'Edit task type',
    new_task_type: 'Add a task type',
    number: 'task type | task types',
    title: 'Task Types',
    fields: {
      dedicated_to: 'For',
      color: 'Color',
      name: 'Name',
      allow_timelog: 'Timelog',
      priority: 'Priority'
    }
  },

  sequences: {
    delete_text: 'Are you sure you want to remove {name} from your database?',
    delete_error: 'An error occured while deleting this sequence. There are probably data linked to it. Are you sure this sequence has no shot linked to it?',
    edit_title: 'Edit sequence',
    empty_list: 'There is no sequence in the production. What about creating some?',
    empty_list_client: 'There is no sequence in this production.',
    new_sequence: 'New sequence',
    number: 'sequence | sequences',
    title: 'Sequences',
    fields: {
      name: 'name',
      description: 'description'
    }
  },

  shots: {
    casting: 'Shot casting',
    delete_text: 'Are you sure you want to remove {name} from your database?',
    delete_error: 'An error occured while deleting this shot. There are probably data linked to it. Are you sure this shot has no task linked to it?',
    edit_success: 'Shot {name} successfully edited.',
    edit_fail: 'Creation or edition failed, an error occured.',
    edit_title: 'Edit shot',
    empty_list: 'There is no shot in the production. What about creating some?',
    empty_list_client: 'There is no shot in this production.',
    new_shot: 'Add a shot',
    new_shots: 'Add shots',
    new_sequences: 'Add sequences',
    new_episodes: 'Add episodes',
    no_casting: 'The shot casting is empty.',
    number: 'shot | shots',
    manage: 'Manage shots',
    new_success: 'Shot {name} successfully created.',
    restore_text: 'Are you sure you want to restore {name} into your database?',
    restore_error: 'An error occured while restoring this shot.',
    tasks: 'Shot Tasks',
    title: 'Shots',
    fields: {
      description: 'Description',
      episode: 'Episode',
      frame_in: 'In',
      frame_out: 'Out',
      fps: 'FPS',
      name: 'Shot',
      production: 'Prod',
      sequence: 'Sequence'
    }
  },

  server_down: {
    text: 'Please contact your vendor support, your system administrator or your IT department to understand what is going wrong.',
    title: 'Kitsu encountered an error while reaching its data API.'
  },

  tasks: {
    add_preview: 'Add preview',
    add_preview_error: 'An error occured while adding preview.',
    assign: 'Assign one task to: | Assign {nbSelectedTasks} tasks to:',
    back_to_list: 'back to list',
    change_status_to: 'Change task status to:',
    change_preview: 'Change preview',
    change_priority: 'Change priority to:',
    clear_assignations: 'clear assignations',
    create_for_selection: 'Create task for each empty cell:',
    create_tasks: 'Add tasks',
    create_tasks_shot: 'Add tasks for current shots',
    create_tasks_shot_explaination: 'You are going to create a new task for each shot of current list for the given task type. Do you want to continue?',
    create_tasks_shot_failed: 'A server error occured while proceeding creations.',
    create_tasks_asset: 'Add tasks for current assets',
    create_tasks_asset_explaination: 'You are going to create a new task for each asset of current list for the given task type. Do you want to continue?',
    create_tasks_asset_failed: 'A server error occured while proceeding creations.',
    current: 'Task to do',
    current_status: 'Current status :',
    delete_error: 'An error occured while deleting task.',
    delete_comment: 'Are you sure you want to delete last comment?',
    delete_comment_error: 'An error occured while deleting comment',
    edit_comment: 'Edit comment',
    done: 'Done',
    download_pdf_file: 'Download PDF file',
    feedback: 'feedback',
    full_screen: 'Display in full screen',
    hide_assignations: 'Hide assignations',
    my_tasks: 'My tasks',
    next: 'next task',
    no_assignation_right: 'you are no allowed to manage assignations',
    no_comment: 'There is currently no comment for this task.',
    no_preview: 'There is currently no preview for this task.',
    preview: 'Previews',
    previous: 'previous task',
    set_preview: 'Set this preview as thumbnail',
    set_preview_error: 'An error occured while setting preview as thumbnail',
    set_preview_done: 'This preview is used as thumbnail for the current entity.',
    select_preview_file: 'Please select a picture from your hard drive to be used as a preview for the current task:',
    show_assignations: 'Show assignations',
    validation: 'Validation',
    tasks: 'Tasks',
    fields: {
      assignees: 'Assignees',
      end_date: 'End date',
      entity: 'Entity',
      last_comment: 'Last comment',
      production: 'Prod',
      task_status: 'Status',
      task_type: 'Type'
    },
    priority: {
      emergency: 'Emergency',
      normal: 'Normal',
      high: 'High',
      very_high: 'Very High'
    }
  },

  timesheets: {
    detail_level: 'Detail level',
    done_tasks: 'Done tasks',
    hours: 'hours',
    month: 'Month',
    time_spents: 'Time Spent (hours)',
    title: 'Timesheets',
    year: 'Year'
  }
}
