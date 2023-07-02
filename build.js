'use strict';
var browserify = require('browserify');
var CleanCSS = require('clean-css');
var fs = require('fs-extra');
var MultiStream = require('multistream');
var projectJSON = require('./package.json');
var Promise = require('promise');
var pug = require('pug');
var Stream = require('stream');
var stylus = require('stylus');
//var zip = require('zip-folder');


var BIN_DIRECTORY = __dirname + '/bin/{browser}';
var BROWSER_SOURCE_DIRECTORY = __dirname + '/src/{browser}';
var COMMON_DIRECTORY = __dirname + '/src/common';
var DESTINATION_DIRECTORY = __dirname + '/build/{browser}';
var RELEASE_DIRECTORY = __dirname + '/release';
var VALID_BROWSERS = [
    'webkit', 'edge', 'firefox'
];
var VALID_BUILD_MODES = [
    'test', 'release'
];


function init() {
    if (process.argv.length < 3 || process.argv.length > 4) {
        console.log('Usage: node build.js [' + VALID_BUILD_MODES.join(' | ') + '] [' + VALID_BROWSERS.join(' | ') + ']');

        process.exit();
    }

    var browser = process.argv.length === 4 ? process.argv[3] : 'all';
    var buildMode = VALID_BUILD_MODES.indexOf(process.argv[2].toLowerCase()) === -1 ? 'test': process.argv[2].toLowerCase();

    if (browser === 'all') {
        console.log('No browser was specified.');
        console.log('Building for all browsers...');

        buildAllBrowsers(buildMode).then(function() {
            console.log('Complete.');
        });
    } else {
        if (VALID_BROWSERS.indexOf(browser) === -1) {
            console.log('Specified browser "' + browser + '" is not one of [' + VALID_BROWSERS.join(' | ') + '])');
        } else {
            build(browser, buildMode).then(function() {
                console.log('Complete.');
            });
        }
    }
}

function buildAllBrowsers(buildMode, browserIndex) {
    browserIndex = browserIndex || 0;

    return new Promise(function(resolve, reject) {
        if (browserIndex === VALID_BROWSERS.length) {
            resolve();
        } else {
            build(VALID_BROWSERS[browserIndex], buildMode).then(function() {
                buildAllBrowsers(buildMode, browserIndex + 1);
            });
        }
    });
}

function build(browser, buildMode) {
    return new Promise(function(resolve, reject) {
        var buildPromises = [];
        var binDirectory = BIN_DIRECTORY.replace('{browser}', browser);
        var destDirectory = DESTINATION_DIRECTORY.replace('{browser}', browser);
        var browserSourceDirectory = BROWSER_SOURCE_DIRECTORY.replace('{browser}', browser);
        var minifyCode = buildMode === 'release';
        var firefoxDummyVariable = browser === 'firefox';

        console.log('\nBuilding Global Twitch Emotes version ' + projectJSON.version + ': ' + browser + ' ' + buildMode + '...');

        fs.emptyDirSync(binDirectory);
        fs.emptyDirSync(destDirectory);

        fs.copySync(COMMON_DIRECTORY, binDirectory);
        fs.copySync(browserSourceDirectory, binDirectory);

        fs.mkdirsSync(destDirectory + '/browseraction');
        fs.mkdirsSync(destDirectory + '/browseraction/css');
        fs.mkdirsSync(destDirectory + '/browseraction/js');

        fs.mkdirsSync(destDirectory + '/options');
        fs.mkdirsSync(destDirectory + '/options/css');
        fs.mkdirsSync(destDirectory + '/options/js');

        fs.copySync(binDirectory + '/assets', destDirectory + '/assets');
        fs.copySync(binDirectory + '/metadata', destDirectory);

        buildPromises.push(buildScript(binDirectory + '/background/js/background.js', destDirectory + '/background.js', binDirectory, minifyCode, firefoxDummyVariable));
        buildPromises.push(buildScript(binDirectory + '/background/js/searchWorker.js', destDirectory + '/searchWorker.js', binDirectory, minifyCode, firefoxDummyVariable));

        buildPromises.push(buildScript(binDirectory + '/contentscript/js/contentscript.js', destDirectory + '/contentscript.js', binDirectory, minifyCode, firefoxDummyVariable));

        buildPromises.push(buildScript(binDirectory + '/options/js/options.js', destDirectory + '/options/js/options.js', binDirectory, minifyCode, firefoxDummyVariable));
        buildPromises.push(buildCSS(binDirectory + '/options/css/style.styl', destDirectory + '/options/css/style.css', binDirectory + '/options/css/'));
        buildPromises.push(buildHTML(binDirectory + '/options/options.pug', destDirectory + '/options/index.html'));

        buildPromises.push(buildScript(binDirectory + '/browseraction/js/popup.js', destDirectory + '/browseraction/js/popup.js', binDirectory, minifyCode, firefoxDummyVariable));
        buildPromises.push(buildCSS(binDirectory + '/browseraction/css/style.styl', destDirectory + '/browseraction/css/style.css', binDirectory + '/browseraction/css/'));
        buildPromises.push(buildHTML(binDirectory + '/browseraction/popup.pug', destDirectory + '/popup.html'));

        Promise.all(buildPromises).then(function() {
            if (buildMode === 'test') {
                resolve();
            } else {
                fs.mkdirsSync(RELEASE_DIRECTORY);

                //zipFolder(destDirectory, RELEASE_DIRECTORY + '/GTE_' + browser + '_' + projectJSON.version + '.zip').then(function () {
                //    resolve();
                //});
            }
        });
    });
}

