---
layout: page
metaTitle: Styling with feather ssg
metaDescription: feather ssg is back to the basics
title: Styling with feather ssg
dateCreated: 2022-07-09 18:24:21 EDT
category: html
prism: true
---

# Styling with feather ssg

By default, all styles are compiled down within one file, `global.css`

You can change the base naming within `./site-config.json`

## Page Specific Styles

You can add extra styles to a specific page by adding the `css` variable to the Front Matter section of you Markdown.

```yaml
# adds extra styles to this page
css: some-file-name
```

For this example above, you would want to make sure to create the file: `./src/scss/some-file-name.scss`

## Code Snippet Styling

If you have code snippets in your post, turn this flag on to have prism styling applied.

```yaml
# include prism for code snippets
prism: true
```

To edit this post, check out: `/src/html/pages/html/getting-started.md`
