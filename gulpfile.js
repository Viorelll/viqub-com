let project_folder = "dist"; // require('path').basename(__dirname);
let source_folder = "src";
let source_folder_assets = source_folder + '/assets';

let fs = require('fs');

let path = {

    build: {
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        images: project_folder + "/img/",
        fonts: project_folder + "/fonts/",
    },

    src: {
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"], // HTML'S IS NOT IN ASSETS FOLDER
        css: source_folder_assets + "/scss/style.scss",
        js: source_folder_assets + "/js/script.js",
        images: source_folder_assets + "/images/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: source_folder_assets + "/fonts/*.ttf",
    },

    watch: {
        html: source_folder + "/**/*.html", // HTML'S IS NOT IN ASSETS FOLDER
        css: source_folder_assets + "/scss/**/*.scss",
        js: source_folder_assets + "/js/**/*.js",
        images: source_folder_assets + "/images/**/*.{jpg,png,svg,gif,ico,webp}",
    },

    clean: "./" + project_folder + "/"
}

let { src, dest } = require('gulp'),
    gulp = require('gulp'),
    browsersync = require('browser-sync').create(), // https://www.browsersync.io/docs/gulp
    fileinclude = require('gulp-file-include'), // https://www.npmjs.com/package/gulp-file-include
    del = require('del'), // https://www.npmjs.com/package/del
    scss = require('gulp-sass'), // https://www.npmjs.com/package/gulp-sass
    autoprefixer = require('gulp-autoprefixer'), // https://www.npmjs.com/package/gulp-autoprefixer
    group_media = require('gulp-group-css-media-queries'), // https://www.npmjs.com/package/gulp-group-css-media-queries
    clean_css = require('gulp-clean-css'), // https://www.npmjs.com/package/gulp-clean-css
    rename = require('gulp-rename'), // https://www.npmjs.com/package/gulp-rename
    uglify = require('gulp-uglify-es').default, //https://www.npmjs.com/package/gulp-uglify-es
    imagemin = require('gulp-imagemin'), // https://www.npmjs.com/package/gulp-imagemin
    webp = require('gulp-webp'); // https://www.npmjs.com/package/gulp-webp
    webphtml = require('gulp-webp-html'); // https://www.npmjs.com/package/gulp-webp-html
    webpcss = require('gulp-webpcss'); // https://www.npmjs.com/package/gulp-webpcss
    svgSprite = require('gulp-svg-sprite'); // https://www.npmjs.com/search?q=gulp-svg-sprite
    ttf2woff = require('gulp-ttf2woff'); // https://www.npmjs.com/package/gulp-ttf2woff
    ttf2woff2 = require('gulp-ttf2woff2'); // https://www.npmjs.com/package/gulp-ttf2woff2
    fonter = require('gulp-fonter'); // https://www.npmjs.com/package/gulp-fonter

function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: "./" + project_folder + "/"
        },
        port: 3000,
        notify: false
    })
}

function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(webphtml())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

function css() {
    return src(path.src.css)
        .pipe(scss({
            outputStyle: "expanded"
        })
        )
        .pipe(
            group_media()
        )
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 5 versions"],
                cascade: true
            })
        )
        .pipe(webpcss())
        .pipe(dest(path.build.css)) // OUTPUT NON-MINIFIED FILE
        .pipe(clean_css())
        .pipe(
            rename({
                extname: ".min.css"
            })
        )
        .pipe(dest(path.build.css)) // OUTPUT MINIFIED FILE
        .pipe(browsersync.stream())
}

function js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(dest(path.build.js)) // OUTPUT NON-MINIFIED FILE
        .pipe(
            uglify()
        )
        .pipe(
            rename({
                extname: ".min.js" // OUTPUT MINIFIED FILE
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}

function images() {
    return src(path.src.images)
        .pipe(
            webp({
                quality: 70
            })
        )
        .pipe(dest(path.build.images)) //CREATE IMAGE IN WEBP
        .pipe(src(path.src.images))
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{ removeViewBox: false }],
                interlaced: true,
                optimizationLevel: 0 // 0 to 7
            })
        )
        //.pipe(fileinclude())
        .pipe(dest(path.build.images)) //MOVE DEFAULT IMAGE
        .pipe(browsersync.stream())
}

function fonts() {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts));
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts));
}

// 'gulp svgSprite' - for execution
gulp.task('svgSprite', function () {
    return gulp.src([source_folder_assets + '/iconsprite/*.svg'])
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: '../icons/icons.svg', //sprite file name
                    example: true //show preview features an SVG stack
                }
            }
        }))
        .pipe(dest(path.build.images))
})

// 'gulp otf2ttf' - for execution
gulp.task('otf2ttf', function () {
    return src([source_folder_assets + '/fonts/*.otf'])
        .pipe(fonter({
            formats: ['ttf']
        }))
        .pipe(dest(source_folder_assets + '/fonts/'));
})

function fontsStyle(params) {
    let file_content = fs.readFileSync(source_folder_assets + '/scss/fonts.scss');
    if (file_content == '') {
        fs.writeFile(source_folder_assets + '/scss/fonts.scss', '', cb);
        return fs.readdir(path.build.fonts, function (err, items) {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split('.');
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile(source_folder_assets + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
                    }
                    c_fontname = fontname;
                }
            }
        })
    }
}

function cb() { }

function watchFiles(params) {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.images], images);
}

function clean(params) {
    return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts), fontsStyle);
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;