'use strict';
var browserBackend = require('browserBackend');
var extensionSettings = require('extensionSettings');
var emoteParser = require('./emoteParser');
var pageObserver = require('./pageObserver');
var tipsy = require('./tipsy.js');


function init() {
    var promises = [];
    var settingsPromise = extensionSettings.getSettings();

    promises.push(browserBackend.sendMessageToBackground('emotes'));
    promises.push(settingsPromise);

    settingsPromise.then(function(settings) {
        if (settings.twitchStyleTooltips === true) {
            tipsy.init();
        }
    });

    Promise.all(promises).then(function(data) {
        var emotes = data[0];
        var settings = data[1];

        emoteParser.run(emotes, settings);
    });
}

init();