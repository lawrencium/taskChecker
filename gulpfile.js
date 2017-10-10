const gulp = require('gulp');
const jasmine = require('gulp-jasmine');
const inject = require('gulp-inject');
const uglify = require('gulp-uglify');
const jsonReplace = require('gulp-json-replace');
const del = require('del');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('default', ['dist'], () => {
  const watcher = gulp.watch(['src/js/**/*.js'], ['bundle']);
  watcher.on('change', function (event) {
    console.log('File ' + event.path + ' was ' + event.type + ', rebundling...');
  });
});

gulp.task('test', () => {
  return gulp.src('test/**/*[sS]pec.js')
    .pipe(jasmine());
});

gulp.task('chrome', () => {
  return gulp.src(['config/key.pem', 'manifest.json'])
    .pipe(jsonReplace({
      src: 'config/config.json',
      identify: '__taskChecker__'
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('static', () => {
  return gulp.src('public/**/*')
    .pipe(gulp.dest('dist/public'));
});

gulp.task('bundle', () => {
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

gulp.task('build', () => {
  return gulp.src('src/background.html')
    .pipe(inject(gulp.src('src/js/bundle.js', {read: false})))
    .pipe(gulp.dest('src'));
});

gulp.task('dist', ['chrome', 'static', 'bundle', 'build'], () => {
  return gulp.src('src/**/*.html')
    .pipe(gulp.dest('dist/src'));
});


gulp.task('clean', () => {
  return del('dist/**', {force: true});
});