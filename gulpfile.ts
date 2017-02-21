///<reference path="typings/index.d.ts" />

import * as gulp from 'gulp';
import * as ts from 'gulp-typescript';
import * as fs from 'fs';
import * as merge from 'merge2';
import * as less from 'gulp-less';
import * as path from 'path';
import * as  sourcemaps from "gulp-sourcemaps";
import * as  concat from "gulp-concat";
import * as  browserify from "browserify";
import * as  source from "vinyl-source-stream";
import * as  buffer from "vinyl-buffer";

var modules = fs.readdirSync('modules');
var typescriptDependencies = [];
var lessDependencies = [];
var typescriptWatchDependencies = [];
var lessWatchDependencies = [];

modules.forEach(function (m)
{
    typescriptDependencies.push('build-' + m + '-typescript')
    typescriptDependencies.push('build-' + m + '-client-browserify')
    typescriptWatchDependencies.push('watch-' + m + '-typescript')
    typescriptWatchDependencies.push('watch-' + m + '-client-browserify')
    lessDependencies.push('build-' + m + '-less')
    lessWatchDependencies.push('watch-' + m + '-less')

    gulp.add('build-' + m + '-typescript', function ()
    {
        var tsProject = ts.createProject("modules/" + m + "/src/server/tsconfig.json");
        var tsResult = tsProject.src()
            .pipe(sourcemaps.init())
            .pipe(tsProject());
        return merge(tsResult.js
            .pipe(sourcemaps.write(".", { sourceRoot: m + '/src/server' }))
            .pipe(gulp.dest("modules/" + m + "/dist/server")),
            tsResult.dts.pipe(gulp.dest("modules/" + m + "/dist/server")));
    });

    gulp.add('watch-' + m + '-typescript', function ()
    {
        return gulp.watch('modules/' + m + '/src/server/**/*.ts', ['build-' + m + '-typescript']);
    })

    gulp.add('build-' + m + '-client-typescript', function ()
    {
        if (fs.existsSync("modules/" + m + "/src/client/tsconfig.json"))
        {
            var tsProject = ts.createProject("modules/" + m + "/src/client/tsconfig.json");
            var tsResult = tsProject.src()
                .pipe(sourcemaps.init())
                .pipe(tsProject());
            return merge(tsResult.js
                .pipe(sourcemaps.write("."))
                .pipe(gulp.dest("modules/" + m + "/dist/client")),
                tsResult.dts.pipe(gulp.dest("modules/" + m + "/dist/client")));
        }
    });

    gulp.add('watch-' + m + '-client-typescript', function ()
    {
        return gulp.watch('modules/' + m + '/src/client/**/*.ts', ['build-' + m + '-client-typescript']);
    })

    gulp.add('build-' + m + '-client-browserify', ['build-' + m + '-client-typescript'], function ()
    {
        if (fs.existsSync("modules/" + m + "/src/client/tsconfig.json") && fs.existsSync("modules/" + m + "/dist/client/index.js"))
        {
            return browserify('modules/' + m + '/dist/client', { debug: true })
                .transform('deamdify')
                .ignore('akala-client')
                .ignore('../../../../typings')
                .bundle()
                .pipe(source('index.js'))
                .pipe(buffer())
                .pipe(gulp.dest('modules/' + m + '/assets/js'));
        }
    });

    gulp.add('watch-' + m + '-client-browserify', function ()
    {
        if (fs.existsSync("modules/" + m + "/src/client/tsconfig.json") && fs.existsSync("modules/" + m + "/dist/client/index.js"))
        {
            return gulp.watch('modules/' + m + '/dist/client/**/*.js', ['build-' + m + '-browserify']);
        }
    })



    gulp.add('build-' + m + '-less', function ()
    {
        return gulp.src(['modules/' + m + '/**/*.less', '!**/bower_components/**/*.less'])
            .pipe(sourcemaps.init())
            .pipe(less())
            .pipe(concat('module.css'))
            .pipe(sourcemaps.write('.', { sourceRoot: 'assets/' + m + '/css' }))
            .pipe(gulp.dest('modules/' + m + '/assets/css'));
    })

    gulp.add('watch-' + m + '-less', function ()
    {
        return gulp.watch(['modules/' + m + '/**/*.less', '!modules/' + m + '/bower_components/**/*.less'], ['build-' + m + '-less']);
    })

});

gulp.add('build-gulpfile', function ()
{
    return gulp.src('gulpfile.ts').pipe(ts()).pipe(gulp.dest('.'));
});
gulp.add('watch-gulpfile', function ()
{
    return gulp.watch('gulpfile.ts', ['build-gulpfile']);
});

gulp.add('build-typescript', typescriptDependencies);
gulp.add('build-less', lessDependencies);

gulp.add('watch-typescript', typescriptWatchDependencies);
gulp.add('watch-less', lessWatchDependencies);

gulp.add('build', ['build-typescript', 'build-less', 'build-gulpfile']);
gulp.add('watch', ['watch-typescript', 'watch-less', 'watch-gulpfile']);