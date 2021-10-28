const { src, dest, parallel, series, watch } = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const autoprefixer = require('gulp-autoprefixer');
const cleanFolder = require('del');
const plumber = require('gulp-plumber');

const errorHandler = function (error) {
    console.log(error);
    browserSync.notify(`<div>${error.plugin}</div><div>${error.messageOriginal}</div>`, 5000);
};

function fonts() {
    return src('src/font/**/*')
        .pipe(plumber(errorHandler))
        .pipe(dest('dist/font'))
}

function browsersync() {
    browserSync.init({
        server: { baseDir: './' },
        notify: true,
        online: true
    })
}

function images() {
    return src('src/img/**/*')
        .pipe(plumber(errorHandler))
        .pipe(imagemin())
        .pipe(dest('dist/img/'))
}

function scripts() {
    return src([ 'src/js/*.js'])
        .pipe(plumber(errorHandler))
        .pipe(concat('scripts.min.js'))
        .pipe(uglify())
        .pipe(dest('dist/js/'))
        .pipe(browserSync.stream())
}

function styles() {
    return src('src/scss/*.scss')
        .pipe(plumber(errorHandler))
        .pipe(sass.sync())
        .pipe(concat('styles.min.css'))
        .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
        .pipe(cleanCSS( { level: { 1: { specialComments: 0 } }}))
        .pipe(dest('dist/css/'))
        .pipe(browserSync.stream())
}

function cleandist() {
    return cleanFolder('dist/**/*', { force: true })
}

function startwatch() {
    watch('src/img/**/*', images);
    watch('src/js/**/*.js', scripts).on('change', browserSync.reload);
    watch('src/scss/**/*.scss', styles);
    watch('./index.html').on('change', browserSync.reload);
}

exports.images = images;
exports.clean = cleandist;
exports.scripts = scripts;
exports.styles = styles;
exports.browsersync = browsersync;
exports.startwatch = startwatch;
exports.fonts = fonts;

exports.build = series(cleandist, styles, scripts, images, fonts);
exports.dev = parallel(images, styles, scripts, browsersync, startwatch);