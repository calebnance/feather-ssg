const browserSync = require('browser-sync').create();
const chalk = require('chalk');
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const data = require('gulp-data');
const fs = require('fs');
const gulp = require('gulp');
const gulpReplace = require('gulp-replace');
const htmlmin = require('gulp-htmlmin');
const matter = require('gray-matter');
const notifier = require('node-notifier');
const nunjucksMd = require('gulp-nunjucks-md');
const nunjucksRender = require('gulp-nunjucks-render');
const path = require('path');
const rename = require('gulp-rename');
const replace = require('gulp-replace-task');
const replaceHTML = require('gulp-html-replace');
const sass = require('gulp-sass')(require('sass'));
const uglify = require('gulp-uglify');

// grab the configuration file
const siteConfig = require('./site-config.json');

// import utility functions
const util = require('./utilities');

// breakout reload for usage after file changes detected
const { reload } = browserSync;

// const sep = new Array(10).join('+-');
// console.log('sep', sep);

/** ***************************************************************************\
 * ENVIRONMENT HANDLING
\**************************************************************************** */
const envMode = process.env.NODE_ENV;
const isProduction = process.env.NODE_ENV === 'prod';

// a little high level configuration
const rootDirs = {
  dev: 'static_dev',
  prod: 'static_prod'
};
const directory = rootDirs[envMode];

/** ***************************************************************************\
 * TASK HANDLING DEPENDING ON ENVIRONMENT
\**************************************************************************** */
// html tasks
const htmlTasks = [
  'dataStart',
  'nunjucks',
  'markdown',
  'html-replace',
  'dataEnd'
];

// asset tasks
const assetTasks = ['fonts', 'images', 'videos'];

// js tasks
const jsTasks = ['js', 'move-js-min'];

// shared tasks
const sharedTasks = ['clean', 'scss', ...jsTasks, ...htmlTasks, ...assetTasks];

// dev ONLY tasks
const devTasks = ['serve'];

// production ONLY tasks
const prodTasks = ['notify-completed'];

// final build tasks
const buildTasks = isProduction
  ? sharedTasks.concat(prodTasks)
  : sharedTasks.concat(devTasks);

/** ***************************************************************************\
 * NOTIFY COMPLETED BUILD
\**************************************************************************** */
gulp.task('notify-completed', (done) => {
  const lineSep =
    ' --------------------------------------------------------------------- ';
  const modeUpper = envMode.toUpperCase();
  const msg1 = util.lineStretchToEnd(` Completed build: ${modeUpper}`, lineSep);
  const msg2 = util.lineStretchToEnd(` in directory: ./${directory}/`, lineSep);
  const msg = `${lineSep}\n${msg1}\n${msg2}\n${lineSep}`;

  // display build completed message to developer
  console.log(chalk.black.bgGreen(msg));

  done();
});

/** ***************************************************************************\
 * notify developer at the os level, an error has occurred 
\**************************************************************************** */
const pingError = (error, type) => {
  // if you want details of the error in the console
  // console.log(error);
  console.log(error.message);
  console.log('=============================');
  console.log('=+=+=+=+=+=+=+=+=+=+=+=+=+=+=');
  // console.log(error.toString());

  notifier.notify({
    title: `${type} error!`,
    message: error.message,
    icon: path.join(__dirname, 'icon.png'),
    sound: true
  });

  process.exit(1);
};

/** ***************************************************************************\
 * CLEAN STATIC DIRECTORIES
\**************************************************************************** */
gulp.task('clean', () => {
  return del([`${rootDirs.dev}/**/*`, `${rootDirs.prod}/**/*`]);
});