function buildScript(source, destination, pathDirectory, minifyCode, appendDummyVariable) {
    return new Promise(function(resolve, reject) {
        var bundler = browserify({ paths: [pathDirectory] });
        var streams = [];

        console.log('Building "' + source + '" to "' + destination + '"...');

        if (minifyCode === true) {
            bundler.transform({
                global: true
            }, 'stripify');

            bundler.transform({
                global: true,
                mangle: true
            }, 'uglifyify');
        }

        bundler.add(source);
        streams.push(bundler.bundle());

        if (appendDummyVariable === true) {
            streams.push(createStringStream('true;'));
        }

        MultiStream(streams).pipe(fs.createWriteStream(destination)).on('finish', function() {
            console.log('Built "' + destination + '"');

            resolve();
        });
    });
}

function createStringStream(str) {
    var stream = new Stream.Readable;

    stream.push(str);
    stream.push(null);

    return stream;
}

function buildHTML(source, destination) {
    return new Promise(function(resolve, reject) {
        var optionsHTML;

        console.log('Building "' + source + '" to "' + destination + '"...');

        optionsHTML = pug.compileFile(source);
        fs.writeFileSync(destination, optionsHTML());

        console.log('Built "' + destination + '"');

        resolve();
    });
}

function buildCSS(source, destination, pathDirectory) {
    return new Promise(function(resolve, reject) {
        var stylusCSS = fs.readFileSync(source, 'utf8');

        console.log('Building "' + source + '" to "' + destination + '"...');

        stylus(stylusCSS).set('paths', [pathDirectory]).render(function(err, css) {
            if (err) {
                console.error(err);
            } else {
                var cleaned = new CleanCSS().minify(css);

                if (cleaned.errors.length > 0) {
                    console.error(JSON.stringify(cleaned.errors));
                }

                if (cleaned.warnings.length > 0) {
                    console.error(JSON.stringify(cleaned.warnings));
                }

                fs.writeFileSync(destination, cleaned.styles);

                console.log('Built "' + destination + '"');
            }

            resolve();
        });
    });
}

/* function zipFolder(source, destination) {
    return new Promise(function(resolve, reject) {
        console.log('Zipping...');

        zip(source, destination, function() {
            console.log('Zipped "' + source + '" to "' + destination + '"');

            resolve();
        });
    });
} */

init();