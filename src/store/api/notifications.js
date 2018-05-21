import client from './client'

export default {
  getNotifications (callback) {
    /*
    process.nextTick(() => {
      callback(null, [
        {
          id: 'notification-1',
          author_id: '69b73547-8f2b-4f5c-bc29-275f66109c44',
          task_id: '38901b05-1a1a-405c-8b6e-5c91a3a70579',
          task_type_id: 'f8ae10e3-2062-446e-932b-4bb69c403b40',
          task_status_id: '261acd50-a793-42b6-9150-4477d610c8bb',
          preview_file_id: 'a44948df-ffa4-4dc8-b855-e4ec9d2ccc9b',
          project_id: '44db97f0-ea30-4036-828b-e58bced7b707',
          project_name: 'Caminandes: LLamigos',
          full_entity_name: 'EP01 / SEQ01 / SH01',
          comment_text: 'I added a new comment on your production',
          created_at: '2018-05-16 14:13:12',
          read: false,
          change: true
        },
        {
          id: 'notification-2',
          project_name: 'Caminandes: LLamigos',
          author_id: '69b73547-8f2b-4f5c-bc29-275f66109c44',
          project_id: '44db97f0-ea30-4036-828b-e58bced7b707',
          task_type_id: 'f8ae10e3-2062-446e-932b-4bb69c403b40',
          full_entity_name: 'EP01 / SEQ01 / SH01',
          task_id: '38901b05-1a1a-405c-8b6e-5c91a3a70579',
          comment_text: 'I added a new comment on your production',
          preview_id: 'a44948df-ffa4-4dc8-b855-e4ec9d2ccc9b',
          created_at: '2018-05-15 14:13:12',
          read: true
        },
        {
          id: 'notification-3',
          project_name: 'Caminandes: LLamigos',
          author_id: '69b73547-8f2b-4f5c-bc29-275f66109c44',
          project_id: '44db97f0-ea30-4036-828b-e58bced7b707',
          task_type_id: 'f8ae10e3-2062-446e-932b-4bb69c403b40',
          task_status_id: '261acd50-a793-42b6-9150-4477d610c8bb',
          full_entity_name: 'EP01 / SEQ01 / SH01',
          comment_text: 'I added a new comment on your production',
          task_id: '38901b05-1a1a-405c-8b6e-5c91a3a70579',
          preview_id: 'a44948df-ffa4-4dc8-b855-e4ec9d2ccc9b',
          created_at: '2018-03-16 14:13:12',
          read: true
        }
      ])
    })
    */
    client.get('/api/data/user/notifications', callback)
  }
}
