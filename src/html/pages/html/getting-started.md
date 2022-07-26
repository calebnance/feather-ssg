---
layout: page
metaTitle: Getting started with feather ssg
metaDescription: feather ssg is back to the basics
title: Getting started with feather ssg
dateCreated: 2022-07-09 18:19:00 EDT
dateUpdated: 2022-07-25 21:29:23 EDT
category: html
tags: code howto
prism: true
---

# Getting started with feather ssg

The easiest way to create a new post is with a markdown file.

All pages/posts are created within `./src/html/pages/`

So for example: `./src/html/pages/features.md` => `/features.html`

---

## Base Front Matter

This is what a base start of a post file would look like:

```yaml
# layout support
layout: page

# meta
metaTitle: Getting started with feather ssg
metaDescription: feather ssg is back to the basics

# page title (used for prev/next)
title: Getting started with feather ssg

# created (required) and updated date
dateCreated: 2022-07-09 18:19:15 EDT
dateUpdated: 2022-07-11 20:49:34 EDT
```

## Category Grouping

This category is used for grouping and paired with `dateCreated`, it displays the Previous / Next module at the bottom of a post.

```yaml
# posts are sorted by created date within each category
category: html
```

To edit this post, check out: `/src/html/pages/html/getting-started.md`
