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

gulp.task('concat:css', function () {
    return gulp.src(conf.srcMainCss)
        .pipe(concat(conf.outMainCss, { newLine: conf.newLine }))
        .pipe(gulp.dest(conf.outDist));
});

gulp.task('compile:templates', function () {
    return gulp.src(conf.srcTemplates)
        .pipe(vuetc(conf.outRenderedTemplates, { minify: false }))
        .pipe(gulp.dest(conf.outDist));
});

gulp.task('default', function () {
    gulp.start('concat:css', 'compile:templates');
});