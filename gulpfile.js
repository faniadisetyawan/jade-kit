var gulp = require('gulp');
var jade = require('gulp-jade');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var browserSync = require('browser-sync').create();

gulp.task('jade', function() {
	gulp.src('src/**/*.jade')
		.pipe(jade({
			pretty: true
		}))
		.pipe(gulp.dest('dist'))
		.pipe(browserSync.stream())
});

gulp.task('stylesheet', function() {
	gulp.src([
		'./bower_components/bootstrap/dist/css/bootstrap.min.css'
	])
		.pipe(concat('vendor.css'))
		.pipe(cleanCSS({compatibility: 'ie8'}))
		.pipe(gulp.dest('dist/assets/vendor'))
});

gulp.task('javascript', function() {
	gulp.src([
		'./bower_components/jquery/dist/jquery.min.js',
		'./bower_components/tether/dist/js/tether.min.js',
		'./bower_components/bootstrap/dist/js/bootstrap.min.js'
	])
		.pipe(concat('vendor.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/assets/vendor'))
});

gulp.task('sass', function() {
	gulp.src('src/assets/sass/**/*.sass')
		.pipe(sass({
			outputStyle: 'compressed'
		}).on('error', sass.logError))
		.pipe(gulp.dest('dist/assets/css'))
		.pipe(browserSync.stream())
});

gulp.task('watch', ['jade', 'sass'], function() {
	gulp.watch('src/**/*.jade', ['jade']);
	gulp.watch('src/assets/sass/**/*.sass', ['sass']);
});

gulp.task('serve', ['stylesheet', 'javascript', 'watch'], function() {
	browserSync.init({
		server: './dist'
	})
});

gulp.task('default', ['serve']);