const browserSync = require('browser-sync').create();
const chalk = require('chalk');
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const data = require('gulp-data');
const fs = require('fs');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const notifier = require('node-notifier');
const nunjucksRender = require('gulp-nunjucks-render');
const path = require('path');
const rename = require('gulp-rename');
const sass = require('gulp-sass');

// grab the configuration file
const siteConfig = require('./site-config.json');

// breakout reload for usage after file changes detected
const reload = browserSync.reload;

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
// shared tasks
const sharedTasks = ['clean', 'scss', 'compileHTML', 'fonts'];

// dev ONLY tasks
const devTasks = ['serve'];

// production ONLY tasks
const prodTasks = ['notify-completed'];

// final build tasks
const buildTasks = isProduction
  ? sharedTasks.concat(prodTasks)
  : sharedTasks.concat(devTasks);

/******************************************************************************\
 * HELPER FUNCTIONS
\******************************************************************************/
function lineStretchToEnd(msg, lineSep) {
  const spaceNeeded = lineSep.length - msg.length;
  let spacer = '';

  // if space is needed in message
  if (spaceNeeded > 0) {
    const spaceArray = Array.from(Array(spaceNeeded).keys());
    spacer = spaceArray.map(item => ' ').join('');
  }

  return `${msg}${spacer}`;
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/******************************************************************************\
 * NOTIFY COMPLETED BUILD
\******************************************************************************/
gulp.task('notify-completed', done => {
  const lineSep =
    ' --------------------------------------------------------------------- ';
  const modeUpper = envMode.toUpperCase();
  const msg1 = lineStretchToEnd(` Completed build: ${modeUpper}`, lineSep);
  const msg2 = lineStretchToEnd(` in directory: ./${directory}/`, lineSep);
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
          const origSize = formatBytes(details.stats.originalSize);
          const miniSize = formatBytes(details.stats.minifiedSize);

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
 * NUNJUCKS => HTML
\******************************************************************************/
gulp.task('compileHTML', () => {
  const defaultData = require('./src/html/default-data.json');
  const categories = [];

  let sourceFile = gulp
    .src('./src/html/pages/**/*.nunjucks')
    .pipe(
      data(file => {
        // get direct path of page
        const filePath = path.dirname(file.path);
        const pathArrBase = filePath.split('/src/html/');
        pathArrBase.shift();
        const pathArr = pathArrBase[0].split('/');
        pathArr.shift();
        const subDirPath = pathArr[0] === undefined ? '' : `${pathArr[0]}/`;

        // set path to json file, specific to the HTML page we are compiling!
        const fileName = path.basename(file.path, '.nunjucks');
        const pathToFile = `./src/html/data/${subDirPath}${fileName}.json`;

        // delete cache, we always want the latest json data...
        delete require.cache[require.resolve(pathToFile)];

        // log that we are grabbing data
        console.log('grabbing data from: ' + pathToFile);

        // grab specific page data
        const pageData = require(pathToFile);
        console.log('pageData', pageData);
        const combinedData = {
          ...defaultData,
          ...pageData
        };

        // add category
        if (pageData.category in categories) {
          categories[pageData.category].push(`${subDirPath}${fileName}.html`);
        } else {
          categories[pageData.category] = [`${subDirPath}${fileName}.html`];
        }

        // set canonical
        pageData.canonical = `${siteConfig.baseUrl}/${subDirPath}${fileName}.html`;

        return pageData;
      }).on('error', pingError)
    )
    .pipe(
      nunjucksRender({
        path: './src/html/templates'
      }).on('error', error => pingError(error, 'nunjucks'))
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

  // create supporting files
  sourceFile.on('end', () => {
    console.log(chalk.black.bgBlue('------------'));
    console.log('categories', categories);
    console.log(chalk.black.bgBlue('------------'));
  });

  return sourceFile.pipe(gulp.dest(`./${directory}`));
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
 * serve up static files (with hot-reload)
 *
 * watches for changes made to html(nunjucks)/scss/js
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
  gulp.watch('./src/html/**/*.(json|nunjucks)', gulp.series('compileHTML'));
  gulp.watch('./src/scss/**/*.scss', gulp.series('scss'));

  // watch for output change and hot-reload to show latest
  gulp.watch(`./${directory}/**/*.(html|css)`).on('change', reload);
});

/******************************************************************************\
 * build tasks
 *
 * clean directories
 * compile: scss
 * compile: nunjucks
 * move fonts over
 *
 * start server (DEV ONLY)
\******************************************************************************/
gulp.task('build', gulp.series(buildTasks));

/******************************************************************************\
 * Ping developer that something went wrong
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
