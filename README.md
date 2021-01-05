# feather ssg (static site generator)

html/css/js + markdown + gulp automation + hot-reloading to create lightweight static sites

[feather-ssg.dev](https://feather-ssg.dev)

---

- [Features](#features)
- [Roadmap](#roadmap)
- [Install](#install)
- [Development environment](#development-environment)
- [Production builds](#production-builds)
- [Deploying to Vercel](#deploying-to-vercel)
- [Technologies Used](#technologies-used)
- [Helpful code editor packages](#helpful-code-editor-packages)

## Features

- Fast reload on all edits
- QR code for physical mobile web app development (also with fast reload)
- HTML + Nunjucks Templating with Layouts
- SCSS => CSS
- CSS & JS Minified
- Dark Mode check with JavaScript (adds `.dark-mode` to body)
- Markdown support + Front Matter for page data
- Meta supported: title, description, keywords, canonical, robots, etc.
- Relative / Absolute pathing handled for you
- Sitemap.xml created
- Build stats
  - Page count
  - CSS before and after minification

## Roadmap

- [ ] Local WYSIWYG Editor
- [ ] Category support
- [ ] Show HTML before and after sizes in build report
- [ ] Use [purgecss](https://purgecss.com/plugins/gulp.html#installation)?
- [ ] Font face
- [ ] Theming (+ predefined palettes, scss variables and root css usage)

## Install

run: `yarn` or `yarn install`


## Development environment

- start local server, run: `yarn dev`
- stop local server: **ctl** + **c**

## Production builds

#### create for Production deploy

- run: `yarn prod`
- creates: **/static_prod/**

## Deploying to Vercel

- Make sure you have [Vercel CLI](https://vercel.com/download) installed globally on your machine
- then run: `yarn prod` to make sure you have all static files generated and ready for deployment
- then run: `vercel` *(this will prompt a login if you are not already)*
- going through the setup flow, make sure to set the directory your code is located to be: **./static_prod**
- ***side note***, i've added a custom domain, (feather-ssg.dev) so to push to that domain i run: `vercel --prod`

## Technologies Used

- Gulp v.4
    - [task()](https://gulpjs.com/docs/en/api/task)
    - [watch()](https://gulpjs.com/docs/en/api/watch)
    - [series()](https://gulpjs.com/docs/en/api/series)
    - [parallel()](https://gulpjs.com/docs/en/api/parallel)
    - [forward()](https://gulpjs.com/docs/en/api/series#forward-references) with Gulp v.4, they removed the ability for forward reference a task, to help performance, so you must define a task before it is called.
- SCSS & CSS Minification
    - [gulp-sass](https://www.npmjs.com/package/gulp-sass)
    - [gulp-clean-css](https://www.npmjs.com/package/gulp-clean-css)
- Nunjucks & HTML Minification
    - [gulp-nunjucks-render](https://www.npmjs.com/package/gulp-nunjucks-render)
    - [gulp-htmlmin](https://www.npmjs.com/package/gulp-htmlmin)
- [BrowserSync with Gulp](https://browsersync.io/docs/gulp)
    - for hot-reloading after a change is made to, sccs/js/nunjucks
    - [QR Code Plugin](https://github.com/0ahz/bs-console-qrcode) for quick development on a physical mobile device (same wifi network required).
- Notification/Error handling:
    - [node-notifier](https://www.npmjs.com/package/node-notifier)
    - **error handling** is happening at the compile state for both scss & nunjucks
- Cleaning up directories before a new compile: [del](https://github.com/gulpjs/gulp/blob/master/docs/recipes/delete-files-folder.md#delete-files-and-folders)
- CLI helpful coloring using [chalk](https://github.com/chalk/chalk)

## Helpful code editor packages

- For Atom:
    - [Syntax highlighting for nunjucks templates](https://atom.io/packages/language-nunjucks)
    - [Displays Colors used in project](https://atom.io/packages/pigments) (even scss variables)
