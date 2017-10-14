var gulp = require('gulp');
var karma = require('karma').Server;
var jsonReplace = require('gulp-json-replace');
var del = require('del');
var inject = require('gulp-inject');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var fs = require('fs');
var watchify = require('watchify');
var jshint = require('gulp-jshint');

var config = {
  testDirectory: ['test/**/*[sS]pec.js'],
  keyPath: 'config/key.pem',
  manifest: 'manifest.json',
  manifestConfig: 'config/config.json',
  staticFileDirectories: 'public/**/*',

};

gulp.task('clean', function () {
  return del(['dist/**'], {force: true});
});

gulp.task('jshint-src', function () {
  return gulp.src('src/**/*.js')
    .pipe(jshint({esversion: 6}))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('jshint-test', function () {
  return gulp.src(['src/**/*.js', 'test/**/*.js'])
    .pipe(jshint({esversion: 6, expr: true}))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('jshint', ['jshint-src', 'jshint-test']);

gulp.task('test', ['jshint'], function (done) {
  return karma.start({
    configFile: process.cwd() + '/karma.conf.js'
  }, done);
});

gulp.task('config', function () {
  return gulp.src(config.manifest)
    .pipe(jsonReplace({
      src: config.manifestConfig,
      identify: '__taskChecker__'
    }))
    .pipe(gulp.dest('dist'))
});

gulp.task('static', function () {
  return gulp.src(config.staticFileDirectories)
    .pipe(gulp.dest('dist/public'))
});

gulp.task('build', ['jshint'], function () {
  var bundler = browserify({
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

gulp.task('bundle', ['config', 'static', 'build'], function () {
  return gulp.src('src/background.html')
    .pipe(inject(gulp.src('dist/src/js/bundle.js', {read: false}), {ignorePath: 'dist/'}))
    .pipe(gulp.dest('dist/src'));
});

gulp.task('dist', ['bundle'], function () {
  gulp.src(config.keyPath)
    .pipe(gulp.dest('dist'));
});

gulp.task('dev', ['bundle'], function () {
  var b = browserify({
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