/** ***************************************************************************\
 * SCSS => CSS
\**************************************************************************** */
gulp.task('scss', () => {
  // grab all scss and compile into css
  let sourceFile = gulp
    .src('./src/scss/**/*.scss')
    .pipe(sass().on('error', (error) => pingError(error, 'scss')));

  // minify css, if production build
  if (isProduction) {
    // clean css
    // https://github.com/jakubpawlowicz/clean-css#compatibility-modes
    console.log(chalk.black.bgBlue('-- CSS Files'));
    sourceFile = sourceFile
      .pipe(
        cleanCSS({ compatibility: '*' }, (details) => {
          const origSize = util.formatBytes(details.stats.originalSize);
          const miniSize = util.formatBytes(details.stats.minifiedSize);

          console.log(
            `${details.name}: ${chalk.black.red(
              origSize
            )} => ${chalk.black.bgGreen(miniSize)}`
          );
        })
      )
      .pipe(rename({ suffix: '.min' }));
  }

  return sourceFile.pipe(gulp.dest(`./${directory}/css`));
});

/** ***************************************************************************\
 * javascript
\**************************************************************************** */
gulp.task('js', () => {
  // grab all js (exclude .min if present)
  const jsSourcePattern = ['./src/js/**/*.js', '!./src/js/**/*.min.js'];
  let sourceFile = gulp.src(jsSourcePattern);

  if (isProduction) {
    // minify js & rename
    sourceFile = sourceFile.pipe(uglify()).pipe(rename({ suffix: '.min' }));
  }

  return sourceFile.pipe(gulp.dest(`./${directory}/js`));
});

/** ***************************************************************************\
 * move any javascript that is already minified in /src/js/
\**************************************************************************** */
gulp.task('move-js-min', () => {
  return gulp.src('./src/js/**/*.min.js').pipe(gulp.dest(`./${directory}/js`));
});

/** ***************************************************************************\
 * create data for future use / module creation
\**************************************************************************** */
const moduleCreation = ({ category, combinedData, fileInfo }) => {
  const { fullPath, subPath } = fileInfo;
  const { dateCreated, dateUpdated, title } = combinedData;

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    hour12: true,
    minute: '2-digit'
  };

  const created = new Date(dateCreated);
  const dateCreatedFormat = created.toLocaleString('en-US', options);
  const updated = new Date(dateUpdated);
  const dateUpdatedFormat = dateUpdated
    ? updated.toLocaleString('en-US', options)
    : null;

  const dateObj = {
    dateCreated: created,
    dateCreatedFormat,
    subPath,
    title
  };

  // add datetime
  if (category in this.pagesChronological) {
    this.pagesChronological[category].push(dateObj);
  } else {
    this.pagesChronological[category] = [dateObj];
  }

  const pathHTML = `${subPath}.html`;

  // add category
  if (category in this.categories) {
    this.categories[category].push(pathHTML);
  } else {
    this.categories[category] = [pathHTML];
  }

  const subPathKey = subPath.substring(1).replace(/\//g, '-');

  // add right menu?
  if (combinedData.isPost) {
    this.showRightColumn.push(subPath);
  }

  // extra css?
  if (combinedData?.css) {
    this.extraCss[subPathKey] = {
      path: subPath,
      css: combinedData.css
    };
  }

  // include Prism CSS/JS?
  if (combinedData.prism) {
    this.usePrism.push(subPathKey);
  }

  // add to pages
  this.pages[subPath] = {
    category,
    fullPath,
    ...(dateCreatedFormat && { dateCreated: dateCreatedFormat }),
    ...(dateUpdatedFormat && { dateUpdated: dateUpdatedFormat })
  };
};

