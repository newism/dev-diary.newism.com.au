import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Newism Dev Diary',
  description: 'CraftCMS development notes, tips and tricks.',
  head: [
    ['meta', { name: 'twitter:site', content: '@newism' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    [
      'meta',
      {
        name: 'twitter:image',
        content: 'https://dev-diary.newism.com.au/twitter-card.svg'
      }
    ],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico'
      }
    ]
  ],
  markdown: {
    // lineNumbers: true
  },
  vite: {
    build: {
      minify: 'terser'
    }
  }
})
