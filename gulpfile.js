const browserSync = require('browser-sync').create();
const chalk = require('chalk');
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const data = require('gulp-data');
const fs = require('fs');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const matter = require('gray-matter');
const notifier = require('node-notifier');
const nunjucksMd = require('gulp-nunjucks-md');
const nunjucksRender = require('gulp-nunjucks-render');
const path = require('path');
const rename = require('gulp-rename');
const replace = require('gulp-replace-task');
const replaceHTML = require('gulp-html-replace');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');

// grab the configuration file
const siteConfig = require('./site-config.json');

// import utility functions
const util = require('./utility-functions');

// breakout reload for usage after file changes detected
const reload = browserSync.reload;

// const sep = new Array(10).join('+-');
// console.log('sep', sep);

/******************************************************************************\
 * ENVIRONMENT HANDLING
\******************************************************************************/
const envMode = process.env.NODE_ENV;
const isProduction = process.env.NODE_ENV === 'prod';

// a little high level configuration
const rootDirs = {
  dev: 'static_dev',
  prod: 'static_prod'
};
const directory = rootDirs[envMode];

/******************************************************************************\
 * TASK HANDLING DEPENDING ON ENVIRONMENT
\******************************************************************************/
// html tasks
const htmlTasks = ['dataStart', 'nunjucks', 'markdown', 'dataEnd'];

// asset tasks
const assetTasks = ['fonts', 'images', 'videos'];

// shared tasks
const sharedTasks = ['clean', 'scss', 'js', ...htmlTasks, ...assetTasks];

// dev ONLY tasks
const devTasks = ['serve'];

// production ONLY tasks
const prodTasks = ['notify-completed'];

// final build tasks
const buildTasks = isProduction
  ? sharedTasks.concat(prodTasks)
  : sharedTasks.concat(devTasks);

