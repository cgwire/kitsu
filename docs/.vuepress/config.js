module.exports = {
  title: 'Kitsu Documentation',
  description: 'Documentation for the production tracker Kitsu',
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
	   '/getting-started-client/',
	   '/batch-action/',
       ['/faq/', 'FAQ'],
       '/permissions/',
       '/slack/',
       '/custom-actions/'
     ]
   },
   {
     title: 'Kitsu Module',
     collapsable: false,
     children: [
       '/Schedules/',
            ]
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
