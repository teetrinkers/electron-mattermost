'use strict';

var gulp = require('gulp');
var prettify = require('gulp-jsbeautifier');
var electron = require('electron-connect').server.create({
  path: './src'
});
var packager = require('electron-packager');

var sources = ['**/*.js', '**/*.css', '**/*.html', '!**/node_modules/**', '!release/**'];

gulp.task('prettify', ['sync-meta'], function() {
  gulp.src(sources)
    .pipe(prettify({
      html: {
        indentSize: 2
      },
      css: {
        indentSize: 2
      },
      js: {
        indentSize: 2,
        braceStyle: 'end-expand'
      }
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('serve', function() {
  var options = ['--livereload'];
  electron.start(options);
  gulp.watch(sources, function() {
    electron.broadcast('stop');
    electron.restart(options);
  });
});

gulp.task('package', ['sync-meta'], function() {
  var packageJson = require('./src/package.json');
  packager({
    dir: './src',
    name: 'mattermost',
    platform: ['win32', 'darwin', 'linux'],
    arch: 'x64',
    version: '0.33.6',
    out: './release',
    icon: 'mattermost',
    prune: true,
    overwrite: true,
    'app-version': packageJson.version
  }, function(err, appPath) {
    if (err) {
      console.log(err);
    }
    else {
      console.log('done');
    }
  });
});

gulp.task('sync-meta', function() {
  var appPackageJson = require('./src/package.json');
  var packageJson = require('./package.json');
  appPackageJson.name = packageJson.name;
  appPackageJson.version = packageJson.version;
  appPackageJson.description = packageJson.description;
  appPackageJson.author = packageJson.author;
  appPackageJson.license = packageJson.license;
  var fs = require('fs');
  fs.writeFileSync('./src/package.json', JSON.stringify(appPackageJson, null, '  ') + '\n');
});
