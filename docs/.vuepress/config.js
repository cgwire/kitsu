module.exports = {
  title: 'Kitsu Documentation',
  description: 'The documentation for Kitsu, the collaboration platform for Animation studios',
  head: [
     ['link', { rel: 'shortcut icon', type: "image/x-icon", href: `./img/favicon.ico` }]
  ],
  themeConfig: {
   sidebar: [{
     title: 'Introductions to Kitsu Basics',
     collapsable: true,
     children: [
      ['/', 'Introduction'],
       '/configure-kitsu/',
       '/team/'
       ]
   },
    {
     title: 'Create your production',
     collapsable: true,
     children: [
	    '/short/',
	    '/short-shot/',
	    '/short-asset/',
      '/tvshow/',
      '/feature/',
      '/videogame/',
      '/nft/'
	 ]
   },
   	{
     title: 'Assignation, Estimation and schedule',
     collapsable: false,
     children: [
	    '/assignation/',
	    '/estimation/',
	    '/schedules/'
     ]
	},
   {
     title: 'Status, Publish, Thumbnail and Review',
     collapsable: false,
     children: [
	    '/status/',
	    '/publish/',
	    '/review/'
     ]
   },
	{
     title: 'Developper',
     collapsable: false,
     children: [
      '/custom-actions/',
      '/publisher/',
	    '/chat-integration/',
	    '/installation/'
     ]
	},	
    {
     title: 'Producer',
     collapsable: false,
     children: [
       '/installation/',
       '/development-environment/'
     ]
    }]
  }
}
