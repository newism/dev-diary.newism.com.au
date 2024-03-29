const fs = require('fs')
const path = require('path')
const { Feed } = require('feed')
const { load } = require('./posts.data')
const url = `https://dev-diary.newism.com.au`

const feed = new Feed({
  title: 'Newism Dev Diary',
  description: 'CraftCMS development notes, tips and tricks.',
  id: url,
  link: url,
  language: 'en',
  image: 'https://dev-diary.newism.com.au/logo.png',
  favicon: `${url}/favicon.ico`,
  copyright: 'Copyright (c) 2022-present, Newism Pty Ltd'
})

load(true).forEach((post) => {
  const file = path.resolve(__dirname, `dist${post.href}`)
  const rendered = fs.readFileSync(file, 'utf-8')
  const content = rendered.match(
    /<div [^<>]+?class="prose[^<>]+?>([\s\S]*)<\/div><\/div><footer/
  )

  feed.addItem({
    title: post.title,
    id: `${url}${post.href}`,
    link: `${url}${post.href}`,
    description: post.excerpt,
    content: content[1],
    author: [
      {
        name: post.data.author,
        link: post.data.twitter
          ? `https://twitter.com/${post.data.twitter}`
          : undefined
      }
    ],
    date: post.data.date
  })
})

fs.writeFileSync(path.resolve(__dirname, 'dist/feed.rss'), feed.rss2())
