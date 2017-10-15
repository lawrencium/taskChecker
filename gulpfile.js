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
const eslint = require('gulp-eslint');

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

gulp.task('lint', () => {
  return gulp.src(['src/**/*.js', 'test/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('karma-test', test);

gulp.task('test', ['lint'], test);

gulp.task('test-no-lint', ['karma-test']);

function test(done) {
  return karma.start({
    configFile: process.cwd() + '/karma.conf.js'
  }, done);
}

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