const gulp = require('gulp');
const karma = require('karma').Server;
const del = require('del');
const inject = require('gulp-inject');
const webpack = require('webpack');
const eslint = require('gulp-eslint');
const bump = require('gulp-bump');
const minimist = require('minimist');
const gutil = require('gulp-util');
const runSequence = require('run-sequence');
const exec = require('child_process').exec;

const config = {
  testDirectory: ['test/**/*[sS]pec.js'],
  manifest: 'manifest.json',
  staticFileDirectories: 'public/images/*',

};

const commandLineArguments = minimist(process.argv.slice(2));

gulp.task('clean', () => {
  return del(['dist/**'], { force: true });
});

gulp.task('lint', () => {
  return gulp.src(['src/**/*.{js,jsx}', 'test/**/*.{js,jsx}?'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test', ['lint'], (done) => {
  return test({
    configFile: `${__dirname}/karma.conf.js`,
    singleRun: true,
  }, done);
});

gulp.task('config', (done) => {
  return exec('mkdir dist', (err) => {
    console.log('mkdir dist', err);
    return exec('sed "s/__taskChecker__clientId/${CLIENT_ID}/g" manifest.json > dist/manifest.json', (err) => {
      console.log('sed "s/__taskChecker__clientId/${CLIENT_ID}/g" manifest.json > dist/manifest.json', err);
      done();
    });
  });
});

gulp.task('static', () => {
  return gulp.src(config.staticFileDirectories)
    .pipe(gulp.dest('dist/public/images'));
});

gulp.task('build', ['lint'], (done) => {
  return startWebpackBundle(false, done);
});

gulp.task('package', (done) => {
  return runSequence(
    'config',
    'static',
    'build',
    () => {
      gulp.src('src/popup.html')
        .pipe(inject(gulp.src('dist/src/js/popup.bundle.js', { read: false }), { ignorePath: 'dist/' }))
        .pipe(inject(gulp.src('dist/src/styles/styles.css', { read: false }), { ignorePath: 'dist/' }))
        .pipe(gulp.dest('dist/src'));

      gulp.src('src/background.html')
        .pipe(inject(gulp.src('dist/src/js/background.bundle.js', { read: false }), { ignorePath: 'dist/' }))
        .pipe(gulp.dest('dist/src'));
      done();
    },
  );
});

gulp.task('bump-version', () => {
  if (!commandLineArguments.type) {
    throw Error('Need to specify bump type: `--type major|minor|patch`');
  }
  return gulp.src(['./package.json', './manifest.json'])
    .pipe(bump({ type: commandLineArguments.type.toLowerCase() }).on('error', gutil.log))
    .pipe(gulp.dest('./'));
});

gulp.task('dist', () => {
  runSequence(
    'clean',
    'bump-version',
    'package',
  );
});

gulp.task('dev', () => {
  runSequence(
    'package',
    () => {
      exec('jq ".key=\\\"${CLIENT_KEY}\\\"" dist/manifest.json > tmp && mv tmp dist/manifest.json', (err) => {
        console.log('jq ".key=\"${CLIENT_KEY}\"" dist/manifest.json', err);
      });
      return startWebpackBundle(true);
    },
  );
});

gulp.task('karma-server', (done) => {
  return test({
    configFile: `${__dirname}/karma.conf.js`,
    singleRun: false,
    autoWatch: true,
  }, done);
});

function test(options, done) {
  gutil.log('Setting timezone to UTC so that tests that require mock time will run correctly');
  process.env.TZ = 'Europe/London';
  return karma.start(options, done);
}

function startWebpackBundle(enableWatch, done) {
  const webpackConfig = require('./webpack.config.js');
  if (enableWatch) {
    webpackConfig.watch = true;
  }
  return webpack(webpackConfig, (err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack', err);
    }
    console.log('[webpack]', stats.toString({}));

    gulp.src('dist/src/js/bundle.js')
      .pipe(gulp.dest('dist/src/js/'));

    if (!enableWatch) {
      done();
    }
  });
}
