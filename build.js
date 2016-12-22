'use strict';
var browserify = require('browserify');
var CleanCSS = require('clean-css');
var fs = require('fs');
var mkdirp = require('mkdirp');
var ncp = require('ncp').ncp;
var pug = require('pug');
var rimraf = require('rimraf');
var stylus = require('stylus');


var SOURCE_DIRECTORY = __dirname + '/src/chrome';
var BIN_DIRECTORY = __dirname + '/bin';
var DESTINATION_DIRECTORY = __dirname + '/build';
var OPTIONS_DIRECTORY = __dirname + '/build/options';
var BROWSERIFY_SETTINGS = {
    paths: [SOURCE_DIRECTORY]
};


function build() {
    rimraf.sync(BIN_DIRECTORY);
    mkdirp(BIN_DIRECTORY);
    rimraf.sync(DESTINATION_DIRECTORY);
    mkdirp(DESTINATION_DIRECTORY);
    rimraf.sync(OPTIONS_DIRECTORY);
    mkdirp(OPTIONS_DIRECTORY);

    ncp(SOURCE_DIRECTORY, BIN_DIRECTORY, function(err) {
        if (err) {
            return console.error(err);
        }

        buildContentScript();
        buildBackgroundScript();
        buildOptions();
        buildMetaFile();
    });
}

function buildContentScript() {
    var bundler = browserify(BROWSERIFY_SETTINGS);

    /*
    bundler.transform({
        global: true
    }, 'uglifyify');
    */

    bundler.add(BIN_DIRECTORY + '/contentscript/contentscript.js');

    bundler.bundle().pipe(fs.createWriteStream(DESTINATION_DIRECTORY + '/contentscript.js'));
}

function buildBackgroundScript() {
    var bundler = browserify(BROWSERIFY_SETTINGS);

    /*
    bundler.transform({
        global: true
    }, 'uglifyify');
    */

    bundler.add(BIN_DIRECTORY + '/background/background.js');

    bundler.bundle().pipe(fs.createWriteStream(DESTINATION_DIRECTORY + '/background.js'));
}

function buildOptions() {
    var optionsHTML = pug.compileFile(BIN_DIRECTORY + '/options/options.pug');
    ncp(BIN_DIRECTORY + '/options/images', OPTIONS_DIRECTORY + '/images');

    fs.writeFileSync(OPTIONS_DIRECTORY + '/index.html', optionsHTML());

    buildOptionsJS();
    buildOptionsCSS();
}

function buildOptionsJS() {
    var bundler = browserify(BROWSERIFY_SETTINGS);

    mkdirp(OPTIONS_DIRECTORY + '/js');

    /*
     bundler.transform({
     global: true
     }, 'uglifyify');
     */

    bundler.add(BIN_DIRECTORY + '/options/js/options.js');

    bundler.bundle().pipe(fs.createWriteStream(DESTINATION_DIRECTORY + '/options/js/options.js'));
}

function buildOptionsCSS() {
    var stylusCSS = fs.readFileSync(BIN_DIRECTORY + '/options/css/style.styl', 'utf8');

    mkdirp(OPTIONS_DIRECTORY + '/css');

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
        }
    });
}

function buildMetaFile() {
    fs.createReadStream(SOURCE_DIRECTORY + '/manifest.json').pipe(fs.createWriteStream(DESTINATION_DIRECTORY + '/manifest.json'));
}

build();