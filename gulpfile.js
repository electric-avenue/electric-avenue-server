//Include gulp
var gulp = require('gulp');

//Include Our Plugins
var jsdoc = require('gulp-jsdoc');
var jasmine = require('gulp-jasmine');
var nodemon = require('gulp-nodemon');
var jshint = require('gulp-jshint');



var testFiles = [
  'server/**/*.js',
  'test/**/**.js'
];

gulp.task('lint', function(){
  gulp.src(testFiles)
  .pipe(jshint('.jshintrc'))
  .pipe(jshint.reporter('default', {verbose: true}))
  .pipe(jshint.reporter('fail'))
});

gulp.task('test', function(){
  return gulp.src(testFiles)
      .pipe(jasmine());
});

gulp.task('docs', function() {
  gulp.src(['server/*.js', 'server/**/*.js'])
  .pipe(jsdoc('./docs'));
});

gulp.task('develop', function(){
  nodemon({script:'./server/app.js', ext: 'js',})
    .on('change', ['lint'])
    .on('restart', function(){
      console.log('restarted server!');
    })
})

gulp.task('default', ['lint','develop']);

gulp.task('ci', ['lint','test',]);
