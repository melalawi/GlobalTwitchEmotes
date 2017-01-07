'use strict';
var browserBackend = require('browserBackend');
var extensionSettings = require('extensionSettings');
var emoteParser = require('./emoteParser');
var pageObserver = require('./pageObserver');
var tipsy = require('./tipsy.js');


function init() {
    var promises = [];
    var settingsPromise = extensionSettings.getSettings();

    promises.push(settingsPromise);
    promises.push(browserBackend.sendMessageToBackground({
        message: 'emotes'
    }));

    settingsPromise.then(function(settings) {
        if (settings.twitchStyleTooltips === true) {
            tipsy.init();
        }
    });

    Promise.all(promises).then(function(data) {
        var emotes = data[1];
        var settings = data[0];

        // Display 0 emotes parsed to begin with
        updateDisplayedEmoteCount();

        emoteParser.onNewEmoteParsed(updateDisplayedEmoteCount);
        emoteParser.run(emotes, settings);
    });
}

function updateDisplayedEmoteCount() {
    browserBackend.sendMessageToBackground({
        message: 'setBadgeText',
        value: emoteParser.getEmoteCount()
    });
}

init();