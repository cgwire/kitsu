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
       '/getting-started-production/',
	     '/getting-started-advanced/',
       '/getting-started-artist/',
	     '/getting-started-client/'
     ]
   },
   {
     title: 'Customization',
     collapsable: false,
     children: [
	     '/customization-kitsu/',
	     '/customization-studio/',
         '/customization-production/'
	  ]
   },
   {
     title: 'Modules',
     collapsable: false,
     children: [
	     '/department/',
	     '/customization/',
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
       '/slack/',
     ]
	},
	{
     title: 'Kitsu Publisher',
     collapsable: false,
     children: [
       '/publisher/',
       '/dcc-plugin/',
	   '/using_publisher/',
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
     title: 'Open Source Setup',
     collapsable: false,
     children: [
       '/installation/',
       '/development-environment/'
     ]
    }]
  }
}
