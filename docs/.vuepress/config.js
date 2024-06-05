module.exports = {
  title: 'Kitsu Documentation',
  description: 'The documentation for Kitsu, the collaboration platform for Animation studios',
  head: [
    ['link', { rel: 'shortcut icon', type: 'image/x-icon', href: `./img/favicon.ico` }]
  ],
  themeConfig: {
    sidebar: [
      {
        title: 'Introduction to Kitsu',
        collapsable: false,
        children: [['/', 'Introduction'],
         '/configure-kitsu/',
          '/team/'
        ]
      },
      {
        title: 'Create Your Production',
        collapsable: true,
        children: [
          '/tvshow/',
          '/feature/',
          '/short/',
          '/short-shot/',
          '/short-asset/',
          '/videogame/',
          '/nft/'
        ]
      },
      {
        title: 'Meta Columns, Filters and Production Settings',
        collapsable: true,
        children: [
          '/meta-column/',
          '/filter/',
          '/configure-prod/'
        ]
      },
      {
        title: 'Assignments, Estimates and Scheduling',
        collapsable: true,
        children: [
          '/assignation/', 
          '/estimation/', 
          '/schedules/'
        ]
      },
      {
        title: 'Statuses, Publishes, and Thumbnails',
        collapsable: true,
        children: [
          '/status/',
          '/publish/',
          '/thumbnails/'
          ]
      },
      {
        title: 'Internal Review and Client Playlists',
        collapsable: true,
        children: [
         '/review/',
         '/review-weekly/',
         '/playlist-client/'
          ]
       },
      {
        title: 'Supervisor Workflows',
        collapsable: true,
        children: [
          '/supervisor-team/',
          '/supervisor-tasks/'
           ]
       },
      {
        title: 'Producer Workflows',
        collapsable: true,
        children: [
          '/production-report/',
          '/studio-report/'
        ]
      },
      {
        title: 'Developer Workflows',
        collapsable: true,
        children: [
          '/custom-actions/',
          '/bots/',
          '/publisher/',
          '/chat-integration/',
          '/installation/'
        ]
      }
    ]
  }
}
