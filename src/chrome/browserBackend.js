'use strict';
var messageListener = null;
var messageCallback = null;
var installedListener = null;
var installedCallback = null;


function injectScriptToTab(tab, script) {
    return new Promise(function(resolve, reject) {
        chrome.tabs.executeScript(tab.id, {file: script}, function() {
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

function sendMessageToTab(tab, message) {
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
    messageListener = chrome.runtime.onMessage.addListener(function(message) {
        messageCallback(message);
    });
}

function onExtensionInstall(callback) {
    if (installedListener != null) {
        chrome.runtime.onInstalled.removeListener(installedListener);
    }

    installedCallback = callback;
    installedListener = chrome.runtime.onInstalled.addListener(function(object) {
        installedCallback();
    });
}


function openExtensionSettings() {
    chrome.runtime.openOptionsPage(function(object) {
        console.log('asdf');
    });
}

module.exports = {
    injectScriptToTab: injectScriptToTab,
    listenForTabs: listenForTabs,
    sendMessageToTab: sendMessageToTab,
    listenForMessages: listenForMessages,
    onExtensionInstall: onExtensionInstall,
    openExtensionSettings: openExtensionSettings
};