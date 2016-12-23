'use strict';
var browserBackend = require('./browserBackend');
var emoteLibrary = require('./emoteLibrary');
var extensionSettings = require('../extensionSettings');
var domainFilter = require('./domainFilter');


var CONTENTSCRIPT = 'contentscript.js';
var pendingTabs = [];
var userSettings;
var ready = false;


function init() {
    var settingsPromise = extensionSettings.getSettings();

    browserBackend.listenForTabs(newTabEvent);

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

function newTabEvent(tab) {
    if (ready) {
        instantiateGTEToTab(tab);
    } else {
        pendingTabs.push(tab);
    }
}

function instantiateGTEToTab(tab) {
    if (domainFilter.isFiltered(tab.url, userSettings) === false) {
        browserBackend.injectScriptToTab(tab, CONTENTSCRIPT).then(function() {
            browserBackend.sendMessageToTab(tab, emoteLibrary.getEmotes());
        });
    }
}

function flushPendingTabs() {
    for (var i = 0; i < pendingTabs.length; ++i) {
        instantiateGTEToTab(pendingTabs[i]);
    }

    pendingTabs = [];
}


init();