/******************************************************************************\
 * NOTIFY COMPLETED BUILD
\******************************************************************************/
gulp.task('notify-completed', done => {
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

/******************************************************************************\
 * CLEAN STATIC DIRECTORIES
\******************************************************************************/
gulp.task('clean', () => {
  return del([`${rootDirs.dev}/**/*`, `${rootDirs.prod}/**/*`]);
});

/******************************************************************************\
 * SCSS => CSS
\******************************************************************************/
gulp.task('scss', () => {
  // grab all scss and compile into css
  let sourceFile = gulp
    .src('./src/scss/**/*.scss')
    .pipe(sass().on('error', error => pingError(error, 'scss')));

  // minify css, if production build
  if (isProduction) {
    // clean css
    // https://github.com/jakubpawlowicz/clean-css#compatibility-modes
    console.log(chalk.black.bgBlue('-- CSS Files'));
    const sourceFileMinified = gulp
      .src('./src/scss/**/*.scss')
      .pipe(sass().on('error', error => pingError(error, 'scss')))
      .pipe(
        cleanCSS({ compatibility: '*' }, details => {
          const origSize = util.formatBytes(details.stats.originalSize);
          const miniSize = util.formatBytes(details.stats.minifiedSize);

          console.log(
            `${details.name}: ${chalk.black.red(
              origSize
            )} => ${chalk.black.bgGreen(miniSize)}`
          );
        })
      )
      .pipe(
        rename(path => {
          path.basename += '.min';
        })
      )
      .pipe(gulp.dest(`./${directory}/css`))
      .on('end', () => {
        console.log(chalk.black.bgBlue('------------'));
      });
  }

  return sourceFile.pipe(gulp.dest(`./${directory}/css`));
});

/******************************************************************************\
 * javascript
\******************************************************************************/
gulp.task('js', () => {
  // grab all js
  let sourceFile = gulp.src('./src/js/**/*.js');

  if (isProduction) {
    // minify js & rename
    sourceFile = sourceFile.pipe(uglify()).pipe(
      rename(path => {
        path.basename += '.min';
      })
    );
  }

  return sourceFile.pipe(gulp.dest(`./${directory}/js`));
});

/******************************************************************************\
 * NUNJUCKS => HTML
\******************************************************************************/
gulp.task('nunjucks', () => {
  const defaultData = require('./src/html/default-data.json');

  let sourceFile = gulp
    .src('./src/html/pages/**/*.njk')
    .pipe(
      data(file => {
        // get direct path of page
        const fileInfo = util.parseFilePath(file.path);

        // set path to json file, specific to the HTML page we are compiling!
        const pathToFile = `./src/html/data${fileInfo.subPath}.json`;

        // delete cache, we always want the latest json data...
        delete require.cache[require.resolve(pathToFile)];

        // log that we are grabbing data
        console.log('grabbing data from: ' + pathToFile);

        // grab specific page data
        const pageData = require(pathToFile);
        const combinedData = {
          ...defaultData,
          ...pageData
        };
        // console.log('pageData', pageData);
        // console.log('combinedData', combinedData);

        // add category
        if (pageData.category in this.categories) {
          this.categories[pageData.category].push(`${fileInfo.subPath}.html`);
        } else {
          this.categories[pageData.category] = [`${fileInfo.subPath}.html`];
        }

        // set canonical
        combinedData.canonical = fileInfo.fullPath;

        // add to pages
        this.pages.push(fileInfo.fullPath);

        return combinedData;
      }).on('error', pingError)
    )
    .pipe(
      nunjucksRender({
        path: './src/html/templates'
      }).on('error', error => pingError(error, 'nunjucks'))
    );

  // replace CSS/JS
  const baseFile = isProduction ? 'base.min' : 'base';
  sourceFile = sourceFile.pipe(
    replaceHTML({
      css: `<link type="text/css" rel="stylesheet" href="/css/${baseFile}.css">`,
      js: `<script src="/js/${baseFile}.js"></script>`
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

/******************************************************************************\
 * MARKDOWN => HTML
\******************************************************************************/
gulp.task('markdown', () => {
  const defaultData = require('./src/html/default-data.json');

  let sourceFile = gulp
    .src('./src/html/pages/**/*.+(md|markdown)')
    .pipe(
      data(async file => {
        // get direct path of page
        const fileInfo = util.parseFilePath(file.path);

        const fileContent = fs.readFileSync(file.path, 'utf8');
        const pinkMatter = matter(fileContent);
        const pageData = pinkMatter.data;

        // add category
        if (pageData.category in this.categories) {
          this.categories[pageData.category].push(`${fileInfo.subPath}.html`);
        } else {
          this.categories[pageData.category] = [`${fileInfo.subPath}.html`];
        }

        const combinedData = {
          ...defaultData,
          ...pageData,
          canonical: fileInfo.fullPath
        };
        // console.log('combinedData');
        // console.log(combinedData);

        // add to pages
        this.pages.push(fileInfo.fullPath);

        return combinedData;
      }).on('error', pingError)
    )
    .pipe(
      nunjucksMd({
        path: ['./src/html/templates/']
      })
    );

  // replace CSS/JS
  const baseFile = isProduction ? 'base.min' : 'base';
  sourceFile = sourceFile.pipe(
    replaceHTML({
      css: `<link type="text/css" rel="stylesheet" href="/css/${baseFile}.css">`,
      js: `<script src="/js/${baseFile}.js"></script>`
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

gulp.task('dataStart', done => {
  this.categories = [];
  this.pages = [];

  done();
});

gulp.task('dataEnd', done => {
  console.log('---------------------');
  // console.log('categories', this.categories);
  // console.log('_+_+_+_+_+_+_+_+_+_+_');
  // console.log('---------------------');

  console.log('page count', chalk.black.bgGreen(` ${this.pages.length} `));
  console.log('_+_+_+_+_+_+_+_+_+_+_');
  console.log('---------------------');

  console.log('pages');
  console.log(this.pages);
  console.log('_+_+_+_+_+_+_+_+_+_+_');
  console.log('---------------------');

  if (isProduction) {
    // create sitemap
    util.createSitemap(this.pages);
  }

  done();
});

/******************************************************************************\
 * MOVE FONTS
\******************************************************************************/
gulp.task('fonts', () => {
  return gulp
    .src('./src/assets/fonts/**/*')
    .pipe(gulp.dest(`./${directory}/fonts`));
});

/******************************************************************************\
 * MOVE IMAGES
\******************************************************************************/
gulp.task('images', () => {
  return gulp
    .src('./src/assets/images/**/*')
    .pipe(gulp.dest(`./${directory}/images`));
});

/******************************************************************************\
 * MOVE VIDEOS
\******************************************************************************/
gulp.task('videos', () => {
  return gulp
    .src('./src/assets/videos/**/*')
    .pipe(gulp.dest(`./${directory}/videos`));
});

/******************************************************************************\
 * serve up static files (with hot-reload)
 *
 * watches for changes made to html(njk|markdown) + json + scss + js
 * hot-reloads browser(s) connected
\******************************************************************************/
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
    './src/html/**/*.+(js|json|njk|md|markdown)',
    gulp.series(htmlTasks)
  );
  gulp.watch('./src/scss/**/*.scss', gulp.series('scss'));
  gulp.watch('./src/js/**/*.js', gulp.series('js'));

  // watch for output change and hot-reload to show latest
  gulp.watch(`./${directory}/**/*.(html|css|js)`).on('change', reload);
});

/******************************************************************************\
 * build tasks
 *
 * clean directories
 * compile: scss
 * compile: nunjucks
 * compile: markdown
 * move fonts/images/videos over
 *
 * start server (DEV ONLY)
\******************************************************************************/
gulp.task('build', gulp.series(buildTasks));

/******************************************************************************\
 * notify developer at the os level, an error has occurred 
\******************************************************************************/
pingError = (error, type) => {
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
