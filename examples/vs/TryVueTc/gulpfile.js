var gulp = require('gulp'),
    concat = require('gulp-concat'),
    vuetc = require('../../../index');

var conf = {
    outDist: 'wwwroot/dist/',
    outMainCss: 'main.css',
    srcMainCss: ['ClientApp/**/*.css'],
    outRenderedTemplates: 'app-templates.js',
    srcTemplates: ['ClientApp/components/**/*.html'],
    newLine: '\r\n'
};


function concatCss() {
    return gulp.src(conf.srcMainCss)
        .pipe(concat(conf.outMainCss, { newLine: conf.newLine }))
        .pipe(gulp.dest(conf.outDist));
}

function compileTemplates() {
    return gulp.src(conf.srcTemplates)
        .pipe(vuetc(conf.outRenderedTemplates, { minify: false }))
        .pipe(gulp.dest(conf.outDist));
}

exports["concat:css"] = concatCss;
exports["compile:templates"] = compileTemplates;

exports.default = gulp.parallel(concatCss, compileTemplates);
