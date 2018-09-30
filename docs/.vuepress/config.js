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
       '/getting-started-artist/',
       ['/faq/', 'FAQ']
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
