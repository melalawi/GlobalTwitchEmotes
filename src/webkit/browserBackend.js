'use strict';
var messageListener = null;
var messageCallback = null;
var FORBIDDEN_DOMAINS = [
    'chrome.google.com'
];


function injectScriptToTab(script, tab) {
    return new Promise(function(resolve, reject) {
        chrome.tabs.executeScript(tab.id, {
            file: script,
            runAt: 'document_idle',
            allFrames: false
        }, function() {
            if (!chrome.runtime.lastError) {
                resolve(tab);
            }
        });
    });
}

function listenForTabs(callback) {
    chrome.tabs.onUpdated.addListener(function(tabID, changeInfo, tab) {
        if (changeInfo.status === 'complete') {
            callback(tab);
        }
    });
}

function sendMessageToTab(message, tab) {
    return new Promise(function(resolve, reject) {
        chrome.tabs.sendMessage(tab.id, message, function() {
            if (!chrome.runtime.lastError) {
                resolve(tab);
            }
        });
    });
}


function listenForMessages(callback) {
    if (messageListener != null) {
        chrome.extension.onMessage.removeListener(messageListener);
    }

    messageCallback = callback;
    messageListener = chrome.runtime.onMessage.addListener(messageCallback);
}

function sendMessageToBackground(message) {
    return new Promise(function(resolve, reject) {
        chrome.runtime.sendMessage(message, function(response) {
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