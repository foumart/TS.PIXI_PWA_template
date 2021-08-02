// gulp file for preparing the root folder and the html template during game compilation
const { src, dest, series } = require('gulp');
const minify = require("gulp-minify");
const concat = require("gulp-concat");
const htmlmin = require("gulp-htmlmin");
const replace = require("gulp-string-replace");
const htmlreplace = require("gulp-html-replace");
const cleanCSS = require("gulp-clean-css");
const closureCompiler = require('google-closure-compiler').gulp();
const del = require('del');
const argv = require('yargs').argv;
const log = require('fancy-log');
const gulpif = require('gulp-if');

const replaceOptions = { logs: { enabled: false } };

const title = "Pixi PWA Template";
const id_name = `${title.replace(/\s/g, '')}_${getDateString(true)}`;
const version = "0.0.1";
const debug = (argv.debug === undefined) ? false : true;
const dir = argv.dir || "dist";

// compress icons, compile js, minify css and webmanifest
function mini(cb) {
	let num = 0;
	src('src/root/*.png')
		.pipe(dest(dir + '/'))
		.on("end", checkCompletion)
		&&
		src('src/assets/*')
			.pipe(dest(dir + '/assets/'))
			.on("end", checkCompletion)
		&&
		src(['src/root/serviceworker.js'], { allowEmpty: true })
			.pipe(replace('var debug;', `var debug = ${debug ? 'true' : 'false'};`, replaceOptions))
			.pipe(replace('var logfetches;', `var logfetches = ${debug ? 'true' : 'false'};`, replaceOptions))
			.pipe(replace('{ID_NAME}', id_name, replaceOptions))
			.pipe(replace('{VERSION}', version, replaceOptions))
			.pipe(gulpif(!debug, replace('caches', 'window.caches', replaceOptions)))
			.pipe(gulpif(!debug, closureCompiler({
				compilation_level: 'ADVANCED_OPTIMIZATIONS',
				warning_level: 'QUIET',
				language_in: 'ECMASCRIPT6',
				language_out: 'ECMASCRIPT6'
			})))
			.pipe(gulpif(!debug, replace('window.caches', 'caches', replaceOptions)))
			.pipe(gulpif(!debug, minify({ noSource: true })))
			.pipe(concat('serviceworker.js'))
			.pipe(dest(dir + '/'))
			.on("end", checkCompletion)
		&&
		src(['src/root/init_pwa.js'], { allowEmpty: true })
			.pipe(replace('var _name = "";', `var _name = "${id_name}_${version}";`, replaceOptions))
			.pipe(replace('var _debug;', `var _debug = ${debug ? 'true' : 'false'};`, replaceOptions))
			.pipe(gulpif(!debug, closureCompiler({
				compilation_level: 'SIMPLE_OPTIMIZATIONS',
				warning_level: 'QUIET',
				language_in: 'ECMASCRIPT6',
				language_out: 'ECMASCRIPT6'
			})))
			.pipe(gulpif(!debug, minify({ noSource: true })))
			.pipe(concat('temp.js'))
			.pipe(dest(dir + '/temporary_gulp_folder/'))
			.on("end", checkCompletion)
		&&
		src('src/root/*.css', { allowEmpty: true })
			.pipe(cleanCSS())
			.pipe(replace(new RegExp('../'), '', replaceOptions))
			.pipe(concat('temp.css'))
			.pipe(dest(dir + '/temporary_gulp_folder/'))
			.on("end", checkCompletion)
		&&
		src('src/root/index.html', { allowEmpty: true })
			.pipe(htmlreplace({
				'pwa': 'rep_pwa',
				'css': 'rep_css'
			}))
			.pipe(replace('{TITLE}', title + (argv.production === undefined ? 'DEV' : ''), replaceOptions))
			.pipe(concat('temp.html'))
			.pipe(dest(dir + '/temporary_gulp_folder/'))
			.on("end", checkCompletion)
		&&
		src('src/root/mf.webmanifest', { allowEmpty: true })
			.pipe(replace('{TITLE}', title, replaceOptions))
			.pipe(htmlmin({ collapseWhitespace: true }))
			.pipe(dest(dir + '/'))
			.on('end', checkCompletion)

	function checkCompletion() {
		if (num < 6) num++;
		else cb();
	}
}

// inline js and css into the html and remove unnecessary stuff
function pack(cb) {
	const fileSystem = require('fs');
	src(dir + '/temporary_gulp_folder/temp.html', { allowEmpty: true })
		.pipe(gulpif(!debug, htmlmin({ collapseWhitespace: true, removeComments: true })))
		.pipe(replace('rep_pwa', '<script>' + fileSystem.readFileSync(dir + '/temporary_gulp_folder/temp.js', 'utf8') + '</script>', replaceOptions))
		.pipe(replace('rep_css', '<style>' + fileSystem.readFileSync(dir + '/temporary_gulp_folder/temp.css', 'utf8') + '</style>', replaceOptions))
		.pipe(concat('index.tmp.html'))
		.pipe(dest(dir + '/'))
		.on("end", cb);
}

function clean(cb) {
	del([dir + '/temporary_gulp_folder/']);
	cb();
	log(`Root and assets for ${debug ? 'debug' : 'production'} prepared in folder ${dir}/`);
}

// helper function
function getDateString(shorter) {
	const date = new Date();
	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, '0');
	const day = `${date.getDate()}`.padStart(2, '0');
	if (shorter) return `${year}${month}${day}`;
	const signiture = `${date.getHours()}`.padStart(2, '0') + `${date.getMinutes()}`.padStart(2, '0') + `${date.getSeconds()}`.padStart(2, '0');
	return `${year}${month}${day}_${signiture}`;
}

// exports
exports.mini = mini;
exports.pack = pack;
exports.clean = clean;
exports.default = series(mini, pack, clean);