/** ***************************************************************************\
 * NUNJUCKS => HTML
\**************************************************************************** */
gulp.task('nunjucks', () => {
  const defaultData = require('./src/html/default-data.json');

  let sourceFile = gulp
    .src('./src/html/pages/**/*.njk')
    .pipe(
      data((file) => {
        // get direct path of page
        const fileInfo = util.parseFilePath(file.path);

        const { fullPath, subPath } = fileInfo;

        // set path to json file, specific to the HTML page we are compiling!
        const pathToFile = `./src/html/data${subPath}.json`;

        let pageData = {};
        if (fs.existsSync(pathToFile)) {
          // delete cache, we always want the latest json data...
          delete require.cache[require.resolve(pathToFile)];

          // grab specific page data
          pageData = require(pathToFile);
        } else {
          console.log(chalk.red(`Extra metadata not found: ${pathToFile}`));
        }

        const combinedData = {
          ...defaultData,
          ...pageData,
          canonical: fullPath
        };

        const { category } = pageData;

        // use data for future module creation
        moduleCreation({ category, combinedData, fileInfo });

        return combinedData;
      }).on('error', pingError)
    )
    .pipe(
      nunjucksRender({
        path: './src/html/templates'
      }).on('error', (error) => pingError(error, 'nunjucks'))
    );

  // replace CSS/JS
  const { cssBaseFileName, jsBaseFileName } = siteConfig;
  const cssBase = isProduction ? `${cssBaseFileName}.min` : cssBaseFileName;
  const jsBase = isProduction ? `${jsBaseFileName}.min` : jsBaseFileName;

  sourceFile = sourceFile.pipe(
    replaceHTML({
      css: `<link type="text/css" rel="stylesheet" href="/css/${cssBase}.css">`,
      js: `<script src="/js/${jsBase}.js"></script>`
    })
  );

  // is production build?
  // - minify html
  // - string & replace asset paths
  if (isProduction) {
    sourceFile = sourceFile
      .pipe(
        htmlmin({
          collapseWhitespace: true,
          removeComments: true
        })
      )
      .pipe(
        replace({
          patterns: [
            {
              match: /src="\/images\//g,
              replacement: `src="${siteConfig.baseUrl}/images/`
            },
            {
              match: /src="\/videos\//g,
              replacement: `src="${siteConfig.baseUrl}/videos/`
            }
          ]
        })
      );
  }

  // create supporting files
  // sourceFile.on('end', () => {
  //   console.log(chalk.black.bgBlue('------------'));
  //   console.log('categories', categories);
  //   console.log(chalk.black.bgBlue('------------'));
  // });

  return sourceFile.pipe(gulp.dest(`./${directory}`));
});

/** ***************************************************************************\
 * MARKDOWN => HTML
\**************************************************************************** */
gulp.task('markdown', () => {
  const defaultData = require('./src/html/default-data.json');

  let sourceFile = gulp
    .src('./src/html/pages/**/*.+(md|markdown)')
    .pipe(
      data(async (file) => {
        // get direct path of page
        const fileInfo = util.parseFilePath(file.path);

        const fileContent = fs.readFileSync(file.path, 'utf8');
        const pinkMatter = matter(fileContent);
        const pageData = pinkMatter.data;

        const { fullPath } = fileInfo;

        const combinedData = {
          ...defaultData,
          ...pageData,
          canonical: fullPath
        };

        // console.log('combinedData');
        // console.log(combinedData);

        const { category } = pageData;

        // use data for future module creation
        moduleCreation({ category, combinedData, fileInfo });

        return combinedData;
      }).on('error', pingError)
    )
    .pipe(
      nunjucksMd({
        path: ['./src/html/templates/']
      })
    );

  // replace CSS/JS
  const { cssBaseFileName, jsBaseFileName } = siteConfig;
  const cssBase = isProduction ? `${cssBaseFileName}.min` : cssBaseFileName;
  const jsBase = isProduction ? `${jsBaseFileName}.min` : jsBaseFileName;

  sourceFile = sourceFile.pipe(
    replaceHTML({
      css: `<link type="text/css" rel="stylesheet" href="/css/${cssBase}.css">`,
      js: `<script src="/js/${jsBase}.js"></script>`
    })
  );

  // minify html, if production build
  if (isProduction) {
    sourceFile = sourceFile.pipe(
      htmlmin({
        collapseWhitespace: true,
        removeComments: true
      })
    );
  }

  return sourceFile.pipe(gulp.dest(`./${directory}`));
});

