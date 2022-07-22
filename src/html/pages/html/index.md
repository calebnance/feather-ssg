---
layout: page
metaTitle: HTML
metaDescription: feather is back to the basics
title: HTML
dateCreated: 2022-07-10 20:19:00 EDT
category: html
tags: html code
prism: true
---

# HTML

<h2 class="heading-snippet">Basic Nunjucks Layout</h2>

This is just a **sudo example** of how Nunjucks layouts are setup, this is **not valid code** (since the parser is actually running on these pages).

```html
<!DOCTYPE html>
<html lang="en"{% if htmlClass|length %} class="{{ htmlClass }}"{% endif %}>
  { include "partials/head.njk" }

  <body{% if bodyClass|length %} class="{{ bodyClass }}"{% endif %}>
    { include "partials/navigation.njk" }
    
    { page specific HTML will be added here }
    <main class="container">
      { block content here }
    </main>
    
    <!-- build:js -->
    <!-- endbuild -->
    
    { hook to allow page specific javascript to be added here }
    
    { block pageSpecificJs here}
  </body>
</html>
```

To edit this post, check out: `/src/html/pages/html/index.md`