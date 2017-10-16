const gulp = require('gulp');
const karma = require('karma').Server;
const jsonReplace = require('gulp-json-replace');
const del = require('del');
const inject = require('gulp-inject');
const uglify = require('gulp-uglify');
const webpack = require('webpack');
const eslint = require('gulp-eslint');
const bump = require('gulp-bump');
const minimist = require('minimist');
const gutil = require('gulp-util');

const config = {
  testDirectory: ['test/**/*[sS]pec.js'],
  keyPath: 'config/key.pem',
  manifest: 'manifest.json',
  manifestConfig: 'config/config.json',
  staticFileDirectories: 'public/**/*',

};

const commandLineArguments = minimist(process.argv.slice(2));

gulp.task('clean', () => {
  return del(['dist/**'], {force: true});
});

gulp.task('lint', () => {
  return gulp.src(['src/**/*.js', 'test/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test', ['lint'], done => {
  return test({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done)
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

gulp.task('build', ['lint'], (done) => {
  return startWebpackBundle(false, done);
});

gulp.task('inject-html', ['config', 'static', 'build'], () => {
  return gulp.src('src/background.html')
    .pipe(inject(gulp.src('dist/src/js/bundle.js', {read: false}), {ignorePath: 'dist/'}))
    .pipe(gulp.dest('dist/src'));
});

gulp.task('bump-version', function () {
  if (!commandLineArguments.type) {
    throw Error('Need to specify bump type: `--type major|minor|patch`');
  }
  return gulp.src(['./package.json', './manifest.json'])
    .pipe(bump({type: commandLineArguments.type.toLowerCase()}).on('error', gutil.log))
    .pipe(gulp.dest('./'));
});

gulp.task('dist', ['bump-version', 'inject-html'], () => {
  gulp.src(config.keyPath)
    .pipe(gulp.dest('dist'));
});

gulp.task('dev', ['inject-html'], () => {
  return startWebpackBundle(true);
});

gulp.task('karma-server', done => {
  return test({
    configFile: __dirname + '/karma.conf.js',
    singleRun: false,
    autoWatch: true
  }, done)
});

function test(options, done) {
  return karma.start(options, done);
}

function startWebpackBundle(enableWatch, done) {
  const webpackConfig = require('./webpack.config.js');
  if (enableWatch) {
    webpackConfig.watch = true;
  }
  return webpack(webpackConfig, (err, stats) => {
    if (err) {
      throw new gutil.PluginError("webpack", err);
    }
    console.log("[webpack]", stats.toString({}));

    gulp.src('dist/src/js/bundle.js')
      .pipe(uglify())
      .pipe(gulp.dest('dist/src/js/'));

    if (!enableWatch) {
      done();
    }
  });
}