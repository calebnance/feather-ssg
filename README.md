# feather ssg (static site generator)

**tl;dr** html/css/js + markdown + gulp automation + hot-reloading to create lightweight static sites

- [Features](#features)
- [Roadmap](#roadmap)
- [Install](#install)
- [Development environment](#development-environment)
- [Production & Staging builds](#production--staging-builds)
- [Technologies Used](#technologies-used)
- [Helpful code editor packages](#helpful-code-editor-packages)

## Features

- TODO

## Roadmap

- [X] Development environment
  - [X] QR Code to scan for physical mobile web app development (with fast reload)
  - [ ] Local WYSIWYG Editor
- [X] HTML Layout/Templates for different use cases
- [ ] HTML populated by .json
- [X] Meta: Title, Keywords & Description
- [X] Canonical support
- [ ] Category support
- [X] Markdown support
- [X] Production minify JS, CSS & HTML
  - [X] Show CSS before and after sizes in build report
  - [ ] Show HTML before and after sizes in build report
- [ ] Use [purgecss](https://purgecss.com/plugins/gulp.html#installation)?
- [ ] Javascript support added
  - [X] **Optional:** use jQuery added
- [ ] Production find/replace <link /> & <script /> tags
- [ ] sitemap (maybe a cool example of all urls being produced, but also for xml file)

## Install

run: `yarn` or `yarn install`


## Development environment

- start local server, run: `yarn dev`
- stop local server: **ctl** + **c**

## Production builds

#### create for Production deploy

- run: `yarn prod`
- creates: **/static_prod/**

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
