export default {

  assets: {
    cast_in: 'Cast in',
    delete_error: 'An error occured while deleting this asset. There are probably data linked to it. Are you sure this asset type has no task linked to it?',
    delete_text: 'Are you sure you want to remove {name} from your database?',
    edit_fail: 'Creation or edition failed, a server error occured.',
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
      episode: 'Ep.',
      name: 'Name',
      production: 'Prod',
      time_spent: 'Time',
      type: 'Type'
    }
  },

  asset_types: {
    all_asset_types: 'All asset types',
    delete_text: 'Are you sure you want to remove {name} from your database?',
    delete_error: 'An error occured while deleting this asset type. There are probably data linked to it. Are you sure this asset type has no asset linked to it?',
    edit_title: 'Edit asset type',
    new_asset_type: 'Add an asset type',
    number: 'asset type | asset types',
    title: 'Asset Types',
    production_title: 'Asset Types Stats',
    fields: {
      name: 'Name'
    }
  },

  breakdown: {
    all_assets: 'All available assets',
    empty: 'Empty casting',
    title: 'Breakdown',
    edit_label: 'Change the asset\'s label',
    label: 'Label',
    options: {
      fixed: 'fixed',
      animate: 'animate'
    }
  },

  comments: {
    add_comment: 'Add a comment...',
    add_checklist: 'Add checklist',
    add_preview: 'Attach preview',
    change_preview: 'Change preview',
    comment_from_client: 'Comment from client',
    empty_text: 'This comment is empty',
    edit_title: 'Edit comment',
    error: 'An error occured while posting comment',
    no_file_attached: 'No file attached',
    post_status: 'Post comment',
    retake: 'Retake',
    pin: 'Pin',
    pinned: 'Pinned',
    revision: 'revision',
    unpin: 'Unpin',
    validated: 'Validated!',
    validation_required: 'Validation Required',
    set_status_to: 'Set status to',
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
      entity_type: 'Entity Type',
      is_ajax: 'Use AJAX'
    },
    entity_types: {
      all: 'All',
      shot: 'Shot',
      asset: 'Asset'
    }
  },

  entities: {
    thumbnails: {
      error: 'An error occured while uploading thumbnails',
      explaination: 'Adding a thumbnail requires to set a new preview. In order to set several thumbnails at the same time, you must chose first a task type that will be used to create the new previews. The thumbnails will be set from this new preview.',
      explaination_two: 'Then you have to select the files you want to upload. To find the right entities, the file names must match the following pattern: "parent name entity name".',
      select_files: 'Select Files',
      selected_files: 'Selected Files',
      select_task_type: 'Select Task Type',
      title: 'Add Thumbnails',
      upload: 'Add Thumbnails'
    }
  },

  episodes: {
    all_episodes: 'All episodes',
    delete_error: 'An error occured while deleting this episode. There are probably data linked to it. Are you sure this episode has no sequence linked to it?',
    delete_text: 'Are you sure you want to remove {name} from your database? Every related shots and previews will be deleted. Pleas confirm by typing the episode name below.',
    edit_title: 'Edit episode',
    empty_list: 'There is no episode in the production. What about creating some?',
    empty_list_client: 'There is no episode in this production.',
    new_episode: 'New episode',
    number: 'episode | episodes',
    title: 'Episode Stats',
    fields: {
      name: 'name',
      description: 'description'
    }
  },

  keyboard: {
    altdown: 'Move task selection down',
    altleft: 'Move task selection left',
    altright: 'Move task selection right',
    altup: 'Move task selection up',
    shortcuts: 'Shortcuts'
  },

  login: {
    forgot_password: 'Forgot password?',
    login: 'Log in',
    login_failed: 'Log in failed, please verify your credentials',
    login_page: 'Cancel',
    reset_change_password: 'Change password',
    reset_change_password_form_failed: 'There is a problem with the password you gave. Please, verify that it is at least 7 chars long and that both passwords match.',
    reset_change_password_failed: 'Changing password failed. Please, restart the whole procedure again.',
    reset_change_password_succeed: 'Your password was changed successfully. Please, go back to the login page to use it.',
    reset_change_password_title: 'Enter a new password',
    reset_password: 'Reset Password',
    reset_password_failed: 'Reset Password failed. Please verify your email.',
    reset_password_succeed: 'Reset Password succeeded. Please check your inbox.',
    reset_password_title: 'Enter your email to reset your password',
    title: 'Log in to Kitsu',
    fields: {
      email: 'Email',
      password: 'Password',
      password2: 'Password again'
    }
  },

  main: {
    about: 'About',
    add: 'add',
    all: 'All',
    admin: 'Admin',
    cancel: 'Cancel',
    clear_selection: 'Clear current selection',
    close: 'Close',
    confirmation: 'Confirm',
    confirmation_and_stay: 'Confirm and stay',
    date: 'Date',
    dark_theme: 'Dark Theme',
    days_spent: 'day spent | days spent',
    delete: 'Delete',
    delete_all: 'Delete all',
    delete_text: 'Are you sure you want to remove {name} from your database?',
    documentation: 'Documentation',
    edit: 'Edit',
    empty_comment: 'Empty comment',
    end_date: 'End date',
    files_selected: 'files selected',
    for: 'For',
    go_productions: 'Go to productions',
    history: 'history',
    info: 'Information',
    or: 'or',
    no: 'No',
    loading: 'Loading...',
    loading_data: 'Loading data',
    loading_error: 'An error occured while loading data.',
    logout: 'Logout',
    modify: 'Modify',
    minimize: 'Minimize',
    maximize: 'Maximize',
    nb_frames: 'frame | frames',
    profile: 'Profile',
    production: 'Production',
    remove: 'Remove',
    save: 'Save',
    sort_by: 'Sort by',
    sorted_by: 'Sorted by',
    start_date: 'Start date',
    studio: 'Studio',
    tutorials: 'Tutorials',
    user: 'User',
    white_theme: 'White Theme',
    yes: 'Yes',
    csv: {
      choose: 'Choose',
      unknown: 'Unknown column',
      error_upload: 'An error occured while uploading your CSV.',
      export_file: 'Export',
      import_file: 'Import',
      import_title: 'Import data from a CSV',
      legend: 'Legend',
      legend_ok: 'Recognized column',
      legend_ignored: 'Ignored column',
      legend_missing: 'Missing column',
      paste: 'Paste',
      paste_code: 'Please paste here your CSV data:',
      preview: 'Preview',
      preview_episode_name: 'Episode name',
      preview_title: 'Preview of your imported data',
      preview_description: 'Upload a .csv file to populate your board with posts.',
      preview_required: 'NB: The first row must be the header',
      preview_reupload: 'Reupload .CSV file',
      required_fields: 'Your CSV requires the following columns',
      select_file: 'Please select a file from one of your folder:',
      tab_select_file: 'Upload a CSV file',
      tab_paste_code: 'Paste a CSV data',
      upload_file: 'Browse',
      options: {
        title: 'Options',
        update: 'Update existing data'
      }
    }
  },

  menu: {
    assign_tasks: 'Assign tasks',
    change_priority: 'Change priority',
    change_status: 'Change status',
    create_tasks: 'Create tasks',
    delete_tasks: 'Delete tasks',
    run_custom_action: 'Run custom action',
    set_estimations: 'Set estimations'
  },

  news: {
    all: 'All',
    commented_on: 'commented on',
    infos: 'Infos',
    no_news: 'There is no news for this production or for this filter.',
    only_comments: 'Only comments',
    only_previews: 'Only previews',
    set_preview_on: 'set preview on',
    task_status: 'Task status',
    task_type: 'Task type',
    title: 'News Feed'
  },

  not_found: {
    text: 'There was something wrong with the link you clicked on, we encourage you to come back on the home page.',
    title: 'Page not found... are your looking for something you deleted?'
  },

  notifications: {
    and_change_status: 'and changed status to',
    assigned_you: 'assigned you to',
    commented_on: 'commented on',
    mention_you_on: 'mentioned you on',
    no_notifications: 'There is currently no notification for you for your current projects.',
    title: 'Notifications',
    with_preview: 'with a preview'
  },

  people: {
    active: 'Active',
    add_member_to_team: 'Add a member to the team: ',
    create_invite: 'Create and send invitation',
    delete_error: 'An error occured while deleting this person. There are probably data linked to it. Are you sure this person has no assignation or wrote no comment?',
    delete_text: 'Are you sure you want to remove {personName} from your database? Every related comments and previews will be deleted. Pleas confirm by typing the full person name below.',
    edit_title: 'Edit person',
    empty_team: 'There is no one listed in the project team.',
    invite: 'Send invitation',
    invite_error: 'An error occured while sending the invitation',
    invite_success: 'Invitation was successfully sent',
    new_person: 'Add a new employee',
    no_task_assigned: 'There are no running tasks assigned to you',
    persons: 'person | persons',
    running_tasks: 'Running tasks',
    select_person: 'Select a person...',
    team: 'Team',
    title: 'People',
    unactive: 'Unactive',
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
      admin: 'Studio Manager',
      client: 'Client',
      manager: 'Supervisor',
      user: 'Artist'
    }
  },

  playlists: {
    add_selection: 'Add selection',
    add_shots: 'Add shots',
    add_sequence: 'Add whole sequence',
    add_episode: 'Add whole episode',
    add_movie: 'Add whole movie',
    apply_task_type_change: 'This will set the last revison for given task type on all shots.',
    available_build: 'Available builds',
    build_daily: 'Daily pending',
    build_weekly: 'All Pending',
    build_mp4: 'Build .mp4 (beta)',
    client_playlist: 'Client Playlist',
    created_at: 'Created at:',
    create_title: 'Create playlist',
    delete_text: 'Are you sure you want to remove {name} from your database?',
    delete_error: 'An error occured while deleting this playlist.',
    download_zip: 'Download .zip',
    for_client: 'The client',
    for_studio: 'The Studio',
    edit_title: 'Edit playlist',
    last_creation: 'Last creations',
    last_modification: 'Last modifications',
    loading_error: 'A server error occured. Playlists cannot be loaded.',
    new_playlist: 'Add a playlist',
    no_build: 'No build',
    no_playlist: 'There is currently no playlist for this project.',
    no_preview: 'No preview for this shot',
    no_selection: 'Please select a playlist on the left.',
    no_sequence_for_episode: 'There is no sequence for this episode',
    no_shot_for_production: 'There is no shot for this production',
    no_shot_for_sequence: 'There is no shot for this sequence',
    select_shot: 'Please select a shot in the right column',
    select_playlist: 'Please select a playlist in the left column',
    select_task_type: 'Change task type for all shots',
    title: 'Playlists',
    updated_at: 'Updated at:',
    remove: 'remove',
    fields: {
      name: 'Name',
      for_client: 'To be shared with'
    }
  },

  productions: {
    current: 'Selected production',
    delete_text: 'Are you sure you want to remove {name} from your database? Please, confirm by typing the name of the project you want to delete in the text field.',
    delete_error: 'An error occured while deleting this production. There are probably data linked to it. Are you sure this production has no task, shot or asset linked to it? Kitsu doesn\'t allow production deletion. If you don\'t want to see the production anymore, you can close it instead.',
    edit_title: 'Edit production',
    new_production: 'Add a production',
    number: 'production | productions',
    open_productions: 'My productions',
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
      fps: 'FPS',
      name: 'Name',
      ratio: 'Ratio',
      resolution: 'Resolution',
      status: 'Status',
      type: 'Type'
    },
    metadata: {
      add_explaination: 'Add specific data required by this project.',
      add_failed: 'An error occured while adding metadata to your project.',
      add_new_values: 'There is currently no available values.',
      available_values: 'Available values',
      choices: 'List of values',
      delete_text: 'Are you sure you want to delete this column and related data for all assets of this production?',
      delete_error: 'An error occured while deleting this metadata column.',
      error: 'An error occured while adding the metadata column. Make sure there is no column with similar name and that all fields are filled. If the problem is persists, please contact the support team.',
      free: 'Free value',
      title: 'Add metadata column'
    },

    status: {
      closed: 'Closed',
      open: 'Open',
      active: 'Open',
      archived: 'Closed'
    },

    type: {
      short: 'Short',
      featurefilm: 'Feature Film',
      tvshow: 'TV Show'
    }
  },

  profile: {
    change_avatar: 'Change avatar',
    info_title: 'Information',
    language: 'Language',
    notifications_enabled: 'Email notifications enabled',
    notifications_slack_enabled: 'Slack notifications enabled',
    notifications_slack_user: 'Slack username',
    password_title: 'Change password',
    timezone: 'Timezone',
    title: 'Your Profile',
    avatar: {
      title: 'Change avatar',
      error_upload: 'There was an error while uploading picture.'
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

  settings: {
    change_logo: 'Change logo',
    integrations: 'Integrations',
    logo: 'Studio logo',
    no_logo: 'There is no logo set.',
    set_logo: 'Set studio logo',
    title: 'Settings',
    fields: {
      name: 'Studio name',
      hours_by_day: 'Hours by day',
      slack_token: 'Slack Token (Optional)',
      use_original_name: 'Use original file name for downloads'
    },
    save: {
      button: 'Save settings',
      error: 'A server error occured while saving settings'
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
      is_artist_allowed: 'Is artist allowed',
      is_client_allowed: 'Is client allowed',
      color: 'Color',
      is_done: 'Is done',
      is_reviewable: 'Is reviewable',
      is_retake: 'Has retake value',
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
    all_sequences: 'All sequences',
    delete_text: 'Are you sure you want to remove {name} from your database? Every related shots and previews will be deleted. Please confirm by typing the sequence name below.',
    delete_error: 'An error occured while deleting this sequence. There are probably data linked to it. Are you sure this sequence has no shot linked to it?',
    edit_title: 'Edit sequence',
    empty_list: 'There is no sequence in the production. What about creating some?',
    empty_list_client: 'There is no sequence in this production.',
    new_sequence: 'New sequence',
    number: 'sequence | sequences',
    title: 'Sequence Stats',
    fields: {
      name: 'name',
      description: 'description'
    }
  },

  schedule: {
    title: 'Schedule',
    title_main: 'Main Schedule',
    overall_man_days: 'Man-days',
    md: 'md',
    zoom_level: 'Zoom level',
    milestone: {
      add_milestone: 'Add milestone for',
      edit_milestone: 'Edit milestone for',
      name: 'Name',
      error: 'An error occured while adding or editing the milestone. Please try again.'
    }
  },

  quota: {
    average: 'Average',
    count_label: 'Count mode',
    detail_label: 'Detail level',
    details_name: 'Name',
    details_seconds: 'Seconds',
    details_frames: 'Frames',
    month_label: 'Month',
    no_quota: 'There is no quota for this task type.',
    name: 'Name',
    quota_day: 'Quota per day',
    quota_week: 'Quota per week',
    quota_month: 'Quota per month',
    year_label: 'Year',
    title: 'Quota',
    type_label: 'Type'
  },

  shots: {
    casting: 'Shot casting',
    creation_explaination: 'To add shots you need first to create an episode and a sequence. Type an episode name in the bottom of the left column then click on add to create a new episode. Select this episode and repeat the same operation for sequence. Finally select a sequence and type a shot name in the field in the bottom of the right column. Click on the add button below. Your first shot was created. You can now add many more! If it\'s not a TV Show, you have to directly create a sequence.',
    delete_text: 'Are you sure you want to remove {name} from your database?',
    delete_error: 'An error occured while deleting this shot. There are probably data linked to it. Are you sure this shot has no task linked to it?',
    edit_success: 'Shot {name} successfully edited.',
    edit_fail: 'Creation or edition failed, an error occured. Make sure that you are not renaming the shot with a name already listed for given sequence.',
    edit_title: 'Edit shot',
    empty_list: 'There is no shot in the production. What about creating some?',
    empty_list_client: 'There is no shot in this production.',
    episodes: 'Episodes',
    history: 'Shot values history',
    new_shot: 'Add a shot',
    new_shots: 'Add shots',
    new_sequences: 'Add sequences',
    new_episodes: 'Add episodes',
    no_casting: 'The shot casting is empty.',
    number: 'shot | shots',
    manage: 'Create shots',
    new_success: 'Shot {name} successfully created.',
    padding: 'Shot Padding',
    restore_text: 'Are you sure you want to restore {name} into your database?',
    restore_error: 'An error occured while restoring this shot.',
    sequences: 'Sequences',
    tasks: 'Shot Tasks',
    title: 'Shots',
    fields: {
      description: 'Description',
      nb_frames: 'Frames',
      episode: 'Episode',
      frame_in: 'In',
      frame_out: 'Out',
      fps: 'FPS',
      name: 'Name',
      production: 'Prod',
      sequence: 'Sequence',
      time_spent: 'Time'
    }
  },

  server_down: {
    text: 'Please contact your vendor support, your system administrator or your IT department to understand what is going wrong.',
    title: 'Kitsu encountered an error while reaching its data API.'
  },

  statistics: {
    count: 'Counts',
    count_mode: 'Count mode',
    display_mode: 'Display mode',
    frames: 'Frames',
    pie: 'Pie charts',
    shots: 'Shots'
  },

  tasks: {
    add_preview: 'Add preview',
    add_preview_error: 'An error occured while adding preview.',
    assign: 'Assign one task to: | Assign {nbSelectedTasks} tasks to:',
    back_to_list: 'back to list',
    bigger: 'Widen task panel',
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
    delete_all_text: 'Are you sure you want to delete all tasks for given {name}? Please, confirm by typing the task type name of the tasks you want to delete in the text field.',
    delete_all_error: 'Deleting all tasks for given task type failed.',
    delete_error: 'An error occured while deleting task.',
    delete_comment: 'Are you sure you want to delete last comment?',
    delete_comment_error: 'An error occured while deleting comment.',
    delete_for_selection: 'Delete selected tasks:',
    delete_preview: 'Are you sure you want to delete this preview?',
    delete_preview_error: 'An error occured while deleting preview.',
    edit_comment: 'Edit comment',
    done: 'Done',
    download_pdf_file: 'Download .{extension} file',
    feedback: 'feedback',
    full_screen: 'Display in full screen',
    hide_assignations: 'Hide assignations',
    hide_infos: 'Hide additional information',
    my_tasks: 'My tasks',
    next: 'next task',
    no_assignation_right: 'You are not allowed to manage assignations',
    no_comment: 'There is currently no comment for this task.',
    no_preview: 'There is currently no preview for this task.',
    no_task_selected: 'No task selected',
    number: 'task | tasks',
    preview: 'Previews',
    previous: 'previous task',
    unsubscribe_notifications: 'Unsubscribe from notifications',
    set_estimations: 'Set estimations for selected tasks:',
    set_preview: 'Set this preview as thumbnail',
    set_preview_error: 'An error occured while setting preview as thumbnail',
    set_preview_done: 'This preview is used as thumbnail for the current entity.',
    select_preview_file: 'Please select a picture from your hard drive to be used as a preview for the current task:',
    show_assignations: 'Show assignations',
    show_infos: 'Show additional information',
    subscribe_notifications: 'Subscribe to notifications',
    validation: 'Validation',
    tasks: 'Tasks',
    with_comment: 'With a comment...',
    fields: {
      asset_type: 'Asset type',
      assignees: 'Assignees',
      end_date: 'Validation date',
      due_date: 'Due date',
      duration: 'Duration',
      entity: 'Entity',
      entity_name: 'Name',
      estimation: 'Estimation',
      frames: 'Fram.',
      last_comment: 'Last comment',
      last_comment_date: 'Last comment',
      priority: 'Priority',
      production: 'Prod',
      real_end_date: 'Validation date',
      real_start_date: 'WIP date',
      retake_count: 'Retakes',
      sequence: 'Sequence',
      task_status: 'Status',
      task_status_short_name: 'Status',
      task_type: 'Type'
    },
    colors: {
      title: 'Coloring',
      neutral: 'Neutral',
      status: 'Status color',
      late: 'Late in red'
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
    export_timesheet: 'Export Timesheet',
    hours: 'hours',
    month: 'Month',
    time_spents: 'Time Spent (hours)',
    title: 'Timesheets',
    year: 'Year'
  },

  wrong_browser: {
    title: 'Your browser is not supported by Kitsu',
    text: 'Kitsu can only be used with Firefox and Chrome browsers.'
  }
}
