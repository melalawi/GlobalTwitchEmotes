'use strict';
var messageListener = null;
var messageCallback = null;
var FORBIDDEN_DOMAINS = [
    'addons.mozilla.org'
];


function injectScriptToTab(script, tab) {
    return new Promise(function(resolve, reject) {
        browser.tabs.executeScript(tab.id, {
            file: script,
            runAt: 'document_idle',
            allFrames: false
        }, function() {
            resolve(tab);
        });
    });
}

function listenForTabs(callback) {
    browser.tabs.onUpdated.addListener(function(tabID, changeInfo, tab) {
        if (changeInfo.status === 'complete') {
            callback(tab);
        }
    });
}

function sendMessageToTab(message, tab) {
    return new Promise(function(resolve, reject) {
        browser.tabs.sendMessage(tab.id, message, function() {
            resolve(tab);
        });
    });
}


function listenForMessages(callback) {
    if (messageListener != null) {
        browser.runtime.onMessage.removeListener(messageListener);
    }

    messageCallback = callback;
    messageListener = browser.runtime.onMessage.addListener(messageCallback);
}

function sendMessageToBackground(message) {
    return new Promise(function(resolve, reject) {
        browser.runtime.sendMessage(message, function(response) {
            resolve(response);
        });
    });
}


module.exports = {
    injectScriptToTab: injectScriptToTab,
    listenForTabs: listenForTabs,
    sendMessageToTab: sendMessageToTab,
    listenForMessages: listenForMessages,
    sendMessageToBackground: sendMessageToBackground,
    forbiddenDomains: FORBIDDEN_DOMAINS
};