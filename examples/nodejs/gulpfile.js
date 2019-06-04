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

function compileTs() {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest('.'));
}

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

exports["compile:ts"] = compileTs;
exports["concat:css"] = concatCss;
exports["compile:templates"] = compileTemplates;

exports.default = gulp.parallel(compileTs, concatCss, compileTemplates);