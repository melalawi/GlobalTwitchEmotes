'use strict';
var browserify = require('browserify');
var CleanCSS = require('clean-css');
var fs = require('fs-extra');
var MultiStream = require('multistream');
var Promise = require('promise');
var pug = require('pug');
var Readable = require('stream').Readable;
var stylus = require('stylus');
var zipFolder = require('zip-folder');
var projectJSON = require('./package.json');


var COMMON_DIRECTORY = __dirname + '/src/common';
var FIREFOX_DIRECTORY = __dirname + '/src/firefox';
var BIN_DIRECTORY = __dirname + '/bin/firefox';
var DESTINATION_DIRECTORY = __dirname + '/build/firefox';
var RELEASE_DIRECTORY = __dirname + '/release';
var OPTIONS_DIRECTORY = __dirname + '/build/firefox/options';
var BROWSERIFY_SETTINGS = {
    paths: [BIN_DIRECTORY]
};
var buildMode;
var buildPromises = [];

// TODO: Clean up this stitched-together build file
function build() {
    buildMode = process.argv[2] === 'release' ? 'release' : 'test';

    fs.emptyDirSync(BIN_DIRECTORY);
    fs.emptyDirSync(DESTINATION_DIRECTORY);
    fs.emptyDirSync(OPTIONS_DIRECTORY);
    fs.mkdirsSync(RELEASE_DIRECTORY);

    fs.copySync(COMMON_DIRECTORY, BIN_DIRECTORY);
    fs.copySync(FIREFOX_DIRECTORY, BIN_DIRECTORY);

    buildPromises.push(buildBackgroundScript());
    buildPromises.push(buildContentScript());
    buildPromises.push(buildOptions());
    buildPromises.push(buildMetadata());

    Promise.all(buildPromises).then(function() {
        fs.emptyDirSync(BIN_DIRECTORY);
        fs.rmdirSync(BIN_DIRECTORY);
        zipBuild();
    });
}

function buildContentScript() {
    return new Promise(function(resolve, reject) {
        var bundler = browserify(BROWSERIFY_SETTINGS);
        var streams = [];

        console.log('Building contentscript.js');

        if (buildMode === 'release') {
            bundler.transform({
                global: true
            }, 'uglifyify');
        }

        bundler.add(BIN_DIRECTORY + '/contentscript/contentscript.js');

        streams.push(bundler.bundle());
        streams.push(createStringStream('true;'));

        MultiStream(streams).pipe(fs.createWriteStream(DESTINATION_DIRECTORY + '/contentscript.js')).on('finish', function() {
            console.log('contentscript.js built');
            resolve();
        });
    });
}

function buildBackgroundScript() {
    return new Promise(function(resolve, reject) {
        var bundler = browserify(BROWSERIFY_SETTINGS);
        var streams = [];

        console.log('Building background.js');

        if (buildMode === 'release') {
            bundler.transform({
                global: true
            }, 'uglifyify');
        }

        bundler.add(BIN_DIRECTORY + '/background/background.js');

        streams.push(bundler.bundle());
        streams.push(createStringStream('true;'));

        MultiStream(streams).pipe(fs.createWriteStream(DESTINATION_DIRECTORY + '/background.js')).on('finish', function() {
            console.log('background.js built');
            resolve();
        });
    });

}

function buildOptions() {
    var optionsPromises = [];
    var optionsHTML = pug.compileFile(BIN_DIRECTORY + '/options/options.pug');

    console.log('Copying required options files.');

    fs.copySync(BIN_DIRECTORY + '/options/images', OPTIONS_DIRECTORY + '/images');

    fs.writeFileSync(OPTIONS_DIRECTORY + '/index.html', optionsHTML());

    optionsPromises.push(buildOptionsJS());
    optionsPromises.push(buildOptionsCSS());

    return Promise.all(optionsPromises);
}

function buildOptionsJS() {
    return new Promise(function(resolve, reject){
        var bundler = browserify(BROWSERIFY_SETTINGS);
        var streams = [];

        console.log('Building options.js');

        fs.mkdirsSync(OPTIONS_DIRECTORY + '/js');

        if (buildMode === 'release') {
            bundler.transform({
                global: true
            }, 'uglifyify');
        }

        bundler.add(BIN_DIRECTORY + '/options/js/options.js');

        streams.push(bundler.bundle());
        streams.push(createStringStream('true;'));

        MultiStream(streams).pipe(fs.createWriteStream(DESTINATION_DIRECTORY + '/options/js/options.js')).on('finish', function() {
            console.log('options.js built');
            resolve();
        });
    });
}

function buildOptionsCSS() {
    return new Promise(function(resolve, reject) {
        var stylusCSS = fs.readFileSync(BIN_DIRECTORY + '/options/css/style.styl', 'utf8');

        console.log('Building options stylesheet.');

        fs.mkdirsSync(OPTIONS_DIRECTORY + '/css');

        stylus(stylusCSS).set('paths', [BIN_DIRECTORY + '/options/css/']).render(function(err, css) {
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

                fs.writeFileSync(OPTIONS_DIRECTORY + '/css/style.css', cleaned.styles);

                console.log('Options stylesheet built');
            }

            resolve();
        });
    });
}

function buildMetadata() {
    return new Promise(function(resolve, reject) {
        console.log('Building manifest.json');

        fs.copySync(BIN_DIRECTORY + '/metadata', DESTINATION_DIRECTORY);

        console.log('extension metadata built');

        resolve();
    });
}

function createStringStream(str) {
    var stream = new Readable;

    stream.push(str);
    stream.push(null);

    return stream;
}

function zipBuild() {
    if (buildMode === 'release') {
        console.log('Zipping for release');

        zipFolder(DESTINATION_DIRECTORY, RELEASE_DIRECTORY + '/GTEfirefox' + projectJSON.version + '.zip', function() {
            console.log('Zipped and ready to go.');
        });
    }
}

build();