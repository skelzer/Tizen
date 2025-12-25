import gulp from 'gulp';
import { deleteAsync as del } from 'del';

console.info('Building Moonfin Tizen app');

// Clean the build directory
function clean() {
    return del(['build/**', '!build']);
}

// Copy all app files to build directory
function copyFiles() {
    return gulp.src([
        '*.html',
        '*.xml',
        '*.js',
        'css/**/*',
        'js/**/*',
        'assets/**/*',
        'components/**/*'
    ], { base: '.', encoding: false })
    .pipe(gulp.dest('build/'));
}

// Default build task
const build = gulp.series(clean, copyFiles);

export { clean, copyFiles };
export default build;
