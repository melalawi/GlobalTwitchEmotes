'use strict';
var Mocha = require('mocha');
var fs = require('fs-extra');
var path = require('path');


var mocha = new Mocha();
var testDir = 'test/';


function runTests() {
    var testFiles = fs.walkSync(testDir).filter(function(file) {
        return path.extname(file) === '.js';
    });

    testFiles.forEach(function(file) {
        mocha.addFile(file);
    });

    mocha.run(function(failures) {
        process.on('exit', function () {
            process.exit(failures);
        });
    });
}

runTests();