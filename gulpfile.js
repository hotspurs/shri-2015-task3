var gulp = require('gulp'),
    connect = require('gulp-connect'),
    concat = require('gulp-concat'),
    jade = require('gulp-jade'),
    newer = require('gulp-newer');


gulp.task('connect', function() {
  connect.server({
    root: 'build',
    livereload: true,
    port: 3000
  });
});

gulp.task('templates', function() {
  var YOUR_LOCALS = {};
  gulp.src('./src/views/*.jade')
    .pipe(jade({
      locals: YOUR_LOCALS,
      pretty: true
    }))
    .pipe(gulp.dest('./build/'))
});

gulp.task('html', function () {
  gulp.src('./build/*.html')
    .pipe(connect.reload());
});

gulp.task('build-watch', function () {
  gulp.src('./buld/public/build.*')
    .pipe(connect.reload());
});


var vendor = {
  css : [
      'src/vendor/normalize.css/normalize.css',
      'src/fonts/stylesheet.css'
  ],
  js : [
    'src/vendor/jquery-1.11.3.min.js',
    'src/vendor/jquery-ui.min.js',
    'src/vendor/_i-bem.js'
  ]
}

var application = {
  css : [
    'src/stylesheets/**'
  ],
  js : [
    'src/javascripts/main.js'
  ]
};

var js = ['src/vendor.js','src/application.js'];

gulp.task('vendor-css', function() {
  return gulp.src(vendor.css)
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest('src/'));
});

gulp.task('application-css', function() {
  return gulp.src(application.css)
    .pipe(concat('application.css'))
    .pipe(gulp.dest('src/'));
});


gulp.task('build-css', function() {
  gulp.src(['src/vendor.css', 'src/application.css'])
    .pipe(concat('build.css'))
    .pipe(gulp.dest('build/public/stylesheets'))
    .pipe(connect.reload());
});


gulp.task('vendorjs', function(){
	return gulp.src(vendor.js)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('./src/'));
})

gulp.task('applicationjs', function(){
  return gulp.src(application.js)
    .pipe(concat('application.js'))
    .pipe(gulp.dest('./src'));
})

gulp.task('build-js', ['vendorjs','applicationjs'], function(){
  return gulp.src(js)
    .pipe(concat('build.js'))
    .pipe(gulp.dest('./build/public'))
    .pipe(connect.reload());
})


gulp.task('images', function () {
  return gulp.src('src/images/{**/*,*}.{jpg,jpeg,png}')
      .pipe(newer('build/public/images'))
      .pipe(gulp.dest('build/public/images'));
});


gulp.task('fonts', function () {
  return gulp.src('src/fonts/{**/*,*}.{woff,ttf, svg, eot}')
      .pipe(gulp.dest('build/public/fonts'));
});


gulp.task('watch', function () {
  gulp.watch(['./build/*.html'], ['html']);
  gulp.watch(['./src/views/*.jade'], ['templates']);
  gulp.watch(['./buld/public/build.*'],['build-watch']);


  gulp.watch('src/images/{**/*,*}.{jpg,jpeg,png}', ['images']);
  gulp.watch('src/javascripts/**', ['applicationjs']);
  gulp.watch('src/stylesheets/**', ['application-css']);
  gulp.watch(vendor.js, ['vendorjs']);
  gulp.watch(['src/vendor.css','src/application.css'], ['build-css']);
  gulp.watch(['src/vendor.js','src/application.js'], ['build-js']);
});

gulp.task("default", ["connect","templates", 'images', 'fonts', 'vendor-css', 'application-css', 'build-css', 'build-js', 'watch']);