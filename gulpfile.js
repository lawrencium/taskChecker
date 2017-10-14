const gulp = require('gulp');
const karma = require('karma').Server;
const jsonReplace = require('gulp-json-replace');
const del = require('del');
const inject = require('gulp-inject');
const uglify = require('gulp-uglify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const fs = require('fs');
const watchify = require('watchify');
const jshint = require('gulp-jshint');

const config = {
  testDirectory: ['test/**/*[sS]pec.js'],
  keyPath: 'config/key.pem',
  manifest: 'manifest.json',
  manifestConfig: 'config/config.json',
  staticFileDirectories: 'public/**/*',

};

gulp.task('clean', () => {
  return del(['dist/**'], {force: true});
});

gulp.task('jshint-src', () => {
  return gulp.src('src/**/*.js')
    .pipe(jshint({esversion: 6}))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('jshint-test', () => {
  return gulp.src(['src/**/*.js', 'test/**/*.js'])
    .pipe(jshint({esversion: 6, expr: true}))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('jshint', ['jshint-src', 'jshint-test']);

gulp.task('test', ['jshint'], (done) => {
  return karma.start({
    configFile: process.cwd() + '/karma.conf.js'
  }, done);
});

gulp.task('config', () => {
  return gulp.src(config.manifest)
    .pipe(jsonReplace({
      src: config.manifestConfig,
      identify: '__taskChecker__'
    }))
    .pipe(gulp.dest('dist'))
});

gulp.task('static', () => {
  return gulp.src(config.staticFileDirectories)
    .pipe(gulp.dest('dist/public'))
});

gulp.task('build', ['jshint'], () => {
  const bundler = browserify({
    entries: 'src/js/checkTasks.js',
    debug: true
  });

  return bundler.bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: false}))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/src/js/'));

});

gulp.task('bundle', ['config', 'static', 'build'], () => {
  return gulp.src('src/background.html')
    .pipe(inject(gulp.src('dist/src/js/bundle.js', {read: false}), {ignorePath: 'dist/'}))
    .pipe(gulp.dest('dist/src'));
});

gulp.task('dist', ['bundle'], () => {
  gulp.src(config.keyPath)
    .pipe(gulp.dest('dist'));
});

gulp.task('dev', ['bundle'], () => {
  const b = browserify({
    entries: ['src/js/checkTasks.js'],
    cache: {},
    packageCache: {},
    plugin: [watchify]
  });
  b.on('update', bundle);
  bundle();

  function bundle() {
    b.bundle().pipe(fs.createWriteStream('dist/src/js/bundle.js'));
  }
});