/** ***************************************************************************\
 * HTML Replace
\**************************************************************************** */
gulp.task('html-replace', () => {
  // include extra css to the page?
  const extraClassKeys = Object.keys(this.extraCss);
  const extraClassObj = this.extraCss;

  const pagesArray = this.pages;

  // show right column
  const showRightColumnArray = this.showRightColumn;

  // include prism.js?
  const usePrismArray = this.usePrism;

  const dangleBase = '_base';

  // sort dateCreated chronologically
  const sortDate = (array) =>
    array.sort((a, b) => new Date(a.dateCreated) - new Date(b.dateCreated));

  Object.values(this.pagesChronological).map((categoryBlock) =>
    sortDate(categoryBlock)
  );

  const chronologicalArray = this.pagesChronological;

  return gulp
    .src(`./${directory}/**/*.html`)
    .pipe(
      // https://www.npmjs.com/package/gulp-replace
      gulpReplace('[[EXTRA CSS]]', function handleReplace() {
        // this.file is also available for regex replace
        // See https://github.com/gulpjs/vinyl#instance-properties for details on available properties
        const filePathArray = this.file.path
          .replace(this.file[dangleBase], '')
          .split('.');
        const subPath = filePathArray[0];
        const filePath = subPath.replace('/', '').replace(/\//g, '-');

        let replaceWith = '';

        if (extraClassKeys.includes(filePath)) {
          const { css } = extraClassObj[filePath];
          const addMin = isProduction ? '.min' : '';

          replaceWith = `<link type="text/css" rel="stylesheet" href="/css/${css}${addMin}.css">`;
        }

        return replaceWith;
      })
    )
    .pipe(
      gulpReplace('[[USE PRISM]]', function handleReplace() {
        const filePathArray = this.file.path
          .replace(this.file[dangleBase], '')
          .split('.');
        const subPath = filePathArray[0];
        const filePath = subPath.replace('/', '').replace(/\//g, '-');

        let replaceWith = '';

        if (usePrismArray.includes(filePath)) {
          const addMin = isProduction ? '.min' : '';

          replaceWith = `<link type="text/css" rel="stylesheet" href="/css/prism${addMin}.css"><script src="/js/prism-default${addMin}.js"></script>`;
        }

        return replaceWith;
      })
    )
    .pipe(
      gulpReplace('[[PREV/NEXT]]', function handleReplace() {
        const filePathArray = this.file.path
          .replace(this.file[dangleBase], '')
          .split('.');
        const subPath = filePathArray[0];

        // get prev/next posts in category group
        const { category } = pagesArray[subPath];
        const categoryGrouped = chronologicalArray[category];
        let indexFound = null;
        categoryGrouped.forEach((page, index) => {
          if (page.subPath === subPath) {
            indexFound = index;
          }
        });

        const prevIndex = indexFound - 1;
        let prevPost = null;
        if (indexFound !== 0) {
          prevPost = categoryGrouped[prevIndex];
        }

        const nextIndex = indexFound + 1;
        let nextPost = null;
        if (categoryGrouped.length > nextIndex) {
          nextPost = categoryGrouped[nextIndex];
        }

        let replaceWith = '';

        if (prevPost !== null || nextPost !== null) {
          let prevDiv = '';
          let nextDiv = '';

          if (prevPost !== null) {
            prevDiv = `<a class="prev-post" href="${prevPost.subPath}.html"><div class="prev-text">Prev</div><div class="prev-title">${prevPost.title}</div></a>`;
          }

          if (nextPost !== null) {
            nextDiv = `<a class="next-post" href="${nextPost.subPath}.html"><div class="next-text">Next</div><div class="next-title">${nextPost.title}</div></a>`;
          }

          const onlyNext = prevDiv === '' && nextDiv !== '' ? ' only-next' : '';

          replaceWith = `<div class="container-prev-next${onlyNext}">${prevDiv}${nextDiv}</div>`;
        }

        return replaceWith;
      })
    )
    .pipe(
      gulpReplace('[[RIGHT COLUMN]]', function handleReplace() {
        const filePathArray = this.file.path
          .replace(this.file[dangleBase], '')
          .split('.');
        const subPath = filePathArray[0];

        let replaceWith = '';

        if (showRightColumnArray.includes(subPath)) {
          const { dateCreated, dateUpdated = null } = pagesArray[subPath];
          const showCreated = dateCreated
            ? `<div class="date-created"><strong>Created:</strong><br />${dateCreated}</div>`
            : '';
          const showUpdated = dateUpdated
            ? `<div class="date-updated"><strong>Updated:</strong><br />${dateUpdated}</div>`
            : '';

          replaceWith = `<aside class="right-column">${showCreated}${showUpdated}</aside>`;
        }

        return replaceWith;
      })
    )
    .pipe(
      gulpReplace('<div class="container">', function handleReplace() {
        const filePathArray = this.file.path
          .replace(this.file[dangleBase], '')
          .split('.');
        const subPath = filePathArray[0];

        const replaceWith = showRightColumnArray.includes(subPath)
          ? '<div class="container has-right-column">'
          : '<div class="container">';

        return replaceWith;
      })
    )
    .pipe(gulp.dest(`./${directory}`));
});

gulp.task('dataStart', (done) => {
  // global buld stats
  this.categories = [];
  this.pages = [];
  this.pagesChronological = {};

  // page specific global
  this.extraCss = {};
  this.usePrism = [];
  this.showRightColumn = [];

  done();
});

gulp.task('dataEnd', (done) => {
  // console.log('---------------------');
  // console.log('categories', this.categories);
  // console.log('_+_+_+_+_+_+_+_+_+_+_');
  // console.log('---------------------');

  // console.log('page count', chalk.black.bgGreen(` ${this.pages.length} `));
  // console.log('_+_+_+_+_+_+_+_+_+_+_');
  // console.log('---------------------');

  // console.log('pages');
  // console.log(this.pages);
  // console.log('_+_+_+_+_+_+_+_+_+_+_');
  // console.log('---------------------');

  // console.log('pagesChronological::SORTED');
  // console.log(this.pagesChronological);
  // console.log('_+_+_+_+_+_+_+_+_+_+_');
  // console.log('---------------------');

  if (isProduction) {
    // create sitemap
    util.createSitemap(this.pages);
  }

  done();
});

/** ***************************************************************************\
 * MOVE FONTS
\**************************************************************************** */
gulp.task('fonts', () => {
  return gulp
    .src('./src/assets/fonts/**/*')
    .pipe(gulp.dest(`./${directory}/fonts`));
});

/** ***************************************************************************\
 * MOVE IMAGES
\**************************************************************************** */
gulp.task('images', () => {
  return gulp
    .src('./src/assets/images/**/*')
    .pipe(gulp.dest(`./${directory}/images`));
});

/** ***************************************************************************\
 * MOVE VIDEOS
\**************************************************************************** */
gulp.task('videos', () => {
  return gulp
    .src('./src/assets/videos/**/*')
    .pipe(gulp.dest(`./${directory}/videos`));
});

/** ***************************************************************************\
 * serve up static files (with hot-reload)
 *
 * watches for changes made to html(njk|markdown) + json + scss + js
 * hot-reloads browser(s) connected
\**************************************************************************** */
gulp.task('serve', () => {
  browserSync.init({
    server: {
      baseDir: `./${directory}/`,
      serveStaticOptions: {
        extensions: ['html']
      }
    },
    port: 8080,
    ui: {
      port: 8081
    },
    plugins: ['bs-console-qrcode']
  });

  // watches for any file change and re-compile
  gulp.watch(
    'src/html/**/*.(js|json|njk|md|markdown)',
    // { ignoreInitial: true },
    gulp.series(htmlTasks)
  );
  gulp.watch(
    'src/scss/**/*.scss',
    // { ignoreInitial: true },
    gulp.series('scss')
  );
  gulp.watch('src/js/**/*.js', { ignoreInitial: true }, gulp.series('js'));

  // watch for output change and hot-reload to show latest
  gulp.watch(`${directory}/**/*.(html|css|js)`).on('change', reload);
});

/** ***************************************************************************\
 * build tasks
 *
 * clean directories
 * compile: scss
 * compile: nunjucks
 * compile: markdown
 * move fonts/images/videos over
 *
 * start server (DEV ONLY)
\**************************************************************************** */
gulp.task('build', gulp.series(buildTasks));
