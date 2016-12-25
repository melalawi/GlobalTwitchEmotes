'use strict';
var browserBackend = require('browserBackend');
var extensionSettings = require('extensionSettings');
var emoteParser = require('./emoteParser');
var tipsy = require('./tipsy.js');


var backgroundMessage;


function init() {
    browserBackend.listenForMessages(function(message) {
        var settingsPromise = extensionSettings.getSettings();

        backgroundMessage = message;

        settingsPromise.then(function(settings) {
            if (settings.twitchStyleTooltips === true) {
                tipsy.init();
            }
            emoteParser.run(backgroundMessage, settings);
        });
    });
}

init();