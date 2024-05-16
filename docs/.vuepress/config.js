module.exports = {
  title: 'Kitsu Documentation',
  description: 'The documentation for Kitsu, the collaboration platform for Animation studios',
  head: [
    ['link', { rel: 'shortcut icon', type: 'image/x-icon', href: `./img/favicon.ico` }]
  ],
  themeConfig: {
    sidebar: [
      {
        title: 'Introductions to Kitsu Basics',
        collapsable: false,
        children: [['/', 'Introduction'],
         '/configure-kitsu/',
          '/team/'
        ]
      },
      {
        title: 'Create your production',
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
        title: 'Meta Columns, Filters and Production Setting',
        collapsable: true,
        children: [
          '/meta-column/',
          '/filter/',
          '/configure-prod/'
        ]
      },
      {
        title: 'Assignation, Estimation and Schedule',
        collapsable: true,
        children: [
          '/assignation/', 
          '/estimation/', 
          '/schedules/'
        ]
      },
      {
        title: 'Status, Publish, and Thumbnail',
        collapsable: true,
        children: [
          '/status/',
          '/publish/',
          '/thumbnails/'
          ]
      },
      {
        title: 'Internal Review and Client Playlist',
        collapsable: true,
        children: [
         '/review/',
         '/review-weekly/',
         '/playlist-client/'
          ]
       },
      {
        title: 'Supervisor',
        collapsable: true,
        children: [
          '/supervisor-team/',
          '/supervisor-tasks/'
           ]
       },
      {
        title: 'Producer',
        collapsable: true,
        children: [
          '/production-report/',
          '/studio-report/'
        ]
      },
      {
        title: 'Developer',
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
