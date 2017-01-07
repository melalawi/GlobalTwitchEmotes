'use strict';
var exec = require('child_process').exec;
var fs = require('fs-extra');
var Mocha = require('mocha');
var path = require('path');


var mocha = new Mocha();
var testDir = 'test/';


function buildAndRunTests() {
    console.log('Building extension then running tests...');

    exec('node build test webkit', function callback(error, stdout, stderr){
        if (error) {
            console.log('Build error:');
            console.log(error);
        } else {
            console.log('Build complete.');
            runTests();
        }
    });
}

function runTests() {
    var testFiles = fs.walkSync(testDir).filter(function(file) {
        return path.extname(file) === '.js';
    });

    testFiles.forEach(function(file) {
        mocha.addFile(path.join(process.cwd(), file));
    });

    process.chdir(path.join(process.cwd(), 'bin/webkit'));

    mocha.run(function(failures) {
        process.on('exit', function () {
            process.exit(failures);
        });
    });
}

buildAndRunTests();