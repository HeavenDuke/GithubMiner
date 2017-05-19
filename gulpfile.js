/**
 * Created by heavenduke on 17-4-26.
 */
var gulp = require('gulp');
minifycss = require('gulp-minify-css'),   //css压缩
    concat = require('gulp-concat'),   //合并文件
    uglify = require('gulp-uglify'),   //js压缩
    rename = require('gulp-rename'),   //文件重命名
    notify = require('gulp-notify');   //提示

gulp.task('default', [
    'shared',
    'home',
    'repository',
    'ranking',
    'search'
], function () {
    console.log("finished building!");
});

gulp.task('shared', function () {
    gulp.src('website/public/src/css/theme.css')
        .pipe(minifycss())
        .pipe(concat('theme.min.css'))
        .pipe(gulp.dest('website/public/dist/css'))
        .pipe(notify({message: 'finish building stylesheets'}));
});

gulp.task('home', function () {
    gulp.src(['website/public/src/javascript/home.js'])
        .pipe(uglify())
        .pipe(concat('home.min.js'))
        .pipe(gulp.dest('website/public/dist/javascript'))
        .pipe(notify({message: 'finish building js for homepage'}));
});

gulp.task('repository', function () {
    gulp.src(['website/public/src/javascript/repository.js'])
        .pipe(uglify())
        .pipe(concat('repository.min.js'))
        .pipe(gulp.dest('website/public/dist/javascript'))
        .pipe(notify({message: 'finish building js for repository module'}));
});

gulp.task('search', function () {
    gulp.src(['website/public/src/javascript/search.js'])
        .pipe(uglify())
        .pipe(concat('search.min.js'))
        .pipe(gulp.dest('website/public/dist/javascript'))
        .pipe(notify({message: 'finish building js for search module'}));
});

gulp.task('ranking', function () {
    gulp.src(['website/public/src/javascript/ranking.js'])
        .pipe(uglify())
        .pipe(concat('ranking.min.js'))
        .pipe(gulp.dest('website/public/dist/javascript'))
        .pipe(notify({message: 'finish building js for ranking module'}));
});

gulp.watch(['public/src/**/*.*'], ['default']);