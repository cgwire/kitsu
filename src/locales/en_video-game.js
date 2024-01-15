export default {

  assets: {
    no_cast_in: 'This asset is not cast in any level.'
  },

  breakdown: {
    remove: {
      text: 'If you remove this asset from the selected episode, it will remove the assets in all the underlying levels. Are you sure you want to remove it?'
    }
  },

  custom_actions: {
    entity_types: {
      shot: 'Level'
    }
  },

  status_automations: {
    entity_types: {
      shot: 'Level'
    }
  },

  entities: {
    nb_selected_shots: '{nbSelectedShots} level selected | {nbSelectedShots} levels selected',
    thumbnails: {
      shots_pattern: '"SequenceName LevelName" eg. SQ01_LV01.'
    }
  },

  main: {
    all_shots: 'All levels',
  },

  menu: {
    delete_shots: 'Delete levels'
  },


  playlists: {
    add_shots: 'Add levels',
    apply_task_type_change: 'This will set the last revision for the given task type on all levels.',
    comparing_missing_plan: 'Level missing for current type',
    no_shot_for_production: 'There is no level for this production',
    select_shot: 'Please select a level in the right column',
    select_task_type: 'Change task type for all levels'
  },

  productions: {
    delete_error: 'An error occurred while deleting this production. There are probably data linked to it. Are you sure this production has no task, level, or asset linked to it? Kitsu doesn\'t allow production deletion. If you don\'t want to see the production anymore, you can close it instead.',
    creation: {
      add_shots: 'Add levels (optional)',
      add_shots_button: 'Add levels',
      add_shots_description: 'Add or import the levels for your production.',
      errorImportingShots: 'An error occurred while importing your levels. The production has been created though!',
      import_shots_button: 'Import levels',
      select_shot_task_type: 'Select level task type',
      select_shot_task_type_description: 'These task types define the building steps of your levels.',
      shots_to_import: 'levels to import'
    },
    homepage: {
      'shots': 'Levels'
    },
    type: {
      shots: 'Only levels'
    }
  },

  sequences: {
    delete_text: 'Are you sure you want to remove {name} from your database? All related levels and previews will be deleted. Please confirm by typing the sequence name below.',
    delete_error: 'An error occurred while deleting this sequence. There are probably data linked to it. Are you sure this sequence has no level linked to it?'
  },

  quota: {
    explaination: 'Levels are considered ended on the first feedback request. Then, quotas are weighted following time spent on the task (when the artist filled his timesheet).\n If no time is filled, it considers that:\n * The task was started at the first status change to WIP \n* The task was done the day the feedback request was made.\n * It splits the done frames among all business days between the start and the end.',
    explaination_feedback: 'The level is done on the first feedback request. Its number of frames is added to the quotas for this day.'
  },

  shots: {
    casting: 'Level casting',
    creation_explaination: 'To add levels you need first to create an episode and a sequence. Type an episode name in the bottom of the left column then click on add to create a new episode. Select this episode and repeat the same operation for sequence. Finally, select a sequence and type a level name in the field at the bottom of the right column. Click on the add button below. Your first level was created. You can now add many more! If it\'s not a TV Show, you have to directly create a sequence.',
    delete_for_selection: 'Delete the selected level | Delete the {nbSelectedShots} selected levels',
    delete_error: 'An error occurred while deleting this level. There are probably data linked to it. Are you sure this level has no task linked to it?',
    edit_success: 'Level {name} successfully edited.',
    edit_fail: 'Creation or edition failed, an error occurred. Make sure that you are not renaming the level with a name already listed for a given sequence.',
    edit_title: 'Edit level',
    empty_list: 'There is no level in the production. What about creating some?',
    empty_list_client: 'There is no level in this production.',
    history: 'Level values history',
    multiple_delete_error: 'An error occurred while deleting a level. There is probably some data linked to a level. Are you sure there is no task linked to a selected level?',
    new_shot: 'Add a level',
    new_shots: 'Create levels',
    no_casting: 'The level casting is empty.',
    number: 'level | levels',
    manage: 'Create Levels',
    new_success: 'Level {name} successfully created.',
    padding: 'Level Padding',
    restore_error: 'An error occurred while restoring this level.',
    tasks: 'Level Tasks',
    title: 'Levels',
    fields: {
      placeholder: "LV01"
    }
  },

  statistics: {
    shots: 'Levels'
  },

  tasks: {
    create_tasks_shot: 'Add tasks for current levels',
    create_tasks_shot_explaination: 'You are going to create a new task for each level of the current project for the given task type. Do you want to continue?'
  }
}
