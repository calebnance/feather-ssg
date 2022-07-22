---
layout: page
metaTitle: Getting started with feather ssg
metaDescription: feather is back to the basics
title: Getting started with feather ssg
dateCreated: 2022-07-09 18:19:00 EDT
category: html
tags: code howto
prism: true
---

# Getting started with feather ssg

All pages/posts are created within `/src/html/pages/`.

So for example: `/src/html/pages/features.md` => `/features.html`

---

The easiest way to create a new post is with markdown, the front matter looks like this:

```yaml
# layout support
layout: page

# meta
metaTitle: Getting started with feather ssg
metaDescription: feather is back to the basics

# page title (used for prev/next)
title: Getting started with feather ssg

# created (required) and updated date
dateCreated: 2022-07-09 18:19:15 EDT
dateUpdated: 2022-07-11 20:49:34 EDT

# posts are sorted by created date within each category
category: html
tags: code howto

# include prism for code snippets
prism: true
```

To edit this post, check out: `/src/html/pages/html/getting-started.md`
