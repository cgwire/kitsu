module.exports = {
  title: 'Kitsu Documentation',
  description: 'The documentation for Kitsu, the collaboration platform for Animation studios',
  head: [
     ['link', { rel: 'shortcut icon', type: "image/x-icon", href: `./img/favicon.ico` }]
  ],
  themeConfig: {
   sidebar: [{
     title: 'Guide',
     collapsable: false,
     children: [
       ['/', 'Introduction'],
       '/first_production/',
       '/production_advanced/',
	   '/getting-started-production/',
	   '/getting-started-studio/',
	   '/getting-started-superviseur/',
       '/getting-started-artist/',
	     '/getting-started-client/'
     ]
   },
    {
     title: 'Customization',
     collapsable: false,
     children: [
	    '/customization-pipeline/',
        '/customization-production/',
		 '/customization-studio/'
	 ]
   },
   	{
     title: 'FAQ',
     collapsable: false,
     children: [
       '/faq-deletion/',
	     '/faq-filter/',
	     '/faq-notification/',
	     '/faq-production-report/'
     ]
	},
   {
     title: 'Modules',
     collapsable: false,
     children: [
	    '/department/',
	    '/permissions/',
	    '/playlist/',
       '/Schedules/',
       '/batch-action/',
       '/custom-actions/'
     ]
   },
   {
     title: 'Chat Integrations',
     collapsable: false,
     children: [
       '/discord/',
       '/mattermost/',
       '/slack/'
     ]
	},
	{
     title: 'Kitsu Publisher',
     collapsable: false,
     children: [
       '/publisher/',
       '/dcc-plugin/',
	   '/using_publisher/'
     ]
	},	
    {
     title: 'Open Source Setup',
     collapsable: false,
     children: [
       '/installation/',
       '/development-environment/'
     ]
    }]
  }
}
