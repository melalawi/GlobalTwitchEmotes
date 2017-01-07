'use strict';
var browserBackend = require('browserBackend');
var emoteLibrary = require('./emoteLibrary');
var extensionSettings = require('extensionSettings');
var domainFilter = require('domainFilter');


var BADGE_BACKGROUND_COLOR = '#7050a0';
var CONTENTSCRIPT = '/contentscript.js';
var pendingCallbacks = [];
var userSettings;
var ready = false;


function init() {
    var settingsPromise = extensionSettings.getSettings();

    browserBackend.listenForTabs(instantiateGTEToFrame);
    browserBackend.listenForMessages(respondToMessage);

    settingsPromise.then(function(settings) {
        var libraryPromise = emoteLibrary.update(settings);

        userSettings = settings;

        libraryPromise.then(function() {
            ready = true;

            extensionSettings.onSettingsChange(respondToSettingsChanges);

            flushPendingTabs();
        }, function(error) {
            console.error('Error', error);
        });
    });
}

function respondToSettingsChanges(changes) {
    extensionSettings.getSettings().then(function(settings) {
        userSettings = settings;

        emoteLibrary.update(settings);
    });
}

function instantiateGTEToFrame(tab) {
    if (domainFilter.isFiltered(tab.url, userSettings) === false) {
        browserBackend.injectScriptToTab(CONTENTSCRIPT, tab);
    }
}

function flushPendingTabs() {
    for (var i = 0; i < pendingCallbacks.length; ++i) {
        pendingCallbacks[i](emoteLibrary.getEmotes());
    }

    pendingCallbacks = [];
}

function respondToMessage(message, sender, responseCallback) {
    if (message.message === 'emotes') {
        if (ready === true) {
            responseCallback(emoteLibrary.getEmotes());
        } else {
            pendingCallbacks.push(responseCallback);
        }
    } else if (message.message = 'setBadgeText') {
        browserBackend.setBadgeText(sender.tab, message.value, BADGE_BACKGROUND_COLOR);
    }
}


init();