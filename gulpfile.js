var gulp = require('gulp');
var jade = require('gulp-jade');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var autoprefixer = require('gulp-autoprefixer');
var realFavicon = require('gulp-real-favicon');
var fs = require('fs');
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
		.pipe(autoprefixer({
			browsers: ['last 2 versions', '> 5%'],
		}))
		.pipe(gulp.dest('dist/assets/css'))
		.pipe(browserSync.stream())
});

gulp.task('scripts', function() {
	gulp.src('src/assets/js/*.js')
		.pipe(uglify())
		.pipe(gulp.dest('dist/assets/js'))
});

gulp.task('images', function() {
	gulp.src('src/assets/images/**/*')
		.pipe(gulp.dest('dist/assets/images'))
});

gulp.task('images-prod', function() {
	gulp.src('src/assets/images/**/*')
		.pipe(imagemin([
			imagemin.gifsicle({interlaced: true}),
	    imagemin.jpegtran({progressive: true}),
	    imagemin.optipng({optimizationLevel: 5}),
	    imagemin.svgo({plugins: [{removeViewBox: true}]})
		]))
		.pipe(gulp.dest('dist/assets/images'))
});

// File where the favicon markups are stored
var FAVICON_DATA_FILE = 'faviconData.json';
gulp.task('generate-favicon', function(done) {
	realFavicon.generateFavicon({
		masterPicture: 'src/assets/images/favicon.png',
		dest: 'src/assets/images/favicon',
		iconsPath: 'assets/images/favicon',
		design: {
			ios: {
				pictureAspect: 'noChange',
				assets: {
					ios6AndPriorIcons: false,
					ios7AndLaterIcons: false,
					precomposedIcons: false,
					declareOnlyDefaultIcon: true
				}
			},
			desktopBrowser: {},
			windows: {
				pictureAspect: 'noChange',
				backgroundColor: '#ffffff',
				onConflict: 'override',
				assets: {
					windows80Ie10Tile: false,
					windows10Ie11EdgeTiles: {
						small: false,
						medium: true,
						big: false,
						rectangle: false
					}
				}
			},
			androidChrome: {
				pictureAspect: 'noChange',
				themeColor: '#ffffff',
				manifest: {
					display: 'standalone',
					orientation: 'notSet',
					onConflict: 'override',
					declared: true
				},
				assets: {
					legacyIcon: false,
					lowResolutionIcons: false
				}
			}
		},
		settings: {
			scalingAlgorithm: 'Mitchell',
			errorOnImageTooSmall: false
		},
		markupFile: FAVICON_DATA_FILE
	}, function() {
		done();
	});
});

gulp.task('inject-favicon-markups', function() {
	return gulp.src([ 'src/layouts/*.jade' ])
		.pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
		.pipe(gulp.dest('dist'));
});

gulp.task('check-for-favicon-update', function(done) {
	var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
	realFavicon.checkForUpdates(currentVersion, function(err) {
		if (err) {
			throw err;
		}
	});
});

gulp.task('watch', ['jade', 'sass', 'scripts', 'images'], function() {
	gulp.watch('src/**/*.jade', ['jade']);
	gulp.watch('src/assets/sass/**/*.sass', ['sass']);
});

gulp.task('serve', ['stylesheet', 'javascript', 'watch'], function() {
	browserSync.init({
		server: './dist'
	})
});

gulp.task('default', ['serve']);

gulp.task('build', ['jade', 'sass', 'scripts', 'stylesheet', 'javascript', 'images-prod']);