'use strict';
var emoteLibrary = require('./emoteLibrary');
var extensionSettings = require('../extensionSettings');
var domainFilter = require('./domainFilter');


var CONTENTSCRIPT = {
    file: 'contentscript.js'
};
var pendingTabs = [];
var userSettings;
var ready = false;


function init() {
    listenForTabs();
    var settingsPromise = extensionSettings.getSettings();

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

function listenForTabs() {
    chrome.tabs.onUpdated.addListener(function(tabID, changeInfo, tab) {
        if (changeInfo.status === 'complete') {
            if (ready) {
                injectScriptToTab(tab);
            } else {
                pendingTabs.push(tab);
            }
        }
    });
}

function flushPendingTabs() {
    for (var i = 0; i < pendingTabs.length; ++i) {
        injectScriptToTab(pendingTabs[i]);
    }

    pendingTabs = [];
}

function injectScriptToTab(tab) {
    if (domainFilter.isFiltered(tab.url, userSettings) === false) {
        chrome.tabs.executeScript(tab.id, CONTENTSCRIPT, function () {
            chrome.tabs.sendMessage(tab.id, emoteLibrary.getEmotes());
        });
    }
}

init();