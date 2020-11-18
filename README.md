# feather ssg (static site generator)

**tl;dr** html/css/js + json + gulp automation to create lightweight static sites

---

- [Technologies Used](#technologies-used)
- [Roadmap](#roadmap)
- [Install](#install)
- [Development environment](#development-environment)
- [Production & Staging builds](#production--staging-builds)
- [Helpful code editor packages](#helpful-code-editor-packages)

## Technologies Used
---

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

## Roadmap
---

- [X] Development environment
  - [X] QR Code to scan for physical mobile web app development (with fast reload)
- [X] HTML Layout/Templates for different use cases
- [X] **Optional:** use jQuery added
- [ ] Markdown support
- [ ] Category support
- [ ] Javascript added (ES6)
- [ ] Production minify JS, CSS & HTML
- [ ] Production find/replace <link /> & <script /> tags
- [ ] HTML populated by .json
- [ ] Create deploy script to push to stage or production directory

## Install
---

run: `yarn` or `yarn install`


## Development environment
---

- start local server, run: `yarn dev`
- stop local server: **ctl** + **c**

## Production & Staging builds
---

#### create for Stage deploy

- run: `yarn stage`
- creates: **/static_stage/**

#### create for Production deploy

- run: `yarn prod`
- creates: **/static_prod/**

## Helpful code editor packages
---

- For Atom:
    - [Syntax highlighting for nunjucks templates](https://atom.io/packages/language-nunjucks)
    - [Displays Colors used in project](https://atom.io/packages/pigments) (even scss variables)
