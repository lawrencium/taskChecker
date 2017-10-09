const gulp = require('gulp');
const jasmine = require('gulp-jasmine');
const inject = require('gulp-inject');
const bowerFiles = require('main-bower-files');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const jsonReplace = require('gulp-json-replace');
const del = require('del');

gulp.task('test', () => {
  gulp.src('test/**/*[sS]pec.js')
    .pipe(jasmine());
});

gulp.task('build', () => {
  gulp.src('src/background.html')
    .pipe(inject(gulp.src(bowerFiles(), {read: false}), {name: 'bower'}))
    .pipe(inject(gulp.src('src/js/**/*.js', {read: false})))
    .pipe(gulp.dest('src'));
});

gulp.task('dist', ['clean', 'build'], () => {
  gulp.src(['config/key.pem', 'manifest.json'])
    .pipe(jsonReplace({
      src: 'config/config.json',
      identify: '__taskChecker__'
    }))
    .pipe(gulp.dest('dist'));
  gulp.src('public/**/*')
    .pipe(gulp.dest('dist/public'));
  gulp.src('bower_components/**/*')
    .pipe(gulp.dest('dist/bower_components'));
  gulp.src('src/**/*.js')
    .pipe(babel({presets: ['es2015']}))
    .pipe(uglify())
    .pipe(gulp.dest('dist/src'));
  gulp.src('src/**/*.html')
    .pipe(gulp.dest('dist/src'));
});

gulp.task('clean', function () {
  return del('dist/**', {force: true});
});