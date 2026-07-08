var browser = require('browser');
var domainFilter = require('domainFilter');
var emoteManager = require('./emoteManager');
var MessageClient = require('messageClient');
var searchWorkerManager = require('./searchWorkerManager');
var storageHelper = require('storageHelper');


const BADGE_BACKGROUND_COLOR = '#7050a0';
// Generous delay ensures that cross-origin, dynamically loaded iframes are fully loaded before we try to inject GTE into them
const ALL_FRAMES_INJECTION_DELAY = 1000 * 5;
const CONTENT_SCRIPT_FILE = 'contentscript.js';
const CONTENT_SCRIPT_ID = 'gte-contentscript';


var settings;
var client = new MessageClient();
var readyPromise = null;

client.listen(onMessage);
chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === 'emoteRefresh') {
        emoteManager.loadAllEmotes();
    }
});
initialize();


chrome.runtime.onInstalled.addListener(function() {
    chrome.scripting.registerContentScripts([{
        id: CONTENT_SCRIPT_ID,
        js: [CONTENT_SCRIPT_FILE],
        matches: ['http://*/*', 'https://*/*'],
        runAt: 'document_start',
        allFrames: false,
        persistAcrossSessions: true
    }]).catch(function(error) {
        console.log('Content script registration:', error.message);
    });
});

function initialize() {
    searchWorkerManager.initialize();
    readyPromise = initializeComponents();
    return readyPromise;
}

function initializeComponents() {
    return storageHelper.getAllSettings().then(function(loadedSettings) {
        settings = loadedSettings;

        // todo: remove browser.listenForTabs(injectGTEContentScript);

        searchWorkerManager.setSettings(loadedSettings);
        domainFilter.initialize(loadedSettings.domainFilterMode, loadedSettings.domainFilterList);
        return emoteManager.initialize(loadedSettings).then(emotesReady);
    });
}

function emotesReady() {
    searchWorkerManager.setEmotes(emoteManager.getAllEmotes());
    // flushPendingTabs();
}

// todo: remove
// function flushPendingTabs() {
//     for (var i = 0; i < pendingTabs.length; ++i) {
//         browser.injectScriptToTab(CONTENT_SCRIPT_FILE, pendingTabs[i], false).then(function() {
//             sendSettings(this);
//         }.bind(pendingTabs[i]));
//     }

//     pendingTabs = [];
// }

// todo: remove
// function injectGTEContentScript(tab) {
//     if (domainFilter.isAddressAllowed(tab.url) === true) {
//         if (emoteManager.isReady() === true) {
//             browser.injectScriptToTab(CONTENT_SCRIPT_FILE, tab, false).then(function() {
//                 sendSettings(tab);
//             });
//         } else {
//             pendingTabs.push(tab);
//         }
//     }
// }

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

    if (!readyPromise) {
        readyPromise = initialize();
    }

    readyPromise.then(function() {
        handleMessage(message, responseCallback, tab);
    });
}

function handleMessage(message, responseCallback, tab) {
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
            // TODO: check
            setTimeout(injectGTEContentScriptIntoAllFrames, ALL_FRAMES_INJECTION_DELAY, tab);
        }

        responseCallback();

    } else if (message.header === 'getAllSettings') {
        responseCallback({
            header: 'settings',
            payload: settings
        });
    } else if (message.header === 'setAllSettings') {
        responseCallback();

        storageHelper.setAllSettings(message.payload).then(initializeComponents);
    } else if (message.header === 'setSettingsEntry') {
        responseCallback();

        storageHelper.setSettingsEntry(message.payload.key, message.payload.value).then(initializeComponents);
    } else if (message.header === 'checkDomainAllowed') {
        responseCallback();
        if (domainFilter.isAddressAllowed(message.payload) === true) {
            sendSettings(tab);
        }
    }
}
