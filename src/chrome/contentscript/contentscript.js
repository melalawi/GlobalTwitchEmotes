'use strict';
var browserBackend = require('browserBackend');
var extensionSettings = require('extensionSettings');
var emoteParser = require('./emoteParser');


var backgroundMessage;


function init() {
    browserBackend.listenForMessages(function(message) {
        var settingsPromise = extensionSettings.getSettings();

        backgroundMessage = message;

        settingsPromise.then(function(settings) {
            emoteParser.run(backgroundMessage, settings);
        });
    });
}

init();