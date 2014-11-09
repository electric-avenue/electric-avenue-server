//Include gulp
var gulp = require('gulp');

//Include Our Plugins
var jasmine = require('gulp-jasmine');
// var karma = require('gulp-karma');

var testFiles = [
  'server/**/*.js',
  'test/**/*.js'
];

gulp.task('test', function(){
  return gulp.src(testFiles)
      .pipe(jasmine());
});

gulp.task('default', function(){
  gulp.src(testFiles)
  .pipe(karma({
    configFile: 'karma.conf.js',
    action: 'watch'
  }));
});

