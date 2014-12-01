var gulp = require('gulp');

var browserify = require('browserify');
//var del = require('del');
var reactify = require('reactify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
//var wiredep = require('wiredep').stream;
var mainBowerFiles = require('main-bower-files');
var sass = require('gulp-ruby-sass');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var minifycss = require('gulp-minify-css');
var connect = require('gulp-connect');
var rm = require('gulp-rimraf');
var filter = require('gulp-filter');
var inject = require('gulp-inject');
var handlebars = require('gulp-handlebars');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var concat = require('gulp-concat');


var devDir = './app';
var srcDir = './src';
var prodDir = './dist';

var paths = {
  html : {
    src  : srcDir + '/index.html',
    dev  : devDir,
    prod : prodDir
  },
  style : {
    src  : srcDir + '/css/*.sass',
    dev  : devDir + '/css',
    prod : prodDir + '/css'
  },

  templates : {
    src  : srcDir + '/templates/*.hbs',
    dev  : devDir + '/js',
    prod : prodDir + '/js',
    name : "templates.js"
  },
  js: {
    src : srcDir + 'js/*.js'
  },
  main : {
    name : 'main.js',
    src  : srcDir + '/js/main.js',
    dev  : devDir +'/js',
    prod : prodDir + '/js'
  },
  ele: {
    src : srcDir + '/jsx/*.jsx'
  }
};


gulp.task('run',[ 'html-dev', 'style-dev', 'main-dev', 'templates-dev', 'watch'], function () {
  connect.server({
    root: [ devDir ],
    port: 8000,
    livereload: true
  });
});


// Rerun the task when a file changes
gulp.task('watch', ['clean-dev'], function() {
  gulp.watch(paths.html.src, ['html-dev']);
  gulp.watch(paths.style.src, ['style-dev']);
  gulp.watch(paths.main.src, ['main-dev']);
  gulp.watch(paths.ele.src,  ['main-dev']);
});




gulp.task('clean-dev', function() {
  return gulp.src( devDir + "/*" )
   .pipe( rm ())
   .pipe( gulp.dest( devDir ));
});





gulp.task('html-dev', [ 'jsdep-dev', 'cssdep-dev', 'style-dev','main-dev', 'templates-dev' ],function () {
  var target = gulp.src(paths.html.src);
  var imp = gulp.src(devDir + "/js/jquery.js", {read: false});
  var sources = gulp.src([devDir + "/js/*.js", "!" + devDir + "/js/jquery.js", devDir + "/css/*.css"], {read: false});
  return target
  .pipe(inject(imp,{starttag: '<!-- inject:head:{{ext}} -->', relative: true, ignorePath: '../app/'}))
  .pipe(inject(sources, {relative: true, ignorePath: '../app/'}))
  .pipe(gulp.dest(paths.html.dev));

});

gulp.task('jsdep-dev', ['clean-dev'],function(){
  var jsFilter = filter("*.js");
  return gulp.src(mainBowerFiles())
   .pipe( jsFilter )
   .pipe(gulp.dest(devDir + "/js"));
});


gulp.task('cssdep-dev', ['clean-dev'], function(){
  var cssFilter = filter("*.css");
  return gulp.src(mainBowerFiles())
  .pipe( cssFilter )
  .pipe(gulp.dest(devDir + "/css"));
});


gulp.task('main-dev', ['clean-dev'], function() {
  // Browserify/bundle the JS.
  return browserify(paths.main.src)
   .transform(reactify)
   .bundle()
   .pipe(source(paths.main.name))
   .pipe(gulp.dest( paths.main.dev));
});


gulp.task('style-dev',['clean-dev'], function () {
  return gulp.src(paths.style.src)
  .pipe(sass({style:'expanded'}))
  .pipe(gulp.dest(paths.style.dev))

});

gulp.task('templates-dev',['clean-dev'], function(){
  gulp.src( paths.templates.src )
  .pipe(handlebars())
  .pipe(wrap('Handlebars.template(<%= contents %>)'))
  .pipe(declare({
    namespace: 'App.templates',
    noRedeclare: true, // Avoid duplicate declarations
  }))
  .pipe(concat( paths.templates.name ))
  .pipe(gulp.dest( paths.templates.dev ));
});




// Production Tasks
gulp.task('war', ['clean','html-prod','style-prod', 'main-prod'], function(){

});


//gulp.task('clean', function(cb) {
//  del(['dist'], cb);
//});

gulp.task('clean-prod', function() {
  return gulp.src( prodDir + "/*" )
  .pipe( rm ())
  .pipe( gulp.dest( prodDir ));
});


gulp.task('html-prod', ['clean-prod'],function () {
  return gulp.src( paths.html.src)
  .pipe(wiredep())
  .pipe(gulp.dest( paths.html.prod));
});


gulp.task('main-prod', function() {
  // Browserify/bundle the JS.
  return browserify(paths.main.src)
  .transform(reactify)
  .bundle()
  .pipe(source(paths.main.name))
  .pipe(buffer())
  .pipe(gulp.dest( paths.main.prod))
  .pipe(uglify())
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest( paths.main.prod));
});

gulp.task('style-prod', function () {
  return gulp.src(paths.style.src)
  .pipe(sass({style:'expanded'}))
  .pipe(gulp.dest(paths.style.prod))
  .pipe(rename({suffix:'.min'}))
  .pipe(minifycss())
  .pipe(gulp.dest(paths.style.prod));
});







// The default task (called when you run `gulp` from cli)
gulp.task('default', ['run', 'html-dev', 'style-dev', 'main-dev', 'watch']);
