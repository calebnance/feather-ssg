---
layout: page
metaTitle: Features of feather ssg
metaDescription: feather is back to the basics
title: Features of feather ssg
dateCreated: 2022-01-22 14:00:00 EDT
dateUpdated: 2022-04-22 11:00:00 EDT
category: features
tags: code howto
css: extra-style
prism: true
---

# Features of feather ssg

This project is a return to a simple HTML/CSS/JavaScript dev environment.

- Hot reloading (with QR code for **parallel** physical mobile development)
- HTML + **Nunjucks Templating** with Layouts
- **Markdown** + **Front Matter** support
- SCSS => CSS
- HTML, CSS, and JS minified for fast page loads
- **Dark Mode** check with JavaScript (adds `.dark-mode` to body)
- Data hydration from supporting **json** or **Front Matter**

---

This page was created with **markdown** and has front matter.

```yaml
layout: page
metaTitle: Features of feather ssg
metaDescription: feather is back to the basics
title: Features of feather ssg
dateCreated: 2022-01-22 14:00:00 EDT
dateUpdated: 2022-04-22 11:00:00 EDT
category: features
tags: javascript code howto
css: extra-style
```

It also has a custom css file included (css: extra-style)

To edit view: `/src/html/pages/features.md`