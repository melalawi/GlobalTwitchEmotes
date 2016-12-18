'use strict';
var extensionSettings = require('../extensionSettings');
var emoteParser = require('./emoteParser');


var backgroundMessage;
var backgroundListener = chrome.runtime.onMessage.addListener(function(message) {
    backgroundMessage = message;
    var settingsPromise = extensionSettings.getSettings();

    settingsPromise.then(function(settings) {
        emoteParser.run(backgroundMessage, settings);

    });

    chrome.extension.onMessage.removeListener(backgroundListener);
});