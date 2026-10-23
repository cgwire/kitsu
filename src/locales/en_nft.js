/*
 * Production-type terminology overlay for NFT productions.
 *
 * This is NOT a standalone locale: it is a PARTIAL override merged on top of
 * en.js (the English source of truth). It must contain only the keys whose
 * wording differs from en.js — never a key whose value is identical to the base.
 *
 * Vocabulary mapping vs en.js:
 *   shot / shots / Shot / Shots  ->  NFT / NFTs
 *   (sequence, episode, asset and edit are unchanged)
 *
 * Keep in sync with en.js:
 *   - Mirror en.js key names exactly. If a key is renamed in en.js, rename it
 *     here too — a stale key is a dead override and the new base key then leaks
 *     untranslated vocabulary.
 *   - When a key added to en.js has a value mentioning a remapped word (shot),
 *     add the matching override here.
 */
export default {

  assets: {
    casted_in_shots: 'Cast in {count} NFT | Cast in {count} NFTs',
    no_cast_in: 'This asset is not cast in any NFT.'
  },

  breakdown: {
    remove: {
      text: 'If you remove this asset from the selected episode, it will also be removed from all the underlying NFTs. Are you sure you want to remove it?'
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
    thumbnails: {
      shots_pattern: '"SequenceName NFTName" e.g. SQ01_NFT01.'
    }
  },

  episodes: {
    delete_text: 'Are you sure you want to remove {name} from your database? All related NFTs and previews will also be deleted. Please confirm by typing the episode name below.'
  },

  keyboard: {
    plaltleft: 'Go to the last frame of the previous NFT',
    plaltright: 'Go to the first frame of the next NFT'
  },

  main: {
    all_shots: 'All NFTs',
    edl: {
      explanation: 'It\'s possible to import common OpenTimelineIO supported files (otio, fcp_xml, fcpx_xml, edl). NFTs will be created or updated with the given frame range, frame in, and frame out. Frame in starts at 0.'
    }
  },

  menu: {
    delete_shots: 'Delete NFTs'
  },


  playlists: {
    add_shots: 'Add NFTs'
  },

  productions: {
    delete_error: 'An error occurred while deleting this production. There may be existing data currently linked to it. Are you sure this production has no task, NFT, or asset linked to it? Kitsu doesn\'t allow production deletion. If you don\'t want to see the production anymore, you can close it instead.',
    clients: {
      access_task_list: 'Asset, NFT, and edit lists',
      access_task_list_description: 'Clients can open the asset, NFT, and edit lists and their pages.',
      metadata_description: 'Checked metadata columns are shown to clients in the asset and NFT lists.'
    },
    creation: {
      add_shots: 'Add NFTs (optional)',
      add_shots_description: 'Add or import the NFTs for your production.',
      errorImportingShots: 'An error occurred while importing your NFTs. The production has been created though!',
      import_shots_button: 'Import NFTs',
      select_shot_task_type: 'Select NFT task types',
      select_shot_task_type_description: 'These task types define the building steps of your NFTs.',
      shots_to_import: 'NFTs to import'
    },
    homepage: {
      'shots': 'NFTs'
    },
    type: {
      shots: 'Only NFTs'
    },
    video: {
      frame_in_description: "The player counter starts at the NFT's frame in instead of 0."
    }
  },

  task_status: {
    help: {
      entities: 'Assets, NFTs, sequences, ...'
    }
  },

  sequences: {
    delete_text: 'Are you sure you want to remove {name} from your database? All related NFTs and previews will also be deleted. Please confirm by typing the sequence name below.',
    delete_error: 'An error occurred while deleting this sequence. There may be existing data currently linked to it. Are you sure this sequence has no NFT linked to it?'
  },

  quota: {
    explanation_feedback: 'The NFT is considered complete on the first feedback request. Its number of frames is added to the quotas for that day.',
    explanation_done: 'The NFT is considered complete on the last approval. Its number of frames is added to the quotas for that day.',
    explanation_weighted: 'NFTs are considered complete upon the first feedback request. Then, quotas are weighted based on the time spent on the task, as recorded in the artist\'s timesheet.\n\nIf no time is recorded, it is assumed that:\n* The task started at the first status change to WIP.\n* The task was completed on the day the feedback request was made.\n* The completed frames are distributed evenly among all business days between the start and end dates.',
    explanation_weighteddone: 'NFTs are considered complete upon the last approval. Then, quotas are weighted based on the time spent on the task, as recorded in the artist\'s timesheet.\n\nIf no time is recorded, it is assumed that:\n* The task started at the first status change to WIP.\n* The task was completed on the day it was approved.\n* The completed frames are distributed evenly among all business days between the start and end dates.'
  },

  shots: {
    casting: 'NFT casting',
    creation_explanation: 'To add NFTs, you first need to create an episode and a sequence. Type an episode name at the bottom of the left column, then click "Add" to create a new episode. Select this episode and repeat the same operation for the sequence. Finally, select a sequence and type an NFT name in the field at the bottom of the right column. Click the "Add" button below. Your first NFT is now created. You can add many more! If it\'s not a TV show, you can directly create a sequence.',
    delete_for_selection: 'Delete the selected NFT | Delete the {nbSelectedShots} selected NFTs',
    delete_for_selection_hard_text: 'Are you sure you want to permanently remove the selected NFTs? All related tasks, comments and previews will also be deleted. Please confirm by typing \'DELETE\' below.',
    delete_error: 'An error occurred while deleting this NFT. There may be existing data currently linked to it. Are you sure this NFT has no task linked to it?',
    edit_success: 'NFT {name} successfully edited.',
    edit_fail: 'Creation or edit failed, an error occurred. Make sure that you are not renaming the NFT with a name already listed for a given sequence.',
    edit_title: 'Edit NFT',
    empty_list: 'There are no NFTs in the production. How about creating some?',
    empty_list_read_only: 'There are no NFTs in this production.',
    history: 'NFT values history',
    multiple_delete_error: 'An error occurred while deleting an NFT. There may be existing data currently linked to the NFT. Are you sure there is no task linked to a selected NFT?',
    new_shot: 'New NFT',
    new_shots: 'Create NFTs',
    no_casting: 'The NFT casting is empty.',
    number: 'NFT | NFTs',
    new_success: 'NFT {name} successfully created.',
    restore_error: 'An error occurred while restoring this NFT.',
    tasks: 'NFT tasks',
    title: 'NFT Collection',
    wrong_file_duration: 'The duration of one of the uploaded video files doesn\'t match the expected duration of the current NFT.',
    fields: {
      placeholder: "NFT01"
    }
  },

  statistics: {
    shots: 'NFTs'
  },

  tasks: {
    create_tasks_shot: 'Add tasks for current NFTs',
    create_tasks_shot_explanation: 'You are about to create a new task for each NFT of the current production for the given task type. Do you want to continue?'
  }
}
