---
layout: page
metaTitle: Templating with feather ssg
metaDescription: feather ssg is back to the basics
title: Templating with feather ssg
dateCreated: 2022-07-09 19:24:21 EDT
dateUpdated: 2022-07-25 21:33:01 EDT
category: html
prism: true
---

# Templating with feather ssg

For all HTML structure, I am using <a href="https://mozilla.github.io/nunjucks" rel="noopener nofollow" target="_blank">Nunjucks</a>. Making it very easy to break up your HTML into modules, custom layouts, and only include things as needed.

The end result being never repeating your HTML, and future changes are only a one file edit.

## Templating Structure

```directory
src/
└── html/
    └── templates/
        ├── icons/
        │   └── feather.njk
        ├── partials/
        │   ├── head.njk
        │   ├── include-jquery.njk
        │   └── navigation.njk
        └── page.njk (default layout of all pages)
```

This is the folder structure of templating when creating a site with feather-ssg.

## Layouts

You can have as many layouts of pages are you'd like to set, right now there is only one defined `page.njk` and that is mapped in the front matter of a file like this:

```yaml
# set layout of post
layout: page
```

### "Page" Layout File

This is just a **sudo example** of how Nunjucks layouts are setup, this is **not valid code** (since the parser is actually running on these pages).

```html
<!DOCTYPE html>
<html lang="en" { if htmlClass|length } class="{ htmlClass }" { endif }>
  <!-- <head /> will be added here -->
  { include "partials/head.njk" }

  <body { if bodyClass|length } class="{ bodyClass }" { endif }>
    <!-- main navigation will be added here -->
    { include "partials/navigation.njk" }

    <!-- page specific HTML will be added here -->
    <div class="container">
      <main>
        <!-- main content from Markdown/HTML will be added here -->

        <!-- if you want Previous/Next modules to be included at the end of a post -->
        [[ PREV/NEXT ]]
      </main>

      <!-- if you want a right column to be included with a post -->
      [[ RIGHT COLUMN ]]
    </div>

    <!-- build:js -->
    <!-- any js references will be added here at build -->
    <!-- endbuild -->

    <!-- hook to allow page specific javascript (inline or file reference) to be added here -->
    { block pageSpecificJs here}
  </body>
</html>
```

## Partials

Think of partials as mini HTML modules, you can "include" them as needed, pass variables to them, etc. To read more take a look at <a href="https://mozilla.github.io/nunjucks/templating.html" rel="noopener nofollow" target="_blank">Nunjucks templating</a>.

To edit this post, check out: `/src/html/pages/html/templating.md`
