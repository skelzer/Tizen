import gulp from "gulp";
import { deleteAsync as del } from "del";
import { readFileSync, writeFileSync } from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import babel from "gulp-babel";

const execAsync = promisify(exec);

console.info("Building Moonfin Tizen app");

const pkg = JSON.parse(readFileSync("./package.json", "utf8"));
const version = pkg.version;

function clean() {
   return del(["build/**", "!build"]);
}

function updateVersion(cb) {
   const versionContent = `var APP_VERSION = '${version}';\n`;
   writeFileSync("./js/app-version.js", versionContent);
   console.info(`Updated app-version.js to version ${version}`);
   cb();
}

function copyFiles() {
   return gulp
      .src(
         [
            "*.html",
            "*.xml",
            "shaka-player.js",
            "hls.js",
            "css/**/*",
            "js/**/*",
            "assets/**/*",
            "components/**/*",
         ],
         { base: ".", encoding: false }
      )
      .pipe(gulp.dest("build/"));
}

// Copy files and transpile JS to ES5 for Tizen 2.4 compatibility
function copyFilesES5() {
   gulp
      .src(
         [
            "*.html",
            "*.xml",
            "shaka-player.js",
            "hls.js",
            "css/**/*",
            "assets/**/*",
            "components/**/*",
         ],
         { base: ".", encoding: false }
      )
      .pipe(gulp.dest("build/"));

   return gulp
      .src("js/**/*.js", { base: "." })
      .pipe(
         babel({
            presets: [
               [
                  "@babel/preset-env",
                  {
                     targets: {
                        browsers: ["ie >= 11", "safari >= 9"],
                     },
                     modules: false,
                  },
               ],
            ],
         })
      )
      .pipe(gulp.dest("build/"));
}

async function packageWgt() {
   const versionedWgtName = `Moonfin-Tizen-${version}.wgt`;
   const wgtName = "Moonfin.wgt";
   await del([versionedWgtName, wgtName]);

   try {
      await execAsync(
         "cp -f .sign/author-signature.xml .sign/signature1.xml build/ 2>/dev/null || true"
      );
      console.info("Added signature files to build directory");
   } catch (e) {
      console.warn(
         "Warning: No signature files found - package may not install on device"
      );
   }

   console.info(`Creating ${wgtName}...`);
   await execAsync(
      `cd build && zip -r ../${wgtName} . -x "*.git*" -x "gulpfile.babel.js"`
   );
   console.info(`Package created: ${wgtName}`);

   console.info(`Creating ${versionedWgtName}...`);
   await execAsync(
      `cd build && zip -r ../${versionedWgtName} . -x "*.git*" -x "gulpfile.babel.js"`
   );
   console.info(`Package created: ${versionedWgtName}`);
}

const build = gulp.series(clean, updateVersion, copyFiles);
const buildPackage = gulp.series(clean, updateVersion, copyFiles, packageWgt);
const buildES5 = gulp.series(clean, updateVersion, copyFilesES5);
const buildPackageES5 = gulp.series(
   clean,
   updateVersion,
   copyFilesES5,
   packageWgt
);

export {
   clean,
   updateVersion,
   copyFiles,
   copyFilesES5,
   packageWgt,
   buildPackage,
   buildES5,
   buildPackageES5,
};
export default build;
