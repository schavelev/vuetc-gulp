var gulp = require('gulp'),
    ts = require("gulp-typescript"),
    concat = require('gulp-concat'),
    vuetc = require('../../index');

var tsProject = ts.createProject("tsconfig.json");

var conf = {
    outDist: 'dist/',
    outMainCss: 'main.css',
    srcMainCss: ['src/**/*.css'],
    outRenderedTemplates: 'app-templates.js',
    srcTemplates: ['src/components/**/*.html'],
    newLine: '\r\n'
};

gulp.task('compile:ts', function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest('.'));
});

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
    gulp.start('compile:ts', 'compile:templates', 'concat:css');
});