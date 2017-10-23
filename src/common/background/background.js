var browser = require('browser');
var domainFilter = require('domainFilter');
var emoteManager = require('./emoteManager');
var searchWorkerManager = require('./searchWorkerManager');
var storageHelper = require('storageHelper');


const SEARCH_WORKER_COUNT = 4;
const BADGE_BACKGROUND_COLOR = '#7050a0';
// Generous delay ensures that cross-origin, dynamically loaded iframes are fully loaded before we try to inject GTE into them
const ALL_FRAMES_INJECTION_DELAY = 1000 * 5;
const CONTENT_SCRIPT_FILE = '/contentscript.js';


var pendingTabs = [];
var settings;
var client = new browser.MessageClient(false);


function initialize() {
    client = new browser.MessageClient(false);

    searchWorkerManager.initialize(SEARCH_WORKER_COUNT);

    storageHelper.getSettings().then(initializeComponents);
}

function initializeComponents(loadedSettings) {
    settings = loadedSettings;

    browser.listenForTabs(injectGTEContentScript);

    searchWorkerManager.setSettings(loadedSettings);
    domainFilter.initialize(loadedSettings.domainFilterMode, loadedSettings.domainFilterList);
    emoteManager.initialize(loadedSettings).then(emotesReady);
}

function emotesReady() {
    searchWorkerManager.setEmotes(emoteManager.getAllEmotes());

    client.listen(onMessage);

    flushPendingTabs();
}

function flushPendingTabs() {
    for (var i = 0; i < pendingTabs.length; ++i) {
        browser.injectScriptToTab(CONTENT_SCRIPT_FILE, pendingTabs[i], false).then(function() {
            sendSettings(this);
        }.bind(pendingTabs[i]));
    }

    pendingTabs = [];
}

function injectGTEContentScript(tab) {
    if (domainFilter.isAddressAllowed(tab.url) === true) {
        if (emoteManager.isReady() === true) {
            browser.injectScriptToTab(CONTENT_SCRIPT_FILE, tab, false).then(function() {
                sendSettings(tab);
            });
        } else {
            pendingTabs.push(tab);
        }
    }
}

function injectGTEContentScriptIntoAllFrames(tab) {
    browser.injectScriptToTab(CONTENT_SCRIPT_FILE, tab, true).then(function() {
        sendSettings(tab);
    });
}

function sendSettings(tab) {
    client.messageTab(tab, {
        header: 'settings',
        payload: settings
    });
}

function onMessage(message, responseCallback, tab) {
    if (!responseCallback) {
        return;
    }

    if (message.header === 'getEmoteSets') {
        emoteManager.onAllEmotesReady(function() {
            responseCallback({
                header: 'emoteSets',
                payload: emoteManager.getEmoteSets()
            });
        });
    } else if (message.header === 'getAllEmotes') {
        emoteManager.onAllEmotesReady(function() {
            responseCallback({
                header: 'allEmotes',
                payload: emoteManager.getAllEmotes()
            });
        });
    } else if (message.header === 'setBadgeText') {
        browser.setBadgeText(tab, message.payload.toString(), BADGE_BACKGROUND_COLOR);
    } else if (message.header === 'searchTextForEmotes') {
        searchWorkerManager.search(message.payload.id, message.payload.hostname, message.payload.text, responseCallback);
    } else if (message.header === 'iframeFound') {
        if (settings.iframeInjection === true) {
            setTimeout(injectGTEContentScriptIntoAllFrames, ALL_FRAMES_INJECTION_DELAY, tab);
        }

        responseCallback();
    } else if (message.header === 'triggerSettingsChange') {
        storageHelper.getSettings().then(initializeComponents);

        responseCallback();
    }
}


initialize();