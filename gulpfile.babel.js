import gulp from 'gulp';
import { deleteAsync as del } from 'del';
import { readFileSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.info('Building Moonfin Tizen app');

// Read version from package.json
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
const version = pkg.version;

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

// Package the build into a versioned .wgt file
async function packageWgt() {
    const wgtName = `Moonfin-${version}.wgt`;
    await del([wgtName]);
    console.info(`Creating ${wgtName}...`);
    await execAsync(`cd build && zip -r ../${wgtName} . -x "*.git*"`);
    console.info(`Package created: ${wgtName}`);
}

// Default build task
const build = gulp.series(clean, copyFiles);

// Build and package task
const buildPackage = gulp.series(clean, copyFiles, packageWgt);

export { clean, copyFiles, packageWgt, buildPackage };
export default build;
