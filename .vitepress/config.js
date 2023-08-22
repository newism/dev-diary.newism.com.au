import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Newism Dev Diary',
  description: 'CraftCMS development notes, tips and tricks.',
  head: [
    [
      'script',
      {
        async: true,
        src: 'https://www.googletagmanager.com/gtag/js?id=G-FX9N6QZ21K',
      },
    ],
    [
      'script',
      {},
      "window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'G-FX9N6QZ21K');",
    ],
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
