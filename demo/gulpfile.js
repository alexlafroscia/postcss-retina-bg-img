var resolve = require('path').resolve;
var gulp = require('gulp');
var postcss = require('gulp-postcss');
var reporter = require('postcss-reporter');
var retinaBgImg = require('../build/lib/postcss-plugin');

gulp.task('default', function() {
  return gulp.src('./styles/*.css')
    .pipe(postcss([
      retinaBgImg({
        assetDirectory: resolve(__dirname, '../build/tests/fixtures')
      }),
      reporter({
        clearMessages: true
      })
    ]))
    .pipe(gulp.dest('./output'));
});
