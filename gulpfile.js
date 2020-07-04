const gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    browserSync = require('browser-sync').create(),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css'),
    babel = require('gulp-babel'),
    rename = require("gulp-rename"),
    uglify = require('gulp-uglify-es').default,
    imagemin = require('gulp-imagemin'),
    image = require('gulp-image'),
    clean = require('gulp-clean'),
    gulpEjsMonster = require('gulp-ejs-monster');

const ProxyServer = false;
const domain = 'localhost/ejs/build';
const root = 'build';

const paths = {
    scss: {
        src: ['app/assets/css/*.scss', 'app/assets/css/other/*.scss', 'app/assets/css/pages/*.scss', 'app/assets/css/components/*.scss'],
        dest: 'build/assets/css'
    },
    js: {
        src: 'app/assets/js/*.js',
        dest: 'build/assets/js/'
    },
    ejs: {
        src: 'app/**/**/*.ejs',
        dest: 'build/'
    },
    html: {
        src: 'build/*.html',
        dest: 'build/'
    },
    img: {
        src: 'app/assets/img/**/**/*',
        dest: 'build/assets/img/'
    },
    video: {
        src: 'app/assets/video/**/**/*',
        dest: 'build/assets/video/'
    },
    audio: {
        src: 'app/assets/audio/**/**/*',
        dest: 'build/assets/audio/'
    },
    vendors: {
        src: 'app/assets/vendors/**/**/**/**/**/*',
        dest: 'build/assets/vendors/'
    },
    fonts: {
        src: 'app/assets/fonts/**/*',
        dest: 'build/assets/fonts/'
    },
    favicon: {
        src: 'app/assets/favicon/**/*',
        dest: 'build/assets/favicon/'
    },
    icons: {
        src: 'app/assets/icons/**/*',
        dest: 'build/assets/icons/'
    }
};

function serve() {
    if (ProxyServer) {
        browserSync.init({
            proxy: domain,
            notify: false
        });
    } else {
        browserSync.init({
            server: {
                baseDir: root
            },
            notify: false
        });
    }
}

function reload(done) {
    browserSync.reload();
    done();
}

function watch() {
    gulp.watch(paths.scss.src, gulp.series(scss));
    gulp.watch(paths.js.src, gulp.series(js, reload));
    gulp.watch(paths.ejs.src, gulp.series(ejs, reload));
    gulp.watch(paths.img.src, gulp.series(build_images, reload));
    gulp.watch(paths.video.src, gulp.series(build_video, reload));
    gulp.watch(paths.audio.src, gulp.series(build_audio, reload));
    gulp.watch(paths.vendors.src, gulp.series(build_vendors, reload));
    gulp.watch(paths.fonts.src, gulp.series(build_fonts, reload));
    gulp.watch(paths.icons.src, gulp.series(build_icons, reload));
}

function js(done) {
    return gulp.src(paths.js.src)
        .pipe(sourcemaps.init())
        .pipe(babel({presets: ['@babel/env']}))
        .pipe(rename(function (path) {
            path.basename += ".min";
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.js.dest));
    done();
}

function scss(done) {
    return gulp.src(paths.scss.src)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer({
            overrideBrowserslist: ["> 0.1%",
                "last 5 versions",
                "ie >= 11",
                "ie < 11"],
            cascade: false,
            grid: true
        }))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.scss.dest))
        .pipe(browserSync.stream());
    done();
}

function img(done) {
    return gulp.src(paths.img.src)
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(image({
            svgo: false
        }))
        .pipe(gulp.dest(paths.img.dest));
    done();
}


function ejs(done) {
    gulp.src(paths.ejs.src)
        .pipe(gulpEjsMonster({compileDebug: true}).on('error', gulpEjsMonster.preventCrash))
        .pipe(gulp.dest(paths.ejs.dest));
    done();
}


function build_images(done) {
    return gulp.src(paths.img.src)
        .pipe(gulp.dest(paths.img.dest));
    done();
}

function build_video(done) {
    return gulp.src(paths.video.src)
        .pipe(gulp.dest(paths.video.dest));
    done();
}

function build_audio(done) {
    return gulp.src(paths.audio.src)
        .pipe(gulp.dest(paths.audio.dest));
    done();
}

function build_fonts(done) {
    return gulp.src(paths.fonts.src)
        .pipe(gulp.dest(paths.fonts.dest));
    done();
}

function build_icons(done) {
    return gulp.src(paths.icons.src)
        .pipe(gulp.dest(paths.icons.dest));
    done();
}

function build_vendors(done) {
    return gulp.src(paths.vendors.src)
        .pipe(gulp.dest(paths.vendors.dest));
    done();
}

function clean_build(done) {
    return gulp.src('build/*')
        .pipe(clean({
             force: true
        }));
    done();
}

exports.serve = serve;
exports.reload = reload;
exports.watch = watch;
exports.js = js;
exports.scss = scss;
exports.ejs = ejs;
exports.img = img;
exports.clean_build = clean_build;
exports.build_vendors = build_vendors;
exports.build_fonts = build_fonts;
exports.build_video = build_video;
exports.build_audio = build_audio;
exports.build_images = build_images;
exports.build_icons = build_icons;

exports.default = gulp.series(
    clean_build,
    gulp.parallel(build_images, build_fonts, build_video, build_audio, build_icons, build_vendors),
    gulp.parallel(scss, js, gulp.series(ejs)),
    gulp.parallel(watch, serve)
);