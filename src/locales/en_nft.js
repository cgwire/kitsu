export default {

  assets: {
    no_cast_in: 'This asset is not cast in any NFT.'
  },

  breakdown: {
    remove: {
      text: 'If you remove this asset from the selected episode, it will remove the assets in all the underlying NFTs. Are you sure you want to remove it?'
    }
  },

  custom_actions: {
    entity_types: {
      shot: 'NFT'
    }
  },

  status_automations: {
    entity_types: {
      shot: 'NFT'
    }
  },

  entities: {
    nb_selected_shots: '{nbSelectedShots} NFT selected | {nbSelectedShots} NFTs selected',
    thumbnails: {
      shots_pattern: '"SequenceName NFTName" eg. SQ01_LV01.'
    }
  },

  main: {
    all_shots: 'All NFTs',
  },

  menu: {
    delete_shots: 'Delete NFTs'
  },


  playlists: {
    add_shots: 'Add NFTs',
    no_shot_for_production: 'There is no NFT for this production',
    select_shot: 'Please select a NFT in the right column'
  },

  productions: {
    delete_error: 'An error occurred while deleting this production. There are probably data linked to it. Are you sure this production has no task, NFT, or asset linked to it? Kitsu doesn\'t allow production deletion. If you don\'t want to see the production anymore, you can close it instead.',
    creation: {
      add_shots: 'Add NFTs (optional)',
      add_shots_button: 'Add NFTs',
      add_shots_description: 'Add or import the NFTs for your production.',
      errorImportingShots: 'An error occurred while importing your NFTs. The production has been created though!',
      import_shots_button: 'Import NFTs',
      select_shot_task_type: 'Select NFT task type',
      select_shot_task_type_description: 'These task types define the building steps of your NFTs.',
      shots_to_import: 'NFTs to import'
    },
    homepage: {
      'shots': 'NFTs'
    },
    type: {
      shots: 'Only NFTS'
    }
  },

  task_status: {
    help: {
      entities: 'Assets, NFTs, Sequences, ...'
    }
  },

  sequences: {
    delete_text: 'Are you sure you want to remove {name} from your database? All related NFTs and previews will be deleted. Please confirm by typing the sequence name below.',
    delete_error: 'An error occurred while deleting this sequence. There are probably data linked to it. Are you sure this sequence has no NFT linked to it?'
  },

  quota: {
    explaination: 'NFTs are considered ended on the first feedback request. Then, quotas are weighted following time spent on the task (when the artist filled his timesheet).\n If no time is filled, it considers that:\n * The task was started at the first status change to WIP \n* The task was done the day the feedback request was made.\n * It splits the done frames among all business days between the start and the end.',
    explaination_feedback: 'The NFT is done on the first feedback request. Its number of frames is added to the quotas for this day.'
  },

  shots: {
    casting: 'NFT casting',
    creation_explaination: 'To add NFTs you need first to create an episode and a sequence. Type an episode name in the bottom of the left column then click on add to create a new episode. Select this episode and repeat the same operation for sequence. Finally, select a sequence and type a NFT name in the field at the bottom of the right column. Click on the add button below. Your first NFT was created. You can now add many more! If it\'s not a TV Show, you have to directly create a sequence.',
    delete_for_selection: 'Delete the selected NFT | Delete the {nbSelectedShots} selected NFTs',
    delete_error: 'An error occurred while deleting this NFT. There are probably data linked to it. Are you sure this NFT has no task linked to it?',
    edit_success: 'NFT {name} successfully edited.',
    edit_fail: 'Creation or edition failed, an error occurred. Make sure that you are not renaming the NFT with a name already listed for a given sequence.',
    edit_title: 'Edit NFT',
    empty_list: 'There is no NFT in the production. What about creating some?',
    empty_list_client: 'There is no NFT in this production.',
    history: 'NFT values history',
    multiple_delete_error: 'An error occurred while deleting a NFT. There is probably some data linked to a NFT. Are you sure there is no task linked to a selected NFT?',
    new_shot: 'Add a NFT',
    new_shots: 'Create NFTs',
    no_casting: 'The NFT casting is empty.',
    number: 'NFT | NFTs',
    manage: 'Create NFTs',
    new_success: 'NFT {name} successfully created.',
    padding: 'NFT Padding',
    restore_error: 'An error occurred while restoring this NFT.',
    tasks: 'NFT Tasks',
    title: 'NFT Collection',
    wrong_file_duration: 'One of the uploaded video file duration doesn\'t match the expected duration of the current NFT.',
    fields: {
      placeholder: "NFT01"
    }
  },

  statistics: {
    shots: 'NFTs'
  },

  tasks: {
    create_tasks_shot: 'Add tasks for current NFTs',
    create_tasks_shot_explaination: 'You are going to create a new task for each NFT of the current project for the given task type. Do you want to continue?'
  }
}
